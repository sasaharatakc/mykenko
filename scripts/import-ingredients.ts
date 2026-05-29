/**
 * scripts/import-ingredients.ts
 * Usage: pnpm tsx scripts/import-ingredients.ts [--dry-run] [--file path/to/csv]
 *
 * CSVからingredientsテーブルにupsertします。
 * slug を一意キーとして ON CONFLICT DO UPDATE。
 */

import { parse } from 'csv-parse/sync'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { ingredients } from '@mykenko/db'
import { sql } from 'drizzle-orm'

// ── CLI args ──────────────────────────────────────────────
const args = process.argv.slice(2)
const isDryRun = args.includes('--dry-run')
const fileArgIdx = args.indexOf('--file')
const csvPath =
  fileArgIdx !== -1 && args[fileArgIdx + 1]
    ? resolve(args[fileArgIdx + 1])
    : resolve(process.cwd(), 'data/seeds/ingredient_master.csv')

// ── DB connection ─────────────────────────────────────────
const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) {
  console.error('❌  DATABASE_URL 環境変数が設定されていません')
  process.exit(1)
}

type EvidenceLevel = 'A' | 'B' | 'C'

interface IngredientRow {
  slug: string
  name_ja: string
  name_en?: string
  description_ja?: string
  evidence_level?: string
  cas_number?: string
  safety_notes?: string
  sort_order?: string
  is_published?: string
}

async function main() {
  console.log(`📂 CSV: ${csvPath}`)
  console.log(`🔧 Mode: ${isDryRun ? 'DRY RUN (DBへの書き込みなし)' : 'LIVE'}`)
  console.log('')

  // Parse CSV
  const raw = readFileSync(csvPath, 'utf-8')
  const rows: IngredientRow[] = parse(raw, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  })

  console.log(`📋 ${rows.length} 件のレコードを読み込みました`)

  if (isDryRun) {
    console.log('\n--- DRY RUN 出力 ---')
    for (const row of rows) {
      console.log(JSON.stringify(toRecord(row), null, 2))
    }
    console.log('\n✅ Dry run 完了 (DBへの書き込みなし)')
    return
  }

  // DB connection
  const client = postgres(DATABASE_URL)
  const db = drizzle(client)

  let inserted = 0
  let updated = 0
  let errored = 0

  for (const row of rows) {
    const record = toRecord(row)

    try {
      await db
        .insert(ingredients)
        .values(record)
        .onConflictDoUpdate({
          target: ingredients.slug,
          set: {
            nameJa: record.nameJa,
            nameEn: record.nameEn,
            descriptionJa: record.descriptionJa,
            evidenceLevel: record.evidenceLevel,
            casNumber: record.casNumber,
            safetyNotes: record.safetyNotes,
            sortOrder: record.sortOrder,
            isPublished: record.isPublished,
            updatedAt: sql`now()`,
          },
        })

      inserted++
      console.log(`  ✅ [${record.slug}] ${record.nameJa} (エビデンス: ${record.evidenceLevel ?? '-'})`)
    } catch (err) {
      errored++
      console.error(`  ❌ [${record.slug}] エラー:`, err instanceof Error ? err.message : err)
    }
  }

  await client.end()

  console.log(`\n📊 結果:`)
  console.log(`  処理: ${inserted}件`)
  console.log(`  エラー: ${errored}件`)

  if (errored > 0) {
    process.exit(1)
  }
}

function toRecord(row: IngredientRow) {
  const evidenceLevel = ['A', 'B', 'C'].includes(row.evidence_level ?? '')
    ? (row.evidence_level as EvidenceLevel)
    : null

  return {
    slug: row.slug,
    nameJa: row.name_ja,
    nameEn: row.name_en || null,
    descriptionJa: row.description_ja || null,
    evidenceLevel,
    casNumber: row.cas_number || null,
    safetyNotes: row.safety_notes || null,
    sortOrder: row.sort_order ? parseInt(row.sort_order, 10) : 0,
    isPublished: row.is_published?.toLowerCase() === 'true',
  }
}

main().catch((err) => {
  console.error('Fatal:', err)
  process.exit(1)
})
