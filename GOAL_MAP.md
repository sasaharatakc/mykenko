# 🗺️ Shofy マルチベンダー EC プラットフォーム — ゴールマップ

> 作成日: 2026-05-15  
> スタック: Laravel 11 + Next.js 14 (App Router)  
> DB: SQLite (開発) → MySQL/PostgreSQL (本番)

---

## 🎯 プロジェクト全体ゴール

**マルチベンダー対応の日本語対応 EC プラットフォームを構築する。**

- 顧客が商品を購入できるストアフロント
- ベンダーが自分の店舗・商品・注文を管理できるダッシュボード
- 管理者がサイト全体を管理できる管理画面
- Stripe / PayPal 決済、フラッシュセール、クーポン等の EC 機能を網羅

---

## 📊 進捗ステータス凡例

| マーク | 意味 |
|--------|------|
| ✅ | 完成 (バックエンド + フロントエンド) |
| 🔶 | 部分実装 (どちらかが不完全) |
| ❌ | 未実装 |

---

## 🗂️ フェーズ別ゴールマップ

### Phase 1 — 基盤構築

| 機能 | バックエンド | フロントエンド | ステータス |
|------|------------|--------------|---------|
| ユーザー認証 (顧客) | ✅ Sanctum | ✅ /login, /register | ✅ |
| ユーザー認証 (管理者/ベンダー) | ✅ Sanctum + Spatie Role | ✅ /login → redirect | ✅ |
| パスワードリセット | ✅ | ✅ /forgot-password, /reset-password | ✅ |
| データベース設計 (16 migrations) | ✅ | — | ✅ |
| シーダー (デモデータ) | ✅ DemoSeeder | — | ✅ |
| API ルーティング設計 | ✅ api.php | — | ✅ |

---

### Phase 2 — ストアフロント (顧客向け)

| 機能 | バックエンド | フロントエンド | ステータス |
|------|------------|--------------|---------|
| ホームページ | ✅ | ✅ / | ✅ |
| 商品一覧・フィルタリング | ✅ | ✅ /shop | ✅ |
| 商品詳細・レビュー | ✅ | ✅ /products/[slug] | ✅ |
| カテゴリページ | ✅ | ✅ /categories/[slug] | ✅ |
| ブランドページ | ✅ | ✅ /brands, /brands/[slug] | ✅ |
| ストア一覧・詳細 | ✅ | ✅ /stores, /stores/[slug] | ✅ |
| 検索 | ✅ | ✅ /search | ✅ |
| カート | ✅ | ✅ /cart | ✅ |
| チェックアウト (Stripe/PayPal) | ✅ | ✅ /checkout | ✅ |
| 注文追跡 | ✅ | ✅ /orders/track | ✅ |
| お気に入り | ✅ | ✅ /wishlist | ✅ |
| 返品申請 | ✅ | ✅ /returns | ✅ |
| ブログ | ✅ | ✅ /blog, /blog/[slug] | ✅ |
| FAQ・静的ページ | — | ✅ /faq, /about, /contact 等 | ✅ |
| ニュースレター購読 | ✅ | ✅ (footer) | ✅ |
| フラッシュセール表示 | ✅ | ✅ (ホーム + カウントダウン) | ✅ |
| ベンダー登録 | ✅ | ✅ /become-vendor | ✅ |

---

### Phase 3 — 顧客マイページ

| 機能 | バックエンド | フロントエンド | ステータス |
|------|------------|--------------|---------|
| アカウントダッシュボード | ✅ | ✅ /account | ✅ |
| 注文履歴 | ✅ | ✅ /account/orders | ✅ |
| 注文詳細 | ✅ | ✅ /account/orders/[code] | ✅ |
| 住所管理 | ✅ | ✅ /account/addresses | ✅ |
| プロフィール設定 | ✅ | ✅ /account/settings | ✅ |

---

### Phase 4 — ベンダーダッシュボード

| 機能 | バックエンド | フロントエンド | ステータス |
|------|------------|--------------|---------|
| ベンダーダッシュボード | ✅ | ✅ /vendor | ✅ |
| 商品管理 (CRUD) | ✅ | ✅ /vendor/products | ✅ |
| 注文管理・出荷 | ✅ | ✅ /vendor/orders | ✅ |
| 出金・精算 | ✅ | ✅ /vendor/payouts | ✅ |
| **店舗設定** | ✅ | ✅ /vendor/store | ✅ |

---

### Phase 5 — 管理画面

