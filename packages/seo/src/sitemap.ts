/**
 * Sitemap entry types for Next.js MetadataRoute.Sitemap
 */

export type ChangeFrequency = 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'

export interface SitemapEntry {
  url: string
  lastModified?: Date | string
  changeFrequency?: ChangeFrequency
  priority?: number
}

export function buildSitemapEntry(
  path: string,
  opts: { lastModified?: Date; changeFrequency?: ChangeFrequency; priority?: number } = {}
): SitemapEntry {
  const base = 'https://mykenko.jp'
  const normalized = path.startsWith('/') ? path : `/${path}`
  const withTrailing = normalized.endsWith('/') ? normalized : `${normalized}/`
  return {
    url: `${base}${withTrailing}`,
    lastModified: opts.lastModified ?? new Date(),
    changeFrequency: opts.changeFrequency ?? 'weekly',
    priority: opts.priority ?? 0.7,
  }
}
