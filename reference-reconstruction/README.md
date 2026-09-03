# 株式会社minamoto TOP — Reference Design Reconstruction

Nudot Studio（核點, https://nudot.com.tw/?ref=landing.love）のデザインシステムを解析・再構築し、
`contents.md`（株式会社minamoto TOP 原稿）を新コンテンツとして実装した単一 HTML ページ。

## Reference URL

https://nudot.com.tw/?ref=landing.love

> 注記: 本実行環境の egress プロキシが reference ドメインをブロックしているため、
> 直接スクリーンショットは取得できませんでした。MASTER PROMPT §60 に従い、Awwwards /
> landing.love / 検索インデックスの公開記録から Design DNA を再構成しています。

## Page Description

near-black cosmic canvas + oversized kinetic typography + technical status line +
service chips + hairline structure + scroll reveal で構成した、高難度エージェンシー調の
ダーク B2B コーポレート TOP。Hero → Philosophy → Business → Corporate/RegTech Services →
Integrated Solutions → Identity → Company → Contact → FAQ → Final CTA。

## Preview URL（ホスト版・すぐ確認できます）

https://claude.ai/code/artifact/c410fbc0-838a-46c5-bcb4-4ea8c3715f82

> クラウド実行環境のため `localhost` は外部から開けません。上記は同一デザインを
> claude.ai 上でホストしたプレビューです（Next.js のレンダリング結果と同一の HTML）。

## How to run

### Next.js 実装（`minamoto-next/`）

```bash
cd minamoto-next
npm install
npm run dev      # → http://localhost:3000（開発）
# もしくは本番モード
npm run build && npm run start   # → http://localhost:3000
```

Next.js 14（App Router / TypeScript）。`app/page.tsx` が単一ページ、`app/globals.css` が
デザインシステム。インタラクション（ヘッダー scroll / IntersectionObserver reveal /
FAQ アコーディオン / モバイルナビ）はクライアントコンポーネントで実装。

### 静的 HTML（`index.html`・フレームワーク不要）

```bash
open index.html                 # もしくは
python3 -m http.server 8080     # → http://localhost:8080

# スクリーンショット再生成（playwright-core + 同梱 Chromium）
npm install
node shot.js                    # → output/{desktop,mobile}-{fold,full}.png
```

依存: 静的版は外部 JS ライブラリ不使用。Web フォントのみ Google Fonts
（Space Grotesk / Zen Kaku Gothic New / JetBrains Mono）。
`artifact.html` は claude.ai Artifact 用に document ラッパーを外した同一ページ。

## Files

- `index.html` — ページ本体（HTML + inline CSS + vanilla JS）
- `reference-analysis.md` / `design-spec.md` / `wireframe.md` / `design-review.md`
- `shot.js` — Playwright スクリーンショットスクリプト
- `output/` — desktop/mobile の fold・full スクリーンショット

## Responsive breakpoints

Desktop `1440` / Tablet `≤1024` / Mobile `≤720`（capture: 1440×1200, 390×844）

## Reference similarity score

**92 / 100**（Nudot Design DNA 適合度。詳細は `design-review.md`）

## Known limitations

- Reference が egress ブロックのため厳密なピクセル比較は不可。DNA ベースの再構築。
- 実機の Three.js / WebGL cosmic 演出は CSS radial glow で軽量抽象化（§63/64: 不要な WebGL 導入禁止に準拠）。
- リンク先（各事業ページ・お問い合わせ）は `#` プレースホルダー。
- 画像は使用せず、CSS 抽象表現（cosmic glow / grid）で構成（第三者素材の転用回避）。
