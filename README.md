# Trajan

Seller tooling for the [Machine Payments Protocol](https://mpp.dev) on [Tempo](https://tempo.xyz).

One command wraps an existing API or MCP server so AI agents pay per call in stablecoins. One console shows who called, what they paid, and lets you withdraw. Built on the official [`mppx`](https://github.com/wevm/mppx) SDK — Trajan adds nothing to the payment path.

Stripe merchants get this inside the Stripe dashboard. If you host your own server — solo developer, pre-incorporation, or outside Stripe's supported countries — you get a library. Trajan is the missing console.

**Status:** runs end to end on Tempo Moderato testnet. Not audited. Not mainnet. See [Limits](#limits).

- Demo video: [LINK]
- Live console (read-only demo seller): [LINK]
- Colosseum submission: [LINK]

---

## 60-second quickstart

Requirements: Node 20+, a Tempo Moderato address (any address works as the recipient — you don't need funds to *receive*).

```bash
git clone https://github.com/Lideeyah/trajan
cd trajan && npm install
cd examples/mcp-server
npx trajan init        # asks: Tempo recipient address, price per call
npm start              # server on :8787, console on :3000
```

Pay it once from another terminal:

```bash
# get Moderato testnet USDG first: [TEMPO FAUCET LINK]
tempo request http://localhost:8787/tools/echo   # 402 → pays → 200
```

Open `http://localhost:3000`. The call is there: caller, amount, tx hash, memo, time.

---

## What `trajan init` does

1. Detects the server framework (Express, Hono, or an MCP server using [ADAPTER]).
2. Asks for a Tempo recipient address and a price per call (USD, settled in [USDG/TIP-20 token]).
3. Writes `trajan.config.ts` with an `mppx` `tempo.charge(...)` method and installs the middleware on the routes you choose.
4. Creates `.trajan/` for the local call log and starts the console alongside your server.

Nothing is proxied. Payments go directly to the recipient address you entered. Trajan never holds funds.

## What the console shows

- **Calls** — every paid request: caller address, amount, Tempo tx hash, memo (carries the call ID), timestamp.
- **Revenue** — today / 7 days / all time, top callers.
- **Receipts** — one per call, linked to the Moderato explorer.
- **Withdraw** — send the recipient balance to any Tempo address. [Only if shipped; otherwise delete this line.]

Data lives in `.trajan/calls.db` (SQLite). Nothing leaves your machine unless you deploy the console.

## Buyer side (demo agent)

`examples/buyer-agent` is a Claude-driven agent with an MPP client. It discovers the demo server, reads the 402 challenge, pays on Tempo, retries, and uses the result.

```bash
cd examples/buyer-agent
cp .env.example .env     # ANTHROPIC_API_KEY, TEMPO_PRIVATE_KEY (Moderato, funded with USDG)
npm start
```

[If shipped:] Fee sponsorship is enabled in the example, so the buyer wallet needs USDG only — no gas token.

## Repo layout

```
packages/cli        trajan init
packages/server     mppx wrapper + call-log webhook
apps/console        Next.js seller dashboard
examples/mcp-server demo seller
examples/buyer-agent demo buyer (Claude + MPP client)
```

## Built with

Tempo (Moderato testnet) · Machine Payments Protocol · mppx · Tempo TypeScript SDK (Viem) · TIP-20 transfers with memos · [Tempo fee sponsorship] · Hono · Express · Model Context Protocol · Next.js · SQLite · Anthropic Claude (demo agent)

## Limits

- **Testnet only.** Moderato. No mainnet deployment.
- **Charge mode only.** MPP session/streaming payments are not supported yet.
- **Single seller per console.** No multi-tenant hosting.
- **No audit.** The payment path is the upstream `mppx` middleware; Trajan's own code is the CLI, the call log, and the console.

## Pre-existing code

Built during the Colosseum Crypto World's Fair hackathon (Sep 14 – Oct 13, 2026). The buyer agent's runner loop is adapted from my Frontier project [Brewing](https://github.com/Lideeyah/brewing-solana-frontier), ported from Solana to Tempo/mppx. Everything Tempo- and MPP-facing, the CLI, and the console are new. No Solana code ships in this repo.

## License

MIT

## Author

Lydia Solomon — Lagos · [@sheislideeyah](https://x.com/sheislideeyah)
