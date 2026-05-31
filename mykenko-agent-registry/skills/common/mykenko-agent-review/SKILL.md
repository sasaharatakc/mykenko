---
name: mykenko-agent-review
category: common
status: draft
version: 0.1.0
owner: take sasa
console_target: custom-skill
risk_level: low
created_at: 2026-05-31
updated_at: 2026-05-31
---

# Skill Name
mykenko-agent-review

# Description
mykenko-agent-registryに登録されているAgent/Skillのレビューを行うSkill。品質・安全性・命名規則・重複の観点で審査し、承認・改善案・廃止推奨を提示します。

# Use Cases
- 新規作成したAgentのレビューをする
- 新規作成したSkillのレビューをする
- 定期的な品質監査を行う
- Console移行前の最終チェックをする

# Inputs
- `target_type`: 対象種別（agent / skill）（必須）
- `target_name`: Agent/Skill名（必須）
- `content`: Agent/SkillのMarkdown内容（必須）

# Outputs
- レビュー結果: `APPROVED` / `NEEDS_REVISION` / `REJECTED`
- チェックリスト（全項目のOK/NG）
- 改善案
- Console移行の可否判定

# Procedure

1. 対象ファイルを読み込む
2. 命名規則チェックを行う（NAMING_RULES.md準拠）
3. 必須フィールドチェックを行う
4. 内容品質チェックを行う
5. 安全性チェックを行う（機密情報・危険な権限）
6. 重複チェックを行う
7. Console移行適合性を判定する
8. 総合判定とフィードバックを出力する

# Rules
- 客観的な基準（AGENT_GOVERNANCE.md / SKILL_GOVERNANCE.md）に基づいて判定する
- 感情的・主観的な評価はしない
- 改善案は具体的で実行可能なものにする

# Examples

## Example 1（Agent レビュー）

入力：
```
target_type: agent
target_name: mykenko-yakuki-reviewer
content: [mykenko-yakuki-reviewer.mdの内容]
```

出力：
```
レビュー結果: NEEDS_REVISION

チェックリスト:
✅ 命名規則: OK (mykenko-compliance-category-function形式)
✅ frontmatter必須フィールド: 全て入力済み
✅ risk_level: high（適切）
⚠️ skills: mykenko-yakuki-checkがskills.jsonに未登録
✅ system prompt: 明確で具体的
⚠️ Example Prompts: 1つしかない（2つ以上推奨）
✅ 機密情報: なし
✅ 危険な権限: なし

改善案:
1. manifests/skills.jsonにmykenko-yakuki-checkを登録する
2. Example Promptsをもう1つ追加する

Console移行適合: 上記修正後に再評価
```
