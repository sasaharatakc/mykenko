/**
 * scrape_osakadou.js
 * https://osakadou.cool/ 商品詳細スクレイパー（CDP版 — ローカルMac専用）
 *
 * 前提条件:
 *   1. 日本VPN接続済み
 *   2. Chrome をデバッグポートで起動済み:
 *        /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
 *          --remote-debugging-port=9222 \
 *          --user-data-dir="$HOME/chrome-osakadou"
 *
 * 実行方法:
 *   node scrape_osakadou.js              # data/osakadou-product-urls.json から全件
 *   node scrape_osakadou.js --test       # 先頭20件のみ
 *   node scrape_osakadou.js --url "https://osakadou.cool/detail/010648_viagra50mg.html"
 *                                        # 単一URL指定
 */

import { chromium } from 'playwright';
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = resolve(__dirname, 'data');
const URLS_PATH = resolve(DATA_DIR, 'osakadou-product-urls.json');
const PRODUCTS_PATH = resolve(DATA_DIR, 'osakadou-products.json');
const DONE_IDS_PATH = resolve(DATA_DIR, 'osakadou-done-ids.json');
const ERRORS_PATH = resolve(DATA_DIR, 'osakadou-errors.json');

const CDP_URL = 'http://127.0.0.1:9222';
const DELAY_MIN = 4000;
const DELAY_MAX = 9000;
const PAGE_TIMEOUT = 30000;
const SAVE_EVERY = 5;

const TEST_MODE = process.argv.includes('--test');
const TEST_LIMIT = parseInt(process.env.TEST_LIMIT ?? '20', 10);
const SINGLE_URL = (() => {
  const idx = process.argv.indexOf('--url');
  return idx !== -1 ? process.argv[idx + 1] : null;
})();

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

// ── IP確認 ────────────────────────────────────────────────────────────────────

async function checkCountry() {
  console.log('🌐 IP国籍を確認中...');
  const res = await fetch('https://ipinfo.io/country').catch(() => null);
  const country = res ? (await res.text()).trim() : '';
  if (country !== 'JP') {
    console.error(`❌ 日本VPN未接続（${country || '取得失敗'}）`);
    console.error('   日本VPNに接続後、再実行してください。');
    process.exit(1);
  }
  console.log('   ✅ JP IP 確認済み');
}

// ── CDP 接続 ──────────────────────────────────────────────────────────────────

async function connectCDP() {
  console.log(`🔌 Chrome CDP 接続中: ${CDP_URL}`);
  try {
    const browser = await chromium.connectOverCDP(CDP_URL);
    const ctx = browser.contexts()[0] ?? await browser.newContext();
    const page = ctx.pages()[0] ?? await ctx.newPage();
    console.log('   ✅ CDP 接続成功');
    return { browser, page };
  } catch (err) {
    console.error(`❌ CDP 接続失敗: ${err.message}`);
    console.error('   Chrome をデバッグポートで起動してください:');
    console.error('   /Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome \\');
    console.error('     --remote-debugging-port=9222 \\');
    console.error('     --user-data-dir="$HOME/chrome-osakadou"');
    process.exit(1);
  }
}

// ── 商品データ抽出 ─────────────────────────────────────────────────────────────
// DOM構造（osakadou.cool /detail/*.html より判明済み）:
//   商品名: h1.product-name または h1 最初のテキスト
//   価格:   .price, .item-price, [class*="price"] の数値テキスト
//   バリアント: #OS\d+ hash → .option-list / select などの選択肢
//   在庫:   .stock, .soldout, .out-of-stock テキストで判定

