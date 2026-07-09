# MYKENKO コードベースマップ（探索キャッシュ）

> **目的**: セッション開始時のリポジトリ再探索を不要にするための構造スナップショット。
> AIエージェント（Claude Code / Codex）はディレクトリを `find` / `ls` で探索する前に必ずこのファイルを読むこと。
> **更新ルール**: ディレクトリ構成・主要エントリポイント・コマンドが変わるPRでは、このファイルも同じPRで更新する。
> 最終更新: 2026-07-09

## リポジトリ全体像

pnpm workspace + Turborepo のモノレポ。EC（Laravel + Next.js）とメディア（Next.js + Payload CMS）が同居。

```
mykenko/
├── frontend/          # EC ストアフロント — Next.js 14 App Router（workspace 外・単独 npm）
├── backend/           # EC API — Laravel 11 + Sanctum
├── apps/
│   ├── media/         # メディアサイト mykenko.jp — Next.js + Payload CMS 3.x
│   ├── api/           # 内部 API api.mykenko.jp
│   ├── admin/         # 管理画面
│   └── price-monitor/ # 価格監視スクレイパー（workspace 対象外）
├── packages/
│   ├── db/            # 共有 DB スキーマ（db:generate / db:migrate / db:studio）
│   └── config/        # 共有設定
├── scripts/           # データ投入（import:symptoms / import:ingredients / import:all）
├── docs/              # architecture / compliance / db / operations / seo
├── GOAL_MAP.md        # EC 機能の実装進捗マップ（フェーズ別 ✅/🔶/❌）
└── docker-compose.yml # PostgreSQL 16 / Meilisearch / Qdrant / n8n / Ollama
```

## 主要エントリポイント

| 領域 | パス | 補足 |
|------|------|------|
| EC フロント画面 | `frontend/src/app/` | cart, checkout, products, account, admin, ranking 等のルート |
| EC 状態管理 | `frontend/src/store/` | |
| EC API クライアント/型 | `frontend/src/lib/`, `frontend/src/types/` | |
| EC API ルート | `backend/routes/api.php` | |
| EC コントローラ | `backend/app/Http/Controllers/{Api,Admin,Vendor}/` | |
| EC モデル/サービス | `backend/app/Models/`, `backend/app/Services/` | |
| EC マイグレーション | `backend/database/migrations/` | |
| メディア CMS | `apps/media/payload/` | Payload コレクション定義 |
| メディア画面 | `apps/media/app/`, `apps/media/components/` | |

## 認証（EC）

- Customer: `auth_token` / Vendor+Admin: `user_auth_token`（Sanctum）
- 保護ルートは Cookie `mykenko_auth=1` でミドルウェア制御
- DB: SQLite（開発）→ MySQL（本番）。メディア側は PostgreSQL 16。

## コマンド（検証はこの順で実行）

| 対象 | コマンド |
|------|---------|
| モノレポ全体 | `pnpm lint` / `pnpm typecheck` / `pnpm test` / `pnpm build`（turbo 経由） |
| frontend/ 単独 | `npm run lint` / `npm test` / `npm run build`（frontend/ 内で実行） |
| backend/ | `php artisan test` / `php artisan route:list` |
| 開発サーバ | frontend: `npm run dev`（:3000）/ backend: `php artisan serve --port=8000` |

## CI / GitHub

- CI: `.github/workflows/ci.yml`（1本のみ）
- PR テンプレート: `.github/pull_request_template.md`
- Issue テンプレート: `.github/ISSUE_TEMPLATE/`
- デフォルトブランチ: `main`（直接 push 禁止・PR 必須）
