// Trajan Cloud: one Hono app.
//   /auth/*            passkey sign-up / sign-in (Tempo Accounts WebAuthn handler)
//   /api/me            who am I (session -> seller)
//   /api/sellers       create my seller (once per passkey)
//   /api/console/*     my data: meta, stats, calls, balance
//   /ingest            sellers' servers post paid calls here with their API key
//   /                  landing + sign-in;  /console  the seller console

import { Hono } from 'hono'
import { Handler } from 'accounts/server'
import { createHash, randomBytes, randomUUID } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { createClient } from 'viem/tempo'
import { sql, kv, migrate, type Seller, type CallRow } from './db.js'

const ORIGIN = process.env.TRAJAN_ORIGIN ?? 'http://localhost:3000'
const RP_ID = new URL(ORIGIN).hostname
const MODERATO_TOKENS = { pathUSD: '0x20c0000000000000000000000000000000000000' } as const
const EXPLORER = {
  moderato: { tx: 'https://explore.testnet.tempo.xyz/tx/', addr: 'https://explore.testnet.tempo.xyz/address/' },
  mainnet: { tx: 'https://explore.tempo.xyz/tx/', addr: 'https://explore.tempo.xyz/address/' },
}

const pages = {
  index: readFileSync(new URL('../public/index.html', import.meta.url), 'utf8'),
  console: readFileSync(new URL('../public/console.html', import.meta.url), 'utf8'),
}
// The browser bundle is served by the function too, so it never depends on static-file routing.
let clientJs: string | null = null
const clientBundle = () => (clientJs ??= readFileSync(new URL('../public/client.js', import.meta.url), 'utf8'))

const auth = Handler.webAuthn({ kv, origin: ORIGIN, rpId: RP_ID, cookieName: 'trajan_session' })

const app = new Hono()
app.use('*', async (c, next) => { await migrate(); await next() })

app.route('/auth', auth)
app.get('/', (c) => c.html(pages.index))
app.get('/console', (c) => c.html(pages.console))
app.get('/client.js', (c) => c.body(clientBundle(), 200, { 'content-type': 'application/javascript; charset=utf-8', 'cache-control': 'public, max-age=300' }))
app.get('/favicon.svg', (c) => c.body(readFileSync(new URL('../public/favicon.svg', import.meta.url), 'utf8'), 200, { 'content-type': 'image/svg+xml', 'cache-control': 'public, max-age=86400' }))
app.get('/favicon.ico', (c) => c.redirect('/favicon.svg?v=2'))

// ---- session helpers ----
const sha = (s: string) => createHash('sha256').update(s).digest('hex')
const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'seller'

async function sellerFor(c: any): Promise<Seller | null> {
  const session = await auth.getSession(c.req.raw)
  if (!session) return null
  const r = await sql()`SELECT * FROM sellers WHERE credential_id = ${session.credentialId}`
  return (r[0] as Seller) ?? null
}
async function requireSeller(c: any): Promise<Seller | Response> {
  const session = await auth.getSession(c.req.raw)
  if (!session) return c.json({ error: 'sign in first' }, 401)
  const s = await sellerFor(c)
  return s ?? c.json({ error: 'no seller yet', needsSetup: true }, 404)
}

app.get('/api/me', async (c) => {
  const session = await auth.getSession(c.req.raw)
  if (!session) return c.json({ signedIn: false })
  const s = await sellerFor(c)
  return c.json({ signedIn: true, seller: s ? publicSeller(s) : null })
})

function publicSeller(s: Seller) {
  return { id: s.id, name: s.name, slug: s.slug, address: s.address, price: s.price, network: s.network, createdAt: s.created_at }
}

