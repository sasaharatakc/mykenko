# Shofy Rewrite — Claude Code 作業メモ

## プロジェクト構成

- **frontend/** — Next.js 14 (App Router)
- **backend/** — Laravel 11 + Sanctum

### ローカル起動コマンド

```bash
# バックエンド
cd backend && php artisan serve --port=8000

# フロントエンド
cd frontend && npm run dev
```

- フロントエンド: http://localhost:3000
- バックエンド API: http://localhost:8000

### DB / キャッシュ設定（開発環境）

- DB: SQLite (`backend/database/database.sqlite`)
- Cache/Queue: `file` ドライバ（MySQL / Redis 未インストール）

---

## 認証アーキテクチャ

### ユーザー種別

| 種別 | モデル | テーブル | localStorage キー | Zustand ストア |
|------|--------|---------|-------------------|---------------|
| Customer（購入者） | `App\Models\Customer` | `customers` | `auth_token` | `authStore` → `shofy-auth` |
| Vendor / Admin（管理者） | `App\Models\User` | `users` | `user_auth_token` | `userAuthStore` → `shofy-user-auth` |

### ミドルウェア（Next.js）

- `shofy_auth` Cookie の有無でサーバーサイドリダイレクト判定
- Cookie はログイン成功時にクライアントが `document.cookie` で付与
- 保護パス: `/account`, `/checkout`, `/vendor`, `/admin`

### Axios インターセプター (`frontend/src/lib/api.ts`)

- リクエスト時: `user_auth_token` → `auth_token` の優先順で Bearer トークンを付与
- 401 受信時: 保護パスにいる場合のみ `/login?redirect=<現在のパス>` へリダイレクト

### Zustand rehydration

`onRehydrateStorage` コールバックで、persist から復元したトークンを
localStorage の専用キーに書き戻す（axios インターセプターが読めるようにするため）。

---

## 解決済み問題

### `/admin` アクセスがトップ (`/`) にリダイレクトされる

**根本原因（3つ）と修正内容**

#### 1. Sanctum が User トークンを 401 で弾く

- **原因**: `backend/config/auth.php` の `sanctum` ガードに `'provider' => 'customers'` が設定されており、Sanctum v4 の `hasValidProvider()` が `User instanceof Customer → false` を返していた
- **修正**: `'provider' => null` に変更 → どのモデルのトークンも受け付ける

```php
// backend/config/auth.php
'sanctum' => [
    'driver'   => 'sanctum',
    'provider' => null,  // Customer・User 両モデルのトークンを受け付ける
],
```

#### 2. Axios インターセプターが `redirect` パラメータなしで `/login` へ飛ばす

- **原因**: 401 時に `window.location.href = '/login'` と書いていた
- **修正**: `'/login?redirect=' + encodeURIComponent(window.location.pathname)` に変更
- **影響**: `redirect` なしで `/login` に来ると、middleware が `shofy_auth` Cookie を見て `/` にリダイレクトするループが発生していた

#### 3. ページリロード時に `user_auth_token` が localStorage に存在しない

- **原因**: `userAuthStore` の `onRehydrateStorage` でトークンを localStorage に書き戻す処理が未実装
- **修正**: `onRehydrateStorage` で `localStorage.setItem('user_auth_token', state.token)` を追加
- `authStore` にも同様に `auth_token` を書き戻す処理を追加

---

## 開発用アカウント

| 種別 | メール | パスワード |
|------|--------|-----------|
| Admin | admin@shofy.com | admin123 |

---

## 管理画面ページ一覧

| パス | 内容 | 状態 |
|------|------|------|
| `/admin` | ダッシュボード（売上・注文・顧客・商品・ベンダー統計） | ✅ |
| `/admin/products` | 商品一覧（検索・絞込・一括操作・削除） | ✅ |
| `/admin/products/new` | 商品新規作成 | ✅ |
| `/admin/products/[id]/edit` | 商品編集 | ✅ |
| `/admin/orders` | 注文一覧（ステータス更新） | ✅ |
| `/admin/orders/[id]` | 注文詳細（ステータス変更・配送追跡） | ✅ |
| `/admin/customers` | 顧客一覧（停止・削除） | ✅ |
| `/admin/customers/[id]` | 顧客詳細（注文履歴・住所・統計） | ✅ |
| `/admin/stores` | ベンダー一覧（認証ボタン） | ✅ |
| `/admin/stores/[id]` | ベンダー詳細（コミッション編集・認証取消・取引履歴） | ✅ |
| `/admin/shipments` | 出荷一覧（キャリア・追跡番号・ステータス管理） | ✅ |
| `/admin/returns` | 返品一覧（ステータスフィルター） | ✅ |
| `/admin/returns/[id]` | 返品詳細（承認・却下・完了処理・返金額） | ✅ |
| `/admin/withdrawals` | 出金申請一覧（承認・却下） | ✅ |
| `/admin/categories` | カテゴリ管理（追加・編集・削除） | ✅ |
| `/admin/blog` | ブログ一覧 | ✅ |
| `/admin/blog/new` | ブログ新規作成 | ✅ |
| `/admin/blog/[id]/edit` | ブログ編集 | ✅ |
| `/admin/settings` | サイト設定（通貨・コミッション・アクセス制御） | ✅ |
| `/admin/brands` | ブランド管理（追加・編集・削除・注目フラグ） | ✅ |
| `/admin/discounts` | 割引コード管理（％・固定・有効期限・使用回数） | ✅ |
| `/admin/flash-sales` | フラッシュセール管理（商品追加・削除・展開表示） | ✅ |
| `/admin/reviews` | レビュー管理（承認・却下・削除） | ✅ |

---

## 起動方法（preview_start 使用）

`.claude/launch.json` に設定済み。次回からは `preview_start` で起動可能。

---

## 既知の事項

- PHP 8.5 の deprecation warning は `backend/public/index.php` で抑制済み
- Admin ダッシュボード初期表示: 売上 $0.00、注文 0 件、顧客 0 件（DB 空のため）
- `frontend/.env.local` に `NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1` 設定済み
- `backend/.env` の `DB_DATABASE` パスを `/Users/user/ECAI/...` に修正済み
