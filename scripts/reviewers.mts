// Regenerates REVIEWERS.md: every paid call the example sellers logged, the founder's hosted-account
// payments, the withdraw tx, addresses, and a verification path. Run from the repo root.
import { DatabaseSync } from 'node:sqlite'
import { writeFileSync } from 'node:fs'
import { neon } from '@neondatabase/serverless'
const EX = 'https://explore.testnet.tempo.xyz'
const FOUNDER = '0xDC2AAE7352E56B332C0E2210Ee16aa5D812D2e5e'
const rows: any[] = []
for (const [label, db] of [['HTTP demo seller (examples/mcp-server)', 'examples/mcp-server/.trajan/calls.db'], ['MCP demo seller (examples/mcp-tools)', 'examples/mcp-tools/.trajan/calls.db'], ['Fresh Hono app set up with init (examples/fresh-hono)', 'examples/fresh-hono/.trajan/calls.db'], ['Fresh Express app set up with init (examples/fresh-express)', 'examples/fresh-express/.trajan/calls.db']] as const) {
  try { const d = new DatabaseSync(db); for (const r of d.prepare('SELECT * FROM calls ORDER BY id').all() as any[]) rows.push({ label, ...r }) } catch {}
}
const sql = neon(process.env.DATABASE_URL!)
const cloud = await sql`SELECT c.*, s.name AS seller FROM calls c JOIN sellers s ON s.id=c.seller_id WHERE lower(s.address)=lower(${FOUNDER}) ORDER BY c.id` as any[]
const fmt = (a: string | number) => (Number(a) / 1e6).toFixed(6).replace(/\.?0+$/, '')
const byLabel: Record<string, any[]> = {}
for (const r of rows) (byLabel[r.label] ??= []).push(r)
const short = (h: string) => h.slice(0, 10) + '…'
const md = `# Reviewer guide and on-chain evidence

Everything Trajan claims is checkable on Tempo's public testnet (Moderato, chain id 42431). This file lists the addresses and transactions behind the demo, and the fastest way to verify the product yourself. Generated from the demo sellers' call logs and Trajan Cloud's database on ${new Date().toISOString().slice(0, 10)}.

## Verify in five minutes (no account needed)

1. **The hosted product is live:** https://trajan-five.vercel.app — sign up with a passkey; the address shown is a real Tempo account (check it on the explorer link below).
2. **The CLI is on npm:** \`npx trajan-cli --help\` (package: https://www.npmjs.com/package/trajan-cli). The library: https://www.npmjs.com/package/trajan-server.
3. **Run the self-hosted loop:** README → "60-second quickstart". Unpaid request returns 402 with an MPP challenge; a paid request returns 200 and a \`Payment-Receipt\` header carrying the tx hash; the console at \`/trajan\` shows the row.
4. **Pick any hash below and open it on the explorer.** Each is a TIP-20 transfer (Tempo transaction type 0x76) from a buyer wallet to a seller address, with \`feePayer\` set when sponsorship was on.

## Addresses

| Role | Address | Explorer |
|---|---|---|
| Demo seller (recipient for all example servers; also the fee sponsor) | \`0xdC0c0024CE466b0FA4A6974534265D3B7eD23aeC\` | ${EX}/address/0xdC0c0024CE466b0FA4A6974534265D3B7eD23aeC |
| Demo buyer (the agent's wallet) | \`0x5A784c18a498f5AA03faC3a1dD05DDE545b69d62\` | ${EX}/address/0x5A784c18a498f5AA03faC3a1dD05DDE545b69d62 |
| Founder's hosted account — a passkey created on 8 Oct 2026; the address is derived from the passkey's P256 key | \`${FOUNDER}\` | ${EX}/address/${FOUNDER} |
| pathUSD (Moderato test stablecoin, 6 decimals) | \`0x20c0000000000000000000000000000000000000\` | ${EX}/address/0x20c0000000000000000000000000000000000000 |

## Payments to a hosted account (Trajan Cloud)

Seller "${cloud[0]?.seller ?? 'Pust'}", created through the live sign-up with a passkey. Reported to Trajan Cloud by \`trajan-cli init --cloud\` from a plain Hono app.

| Time (UTC) | Route | Paid | Payer | Fee payer | Block | Tx |
|---|---|---|---|---|---|---|
${cloud.map((r) => `| ${new Date(r.created_at).toISOString().slice(0, 19)} | \`${r.route}\` | ${fmt(r.amount)} | ${short(r.payer ?? '')} | ${r.fee_payer ? short(r.fee_payer) : '—'} | ${r.block_number} | [${r.tx_hash.slice(0, 12)}…](${EX}/tx/${r.tx_hash}) |`).join('\n')}

## Withdraw from the self-hosted console

A 0.5 pathUSD transfer with the on-chain memo "trajan test withdraw", sent from the demo seller's address via the console's Cash out form: [0x7dddefbb…](${EX}/tx/0x7dddefbb241ae95c1f0f702bc084f1873608a5000f586b89a38257589eff0b6f) (block 38551487).

## Every paid call logged by the example servers

${Object.entries(byLabel).map(([label, rs]) => `### ${label} — ${rs.length} paid calls

| Time (UTC) | Route / tool | Paid | Fee payer | Block | Tx |
|---|---|---|---|---|---|
${rs.map((r) => `| ${String(r.created_at).slice(0, 19)} | \`${r.route}\` | ${fmt(r.amount)} | ${r.fee_payer ? short(r.fee_payer) : 'agent'} | ${r.block_number ?? '…'} | [${r.tx_hash.slice(0, 12)}…](${EX}/tx/${r.tx_hash}) |`).join('\n')}`).join('\n\n')}

## How to read a transaction on the explorer

- **From** is the buyer's wallet; **To** is the pathUSD contract (a TIP-20 transfer), with the seller address inside the transfer event.
- **feePayer** (in the receipt) is the account that paid the gas-in-stablecoin fee. When it differs from *From*, the seller sponsored the call; the demo seller does this via \`TRAJAN_FEE_PAYER_KEY\`.
- Fees on Moderato are below one base unit of a 6-decimal token, so a buyer's balance moves by exactly the price.

## What is not claimed

Testnet only; no mainnet transactions exist. No audit. Hosted cash-out does not yet send (Trajan Cloud never holds a seller's key). See [SECURITY.md](SECURITY.md) and the README's Limits.
`
writeFileSync('REVIEWERS.md', md)
console.log(`REVIEWERS.md: ${rows.length} example-seller calls, ${cloud.length} hosted-account payments`)
