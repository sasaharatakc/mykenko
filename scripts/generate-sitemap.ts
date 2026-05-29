#!/usr/bin/env tsx
/**
 * scripts/generate-sitemap.ts
 *
 * DBから全公開ページを取得してsitemap.xmlを生成する。
 * Next.js の app/sitemap.ts と連携、またはスタンドアロンで実行。
 *
 * 使い方:
 *   pnpm tsx scripts/generate-sitemap.ts --out public/sitemap.xml
 */

import fs from 'fs'
import path from 'path'

interface SitemapEntry {
  url: string
  lastmod?: string
  changefreq?: string
  priority?: number
}

function buildXml(entries: SitemapEntry[]): string {
  const items = entries
    .map((e) => {
      const parts = [`  <url>`, `    <loc>${e.url}</loc>`]
      if (e.lastmod) parts.push(`    <lastmod>${e.lastmod}</lastmod>`)
      if (e.changefreq) parts.push(`    <changefreq>${e.changefreq}</changefreq>`)
      if (e.priority !== undefined) parts.push(`    <priority>${e.priority}</priority>`)
      parts.push(`  </url>`)
      return parts.join('\n')
    })
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${items}\n</urlset>`
}

async function main() {
  const args = process.argv.slice(2)
  const outIdx = args.indexOf('--out')
  const outPath = outIdx !== -1 ? args[outIdx + 1] : 'public/sitemap.xml'

  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mykenko.jp'
  const today = new Date().toISOString().split('T')[0]

  // TODO: DBからslugsを取得してエントリを動的生成
  const staticEntries: SitemapEntry[] = [
    { url: `${base}/`, lastmod: today, changefreq: 'daily', priority: 1.0 },
    { url: `${base}/symptoms/`, lastmod: today, changefreq: 'daily', priority: 0.9 },
    { url: `${base}/ingredients/`, lastmod: today, changefreq: 'weekly', priority: 0.9 },
    { url: `${base}/products/`, lastmod: today, changefreq: 'daily', priority: 0.8 },
    { url: `${base}/about/`, lastmod: today, changefreq: 'monthly', priority: 0.5 },
  ]

  const xml = buildXml(staticEntries)
  const outDir = path.dirname(path.resolve(outPath))
  fs.mkdirSync(outDir, { recursive: true })
  fs.writeFileSync(path.resolve(outPath), xml, 'utf-8')

  console.warn(`✅ Sitemap生成完了: ${outPath} (${staticEntries.length}件)`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
