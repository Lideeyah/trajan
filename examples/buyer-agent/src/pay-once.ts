// Day-one buyer: pay the demo seller once via MPP on Tempo Moderato and print the result.
import { privateKeyToAccount } from 'viem/accounts'
import { Mppx, tempo } from 'mppx/client'

const key = process.env.TEMPO_BUYER_PRIVATE_KEY as `0x${string}`
if (!key) throw new Error('TEMPO_BUYER_PRIVATE_KEY missing')
const account = privateKeyToAccount(key)
console.log('buyer', account.address)

// Fee sponsorship is the seller's call: when the 402 advertises feePayer, mppx signs a fee-delegated tx.
const mppx = Mppx.create({ methods: [tempo({ account })], polyfill: false })
const url = process.env.SELLER_URL ?? 'http://localhost:8787/tools/echo?q=trajan'

const PATHUSD = '0x20c0000000000000000000000000000000000000'
const balance = async () => {
  const r = await fetch('https://rpc.moderato.tempo.xyz', { method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_call', params: [{ to: PATHUSD, data: '0x70a08231' + account.address.slice(2).padStart(64, '0') }, 'latest'] }) })
  return BigInt((await r.json()).result)
}
const before = await balance()
const res = await mppx.fetch(url)
const after = await balance()
console.log(`spent ${(before - after).toString()} base units (price 10000; Tempo fees are sub-unit at 6 decimals)`)
console.log('status', res.status)
console.log('body', await res.text())
for (const [k, v] of res.headers) if (/payment|receipt/i.test(k)) console.log('header', k, '=', v.slice(0, 400))
