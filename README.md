# MYKENKO

> 日本最大のヘルスケア知識プラットフォーム

MYKENKO は **Healthcare Knowledge Graph Platform** です。
症状・成分・医薬品情報を科学的根拠に基づいて提供し、ユーザーが正しい健康情報から正しい商品選択へたどり着く最短経路を提供します。

---

## アーキテクチャ概要

```
mykenko.jp       ← Media / SEO / AI相談
shop.mykenko.jp  ← Commerce / EC
api.mykenko.jp   ← 内部API
```

## 技術スタック

| 役割 | 技術 |
|------|------|
| Media Frontend | Next.js 14 (App Router) |
| CMS | Payload CMS 3.x |
| Database | PostgreSQL 16 |
| Search | Meilisearch |
| Vector DB | Qdrant |
| LLM | Ollama (Llama3) |
| Automation | n8n |
| Commerce | Shofy (Laravel 11) |

---

## ローカル開発環境

### 必要なもの
- Node.js >= 20
- pnpm >= 9
- Docker & Docker Compose

### セットアップ

```bash
# 1. リポジトリをクローン
git clone https://github.com/sasaharatakc/mykenko.git
cd mykenko

# 2. 環境変数を設定
cp .env.example .env
# .env を編集して各種キーを設定

# 3. Docker サービス起動
docker compose up -d

# 4. 依存関係インストール
pnpm install

# 5. DBマイグレーション
pnpm db:migrate

# 6. 開発サーバー起動
pnpm dev
```

### サービス一覧

| サービス | URL |
|---------|-----|
| Media (Next.js) | http://localhost:3000 |
| Payload Admin | http://localhost:3000/admin |
| API | http://localhost:3001 |
| n8n | http://localhost:5678 |
| Meilisearch | http://localhost:7700 |
| Qdrant | http://localhost:6333 |

---

## コンプライアンス

このプロジェクトは医療・健康情報を扱います。**薬機法・景表法・医療広告ガイドライン**を最上位制約として全レイヤーに適用します。

- 医薬品の効能効果を保証する表現禁止
- 根拠のない「No.1」「最安値」等禁止
- 診断・治療判断・服薬指示禁止
- 著者・監修者・参考文献の必須表示

---

## ドキュメント

`docs/` フォルダに全設計書を格納しています。

## ライセンス

Private — All rights reserved.
