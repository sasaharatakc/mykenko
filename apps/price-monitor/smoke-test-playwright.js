/**
 * smoke-test-playwright.js
 * 1件だけ取得して構造を確認するスモークテスト
 *
 * 使い方:
 *   node smoke-test-playwright.js           # data/osakadou-product-urls.json の先頭1件
 *   node smoke-test-playwright.js 146       # インデックス146番目の商品
 *   HEADLESS=false node smoke-test-playwright.js  # ブラウザ表示あり
 */

import { chromium } from 'playwright';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const URLS_PATH = resolve(__dirname, 'data/osakadou-product-urls.json');
const HEADLESS = process.env.HEADLESS !== 'false';

async function checkCountry() {
  try {
    const res = await fetch('https://ipinfo.io/country');
    const country = (await res.text()).trim();
    if (!/^[A-Z]{2}$/.test(country)) {
      console.error('❌ IP国籍を取得できませんでした。ネットワーク接続を確認してください。');
      process.exit(1);
    }
    if (country !== 'JP') {
      console.error(`❌ 日本VPNに接続してください（現在: ${country}）`);
      process.exit(1);
    }
    console.log('✅ JP IP 確認済み');
  } catch (err) {
    console.error('❌ IP確認失敗:', err.message);
    process.exit(1);
  }
}

async function main() {
  await checkCountry();

  if (!existsSync(URLS_PATH)) {
    console.error(`❌ ${URLS_PATH} が見つかりません。先に osakadou.js を実行してください。`);
    process.exit(1);
  }

  const urls = JSON.parse(readFileSync(URLS_PATH, 'utf-8'));
  if (urls.length === 0) {
    console.error('❌ URLリストが空です。');
    process.exit(1);
  }

  const idx = parseInt(process.argv[2] ?? '1', 10);
  const target = urls[idx - 1] ?? urls[0];
  console.log(`\n🧪 スモークテスト: PROD-${idx} / ${target.productUrl}`);
  console.log(`   カテゴリ: ${target.category}`);

  const browser = await chromium.launch({
    headless: HEADLESS,
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  });

  try {
    const page = await browser.newPage();
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8',
    });

    console.log(`\n📡 アクセス中...`);
    const response = await page.goto(target.productUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });
    const status = response?.status() ?? 0;
    console.log(`   HTTPステータス: ${status}`);

    if (status === 404) {
      console.log('   → 404 欠番');
      return;
    }
    if (status !== 200) {
      console.log(`   → 予期しないステータス: ${status}`);
      return;
    }

    await page.waitForTimeout(2000);

    // medicine.shop DOM（判明済み）: .total-price.new / .new_price / .per-tablet-price / [data-price]
    const name = await page.$eval('h1', (el) => el.textContent?.trim() ?? '').catch(() => '');

    const price = await page.evaluate(() => {
      for (const s of ['.total-price.new', '.new_price', '.per-tablet-price']) {
        const t = document.querySelector(s)?.textContent?.trim();
        if (t) return t;
      }
      return '';
    }).catch(() => '');

    const oldPrice = await page.$eval('.old_price', (el) => el.textContent?.trim() ?? '').catch(() => '');
    const perTablet = await page.$eval('.per-tablet-price', (el) => el.textContent?.trim() ?? '').catch(() => '');

    const variants = await page.evaluate(() =>
      Array.from(document.querySelectorAll('[data-price]')).map((b) => ({
        label: b.textContent?.trim(),
        price: b.getAttribute('data-price'),
      }))
    ).catch(() => []);

    const imageUrl = await page
      .$eval('meta[property="og:image"]', (el) => el.getAttribute('content') ?? '')
      .catch(async () => page.$eval('main img, article img', (el) => el.src ?? '').catch(() => ''));

    const inStock = await page.evaluate(() => {
      const body = document.body.innerText;
      if (body.includes('完売') || body.includes('在庫なし')) return false;
      return !!document.querySelector('[data-price], button[class*="cart"]');
    }).catch(() => null);

    console.log('\n📦 抽出結果:');
    console.log(`   商品名      : ${name || '(取得できず)'}`);
    console.log(`   価格(新)    : ${price || '(取得できず)'}`);
    console.log(`   価格(旧)    : ${oldPrice || '-'}`);
    console.log(`   1錠あたり   : ${perTablet || '-'}`);
    console.log(`   バリアント  : ${variants.length}件 ${JSON.stringify(variants.slice(0, 3))}`);
    console.log(`   画像URL     : ${imageUrl || '(取得できず)'}`);
    console.log(`   在庫        : ${inStock === null ? '(不明)' : inStock ? '○' : '×'}`);

    if (!name && !price) {
      console.log('\n⚠️ 商品名・価格ともに取得できませんでした。');
      console.log('   HEADLESS=false で確認してください。');
    } else {
      console.log('\n✅ スモークテスト成功');
    }
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error('💥 Fatal:', err.message);
  process.exit(1);
});
