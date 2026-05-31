# mykenko-agent-registry

MYKENKOプロジェクトの Agent / Skill / Command を一元管理するレジストリリポジトリです。

## 目的

- **GitHub を正本** として、すべての Agent・Skill・Command の定義・バージョン・履歴を管理する
- Claude Code（ローカル開発・テスト）と Claude Console（Managed Agents・Custom Skills Library）の橋渡しをする
- 薬機法・YMYL・景表法などコンプライアンスが必要な業務で使う Agent/Skill を安全に管理する

## 3層管理アーキテクチャ

```
GitHub (正本)
  ├── agents/         ← Agent定義（Markdown + frontmatter）
  ├── skills/         ← Skill定義（SKILL.md形式）
  ├── commands/       ← スラッシュコマンド定義
  ├── manifests/      ← JSON台帳（agents.json, skills.json等）
  ├── templates/      ← 新規作成テンプレート
  ├── scripts/        ← スキャン・同期・パッケージスクリプト
  └── docs/           ← 運用マニュアル

Claude Code（ローカル開発・テスト）
  ├── ~/.claude/agents/          ← グローバルAgent
  ├── /project/.claude/agents/   ← プロジェクトAgent
  ├── /project/.claude/skills/   ← プロジェクトSkill
  └── /project/.claude/commands/ ← スラッシュコマンド

Claude Console（本番運用）
  ├── Managed Agents   ← approvedなAgentを反映
  └── Custom Skills Library ← パッケージ済みSkillを登録
```

## GitHubを正本にする理由

1. **バージョン管理** — すべての変更が git log として残る
2. **レビュー** — PR ベースで変更を確認・承認してから反映できる
3. **ロールバック** — 問題が起きたらすぐに前バージョンに戻せる
4. **重複防止** — 一元管理により同じ目的の Agent/Skill が乱立しない
5. **Console移行の元データ** — build-manifests.py で Console 用フォーマットに変換できる

## 現在の登録状況（棚卸し時点: 2026-05-31）

| 種別 | 検出数 | MYKENKO関連 | 共通利用可 |
|------|--------|-------------|-----------|
| Agents | 153 | 24（新規ドラフト）| 129（既存） |
| Skills | 63 | 20（移行候補）| 63（既存） |
| Commands | 63 | 63（全共通） | 63 |
| Global Skills | 1 | — | 1（session-start-hook）|

## ディレクトリ構成

```
mykenko-agent-registry/
  README.md                   ← このファイル
  AGENT_GOVERNANCE.md         ← Agent管理ルール
  SKILL_GOVERNANCE.md         ← Skill管理ルール
  MIGRATION_TO_CLAUDE_CONSOLE.md ← Console移行手順
  NAMING_RULES.md             ← 命名規則
  SECURITY_RULES.md           ← セキュリティルール
  CHANGELOG.md                ← 変更履歴
  agents/{category}/          ← Agent定義ファイル
  skills/{category}/          ← Skill定義ファイル
  commands/{global,project}/  ← コマンド定義
  manifests/                  ← JSON台帳
  templates/                  ← 作成テンプレート
  scripts/                    ← 自動化スクリプト
  docs/                       ← 運用マニュアル
```

## 新規 Agent 作成方法

```bash
# 1. テンプレートをコピー
cp templates/agent.template.md agents/{category}/{agent-name}.md

# 2. frontmatterとsystem promptを記入

# 3. manifests/agents.json に追加

# 4. agent-skill-map.json に使用Skillを登録

# 5. Claude Codeにコピーしてテスト
bash scripts/copy-to-claude-code.sh

# 6. レビュー・approvedに変更

# 7. Console Managed Agentへ反映
```

詳細: [docs/HOW_TO_CREATE_NEW_AGENT.md](docs/HOW_TO_CREATE_NEW_AGENT.md)

## 新規 Skill 作成方法

```bash
# 1. テンプレートをコピー
mkdir -p skills/{category}/{skill-name}
cp templates/skill.template.md skills/{category}/{skill-name}/SKILL.md

# 2. Skill内容を記入

# 3. manifests/skills.json に追加

# 4. Claude Codeでテスト

# 5. zip化してConsoleへアップロード
python3 scripts/package-skills.py

# 6. manifests/console-map.json にIDとversionを記録
```

詳細: [docs/HOW_TO_CREATE_NEW_SKILL.md](docs/HOW_TO_CREATE_NEW_SKILL.md)

## Console 反映方法

1. `python3 scripts/prepare-console-upload.py` を実行
2. `dist/console-upload/` に生成されたファイルを確認
3. Managed Agents / Custom Skills Library にアップロード
4. `manifests/console-map.json` にIDとバージョンを記録

詳細: [MIGRATION_TO_CLAUDE_CONSOLE.md](MIGRATION_TO_CLAUDE_CONSOLE.md)

## 禁止事項

- Console に未承認（status: draft）の Agent/Skill をアップロードしない
- APIキー・トークン・認証情報をこのリポジトリに含めない
- 既存ファイルをレビューなしに上書きしない
- `rm`・`git reset --hard` 等の破壊的操作は必ず事前承認を得ること
- YMYL・医療・薬機法に関わるコンテンツで断定的な効能表現を使わない

## MYKENKOでの利用方針

- MYKENKO専用Agentは `mykenko-` プレフィックスを付ける
- 汎用Agentは `common/` カテゴリに配置し、プレフィックスなしで管理
- 薬機法・景表法・YMYL関連AgentはすべてCompliance Reviewを必須とする
- risk_level: high 以上のAgentはオーナーの承認なしに実行しない
