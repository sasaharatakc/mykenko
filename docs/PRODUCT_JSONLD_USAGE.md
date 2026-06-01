# Product JSON-LD 実装ガイド（shop商品ページ向け）

## 概要

`@mykenko/seo` の `generateProductJsonLd` を使って、Shofy商品ページに
Google ショッピング対応の構造化データを出力します。

## 使用例（Shofy商品ページ）

Issue #10（Shofy設置）完了後、商品詳細ページに以下のパターンで実装してください。

```tsx
// apps/shop/... または apps/media の商品ページ
import {
  generateProductJsonLd,
  generateBreadcrumbJsonLd,
} from '@mykenko/seo'

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await fetchProduct(params.slug) // Shofy APIから取得
  if (!product) notFound()

  // ⚠️ 薬機法・景表法注意:
  //   description に「治る」「効く」「必ず痩せる」などの断定表現を含めないこと
  const productJsonLd = generateProductJsonLd({
    name: product.name,
    description: product.shortDescription, // 断定表現なしで用意すること
    slug: product.slug,
    imageUrl: product.images?.[0]?.url,
    brandName: product.brand?.name,
    price: product.price,
    currency: 'JPY',
    availability: product.inStock ? 'InStock' : 'OutOfStock',
    // rating はレビューデータが実在する場合のみ
    ...(product.ratingCount > 0 && {
      rating: { value: product.ratingAverage, count: product.ratingCount },
    }),
  })

  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: 'ホーム', url: 'https://shop.mykenko.jp' },
    { name: product.category, url: `https://shop.mykenko.jp/categories/${product.categorySlug}/` },
    { name: product.name, url: `https://shop.mykenko.jp/products/${product.slug}/` },
  ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {/* ... 商品ページのUI ... */}
    </>
  )
}
```

## 薬機法・景表法チェックリスト

商品ページの `description` に使用する文章は以下を確認してください:

- [ ] 「治る」「効く」「必ず痩せる」「副作用がない」を含まない
- [ ] 「No.1」「最安値」「最高品質」に客観的根拠がある
- [ ] 未承認の医薬品効能・効果を訴求していない
- [ ] AI生成テキストを使用する場合は薬機法チェックを通過済み

## Google Rich Results での確認方法

実装後、以下で確認してください:

```
https://search.google.com/test/rich-results
```

`Product` タイプが検出されれば成功です。

## 関連 Issue

- Issue #24: Product構造化データ（JSON-LD）を全商品ページに実装する
- Issue #10: Shofy設置・初期カスタマイズ（商品ページが実装されてから適用）
