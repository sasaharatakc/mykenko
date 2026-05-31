/**
 * db/init.js
 * SQLite データベース初期化
 *
 * 使い方: node db/init.js
 */

import Database from 'better-sqlite3';
import { mkdirSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_DIR = resolve(__dirname, '../data');
const DB_PATH = resolve(DB_DIR, 'price-monitor.db');

export function getDb() {
  if (!existsSync(DB_DIR)) mkdirSync(DB_DIR, { recursive: true });
  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  return db;
}

function init() {
  const db = getDb();

  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      product_code  TEXT PRIMARY KEY,
      product_url   TEXT NOT NULL,
      category      TEXT,
      name          TEXT,
      image_url     TEXT,
      created_at    TEXT DEFAULT (datetime('now')),
      updated_at    TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS price_snapshots (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      product_code  TEXT NOT NULL REFERENCES products(product_code),
      price_raw     TEXT,
      price_yen     REAL,
      in_stock      INTEGER,
      scraped_at    TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_snapshots_code_at
      ON price_snapshots(product_code, scraped_at DESC);

    CREATE TABLE IF NOT EXISTS price_changes (
      id                INTEGER PRIMARY KEY AUTOINCREMENT,
      product_code      TEXT NOT NULL REFERENCES products(product_code),
      product_name      TEXT,
      category          TEXT,
      old_price_raw     TEXT,
      new_price_raw     TEXT,
      old_price_yen     REAL,
      new_price_yen     REAL,
      change_yen        REAL,
      change_pct        REAL,
      detected_at       TEXT DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_changes_detected
      ON price_changes(detected_at DESC);
  `);

  db.close();
  console.log(`✅ DB 初期化完了: ${DB_PATH}`);
}

init();
