# MYKENKO — Codex / AIエージェント共通ルール

> Codex はこのファイルをセッション開始時に自動で読む。Claude Code 向けの詳細ルールは `CLAUDE.md`（内容は本ファイルの上位互換）。

## トークン最適化（最優先）
- **リポジトリを探索する前に `docs/CODEBASE_MAP.md` を読む。** 構造・エントリポイント・コマンドはそこに集約済み。全体走査（`find` / `ls -R` / 全ファイルRead）を繰り返さない。
- マップにない情報だけをピンポイントで調べ、構造を変えるPRではマップも同じPRで更新する。
- ファイルは必要な範囲だけ読む。同じファイル・同じIssue/PRを同一セッションで再取得しない。
- 出力は結論優先。最終報告は「変更ファイル・検証結果・リスク・次のアクション」に絞る。
- AIエージェント/コマンド定義に触れる場合: 台帳は `docs/ai-org/AGENT_REGISTRY.md`・`docs/ai-org/COMMAND_REGISTRY.md`、運用ルールは各 POLICY。似たエージェント/コマンドの新規作成禁止・Registry更新必須（検証: `bash tools/validate_all.sh`）。導線: `docs/ai-org/README.md`。

## リポジトリ概要
- pnpm workspace + Turborepo モノレポ。詳細は `docs/CODEBASE_MAP.md`。
- EC: `frontend/`（Next.js 14, workspace外）+ `backend/`（Laravel 11 + Sanctum）
- メディア: `apps/media/`（Next.js + Payload CMS）、他 `apps/api` `apps/admin` `apps/price-monitor`
- DB: SQLite（開発）/ MySQL（本番）、メディアは PostgreSQL 16

## 検証コマンド
- モノレポ: `pnpm lint` / `pnpm typecheck` / `pnpm test` / `pnpm build`
- frontend/: `npm run lint`, `npm test`, `npm run build`（frontend/ 内で）
- backend/: `php artisan test`, `php artisan route:list`

## GitHub 運用（SSOT）
- Issue がなければ作業を開始しない。フロー: Issue → Branch → 実装 → PR → CI → Review → Merge
- ブランチ命名: `{feature|fix|content|seo|compliance|devops}/{issue-number}-{short-name}`
- PR必須項目: 概要・`Closes #番号`・変更内容・動作確認・規制チェック（コンテンツ変更時）・申し送り・残課題
- main への直接 push 禁止・force push 禁止

## 安全ルール
- 説明は日本語（コード・固有名詞を除く）
- 明示的な承認なしに本番データの公開・送信・削除・変更を行わない
- 医療/YMYL コンテンツは効果を断言せず、薬機法・景表法の観点でレビューする
