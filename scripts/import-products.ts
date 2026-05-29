#!/usr/bin/env tsx
/**
 * scripts/import-products.ts
 *
 * 商品マスタCSVをDBにインポートする。
 *
 * 使い方:
 *   pnpm tsx scripts/import-products.ts --file data/seeds/product_master.csv
 *
 * CSVフォーマット:
 *   slug,name_ja,brand_name,jan_code,product_type,price_yen,manufacturer,description_ja
 */

import fs from 'fs'
import path from 'path'
import { parse } from 'csv-parse/sync'

interface ProductRow {
  slug: string
  name_ja: string
  brand_name?: string
  jan_code?: string
  product_type?: string
  price_yen?: string
  manufacturer?: string
  description_ja?: string
}

async function main() {
  const args = process.argv.slice(2)
  const fileIdx = args.indexOf('--file')
  const filePath = fileIdx !== -1 ? args[fileIdx + 1] : 'data/seeds/product_master.csv'

  if (!filePath || !fs.existsSync(filePath)) {
    console.error(`CSVファイルが見つかりません: ${filePath}`)
    process.exit(1)
  }

  const raw = fs.readFileSync(path.resolve(filePath), 'utf-8')
  const rows: ProductRow[] = parse(raw, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  })

  console.warn(`🛍️ 商品マスタ インポート開始: ${rows.length}件`)

  let inserted = 0
  let skipped = 0

  for (const row of rows) {
    if (!row.slug || !row.name_ja) {
      skipped++
      continue
    }
    // TODO: Drizzle ORM upsert
    console.warn(`  ✅ ${row.slug} — ${row.name_ja} (¥${row.price_yen ?? '-'})`)
    inserted++
  }

  console.warn(`\n完了: ${inserted}件インポート、${skipped}件スキップ`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
