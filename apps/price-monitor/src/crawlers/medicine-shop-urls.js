/**
 * medicine-shop-urls.js
 * https://medicine.shop/ 商品URL収集クローラー
 *
 * 実行方法:
 *   node src/crawlers/medicine-shop-urls.js
 *   SKIP_IP_CHECK=true node src/crawlers/medicine-shop-urls.js  # VPNなしでテスト
 */

import { chromium } from 'playwright';
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = resolve(__dirname, '../../data');
const OUTPUT_PATH = resolve(DATA_DIR, 'medicine-shop-product-urls.json');
const BASE_URL = 'https://medicine.shop';
const MAX_URLS = parseInt(process.env.MAX_URLS ?? '500', 10);
const DELAY_MIN = 3000;
const DELAY_MAX = 7000;
const SKIP_IP_CHECK = process.env.SKIP_IP_CHECK === 'true';
const HEADLESS = process.env.HEADLESS !== 'false';

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function randomDelay() {
  const ms = Math.floor(Math.random() * (DELAY_MAX - DELAY_MIN + 1)) + DELAY_MIN;
  console.log(`  ⏳ ${ms}ms 待機中...`);
  return sleep(ms);
}

async function checkCountry() {
  console.log('🌐 IP国籍を確認中...');
  try {
    const res = await fetch('https://ipinfo.io/country');
    const country = (await res.text()).trim();
    if (!/^[A-Z]{2}$/.test(country)) {
      console.warn('⚠️  IP国籍を取得できませんでした');
      return false;
    }
    console.log(`   検出された国: ${country}`);
    if (country !== 'JP') {
      if (SKIP_IP_CHECK) {
        console.warn(`⚠️  JP以外のIP（${country}）ですが SKIP_IP_CHECK=true のため続行します`);
        return false;
      }
      console.error(`❌ 日本VPNに接続してください（現在: ${country}）`);
      console.error('   VPNなしでテストする場合: SKIP_IP_CHECK=true node src/crawlers/medicine-shop-urls.js');
      process.exit(1);
    }
    console.log('   ✅ JP IP 確認済み');
    return true;
  } catch (err) {
    console.warn('⚠️  IP確認失敗:', err.message);
    if (!SKIP_IP_CHECK) process.exit(1);
    return false;
  }
}

function loadExisting() {
  if (!existsSync(OUTPUT_PATH)) return new Map();
  try {
    const raw = JSON.parse(readFileSync(OUTPUT_PATH, 'utf-8'));
    const map = new Map();
    for (const item of raw) {
      if (item.productUrl) map.set(item.productUrl, item);
    }
    console.log(`📂 既存データ: ${map.size}件 読み込み済み（レジューム）`);
    return map;
  } catch {
    return new Map();
  }
}

function saveResults(map) {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  const arr = [...map.values()].sort((a, b) => a.productUrl.localeCompare(b.productUrl));
  writeFileSync(OUTPUT_PATH, JSON.stringify(arr, null, 2));
  console.log(`💾 保存: ${arr.length}件 → ${OUTPUT_PATH}`);
}

function isProductUrl(url) {
  // medicine.shop の商品URLパターン（実行後にログで確認して調整）
  return (
    /\/item\/[^/]+/.test(url) ||
    /\/product\/[^/]+/.test(url) ||
    /\/products\/[^/]+/.test(url) ||
    /\/goods\/[^/]+/.test(url) ||
    /\/detail\/[^/]+/.test(url) ||
    /[?&]sku=/.test(url) ||
    /\/p\/\d+/.test(url)
  );
}

