/**
 * ベンダーストアページ サイトマップ
 *
 * Laravel StoreController.index() は is_verified=true かつ status='approved'
 * のストアのみ返す（scopeVerified）。
 *
 * URL パターン: /stores/sitemap.xml
 *
 * revalidate: 21600（6時間）
 *   - 新規ベンダー承認は日次程度で発生するため 6 時間に設定
 *
 * 注意: 未承認・停止中ストアは Laravel 側でフィルタされるため
 *       フロントで追加フィルタ不要。
 */

import type { MetadataRoute } from 'next'

const BASE    = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mykenko.com'
const API_URL = process.env.NEXT_PUBLIC_API_URL  ?? 'http://localhost:8000/api/v1'

interface StoreItem {
  slug: string
  updated_at?: string
}

interface PaginatedResponse {
  data: StoreItem[]
  meta: {
    current_page: number
    last_page: number
    total: number
  }
}

/** 全ページを並列取得してスラッグ一覧を返す */
async function fetchAllStoreSlugs(): Promise<StoreItem[]> {
  const PER_PAGE = 100

  // まず 1 ページ目を取得して総ページ数を確認
  const first = await fetch(
    `${API_URL}/stores?per_page=${PER_PAGE}&page=1`,
    { next: { revalidate: 21600 } }
  )
  if (!first.ok) return []
  const firstJson: PaginatedResponse = await first.json()
  const lastPage = firstJson?.meta?.last_page ?? 1
  const items: StoreItem[] = firstJson?.data ?? []

  if (lastPage <= 1) return items

  // 残りのページを並列取得
  const pages = Array.from({ length: lastPage - 1 }, (_, i) => i + 2)
  const results = await Promise.all(
    pages.map(page =>
      fetch(`${API_URL}/stores?per_page=${PER_PAGE}&page=${page}`, {
        next: { revalidate: 21600 },
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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const stores = await fetchAllStoreSlugs()

    return stores
      .filter(s => s.slug)
      .map(s => ({
        url: `${BASE}/stores/${s.slug}`,
        lastModified: s.updated_at ? new Date(s.updated_at) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      }))
  } catch {
    return []
  }
}
