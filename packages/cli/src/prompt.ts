// Minimal prompts on node:readline — no dependencies.

import { createInterface } from 'node:readline/promises'
import { stdin, stdout } from 'node:process'

let rl: ReturnType<typeof createInterface> | undefined
function io() { return (rl ??= createInterface({ input: stdin, output: stdout })) }
export function closePrompts() { rl?.close(); rl = undefined }

export async function ask(question: string, opts: { default?: string; validate?: (v: string) => string | null } = {}): Promise<string> {
  for (;;) {
    const suffix = opts.default ? ` (${opts.default})` : ''
    const raw = (await io().question(`${question}${suffix}: `)).trim()
    const value = raw || opts.default || ''
    const err = opts.validate?.(value)
    if (!err) return value
    stdout.write(`  ${err}\n`)
  }
}

export async function choose<T extends string>(question: string, options: readonly { key: T; label: string }[], def: T): Promise<T> {
  stdout.write(`${question}\n`)
  options.forEach((o, i) => stdout.write(`  ${i + 1}) ${o.label}${o.key === def ? '  [default]' : ''}\n`))
  const idx = options.findIndex((o) => o.key === def) + 1
  const ans = await ask('Choose', {
    default: String(idx),
    validate: (v) => (Number(v) >= 1 && Number(v) <= options.length ? null : `Enter 1-${options.length}`),
  })
  return options[Number(ans) - 1]!.key
}

export const isAddress = (v: string) => /^0x[0-9a-fA-F]{40}$/.test(v)
export const isPrice = (v: string) => /^\d+(\.\d{1,6})?$/.test(v) && Number(v) > 0