function extractProductCode(url) {
  const patterns = [
    /\/item\/([^/?#]+)/,
    /\/product\/([^/?#]+)/,
    /\/products\/([^/?#]+)/,
    /\/goods\/([^/?#]+)/,
    /\/detail\/([^/?#]+)/,
    /\/p\/(\d+)/,
    /[?&]sku=([^&]+)/,
  ];
  for (const pat of patterns) {
    const m = url.match(pat);
    if (m) return m[1];
  }
  return '';
}

async function discoverCategories(page) {
  console.log('\n🔍 カテゴリページを探索中...');
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await sleep(2000);

  // 全リンクを収集してカテゴリらしいURLを抽出
  const links = await page.$$eval('a[href]', (els) =>
    els.map((el) => ({ href: el.href, text: el.textContent?.trim() ?? '' }))
  );

  const categoryUrls = new Set();
  for (const { href } of links) {
    if (!href.startsWith(BASE_URL)) continue;
    if (isProductUrl(href)) continue;
    if (
      /\/category\//.test(href) ||
      /\/cat\//.test(href) ||
      /\/genre\//.test(href) ||
      /\/c\//.test(href) ||
      /[?&]cat=/.test(href) ||
      /[?&]category=/.test(href) ||
      /[?&]genre=/.test(href)
    ) {
      categoryUrls.add(href.split('#')[0]);
    }
  }

  console.log(`   カテゴリURL候補: ${categoryUrls.size}件`);
  if (categoryUrls.size === 0) {
    console.log('   カテゴリURLが見つかりません。ホームページから直接商品を収集します。');
  }
  return [...categoryUrls];
}

async function collectFromPage(page, sourceUrl, category, collected) {
  console.log(`\n📄 アクセス: ${sourceUrl}`);
  try {
    await page.goto(sourceUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await sleep(2000);
  } catch (err) {
    console.warn(`  ⚠️ ページ読み込み失敗: ${err.message}`);
    return false;
  }

  // ブロックチェック
  const title = await page.title();
  const currentUrl = page.url();
  if (
    title.includes('Just a moment') ||
    title.includes('403') ||
    currentUrl.includes('challenge') ||
    currentUrl.includes('cdn-cgi')
  ) {
    console.warn(`  ⚠️ Cloudflare/403 検出: ${sourceUrl}`);
    return false;
  }

  // 全リンクを収集
  const links = await page.$$eval('a[href]', (els) =>
    els.map((el) => ({ href: el.href, text: el.textContent?.trim() ?? '' }))
  );

  // 商品URLを抽出
  let added = 0;
  for (const { href, text } of links) {
    if (!href.startsWith(BASE_URL)) continue;
    if (!isProductUrl(href)) continue;
    const cleanUrl = href.split('#')[0];
    if (collected.has(cleanUrl)) continue;
    if (collected.size >= MAX_URLS) break;

    const productCode = extractProductCode(cleanUrl);
    collected.set(cleanUrl, {
      productUrl: cleanUrl,
      sourceUrl,
      title: text || '',
      category,
      productCode,
      collectedAt: new Date().toISOString(),
    });
    added++;
    console.log(`  ✅ [${collected.size}] ${cleanUrl}`);
  }
  console.log(`  → ${added}件 追加（累計 ${collected.size}件）`);

  // 商品URLが1件も見つからない場合、全リンクをサンプル表示（デバッグ用）
  if (added === 0 && collected.size === 0) {
    const sample = links
      .filter((l) => l.href.startsWith(BASE_URL))
      .slice(0, 20)
      .map((l) => l.href);
    console.log('  📋 サイト内リンクサンプル（URL構造確認用）:');
    for (const s of sample) console.log(`     ${s}`);
  }

  return true;
}

async function findNextPage(page) {
  try {
    const nextUrl = await page.$eval(
      'a.next, a[rel="next"], .pagination a:last-child, a:has-text("次へ"), a:has-text("次のページ"), a:has-text(">>"), [class*="next"] a',
      (el) => el.href
    );
    return nextUrl && nextUrl !== page.url() ? nextUrl : null;
  } catch {
    return null;
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log(' medicine.shop 商品URL収集クローラー');
  console.log('='.repeat(60));

  await checkCountry();

  const collected = loadExisting();

  console.log(`\n🌐 Playwright 起動 (headless=${HEADLESS})`);
  const browser = await chromium.launch({
    headless: HEADLESS,
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  });

  try {
    const page = await browser.newPage();
    await page.setExtraHTTPHeaders({ 'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8' });

    // カテゴリ探索
    const categories = await discoverCategories(page);

    // カテゴリがなければホームページ自体から収集
    const seeds =
      categories.length > 0
        ? categories.map((url) => ({ url, category: 'カテゴリ' }))
        : [{ url: BASE_URL, category: 'ホーム' }];

    let blocked = false;
    for (const { url: seedUrl, category } of seeds) {
      if (collected.size >= MAX_URLS) break;
      if (blocked) break;

      let currentUrl = seedUrl;
      let pageNum = 1;

      while (currentUrl && collected.size < MAX_URLS) {
        const ok = await collectFromPage(page, currentUrl, category, collected);
        if (!ok) { blocked = true; break; }

        const nextUrl = await findNextPage(page);
        if (nextUrl && pageNum < 10) {
          currentUrl = nextUrl;
          pageNum++;
          await randomDelay();
        } else {
          break;
        }
      }

      if (!blocked && collected.size < MAX_URLS) {
        await randomDelay();
      }
    }
  } finally {
    saveResults(collected);
    await browser.close();
  }

  console.log('\n' + '='.repeat(60));
  console.log(` 収集レポート: ${collected.size}件`);
  console.log('='.repeat(60));

  if (collected.size === 0) {
    console.log('\n⚠️  商品URLが0件です。');
    console.log('   以下を確認してください:');
    console.log('   1. HEADLESS=false で実行してサイトの実際のURL構造を確認');
    console.log('   2. isProductUrl() のパターンを medicine.shop に合わせて修正');
    console.log('   3. Cloudflareにブロックされていないか確認');
  } else {
    console.log('\n✅ 収集完了。次は npm run scrape:medicine を実行してください。');
  }
}

main().catch((err) => {
  console.error('\n💥 Fatal:', err.message);
  process.exit(1);
});