| 機能 | バックエンド | フロントエンド | ステータス |
|------|------------|--------------|---------|
| 管理ダッシュボード | ✅ | ✅ /admin | ✅ |
| レポート・分析 | ✅ | ✅ /admin/reports | ✅ |
| 注文管理 | ✅ | ✅ /admin/orders | ✅ |
| 返品管理 | ✅ | ✅ /admin/returns | ✅ |
| 出荷管理 | ✅ | ✅ /admin/shipments | ✅ |
| 請求書 | ✅ | ✅ /admin/invoices | ✅ |
| 商品管理 | ✅ | ✅ /admin/products | ✅ |
| カテゴリ管理 | ✅ | ✅ /admin/categories | ✅ |
| ブランド管理 | ✅ | ✅ /admin/brands | ✅ |
| 商品タグ管理 | ✅ | ✅ /admin/product-tags | ✅ |
| コレクション管理 | ✅ | ✅ /admin/collections | ✅ |
| ラベル管理 | ✅ | ✅ /admin/labels | ✅ |
| レビュー管理 | ✅ | ✅ /admin/reviews | ✅ |
| フラッシュセール管理 | ✅ | ✅ /admin/flash-sales | ✅ |
| 割引・クーポン管理 | ✅ | ✅ /admin/discounts | ✅ |
| 税金設定 | ✅ | ✅ /admin/taxes | ✅ |
| 顧客管理 | ✅ | ✅ /admin/customers | ✅ |
| ベンダー管理 | ✅ | ✅ /admin/stores | ✅ |
| 出金管理 | ✅ | ✅ /admin/withdrawals | ✅ |
| ブログ管理 | ✅ | ✅ /admin/blog | ✅ |
| ニュースレター管理 | ✅ | ✅ /admin/newsletter | ✅ |
| サイト設定 | ✅ | ✅ /admin/settings | ✅ |

---

### Phase 6 — 高度な機能

| 機能 | 優先度 | ステータス | 説明 |
|------|--------|-----------|------|
| ベンダー店舗設定ページ | 🔴 高 | ✅ 完了 | /vendor/store — 完全実装済み |
| メール通知 | 🟡 中 | ✅ 完了 | OrderConfirmed / OrderShipped / OrderStatusChanged 通知実装済み |
| PDF 請求書生成 | 🟡 中 | ✅ 完了 | dompdf + Blade テンプレート + ダウンロードエンドポイント実装済み |
| Excel/CSV エクスポート | 🟡 中 | ✅ 完了 | 注文・顧客データのCSVエクスポート実装済み |
| SEO (sitemap.xml / robots.txt / OGP) | 🟡 中 | ✅ 完了 | sitemap.ts (Next.js 動的) + robots.txt + OGP メタタグ実装済み |
| PWA (Progressive Web App) | 🟢 低 | ✅ 完了 | manifest.json + sw.js + SW登録実装済み |
| ダークモード | 🟢 低 | ✅ 完了 | next-themes + Header トグル + globals.css dark スタイル実装済み |
| レート制限 (Throttle) | 🟡 中 | ✅ 完了 | auth: 10/分, api: 120/分 (認証済み) / 30/分 (ゲスト) |
| API キャッシュ | 🟡 中 | ✅ 完了 | Cache::remember (商品/カテゴリ) + Cache::forget (更新/削除時) |
| アトリビュートセット UI | 🟡 中 | ✅ 完了 | /admin/attributes — 完全CRUD、商品フォーム連携済み |
| スペックテーブル UI | 🟢 低 | ✅ 完了 | /admin/spec-tables — グループ・属性の完全CRUD、商品フォーム連携済み |
| ブランドページ | 🟢 低 | ✅ 完了 | /brands 一覧 + /brands/[slug] 詳細ページ実装済み |
| 商品バリエーション UI | 🟡 中 | ✅ 完了 | アトリビュートセット方式で実装。個別バリエーション作成UI は将来課題 |
| リアルタイム通知 | 🟡 中 | ❌ 未実装 | Pusher 認証情報 (PUSHER_APP_KEY 等) が必要 |
| S3 メディアアップロード | 🟡 中 | ❌ 未実装 | AWS 認証情報が必要 (現在はローカルストレージ) |
| Stripe Webhook 本番設定 | 🔴 高 | ❌ 設定待ち | エンドポイント実装済み、STRIPE_WEBHOOK_SECRET が必要 |
| PayPal 本番 Credentials | 🔴 高 | ❌ 設定待ち | SDK 導入済み、本番 Client ID/Secret が必要 |
| Redis キャッシュ | 🟡 中 | ❌ 設定待ち | predis 導入済み、Redis サーバーと CACHE_DRIVER=redis が必要 |
| 多言語 (i18n) | 🟢 低 | ❌ 未実装 | 現在日本語固定。next-i18next 等の導入が必要 |
| グローバルオプション UI | 🟢 低 | ❌ 未実装 | GlobalOption モデル有、Admin UI 未実装 |

