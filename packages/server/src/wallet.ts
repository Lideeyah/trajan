// Seller wallet helpers: read the recipient's stablecoin balance, and (optionally) withdraw.
// Withdraw needs the recipient's private key on the server. It's opt-in via TRAJAN_WITHDRAW_KEY;
// without it the console shows the balance and a "withdraw from your own wallet" note.

import { createClient, Account } from 'viem/tempo'

export type WalletOptions = {
  recipient: `0x${string}`
  token: `0x${string}`
  testnet: boolean
  /** Private key of `recipient`. Optional; enables POST /api/withdraw. */
  withdrawKey?: `0x${string}` | undefined
  /** Token decimals; Tempo stablecoins use 6. Read from chain when omitted. */
  decimals?: number
}

/** "0.5" at 6 decimals -> 500000n. Rejects more precision than the token has. */
export function parseAmount(formatted: string, decimals: number): bigint {
  const m = /^(\d+)(?:\.(\d+))?$/.exec(formatted.trim())
  if (!m) throw new Error('amount: enter a positive number')
  const [, whole, frac = ''] = m
  if (frac.length > decimals) throw new Error(`amount: at most ${decimals} decimals`)
  const v = BigInt(whole) * 10n ** BigInt(decimals) + BigInt(frac.padEnd(decimals, '0') || '0')
  if (v <= 0n) throw new Error('amount: must be greater than zero')
  return v
}

export function createWallet(opts: WalletOptions) {
  const account = opts.withdrawKey ? Account.fromSecp256k1(opts.withdrawKey) : undefined
  if (account && account.address.toLowerCase() !== opts.recipient.toLowerCase()) {
    throw new Error(`TRAJAN_WITHDRAW_KEY does not belong to recipient ${opts.recipient}`)
  }
  const client = createClient({ account, testnet: opts.testnet })
  let decimals = opts.decimals

  async function balance() {
    const b = await client.token.getBalance({ account: opts.recipient, token: opts.token })
    decimals ??= b.decimals
    return { raw: b.amount.toString(), formatted: b.formatted, decimals: b.decimals }
  }

  return {
    canWithdraw: Boolean(account),
    address: opts.recipient,
    token: opts.token,
    balance,
    async withdraw(to: `0x${string}`, amount: string, memo?: string) {
      if (!account) throw new Error('withdraw disabled: TRAJAN_WITHDRAW_KEY not set')
      if (decimals === undefined) await balance()
      const value = parseAmount(amount, decimals ?? 6)
      const r = await client.token.transferSync({
        to,
        amount: value,
        token: opts.token,
        memo: memo ? (`0x${Buffer.from(memo, 'utf8').toString('hex')}` as `0x${string}`) : undefined,
      })
      return { txHash: r.receipt.transactionHash, formatted: r.formatted ?? amount, blockNumber: Number(r.receipt.blockNumber) }
    },
  }
}

export type Wallet = ReturnType<typeof createWallet>
