/**
 * scripts/import-symptoms.ts
 * Usage: pnpm tsx scripts/import-symptoms.ts [--dry-run] [--file path/to/csv]
 *
 * CSVからsymptomsテーブルにupsertします。
 * slug を一意キーとして ON CONFLICT DO UPDATE。
 */

import { parse } from 'csv-parse/sync'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { symptoms } from '@mykenko/db'
import { sql } from 'drizzle-orm'

// ── CLI args ──────────────────────────────────────────────
const args = process.argv.slice(2)
const isDryRun = args.includes('--dry-run')
const fileArgIdx = args.indexOf('--file')
const csvPath =
  fileArgIdx !== -1 && args[fileArgIdx + 1]
    ? resolve(args[fileArgIdx + 1])
    : resolve(process.cwd(), 'data/seeds/symptom_master.csv')

// ── DB connection ─────────────────────────────────────────
const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) {
  console.error('❌  DATABASE_URL 環境変数が設定されていません')
  process.exit(1)
}

interface SymptomRow {
  slug: string
  name_ja: string
  name_en?: string
  description_ja?: string
  body_systems?: string
  icd_code?: string
  severity?: string
  is_published?: string
}

async function main() {
  console.log(`📂 CSV: ${csvPath}`)
  console.log(`🔧 Mode: ${isDryRun ? 'DRY RUN (DBへの書き込みなし)' : 'LIVE'}`)
  console.log('')

  // Parse CSV
  const raw = readFileSync(csvPath, 'utf-8')
  const rows: SymptomRow[] = parse(raw, {
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
      const result = await db
        .insert(symptoms)
        .values(record)
        .onConflictDoUpdate({
          target: symptoms.slug,
          set: {
            nameJa: record.nameJa,
            nameEn: record.nameEn,
            descriptionJa: record.descriptionJa,
            bodySystems: record.bodySystems,
            icdCode: record.icdCode,
            severity: record.severity,
            isPublished: record.isPublished,
            updatedAt: sql`now()`,
          },
        })
        .returning({ isNew: symptoms.createdAt })

      // If createdAt matches (within 1s), it was an insert; otherwise update
      const wasInserted = result.length > 0
      if (wasInserted) inserted++
      else updated++

      console.log(`  ✅ [${record.slug}] ${record.nameJa}`)
    } catch (err) {
      errored++
      console.error(`  ❌ [${record.slug}] エラー:`, err instanceof Error ? err.message : err)
    }
  }

  await client.end()

  console.log(`\n📊 結果:`)
  console.log(`  挿入: ${inserted}件`)
  console.log(`  更新: ${updated}件`)
  console.log(`  エラー: ${errored}件`)

  if (errored > 0) {
    process.exit(1)
  }
}

function toRecord(row: SymptomRow) {
  return {
    slug: row.slug,
    nameJa: row.name_ja,
    nameEn: row.name_en || null,
    descriptionJa: row.description_ja || null,
    bodySystems: row.body_systems
      ? (row.body_systems.split('|').map((s) => s.trim()) as string[])
      : [],
    icdCode: row.icd_code || null,
    severity: row.severity || null,
    isPublished: row.is_published?.toLowerCase() === 'true',
  }
}

main().catch((err) => {
  console.error('Fatal:', err)
  process.exit(1)
})
