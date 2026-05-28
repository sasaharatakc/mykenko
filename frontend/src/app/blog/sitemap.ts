/**
 * ブログ記事 サイトマップ
 *
 * Laravel BlogController.index() は published 記事のみ返す。
 * ブログカテゴリページも含める。
 *
 * URL パターン: /blog/sitemap.xml
 *
 * revalidate: 3600（1時間）
 *   - 新記事公開時に速やかにインデックスされるよう短く設定
 */

import type { MetadataRoute } from 'next'

const BASE    = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mykenko.com'
const API_URL = process.env.NEXT_PUBLIC_API_URL  ?? 'http://localhost:8000/api/v1'

interface BlogItem {
  slug: string
  updated_at?: string
  published_at?: string
}

interface BlogCategoryItem {
  slug: string
}

interface PaginatedResponse {
  data: BlogItem[]
  meta: {
    current_page: number
    last_page: number
    total: number
  }
}

async function fetchAllBlogSlugs(): Promise<BlogItem[]> {
  const PER_PAGE = 100
  const first = await fetch(
    `${API_URL}/blog?per_page=${PER_PAGE}&page=1`,
    { next: { revalidate: 3600 } }
  )
  if (!first.ok) return []
  const firstJson: PaginatedResponse = await first.json()
  const lastPage = firstJson?.meta?.last_page ?? 1
  const items: BlogItem[] = firstJson?.data ?? []

  if (lastPage <= 1) return items

  const pages = Array.from({ length: lastPage - 1 }, (_, i) => i + 2)
  const results = await Promise.all(
    pages.map(page =>
      fetch(`${API_URL}/blog?per_page=${PER_PAGE}&page=${page}`, {
        next: { revalidate: 3600 },
      })
        .then(r => r.ok ? r.json() as Promise<PaginatedResponse> : null)
        .catch(() => null)
    )
  )

  for (const result of results) {
    if (result?.data) items.push(...result.data)
  }

  return items
}

async function fetchBlogCategories(): Promise<BlogCategoryItem[]> {
  try {
    const res = await fetch(`${API_URL}/blog/categories`, {
      next: { revalidate: 86400 },
    })
    if (!res.ok) return []
    const json = await res.json()
    return json?.data ?? json ?? []
  } catch {
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, categories] = await Promise.all([
    fetchAllBlogSlugs().catch(() => [] as BlogItem[]),
    fetchBlogCategories().catch(() => [] as BlogCategoryItem[]),
  ])

  const postRoutes: MetadataRoute.Sitemap = posts
    .filter(p => p.slug)
    .map(p => ({
      url: `${BASE}/blog/${p.slug}`,
      // published_at を優先し、なければ updated_at を使用
      lastModified: p.published_at
        ? new Date(p.published_at)
        : p.updated_at
        ? new Date(p.updated_at)
        : new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }))

  const categoryRoutes: MetadataRoute.Sitemap = categories
    .filter(c => c.slug)
    .map(c => ({
      url: `${BASE}/blog/category/${c.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.5,
    }))

  return [...postRoutes, ...categoryRoutes]
}
