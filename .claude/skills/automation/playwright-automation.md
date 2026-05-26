# /playwright-automation — Playwright自動化

## 用途
PlaywrightでWebブラウザ操作を自動化する（スクレイピング・E2Eテスト・RPA）。

## 基本実装
```javascript
const { chromium } = require('playwright');

const browser = await chromium.launch();
const context = await browser.newContext();
const page = await context.newPage();

await page.goto('https://example.com');
await page.fill('#email', 'test@example.com');
await page.fill('#password', 'password');
await page.click('button[type=submit]');
await page.waitForURL('**/dashboard');

const title = await page.title();
await browser.close();
```

## セレクター優先順位
1. role（`page.getByRole('button', {name: '送信'})`）
2. text（`page.getByText('ログイン')`）
3. testid（`page.getByTestId('submit-btn')`）
4. CSS（最終手段）
