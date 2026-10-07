// Day-one buyer: pay the demo seller once via MPP on Tempo Moderato and print the result.
import { privateKeyToAccount } from 'viem/accounts'
import { Mppx, tempo } from 'mppx/client'

const key = process.env.TEMPO_BUYER_PRIVATE_KEY as `0x${string}`
if (!key) throw new Error('TEMPO_BUYER_PRIVATE_KEY missing')
const account = privateKeyToAccount(key)
console.log('buyer', account.address)

const mppx = Mppx.create({ methods: [tempo({ account })], polyfill: false })
const url = process.env.SELLER_URL ?? 'http://localhost:8787/tools/echo?q=trajan'
const res = await mppx.fetch(url)
console.log('status', res.status)
console.log('body', await res.text())
for (const [k, v] of res.headers) if (/payment|receipt/i.test(k)) console.log('header', k, '=', v.slice(0, 400))
