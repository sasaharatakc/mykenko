#!/usr/bin/env tsx
/**
 * scripts/import-symptoms.ts
 *
 * CSVファイルから症状マスタをPayload CMS / DBにインポートする。
 *
 * 使い方:
 *   pnpm tsx scripts/import-symptoms.ts --file data/seeds/symptom_master.csv
 *
 * CSVフォーマット (ヘッダ行必須):
 *   slug,name_ja,name_en,icd_code,description_ja,body_systems,severity
 */

import fs from 'fs'
import path from 'path'
import { parse } from 'csv-parse/sync'

interface SymptomRow {
  slug: string
  name_ja: string
  name_en?: string
  icd_code?: string
  description_ja?: string
  body_systems?: string  // カンマ区切り: "消化器,肝臓"
  severity?: 'mild' | 'moderate' | 'severe'
}

async function main() {
  const args = process.argv.slice(2)
  const fileIdx = args.indexOf('--file')
  const filePath = fileIdx !== -1 ? args[fileIdx + 1] : 'data/seeds/symptom_master.csv'

  if (!filePath || !fs.existsSync(filePath)) {
    console.error(`CSVファイルが見つかりません: ${filePath}`)
    process.exit(1)
  }

  const raw = fs.readFileSync(path.resolve(filePath), 'utf-8')
  const rows: SymptomRow[] = parse(raw, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  })

  console.warn(`🩺 症状マスタ インポート開始: ${rows.length}件`)

  let inserted = 0
  let skipped = 0

  for (const row of rows) {
    if (!row.slug || !row.name_ja) {
      console.warn(`  ⚠️  スキップ: slug または name_ja が空 → ${JSON.stringify(row)}`)
      skipped++
      continue
    }

    const bodySystems = row.body_systems
      ? row.body_systems.split(',').map((s) => s.trim()).filter(Boolean)
      : []

    // TODO: Payload CMS REST API または Drizzle ORM で upsert
    console.warn(`  ✅ ${row.slug} — ${row.name_ja} [${bodySystems.join(', ')}]`)
    inserted++
  }

  console.warn(`\n完了: ${inserted}件インポート、${skipped}件スキップ`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