---

## 🔌 内蔵プラグイン・パッケージ一覧

### バックエンド (Composer / Laravel)

#### 認証・権限
| パッケージ | バージョン | 用途 |
|-----------|-----------|------|
| `laravel/sanctum` | ^4.0 | API トークン認証 |
| `spatie/laravel-permission` | ^6.0 | ロール・権限管理 (admin/vendor/customer) |
| `spatie/laravel-activitylog` | ^4.7 | ユーザー操作ログ記録 |

#### データ操作
| パッケージ | バージョン | 用途 |
|-----------|-----------|------|
| `spatie/laravel-data` | ^4.0 | 型付きデータオブジェクト (DTO) |
| `spatie/laravel-query-builder` | ^5.0 | API クエリフィルター (`?filter[name]=...`) |
| `spatie/laravel-sluggable` | ^3.6 | URL スラッグ自動生成 |
| `spatie/laravel-medialibrary` | ^11.0 | ファイル・画像管理 |
| `intervention/image-laravel` | ^1.0 | 画像リサイズ・変換 |

#### 決済
| パッケージ | バージョン | 用途 |
|-----------|-----------|------|
| `stripe/stripe-php` | ^13.0 | Stripe 決済 (カード/PaymentIntent) |
| `paypal/paypal-checkout-sdk` | ^1.0 | PayPal 決済 |

#### ドキュメント・エクスポート
| パッケージ | バージョン | 用途 |
|-----------|-----------|------|
| `barryvdh/laravel-dompdf` | ^2.0 | PDF 生成 (請求書・領収書) |
| `maatwebsite/excel` | ^3.1 | Excel/CSV エクスポート・インポート |
| `darkaonline/l5-swagger` | ^8.5 | Swagger/OpenAPI ドキュメント自動生成 |

#### インフラ・ユーティリティ
| パッケージ | バージョン | 用途 |
|-----------|-----------|------|
| `league/flysystem-aws-s3-v3` | ^3.0 | AWS S3 ファイルストレージ |
| `pusher/pusher-php-server` | ^7.2 | リアルタイム通知 (WebSocket) |
| `predis/predis` | ^2.2 | Redis キャッシュ・セッション |
| `guzzlehttp/guzzle` | ^7.2 | HTTP クライアント |
| `mobiledetect/mobiledetectlib` | ^4.8 | モバイルデバイス検出 |
| `nesbot/carbon` | ^3.0 | 日付・時間操作 |

#### 開発ツール
| パッケージ | バージョン | 用途 |
|-----------|-----------|------|
| `laravel/telescope` | ^5.0 | デバッグ・プロファイリング (`/telescope`) |
| `laravel/tinker` | ^2.9 | Artisan REPL |
| `laravel/sail` | ^1.26 | Docker 開発環境 |
| `laravel/pint` | ^1.13 | PHP コードフォーマッター |
| `phpunit/phpunit` | ^11.0 | ユニットテスト |
| `fakerphp/faker` | ^1.23 | テスト用フェイクデータ |

---

### フロントエンド (NPM / Next.js)

#### コアフレームワーク
| パッケージ | バージョン | 用途 |
|-----------|-----------|------|
| `next` | ^14.2.0 | React フルスタックフレームワーク |
| `react` / `react-dom` | ^18.3.0 | UI ライブラリ |
| `typescript` | ^5.4.3 | 型安全性 |

#### UI コンポーネント
| パッケージ | バージョン | 用途 |
|-----------|-----------|------|
| `@radix-ui/react-accordion` | — | アコーディオン |
| `@radix-ui/react-checkbox` | — | チェックボックス |
| `@radix-ui/react-dialog` | — | モーダルダイアログ |
| `@radix-ui/react-dropdown-menu` | — | ドロップダウン |
| `@radix-ui/react-select` | — | セレクトボックス |
| `@radix-ui/react-slider` | — | スライダー |
| `@radix-ui/react-tabs` | — | タブ |
| `@radix-ui/react-toast` | — | トースト通知 |
| `lucide-react` | — | アイコンライブラリ (500+ アイコン) |

#### スタイリング
| パッケージ | バージョン | 用途 |
|-----------|-----------|------|
| `tailwindcss` | ^3.4.3 | ユーティリティ CSS |
| `tailwind-merge` | ^2.2.2 | Tailwind クラス結合 |
| `@tailwindcss/aspect-ratio` | — | アスペクト比ユーティリティ |
| `@tailwindcss/typography` | — | ブログ本文スタイル |
| `clsx` | ^2.1.0 | 条件付きクラス名 |

