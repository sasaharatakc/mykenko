/**
 * scrape_playwright.js
 * osakadou.cool 商品データ スクレイパー（Playwright headless版）
 *
 * 実行前提:
 *   - ローカルMac上で実行（クラウド実行禁止）
 *   - 日本VPN接続済みであること
 *
 * 使い方:
 *   node scrape_playwright.js              # 全件取得（レジューム対応）
 *   node scrape_playwright.js --test       # 先頭200件のみテスト
 *   HEADLESS=false node scrape_playwright.js --test  # ブラウザ表示あり（デバッグ用）
 */

import { chromium } from 'playwright';
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── パス ──────────────────────────────────────────────────────────────────────
const DATA_DIR = resolve(__dirname, 'data');
const URLS_PATH = resolve(DATA_DIR, 'osakadou-product-urls.json');
const PRODUCTS_PATH = resolve(DATA_DIR, 'products.json');
const DONE_IDS_PATH = resolve(DATA_DIR, 'done_ids.json');
const MISSING_IDS_PATH = resolve(DATA_DIR, 'missing_ids.json');
const ERRORS_PATH = resolve(DATA_DIR, 'errors.json');

// ── 設定 ──────────────────────────────────────────────────────────────────────
const HEADLESS = process.env.HEADLESS !== 'false';
const TEST_MODE = process.argv.includes('--test');
const TEST_LIMIT = parseInt(process.env.TEST_LIMIT ?? '200', 10);
const CONCURRENCY = parseInt(process.env.CONCURRENCY ?? '3', 10);
const DELAY_MIN = parseInt(process.env.DELAY_MIN ?? '4000', 10);
const DELAY_MAX = parseInt(process.env.DELAY_MAX ?? '8000', 10);
const PAGE_TIMEOUT = parseInt(process.env.PAGE_TIMEOUT ?? '30000', 10);
const SAVE_EVERY = parseInt(process.env.SAVE_EVERY ?? '10', 10);

// ── ユーティリティ ────────────────────────────────────────────────────────────

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
  try {
    return JSON.parse(readFileSync(path, 'utf-8'));
  } catch {
    return fallback;
  }
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
      console.error('❌ IP国籍を取得できませんでした。クラウド環境からは実行できません。');
      console.error('   ローカルMac + 日本VPN接続済みの環境で実行してください。');
      process.exit(1);
    }
    if (country !== 'JP') {
      console.error(`❌ 日本VPNに接続してください（現在: ${country}）`);
      process.exit(1);
    }
    console.log('   ✅ JP IP 確認済み');
  } catch (err) {
    console.error('❌ IP確認失敗:', err.message);
    process.exit(1);
  }
}

// ── 状態読み込み ──────────────────────────────────────────────────────────────

function loadState() {
  const products = loadJson(PRODUCTS_PATH, []);
  const doneIds = new Set(loadJson(DONE_IDS_PATH, []));
  const missingIds = new Set(loadJson(MISSING_IDS_PATH, []));
  const errors = loadJson(ERRORS_PATH, []);

  // errors から再試行対象IDを抽出（最大3回まで）
  const retryIds = new Set(
    errors
      .filter((e) => (e.retryCount ?? 0) < 3 && !doneIds.has(e.id) && !missingIds.has(e.id))
      .map((e) => e.id)
  );

  console.log(`📂 レジューム状態:`);
  console.log(`   完了: ${doneIds.size}件 / 欠番: ${missingIds.size}件 / エラー再試行: ${retryIds.size}件`);

  return { products, doneIds, missingIds, errors, retryIds };
}

// ── 状態保存 ──────────────────────────────────────────────────────────────────

function saveState(state) {
  saveJson(PRODUCTS_PATH, state.products);
  saveJson(DONE_IDS_PATH, [...state.doneIds]);
  saveJson(MISSING_IDS_PATH, [...state.missingIds]);
  saveJson(ERRORS_PATH, state.errors);
}

// ── 商品データ抽出 ────────────────────────────────────────────────────────────

async function extractProduct(page, url) {
  // 商品名
  const name = await page
    .$eval(
      'h1.product-name, h1[class*="name"], h1[class*="title"], .product-name h1, .item-name, h1',
      (el) => el.textContent?.trim() ?? ''
    )
    .catch(() => '');

  // 価格（税込優先）
  const price = await page
    .$eval(
      '[class*="tax-included"], [class*="price-tax"], .price-tax, .price_including_tax, [class*="price"]:not([class*="original"]):not([class*="before"]):not([class*="base"])',
      (el) => el.textContent?.trim() ?? ''
    )
    .catch(async () => {
      return page
        .$eval('[class*="price"], .price', (el) => el.textContent?.trim() ?? '')
        .catch(() => '');
    });

  // 画像URL（絶対URL）
  const imageUrl = await page
    .$eval(
      '.product-image img, .main-image img, [class*="product"] img, [class*="item"] img',
      (el) => el.src ?? ''
    )
    .catch(async () => {
      return page.$eval('img[src*="/"]', (el) => el.src ?? '').catch(() => '');
    });

  // 在庫状態
  const inStock = await page
    .$eval(
      'button[class*="cart"], button[class*="buy"], .add-to-cart',
      (el) => !el.textContent?.includes('完売') && !el.className.includes('soldout') && !el.hasAttribute('disabled')
    )
    .catch(() => null);

  return { name, price, imageUrl, inStock };
}

// ── 単一ページ取得 ────────────────────────────────────────────────────────────

