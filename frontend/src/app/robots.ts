import type { MetadataRoute } from 'next'

const BASE = process.env.NEXT_PUBLIC_SITE_URL || 'https://shofy.com'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/vendor/', '/account/', '/checkout/', '/api/'],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
  }
}
