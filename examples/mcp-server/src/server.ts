// Demo seller: a tiny Hono API with one paid route, gated by MPP on Tempo Moderato,
// with the Trajan call log + console attached via mppx's payment hooks.

import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { Mppx, tempo } from 'mppx/hono'
import { privateKeyToAccount } from 'viem/accounts'
import {
  createCallLog, attachCallLog, createWallet, trajanConsole,
  MODERATO_RPC, MODERATO_TOKENS, MODERATO_EXPLORER_TX, MODERATO_EXPLORER_ADDRESS,
} from '@trajan/server'

const RECIPIENT = process.env.TEMPO_RECIPIENT as `0x${string}`
const SECRET = process.env.MPP_SECRET_KEY
if (!RECIPIENT || !SECRET) {
  console.error('Set TEMPO_RECIPIENT and MPP_SECRET_KEY (see .env.example)')
  process.exit(1)
}

// Optional: sponsor buyers' fees. The fee payer must hold the fee token (pathUSD on Moderato).
const FEE_PAYER_KEY = process.env.TRAJAN_FEE_PAYER_KEY as `0x${string}` | undefined
const feePayer = FEE_PAYER_KEY ? privateKeyToAccount(FEE_PAYER_KEY) : undefined
if (feePayer) console.log(`fee sponsorship on: ${feePayer.address} pays buyers' fees`)

const mppx = Mppx.create({
  methods: [tempo.charge({ currencies: [MODERATO_TOKENS.pathUSD], recipient: RECIPIENT, testnet: true, feePayer })],
  secretKey: SECRET,
})

// One row per paid call, written from the hook — handlers are never wrapped.
const log = createCallLog(process.env.TRAJAN_DB ?? '.trajan/calls.db')
attachCallLog(mppx, log, {
  rpcUrl: MODERATO_RPC,
  onCall: (r) => console.log(`paid ${r.route} ${r.amount} ${r.tx_hash}`),
})

const wallet = createWallet({
  recipient: RECIPIENT,
  token: MODERATO_TOKENS.pathUSD,
  testnet: true,
  withdrawKey: process.env.TRAJAN_WITHDRAW_KEY as `0x${string}` | undefined,
})

const app = new Hono()

app.get('/', (c) => c.json({ ok: true, service: 'trajan demo seller', paid: '/tools/echo', console: '/trajan' }))

app.get(
  '/tools/echo',
  mppx.charge({ amount: '0.01' }),
  (c) => c.json({ echo: c.req.query('q') ?? 'hello', paidAt: new Date().toISOString() }),
)

app.route('/trajan', trajanConsole(log, {
  name: 'Trajan demo seller',
  network: 'moderato',
  wallet,
  price: '0.01',
  snippet: "app.get('/tools/echo', paid(), handler)\nmountTrajan(app)",
  explorerTxBase: MODERATO_EXPLORER_TX,
  explorerAddressBase: MODERATO_EXPLORER_ADDRESS,
}))

const port = Number(process.env.PORT ?? 8787)
serve({ fetch: app.fetch, port }, () => console.log(`demo seller on http://localhost:${port}  console: http://localhost:${port}/trajan`))
