import type { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://mykenko.com'
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.mykenko.com/api/v1'

/**
 * ブランドサイトマップ
 * status=published のブランドのみを対象とする。
 * アクセスパス: /brands/sitemap.xml
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const res = await fetch(`${API_URL}/brands?status=published&per_page=500`, {
      next: { revalidate: 86400 },
    })
    if (!res.ok) return []

    const data = await res.json()
    const brands: Array<{
      slug: string
      updated_at: string
    }> = data.data ?? data

    return brands.map((brand) => ({
      url: `${BASE_URL}/brands/${brand.slug}`,
      lastModified: new Date(brand.updated_at),
      changeFrequency: 'monthly',
      priority: 0.5,
    }))
  } catch {
    return []
  }
}
