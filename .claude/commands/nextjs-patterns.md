# /nextjs-patterns — Next.jsコーディングパターン

## 用途
MYKENKOのNext.js実装で使う標準パターンを適用する。

## Server Component (デフォルト)
```typescript
// app/products/page.tsx
export default async function ProductsPage() {
  const products = await getProducts(); // サーバーで直接フェッチ
  return (
    <div>
      {products.map(p => <ProductCard key={p.id} product={p} />)}
    </div>
  );
}
```

## Client Component (インタラクティブ)
```typescript
'use client';
import { useState } from 'react';

export function AddToCartButton({ productId }: { productId: string }) {
  const [loading, setLoading] = useState(false);
  
  const handleClick = async () => {
    setLoading(true);
    await addToCart(productId);
    setLoading(false);
  };
  
  return <button onClick={handleClick} disabled={loading}>カートに追加</button>;
}
```

## データフェッチとキャッシュ
```typescript
// キャッシュ: デフォルト（静的）
const data = await fetch('/api/products');

// キャッシュなし（動的）
const data = await fetch('/api/products', { cache: 'no-store' });

// 再検証（ISR）
const data = await fetch('/api/products', { next: { revalidate: 60 } });
```
