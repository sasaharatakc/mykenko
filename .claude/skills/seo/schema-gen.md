# /schema-gen — 構造化データ生成

## 用途
ページタイプに応じたJSON-LD形式の構造化データを生成する。

## ページタイプ別スキーマ

### 商品ページ
```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "商品名",
  "description": "商品説明",
  "offers": {
    "@type": "Offer",
    "price": "価格",
    "priceCurrency": "JPY",
    "availability": "https://schema.org/InStock"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.5",
    "reviewCount": "100"
  }
}
```

### パンくずリスト
```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [...]
}
```

### FAQ
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [...]
}
```
