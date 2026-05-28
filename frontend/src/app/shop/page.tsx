import { ShopContent } from './ShopContent'
import type { Metadata } from 'next'

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mykenko.com'

export const metadata: Metadata = {
  title: 'ショップ — 全商品一覧 | MYKENKO',
  description: '認定ベンダーの医薬品・サプリメント・美容・健康商品を一覧で探せます。カテゴリ・ブランド・価格でフィルタリング可能。',
  alternates: {
    // フィルタ・ソート・ページネーションパラメータ付きURLを /shop に正規化
    // 例: /shop?category=ed&sort=price → canonical は /shop
    canonical: `${BASE}/shop`,
  },
  robots: {
    index: true,
    follow: true,
    // フィルタ系パラメータをクロールさせない（robots.ts の Disallow と二重保護）
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
    },
  },
}

interface ShopPageProps {
  searchParams: {
    search?: string
    category?: string
    brands?: string
    min_price?: string
    max_price?: string
    sort?: string
    page?: string
    in_stock?: string
    rating?: string
  }
}

export default function ShopPage({ searchParams }: ShopPageProps) {
  return <ShopContent searchParams={searchParams} />
}