// Create the seller record for the signed-in passkey. Returns the API key exactly once.
app.post('/api/sellers', async (c) => {
  const session = await auth.getSession(c.req.raw)
  if (!session) return c.json({ error: 'sign in first' }, 401)
  const body = (await c.req.json().catch(() => ({}))) as { name?: string; address?: string; price?: string; network?: string }
  if (!body.name?.trim()) return c.json({ error: 'name: give your seller a name' }, 400)
  if (!body.address || !/^0x[0-9a-fA-F]{40}$/.test(body.address)) return c.json({ error: 'address: a Tempo address is required' }, 400)
  const price = body.price ?? '0.01'
  if (!/^\d+(\.\d{1,6})?$/.test(price) || Number(price) <= 0) return c.json({ error: 'price: positive number, up to 6 decimals' }, 400)
  const network = body.network === 'mainnet' ? 'mainnet' : 'moderato'
  const existing = await sql()`SELECT id FROM sellers WHERE credential_id = ${session.credentialId}`
  if (existing.length) return c.json({ error: 'this passkey already has a seller' }, 409)

  const apiKey = 'trj_' + randomBytes(24).toString('base64url')
  const id = randomUUID()
  let slug = slugify(body.name)
  const taken = await sql()`SELECT 1 FROM sellers WHERE slug = ${slug}`
  if (taken.length) slug = `${slug}-${id.slice(0, 6)}`
  await sql()`INSERT INTO sellers (id, credential_id, address, name, slug, price, network, api_key_hash)
    VALUES (${id}, ${session.credentialId}, ${body.address}, ${body.name.trim()}, ${slug}, ${price}, ${network}, ${sha(apiKey)})`
  return c.json({ seller: { id, name: body.name.trim(), slug, address: body.address, price, network }, apiKey }, 201)
})

// Rotate the API key (shown once).
app.post('/api/sellers/rotate-key', async (c) => {
  const s = await requireSeller(c); if (s instanceof Response) return s
  const apiKey = 'trj_' + randomBytes(24).toString('base64url')
  await sql()`UPDATE sellers SET api_key_hash = ${sha(apiKey)} WHERE id = ${s.id}`
  return c.json({ apiKey })
})

// ---- ingest: the seller's own server posts each paid call ----
app.post('/ingest', async (c) => {
  const key = (c.req.header('authorization') ?? '').replace(/^Bearer\s+/i, '')
  if (!key.startsWith('trj_')) return c.json({ error: 'missing API key' }, 401)
  const r = await sql()`SELECT * FROM sellers WHERE api_key_hash = ${sha(key)}`
  const s = r[0] as Seller | undefined
  if (!s) return c.json({ error: 'unknown API key' }, 401)
  const body = (await c.req.json().catch(() => null)) as Partial<CallRow> | null
  if (!body?.tx_hash || !body.challenge_id || !body.amount) return c.json({ error: 'tx_hash, challenge_id, amount required' }, 400)
  await sql()`INSERT INTO calls (seller_id, challenge_id, tx_hash, payer, amount, currency, recipient, route, http_method, memo, block_number, fee_payer, created_at)
    VALUES (${s.id}, ${body.challenge_id}, ${body.tx_hash}, ${body.payer ?? null}, ${String(body.amount)}, ${body.currency ?? ''}, ${body.recipient ?? s.address},
            ${body.route ?? ''}, ${body.http_method ?? 'GET'}, ${body.memo ?? null}, ${body.block_number ?? null}, ${body.fee_payer ?? null}, ${body.created_at ?? new Date().toISOString()})
    ON CONFLICT (seller_id, challenge_id) DO UPDATE SET
      payer = COALESCE(calls.payer, EXCLUDED.payer),
      block_number = COALESCE(calls.block_number, EXCLUDED.block_number),
      fee_payer = COALESCE(EXCLUDED.fee_payer, calls.fee_payer)`
  return c.json({ ok: true })
})

// ---- console API (session-scoped) ----
const DEC = 6
const fmt = (raw: number | string | bigint) => (Number(raw) / 10 ** DEC).toFixed(DEC).replace(/\.?0+$/, '') || '0'

app.get('/api/console/meta', async (c) => {
  const s = await requireSeller(c); if (s instanceof Response) return s
  const ex = EXPLORER[s.network]
  return c.json({
    name: s.name, slug: s.slug, network: s.network, recipient: s.address, token: MODERATO_TOKENS.pathUSD,
    canWithdraw: false, // cloud never holds keys; withdraw is signed in the browser with the passkey (later)
    price: s.price,
    snippet: "app.get('/your-route', paid(), handler)\nmountTrajan(app)",
    explorerTx: ex.tx, explorerAddr: ex.addr, decimals: DEC,
    ingestUrl: `${ORIGIN}/ingest`,
  })
})

