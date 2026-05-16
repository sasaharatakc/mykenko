import type { MetadataRoute } from 'next'

const BASE    = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
const API_URL = process.env.NEXT_PUBLIC_API_URL  ?? 'http://localhost:8000/api'

async function fetchSlugs(path: string): Promise<{ slug: string; updated_at?: string }[]> {
  try {
    const res = await fetch(`${API_URL}${path}`, { next: { revalidate: 3600 } })
    if (!res.ok) return []
    const json = await res.json()
    return json?.data?.data ?? json?.data ?? []
  } catch {
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories, stores, blogs] = await Promise.all([
    fetchSlugs('/products?per_page=500'),
    fetchSlugs('/categories'),
    fetchSlugs('/stores?per_page=200'),
    fetchSlugs('/blog?per_page=200'),
  ])

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE,                          lastModified: new Date(), changeFrequency: 'daily',   priority: 1   },
    { url: `${BASE}/shop`,                lastModified: new Date(), changeFrequency: 'hourly',  priority: 0.9 },
    { url: `${BASE}/stores`,              lastModified: new Date(), changeFrequency: 'daily',   priority: 0.8 },
    { url: `${BASE}/blog`,                lastModified: new Date(), changeFrequency: 'daily',   priority: 0.7 },
    { url: `${BASE}/become-vendor`,       lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/contact`,             lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/about`,               lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE}/faq`,                 lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE}/privacy`,             lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${BASE}/terms`,               lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${BASE}/login`,               lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${BASE}/register`,            lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
  ]

  const productRoutes: MetadataRoute.Sitemap = products.map(p => ({
    url: `${BASE}/products/${p.slug}`,
    lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  const categoryRoutes: MetadataRoute.Sitemap = categories.map(c => ({
    url: `${BASE}/categories/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  const storeRoutes: MetadataRoute.Sitemap = stores.map(s => ({
    url: `${BASE}/stores/${s.slug}`,
    lastModified: s.updated_at ? new Date(s.updated_at) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.6,
  }))

  const blogRoutes: MetadataRoute.Sitemap = blogs.map(b => ({
    url: `${BASE}/blog/${b.slug}`,
    lastModified: b.updated_at ? new Date(b.updated_at) : new Date(),
    changeFrequency: 'monthly',
    priority: 0.5,
  }))

  return [...staticRoutes, ...productRoutes, ...categoryRoutes, ...storeRoutes, ...blogRoutes]
}
