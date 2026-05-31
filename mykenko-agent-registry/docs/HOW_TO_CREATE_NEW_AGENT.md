# 新規 Agent 作成ガイド

## 作成フロー

```
1. templates/agent.template.md をコピー
2. frontmatter と system prompt を記入
3. manifests/agents.json に登録
4. manifests/agent-skill-map.json に使用Skillを登録
5. Claude Codeにコピーしてテスト
6. レビュー（risk_level: high 以上は第三者確認必須）
7. status を approved に変更
8. Console Managed Agentへ反映（任意）
9. manifests/console-map.json にIDとversionを記録
```

## Step 1: ファイル作成

```bash
# カテゴリとAgent名を決める（NAMING_RULES.mdを参照）
CATEGORY="compliance"
AGENT_NAME="mykenko-yakuki-reviewer"

# テンプレートをコピー
cp templates/agent.template.md agents/${CATEGORY}/${AGENT_NAME}.md

# エディタで開く
vim agents/${CATEGORY}/${AGENT_NAME}.md
```

## Step 2: frontmatter の記入

必須フィールドを必ず入力してください：

```yaml
---
name: mykenko-yakuki-reviewer    # Agent名（ファイル名と一致させる）
category: compliance             # カテゴリ
scope: project                   # global または project
status: draft                    # 最初は draft
version: 0.1.0                   # 最初は 0.1.0
owner: take sasa                 # オーナー
console_target: managed-agent    # Console移行予定: managed-agent または none
risk_level: high                 # low / medium / high / critical
model_preference: claude-sonnet  # 使用モデル
skills:
  - mykenko-yakuki-check         # 使用するSkill（skills.jsonに存在すること）
tools:
  - Read
  - WebSearch
blocked_tools:
  - Bash(rm *)
created_at: 2026-05-31
updated_at: 2026-05-31
---
```

## Step 3: system prompt の記入

frontmatter の下に system prompt を書きます。

**良いsystem promptの条件：**
- 役割が1文で明確に説明できる
- When to use が具体的
- Workflow が番号付きで書かれている
- Rules にセキュリティ・コンプライアンス注意が含まれる
- Example Prompts が2つ以上ある

## Step 4: agents.json への登録

`manifests/agents.json` の `agents` 配列に追加：

```json
{
  "name": "mykenko-yakuki-reviewer",
  "category": "compliance",
  "scope": "project",
  "source_path": "",
  "registry_path": "agents/compliance/mykenko-yakuki-reviewer.md",
  "console_target": "managed-agent",
  "status": "draft",
  "version": "0.1.0",
  "skills": ["mykenko-yakuki-check", "yakki-check"],
  "tools": ["Read", "WebSearch"],
  "risk_level": "high",
  "mykenko_related": true,
  "duplicate_of": null,
  "notes": "薬機法専門レビューAgent"
}
```

## Step 5: agent-skill-map.json への登録

```json
{
  "agent": "mykenko-yakuki-reviewer",
  "skills": ["mykenko-yakuki-check", "yakki-check", "evidence-search"],
  "required": true,
  "notes": "薬機法専門レビュー"
}
```

## Step 6: Claude Codeへの反映とテスト

```bash
# コピースクリプトを実行
bash scripts/copy-to-claude-code.sh mykenko-yakuki-reviewer

# Claude Codeで動作確認
# → MYKENKOプロジェクトのClaude Codeセッションで
#    @mykenko-yakuki-reviewer と入力してAgentを起動
```

## Step 7: レビュー

`docs/HOW_TO_REVIEW_AGENT.md` の手順でレビューを実施します。

risk_level 別の承認フロー：
- `low` / `medium` → 作成者が自己レビューして approved に変更可
- `high` → 1名の別メンバーが確認後に approved に変更
- `critical` → オーナー（take sasa）の承認 + セキュリティレビュー後

## Step 8: Console への反映（任意）

```bash
# アップロード準備
python3 scripts/prepare-console-upload.py

# Console → Managed Agents → New Agent でJSONの内容を参考に設定
# アップロード後にIDをconsole-map.jsonに記録

python3 scripts/generate-console-map.py --agent mykenko-yakuki-reviewer --id agt_xxxxx --version 1.0.0
```

## チェックリスト

作成前：
- [ ] 同じ目的のAgentが既に存在しないか確認（duplicate-report.json）
- [ ] カテゴリが NAMING_RULES.md に準拠しているか
- [ ] risk_level が適切か

作成後：
- [ ] frontmatter の必須フィールドが全て入力されているか
- [ ] system prompt が明確か
- [ ] agents.json に登録したか
- [ ] agent-skill-map.json に登録したか
- [ ] `python3 scripts/validate-registry.py` がエラーなしで通過するか
