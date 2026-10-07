// Demo seller: a tiny Hono API with one paid route, gated by MPP on Tempo Moderato,
// with the Trajan call log attached via mppx's payment hooks.

import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { Mppx, tempo } from 'mppx/hono'
import { createCallLog, attachCallLog, consoleApi, MODERATO_RPC, MODERATO_TOKENS } from '@trajan/server'

const RECIPIENT = process.env.TEMPO_RECIPIENT as `0x${string}`
const SECRET = process.env.MPP_SECRET_KEY
if (!RECIPIENT || !SECRET) {
  console.error('Set TEMPO_RECIPIENT and MPP_SECRET_KEY (see .env.example)')
  process.exit(1)
}

const mppx = Mppx.create({
  methods: [
    tempo.charge({
      currencies: [MODERATO_TOKENS.pathUSD],
      recipient: RECIPIENT,
      testnet: true,
    }),
  ],
  secretKey: SECRET,
})

// One row per paid call, written from the hook — handlers are never wrapped.
const log = createCallLog(process.env.TRAJAN_DB ?? '.trajan/calls.db')
attachCallLog(mppx, log, {
  rpcUrl: MODERATO_RPC,
  onCall: (r) => console.log(`paid ${r.route} ${r.amount} ${r.tx_hash}`),
})

const app = new Hono()

app.get('/', (c) => c.json({ ok: true, service: 'trajan demo seller', paid: '/tools/echo', console: '/trajan/api/stats' }))

app.get(
  '/tools/echo',
  mppx.charge({ amount: '0.01' }),
  (c) => c.json({ echo: c.req.query('q') ?? 'hello', paidAt: new Date().toISOString() }),
)

app.route('/trajan/api', consoleApi(log))

const port = Number(process.env.PORT ?? 8787)
serve({ fetch: app.fetch, port }, () => console.log(`demo seller on http://localhost:${port}`))
