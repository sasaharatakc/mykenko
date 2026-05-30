/**
 * osakadou.cool 商品URL収集クローラー
 *
 * 実行前提:
 *   - ローカルMac上で実行すること（クラウド実行禁止）
 *   - 日本VPN接続済みであること
 *   - Chrome を --remote-debugging-port=9222 で起動済みであること
 *
 * 起動方法:
 *   /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
 *     --remote-debugging-port=9222 \
 *     --user-data-dir="$HOME/chrome-osakadou"
 *
 * 実行方法:
 *   cd apps/price-monitor && npm install && node src/crawlers/osakadou.js
 */

import { chromium } from 'playwright';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import 'dotenv/config';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = resolve(__dirname, '../../data/osakadou-product-urls.json');
const BASE_URL = 'https://osakadou.cool';
const CDP_URL = 'http://127.0.0.1:9222';
const MAX_URLS = 100; // テスト収集上限
const DELAY_MIN = 5000;
const DELAY_MAX = 10000;

// カテゴリページ（確認済み18件）
const CATEGORY_SEEDS = [
  { url: `${BASE_URL}/products/c?cid=639`, category: 'ED治療' },
  { url: `${BASE_URL}/products/c?cid=642`, category: '育毛・AGA' },
  { url: `${BASE_URL}/products/c?cid=648`, category: '避妊・ピル' },
  { url: `${BASE_URL}/products/c?cid=652`, category: '美白・シミ' },
  { url: `${BASE_URL}/products/c?cid=654`, category: 'アレルギー・花粉症' },
  { url: `${BASE_URL}/products/c?cid=657`, category: '高血圧・脳卒中' },
  { url: `${BASE_URL}/products/c?cid=670`, category: '抗生物質' },
  { url: `${BASE_URL}/products/c?cid=671`, category: 'ダイエット' },
  { url: `${BASE_URL}/products/c?cid=675`, category: '睡眠・不眠' },
  { url: `${BASE_URL}/products/c?cid=678`, category: '糖尿病' },
  { url: `${BASE_URL}/products/c?cid=682`, category: '皮膚・アトピー' },
  { url: `${BASE_URL}/products/c?cid=695`, category: '男性ホルモン' },
  { url: `${BASE_URL}/products/c?cid=696`, category: '抗ウイルス' },
  { url: `${BASE_URL}/products/c?cid=700`, category: '胃腸・消化器' },
  { url: `${BASE_URL}/products/c?cid=704`, category: '目薬・眼科' },
  { url: `${BASE_URL}/products/c?cid=709`, category: 'ステロイド・抗炎症' },
  { url: `${BASE_URL}/products/c?cid=718`, category: '女性ホルモン・更年期' },
  { url: `${BASE_URL}/products/c?cid=730`, category: 'その他' },
];

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function randomDelay() {
  const ms = Math.floor(Math.random() * (DELAY_MAX - DELAY_MIN + 1)) + DELAY_MIN;
  console.log(`  ⏳ ${ms}ms 待機中...`);
  return sleep(ms);
}

function extractProductCode(url) {
  const match = url.match(/\/detail\/([^/]+)\.html$/);
  return match ? match[1] : '';
}

