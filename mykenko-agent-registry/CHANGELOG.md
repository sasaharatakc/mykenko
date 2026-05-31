# CHANGELOG

## [Unreleased]

### Added
- 初期リポジトリ構造の作成
- Agent/Skill/Command の棚卸し（153 Agents, 63 Skills, 63 Commands）
- `manifests/agents.json` — 全153エージェントの台帳
- `manifests/skills.json` — 全63スキルの台帳
- `manifests/commands.json` — 全63コマンドの台帳
- `manifests/agent-skill-map.json` — Agent-Skill 紐づけマップ
- `manifests/console-map.json` — Console移行状態管理台帳
- `manifests/migration-plan.json` — 移行計画
- `manifests/duplicate-report.json` — 重複レポート
- `manifests/deprecated-report.json` — 廃止レポート
- `manifests/risk-report.json` — リスクレポート
- `templates/agent.template.md` — Agentテンプレート
- `templates/skill.template.md` — Skillテンプレート
- `templates/command.template.md` — Commandテンプレート
- `templates/managed-agent.template.json` — Console Managed Agentテンプレート
- `templates/custom-skill.template.json` — Console Custom Skillテンプレート
- MYKENKO専用Agentドラフト（24件）
- MYKENKO専用Skillドラフト（20件）
- `scripts/scan-local-claude.sh` — ローカルスキャンスクリプト
- `scripts/build-manifests.py` — マニフェスト生成スクリプト
- `scripts/validate-registry.py` — バリデーションスクリプト
- `scripts/copy-to-claude-code.sh` — Claude Codeへのコピースクリプト
- `scripts/package-skills.py` — Skillパッケージングスクリプト
- `scripts/prepare-console-upload.py` — Console移行準備スクリプト
- `scripts/generate-console-map.py` — Console Map生成スクリプト
- ガバナンスドキュメント（README, AGENT_GOVERNANCE, SKILL_GOVERNANCE, MIGRATION, NAMING_RULES, SECURITY_RULES）
- 運用マニュアル（HOW_TO_*）

---

## バージョニング形式

```
[MAJOR.MINOR.PATCH] — YYYY-MM-DD

Added:   新機能・新しいAgent/Skill/Command
Changed: 既存の変更
Deprecated: 廃止予定
Removed: 削除（deprecatedから）
Fixed:   バグ修正
Security: セキュリティ修正
```
