# 新規 Skill 作成ガイド

## 作成フロー

```
1. skills/{category}/{skill-name}/ ディレクトリを作成
2. SKILL.md を作成（templates/skill.template.md を参照）
3. examples/ / templates/ / references/ を必要に応じて追加
4. manifests/skills.json に登録
5. Claude Codeでテスト
6. レビュー・approved に変更
7. python3 scripts/package-skills.py でzip化
8. Console Custom Skills Libraryへアップロード
9. manifests/console-map.json にIDとversionを記録
10. 使用するAgentの agent-skill-map.json に紐づけ
```

## Step 1: ディレクトリ作成

```bash
CATEGORY="compliance"
SKILL_NAME="mykenko-yakuki-check"

mkdir -p skills/${CATEGORY}/${SKILL_NAME}
cp templates/skill.template.md skills/${CATEGORY}/${SKILL_NAME}/SKILL.md
```

## Step 2: SKILL.md の書き方

**必須セクション：**

```markdown
---
name: mykenko-yakuki-check
category: compliance
status: draft
version: 0.1.0
owner: take sasa
console_target: custom-skill
risk_level: high
created_at: 2026-05-31
updated_at: 2026-05-31
---

# Skill Name
mykenko-yakuki-check

# Description
MYKENKOプロジェクトのコンテンツが薬機法（医薬品医療機器等法）に準拠しているかをチェックするSkill。

# Use Cases
- 商品ページのコピーライティングが薬機法に違反していないか確認する
- 成分説明文に不適切な効能・効果の表現がないかチェックする
- SNS投稿文が薬機法・景表法に違反していないか確認する

# Inputs
- `content`: チェック対象のテキスト（必須）
- `product_type`: 商品カテゴリ（任意）
- `target_audience`: ターゲット層（任意）

# Outputs
- チェック結果サマリー（OK / 要修正 / NG）
- 問題箇所の一覧
- 修正案（要修正の場合）
- 根拠となる法令条文（参考）

# Procedure
1. テキストを受け取り、チェック対象を特定する
2. 以下の観点で問題箇所を抽出する：
   - 医薬品的効能・効果の表現
   - 「治る」「治療する」などの禁止表現
   - 誇大表現・根拠のない優位性主張
   - 未承認医薬品の効能表示
3. 問題箇所に対して修正案を提示する
4. 結果をサマリーとして出力する

# Rules
- 断定的な判断（「違法です」「合法です」）は行わない
- 「専門家への確認を推奨する」旨を必ず付記する
- 医薬品・医療機器・化粧品で規制内容が異なることを明示する
- 参考にする法令は最新版を確認すること
- NG判定でも最終判断は法務・コンプライアンス担当者に委ねること

# Examples

## Example 1

入力：「この商品を飲めば肌荒れが治ります」

出力：
```
チェック結果: NG
問題箇所: 「治ります」という表現
問題: 医薬品的効能・効果の断定表現に該当する可能性があります
修正案: 「この商品を飲んで肌の調子が整ったとのお声をいただいています」
根拠: 薬機法第66条（誇大広告等）
⚠️ 最終判断は法務・コンプライアンス担当者に確認してください。
```

## Example 2

入力：「天然成分配合のサプリメント」

出力：
```
チェック結果: OK（要確認）
特記事項: 「天然成分」の具体的な成分名が記載されていないため、成分ごとの薬機法適合性の確認を推奨します
⚠️ 最終判断は法務・コンプライアンス担当者に確認してください。
```
```

## Step 3: examples / templates / references の追加

```
skills/compliance/mykenko-yakuki-check/
  SKILL.md              ← 必須
  examples/             ← 入出力サンプル（任意）
    example-ok.md
    example-ng.md
  templates/            ← 出力テンプレート（任意）
    check-report.md
  references/           ← 参考資料（任意）
    yakuji-law-summary.md
```

## Step 4: skills.json への登録

```json
{
  "name": "mykenko-yakuki-check",
  "category": "compliance",
  "source_path": "",
  "registry_path": "skills/compliance/mykenko-yakuki-check/SKILL.md",
  "entry": "SKILL.md",
  "console_target": "custom-skill",
  "status": "draft",
  "version": "0.1.0",
  "risk_level": "high",
  "mykenko_related": true,
  "duplicate_of": null,
  "notes": "薬機法チェック - MYKENKO最重要Skill"
}
```

## Step 5: zip化とConsoleアップロード

```bash
# 単一Skillをzip化
python3 scripts/package-skills.py --skill mykenko-yakuki-check

# Console Custom Skills Library でアップロード
# → dist/skills/mykenko-yakuki-check.zip をアップロード

# アップロード後にIDを記録
python3 scripts/generate-console-map.py --skill mykenko-yakuki-check --id skl_xxxxx --version 1.0.0
```

## Step 6: Agentへの紐づけ

`manifests/agent-skill-map.json` を更新：

```json
{
  "agent": "mykenko-yakuki-reviewer",
  "skills": ["mykenko-yakuki-check", ...],
  "required": true
}
```

## チェックリスト

- [ ] SKILL.md の必須セクションが揃っているか
- [ ] frontmatter の必須フィールドが全て入力されているか
- [ ] Use Cases が3つ以上あるか
- [ ] Procedure が番号付きリストか
- [ ] Examples が1つ以上あるか
- [ ] 薬機法・YMYL関係の場合、Rules に「専門家確認を推奨」が明記されているか
- [ ] skills.json に登録したか
- [ ] `python3 scripts/validate-registry.py` がエラーなしで通過するか
