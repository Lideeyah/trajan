#!/usr/bin/env node
// trajan — one command to make your API or MCP server payable by AI agents on Tempo.

import { init, type InitFlags } from './init.js'

const [cmd, ...rest] = process.argv.slice(2)

function parseFlags(args: string[]): InitFlags & { _: string[] } {
  const out: any = { _: [] }
  for (let i = 0; i < args.length; i++) {
    const a = args[i]!
    if (a === '-y' || a === '--yes') out.yes = true
    else if (a.startsWith('--')) { out[a.slice(2)] = args[i + 1]; i++ }
    else out._.push(a)
  }
  return out
}

const usage = `trajan — payable APIs on Tempo, plus the seller console

  trajan init [dir]        set up MPP payments + call log in an existing Hono/Express/MCP project
      --yes                non-interactive (needs --recipient; defaults: moderato, 0.01, pathUSD)
      --recipient 0x...    Tempo address that receives payments
      --price 0.01         price per call in USD
      --network moderato|mainnet
      --framework hono|express|mcp
      --currency 0x...     TIP-20 token address (mainnet only; Moderato defaults to pathUSD)
`

try {
  if (cmd === 'init') {
    const f = parseFlags(rest)
    await init({ ...f, dir: f._[0] })
  } else {
    process.stdout.write(usage)
    if (cmd && cmd !== 'help' && cmd !== '--help') process.exit(1)
  }
} catch (e) {
  console.error(`\n${(e as Error).message}\n`)
  process.exit(1)
}
