// `trajan init`: detect the framework, ask three questions, write trajan.ts + trajan.config.json,
// add env and deps, print the three lines to add. Never edits the seller's route files.

import { existsSync, readFileSync, writeFileSync, appendFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { randomBytes } from 'node:crypto'
import { ask, choose, closePrompts, isAddress, isPrice } from './prompt.js'
import { template, nextSteps, type Config, type Framework, type Network } from './templates.js'

const MODERATO = {
  pathUSD: '0x20c0000000000000000000000000000000000000',
} as const

export type InitFlags = {
  dir?: string
  yes?: boolean
  framework?: Framework
  network?: Network
  recipient?: string
  price?: string
  currency?: string
}

function detectFramework(pkg: any): Framework | null {
  const deps = { ...(pkg.dependencies ?? {}), ...(pkg.devDependencies ?? {}) }
  if (deps['@modelcontextprotocol/sdk']) return 'mcp'
  if (deps.hono) return 'hono'
  if (deps.express) return 'express'
  return null
}

export async function init(flags: InitFlags) {
  const dir = resolve(flags.dir ?? '.')
  const pkgPath = join(dir, 'package.json')
  if (!existsSync(pkgPath)) throw new Error(`No package.json in ${dir}. Run trajan init inside your server project.`)
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'))

  console.log(`\nTrajan init · ${pkg.name ?? dir}\n`)

  const detected = detectFramework(pkg)
  const framework: Framework = flags.framework ?? (flags.yes && detected ? detected : await choose(
    detected ? `Detected ${detected}. Framework:` : 'Framework:',
    [{ key: 'hono', label: 'Hono' }, { key: 'express', label: 'Express' }, { key: 'mcp', label: 'MCP server (@modelcontextprotocol/sdk)' }],
    detected ?? 'hono',
  ))

  const network: Network = flags.network ?? (flags.yes ? 'moderato' : await choose(
    'Tempo network:',
    [{ key: 'moderato', label: 'Moderato testnet (free faucet funds)' }, { key: 'mainnet', label: 'Mainnet' }],
    'moderato',
  ))

  const recipient = (flags.recipient ?? (flags.yes ? undefined : await ask('Tempo address that receives payments', {
    validate: (v) => (isAddress(v) ? null : 'Enter a 0x address (40 hex chars)'),
  })))
  if (!recipient || !isAddress(recipient)) throw new Error('--recipient 0x... is required')

  const price = flags.price ?? (flags.yes ? '0.01' : await ask('Price per call (USD)', {
    default: '0.01',
    validate: (v) => (isPrice(v) ? null : 'Enter a positive number, up to 6 decimals'),
  }))

  let currency = flags.currency
  if (!currency) {
    if (network === 'moderato') currency = MODERATO.pathUSD
    else currency = await ask('Stablecoin contract address on Tempo mainnet (TIP-20)', { validate: (v) => (isAddress(v) ? null : 'Enter a 0x address') })
  }

  const config: Config = {
    framework, network,
    recipient: recipient as `0x${string}`,
    currency: currency as `0x${string}`,
    price,
    db: '.trajan/calls.db',
    apiPort: 8788,
  }

  // 1. config + module
  const srcDir = existsSync(join(dir, 'src')) ? 'src' : '.'
  const modulePath = join(dir, srcDir, 'trajan.ts')
  const configPath = join(dir, srcDir, 'trajan.config.json')
  if (existsSync(modulePath) && !flags.yes) {
    const ow = await ask(`${srcDir}/trajan.ts exists. Overwrite? (y/N)`, { default: 'N' })
    if (!/^y/i.test(ow)) { closePrompts(); console.log('Left existing trajan.ts alone.'); return }
  }
  writeFileSync(configPath, JSON.stringify({ recipient: config.recipient, currency: config.currency, price: config.price, db: config.db, apiPort: config.apiPort, network }, null, 2) + '\n')
  writeFileSync(modulePath, template(config))

  // 2. env
  const envPath = join(dir, '.env')
  const env = existsSync(envPath) ? readFileSync(envPath, 'utf8') : ''
  if (!/^MPP_SECRET_KEY=/m.test(env)) {
    appendFileSync(envPath, `${env && !env.endsWith('\n') ? '\n' : ''}MPP_SECRET_KEY=${randomBytes(32).toString('hex')}\n`)
  }
  const gi = join(dir, '.gitignore')
  const gitignore = existsSync(gi) ? readFileSync(gi, 'utf8') : ''
  const missing = ['.env', '.trajan/'].filter((l) => !gitignore.split('\n').includes(l))
  if (missing.length) appendFileSync(gi, `${gitignore && !gitignore.endsWith('\n') ? '\n' : ''}${missing.join('\n')}\n`)

  // 3. deps (added to package.json; the seller runs their own install)
  pkg.dependencies ??= {}
  const want: Record<string, string> = { mppx: '^0.13.1', '@trajan/server': '^0.1.0', hono: '^4' }
  if (framework === 'mcp') want['@hono/node-server'] = '^1'
  const added: string[] = []
  for (const [name, ver] of Object.entries(want)) if (!pkg.dependencies[name]) { pkg.dependencies[name] = ver; added.push(name) }
  if (added.length) writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n')

  closePrompts()

  console.log(`\nWrote ${srcDir}/trajan.ts and ${srcDir}/trajan.config.json`)
  console.log(`Set MPP_SECRET_KEY in .env${added.length ? `; added deps: ${added.join(', ')} (run npm install)` : ''}`)
  console.log(`\nAdd these lines to your server:\n`)
  for (const l of nextSteps(config, 'trajan.js')) console.log(`  ${l}`)
  console.log(`\nThen start it and open the console: npx trajan console --api http://localhost:${framework === 'mcp' ? config.apiPort : 'PORT'}/trajan/api\n`)
}
