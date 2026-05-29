#!/usr/bin/env tsx
/**
 * scripts/import-ingredients.ts
 *
 * CSVファイルから成分マスタをPayload CMS / DBにインポートする。
 *
 * 使い方:
 *   pnpm tsx scripts/import-ingredients.ts --file data/seeds/ingredient_master.csv
 *
 * CSVフォーマット (ヘッダ行必須):
 *   slug,name_ja,name_en,cas_number,description_ja,evidence_level,safety_notes
 */

import fs from 'fs'
import path from 'path'
import { parse } from 'csv-parse/sync'

interface IngredientRow {
  slug: string
  name_ja: string
  name_en?: string
  cas_number?: string
  description_ja?: string
  evidence_level?: 'A' | 'B' | 'C'
  safety_notes?: string
}

async function main() {
  const args = process.argv.slice(2)
  const fileIdx = args.indexOf('--file')
  const filePath = fileIdx !== -1 ? args[fileIdx + 1] : 'data/seeds/ingredient_master.csv'

  if (!filePath || !fs.existsSync(filePath)) {
    console.error(`CSVファイルが見つかりません: ${filePath}`)
    process.exit(1)
  }

  const raw = fs.readFileSync(path.resolve(filePath), 'utf-8')
  const rows: IngredientRow[] = parse(raw, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  })

  console.warn(`📦 成分マスタ インポート開始: ${rows.length}件`)

  let inserted = 0
  let skipped = 0

  for (const row of rows) {
    if (!row.slug || !row.name_ja) {
      console.warn(`  ⚠️  スキップ: slug または name_ja が空 → ${JSON.stringify(row)}`)
      skipped++
      continue
    }

    // TODO: Payload CMS REST API または Drizzle ORM で upsert
    // 現状はドライランとして出力のみ
    console.warn(`  ✅ ${row.slug} — ${row.name_ja} (証拠レベル: ${row.evidence_level ?? '-'})`)
    inserted++
  }

  console.warn(`\n完了: ${inserted}件インポート、${skipped}件スキップ`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
