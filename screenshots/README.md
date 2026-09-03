# pharmeasy.in フルページ スクリーンショット

pharmeasy.in の全ページをフルページ撮影して `pharmeasy/` フォルダにまとめるためのスクリプトです。

## 注意（撮影が未実行の理由）

このリモート実行環境のネットワークポリシーにより、外部サイト（pharmeasy.in を含む一般Web）への
アウトバウンド通信がプロキシで拒否（403 policy denial）されているため、**環境内では撮影を実行できませんでした**。
`pharmeasy/manifest.json` は空の初期状態です。

撮影するには、外部アクセスが可能な環境（ローカルPC等）で以下を実行してください。
またはこの環境のネットワークポリシーを許可設定に変更してください
（参照: https://code.claude.com/docs/en/claude-code-on-the-web ）。

## 使い方（外部アクセス可能な環境）

```bash
npm install playwright
npx playwright install chromium

# 撮影実行（トップ→ナビ/フッターのリンクを辿り最大 MAX 件をフルページ撮影）
OUT_DIR=./pharmeasy MAX=40 node capture_pharmeasy.js
```

- `OUT_DIR`: 保存先フォルダ
- `MAX`: 撮影する最大ページ数（既定 40）。pharmeasy.in は巨大なため全URL網羅は非現実的で、
  トップ＋主要ナビ/カテゴリに絞る想定です。
- 出力: 各ページの `NN_<slug>.png`（フルページ）と `manifest.json`（URL対応表）

## 環境内の Chromium で実行する場合

環境の Chromium バイナリを使う場合は `playwright-core` で十分です。
`executablePath` はスクリプト内で `/opt/pw-browsers/chromium-1194/chrome-linux/chrome` を指しています。