async function extractProduct(page, productUrl) {
  // 商品名
  const name = await page.evaluate(() => {
    const h1 = document.querySelector('h1');
    return h1?.textContent?.trim() ?? '';
  }).catch(() => '');

  // 価格（複数セレクタを試行）
  const priceInfo = await page.evaluate(() => {
    const candidates = [
      '.price-value',
      '.item-price',
      '.product-price',
      '[class*="price"]',
      '.price',
    ];
    for (const sel of candidates) {
      const el = document.querySelector(sel);
      const t = el?.textContent?.trim() ?? '';
      if (t && /[\d,円¥]/.test(t)) return t;
    }
    // フォールバック: テキスト全体から価格パターンを抽出
    const body = document.body.innerText;
    const m = body.match(/[\¥￥]?[\d,]+\s*円/);
    return m ? m[0].trim() : '';
  }).catch(() => '');

  // 旧価格（値引き前）
  const oldPrice = await page.evaluate(() => {
    const sel = ['.old-price', '.original-price', '.strike', 's', 'del'];
    for (const s of sel) {
      const el = document.querySelector(s);
      const t = el?.textContent?.trim() ?? '';
      if (t && /[\d,]/.test(t)) return t;
    }
    return '';
  }).catch(() => '');

  // バリアント・オプション（#OS03346 のような hash で選択されるもの）
  const variants = await page.evaluate(() => {
    // select要素
    const selectOpts = Array.from(document.querySelectorAll('select option')).map((o) => ({
      id: o.value,
      label: o.textContent?.trim() ?? '',
      selected: (o as HTMLOptionElement).selected,
    })).filter((o) => o.label && o.label !== '選択してください');

    if (selectOpts.length) return selectOpts;

    // ボタン/ラジオ型
    return Array.from(document.querySelectorAll('[class*="option"], [class*="variant"], input[type="radio"]'))
      .map((el) => ({
        id: (el as HTMLInputElement).value ?? el.id ?? '',
        label: el.textContent?.trim() ?? (el as HTMLInputElement).value ?? '',
        selected: (el as HTMLInputElement).checked ?? el.classList.contains('selected'),
      }))
      .filter((o) => o.label);
  }).catch(() => []);

  // 数量・規格テキスト（例: "50mg × 4錠"）
  const quantityText = await page.evaluate(() => {
    const t = document.body.innerText;
    const m = t.match(/[\d.]+\s*(?:mg|mcg|μg|g|ml)?\s*[×x]\s*\d+\s*(?:錠|粒|枚|シート|包|袋|本|カプセル)/i);
    return m ? m[0].trim() : '';
  }).catch(() => '');

  // 説明文（最初の段落 or meta description）
  const description = await page.evaluate(() => {
    const meta = document.querySelector('meta[name="description"]');
    if (meta?.getAttribute('content')) return meta.getAttribute('content')!.trim();
    const p = document.querySelector('.product-description p, .description p, article p');
    return p?.textContent?.trim() ?? '';
  }).catch(() => '');

  // 画像URL
  const imageUrl = await page
    .$eval('meta[property="og:image"]', (el) => el.getAttribute('content') ?? '')
    .catch(async () =>
      page.$eval('img.product-image, img.main-image, [class*="product"] img, main img', (el) => (el as HTMLImageElement).src ?? '')
        .catch(() => '')
    );

  // 在庫状態
  const inStock = await page.evaluate(() => {
    const body = document.body.innerText;
    if (/完売|在庫なし|sold.?out|out of stock/i.test(body)) return false;
    if (/在庫あり|在庫〇|add to cart|カートに追加/i.test(body)) return true;
    const cartBtn = document.querySelector('button[class*="cart"], button[class*="buy"], input[type="submit"][value*="カート"]');
    return cartBtn ? !(cartBtn as HTMLButtonElement).disabled : null;
  }).catch(() => null);

  // ページタイトル（SEOタイトルとして保存）
  const pageTitle = await page.title().catch(() => '');

  // 現在選択されているバリアントの価格（hash に対応する価格があれば）
  const variantId = new URL(productUrl).hash.replace('#', '');

  return {
    name,
    priceInfo,
    oldPrice,
    variants,
    quantityText,
    description,
    imageUrl,
    inStock,
    pageTitle,
    variantId: variantId || null,
  };
}

// ── 単一ページ取得 ─────────────────────────────────────────────────────────────

async function scrapeOne(page, entry, state) {
  const { id, productUrl, category, title, productCode } = entry;

  try {
    const response = await page.goto(productUrl, {
      waitUntil: 'domcontentloaded',
      timeout: PAGE_TIMEOUT,
    });
    const status = response?.status() ?? 0;

    if (status === 403 || status === 429) {
      console.warn(`  ⚠️  ${productCode ?? productUrl} ${status} ブロック`);
      return 'blocked';
    }
    if (status === 404) {
      state.doneIds.add(id);
      console.log(`  ⬜ ${productCode ?? productUrl} 404 (スキップ)`);
      return 'missing';
    }

    const pageTitle = await page.title();
    if (pageTitle.includes('Just a moment') || page.url().includes('challenge')) {
      console.warn(`  ⚠️  Cloudflare検出: ${productUrl}`);
      return 'blocked';
    }

    await sleep(1500);
    const extracted = await extractProduct(page, productUrl);

    if (!extracted.name && !extracted.priceInfo) {
      throw new Error('商品名・価格ともに取得できず');
    }

    state.products.push({
      id,
      productCode: productCode ?? '',
      productUrl,
      category: category ?? '',
      titleFromUrl: title ?? '',
      name: extracted.name,
      priceInfo: extracted.priceInfo,
      oldPrice: extracted.oldPrice,
      variants: extracted.variants,
      quantityText: extracted.quantityText,
      description: extracted.description,
      imageUrl: extracted.imageUrl,
      inStock: extracted.inStock,
      pageTitle: extracted.pageTitle,
      variantId: extracted.variantId,
      scrapedAt: new Date().toISOString(),
    });
    state.doneIds.add(id);
    state.errors = state.errors.filter((e) => e.id !== id);

    console.log(`  ✅ ${productCode ?? id} / ${extracted.name.slice(0, 30)} / ${extracted.priceInfo}`);
    return 'ok';
  } catch (err) {
    const existing = state.errors.find((e) => e.id === id);
    if (existing) {
      existing.retryCount = (existing.retryCount ?? 0) + 1;
      existing.lastError = err.message;
    } else {
      state.errors.push({ id, productUrl, error: err.message, retryCount: 1, lastAt: new Date().toISOString() });
    }
    console.log(`  ❌ ${productCode ?? id} ${err.message}`);
    return 'error';
  }
}

