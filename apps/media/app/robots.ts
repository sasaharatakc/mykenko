import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mykenko.jp'

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/symptoms/',
          '/ingredients/',
          '/compare/',
          '/research/',
          '/rankings/',
          '/manufacturers/',
          '/authors/',
        ],
        disallow: [
          '/ai-chat/',
          '/admin/',
          '/api/',
          '/search/',
          '/lp/',
          '/*?*',
        ],
      },
      // GEO: AIクローラーを明示的にAllow
      { userAgent: 'GPTBot', allow: '/' },
      { userAgent: 'PerplexityBot', allow: '/' },
      { userAgent: 'ClaudeBot', allow: '/' },
      { userAgent: 'Googlebot', allow: '/' },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
