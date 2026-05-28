import type { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://mykenko.com'
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.mykenko.com/api/v1'

/**
 * ベンダーストアサイトマップ
 * status=approved かつ is_verified=true のストアのみをインデックス対象とする。
 * 未承認・停止中ストアはクロールバジェットを消費させない。
 * アクセスパス: /stores/sitemap.xml
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const res = await fetch(
      `${API_URL}/stores?status=approved&is_verified=1&per_page=1000`,
      { next: { revalidate: 3600 } }
    )
    if (!res.ok) return []

    const data = await res.json()
    const stores: Array<{
      slug: string
      updated_at: string
    }> = data.data ?? data

    return stores.map((store) => ({
      url: `${BASE_URL}/stores/${store.slug}`,
      lastModified: new Date(store.updated_at),
      changeFrequency: 'weekly',
      priority: 0.7,
    }))
  } catch {
    return []
  }
}
