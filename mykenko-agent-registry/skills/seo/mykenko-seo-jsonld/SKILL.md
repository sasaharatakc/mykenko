---
name: mykenko-seo-jsonld
category: seo
status: draft
version: 0.1.0
owner: take sasa
console_target: custom-skill
risk_level: low
created_at: 2026-05-31
updated_at: 2026-05-31
---

# Skill Name
mykenko-seo-jsonld

# Description
MYKENKOプロジェクトのページに最適なJSON-LD構造化データを生成するSkill。Product・Review・BreadcrumbList・Organization等のスキーマを商品・カテゴリページに応じて生成します。

# Use Cases
- 商品ページにProduct Schema（価格・在庫・レビュー）を生成する
- カテゴリページにBreadcrumbList Schemaを生成する
- 記事ページにArticle Schemaを生成する
- FAQページにFAQPage Schemaを生成する
- MYKENKOのOrganization Schemaを生成・更新する

# Inputs
- `page_type`: ページ種別（product / category / article / faq / organization）（必須）
- `product_name`: 商品名（product の場合必須）
- `price`: 価格（product の場合任意）
- `description`: 説明文（任意）
- `reviews`: レビューデータ（任意）
- `breadcrumbs`: パンくずリスト（任意）

# Outputs
- JSON-LD形式の構造化データ（`<script type="application/ld+json">`に埋め込み可能な形式）
- Googleリッチリザルトテストでの確認方法

# Procedure

1. ページ種別を確認する
2. 必要な情報を収集する
3. 該当するSchema.orgタイプのJSON-LDを生成する
4. 必須プロパティと推奨プロパティを確認する
5. JSON-LDを出力する

# Rules
- 実際のページ情報と異なるデータを含めない（ガイドライン違反）
- 存在しないレビューデータを作成しない
- 価格・在庫状況は実際のデータを使用する
- GoogleのSearch Centralガイドラインに準拠する

# Examples

## Example 1（商品ページ）

入力：
```
page_type: product
product_name: MYKENKOコラーゲンサプリ 60粒
price: 3980
currency: JPY
description: 高純度コラーゲンペプチド配合サプリメント
availability: in_stock
```

出力：
```json
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "MYKENKOコラーゲンサプリ 60粒",
  "description": "高純度コラーゲンペプチド配合サプリメント",
  "brand": {
    "@type": "Brand",
    "name": "MYKENKO"
  },
  "offers": {
    "@type": "Offer",
    "price": "3980",
    "priceCurrency": "JPY",
    "availability": "https://schema.org/InStock",
    "url": "https://mykenko.com/products/collagen-supplement"
  }
}
</script>
```

## Example 2（パンくずリスト）

入力：
```
page_type: breadcrumb
breadcrumbs:
  - name: ホーム
    url: https://mykenko.com/
  - name: サプリメント
    url: https://mykenko.com/supplements/
  - name: コラーゲンサプリ
    url: https://mykenko.com/products/collagen/
```

出力：
```json
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {"@type": "ListItem", "position": 1, "name": "ホーム", "item": "https://mykenko.com/"},
    {"@type": "ListItem", "position": 2, "name": "サプリメント", "item": "https://mykenko.com/supplements/"},
    {"@type": "ListItem", "position": 3, "name": "コラーゲンサプリ", "item": "https://mykenko.com/products/collagen/"}
  ]
}
</script>
```
