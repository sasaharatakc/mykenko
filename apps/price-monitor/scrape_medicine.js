/**
 * scrape_medicine.js
 * https://medicine.shop/ 商品データ スクレイパー（Playwright headless版）
 *
 * 実行方法:
 *   node scrape_medicine.js              # 全件取得（レジューム対応）
 *   node scrape_medicine.js --test       # 先頭200件のみ
 *   SKIP_IP_CHECK=true node scrape_medicine.js --test   # VPNなしでテスト
 *   HEADLESS=false node scrape_medicine.js --test       # ブラウザ表示あり
 */

import { chromium } from 'playwright';
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const DATA_DIR = resolve(__dirname, 'data');
const URLS_PATH = resolve(DATA_DIR, 'medicine-shop-product-urls.json');
const PRODUCTS_PATH = resolve(DATA_DIR, 'medicine-products.json');
const DONE_IDS_PATH = resolve(DATA_DIR, 'medicine-done-ids.json');
const MISSING_IDS_PATH = resolve(DATA_DIR, 'medicine-missing-ids.json');
const ERRORS_PATH = resolve(DATA_DIR, 'medicine-errors.json');

const HEADLESS = process.env.HEADLESS !== 'false';
const SKIP_IP_CHECK = process.env.SKIP_IP_CHECK === 'true';
const TEST_MODE = process.argv.includes('--test');
const TEST_LIMIT = parseInt(process.env.TEST_LIMIT ?? '200', 10);
const CONCURRENCY = parseInt(process.env.CONCURRENCY ?? '3', 10);
const DELAY_MIN = parseInt(process.env.DELAY_MIN ?? '3000', 10);
const DELAY_MAX = parseInt(process.env.DELAY_MAX ?? '7000', 10);
const PAGE_TIMEOUT = parseInt(process.env.PAGE_TIMEOUT ?? '30000', 10);
const SAVE_EVERY = parseInt(process.env.SAVE_EVERY ?? '10', 10);

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function randomDelay() {
  const ms = Math.floor(Math.random() * (DELAY_MAX - DELAY_MIN + 1)) + DELAY_MIN;
  return sleep(ms);
}

function ensureDataDir() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
}

function loadJson(path, fallback) {
  if (!existsSync(path)) return fallback;
  try { return JSON.parse(readFileSync(path, 'utf-8')); } catch { return fallback; }
}

function saveJson(path, data) {
  writeFileSync(path, JSON.stringify(data, null, 2));
}

// ── IP チェック ───────────────────────────────────────────────────────────────

async function checkCountry() {
  console.log('🌐 IP国籍を確認中...');
  try {
    const res = await fetch('https://ipinfo.io/country');
    const country = (await res.text()).trim();
    if (!/^[A-Z]{2}$/.test(country)) {
      if (SKIP_IP_CHECK) { console.warn('⚠️  IP取得不可 (スキップ)'); return; }
      console.error('❌ IP国籍を取得できませんでした'); process.exit(1);
    }
    console.log(`   検出された国: ${country}`);
    if (country !== 'JP') {
      if (SKIP_IP_CHECK) {
        console.warn(`⚠️  JP以外のIP（${country}）— SKIP_IP_CHECK=true のため続行`);
        return;
      }
      console.error(`❌ 日本VPNに接続してください（現在: ${country}）`);
      console.error('   VPN未接続でテスト: SKIP_IP_CHECK=true node scrape_medicine.js --test');
      process.exit(1);
    }
    console.log('   ✅ JP IP 確認済み');
  } catch (err) {
    if (SKIP_IP_CHECK) { console.warn('⚠️  IP確認スキップ'); return; }
    console.error('❌ IP確認失敗:', err.message); process.exit(1);
  }
}

// ── 状態管理 ──────────────────────────────────────────────────────────────────

