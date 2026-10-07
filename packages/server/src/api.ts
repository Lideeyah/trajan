// Read-only JSON API the console consumes. Mount under /trajan on the seller's app.

import { Hono } from 'hono'
import type { CallLog } from './log.js'

export type ApiOptions = {
  /** Token decimals for display (pathUSD/OUSD on Tempo are 6). */
  decimals?: number
  explorerTxBase?: string
}

export const MODERATO_EXPLORER_TX = 'https://explore.testnet.tempo.xyz/tx/'
export const MAINNET_EXPLORER_TX = 'https://explore.tempo.xyz/tx/'

export function consoleApi(log: CallLog, opts: ApiOptions = {}) {
  const decimals = opts.decimals ?? 6
  const explorer = opts.explorerTxBase ?? MODERATO_EXPLORER_TX
  const fmt = (raw: number | string) => (Number(raw) / 10 ** decimals).toFixed(decimals).replace(/\.?0+$/, '')

  const api = new Hono()

  api.get('/stats', (c) => {
    const s = log.stats()
    return c.json({
      calls: s.calls,
      callsToday: s.calls_today,
      revenue: fmt(s.revenue),
      revenueToday: fmt(s.revenue_today),
      payers: s.payers,
      topPayers: log.topPayers(5).map((p) => ({ ...p, revenue: fmt(p.revenue) })),
    })
  })

  api.get('/calls', (c) => {
    const limit = Math.min(Number(c.req.query('limit') ?? 50), 200)
    const offset = Number(c.req.query('offset') ?? 0)
    return c.json(log.list(limit, offset).map((r) => ({ ...r, amountFormatted: fmt(r.amount), explorerUrl: explorer + r.tx_hash })))
  })

  api.get('/calls/:hash', (c) => {
    const r = log.get(c.req.param('hash'))
    if (!r) return c.json({ error: 'not found' }, 404)
    return c.json({ ...r, amountFormatted: fmt(r.amount), explorerUrl: explorer + r.tx_hash })
  })

  return api
}
