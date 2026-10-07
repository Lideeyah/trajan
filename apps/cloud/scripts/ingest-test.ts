// Dev check: a scripted seller posts one call to /ingest. No passkey needed for this path.
import { neon } from '@neondatabase/serverless'
import { createHash, randomUUID } from 'node:crypto'
const sql = neon(process.env.DATABASE_URL!)
const key = 'trj_testkey_' + randomUUID().replace(/-/g, '')
const base = process.env.BASE ?? 'http://localhost:3000'
await sql`INSERT INTO sellers (id, credential_id, address, name, slug, price, network, api_key_hash)
  VALUES (${randomUUID()}, ${'test-cred-' + randomUUID()}, '0xdC0c0024CE466b0FA4A6974534265D3B7eD23aeC', 'Ingest test seller', ${'ingest-test-' + randomUUID().slice(0, 6)}, '0.01', 'moderato', ${createHash('sha256').update(key).digest('hex')})`
const r = await fetch(base + '/ingest', { method: 'POST', headers: { 'content-type': 'application/json', authorization: 'Bearer ' + key },
  body: JSON.stringify({ challenge_id: 'c1', tx_hash: '0xabc', amount: '10000', currency: '0x20c0000000000000000000000000000000000000', route: '/joke', http_method: 'GET', payer: '0x5a784c18a498f5aa03fac3a1dd05dde545b69d62', created_at: new Date().toISOString() }) })
console.log('ingest ->', r.status, await r.text())
const dup = await fetch(base + '/ingest', { method: 'POST', headers: { 'content-type': 'application/json', authorization: 'Bearer ' + key },
  body: JSON.stringify({ challenge_id: 'c1', tx_hash: '0xabc', amount: '10000', block_number: 42 }) })
console.log('duplicate (upsert) ->', dup.status)
const bad = await fetch(base + '/ingest', { method: 'POST', headers: { authorization: 'Bearer trj_nope' }, body: '{}' })
console.log('bad key ->', bad.status)
const rows = await sql`SELECT route, amount, payer, block_number FROM calls ORDER BY id DESC LIMIT 1`
console.log('db row ->', rows[0])
await sql`DELETE FROM sellers WHERE name = 'Ingest test seller'`
console.log('cleaned up')
