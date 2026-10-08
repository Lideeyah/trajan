// Trajan demo runner: drives the real product end to end, in the order of the demo video.
//
//   npm run demo            interactive: pauses for Enter between beats (narrate, switch windows)
//   npm run demo -- --auto  timed pauses instead (for a hands-off recording)
//   npm run demo -- --seed  only: put a few real payments in the hosted console, then exit
//
// Beats:
//   1  HOOK      an agent pays the seller's server, on-chain, no human in the loop
//   2  SIGN UP   (manual: passkey in the browser) — the runner shows the account it will pay
//   3  CONNECT   a brand-new server project, `npx trajan-cli init --cloud`, two lines, start
//   4  THE 402   an unpaid request and the MPP challenge it gets back
//   5  PAY       the agent pays the new server; the row lands in the hosted console
//   6  RECEIPT   the transaction on Tempo's explorer, and the balance at the seller's address
//
// Everything is real: Tempo Moderato testnet, the published npm packages, Trajan Cloud.

import { spawn, execSync } from 'node:child_process'
import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync, openSync } from 'node:fs'
import { createInterface } from 'node:readline/promises'
import { stdin, stdout } from 'node:process'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const repo = resolve(here, '../..')
const auto = process.argv.includes('--auto')
const seedOnly = process.argv.includes('--seed')
const EX = 'https://explore.testnet.tempo.xyz'
const RPC = 'https://rpc.moderato.tempo.xyz'
const PATHUSD = '0x20c0000000000000000000000000000000000000'

// The seller we pay in the hook: the founder's hosted account, served by examples/fresh-hono on :8790.
const HOOK_URL = process.env.DEMO_HOOK_URL ?? 'http://localhost:8790/joke'
const SELLER_ADDRESS = process.env.DEMO_SELLER ?? '0xDC2AAE7352E56B332C0E2210Ee16aa5D812D2e5e'
const CLOUD_KEY = process.env.TRAJAN_API_KEY // from examples/fresh-hono/.env, loaded by the npm script
const NEW_PROJECT = resolve(process.env.HOME!, 'trajan-demo', 'sneaker-prices')
const NEW_PORT = 8796

// ---------- terminal helpers ----------
const c = { dim: '\x1b[2m', bold: '\x1b[1m', green: '\x1b[32m', orange: '\x1b[38;5;208m', reset: '\x1b[0m', cyan: '\x1b[36m' }
const rl = createInterface({ input: stdin, output: stdout })
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
async function pause(label = 'continue', ms = 2500) {
  if (auto) { await sleep(ms); return }
  await rl.question(`${c.dim}  ↵ ${label}${c.reset}`)
  stdout.write('\x1b[1A\x1b[2K')
}
function beat(n: number, title: string, sub?: string) {
  console.log(`\n${c.orange}${c.bold}  ${n}  ${title}${c.reset}${sub ? `  ${c.dim}${sub}${c.reset}` : ''}\n`)
}
function line(s = '') { console.log(`     ${s}`) }
function cmd(s: string) { console.log(`     ${c.cyan}$ ${s}${c.reset}`) }
async function typeOut(s: string, perChar = 18) { for (const ch of s) { stdout.write(ch); if (!auto) await sleep(perChar) } stdout.write('\n') }

async function rpc(method: string, params: unknown[]) {
  const r = await fetch(RPC, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }) })
  return ((await r.json()) as any).result
}
async function balance(addr: string) {
  const hex = await rpc('eth_call', [{ to: PATHUSD, data: '0x70a08231' + addr.slice(2).padStart(64, '0') }, 'latest'])
  return (Number(BigInt(hex)) / 1e6).toFixed(6).replace(/\.?0+$/, '')
}
function run(cmdline: string, cwd = repo, env: NodeJS.ProcessEnv = {}) {
  return execSync(cmdline, { cwd, env: { ...process.env, ...env }, stdio: 'pipe', encoding: 'utf8' })
}
/** Pay a URL with the demo buyer wallet via mppx; returns the tx hash. */
function pay(url: string): string {
  const out = run(`SELLER_URL="${url}" npm run -s pay`, resolve(repo, 'examples/buyer-agent'))
  if (!/status 200/.test(out)) throw new Error('payment failed:\n' + out)
  const m = out.match(/payment-receipt = ([A-Za-z0-9_-]+)/)
  const receipt = m ? JSON.parse(Buffer.from(m[1], 'base64url').toString()) : null
  return receipt?.reference ?? '(no receipt)'
}

