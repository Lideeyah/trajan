# Trajan

Seller tooling for the [Machine Payments Protocol](https://mpp.dev) on [Tempo](https://tempo.xyz).

One command adds pay-per-call to an existing API or MCP server so AI agents pay in stablecoins. One console shows who called, what they paid, receipts with on-chain links, and lets you withdraw. Built on the official [`mppx`](https://github.com/wevm/mppx) SDK — Trajan adds nothing to the payment path.

Stripe merchants get this inside the Stripe dashboard. If you host your own server — solo developer, pre-incorporation, or outside Stripe's supported countries — you get a library. Trajan is the missing console.

**Status:** runs end to end on Tempo Moderato testnet. Not audited. Not mainnet. See [Limits](#limits).

- Demo video: [LINK]
- Live console (read-only demo seller): [LINK]
- Colosseum submission: [LINK]

---

## 60-second quickstart

Requirements: Node 22.5+ (uses `node:sqlite`), a Tempo address to receive payments (no funds needed to *receive*).

```bash
git clone https://github.com/Lideeyah/trajan && cd trajan && npm install
cd examples/mcp-server
cp .env.example .env      # set TEMPO_RECIPIENT and MPP_SECRET_KEY
npm start                 # seller on :8787, console at http://localhost:8787/trajan
```

Pay it once from another terminal (needs a buyer key funded on Moderato — see [Test funds](#test-funds)):

```bash
cd examples/buyer-agent && npm run pay     # 402 → pays 0.01 pathUSD → 200
```

Open `http://localhost:8787/trajan`. The call is there within two seconds: route, payer, amount, tx hash, block, receipt.

---

## Add Trajan to your own server

```bash
cd your-server
npx trajan init           # asks: framework (auto-detected), Tempo address, price per call
npm install
```

`init` writes `src/trajan.ts` and `src/trajan.config.json`, adds `MPP_SECRET_KEY` to `.env`, and prints three lines. It never edits your route files.

**Hono / Express**

```ts
import { paid, mountTrajan } from './trajan.js'

app.get('/search', paid(), handler)        // 402 until paid; price from config
app.get('/premium', paid('0.05'), handler) // per-route override
mountTrajan(app)                           // console at /trajan, JSON at /trajan/api/*
```

**MCP server (`@modelcontextprotocol/sdk`)**

```ts
import { registerPaidTool, startTrajanApi } from './trajan.js'

registerPaidTool(server, 'search', { description, inputSchema }, async (args) => ({ content: [...] }))
startTrajanApi()                            // console on :8788/trajan (stdio servers have no HTTP of their own)
```

Non-interactive: `npx trajan init --yes --recipient 0x… --price 0.01 [--network moderato|mainnet] [--framework hono|express|mcp]`.

### Optional env

| Variable | Effect |
|---|---|
| `TRAJAN_WITHDRAW_KEY` | Private key of the recipient. Enables the Withdraw form in the console. Without it, the console shows the balance and tells you funds are already at your address. |
| `TRAJAN_FEE_PAYER_KEY` | A funded key. The seller sponsors buyers' transaction fees (paid in the stablecoin). Buyers then hold only the payment token. The receipt shows "sponsored by seller". |

## What the console shows

- **Overview** — revenue today / all time, calls, unique payers, on-chain balance; latest calls (new ones flash in); top payers.
- **Calls** — full history, load more.
- **Receipt** — route or tool name, amount, payer, recipient, tx hash, block, fee (caller or sponsored), challenge id, memo; open in explorer, copy hash.
- **Withdraw** — to-address, amount, optional on-chain memo. Settles in about a second.

One HTML page served by your own process. No build step. Light/dark automatic. Data lives in `.trajan/calls.db` (SQLite); nothing leaves your machine unless you deploy it.

## How it works

`mppx` handles the 402 challenge, verification and settlement. Trajan subscribes to its `onPaymentSuccess` hook and writes one row per paid call — the payer comes from the credential, the tool name from the challenge, the block and fee payer from the receipt. Handlers are never wrapped. The console reads that table.

## The demo buyer

`examples/buyer-agent/src/agent.ts` is a Claude agent with a Tempo wallet. It connects to the demo MCP seller over stdio, lists its tools, decides which to call, and pays per call through `mppx` — no human in the loop. `src/mcp-pay.ts` does the same without an LLM, for testing.

```bash
cd examples/buyer-agent
cp .env.example .env     # TEMPO_BUYER_PRIVATE_KEY (funded), ANTHROPIC_API_KEY
npm run agent            # or: npm run agent -- "count the words in today's quote"
```

## Test funds

Moderato faucet, any of:

```bash
curl -X POST https://rpc.moderato.tempo.xyz -H 'content-type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tempo_fundAddress","params":["0xYOUR_ADDRESS"]}'
```

or in code: `createClient({ account, testnet: true }).faucet.fundSync({ account })` from `viem/tempo`.

## Repo layout

```
packages/cli          trajan init
packages/server       call log (SQLite), mppx hook, console page + JSON API, wallet
examples/mcp-server   HTTP demo seller (Hono) — the one the quickstart runs
examples/mcp-tools    MCP demo seller (stdio) with two paid tools
examples/fresh-hono   a bare app set up with `trajan init`, kept as the init test
examples/buyer-agent  Claude agent + non-LLM buyers
```

## Built with

Tempo (Moderato testnet) · Machine Payments Protocol · mppx 0.13 · viem/tempo · TIP-20 transfers with memos · Tempo fee sponsorship · Hono · Express · Model Context Protocol SDK · node:sqlite · Anthropic Claude (demo agent only)

## Limits

- **Testnet only.** Moderato. No mainnet deployment.
- **Charge mode only.** MPP session/streaming payments are not supported yet.
- **Single seller per console.** No multi-tenant hosting.
- **No audit.** The payment path is upstream `mppx`; Trajan's own code is the CLI, the call log, the console and the wallet helper. Withdraw and fee sponsorship put private keys on your server — treat them like any other secret.

## Pre-existing code

Built during the Colosseum Crypto World's Fair hackathon (Sep 14 – Oct 13, 2026). The buyer agent's tool-use loop is adapted from my Frontier project [Brewing](https://github.com/Lideeyah/brewing-solana-frontier), ported from Solana to Tempo/mppx. Everything Tempo- and MPP-facing, the CLI, the console and the call log are new. No Solana code ships in this repo.

## License

MIT

## Author

Lydia Solomon — Lagos · [@sheislideeyah](https://x.com/sheislideeyah)