app.get('/api/console/stats', async (c) => {
  const s = await requireSeller(c); if (s instanceof Response) return s
  const day = new Date(); day.setUTCHours(0, 0, 0, 0)
  const [t] = await sql()`SELECT COUNT(*)::int AS calls, COALESCE(SUM(amount::numeric),0)::text AS revenue, COUNT(DISTINCT payer)::int AS payers,
      COUNT(*) FILTER (WHERE created_at >= ${day})::int AS calls_today,
      COALESCE(SUM(amount::numeric) FILTER (WHERE created_at >= ${day}),0)::text AS revenue_today
    FROM calls WHERE seller_id = ${s.id}`
  const top = await sql()`SELECT payer, COUNT(*)::int AS calls, SUM(amount::numeric)::text AS revenue FROM calls
    WHERE seller_id = ${s.id} AND payer IS NOT NULL GROUP BY payer ORDER BY SUM(amount::numeric) DESC LIMIT 5`
  return c.json({
    calls: t!.calls, callsToday: t!.calls_today, revenue: fmt(t!.revenue as string), revenueToday: fmt(t!.revenue_today as string), payers: t!.payers,
    topPayers: top.map((p) => ({ payer: p.payer, calls: p.calls, revenue: fmt(p.revenue as string) })),
  })
})


const CSV_COLS = ['created_at', 'route', 'http_method', 'amount', 'currency', 'payer', 'recipient', 'fee_payer', 'tx_hash', 'block_number', 'challenge_id', 'memo'] as const
function toCsv(rows: Record<string, unknown>[], fmtAmount: (raw: string | number) => string) {
  const esc = (v: unknown) => { const s = v == null ? '' : String(v); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s }
  const head = [...CSV_COLS, 'amount_formatted'].join(',')
  const body = rows.map((r) => [...CSV_COLS.map((k) => esc(r[k])), esc(fmtAmount(r.amount as string))].join(','))
  return [head, ...body].join('\n') + '\n'
}

const shape = (s: Seller) => (r: CallRow) => ({ ...r, amountFormatted: fmt(r.amount), explorerUrl: EXPLORER[s.network].tx + r.tx_hash })

app.get('/api/console/calls', async (c) => {
  const s = await requireSeller(c); if (s instanceof Response) return s
  const limit = Math.min(Number(c.req.query('limit') ?? 50), 200), offset = Number(c.req.query('offset') ?? 0)
  const rows = await sql()`SELECT * FROM calls WHERE seller_id = ${s.id} ORDER BY id DESC LIMIT ${limit} OFFSET ${offset}`
  return c.json((rows as CallRow[]).map(shape(s)))
})

app.get('/api/console/calls.csv', async (c) => {
  const s = await requireSeller(c); if (s instanceof Response) return s
  const rows = await sql()`SELECT * FROM calls WHERE seller_id = ${s.id} ORDER BY id DESC LIMIT 10000`
  return c.body(toCsv(rows as Record<string, unknown>[], fmt), 200, { 'content-type': 'text/csv; charset=utf-8', 'content-disposition': `attachment; filename="trajan-${s.slug}-calls-${new Date().toISOString().slice(0, 10)}.csv"` })
})

app.get('/api/console/calls/:hash', async (c) => {
  const s = await requireSeller(c); if (s instanceof Response) return s
  const rows = await sql()`SELECT * FROM calls WHERE seller_id = ${s.id} AND tx_hash = ${c.req.param('hash')}`
  return rows[0] ? c.json(shape(s)(rows[0] as CallRow)) : c.json({ error: 'not found' }, 404)
})

app.get('/api/console/balance', async (c) => {
  const s = await requireSeller(c); if (s instanceof Response) return s
  try {
    const client = createClient({ testnet: s.network === 'moderato' })
    const b = await client.token.getBalance({ account: s.address as `0x${string}`, token: MODERATO_TOKENS.pathUSD })
    return c.json({ raw: b.amount.toString(), formatted: b.formatted, decimals: b.decimals })
  } catch (e) { return c.json({ error: (e as Error).message }, 502) }
})

app.get('/healthz', (c) => c.json({ ok: true }))

export default app
