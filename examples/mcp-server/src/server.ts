// Demo seller: a tiny Hono API with one paid route, gated by MPP on Tempo Moderato.
// Day-one goal: curl -> 402 (challenge) ; mppx client -> 200 (paid).

import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { Mppx, tempo } from 'mppx/hono'

const RECIPIENT = process.env.TEMPO_RECIPIENT as `0x${string}`
const SECRET = process.env.MPP_SECRET_KEY
if (!RECIPIENT || !SECRET) {
  console.error('Set TEMPO_RECIPIENT and MPP_SECRET_KEY (see .env.example)')
  process.exit(1)
}

// Moderato testnet stablecoins (from tempo.xyz faucet docs). pathUSD is the simplest default.
export const MODERATO_PATHUSD = '0x20c0000000000000000000000000000000000000' as const

const mppx = Mppx.create({
  methods: [
    tempo.charge({
      currencies: [MODERATO_PATHUSD],
      recipient: RECIPIENT,
      testnet: true,
    }),
  ],
  secretKey: SECRET,
})

const app = new Hono()

app.get('/', (c) => c.json({ ok: true, service: 'trajan demo seller', paid: '/tools/echo' }))

app.get(
  '/tools/echo',
  mppx.charge({ amount: '0.01' }),
  (c) => c.json({ echo: c.req.query('q') ?? 'hello', paidAt: new Date().toISOString() }),
)

const port = Number(process.env.PORT ?? 8787)
serve({ fetch: app.fetch, port }, () => console.log(`demo seller on http://localhost:${port}`))
