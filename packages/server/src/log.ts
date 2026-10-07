// Call log: one row per paid request. SQLite via node:sqlite (Node 22.5+), no native deps.

import { DatabaseSync } from 'node:sqlite'
import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'

export type CallRow = {
  id: number
  challenge_id: string
  tx_hash: string
  payer: string | null
  amount: string // raw units (e.g. 10000 = 0.01 pathUSD at 6 decimals)
  currency: string
  recipient: string
  route: string
  http_method: string
  memo: string | null
  block_number: number | null
  created_at: string // ISO
}

export type CallLog = ReturnType<typeof createCallLog>

export function createCallLog(dbPath: string) {
  mkdirSync(dirname(dbPath), { recursive: true })
  const db = new DatabaseSync(dbPath)
  db.exec(`
    CREATE TABLE IF NOT EXISTS calls (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      challenge_id TEXT NOT NULL UNIQUE,
      tx_hash TEXT NOT NULL,
      payer TEXT,
      amount TEXT NOT NULL,
      currency TEXT NOT NULL,
      recipient TEXT NOT NULL,
      route TEXT NOT NULL,
      http_method TEXT NOT NULL,
      memo TEXT,
      block_number INTEGER,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS calls_created_at ON calls(created_at);
    CREATE INDEX IF NOT EXISTS calls_payer ON calls(payer);
  `)

  const insert = db.prepare(`
    INSERT OR IGNORE INTO calls (challenge_id, tx_hash, payer, amount, currency, recipient, route, http_method, memo, block_number, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
  const enrich = db.prepare(`UPDATE calls SET payer = ?, block_number = ? WHERE tx_hash = ? AND payer IS NULL`)
  const list = db.prepare(`SELECT * FROM calls ORDER BY id DESC LIMIT ? OFFSET ?`)
  const byHash = db.prepare(`SELECT * FROM calls WHERE tx_hash = ?`)
  const stats = db.prepare(`
    SELECT
      COUNT(*) AS calls,
      COALESCE(SUM(CAST(amount AS INTEGER)), 0) AS revenue,
      COUNT(DISTINCT payer) AS payers,
      SUM(CASE WHEN created_at >= ? THEN 1 ELSE 0 END) AS calls_today,
      COALESCE(SUM(CASE WHEN created_at >= ? THEN CAST(amount AS INTEGER) ELSE 0 END), 0) AS revenue_today
    FROM calls
  `)
  const topPayers = db.prepare(`
    SELECT payer, COUNT(*) AS calls, SUM(CAST(amount AS INTEGER)) AS revenue
    FROM calls WHERE payer IS NOT NULL GROUP BY payer ORDER BY revenue DESC LIMIT ?
  `)

  return {
    insert(row: Omit<CallRow, 'id'>) {
      insert.run(
        row.challenge_id, row.tx_hash, row.payer, row.amount, row.currency, row.recipient,
        row.route, row.http_method, row.memo, row.block_number, row.created_at,
      )
    },
    enrich(txHash: string, payer: string, blockNumber: number | null) {
      enrich.run(payer, blockNumber, txHash)
    },
    list(limit = 50, offset = 0) {
      return list.all(limit, offset) as CallRow[]
    },
    get(txHash: string) {
      return byHash.get(txHash) as CallRow | undefined
    },
    stats() {
      const dayStart = new Date(); dayStart.setUTCHours(0, 0, 0, 0)
      const iso = dayStart.toISOString()
      return stats.get(iso, iso) as { calls: number; revenue: number; payers: number; calls_today: number; revenue_today: number }
    },
    topPayers(limit = 5) {
      return topPayers.all(limit) as { payer: string; calls: number; revenue: number }[]
    },
    close() { db.close() },
  }
}
