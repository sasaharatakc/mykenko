/**
 * 商品ページ サイトマップ
 *
 * generateSitemaps を使用して 50,000 件/ファイルのページ分割に対応。
 * URL パターン: /products/sitemap/[id].xml
 *
 * フィルタ条件（Laravel 側 scopePublished）:
 *   - status = 'published'
 *   - is_variation = false
 *
 * revalidate: 3600（1時間）
 *   - 商品追加・更新は頻繁に発生するため短めに設定
 *   - ISR により古いキャッシュが残ることを防ぐ
 */

import type { MetadataRoute } from 'next'

const BASE    = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mykenko.com'
const API_URL = process.env.NEXT_PUBLIC_API_URL  ?? 'http://localhost:8000/api/v1'

/** サイトマップ 1 ファイルあたりの最大 URL 数 */
const URLS_PER_SITEMAP = 5000

interface ProductSitemapItem {
  slug: string
  updated_at?: string
}

interface PaginatedResponse {
  data: ProductSitemapItem[]
  meta: {
    total: number
    last_page: number
  }
}

/**
 * 商品の総件数を取得し、必要なサイトマップ数を計算する。
 * generateSitemaps が呼ぶ際は 1 回だけ実行される。
 */
export async function generateSitemaps(): Promise<{ id: number }[]> {
  try {
    const res = await fetch(
      `${API_URL}/products?per_page=1`,
      { next: { revalidate: 3600 } }
    )
    if (!res.ok) return [{ id: 0 }]
    const json: PaginatedResponse = await res.json()
    const total = json?.meta?.total ?? 0
    const count = Math.ceil(total / URLS_PER_SITEMAP)
    return Array.from({ length: Math.max(count, 1) }, (_, i) => ({ id: i }))
  } catch {
    return [{ id: 0 }]
  }
}

export default async function sitemap(
  { id }: { id: number }
): Promise<MetadataRoute.Sitemap> {
  const page = id + 1 // Laravel ページネーションは 1 始まり

  try {
    const res = await fetch(
      `${API_URL}/products?per_page=${URLS_PER_SITEMAP}&page=${page}&fields=slug,updated_at`,
      { next: { revalidate: 3600 } }
    )
    if (!res.ok) return []
    const json: PaginatedResponse = await res.json()
    const products: ProductSitemapItem[] = json?.data ?? []

    return products.map(p => ({
      url: `${BASE}/products/${p.slug}`,
      lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))
  } catch {
    return []
  }
}
