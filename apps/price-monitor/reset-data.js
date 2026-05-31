/**
 * reset-data.js
 * data/ 以下の収集データをリセット（URLリストは保持）
 *
 * 使い方:
 *   node reset-data.js          # 確認プロンプトあり
 *   node reset-data.js --force  # 確認なし
 */

import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { createInterface } from 'readline';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = resolve(__dirname, 'data');

const FILES_TO_RESET = [
  { path: resolve(DATA_DIR, 'products.json'), init: '[]' },
  { path: resolve(DATA_DIR, 'done_ids.json'), init: '[]' },
  { path: resolve(DATA_DIR, 'missing_ids.json'), init: '[]' },
  { path: resolve(DATA_DIR, 'errors.json'), init: '[]' },
];

const PRESERVE = ['osakadou-product-urls.json'];

async function confirm(message) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(message, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase());
    });
  });
}

async function main() {
  const force = process.argv.includes('--force');

  console.log('🗑️  リセット対象:');
  for (const f of FILES_TO_RESET) {
    const exists = existsSync(f.path);
    console.log(`   ${exists ? '○' : '-'} ${f.path}`);
  }
  console.log(`\n保持されるファイル: ${PRESERVE.join(', ')}`);

  if (!force) {
    const answer = await confirm('\n本当にリセットしますか？ [y/N]: ');
    if (answer !== 'y' && answer !== 'yes') {
      console.log('キャンセルしました。');
      process.exit(0);
    }
  }

  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });

  for (const f of FILES_TO_RESET) {
    writeFileSync(f.path, f.init);
    console.log(`   ✅ リセット: ${f.path}`);
  }

  console.log('\n✅ リセット完了。scrape_playwright.js を実行できます。');
}

main().catch((err) => {
  console.error('💥 Fatal:', err.message);
  process.exit(1);
});
