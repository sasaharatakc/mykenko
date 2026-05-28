/**
 * カテゴリページ サイトマップ
 *
 * 親カテゴリ・子カテゴリの両方を対象とする。
 * Laravel CategoryController.index() は published + root 階層のみ返すため、
 * tree エンドポイントを使用して全階層を展開する。
 *
 * URL パターン: /categories/sitemap.xml
 *
 * revalidate: 86400（24時間）
 *   - カテゴリ構造は商品より変更頻度が低い
 */

import type { MetadataRoute } from 'next'

const BASE    = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mykenko.com'
const API_URL = process.env.NEXT_PUBLIC_API_URL  ?? 'http://localhost:8000/api/v1'

interface CategoryItem {
  slug: string
  updated_at?: string
  children?: CategoryItem[]
}

/** 再帰的に子カテゴリを含む全スラッグを展開する */
function flattenCategories(categories: CategoryItem[]): CategoryItem[] {
  return categories.flatMap(c => [c, ...(c.children ? flattenCategories(c.children) : [])])
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const res = await fetch(
      `${API_URL}/categories/tree`,
      { next: { revalidate: 86400 } }
    )
    if (!res.ok) return []
    const json = await res.json()
    const tree: CategoryItem[] = json?.data ?? []
    const all = flattenCategories(tree)

    return all
      .filter(c => c.slug)
      .map(c => ({
        url: `${BASE}/categories/${c.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }))
  } catch {
    return []
  }
}
