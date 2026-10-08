// The demo buyer: a Claude agent that discovers the demo MCP seller's tools, decides which
// to call, and pays per call on Tempo Moderato through mppx — no human in the loop.
//
// Loop: Claude -> tool_use -> MCP callTool (mppx pays the 402) -> tool_result (+ receipt) -> Claude.

import Anthropic from '@anthropic-ai/sdk'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'
import { privateKeyToAccount } from 'viem/accounts'
import { tempo } from 'mppx/client'
import { McpClient } from 'mppx/mcp/client'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const MODEL = process.env.TRAJAN_AGENT_MODEL ?? 'claude-opus-5-5'
const EXPLORER = 'https://explore.testnet.tempo.xyz/tx/'

const key = process.env.TEMPO_BUYER_PRIVATE_KEY as `0x${string}`
if (!key) throw new Error('TEMPO_BUYER_PRIVATE_KEY missing')
const account = privateKeyToAccount(key)

const task = process.argv.slice(2).join(' ') ||
  'Get me today\'s quote, then count the words in it. Report the quote, the word count, and what each call cost.'

// 1. Connect to the seller and make the client payment-aware.
//    Default: the demo MCP server over stdio. With DEMO_SELLER_URL set: one paid HTTP endpoint
//    (used by the demo runner), paid through mppx's fetch.
const here = dirname(fileURLToPath(import.meta.url))
const httpUrl = process.env.DEMO_SELLER_URL
const httpTool = process.env.DEMO_TOOL_NAME ?? 'call_paid_api'
const httpDesc = process.env.DEMO_TOOL_DESC ?? `Calls a paid API at ${httpUrl}. Costs a small per-call fee in stablecoins on Tempo, paid automatically.`
let mcp: Client | null = null
let httpFetch: ((url: string) => Promise<Response>) | null = null
let tools: Anthropic.Tool[]
if (httpUrl) {
  const { Mppx: MppxClient, tempo: tempoClient } = await import('mppx/client')
  const m = MppxClient.create({ methods: [tempoClient({ account })], polyfill: false })
  httpFetch = (u) => m.fetch(u)
  tools = [{ name: httpTool, description: httpDesc, input_schema: { type: 'object', properties: {}, additionalProperties: false } }]
} else {
  const transport = new StdioClientTransport({
    command: 'node',
    args: ['--no-warnings=ExperimentalWarning', '--env-file=.env', '--import', 'tsx', 'src/server.ts'],
    cwd: resolve(here, '../../mcp-tools'),
    stderr: 'pipe',
    env: { ...process.env } as Record<string, string>, // the SDK strips custom vars by default
  })
  mcp = new Client({ name: 'trajan-agent', version: '0.1.0' })
  await mcp.connect(transport)
  transport.stderr?.on('data', (d) => { const s = String(d); if (!s.includes('[mppx]')) process.stderr.write(`[seller] ${s}`) })
  McpClient.wrap(mcp, { methods: [tempo({ account })] })
  const { tools: mcpTools } = await mcp.listTools()
  tools = mcpTools.map((t) => ({ name: t.name, description: t.description ?? '', input_schema: t.inputSchema as Anthropic.Tool.InputSchema }))
}
console.log(`buyer ${account.address}\ntools: ${tools.map((t) => t.name).join(', ')}\ntask: ${task}\n`)

// 3. The agent loop.
const anthropic = new Anthropic()
const messages: Anthropic.MessageParam[] = [{ role: 'user', content: task }]
const receipts: { tool: string; tx: string; amount?: string }[] = []

for (let turn = 0; turn < 8; turn++) {
  const res = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 4096,
    system: 'You are an agent with a stablecoin wallet on Tempo. The tools you see are paid per call; payment is handled automatically when you call them. Use them to complete the task, then answer plainly.',
    tools,
    messages,
  })
  messages.push({ role: 'assistant', content: res.content })

  for (const b of res.content) if (b.type === 'text' && b.text.trim()) console.log(`claude: ${b.text.trim()}`)

  if (res.stop_reason === 'refusal') { console.log('claude declined:', res.stop_details?.category); break }
  if (res.stop_reason !== 'tool_use') break

  const results: Anthropic.ToolResultBlockParam[] = []
  for (const b of res.content) {
    if (b.type !== 'tool_use') continue
    process.stdout.write(`  -> ${b.name}(${JSON.stringify(b.input)}) … `)
    try {
      let text: string, tx: string | undefined, charge: { amount: string; currency: string } | undefined
      if (httpFetch) {
        const res = await httpFetch(httpUrl!)
        text = await res.text()
        const rh = res.headers.get('payment-receipt')
        const receipt = rh ? JSON.parse(Buffer.from(rh, 'base64url').toString()) : null
        tx = receipt?.reference
        charge = process.env.DEMO_TOOL_PRICE ? { amount: process.env.DEMO_TOOL_PRICE, currency: 'pathUSD' } : undefined
      } else {
        const r = await (mcp as any).callTool({ name: b.name, arguments: b.input as Record<string, unknown> })
        text = (r.content as any[]).map((c) => c.text ?? '').join('')
        tx = r.receipt?.reference
        charge = r._meta?.['trajan/charge'] as { amount: string; currency: string } | undefined
      }
      if (tx) receipts.push({ tool: b.name, tx, amount: charge?.amount })
      console.log(tx ? `paid ✓ ${charge ? charge.amount + ' USD ' : ''}${tx.slice(0, 10)}…` : 'free')
      results.push({ type: 'tool_result', tool_use_id: b.id, content: text + (tx ? `\n[paid ${charge ? charge.amount + ' USD' : ''} on Tempo, tx ${tx}]` : '') })
    } catch (e) {
      console.log(`failed: ${(e as Error).message}`)
      results.push({ type: 'tool_result', tool_use_id: b.id, content: `Error: ${(e as Error).message}`, is_error: true })
    }
  }
  messages.push({ role: 'user', content: results })
}

console.log(`\n${receipts.length} paid call(s):`)
for (const r of receipts) console.log(`  ${r.tool.padEnd(18)} ${(r.amount ?? '?').padStart(6)} USD  ${EXPLORER}${r.tx}`)
if (mcp) await mcp.close()