// ---------- beats ----------
/** Run the Claude agent against a paid HTTP endpoint; stream its output; return the tx hashes it paid. */
async function agent(task: string, url: string, tool: string, desc: string, price: string): Promise<string[]> {
  const child = spawn('npm', ['run', '-s', 'agent', '--', task], {
    cwd: resolve(repo, 'examples/buyer-agent'),
    env: { ...process.env, DEMO_SELLER_URL: url, DEMO_TOOL_NAME: tool, DEMO_TOOL_DESC: desc, DEMO_TOOL_PRICE: price },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  let out = ''
  child.stdout.on('data', (d) => { out += d; stdout.write(String(d).split('\n').map((l) => (l ? '     ' + l : l)).join('\n')) })
  child.stderr.on('data', (d) => { const s = String(d); if (!/\[seller\]|ExperimentalWarning|\[mppx\]/.test(s)) stdout.write(s) })
  await new Promise((r) => child.on('close', r))
  return [...out.matchAll(/explore\.testnet\.tempo\.xyz\/tx\/(0x[0-9a-f]{64})/g)].map((m) => m[1])
}

async function hook() {
  beat(1, 'An agent pays for a tool. No human in the loop.', `seller: ${SELLER_ADDRESS.slice(0, 8)}…  ·  ${HOOK_URL}`)
  cmd('npm run agent -- "Get me a joke and tell me exactly what it cost."')
  await pause('run the agent')
  await agent('Get me a joke using the tool, then tell me exactly what it cost and the transaction hash.', HOOK_URL, 'get_joke', 'Returns a joke. Costs 0.01 USD per call, paid in stablecoins on Tempo.', '0.01')
  line()
  line(`${c.green}✓${c.reset} That was a real payment on Tempo Moderato. Everything after this is how the seller got here.`)
  await pause('next beat', 4000)
}

async function signup() {
  beat(2, 'Sign up with a passkey. The passkey is the Tempo account.', 'browser: https://trajan-five.vercel.app')
  line('Touch ID → name your seller → price → Create. No wallet, no seed phrase.')
  line(`The address it shows is real: ${c.bold}${SELLER_ADDRESS}${c.reset}`)
  line(`${c.dim}${EX}/address/${SELLER_ADDRESS}${c.reset}`)
  line(`Balance right now: ${c.bold}${await balance(SELLER_ADDRESS)} pathUSD${c.reset}`)
  await pause('next beat', 6000)
}

async function connect() {
  beat(3, 'Connect a server you already have: one command, two lines.', `${NEW_PROJECT.replace(process.env.HOME!, '~')}`)
  try { execSync(`lsof -nP -tiTCP:${NEW_PORT} -sTCP:LISTEN | xargs kill 2>/dev/null`, { stdio: 'ignore' }) } catch {}
  if (existsSync(NEW_PROJECT)) rmSync(NEW_PROJECT, { recursive: true, force: true })
  mkdirSync(resolve(NEW_PROJECT, 'src'), { recursive: true })
  writeFileSync(resolve(NEW_PROJECT, 'package.json'), JSON.stringify({
    name: 'sneaker-prices', private: true, type: 'module',
    scripts: { start: 'node --no-warnings=ExperimentalWarning --env-file=.env --import tsx src/server.ts' },
    dependencies: { hono: '^4', '@hono/node-server': '^1' }, devDependencies: { tsx: '^4' },
  }, null, 2))
  writeFileSync(resolve(NEW_PROJECT, 'src/server.ts'), `import { Hono } from 'hono'
import { serve } from '@hono/node-server'

const app = new Hono()
const PRICES: Record<string, number> = { 'jordan-1-chicago': 412, 'dunk-low-panda': 118, 'yeezy-350-zebra': 231 }

app.get('/price/:sku', (c) => {
  const usd = PRICES[c.req.param('sku')]
  return usd ? c.json({ sku: c.req.param('sku'), usd, asOf: new Date().toISOString() }) : c.json({ error: 'unknown sku' }, 404)
})

serve({ fetch: app.fetch, port: ${NEW_PORT} }, () => console.log('sneaker-prices on :${NEW_PORT}'))
`)
  line('A plain Hono API that sells sneaker prices. No payments in it yet:')
  line(`${c.dim}GET /price/:sku → { sku, usd }${c.reset}`)
  await pause('run init')
  cmd('npx trajan-cli init --cloud')
  await typeOut(`     ${c.dim}framework: Hono (detected) · network: Moderato · address: ${SELLER_ADDRESS.slice(0, 10)}… · price: 0.02 · key: trj_…${c.reset}`)
  const out = run(`npx -y trajan-cli@latest init --cloud --yes --recipient ${SELLER_ADDRESS} --price 0.02 --api-key "${CLOUD_KEY}"`, NEW_PROJECT)
  for (const l of out.split('\n').filter((l) => /Wrote|paid\(\)|mountTrajan|import \{/.test(l))) line(l.trim())
  await pause('add the two lines')
  // the two lines
  const src = readFileSync(resolve(NEW_PROJECT, 'src/server.ts'), 'utf8')
    .replace("import { serve } from '@hono/node-server'", "import { serve } from '@hono/node-server'\nimport { paid, mountTrajan } from './trajan.js'")
    .replace("app.get('/price/:sku', (c) => {", "app.get('/price/:sku', paid(), (c) => {")
    .replace('serve({', 'mountTrajan(app)\nserve({')
  writeFileSync(resolve(NEW_PROJECT, 'src/server.ts'), src)
  line(`${c.green}+${c.reset} import { paid, mountTrajan } from './trajan.js'`)
  line(`${c.green}+${c.reset} app.get('/price/:sku', ${c.bold}paid()${c.reset}, handler)`)
  line(`${c.green}+${c.reset} mountTrajan(app)`)
  // demo seller sponsors fees too, so the agent needs only the payment token
  const feeKey = readFileSync(resolve(repo, 'examples/mcp-server/.env'), 'utf8').match(/TEMPO_SELLER_PRIVATE_KEY=(0x[0-9a-f]+)/i)?.[1]
  if (feeKey) writeFileSync(resolve(NEW_PROJECT, '.env'), readFileSync(resolve(NEW_PROJECT, '.env'), 'utf8') + `TRAJAN_FEE_PAYER_KEY=${feeKey}\n`)
  await pause('install + start')
  cmd('npm install && npm run start')
  run('npm install --no-audit --no-fund', NEW_PROJECT)
  // Fully detached, no pipes (so the runner's event loop isn't tied to it), then poll until it answers.
  const logFd = openSync(resolve(NEW_PROJECT, '..', 'sneaker-prices.log'), 'w')
  // Clean env: the runner carries the demo seller's keys; the new server must only see its own .env.
  const cleanEnv = { PATH: process.env.PATH!, HOME: process.env.HOME!, TMPDIR: process.env.TMPDIR ?? '/tmp' }
  const server = spawn('npm', ['run', '-s', 'start'], { cwd: NEW_PROJECT, stdio: ['ignore', logFd, logFd], detached: true, env: cleanEnv })
  server.unref()
  for (let i = 0; i < 60; i++) {
    try { const r = await fetch(`http://localhost:${NEW_PORT}/trajan`, { signal: AbortSignal.timeout(1000) }); if (r.ok) break } catch {}
    await sleep(500)
    if (i === 59) throw new Error(`sneaker-prices did not come up on :${NEW_PORT}`)
  }
  line(`${c.green}✓${c.reset} sneaker-prices on :${NEW_PORT}  ·  console at http://localhost:${NEW_PORT}/trajan  ·  reporting to Trajan Cloud`)
  await pause('next beat', 3000)
}

async function the402() {
  beat(4, 'Unpaid, the server states its price. That is the protocol.', `GET http://localhost:${NEW_PORT}/price/jordan-1-chicago`)
  cmd(`curl -i http://localhost:${NEW_PORT}/price/jordan-1-chicago`)
  await pause('send it')
  const r = await fetch(`http://localhost:${NEW_PORT}/price/jordan-1-chicago`)
  line(`${c.bold}HTTP ${r.status} ${r.statusText}${c.reset}`)
  const www = r.headers.get('www-authenticate') ?? ''
  const req = www.match(/request="([^"]+)"/)?.[1]
  const challenge = req ? JSON.parse(Buffer.from(req, 'base64url').toString()) : null
  line(`WWW-Authenticate: Payment method="tempo" intent="charge" …`)
  if (challenge) line(`${c.dim}challenge: amount ${challenge.amount} (${Number(challenge.amount) / 1e6} pathUSD) · chainId ${challenge.methodDetails?.chainId} · recipient ${challenge.recipient}${c.reset}`)
  await pause('next beat', 4000)
}

async function payNew(): Promise<string> {
  beat(5, 'The agent pays. The row lands in the hosted console.', 'browser: https://trajan-five.vercel.app/console')
  cmd(`npm run agent -- "What does a Jordan 1 Chicago cost right now?"`)
  await pause('pay')
  const before = await balance(SELLER_ADDRESS)
  const txs = await agent('What does a Jordan 1 Chicago cost right now? Use the tool, then say what you paid for the answer.', `http://localhost:${NEW_PORT}/price/jordan-1-chicago`, 'get_sneaker_price', 'Returns the current resale price of the Jordan 1 Chicago in USD. Costs 0.02 USD per call, paid in stablecoins on Tempo.', '0.02')
  const tx = txs[0] ?? '(no tx parsed)'
  await sleep(2500)
  const after = await balance(SELLER_ADDRESS)
  line(`seller balance ${before} → ${c.bold}${after}${c.reset}`)
  line(`${c.dim}watch the console: the row flashes in within two seconds${c.reset}`)
  await pause('next beat', 5000)
  return tx
}

async function receipt(tx: string) {
  beat(6, 'Receipt. On-chain, with who covered the fee.', `${EX}/tx/${tx}`)
  const rc = await rpc('eth_getTransactionReceipt', [tx])
  if (rc) {
    line(`status ${rc.status === '0x1' ? c.green + 'success' + c.reset : 'failed'} · block ${parseInt(rc.blockNumber, 16)}`)
    line(`from   ${rc.from}  (the agent)`)
    line(`fee    paid by ${rc.feePayer ?? rc.from}${rc.feePayer && rc.feePayer.toLowerCase() !== rc.from.toLowerCase() ? '  (fee sponsored by the server)' : ''}`)
  }
  line(`${c.dim}Nothing is held by Trajan. The money is already at the seller's address.${c.reset}`)
  await pause('finish', 4000)
  console.log(`\n${c.dim}  Testnet only · charge-per-call · hosted cash-out signs with the passkey next · github.com/Lideeyah/trajan · npm: trajan-cli, trajan-server${c.reset}\n`)
}

async function seed(n = 3) {
  beat(0, `Seeding ${n} real payments into the hosted console`, HOOK_URL)
  for (let i = 0; i < n; i++) { const tx = pay(HOOK_URL); line(`${c.green}paid ✓${c.reset} ${tx.slice(0, 14)}…`); await sleep(1500) }
}

// ---------- main ----------
try {
  if (!CLOUD_KEY) throw new Error('TRAJAN_API_KEY not set: run via `npm run demo` so examples/fresh-hono/.env is loaded')
  console.log(`\n${c.bold}  TRAJAN${c.reset}  ${c.dim}demo · Tempo Moderato · real payments · ${auto ? 'auto' : 'press Enter between beats'}${c.reset}`)
  if (seedOnly) { await seed(3); process.exit(0) }
  await hook()
  await signup()
  await connect()
  await the402()
  const tx = await payNew()
  await receipt(tx)
  process.exit(0)
} catch (e) {
  console.error(`\n  demo stopped: ${(e as Error).message}\n`)
  process.exit(1)
}
