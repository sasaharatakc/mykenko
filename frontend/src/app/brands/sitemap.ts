/**
 * ブランドページ サイトマップ
 *
 * Laravel BrandController.index() は published かつ商品数 0 含む全ブランドを返す。
 * 商品が 1 件以上あるブランドのみをインデックス対象とすることで
 * 薄いコンテンツページのクロールを防ぐ。
 *
 * URL パターン: /brands/sitemap.xml
 *
 * revalidate: 86400（24時間）
 *   - ブランド登録は低頻度のため 24 時間で十分
 */

import type { MetadataRoute } from 'next'

const BASE    = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mykenko.com'
const API_URL = process.env.NEXT_PUBLIC_API_URL  ?? 'http://localhost:8000/api/v1'

interface BrandItem {
  slug: string
  products_count?: number
  updated_at?: string
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const res = await fetch(`${API_URL}/brands`, {
      next: { revalidate: 86400 },
    })
    if (!res.ok) return []
    const brands: BrandItem[] = await res.json()

    return (Array.isArray(brands) ? brands : [])
      .filter(b => b.slug && (b.products_count === undefined || b.products_count > 0))
      .map(b => ({
        url: `${BASE}/brands/${b.slug}`,
        lastModified: b.updated_at ? new Date(b.updated_at) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      }))
  } catch {
    return []
  }
}
