// Direct MCP buyer (no LLM): spawn the demo MCP seller over stdio, wrap the client with
// mppx payment handling, list tools, and call both paid tools. Proves the loop end to end.

import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'
import { privateKeyToAccount } from 'viem/accounts'
import { tempo } from 'mppx/client'
import { McpClient } from 'mppx/mcp/client'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const key = process.env.TEMPO_BUYER_PRIVATE_KEY as `0x${string}`
if (!key) throw new Error('TEMPO_BUYER_PRIVATE_KEY missing')
const account = privateKeyToAccount(key)
console.log('buyer', account.address)

const here = dirname(fileURLToPath(import.meta.url))
const serverDir = resolve(here, '../../mcp-tools')

const transport = new StdioClientTransport({
  command: 'node',
  args: ['--no-warnings=ExperimentalWarning', '--env-file=.env', '--import', 'tsx', 'src/server.ts'],
  cwd: serverDir,
  stderr: 'pipe',
})
const client = new Client({ name: 'trajan-buyer', version: '0.1.0' })
await client.connect(transport)
transport.stderr?.on('data', (d) => process.stderr.write(`[seller] ${d}`))

McpClient.wrap(client, { methods: [tempo({ account })] })

const { tools } = await client.listTools()
console.log('tools:', tools.map((t) => `${t.name} — ${t.description}`).join('\n       '))

for (const call of [
  { name: 'quote_of_the_day', arguments: {} },
  { name: 'word_count', arguments: { text: 'The rails are done. The storefronts are not. Build the forum.' } },
]) {
  const result = await (client as any).callTool(call)
  const text = (result.content as any[]).map((c) => c.text).join('')
  console.log(`\n${call.name} ->`, text)
  console.log('receipt:', result.receipt ? { reference: result.receipt.reference, status: result.receipt.status } : 'none')
}

await client.close()
