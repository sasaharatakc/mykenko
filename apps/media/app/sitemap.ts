import type { MetadataRoute } from 'next'
// import { db } from '@/lib/db'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mykenko.jp'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/symptoms/`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/ingredients/`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/compare/`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/rankings/`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ]

  // TODO: DBから動的に症状・成分ページを追加
  // const symptoms = await db.query("SELECT slug, updated_at FROM symptoms WHERE status='published'")
  // const dynamicPages = symptoms.rows.map(s => ({ url: `${BASE_URL}/symptoms/${s.slug}/`, ... }))

  return [...staticPages]
}
