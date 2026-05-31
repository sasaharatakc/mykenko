import type { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mykenko.jp'
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'

async function fetchSlugs(endpoint: string): Promise<{ slug: string; updatedAt?: string }[]> {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      next: { revalidate: 3600 },
    })
    if (!res.ok) return []
    const data = await res.json()
    return data.data ?? []
  } catch {
    return []
  }
}

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
  ]

  const [symptoms, ingredients] = await Promise.all([
    fetchSlugs('/api/symptoms?limit=1000&fields=slug,updatedAt'),
    fetchSlugs('/api/ingredients?limit=1000&fields=slug,updatedAt'),
  ])

  const symptomPages: MetadataRoute.Sitemap = symptoms.map((s) => ({
    url: `${BASE_URL}/symptoms/${s.slug}/`,
    lastModified: s.updatedAt ? new Date(s.updatedAt) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  const ingredientPages: MetadataRoute.Sitemap = ingredients.map((i) => ({
    url: `${BASE_URL}/ingredients/${i.slug}/`,
    lastModified: i.updatedAt ? new Date(i.updatedAt) : new Date(),
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  return [...staticPages, ...symptomPages, ...ingredientPages]
}
