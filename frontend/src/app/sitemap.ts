/**
 * MYKENKO — サイトマップインデックス (sitemap index)
 *
 * Next.js App Router の MetadataRoute.Sitemap を使用して
 * 複数サブサイトマップへのインデックスとして機能する。
 *
 * 生成されるエントリポイント:
 *   /sitemap.xml        → このファイル（静的 + 各動的サイトマップへの参照）
 *
 * サブサイトマップ（それぞれ独立したファイルで管理）:
 *   /products/sitemap.xml     → 商品ページ（generateSitemaps でページ分割）
 *   /categories/sitemap.xml   → カテゴリページ
 *   /stores/sitemap.xml       → ベンダーストアページ
 *   /blog/sitemap.xml         → ブログ記事
 *   /brands/sitemap.xml       → ブランドページ
 *
 * クロール戦略:
 *   - 静的ページ（トップ・shop 等）は本ファイルで直接管理
 *   - 動的コンテンツは各サブ sitemap.ts で管理し revalidate を個別設定
 *   - 認証必須・ユーザー固有ページ（/account, /checkout, /cart）は除外
 *   - 管理画面（/admin, /vendor）は除外
 */

import type { MetadataRoute } from 'next'

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mykenko.com'

export default function sitemap(): MetadataRoute.Sitemap {
  // ── 静的ページ（変更頻度・優先度を明示的に設定）──────────────────────────
  // 注意: /login /register はインデックス対象外のため含めない
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${BASE}/shop`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${BASE}/stores`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${BASE}/categories`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE}/brands`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${BASE}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${BASE}/become-vendor`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${BASE}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${BASE}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${BASE}/faq`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${BASE}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.2,
    },
    {
      url: `${BASE}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.2,
    },
  ]

  return staticRoutes
}
