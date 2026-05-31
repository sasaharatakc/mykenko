/**
 * medicine-shop-urls.js
 * https://medicine.shop/ 商品URL収集クローラー
 *
 * URL構造:
 *   カテゴリ: https://medicine.shop/category/xxx/yyy
 *   商品詳細: https://medicine.shop/productdetail/PROD-35
 *
 * 実行方法:
 *   node src/crawlers/medicine-shop-urls.js
 *   SKIP_IP_CHECK=true node src/crawlers/medicine-shop-urls.js
 *   HEADLESS=false SKIP_IP_CHECK=true node src/crawlers/medicine-shop-urls.js
 */

import { chromium } from 'playwright';
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = resolve(__dirname, '../../data');
const OUTPUT_PATH = resolve(DATA_DIR, 'medicine-shop-product-urls.json');
const BASE_URL = 'https://medicine.shop';
const MAX_URLS = parseInt(process.env.MAX_URLS ?? '2000', 10);
const DELAY_MIN = 3000;
const DELAY_MAX = 7000;
const SKIP_IP_CHECK = process.env.SKIP_IP_CHECK === 'true';
const HEADLESS = process.env.HEADLESS !== 'false';

// 既知カテゴリシード（medicine.shop のカテゴリ構造）
const CATEGORY_SEEDS = [
  { url: `${BASE_URL}/category/aga-treatment-drugs/male-hair-loss`, category: '男性AGA治療薬' },
  { url: `${BASE_URL}/category/aga-treatment-drugs`, category: 'AGA治療薬' },
  { url: `${BASE_URL}/category`, category: 'カテゴリトップ' },
];

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
      console.error('   VPN未接続でテスト: SKIP_IP_CHECK=true node src/crawlers/medicine-shop-urls.js');
      process.exit(1);
    }
    console.log('   ✅ JP IP 確認済み');
  } catch (err) {
    if (SKIP_IP_CHECK) { console.warn('⚠️  IP確認スキップ'); return; }
    console.error('❌ IP確認失敗:', err.message); process.exit(1);
  }
}

function isProductUrl(url) {
  return /\/productdetail\/PROD-\d+/.test(url);
}

function extractProductCode(url) {
  const m = url.match(/\/productdetail\/(PROD-\d+)/);
  return m ? m[1] : '';
}

function isCategoryUrl(url) {
  return url.startsWith(BASE_URL) && /\/category\//.test(url) && !isProductUrl(url);
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
  const arr = [...map.values()].sort((a, b) => {
    const na = parseInt(a.productCode?.replace('PROD-', '') ?? '0', 10);
    const nb = parseInt(b.productCode?.replace('PROD-', '') ?? '0', 10);
    return na - nb;
  });
  writeFileSync(OUTPUT_PATH, JSON.stringify(arr, null, 2));
  console.log(`💾 保存: ${arr.length}件 → ${OUTPUT_PATH}`);
}

async function discoverAllCategories(page, knownSeeds) {
  // ホームページからカテゴリURLを追加探索
  console.log('\n🔍 ホームページからカテゴリを探索中...');
  const discovered = new Set(knownSeeds.map((s) => s.url));

  try {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await sleep(2000);

    const links = await page.$$eval('a[href]', (els) => els.map((el) => el.href));
    for (const href of links) {
      if (isCategoryUrl(href)) {
        discovered.add(href.split('#')[0]);
      }
    }
  } catch (err) {
    console.warn('   カテゴリ探索中のエラー（スキップ）:', err.message);
  }

  console.log(`   カテゴリURL: ${discovered.size}件`);
  return [...discovered].map((url) => ({
    url,
    category: url.replace(`${BASE_URL}/category/`, '').replace(/\//g, ' > '),
  }));
}

async function collectFromPage(page, sourceUrl, category, collected) {
  console.log(`\n📄 アクセス: ${sourceUrl}`);
  try {
    await page.goto(sourceUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await sleep(2000);
  } catch (err) {
    console.warn(`  ⚠️ 読み込み失敗: ${err.message}`);
    return { ok: false, newCategories: [] };
  }

  // ブロックチェック
  const title = await page.title().catch(() => '');
  const currentUrl = page.url();
  if (title.includes('Just a moment') || currentUrl.includes('challenge') || currentUrl.includes('cdn-cgi')) {
    console.warn(`  ⚠️ Cloudflare/403 検出`);
    return { ok: false, newCategories: [] };
  }

  const links = await page.$$eval('a[href]', (els) =>
    els.map((el) => ({ href: el.href, text: el.textContent?.trim() ?? '' }))
  );

  // 商品URL収集
  let added = 0;
  for (const { href, text } of links) {
    if (!isProductUrl(href)) continue;
    const cleanUrl = href.split('?')[0].split('#')[0];
    if (collected.has(cleanUrl)) continue;
    if (collected.size >= MAX_URLS) break;

    const productCode = extractProductCode(cleanUrl);
    collected.set(cleanUrl, {
      productUrl: cleanUrl,
      sourceUrl,
      title: text.replace(/\s+/g, ' ').slice(0, 100),
      category,
      productCode,
      collectedAt: new Date().toISOString(),
    });
    added++;
    console.log(`  ✅ [${collected.size}] ${productCode} ${text.slice(0, 40)}`);
  }
  console.log(`  → ${added}件 追加（累計 ${collected.size}件）`);

  // ページ内で新しいカテゴリURLを発見
  const newCategories = links
    .filter(({ href }) => isCategoryUrl(href))
    .map(({ href, text }) => ({
      url: href.split('#')[0],
      category: text.slice(0, 40) || href.replace(`${BASE_URL}/category/`, ''),
    }));

  return { ok: true, newCategories };
}

async function findNextPage(page) {
  try {
    const nextUrl = await page.$eval(
      'a[rel="next"], a.next, [class*="next"] a, a:has-text("次へ"), a:has-text("次のページ"), a:has-text(">>"), nav a:last-child',
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

    // カテゴリ一覧を収集（既知シード + ホームページ探索）
    const allCategories = await discoverAllCategories(page, CATEGORY_SEEDS);
    const visitedUrls = new Set();

    // カテゴリをキューとして処理（動的に追加可能）
    const queue = [...allCategories];
    let qi = 0;

    while (qi < queue.length && collected.size < MAX_URLS) {
      const { url: seedUrl, category } = queue[qi++];
      if (visitedUrls.has(seedUrl)) continue;

      let currentUrl = seedUrl;
      let pageNum = 1;

      while (currentUrl && collected.size < MAX_URLS) {
        if (visitedUrls.has(currentUrl)) break;
        visitedUrls.add(currentUrl);

        const { ok, newCategories } = await collectFromPage(page, currentUrl, category, collected);
        if (!ok) break;

        // 新発見カテゴリをキューに追加
        for (const cat of newCategories) {
          if (!visitedUrls.has(cat.url) && !queue.find((q) => q.url === cat.url)) {
            queue.push(cat);
          }
        }

        // ページネーション
        const nextUrl = await findNextPage(page);
        if (nextUrl && pageNum < 20) {
          currentUrl = nextUrl;
          pageNum++;
          await randomDelay();
        } else {
          break;
        }
      }

      if (qi < queue.length && collected.size < MAX_URLS) {
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
    console.log('   HEADLESS=false SKIP_IP_CHECK=true node src/crawlers/medicine-shop-urls.js');
    console.log('   でブラウザを確認してください。');
  } else {
    console.log('\n✅ 収集完了。次: SKIP_IP_CHECK=true node scrape_medicine.js --test');
  }
}

main().catch((err) => {
  console.error('\n💥 Fatal:', err.message);
  process.exit(1);
});
