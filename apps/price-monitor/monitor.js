/**
 * monitor.js
 * 価格変動レポート生成 + Slack/LINE 通知
 *
 * 使い方:
 *   node monitor.js                  # 最新の変動を表示
 *   node monitor.js --since 24h      # 直近24時間の変動
 *   node monitor.js --since 7d       # 直近7日間の変動
 *   node monitor.js --notify         # Slack/LINE に通知
 *   node monitor.js --export         # data/price-changes.csv 出力
 */

import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { getDb } from './db/init.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = resolve(__dirname, 'data');

const NOTIFY  = process.argv.includes('--notify');
const EXPORT  = process.argv.includes('--export');
const SINCE   = (() => {
  const i = process.argv.indexOf('--since');
  if (i === -1) return '24h';
  return process.argv[i + 1] ?? '24h';
})();

function parseSince(s) {
  const m = s.match(/^(\d+)(h|d)$/);
  if (!m) return 24 * 60 * 60;
  const n = parseInt(m[1], 10);
  return m[2] === 'h' ? n * 3600 : n * 86400;
}

function formatChange(row) {
  const sign = row.change_yen > 0 ? '▲' : '▼';
  const pct = Math.abs(row.change_pct).toFixed(1);
  const abs = Math.abs(Math.round(row.change_yen));
  return `${sign} ${row.product_name ?? row.product_code} [${row.category}]\n` +
         `   ${row.old_price_raw} → ${row.new_price_raw}  (${sign}${abs}円 / ${pct}%)`;
}

function escapeCsv(v) {
  if (v === null || v === undefined) return '';
  const s = String(v);
  return s.includes(',') || s.includes('"') || s.includes('\n')
    ? `"${s.replace(/"/g, '""')}"` : s;
}

async function sendSlack(text, webhookUrl) {
  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error(`Slack: ${res.status}`);
}

async function sendLine(text, token, toUserId) {
  const res = await fetch('https://api.line.me/v2/bot/message/push', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      to: toUserId,
      messages: [{ type: 'text', text }],
    }),
  });
  if (!res.ok) throw new Error(`LINE: ${res.status}`);
}

async function main() {
  const db = getDb();

  const sinceSeconds = parseSince(SINCE);
  const sinceIso = new Date(Date.now() - sinceSeconds * 1000).toISOString();

  // 直近の価格変動を取得
  const changes = db.prepare(`
    SELECT *
    FROM price_changes
    WHERE detected_at >= ?
    ORDER BY ABS(change_pct) DESC
  `).all(sinceIso);

  // 全件サマリー
  const summary = db.prepare(`
    SELECT
      COUNT(DISTINCT product_code) AS total_products,
      COUNT(*) AS total_snapshots,
      MIN(scraped_at) AS first_scraped,
      MAX(scraped_at) AS last_scraped
    FROM price_snapshots
  `).get();

  console.log('='.repeat(60));
  console.log(` 価格モニタリングレポート（直近 ${SINCE}）`);
  console.log('='.repeat(60));
  console.log(`📦 管理商品数: ${summary.total_products}件`);
  console.log(`📸 スナップショット: ${summary.total_snapshots}件`);
  console.log(`⏱  最終取得: ${summary.last_scraped ?? 'なし'}`);

  if (changes.length === 0) {
    console.log(`\n✅ 価格変動なし（直近 ${SINCE}）`);
    db.close();
    return;
  }

  const up   = changes.filter((c) => c.change_yen > 0);
  const down = changes.filter((c) => c.change_yen < 0);

  console.log(`\n⚡ 価格変動 ${changes.length}件（値上げ: ${up.length}件 / 値下げ: ${down.length}件）`);

  if (down.length > 0) {
    console.log('\n▼ 値下げ:');
    for (const c of down) console.log('  ' + formatChange(c));
  }
  if (up.length > 0) {
    console.log('\n▲ 値上げ:');
    for (const c of up) console.log('  ' + formatChange(c));
  }

  // CSV エクスポート
  if (EXPORT) {
    if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
    const csvPath = resolve(DATA_DIR, 'price-changes.csv');
    const headers = ['product_code','product_name','category','old_price_raw','new_price_raw','old_price_yen','new_price_yen','change_yen','change_pct','detected_at'];
    const rows = [
      headers.join(','),
      ...changes.map((c) => headers.map((h) => escapeCsv(c[h])).join(',')),
    ];
    writeFileSync(csvPath, rows.join('\n') + '\n');
    console.log(`\n💾 CSV出力: ${csvPath}`);
  }

  // 通知
  if (NOTIFY) {
    const slackUrl  = process.env.SLACK_WEBHOOK_URL;
    const lineToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
    const lineUser  = process.env.LINE_USER_ID;

    const msg =
      `【medicine.shop 価格変動】直近${SINCE}\n` +
      `値下げ${down.length}件 / 値上げ${up.length}件\n\n` +
      changes.slice(0, 10).map(formatChange).join('\n') +
      (changes.length > 10 ? `\n...他${changes.length - 10}件` : '');

    if (slackUrl) {
      await sendSlack(msg, slackUrl).then(() => console.log('✅ Slack 通知送信')).catch(console.error);
    }
    if (lineToken && lineUser) {
      await sendLine(msg, lineToken, lineUser).then(() => console.log('✅ LINE 通知送信')).catch(console.error);
    }
    if (!slackUrl && !lineToken) {
      console.log('\n⚠️  通知設定なし。.env に SLACK_WEBHOOK_URL または LINE_CHANNEL_ACCESS_TOKEN を設定してください。');
    }
  }

  db.close();
}

main().catch((err) => {
  console.error('💥 Fatal:', err.message);
  process.exit(1);
});
