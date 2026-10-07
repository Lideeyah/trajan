# Generated module contract

`trajan init` writes a `trajan.ts` that exports:

- `mppx` — the configured mppx instance (hooks already attached)
- `log` — the call log (SQLite)
- `wallet` — balance reader; withdraw enabled only when `TRAJAN_WITHDRAW_KEY` is set
- `paid(amount?)` — route middleware (Hono/Express) or tool-handler wrapper (MCP)
- `mountTrajan(app)` — Hono/Express: mounts the console at `/trajan` (page) and `/trajan/api/*`
- `startTrajanApi(port?)` — MCP: serves the console on its own port

The seller's own routes are never edited.
