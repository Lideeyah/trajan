// Demo MCP seller over stdio: two tools, both paid per call via MPP on Tempo Moderato.
// `paid()` and `startTrajanApi()` come from the module `trajan init` generated.

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'
import { registerPaidTool, startTrajanApi } from './trajan.js'

const server = new McpServer({ name: 'trajan-demo-tools', version: '0.1.0' })

const QUOTES = [
  'Roads, bridges, markets. Build the forum; the merchants come.',
  'An agent that can pay is an agent that can finish the job.',
  'The rails are done. The storefronts are not.',
  'Charge per call, not per month.',
]

registerPaidTool(
  server,
  'quote_of_the_day',
  { description: 'Returns a short quote. Costs 0.01 USD per call, paid in stablecoins on Tempo.', inputSchema: {} },
  async () => ({ content: [{ type: 'text', text: QUOTES[new Date().getUTCDate() % QUOTES.length]! }] }),
)

registerPaidTool(
  server,
  'word_count',
  {
    description: 'Counts words, characters and sentences in a text. Costs 0.005 USD per call.',
    inputSchema: { text: z.string().min(1).max(20_000) },
  },
  async ({ text }: { text: string }) => {
    const words = text.trim().split(/\s+/).filter(Boolean).length
    const sentences = (text.match(/[.!?]+(\s|$)/g) ?? []).length
    return { content: [{ type: 'text', text: JSON.stringify({ words, characters: text.length, sentences }) }] }
  },
  '0.005',
)

startTrajanApi()
await server.connect(new StdioServerTransport())
console.error('trajan-demo-tools ready on stdio')
