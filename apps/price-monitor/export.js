/**
 * export.js
 * data/products.json → data/products.csv に変換
 *
 * 使い方:
 *   node export.js
 *   node export.js --output results/products.csv
 */

import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = resolve(__dirname, 'data');
const PRODUCTS_PATH = resolve(DATA_DIR, 'products.json');

function escapeCsv(val) {
  if (val === null || val === undefined) return '';
  const s = String(val);
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function toRow(fields) {
  return fields.map(escapeCsv).join(',');
}

async function main() {
  if (!existsSync(PRODUCTS_PATH)) {
    console.error(`❌ ${PRODUCTS_PATH} が見つかりません。先に scrape_playwright.js を実行してください。`);
    process.exit(1);
  }

  const products = JSON.parse(readFileSync(PRODUCTS_PATH, 'utf-8'));
  if (products.length === 0) {
    console.error('❌ products.json が空です。');
    process.exit(1);
  }

  // 出力パス
  const outputArg = process.argv.indexOf('--output');
  const outputPath =
    outputArg !== -1
      ? resolve(process.cwd(), process.argv[outputArg + 1])
      : resolve(DATA_DIR, 'products.csv');

  // ヘッダー
  const headers = ['id', 'productCode', 'category', 'name', 'price', 'imageUrl', 'inStock', 'productUrl', 'scrapedAt'];

  const rows = [
    toRow(headers),
    ...products.map((p) =>
      toRow([
        p.id,
        p.productCode,
        p.category,
        p.name,
        p.price,
        p.imageUrl,
        p.inStock,
        p.productUrl,
        p.scrapedAt,
      ])
    ),
  ];

  const dir = resolve(outputPath, '..');
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

  writeFileSync(outputPath, rows.join('\n') + '\n');

  console.log(`✅ CSV出力完了: ${outputPath}`);
  console.log(`   ${products.length}件`);

  // サマリー
  const categories = {};
  for (const p of products) {
    categories[p.category] = (categories[p.category] ?? 0) + 1;
  }
  console.log('\nカテゴリ別件数:');
  for (const [cat, count] of Object.entries(categories).sort((a, b) => b[1] - a[1])) {
    console.log(`   ${cat}: ${count}件`);
  }
}

main().catch((err) => {
  console.error('💥 Fatal:', err.message);
  process.exit(1);
});
