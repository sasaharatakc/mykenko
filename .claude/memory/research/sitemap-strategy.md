# サイトマップ・技術SEO戦略
調査日: 2026-05-28

## 実装済み
- 動的サイトマップ6種（商品/カテゴリ/ストア/ブランド/ブログ/静的）
- robots.ts AIクローラー対応・MYKENKOドメイン修正
- public/robots.txt削除（バグ修正）
- noindex: /login, /register
- canonical: /shop フィルタURL

## Laravel追加API（要実装）
1. GET /api/v1/sitemap/products — slug+updated_atのみ返す軽量版
2. GET /api/v1/categories/tree — 全階層ツリー
3. GET /api/v1/blog/categories — ブログカテゴリ

## 構造化データ実装優先順
1. Product スキーマ（商品詳細）— リッチリザルト直結
2. BreadcrumbList（全ページ）— CTR改善
3. Organization（トップ）— Knowledge Panel
4. ItemList（カテゴリ一覧）— AI Overview対応
5. Article（ブログ）— Google Discover対応

## Core Web Vitals優先対応
1. LCP: 商品画像 priority + sizes属性
2. CLS: 画像寸法事前確保
3. INP: フィルタ操作 useTransition/300msデバウンス
4. TTFB: Laravel N+1解消 + Cache::remember()
5. クロールバジェット: /shop フィルタにcanonical設定
