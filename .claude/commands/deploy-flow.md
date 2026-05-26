# /deploy-flow — デプロイフロー

## 用途
MYKENKOのコードをステージング→本番環境へ安全にデプロイする。

## デプロイ前チェックリスト
- [ ] テストが全て通っているか（`npm test` / `php artisan test`）
- [ ] ビルドが成功するか（`npm run build`）
- [ ] マイグレーションの後方互換性を確認したか
- [ ] 環境変数が本番環境に設定されているか
- [ ] ロールバック手順を確認したか

## デプロイ手順（Laravel）
```bash
# 1. メンテナンスモード ON
php artisan down

# 2. コードをプル
git pull origin main

# 3. 依存関係インストール
composer install --no-dev --optimize-autoloader

# 4. マイグレーション実行
php artisan migrate --force

# 5. キャッシュクリア・最適化
php artisan config:cache
php artisan route:cache
php artisan view:cache

# 6. メンテナンスモード OFF
php artisan up
```

## デプロイ手順（Next.js）
```bash
npm ci
npm run build
# PM2 / Vercel / AWS でサービス再起動
```

## ロールバック手順
```bash
git revert HEAD
php artisan migrate:rollback  # マイグレーションがある場合
```
