---
name: mykenko-fda-risk-check
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
mykenko-fda-risk-check

# Description
MYKENKOの商品・コンテンツが米国FDA（食品医薬品局）の規制に抵触するリスクをチェックするSkill。米国向け展開を想定した商品・広告の事前審査に使用します。

# Use Cases
- 米国向け商品ページのFDAコンプライアンスリスクを評価する
- サプリメント（Dietary Supplement）の表示が21 CFR Part 101に準拠しているか確認する
- 構造/機能クレーム（Structure/Function Claims）の適切性をチェックする
- 「FDA承認」「FDA認定」等の表現の適切性を確認する

# Inputs
- `content`: チェック対象のテキスト（必須）
- `product_category`: 商品カテゴリ（dietary supplement / cosmetic / food / drug）（必須）
- `target_market`: 対象市場（US / その他）（デフォルト: US）

# Outputs
- FDAコンプライアンスリスク評価
- 問題箇所と修正案
- 参照規制・ガイドライン
- 専門家（米国弁護士・regulatory consultant）への確認推奨

# Procedure

1. 商品カテゴリと対象市場を確認する
2. 以下の観点でリスクを評価する：
   - 未承認疾病クレーム（Disease Claims）の有無
   - 構造/機能クレームの適切性
   - 「FDA Approved」「FDA Cleared」の不適切使用
   - DSHEA（栄養補助食品健康教育法）への準拠
3. 問題箇所をリストアップし修正案を提示する
4. 必要に応じてFDA登録・事前承認の要否を案内する

# Rules
- 米国法の断定的な解釈・判断は行わない
- 必ず「米国の規制は複雑であり、米国の食品・医薬品規制に詳しい弁護士またはregulatory consultantへの確認を強く推奨します」と付記する
- FDAの規制は頻繁に変更されるため、最新のガイダンスを確認するよう促す

# Examples

## Example 1

入力：
```
product_category: dietary supplement
content: This FDA-approved supplement helps treat arthritis and reduces joint inflammation.
```

出力：
```
FDA Compliance Risk: HIGH

Issues Found:
1. "FDA-approved" - CRITICAL
   - Dietary supplements are NOT FDA-approved. This claim is false and misleading.
   - The FDA does not approve dietary supplements before they go to market.
   - Fix: Remove "FDA-approved" entirely.

2. "helps treat arthritis" - Disease Claim (PROHIBITED for dietary supplements)
   - Disease claims are not allowed for dietary supplements under DSHEA.
   - Fix: Use a Structure/Function Claim instead, e.g., "supports joint health and mobility"
   - Note: Structure/Function Claims require a disclaimer: "This statement has not been evaluated by the Food and Drug Administration. This product is not intended to diagnose, treat, cure, or prevent any disease."

⚠️ IMPORTANT: Consult a US FDA regulatory attorney or consultant before marketing this product in the US.
```

## Example 2

入力：
```
product_category: dietary supplement
content: Supports healthy joints and promotes flexibility. Contains glucosamine and chondroitin.
```

出力：
```
FDA Compliance Risk: LOW (with disclaimer required)

Assessment:
- "Supports healthy joints and promotes flexibility" = Structure/Function Claim (ACCEPTABLE)
- Ingredient disclosure is appropriate

Required: Add FDA disclaimer statement:
"*These statements have not been evaluated by the Food and Drug Administration. This product is not intended to diagnose, treat, cure, or prevent any disease."

⚠️ Consult a US regulatory expert to confirm compliance.
```
