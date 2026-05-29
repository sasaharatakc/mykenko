# Database Docs

MYKENKOのDB設計ドキュメント。

| ファイル | 内容 |
|---------|------|
| `v2_02_DB_DESIGN.md` | 全テーブル定義・25テーブルSQL DDL |
| `v2_03_ER_DIAGRAM.md` | Mermaid ERD |

## Drizzle ORM スキーマ

`packages/db/src/schema/` に各テーブルのスキーマを定義:

```
packages/db/src/schema/
├── symptoms.ts      — 症状マスタ
├── ingredients.ts   — 成分マスタ
├── products.ts      — 商品マスタ
├── categories.ts    — カテゴリ（L1/L2/L3 self-ref）
├── pages.ts         — SEOページ（polymorphic）
└── users.ts         — ユーザー・編集者
```

## マイグレーション

```bash
# スキーマ変更後
cd packages/db
pnpm db:generate  # drizzle-kit generate
pnpm db:migrate   # drizzle-kit migrate

# DB確認
pnpm db:studio    # Drizzle Studio（ブラウザUI）
```

## 接続情報

`.env.example` の `DATABASE_URL` を参照。ローカルは `docker-compose.yml` のPostgreSQLを使用。
