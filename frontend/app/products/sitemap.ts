import type { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://mykenko.com'
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.mykenko.com/api/v1'

const URLS_PER_SITEMAP = 5000

/**
 * 商品サイトマップ分割インデックス
 * 1チャンク = 最大5,000件。Googleの上限50,000件を安全マージンで分割。
 * generateSitemaps が返す id 配列をもとに /products/sitemap/[id].xml を生成。
 */
export async function generateSitemaps() {
  try {
    const res = await fetch(`${API_URL}/products?sitemap=1&count=1`, {
      next: { revalidate: 3600 },
    })
    if (!res.ok) return [{ id: 0 }]

    const data = await res.json()
    const total: number = data.meta?.total ?? data.total ?? 0
    const chunks = Math.max(1, Math.ceil(total / URLS_PER_SITEMAP))
    return Array.from({ length: chunks }, (_, i) => ({ id: i }))
  } catch {
    return [{ id: 0 }]
  }
}

export default async function sitemap({
  id,
}: {
  id: number
}): Promise<MetadataRoute.Sitemap> {
  try {
    const page = id + 1
    const res = await fetch(
      `${API_URL}/products?status=published&page=${page}&per_page=${URLS_PER_SITEMAP}&sitemap=1`,
      { next: { revalidate: 3600 } }
    )
    if (!res.ok) return []

    const data = await res.json()
    const products: Array<{
      slug: string
      updated_at: string
    }> = data.data ?? []

    return products.map((product) => ({
      url: `${BASE_URL}/products/${product.slug}`,
      lastModified: new Date(product.updated_at),
      changeFrequency: 'weekly',
      priority: 0.8,
    }))
  } catch {
    return []
  }
}