async function scrapeOne(browser, entry, state) {
  const { id, productUrl, category, title, productCode } = entry;
  const page = await browser.newPage();

  try {
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8',
    });

    const response = await page.goto(productUrl, {
      waitUntil: 'domcontentloaded',
      timeout: PAGE_TIMEOUT,
    });

    const status = response?.status() ?? 0;

    if (status === 404) {
      state.missingIds.add(id);
      console.log(`  ⬜ PROD-${id} 404 欠番`);
      return 'missing';
    }

    if (status === 403 || status === 429) {
      console.warn(`  ⚠️  PROD-${id} ${status} ブロック検出 — 収集を停止します`);
      return 'blocked';
    }

    if (status !== 200) {
      throw new Error(`HTTP ${status}`);
    }

    // Cloudflare チェック
    const pageTitle = await page.title();
    if (pageTitle.includes('Just a moment') || page.url().includes('challenge')) {
      console.warn(`  ⚠️  PROD-${id} Cloudflare検出 — 収集を停止します`);
      return 'blocked';
    }

    await page.waitForTimeout(1500);

    const extracted = await extractProduct(page, productUrl);

    if (!extracted.name && !extracted.price) {
      throw new Error('商品名・価格ともに取得できず');
    }

    const product = {
      id,
      productCode,
      productUrl,
      category,
      titleFromUrl: title,
      name: extracted.name,
      price: extracted.price,
      imageUrl: extracted.imageUrl,
      inStock: extracted.inStock,
      scrapedAt: new Date().toISOString(),
    };

    state.products.push(product);
    state.doneIds.add(id);

    // errors から削除
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
      state.errors.push({
        id,
        productUrl,
        error: err.message,
        lastError: err.message,
        retryCount: 1,
        lastAt: new Date().toISOString(),
      });
    }
    console.log(`  ❌ PROD-${id} エラー: ${err.message}`);
    return 'error';
  } finally {
    await page.close();
  }
}

// ── 並列バッチ処理 ─────────────────────────────────────────────────────────────

async function processBatch(browser, batch, state) {
  // concurrency=3 でチャンク分割
  for (let i = 0; i < batch.length; i += CONCURRENCY) {
    const chunk = batch.slice(i, i + CONCURRENCY);
    const results = await Promise.all(chunk.map((entry) => scrapeOne(browser, entry, state)));

    // ブロック検出時は全体停止
    if (results.includes('blocked')) {
      return 'blocked';
    }

    // N件ごとに保存
    if ((state.doneIds.size + state.missingIds.size) % SAVE_EVERY === 0) {
      saveState(state);
    }

    if (i + CONCURRENCY < batch.length) {
      await randomDelay();
    }
  }
  return 'ok';
}

// ── メイン ────────────────────────────────────────────────────────────────────

async function main() {
  console.log('='.repeat(60));
  console.log(` osakadou.cool 商品スクレイパー${TEST_MODE ? ' [テストモード: 先頭200件]' : ''}`);
  console.log('='.repeat(60));

  // 1. IP チェック
  await checkCountry();

  // 2. URLリスト読み込み
  if (!existsSync(URLS_PATH)) {
    console.error(`❌ ${URLS_PATH} が見つかりません。先に osakadou.js でURL収集を行ってください。`);
    process.exit(1);
  }
  const rawUrls = JSON.parse(readFileSync(URLS_PATH, 'utf-8'));
  if (rawUrls.length === 0) {
    console.error('❌ URLリストが空です。');
    process.exit(1);
  }

  // 内部IDを付与
  const allEntries = rawUrls.map((item, i) => ({ id: i + 1, ...item }));
  console.log(`📋 URLリスト: ${allEntries.length}件`);

  // 3. データ初期化・レジューム
  ensureDataDir();
  const state = loadState();

  // 4. 未処理エントリを選定
  let targets = allEntries.filter(
    (e) => !state.doneIds.has(e.id) && !state.missingIds.has(e.id)
  );

  if (TEST_MODE) {
    targets = targets.slice(0, TEST_LIMIT);
    console.log(`🧪 テストモード: ${targets.length}件を処理`);
  } else {
    console.log(`🚀 処理対象: ${targets.length}件（完了済み ${state.doneIds.size}件をスキップ）`);
  }

  if (targets.length === 0) {
    console.log('✅ 処理済みデータが揃っています。export.js でCSVを出力できます。');
    return;
  }

  // 5. ブラウザ起動
  console.log(`\n🌐 Playwright起動 (headless=${HEADLESS}, concurrency=${CONCURRENCY})`);
  const browser = await chromium.launch({
    headless: HEADLESS,
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  });

  try {
    const result = await processBatch(browser, targets, state);

    if (result === 'blocked') {
      console.warn('\n⚠️  ブロック検出により収集を停止しました。');
      console.warn('   しばらく待ってから再実行するか、VPN/IPを変更してください。');
    }
  } finally {
    await browser.close();
    saveState(state);
  }

  // 6. サマリー
  console.log('\n' + '='.repeat(60));
  console.log(' 収集レポート');
  console.log('='.repeat(60));
  console.log(`成功: ${state.doneIds.size}件`);
  console.log(`欠番: ${state.missingIds.size}件`);
  console.log(`エラー(再試行可): ${state.errors.filter((e) => (e.retryCount ?? 0) < 3).length}件`);
  console.log(`保存先: ${PRODUCTS_PATH}`);

  if (TEST_MODE) {
    console.log('\n✅ テスト完了。全件取得は npm run scrape:bg で実行できます。');
  }
}

main().catch((err) => {
  console.error('\n💥 Fatal:', err.message);
  process.exit(1);
});
