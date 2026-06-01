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
 *   node src/crawlers/osakadou.js
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
const MAX_URLS = 500;
const DELAY_MIN = 4000;
const DELAY_MAX = 8000;

// /medicine?k= 検索ベースのシード（サイトの実際のエンドポイント）
const SEARCH_SEEDS = [
  { keyword: 'バイアグラ',     category: 'ED治療' },
  { keyword: 'シアリス',       category: 'ED治療' },
  { keyword: 'レビトラ',       category: 'ED治療' },
  { keyword: 'プロペシア',     category: '育毛・AGA' },
  { keyword: 'ミノキシジル',   category: '育毛・AGA' },
  { keyword: 'フィナステリド', category: '育毛・AGA' },
  { keyword: 'ピル',           category: '避妊・ピル' },
  { keyword: 'トラネキサム',   category: '美白・シミ' },
  { keyword: 'ハイドロキノン', category: '美白・シミ' },
  { keyword: 'アレグラ',       category: 'アレルギー' },
  { keyword: 'クラリチン',     category: 'アレルギー' },
  { keyword: 'マイスリー',     category: '睡眠・不眠' },
  { keyword: 'サイレース',     category: '睡眠・不眠' },
  { keyword: 'ベルビック',     category: 'ダイエット' },
  { keyword: 'ゼニカル',       category: 'ダイエット' },
  { keyword: 'メトホルミン',   category: '糖尿病' },
  { keyword: 'プレドニン',     category: 'ステロイド' },
  { keyword: 'バルトレックス', category: '抗ウイルス' },
  { keyword: '抗生物質',       category: '抗生物質' },
  { keyword: '更年期',         category: '女性ホルモン・更年期' },
];

