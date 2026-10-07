// The seller console: one Hono sub-app. `/` serves the embedded page, `/api/*` serves JSON.
// Mount it at /trajan on the seller's app.

import { Hono } from 'hono'
import { readFileSync } from 'node:fs'
import type { CallLog } from './log.js'
import type { Wallet } from './wallet.js'

export type ConsoleOptions = {
  /** Token decimals for display (pathUSD/OUSD on Tempo are 6). */
  decimals?: number
  explorerTxBase?: string
  explorerAddressBase?: string
  /** Optional wallet for balance + withdraw. */
  wallet?: Wallet
  /** Shown in the page header. */
  name?: string
  network?: 'moderato' | 'mainnet'
  /** Default price per call, shown in the Set up checklist. */
  price?: string
  /** The two lines the seller added, shown in the Set up checklist. */
  snippet?: string
}

export const MODERATO_EXPLORER_TX = 'https://explore.testnet.tempo.xyz/tx/'
export const MODERATO_EXPLORER_ADDRESS = 'https://explore.testnet.tempo.xyz/address/'
export const MAINNET_EXPLORER_TX = 'https://explore.tempo.xyz/tx/'
export const MAINNET_EXPLORER_ADDRESS = 'https://explore.tempo.xyz/address/'

const PAGE = readFileSync(new URL('./console.html', import.meta.url), 'utf8')

const CSV_COLS = ['created_at', 'route', 'http_method', 'amount', 'currency', 'payer', 'recipient', 'fee_payer', 'tx_hash', 'block_number', 'challenge_id', 'memo'] as const
function toCsv(rows: Record<string, unknown>[], fmtAmount: (raw: string | number) => string) {
  const esc = (v: unknown) => { const s = v == null ? '' : String(v); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s }
  const head = [...CSV_COLS, 'amount_formatted'].join(',')
  const body = rows.map((r) => [...CSV_COLS.map((k) => esc(r[k])), esc(fmtAmount(r.amount as string))].join(','))
  return [head, ...body].join('\n') + '\n'
}


export function trajanConsole(log: CallLog, opts: ConsoleOptions = {}) {
  const decimals = opts.decimals ?? 6
  const explorerTx = opts.explorerTxBase ?? MODERATO_EXPLORER_TX
  const explorerAddr = opts.explorerAddressBase ?? MODERATO_EXPLORER_ADDRESS
  const fmt = (raw: number | string) => (Number(raw) / 10 ** decimals).toFixed(decimals).replace(/\.?0+$/, '') || '0'
  const shape = (r: ReturnType<CallLog['list']>[number]) => ({ ...r, amountFormatted: fmt(r.amount), explorerUrl: explorerTx + r.tx_hash })

  const app = new Hono()

  app.get('/', (c) => c.html(PAGE))

  app.get('/api/meta', (c) => c.json({
    name: opts.name ?? 'Trajan',
    network: opts.network ?? 'moderato',
    recipient: opts.wallet?.address ?? null,
    token: opts.wallet?.token ?? null,
    canWithdraw: opts.wallet?.canWithdraw ?? false,
    price: opts.price ?? null,
    snippet: opts.snippet ?? null,
    explorerTx, explorerAddr, decimals,
  }))

  app.get('/api/stats', (c) => {
    const s = log.stats()
    return c.json({
      calls: s.calls, callsToday: s.calls_today,
      revenue: fmt(s.revenue), revenueToday: fmt(s.revenue_today),
      payers: s.payers,
      topPayers: log.topPayers(5).map((p) => ({ ...p, revenue: fmt(p.revenue) })),
    })
  })

  app.get('/api/calls', (c) => {
    const limit = Math.min(Number(c.req.query('limit') ?? 50), 200)
    const offset = Number(c.req.query('offset') ?? 0)
    return c.json(log.list(limit, offset).map(shape))
  })

  app.get('/api/calls.csv', (c) => {
    const rows: Record<string, unknown>[] = []
    for (let off = 0; ; off += 200) { const page = log.list(200, off); rows.push(...page); if (page.length < 200) break }
    return c.body(toCsv(rows, fmt), 200, { 'content-type': 'text/csv; charset=utf-8', 'content-disposition': `attachment; filename="trajan-calls-${new Date().toISOString().slice(0, 10)}.csv"` })
  })

  app.get('/api/calls/:hash', (c) => {
    const r = log.get(c.req.param('hash'))
    return r ? c.json(shape(r)) : c.json({ error: 'not found' }, 404)
  })

  app.get('/api/balance', async (c) => {
    if (!opts.wallet) return c.json({ error: 'no wallet configured' }, 404)
    try { return c.json(await opts.wallet.balance()) }
    catch (e) { return c.json({ error: (e as Error).message }, 502) }
  })

  app.post('/api/withdraw', async (c) => {
    if (!opts.wallet?.canWithdraw) return c.json({ error: 'withdraw disabled: set TRAJAN_WITHDRAW_KEY on the server' }, 403)
    const body = await c.req.json().catch(() => ({})) as { to?: string; amount?: string; memo?: string }
    if (!body.to || !/^0x[0-9a-fA-F]{40}$/.test(body.to)) return c.json({ error: 'to: enter a 0x address' }, 400)
    if (!body.amount || !/^\d+(\.\d{1,6})?$/.test(body.amount) || Number(body.amount) <= 0) return c.json({ error: 'amount: enter a positive number with up to 6 decimals' }, 400)
    try {
      const r = await opts.wallet.withdraw(body.to as `0x${string}`, body.amount, body.memo)
      return c.json({ ...r, explorerUrl: explorerTx + r.txHash })
    } catch (e) { return c.json({ error: (e as Error).message }, 502) }
  })

  return app
}

/** @deprecated use trajanConsole — kept so early generated files keep working. */
export const consoleApi = (log: CallLog, opts: ConsoleOptions = {}) => {
  const api = new Hono()
  api.route('/', trajanConsole(log, opts))
  return api
}