function loadState() {
  const products = loadJson(PRODUCTS_PATH, []);
  const doneIds = new Set(loadJson(DONE_IDS_PATH, []));
  const missingIds = new Set(loadJson(MISSING_IDS_PATH, []));
  const errors = loadJson(ERRORS_PATH, []);
  const retryIds = new Set(
    errors
      .filter((e) => (e.retryCount ?? 0) < 3 && !doneIds.has(e.id) && !missingIds.has(e.id))
      .map((e) => e.id)
  );
  console.log(`📂 レジューム: 完了${doneIds.size}件 / 欠番${missingIds.size}件 / 再試行${retryIds.size}件`);
  return { products, doneIds, missingIds, errors, retryIds };
}

function saveState(state) {
  saveJson(PRODUCTS_PATH, state.products);
  saveJson(DONE_IDS_PATH, [...state.doneIds]);
  saveJson(MISSING_IDS_PATH, [...state.missingIds]);
  saveJson(ERRORS_PATH, state.errors);
}

// ── 商品データ抽出 ────────────────────────────────────────────────────────────

async function extractProduct(page) {
  // 商品名（medicine.shop のセレクタを調整可能）
  const name = await page.$eval(
    'h1.product-name, h1[class*="name"], h1[class*="title"], .itemName, .item-name, .product_name, h1',
    (el) => el.textContent?.trim() ?? ''
  ).catch(() => '');

  // 価格（税込優先）
  const price = await page.$eval(
    '[class*="tax"], [class*="taxIncl"], [class*="price-tax"], .price_including_tax, .itemPrice, [class*="selling"]:not([class*="before"])',
    (el) => el.textContent?.trim() ?? ''
  ).catch(async () =>
    page.$eval('[class*="price"], .price, .item-price', (el) => el.textContent?.trim() ?? '').catch(() => '')
  );

  // 画像URL
  const imageUrl = await page.$eval(
    '.productImage img, .item-image img, .main-image img, [class*="product"] img, [class*="item"] img',
    (el) => el.src ?? ''
  ).catch(async () =>
    page.$eval('img[src*="item"], img[src*="product"], img[src*="goods"]', (el) => el.src ?? '').catch(() => '')
  );

  // 在庫
  const inStock = await page.$eval(
    'button[class*="cart"], .addToCart, .btn-cart, [class*="buy"]',
    (el) => !el.disabled && !el.className.includes('sold') && !el.textContent?.includes('完売')
  ).catch(() => null);

  // JANコード（あれば）
  const janCode = await page.$eval(
    '[class*="jan"], [class*="ean"], [data-jan]',
    (el) => el.textContent?.trim() ?? el.dataset?.jan ?? ''
  ).catch(() => '');

  return { name, price, imageUrl, inStock, janCode };
}

// ── 単一ページ取得 ────────────────────────────────────────────────────────────

async function scrapeOne(browser, entry, state) {
  const { id, productUrl, category, title, productCode } = entry;
  const page = await browser.newPage();

  try {
    await page.setExtraHTTPHeaders({ 'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8' });

    const response = await page.goto(productUrl, {
      waitUntil: 'domcontentloaded',
      timeout: PAGE_TIMEOUT,
    });
    const status = response?.status() ?? 0;

    if (status === 404) {
      state.missingIds.add(id);
      console.log(`  ⬜ PROD-${id} 404`);
      return 'missing';
    }
    if (status === 403 || status === 429) {
      console.warn(`  ⚠️  PROD-${id} ${status} ブロック`);
      return 'blocked';
    }
    if (status !== 200) throw new Error(`HTTP ${status}`);

    const pageTitle = await page.title();
    if (pageTitle.includes('Just a moment') || page.url().includes('challenge')) {
      console.warn(`  ⚠️  PROD-${id} Cloudflare検出`);
      return 'blocked';
    }

    await page.waitForTimeout(1500);
    const extracted = await extractProduct(page);

    if (!extracted.name && !extracted.price) {
      throw new Error('商品名・価格ともに取得できず');
    }

    state.products.push({
      id,
      productCode,
      productUrl,
      category,
      titleFromUrl: title,
      name: extracted.name,
      price: extracted.price,
      imageUrl: extracted.imageUrl,
      inStock: extracted.inStock,
      janCode: extracted.janCode,
      scrapedAt: new Date().toISOString(),
    });
    state.doneIds.add(id);
    state.errors = state.errors.filter((e) => e.id !== id);

    console.log(`  ✅ PROD-${id} ${extracted.name.slice(0, 30)} / ${extracted.price}`);
    return 'ok';
  } catch (err) {
    const existing = state.errors.find((e) => e.id === id);
    if (existing) {
      existing.retryCount = (existing.retryCount ?? 0) + 1;
      existing.lastError = err.message;
      existing.lastAt = new Date().toISOString();
    } else {
      state.errors.push({ id, productUrl, error: err.message, lastError: err.message, retryCount: 1, lastAt: new Date().toISOString() });
    }
    console.log(`  ❌ PROD-${id} ${err.message}`);
    return 'error';
  } finally {
    await page.close();
  }
}