// カテゴリページもフォールバックとして保持
const CATEGORY_SEEDS = [
  { url: `${BASE_URL}/products/c?cid=639`, category: 'ED治療' },
  { url: `${BASE_URL}/products/c?cid=642`, category: '育毛・AGA' },
  { url: `${BASE_URL}/products/c?cid=648`, category: '避妊・ピル' },
  { url: `${BASE_URL}/products/c?cid=671`, category: 'ダイエット' },
  { url: `${BASE_URL}/products/c?cid=675`, category: '睡眠・不眠' },
  { url: `${BASE_URL}/topics/ranking.html`, category: 'ランキング' },
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
  const match = url.match(/\/detail\/([^#?/]+)\.html/);
  return match ? match[1] : '';
}

async function checkCountry() {
  console.log('🌐 IP国籍を確認中...');
  try {
    const res = await fetch('https://ipinfo.io/country');
    const country = (await res.text()).trim();
    if (!/^[A-Z]{2}$/.test(country)) {
      console.error(`\n❌ IP国籍を取得できませんでした（応答: "${country}"）`);
      process.exit(1);
    }
    console.log(`   検出された国: ${country}`);
    if (country !== 'JP') {
      console.error(`\n❌ IP国籍が JP ではありません（${country}）`);
      console.error('   日本VPNに接続してから再実行してください。');
      process.exit(1);
    }
    console.log('   ✅ 日本IP確認済み');
  } catch (err) {
    console.error('   ❌ IP確認失敗:', err.message);
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
    process.exit(1);
  }
}

// ── ページからdetailリンクを収集 ─────────────────────────────────────────────

async function collectFromPage(page, sourceUrl, category, collected) {
  console.log(`\n📄 アクセス: ${sourceUrl}`);

  // page.goto を try/catch で保護
  let response;
  try {
    response = await page.goto(sourceUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
  } catch (err) {
    console.warn(`  ⚠️ ナビゲーションエラー (スキップ): ${err.message.split('\n')[0]}`);
    return 'skip';
  }

  const status = response?.status() ?? 0;
  if (status === 403 || status === 429) {
    console.warn(`  ⚠️ ${status} ブロック: ${sourceUrl}`);
    return 'blocked';
  }

  await sleep(1500);

  // Cloudflare チェック
  const pageTitle = await page.title().catch(() => '');
  if (
    page.url().includes('challenge') ||
    page.url().includes('cdn-cgi') ||
    pageTitle.includes('Just a moment')
  ) {
    console.warn(`  ⚠️ Cloudflare検出`);
    return 'blocked';
  }

  // /detail/ リンクを抽出
  const links = await page.$$eval('a[href*="/detail/"]', (els) =>
    els.map((el) => ({
      href: el.href.split('#')[0], // hashを除去して正規化
      text: el.innerText.trim(),
    }))
  ).catch(() => []);

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
    console.log(`  ✅ [${collected.size}] ${productCode} — ${text.slice(0, 40)}`);
  }
  console.log(`  → ${added}件 追加（累計 ${collected.size}件）`);
  return added > 0 ? 'ok' : 'empty';
}

// ── ページネーション URL を取得 ───────────────────────────────────────────────

async function findNextPage(page, currentUrl) {
  try {
    // 「次へ」「次のページ」「›」などのリンクを探す
    const nextUrl = await page.evaluate(() => {
      const selectors = [
        'a[rel="next"]',
        'a.next',
        'a:has-text("次へ")',
        'a:has-text("次のページ")',
        '.pagination li:last-child a',
        '[class*="pagination"] a:last-child',
        'a[href*="page"]:last-of-type',
      ];
      for (const sel of selectors) {
        try {
          const el = document.querySelector(sel);
          if (el && el.href && !el.href.includes('javascript')) return el.href;
        } catch { /* ignore */ }
      }
      return null;
    });
    // 同じURLや空はnull
    if (!nextUrl || nextUrl === currentUrl) return null;
    // ページ番号が増えていることを確認
    const curPage = currentUrl.match(/[?&/]page[:/=](\d+)/)?.[1] ?? '1';
    const nxtPage = nextUrl.match(/[?&/]page[:/=](\d+)/)?.[1] ?? '1';
    if (parseInt(nxtPage) <= parseInt(curPage)) return null;
    return nextUrl;
  } catch {
    return null;
  }
}

// ── メイン ────────────────────────────────────────────────────────────────────

async function main() {
  console.log('='.repeat(60));
  console.log(' osakadou.cool 商品URL収集クローラー');
  console.log('='.repeat(60));

  await checkCountry();

  const collected = loadExisting();
  const blocked = [];

  const { browser, page } = await connectCDP();

  try {
    // ── Phase 1: /medicine?k= 検索ページから収集 ─────────────────────────────
    console.log('\n📦 Phase 1: 検索ページ (/medicine?k=) から収集');
    for (const { keyword, category } of SEARCH_SEEDS) {
      if (collected.size >= MAX_URLS) break;

      const searchUrl = `${BASE_URL}/medicine?k=${encodeURIComponent(keyword)}`;
      let currentUrl = searchUrl;
      let pageNum = 1;

      while (currentUrl && collected.size < MAX_URLS && pageNum <= 10) {
        const result = await collectFromPage(page, currentUrl, category, collected);

        if (result === 'blocked') {
          blocked.push(currentUrl);
          console.warn('  ⛔ ブロック検出 — 30秒待機して次のキーワードへ');
          await sleep(30000);
          break;
        }

        // 検索ページのページネーション確認
        const nextUrl = await findNextPage(page, currentUrl);
        if (nextUrl && result !== 'empty') {
          currentUrl = nextUrl;
          pageNum++;
          await randomDelay();
        } else {
          break;
        }
      }

      if (collected.size < MAX_URLS) await randomDelay();
    }

    // ── Phase 2: カテゴリページから補完収集 ──────────────────────────────────
    console.log('\n📦 Phase 2: カテゴリページから補完収集');
    for (const { url: seedUrl, category } of CATEGORY_SEEDS) {
      if (collected.size >= MAX_URLS) break;

      let currentUrl = seedUrl;
      let pageNum = 1;

      while (currentUrl && collected.size < MAX_URLS && pageNum <= 5) {
        const result = await collectFromPage(page, currentUrl, category, collected);

        if (result === 'blocked') {
          blocked.push(currentUrl);
          break;
        }
        if (result === 'skip') break;

        const nextUrl = await findNextPage(page, currentUrl);
        if (nextUrl && result !== 'empty') {
          currentUrl = nextUrl;
          pageNum++;
          await randomDelay();
        } else {
          break;
        }
      }

      if (collected.size < MAX_URLS) await randomDelay();
    }

  } finally {
    saveResults(collected);

    console.log('\n' + '='.repeat(60));
    console.log(' 収集レポート');
    console.log('='.repeat(60));
    console.log(`取得件数（重複除外済み）: ${collected.size} 件`);
    console.log(`保存先: ${OUTPUT_PATH}`);

    if (blocked.length > 0) {
      console.log(`\n⚠️  ブロックURL (${blocked.length}件):`);
      for (const u of blocked) console.log(`   - ${u}`);
    } else {
      console.log('\n✅ ブロックなし');
    }

    const ok = collected.size > 0 && blocked.length === 0;
    console.log(`\n次ステップ: ${ok ? '✅ node scrape_osakadou.js --test' : '❌ ブロック解除後に再実行'}`);
    console.log('='.repeat(60));
  }
}

main().catch((err) => {
  console.error('\n💥 Fatal error:', err.message);
  process.exit(1);
});
