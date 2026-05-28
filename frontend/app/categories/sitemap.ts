import type { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://mykenko.com'
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.mykenko.com/api/v1'

/**
 * カテゴリサイトマップ
 * 親カテゴリ・子カテゴリを含む全ツリーをインデックス対象とする。
 * カテゴリ数は通常数百件以内なので単一ファイルで完結する。
 * アクセスパス: /categories/sitemap.xml
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const res = await fetch(`${API_URL}/categories?status=published&per_page=500`, {
      next: { revalidate: 3600 },
    })
    if (!res.ok) return []

    const data = await res.json()
    const categories: Array<{
      slug: string
      updated_at: string
      parent_id: number | null
    }> = data.data ?? data

    return categories.map((cat) => ({
      url: `${BASE_URL}/categories/${cat.slug}`,
      lastModified: new Date(cat.updated_at),
      // 親カテゴリは内容が変わりやすく、子カテゴリは比較的安定
      changeFrequency: cat.parent_id === null ? 'weekly' : 'monthly',
      // 親カテゴリを高優先度にしてクロール効率を向上
      priority: cat.parent_id === null ? 0.7 : 0.6,
    }))
  } catch {
    return []
  }
}