// ── 並列バッチ処理 ─────────────────────────────────────────────────────────────

async function processBatch(browser, batch, state) {
  for (let i = 0; i < batch.length; i += CONCURRENCY) {
    const chunk = batch.slice(i, i + CONCURRENCY);
    const results = await Promise.all(chunk.map((e) => scrapeOne(browser, e, state)));
    if (results.includes('blocked')) return 'blocked';
    if ((state.doneIds.size + state.missingIds.size) % SAVE_EVERY === 0) saveState(state);
    if (i + CONCURRENCY < batch.length) await randomDelay();
  }
  return 'ok';
}

// ── メイン ────────────────────────────────────────────────────────────────────

async function main() {
  console.log('='.repeat(60));
  console.log(` medicine.shop スクレイパー${TEST_MODE ? ' [テスト: 先頭200件]' : ''}`);
  console.log('='.repeat(60));

  await checkCountry();

  if (!existsSync(URLS_PATH)) {
    console.error(`❌ ${URLS_PATH} が見つかりません。`);
    console.error('   まず URL収集: node src/crawlers/medicine-shop-urls.js');
    process.exit(1);
  }

  const rawUrls = JSON.parse(readFileSync(URLS_PATH, 'utf-8'));
  if (rawUrls.length === 0) {
    console.error('❌ URLリストが空です。medicine-shop-urls.js を再実行してください。');
    process.exit(1);
  }

  const allEntries = rawUrls.map((item, i) => ({ id: i + 1, ...item }));
  console.log(`📋 URLリスト: ${allEntries.length}件`);

  ensureDataDir();
  const state = loadState();

  let targets = allEntries.filter(
    (e) => !state.doneIds.has(e.id) && !state.missingIds.has(e.id)
  );
  if (TEST_MODE) targets = targets.slice(0, TEST_LIMIT);

  console.log(`🚀 処理対象: ${targets.length}件`);
  if (targets.length === 0) {
    console.log('✅ 全件処理済み。npm run export:medicine でCSV出力できます。');
    return;
  }

  console.log(`\n🌐 Playwright起動 (headless=${HEADLESS}, concurrency=${CONCURRENCY})`);
  const browser = await chromium.launch({
    headless: HEADLESS,
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  });

  try {
    const result = await processBatch(browser, targets, state);
    if (result === 'blocked') {
      console.warn('\n⚠️  ブロック検出。しばらく待ってから再実行してください。');
    }
  } finally {
    await browser.close();
    saveState(state);
  }

  console.log('\n' + '='.repeat(60));
  console.log(` レポート: 成功${state.doneIds.size}件 / 欠番${state.missingIds.size}件 / エラー${state.errors.length}件`);
  console.log('='.repeat(60));
  if (TEST_MODE) console.log('\n✅ テスト完了。全件: npm run scrape:medicine:bg');
}

main().catch((err) => {
  console.error('\n💥 Fatal:', err.message);
  process.exit(1);
});
