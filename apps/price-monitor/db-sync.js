/**
 * db-sync.js
 * data/medicine-products.json を SQLite に同期し、価格変動を検知する
 *
 * 使い方:
 *   node db-sync.js                        # 同期のみ
 *   node db-sync.js --detect-changes       # 同期 + 変動検知
 */

import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { getDb } from './db/init.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PRODUCTS_PATH = resolve(__dirname, 'data/medicine-products.json');
const DETECT = process.argv.includes('--detect-changes');

// 「¥1,980」「1980円」などから数値を抽出
function parsePrice(raw) {
  if (!raw) return null;
  const m = raw.replace(/[,，]/g, '').match(/[\d]+(\.\d+)?/);
  return m ? parseFloat(m[0]) : null;
}

function upsertProducts(db, products) {
  const upsert = db.prepare(`
    INSERT INTO products (product_code, product_url, category, name, image_url, updated_at)
    VALUES (@product_code, @product_url, @category, @name, @image_url, datetime('now'))
    ON CONFLICT(product_code) DO UPDATE SET
      name       = excluded.name,
      category   = excluded.category,
      image_url  = excluded.image_url,
      updated_at = datetime('now')
  `);

  const insertSnapshot = db.prepare(`
    INSERT INTO price_snapshots (product_code, price_raw, price_yen, in_stock, scraped_at)
    VALUES (@product_code, @price_raw, @price_yen, @in_stock, @scraped_at)
  `);

  const batch = db.transaction((products) => {
    for (const p of products) {
      upsert.run({
        product_code: p.productCode,
        product_url:  p.productUrl,
        category:     p.category ?? '',
        name:         p.name ?? '',
        image_url:    p.imageUrl ?? '',
      });
      insertSnapshot.run({
        product_code: p.productCode,
        price_raw:    p.price ?? '',
        price_yen:    parsePrice(p.price),
        in_stock:     p.inStock === true ? 1 : p.inStock === false ? 0 : null,
        scraped_at:   p.scrapedAt ?? new Date().toISOString(),
      });
    }
  });

  batch(products);
}

function detectChanges(db) {
  // 各商品の最新2件のスナップショットを比較
  const changed = db.prepare(`
    WITH ranked AS (
      SELECT
        ps.product_code,
        ps.price_raw,
        ps.price_yen,
        ps.scraped_at,
        ROW_NUMBER() OVER (PARTITION BY ps.product_code ORDER BY ps.scraped_at DESC) AS rn
      FROM price_snapshots ps
    ),
    latest  AS (SELECT * FROM ranked WHERE rn = 1),
    prev    AS (SELECT * FROM ranked WHERE rn = 2)
    SELECT
      l.product_code,
      p2.name,
      p2.category,
      prev.price_raw  AS old_price_raw,
      latest.price_raw AS new_price_raw,
      prev.price_yen  AS old_price_yen,
      latest.price_yen AS new_price_yen
    FROM latest
    LEFT JOIN prev    ON latest.product_code = prev.product_code
    JOIN products p2  ON latest.product_code = p2.product_code
    WHERE
      prev.price_raw IS NOT NULL
      AND latest.price_raw != prev.price_raw
      AND latest.price_yen IS NOT NULL
      AND prev.price_yen IS NOT NULL
  `).all();

  if (changed.length === 0) {
    console.log('💰 価格変動: なし');
    return [];
  }

  const insertChange = db.prepare(`
    INSERT INTO price_changes
      (product_code, product_name, category, old_price_raw, new_price_raw,
       old_price_yen, new_price_yen, change_yen, change_pct)
    VALUES
      (@product_code, @product_name, @category, @old_price_raw, @new_price_raw,
       @old_price_yen, @new_price_yen, @change_yen, @change_pct)
  `);

  const results = [];
  for (const row of changed) {
    const changeYen = row.new_price_yen - row.old_price_yen;
    const changePct = (changeYen / row.old_price_yen) * 100;
    insertChange.run({
      product_code:  row.product_code,
      product_name:  row.name,
      category:      row.category,
      old_price_raw: row.old_price_raw,
      new_price_raw: row.new_price_raw,
      old_price_yen: row.old_price_yen,
      new_price_yen: row.new_price_yen,
      change_yen:    changeYen,
      change_pct:    changePct,
    });
    results.push({ ...row, changeYen, changePct });
  }

  return results;
}

async function main() {
  if (!existsSync(PRODUCTS_PATH)) {
    console.error(`❌ ${PRODUCTS_PATH} が見つかりません。先にスクレイプを実行してください。`);
    process.exit(1);
  }

  const products = JSON.parse(readFileSync(PRODUCTS_PATH, 'utf-8'));
  if (products.length === 0) {
    console.error('❌ products が空です。');
    process.exit(1);
  }

  console.log(`📦 ${products.length}件を SQLite に同期中...`);
  const db = getDb();

  upsertProducts(db, products);
  console.log(`✅ 同期完了: ${products.length}件`);

  if (DETECT) {
    console.log('\n🔍 価格変動を検知中...');
    const changes = detectChanges(db);

    if (changes.length > 0) {
      console.log(`\n⚡ 価格変動 ${changes.length}件:`);
      for (const c of changes) {
        const sign = c.changeYen > 0 ? '▲' : '▼';
        console.log(
          `  ${sign} ${c.name ?? c.product_code} | ${c.old_price_raw} → ${c.new_price_raw}` +
          ` (${c.changeYen > 0 ? '+' : ''}${Math.round(c.changeYen)}円 / ${c.changePct.toFixed(1)}%)`
        );
      }
    }
  }

  db.close();
}

main().catch((err) => {
  console.error('💥 Fatal:', err.message);
  process.exit(1);
});
