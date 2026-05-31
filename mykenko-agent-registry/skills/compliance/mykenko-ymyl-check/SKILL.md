---
name: mykenko-ymyl-check
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
mykenko-ymyl-check

# Description
MYKENKOプロジェクトのコンテンツがYMYL（Your Money Your Life）基準を満たしているかをチェックするSkill。Googleの品質評価ガイドラインに基づき、医療・健康・金融情報の正確性・信頼性・E-E-A-Tを評価します。

# Use Cases
- 健康食品・サプリメントの効果を説明するコンテンツのYMYL適合性を確認する
- 医療・健康情報ページのE-E-A-T（経験・専門性・権威性・信頼性）を評価する
- SEO効果を考慮したYMYLコンテンツ改善案を提案する
- 作成予定コンテンツがYMYL基準に抵触しないか事前チェックする

# Inputs
- `content`: チェック対象のテキスト（必須）
- `content_type`: コンテンツの種類（商品ページ・記事・LP等）（任意）
- `author_info`: 著者情報（資格・経験等）（任意）

# Outputs
- YMYLリスク評価: `低` / `中` / `高`
- E-E-A-T評価（経験・専門性・権威性・信頼性の各スコア）
- 問題箇所と改善案
- E-E-A-T強化のための推奨アクション

# Procedure

1. コンテンツを受け取り、YMYLカテゴリに該当するか判定する
2. YMYLリスクレベルを判定する（医療・健康情報は最高リスク）
3. E-E-A-Tの各観点で評価する：
   - **経験（Experience）**: 実際の体験・使用経験が含まれているか
   - **専門性（Expertise）**: 専門知識・資格・根拠が示されているか
   - **権威性（Authoritativeness）**: 著者・サイトの権威性
   - **信頼性（Trustworthiness）**: 情報の正確性・出典の明示
4. 問題点を抽出し、改善案を提示する
5. YMYLコンテンツとして必要な要素が揃っているか確認する

# Rules
- 医療・健康に関する断定的な情報を提供しない
- 「〇〇の病気に効く」という表現はYMYL観点でも問題があることを明示する
- 専門家（医師・栄養士・薬剤師等）による監修の重要性を強調する
- Googleのサーチクオリティガイドラインの最新版を参照すること
- 事実と推測・意見を明確に区別すること

# Examples

## Example 1

入力：
```
content_type: 記事
content: コラーゲンサプリを飲めば肌が若返り、関節の痛みが消えます。医学的に証明された効果です。
author_info: なし
```

出力：
```
YMYLリスク評価: 高（医療・健康情報）

E-E-A-T評価:
- 経験（Experience）: △ 体験談なし
- 専門性（Expertise）: ✗ 根拠・出典なし。「医学的に証明された」の根拠が不明
- 権威性（Authoritativeness）: ✗ 著者情報なし
- 信頼性（Trustworthiness）: ✗ 断定的表現・出典なし

問題箇所:
1. 「肌が若返り」「関節の痛みが消えます」
   → YMYL観点: 根拠のない医療効果の断定。SEO評価に悪影響
   → 改善案: 「〇〇成分が含まれており、△△の研究（出典）では〇〇の可能性が示されています」

2. 「医学的に証明された効果です」
   → 出典を明示するか、表現を削除する

推奨アクション:
- 医師・管理栄養士による記事監修を実施する
- 参照文献・研究データの出典を明記する
- 著者プロフィール（専門性・経験）を追加する
```

## Example 2

入力：
```
content_type: 商品ページ
content: グルコサミン配合サプリ。加齢による軟骨のケアに。管理栄養士監修。成分の詳細はこちら（リンク）。
author_info: 管理栄養士 山田太郎（登録番号：XXXXX）
```

出力：
```
YMYLリスク評価: 中

E-E-A-T評価:
- 経験（Experience）: △ 体験談あると良い
- 専門性（Expertise）: ○ 管理栄養士監修が明記されている
- 権威性（Authoritativeness）: △ 監修者の詳細プロフィールページがあるとより良い
- 信頼性（Trustworthiness）: ○ 成分リンクあり、監修者明記

改善案:
- 監修者の経歴ページへのリンクを追加する
- ユーザーの実際の使用体験（レビュー）を追加する
```
