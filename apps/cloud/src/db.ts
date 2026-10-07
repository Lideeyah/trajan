// Postgres (Neon) for Trajan Cloud: sellers, API keys, calls — plus the atomic KV the
// Tempo Accounts WebAuthn handler needs (challenges, credentials, sessions).

import { neon, type NeonQueryFunction } from '@neondatabase/serverless'
import type { Kv } from 'accounts/server'

let _sql: NeonQueryFunction<false, false> | null = null
export function sql() {
  if (!_sql) {
    const url = process.env.DATABASE_URL
    if (!url) throw new Error('DATABASE_URL is not set')
    _sql = neon(url)
  }
  return _sql
}

/** Idempotent schema. Cheap enough to run on cold start; guarded so it runs once per instance. */
let migrated: Promise<void> | null = null
export function migrate() {
  return (migrated ??= (async () => {
    const q = sql()
    await q`CREATE TABLE IF NOT EXISTS kv (
      key TEXT PRIMARY KEY,
      value JSONB NOT NULL,
      expires_at TIMESTAMPTZ
    )`
    await q`CREATE TABLE IF NOT EXISTS sellers (
      id TEXT PRIMARY KEY,
      credential_id TEXT UNIQUE NOT NULL,
      address TEXT NOT NULL,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      price TEXT NOT NULL DEFAULT '0.01',
      network TEXT NOT NULL DEFAULT 'moderato',
      api_key_hash TEXT UNIQUE NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`
    await q`CREATE TABLE IF NOT EXISTS calls (
      id BIGSERIAL PRIMARY KEY,
      seller_id TEXT NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
      challenge_id TEXT NOT NULL,
      tx_hash TEXT NOT NULL,
      payer TEXT,
      amount TEXT NOT NULL,
      currency TEXT NOT NULL,
      recipient TEXT NOT NULL,
      route TEXT NOT NULL,
      http_method TEXT NOT NULL,
      memo TEXT,
      block_number BIGINT,
      fee_payer TEXT,
      created_at TIMESTAMPTZ NOT NULL,
      UNIQUE (seller_id, challenge_id)
    )`
    await q`CREATE INDEX IF NOT EXISTS calls_seller_created ON calls (seller_id, created_at DESC)`
  })())
}

/** accounts/server Kv backed by the kv table. `create` and `take` are atomic (single statements). */
export const kv: Kv.Kv = {
  async get(key) {
    const r = await sql()`SELECT value FROM kv WHERE key = ${key} AND (expires_at IS NULL OR expires_at > now())`
    return r[0]?.value as any
  },
  async set(key, value, options) {
    const exp = options?.ttl ? new Date(Date.now() + options.ttl * 1000) : null
    await sql()`INSERT INTO kv (key, value, expires_at) VALUES (${key}, ${JSON.stringify(value)}::jsonb, ${exp})
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, expires_at = EXCLUDED.expires_at`
  },
  async delete(key) {
    await sql()`DELETE FROM kv WHERE key = ${key}`
  },
  async create(key, value, options) {
    const exp = options?.ttl ? new Date(Date.now() + options.ttl * 1000) : null
    // Replace only if the existing row is expired; otherwise do nothing and report false.
    const r = await sql()`INSERT INTO kv (key, value, expires_at) VALUES (${key}, ${JSON.stringify(value)}::jsonb, ${exp})
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, expires_at = EXCLUDED.expires_at
      WHERE kv.expires_at IS NOT NULL AND kv.expires_at <= now()
      RETURNING key`
    return r.length > 0
  },
  async take(key) {
    const r = await sql()`DELETE FROM kv WHERE key = ${key} RETURNING value, expires_at`
    const row = r[0]
    if (!row) return undefined
    if (row.expires_at && new Date(row.expires_at as string) <= new Date()) return undefined
    return row.value as any
  },
}

export type Seller = {
  id: string; credential_id: string; address: string; name: string; slug: string
  price: string; network: 'moderato' | 'mainnet'; api_key_hash: string; created_at: string
}

export type CallRow = {
  id: number; challenge_id: string; tx_hash: string; payer: string | null; amount: string; currency: string
  recipient: string; route: string; http_method: string; memo: string | null; block_number: number | null
  fee_payer: string | null; created_at: string
}
