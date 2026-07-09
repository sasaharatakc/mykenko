# AI Organization OS — MYKENKO プロジェクトルール

## トークン最適化ルール（最優先）
- **探索の前に必ず `docs/CODEBASE_MAP.md` を読む。** 構造把握のための `find`/`ls`/`tree` の全体走査を繰り返さない。マップにない情報だけをピンポイントで調べる。
- 構造・コマンド・エントリポイントを変えるPRでは `docs/CODEBASE_MAP.md` を同じPRで更新する（次のセッションの再探索を防ぐ）。
- GitHub MCP は `minimal_output: true`・ページネーション（5〜10件）を使い、同じIssue/PRを同一セッションで再取得しない。取得済みの内容は自分のコンテキストから使う。
- 広範囲のコード検索は Explore サブエージェント（読み取り専用）に任せ、本会話にはファイル本体ではなく結論だけを持ち帰る。
- ファイルは全文Readせず、必要な範囲を `offset`/`limit` や Grep で絞って読む。
- 同一情報を出力に繰り返さない。最終報告は「変更ファイル・検証結果・リスク・次のアクション」のみ。中間の経過説明は最小限。
- 読み込み順: `docs/CODEBASE_MAP.md`（コードに触る前に必ず）→ `docs/ai-org/AGENT_REGISTRY.md`（**サブエージェント起動時だけ**。coreから選び、optionalは必要時のみ）。全体像の `docs/ai-org/ORGANIZATION.md` は組織再設計時のみ。
- エージェントの追加・削除・復帰は `docs/ai-org/AGENT_POLICY.md` に従う。**似たエージェントの新規作成は禁止**（既存を更新）。追加時は AGENT_REGISTRY.md 更新必須（検証: `python3 tools/ai/validate-agent-registry.py`）。

## 常に守るルール
- ユーザー向けの計画・説明は日本語を使用（コード・英語固有名詞を除く）
- 実装依頼はチャット説明より実際のファイル変更を優先
- 独立した調査・監査・並列レビューはサブエージェントを使用、繰り返しワークフローはスキルを使用
- 明示的な承認なしに本番データの公開・送信・削除・取引・変更を行わない
- 医療/YMYL/医薬品コンテンツは効果の断言を避け、コンプライアンスレビューを実行
- SEO/GEO/SNS/PRは戦略・実行・レビュー・メモリ書き戻しを分離

## GitHub 運用ルール（SSOT）
- GitHubを単一の真実の源とする。**Issue がなければ作業を開始しない。**
- フロー: Issue作成 → Branch作成 → 実装 → PR作成 → CI確認 → Review → Merge
- ブランチ命名: `{type}/{issue-number}-{short-name}`
  - type: `feature` / `fix` / `content` / `seo` / `compliance` / `devops`（例: `feature/21-product-page-v2`）
- ラベル: `type:*`（feature/bug/content/seo/compliance/research/automation/devops）、`priority:S〜C`（S=売上・法規制・重大バグ→即日）、`status:*`（todo/doing/review/blocked/done）、`area:*`（media/shop/ai/price-monitor/admin/infra）、`risk:*`（low/medium/high/legal）
- 毎朝の確認順: priority:S → status:blocked → status:review → 承認待ちPR → 失敗Actions
- PR必須項目: 概要・`Closes #番号`・変更内容・動作確認・規制チェック（コンテンツ変更時）・Claude/Codexへの申し送り・残課題
- main保護: 直接push禁止・PR必須（Review 1件以上）・CI成功必須・force push/delete禁止

## 検証コマンド
- モノレポ: `pnpm lint` / `pnpm typecheck` / `pnpm test` / `pnpm build`
- frontend/（workspace外）: `npm run lint`, `npm test`, `npm run build`
- backend/: `php artisan test`, `php artisan route:list`
- Python: `pytest`, `ruff check`, `mypy`
- 最終サマリー前に `git status` と `git diff` を確認

## 出力標準
完了タスクには必ず含める: 変更ファイル、検証結果、リスク、次のアクション

## プロジェクト: MYKENKO
- 構造の詳細: `docs/CODEBASE_MAP.md`（**まずこれを読む**）
- フロントエンド: Next.js 14 (App Router) — `frontend/` / バックエンド: Laravel 11 + Sanctum — `backend/`
- DB: SQLite (開発), MySQL (本番)
- 認証: Customer (`auth_token`) / Vendor+Admin (`user_auth_token`)、Cookie `mykenko_auth=1` で保護ルート制御
- AI組織の全体像（Crew/スキル/MCP/Memory）: `docs/ai-org/ORGANIZATION.md`（必要時のみ）
