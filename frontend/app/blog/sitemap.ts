import type { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://mykenko.com'
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.mykenko.com/api/v1'

/**
 * ブログサイトマップ
 * status=published かつ published_at <= now のみを対象とする。
 * ブログカテゴリページも含めてインデックスさせる。
 * アクセスパス: /blog/sitemap.xml
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const [postsRes, catsRes] = await Promise.all([
      fetch(`${API_URL}/blog?status=published&per_page=1000`, {
        next: { revalidate: 3600 },
      }),
      fetch(`${API_URL}/blog/categories?per_page=200`, {
        next: { revalidate: 86400 },
      }),
    ])

    const postsData = postsRes.ok ? await postsRes.json() : { data: [] }
    const catsData = catsRes.ok ? await catsRes.json() : { data: [] }

    const posts: Array<{
      slug: string
      updated_at: string
      published_at: string | null
    }> = postsData.data ?? []

    const categories: Array<{
      slug: string
      updated_at: string
    }> = catsData.data ?? catsData ?? []

    const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
      url: `${BASE_URL}/blog/${post.slug}`,
      lastModified: new Date(post.updated_at),
      changeFrequency: 'monthly',
      priority: 0.6,
    }))

    const categoryEntries: MetadataRoute.Sitemap = categories.map((cat) => ({
      url: `${BASE_URL}/blog/category/${cat.slug}`,
      lastModified: new Date(cat.updated_at),
      changeFrequency: 'weekly',
      priority: 0.5,
    }))

    return [...postEntries, ...categoryEntries]
  } catch {
    return []
  }
}
