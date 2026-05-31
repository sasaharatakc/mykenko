# Skill ガバナンスルール

## Skill 命名規則

```
{prefix}-{category}-{function}[-{variant}]
```

### プレフィックス
- `mykenko-` — MYKENKOプロジェクト専用Skill
- プレフィックスなし — 共通利用可能

### 命名例
```
mykenko-yakuki-check            ← MYKENKO専用・薬機法チェック
mykenko-product-page-template   ← MYKENKO専用・商品ページテンプレート
seo-audit                       ← 共通SEO監査
keyword-research                ← 共通キーワードリサーチ
```

## SKILL.md の書き方

SKILL.mdはスキルの「定義書」です。必ず以下の frontmatter を含めてください：

```yaml
---
name: skill-name
category: category-name
status: draft|testing|approved|published|deprecated|archived
version: 0.1.0
owner: take sasa
console_target: custom-skill|none
risk_level: low|medium|high|critical
created_at: YYYY-MM-DD
updated_at: YYYY-MM-DD
---
```

本文には以下のセクションを必ず含める：
1. `# Skill Name` — スキル名
2. `# Description` — 何をするSkillか（1〜3文）
3. `# Use Cases` — 具体的な使用例（箇条書き3つ以上）
4. `# Inputs` — 必要な入力情報
5. `# Outputs` — 出力形式
6. `# Procedure` — 実行手順（番号付きリスト）
7. `# Rules` — 守るべきルール・制約
8. `# Examples` — 入出力例

## Skill のカテゴリ

| カテゴリ | 内容 |
|----------|------|
| seo | SEO施策・キーワード・コンテンツ最適化 |
| geo | AI検索・GEO・LLMOへの対応 |
| llmo | LLM最適化・AI概要対策 |
| research | 市場調査・競合分析・トレンド調査 |
| sns | SNS投稿・運用 |
| ads | 広告LP・キャンペーン |
| content | 記事・コピーライティング・動画台本 |
| ecommerce | EC・カート・チェックアウト |
| compliance | 法規制・薬機法・景表法・YMYL |
| price-monitoring | 価格監視・比較 |
| product-db | 商品DB構築・正規化 |
| ingredient-db | 成分DB構築・正規化 |
| affiliate | アフィリエイト管理 |
| agency | 代理店管理 |
| sales | 営業・CRM |
| crm | 顧客管理 |
| automation | 自動化・ワークフロー |
| data | データ収集・処理 |
| design | デザインシステム・UX |
| video | 動画制作 |
| development | 開発・コーディング |
| devops | インフラ・CI/CD |
| github | GitHub操作 |
| security | セキュリティ |
| finance | 財務・会計 |
| common | 汎用・共通 |
| deprecated | 廃止予定 |

## Skill のレビュー手順

### レビューチェックリスト
- [ ] SKILL.md が存在するか
- [ ] frontmatter の必須フィールドが揃っているか
- [ ] Description が明確か（何をするSkillか1文で言えるか）
- [ ] Use Cases が3つ以上あるか
- [ ] Procedure が番号付きリストで書かれているか
- [ ] Examples が1つ以上あるか
- [ ] 薬機法・YMYL関係の場合、Rules に断定表現禁止が明記されているか
- [ ] 重複するSkillが既にないか（duplicate-report.json確認）

## Skill の Console 移行基準

以下をすべて満たす場合、Custom Skills Library へ移行する：

- [ ] status が approved 以上
- [ ] SKILL.md が揃っている
- [ ] Use Cases が明確で複数プロジェクトで再利用できる
- [ ] risk_level が high 以下（critical は原則Console移行しない）
- [ ] 重複するSkillがない
- [ ] バージョンが付いている（0.1.0以上）
- [ ] オーナーの承認済み

### Console移行優先度（高い順）

```
1. mykenko-yakuki-check          （薬機法チェック）
2. mykenko-ymyl-check            （YMYLチェック）
3. mykenko-keihyo-check          （景表法チェック）
4. mykenko-fda-risk-check        （FDAリスクチェック）
5. mykenko-product-page-template （商品ページテンプレート）
6. mykenko-seo-jsonld            （SEO JSON-LD）
7. mykenko-serp-analysis         （SERP分析）
8. mykenko-price-extraction      （価格抽出）
9. mykenko-sns-japanese-localization （SNS日本語化）
10. mykenko-ad-lp-template       （広告LPテンプレート）
```

## Skill のバージョン管理

セマンティックバージョニングを使用：

```
0.1.0 — 初稿（draft）
0.2.0 — レビュー後の修正
1.0.0 — 承認・本番投入
1.1.0 — 小機能追加・改善
2.0.0 — 大幅な変更（後方互換性なし）
```

バージョンを上げる際は：
1. SKILL.md の frontmatter `version` と `updated_at` を更新
2. `manifests/skills.json` の version を更新
3. CHANGELOG.md に変更内容を記載

## 重複 Skill 統合ルール

1. `scripts/validate-registry.py` を実行して `manifests/duplicate-report.json` を確認
2. 重複が検出された場合：
   - 新しい方・機能が少ない方を廃止候補とする
   - 内容を統合してより完全な SKILL.md を作成
   - 廃止する側の status を deprecated に変更
   - `deprecated/` に移動（削除はしない）
3. Agent の `agent-skill-map.json` で廃止Skillを参照している場合は、統合先Skillに更新する