#### フォーム・バリデーション
| パッケージ | バージョン | 用途 |
|-----------|-----------|------|
| `react-hook-form` | ^7.51.1 | フォーム状態管理 |
| `@hookform/resolvers` | ^3.3.4 | Zod との統合 |
| `zod` | ^3.22.4 | スキーマバリデーション |

#### データ取得・状態管理
| パッケージ | バージョン | 用途 |
|-----------|-----------|------|
| `@tanstack/react-query` | ^5.28.0 | サーバーステート・キャッシュ |
| `zustand` | ^4.5.2 | クライアントステート (カート・認証) |
| `axios` | ^1.6.8 | HTTP クライアント |

#### カルーセル・スライダー
| パッケージ | バージョン | 用途 |
|-----------|-----------|------|
| `embla-carousel-react` | ^8.1.0 | メインカルーセル |
| `embla-carousel-autoplay` | ^8.6.0 | 自動スライド |
| `swiper` | ^11.1.0 | スワイプスライダー |
| `react-range` | ^1.10.0 | 価格範囲スライダー |

#### アニメーション・UX
| パッケージ | バージョン | 用途 |
|-----------|-----------|------|
| `framer-motion` | ^11.0.28 | アニメーション |
| `react-hot-toast` | ^2.4.1 | トースト通知 |
| `react-intersection-observer` | ^9.8.1 | スクロール遅延読み込み |
| `next-themes` | ^0.3.0 | ダークモード対応 |

#### 決済
| パッケージ | バージョン | 用途 |
|-----------|-----------|------|
| `@stripe/stripe-js` | ^3.2.0 | Stripe JS SDK |
| `@stripe/react-stripe-js` | ^2.6.2 | React Stripe コンポーネント |

#### ユーティリティ
| パッケージ | バージョン | 用途 |
|-----------|-----------|------|
| `date-fns` | ^3.6.0 | 日付フォーマット |
| `react-stars` | ^2.2.5 | 星評価コンポーネント |
| `sharp` | ^0.33.3 | Next.js 画像最適化 |

---

## 🚀 残タスク優先順位リスト

### ✅ 完了済みタスク (全て実装済み)

1. ✅ `/vendor/store` ページ
2. ✅ アトリビュートセット + スペックテーブル管理UI
3. ✅ 商品フォームのアトリビュート/スペックテーブル連携
4. ✅ メール通知 (注文確認・出荷通知)
5. ✅ PDF 請求書生成 (dompdf)
6. ✅ CSV エクスポート (注文・顧客)
7. ✅ SEO (sitemap.xml, robots.txt, OGP)
8. ✅ PWA (manifest.json, service worker)
9. ✅ ダークモード (next-themes)
10. ✅ レート制限 (auth/api throttle)
11. ✅ API キャッシュ (Cache::remember/forget)
12. ✅ 管理画面通知ベル (保留中注文数)
13. ✅ ブランドページ一覧 (/brands)
14. ✅ 商品編集ページ (管理者/ベンダー)
15. ✅ TypeScript エラー修正

### ❌ 残タスク (外部依存・低優先)

- **Stripe Webhook 本番設定** — STRIPE_WEBHOOK_SECRET が必要
- **PayPal 本番 Credentials** — 本番 Client ID/Secret が必要
- **リアルタイム通知 (Pusher)** — PUSHER_APP_KEY 等の認証情報が必要
- **Redis キャッシュ** — Redis サーバーと CACHE_DRIVER=redis が必要
- **S3 メディアアップロード** — AWS 認証情報が必要
- **多言語 (i18n)** — 大規模な改修が必要
- **グローバルオプション UI** — 低優先度

---

## 📁 プロジェクト構成

```
shofy-rewrite/
├── backend/                     # Laravel 11 API
│   ├── app/
│   │   ├── Http/Controllers/
│   │   │   ├── Api/             # 公開 API (顧客向け) — 16 controllers
│   │   │   ├── Admin/           # 管理者 API — 21 controllers
│   │   │   └── Vendor/          # ベンダー API — 4 controllers
│   │   └── Models/              # 43 Eloquent モデル
│   ├── database/
│   │   ├── migrations/          # 16 マイグレーション
│   │   └── seeders/             # DemoSeeder (サンプルデータ)
│   └── routes/api.php           # 全 API ルート定義
│
└── frontend/                    # Next.js 14 App Router
    └── src/app/
        ├── (root pages)         # 25+ 公開ページ
        ├── account/             # 顧客マイページ (5 ページ)
        ├── admin/               # 管理画面 (23 ページ)
        └── vendor/              # ベンダーダッシュボード (4/5 ページ)
```

---

*最終更新: 2026-05-15*