async function checkCountry() {
  console.log('🌐 IP国籍を確認中...');
  try {
    const res = await fetch('https://ipinfo.io/country');
    const country = (await res.text()).trim();
    console.log(`   検出された国: ${country}`);
    if (country !== 'JP') {
      console.error(`\n❌ IP国籍が JP ではありません（${country}）`);
      console.error('   日本VPNに接続してから再実行してください。');
      process.exit(1);
    }
    console.log('   ✅ 日本IP確認済み');
    return true;
  } catch (err) {
    console.error('   ❌ IP確認失敗:', err.message);
    console.error('   ネットワーク接続を確認してください。');
    process.exit(1);
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
  const arr = [...map.values()].sort((a, b) => a.productUrl.localeCompare(b.productUrl));
  writeFileSync(OUTPUT_PATH, JSON.stringify(arr, null, 2));
  console.log(`💾 保存: ${arr.length}件 → ${OUTPUT_PATH}`);
}

async function connectCDP() {
  console.log(`\n🔌 Chrome CDP に接続中: ${CDP_URL}`);
  try {
    const browser = await chromium.connectOverCDP(CDP_URL);
    const contexts = browser.contexts();
    const context = contexts[0] ?? await browser.newContext();
    const pages = context.pages();
    const page = pages[0] ?? await context.newPage();
    console.log('   ✅ CDP 接続成功');
    return { browser, page };
  } catch (err) {
    console.error(`\n❌ CDP 接続失敗: ${err.message}`);
    console.error('   Chrome が以下のオプションで起動されているか確認してください:');
    console.error('   /Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome \\');
    console.error('     --remote-debugging-port=9222 \\');
    console.error('     --user-data-dir="$HOME/chrome-osakadou"');
    process.exit(1);
  }
}

function checkBlocked(page, url) {
  const title = page.url();
  // Cloudflare challenge / 403 などを検出
  return title.includes('challenge') || title.includes('cdn-cgi');
}

async function collectFromPage(page, sourceUrl, category, collected) {
  console.log(`\n📄 アクセス: ${sourceUrl}`);

  await page.goto(sourceUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await sleep(2000); // ページ描画待ち

  // Cloudflare / 403 チェック
  const status = await page.evaluate(() => document.title);
  if (
    checkBlocked(page, page.url()) ||
    status.includes('Just a moment') ||
    status.includes('403')
  ) {
    console.warn(`  ⚠️ Cloudflare/403 検出: ${sourceUrl}`);
    console.warn('     収集を停止します。VPN接続・Chromeのセッションを確認してください。');
    return false; // 停止シグナル
  }

  // /detail/ リンクを抽出
  const links = await page.$$eval('a[href*="/detail/"]', (els) =>
    els.map((el) => ({
      href: el.href,
      text: el.innerText.trim(),
    }))
  );

  let added = 0;
  for (const { href, text } of links) {
    if (!/\/detail\/[^/]+\.html$/.test(href)) continue;
    if (collected.has(href)) continue;
    if (collected.size >= MAX_URLS) break;

    const productCode = extractProductCode(href);
    collected.set(href, {
      productUrl: href,
      sourceUrl,
      title: text || '',
      category,
      productCode,
      collectedAt: new Date().toISOString(),
    });
    added++;
    console.log(`  ✅ [${collected.size}] ${href}`);
  }
  console.log(`  → ${added}件 追加（累計 ${collected.size}件）`);
  return true;
}

async function findNextPage(page) {
  try {
    const nextUrl = await page.$eval(
      'a.next, a[rel="next"], .pagination a:last-child, a:has-text("次へ"), a:has-text("次のページ")',
      (el) => el.href
    );
    return nextUrl && nextUrl !== page.url() ? nextUrl : null;
  } catch {
    return null;
  }
}

// ランキングページからも収集
const EXTRA_SEEDS = [
  { url: `${BASE_URL}/topics/ranking.html`, category: 'ランキング' },
];

async function main() {
  console.log('='.repeat(60));
  console.log(' osakadou.cool 商品URL収集クローラー');
  console.log('='.repeat(60));

  // 1. IP国籍チェック
  await checkCountry();

  // 2. 既存データ読み込み（レジューム）
  const collected = loadExisting();
  const blocked403 = [];

  // 3. CDP 接続
  const { browser, page } = await connectCDP();

  try {
    const allSeeds = [...CATEGORY_SEEDS, ...EXTRA_SEEDS];

    for (const { url: seedUrl, category } of allSeeds) {
      if (collected.size >= MAX_URLS) {
        console.log(`\n🎯 上限 ${MAX_URLS}件 に達しました。収集を終了します。`);
        break;
      }

      let currentUrl = seedUrl;
      let pageNum = 1;

      while (currentUrl && collected.size < MAX_URLS) {
        const ok = await collectFromPage(page, currentUrl, category, collected);

        if (!ok) {
          blocked403.push(currentUrl);
          break;
        }

        // ページネーション
        const nextUrl = await findNextPage(page);
        if (nextUrl && pageNum < 5) {
          currentUrl = nextUrl;
          pageNum++;
          await randomDelay();
        } else {
          break;
        }
      }

      if (collected.size < MAX_URLS) {
        await randomDelay();
      }
    }
  } finally {
    saveResults(collected);

    console.log('\n' + '='.repeat(60));
    console.log(' 収集レポート');
    console.log('='.repeat(60));
    console.log(`取得件数（重複除外済み）: ${collected.size} 件`);
    console.log(`保存先: ${OUTPUT_PATH}`);

    if (blocked403.length > 0) {
      console.log(`\n⚠️  403/Cloudflare で停止したURL (${blocked403.length}件):`);
      for (const u of blocked403) console.log(`   - ${u}`);
    } else {
      console.log('\n✅ 403/Cloudflare エラーなし');
    }

    const canProceed = collected.size > 0 && blocked403.length === 0;
    console.log(`\n次の価格取得へ進めるか: ${canProceed ? '✅ YES' : '❌ NO（ブロックを解除してから再実行）'}`);
    console.log('='.repeat(60));
  }
}

main().catch((err) => {
  console.error('\n💥 Fatal error:', err);
  process.exit(1);
});
