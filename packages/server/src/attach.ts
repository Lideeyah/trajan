// Attach the call log to an mppx server instance via its payment hooks.
// Never wraps handlers: one onPaymentSuccess subscription writes one row.
// The payer address isn't in the receipt, so we resolve it from the tx in the
// background after the response has gone out.

import type { CallLog } from './log.js'

type MppxLike = {
  onPaymentSuccess(handler: (ctx: any) => void | Promise<void>): () => void
}

export type AttachOptions = {
  /** JSON-RPC endpoint used to resolve payer + block for each tx. */
  rpcUrl: string
  /** Called after each row is written (useful for logging in dev). */
  onCall?: (row: { tx_hash: string; route: string; amount: string }) => void
}

export const MODERATO_RPC = 'https://rpc.moderato.tempo.xyz'
export const MAINNET_RPC = 'https://rpc.tempo.xyz'

export function attachCallLog(mppx: MppxLike, log: CallLog, opts: AttachOptions) {
  return mppx.onPaymentSuccess((ctx) => {
    try {
      if (process.env.TRAJAN_DEBUG) {
        const { input: _i, ...rest } = ctx
        console.error('[trajan] payment.success ctx:', JSON.stringify(rest, (_k, v) => (typeof v === 'bigint' ? v.toString() : v), 2).slice(0, 3000))
      }
      const req = ctx.request ?? {}
      const input: Request | undefined = ctx.input instanceof Request ? ctx.input : undefined
      const url = input ? new URL(input.url) : undefined
      const txHash: string = ctx.receipt.reference
      // Payer is in the credential source (did:pkh:eip155:<chainId>:<address>); block comes from RPC later.
      const did: string | undefined = ctx.credential?.source
      const payer = did && /^did:pkh:eip155:\d+:(0x[0-9a-fA-F]{40})$/.test(did) ? did.split(':').pop()!.toLowerCase() : null
      const row = {
        challenge_id: String(ctx.challenge?.id ?? txHash),
        tx_hash: txHash,
        payer,
        amount: String(req.amount ?? ''),
        currency: String(req.currency ?? ctx.receipt.fundingCurrency ?? ''),
        recipient: String(req.recipient ?? ''),
        // HTTP: the path. MCP (no HTTP input): the tool name, carried in the charge description.
        route: url ? url.pathname + url.search : String(ctx.challenge?.description ?? req.description ?? ''),
        http_method: input?.method ?? (url ? 'GET' : 'MCP'),
        memo: null,
        block_number: null,
        fee_payer: null,
        created_at: ctx.receipt.timestamp ?? new Date().toISOString(),
      }
      log.insert(row)
      opts.onCall?.(row)
      // Enrich out of band; errors here must never affect the payment path.
      void resolveTx(opts.rpcUrl, txHash)
        .then((tx) => { if (tx) log.enrich(txHash, payer ?? tx.from, tx.blockNumber, tx.feePayer) })
        .catch(() => {})
    } catch {
      // Hook errors are swallowed by mppx anyway; be explicit that we don't care.
    }
  })
}

// The receipt carries Tempo's `feePayer` (who paid the fee); the tx object does not.
async function resolveTx(rpcUrl: string, hash: string, attempts = 5): Promise<{ from: string; blockNumber: number | null; feePayer: string | null } | null> {
  for (let i = 0; i < attempts; i++) {
    const res = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_getTransactionReceipt', params: [hash] }),
    })
    const json = (await res.json()) as { result?: { from?: string; blockNumber?: string | null; feePayer?: string | null } | null }
    const tx = json.result
    if (tx?.from) return { from: tx.from, blockNumber: tx.blockNumber ? Number(tx.blockNumber) : null, feePayer: tx.feePayer ?? null }
    await new Promise((r) => setTimeout(r, 1000 * (i + 1)))
  }
  return null
}
