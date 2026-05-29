# CI Setup — GitHub Actions

Issue #3 対応。`.github/workflows/ci.yml` を手動で作成してください（GitHub UI または git push で）。

## ci.yml の内容

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  lint-typecheck:
    name: Lint & Typecheck
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm turbo lint
      - run: pnpm turbo typecheck

  build:
    name: Build
    runs-on: ubuntu-latest
    needs: lint-typecheck
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm turbo build
        env:
          DATABASE_URL: postgresql://placeholder:placeholder@localhost:5432/placeholder
          NEXT_PUBLIC_SITE_URL: https://mykenko.jp
          NEXT_PUBLIC_SHOP_URL: https://shop.mykenko.jp
          PAYLOAD_SECRET: ci_placeholder_secret_32_characters_x
      - uses: actions/cache@v4
        with:
          path: .turbo
          key: ${{ runner.os }}-turbo-${{ github.sha }}
          restore-keys: |
            ${{ runner.os }}-turbo-
```

## 手動作成手順

```bash
mkdir -p .github/workflows
# 上記 yaml を .github/workflows/ci.yml として保存
git add .github/workflows/ci.yml
git commit -m "feat: add CI workflow (Issue #3)"
git push origin main
```