// ── メイン ────────────────────────────────────────────────────────────────────

async function main() {
  console.log('='.repeat(60));
  console.log(` osakadou.cool 商品詳細スクレイパー${TEST_MODE ? ' [テスト]' : ''}`);
  if (SINGLE_URL) console.log(` 単一URL: ${SINGLE_URL}`);
  console.log('='.repeat(60));

  await checkCountry();

  ensureDataDir();

  // ── 対象URL一覧を構築 ──────────────────────────────────────────────────────
  let allEntries = [];

  if (SINGLE_URL) {
    // --url 指定: 単一URLのみ
    const code = SINGLE_URL.match(/\/detail\/([^/]+)\.html/)?.[1] ?? 'manual';
    allEntries = [{ id: 1, productUrl: SINGLE_URL, productCode: code, category: 'manual', title: '' }];
  } else {
    if (!existsSync(URLS_PATH)) {
      console.error(`❌ ${URLS_PATH} が見つかりません。`);
      console.error('   まずURL収集: node src/crawlers/osakadou.js');
      process.exit(1);
    }
    const rawUrls = JSON.parse(readFileSync(URLS_PATH, 'utf-8'));
    if (rawUrls.length === 0) {
      console.error('❌ URLリストが空です。osakadou.js を再実行してください。');
      process.exit(1);
    }
    allEntries = rawUrls.map((item, i) => ({ id: i + 1, ...item }));
  }

  // ── 状態読み込み ───────────────────────────────────────────────────────────
  const products = loadJson(PRODUCTS_PATH, []);
  const doneIds = new Set(loadJson(DONE_IDS_PATH, []));
  const errors = loadJson(ERRORS_PATH, []);
  const state = { products, doneIds, errors };

  console.log(`📂 レジューム: 完了${doneIds.size}件 / 全${allEntries.length}件`);

  let targets = SINGLE_URL
    ? allEntries
    : allEntries.filter((e) => !state.doneIds.has(e.id));
  if (TEST_MODE) targets = targets.slice(0, TEST_LIMIT);

  console.log(`🚀 処理対象: ${targets.length}件`);
  if (targets.length === 0) {
    console.log('✅ 全件処理済み。');
    return;
  }

  // ── CDP 接続 ───────────────────────────────────────────────────────────────
  const { browser, page } = await connectCDP();

  let blockedCount = 0;
  let doneCount = 0;

  try {
    for (const entry of targets) {
      const result = await scrapeOne(page, entry, state);

      if (result === 'blocked') {
        blockedCount++;
        if (blockedCount >= 3) {
          console.warn('\n⚠️  3回連続ブロック。処理を中断します。');
          console.warn('   しばらく待ってから再実行するか、Chromeのセッションを確認してください。');
          break;
        }
        await sleep(15000); // ブロック時は15秒待機
      } else {
        blockedCount = 0;
        doneCount++;
      }

      if (doneCount % SAVE_EVERY === 0) {
        saveJson(PRODUCTS_PATH, state.products);
        saveJson(DONE_IDS_PATH, [...state.doneIds]);
        saveJson(ERRORS_PATH, state.errors);
      }

      if (targets.indexOf(entry) < targets.length - 1) {
        await randomDelay();
      }
    }
  } finally {
    saveJson(PRODUCTS_PATH, state.products);
    saveJson(DONE_IDS_PATH, [...state.doneIds]);
    saveJson(ERRORS_PATH, state.errors);
  }

  console.log('\n' + '='.repeat(60));
  console.log(` レポート: 取得${state.doneIds.size}件 / エラー${state.errors.length}件`);
  console.log(`           保存先: ${PRODUCTS_PATH}`);
  console.log('='.repeat(60));

  if (SINGLE_URL) {
    const product = state.products[state.products.length - 1];
    if (product) {
      console.log('\n📦 取得結果:');
      console.log(JSON.stringify(product, null, 2));
    }
  }
}

main().catch((err) => {
  console.error('\n💥 Fatal:', err.message);
  process.exit(1);
});
