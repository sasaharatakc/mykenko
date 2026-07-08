import { Suspense } from 'react'
import type { Metadata } from 'next'
import CategoryContent from './CategoryContent'
import { CATEGORY_SEO } from './categorySeo'

interface Props {
  params: { slug: string }
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const seo = CATEGORY_SEO[params.slug]
  if (seo) {
    return {
      title: { absolute: seo.title },
      description: seo.description,
      alternates: { canonical: `/categories/${params.slug}` },
      openGraph: {
        title: seo.title,
        description: seo.description,
        url: `/categories/${params.slug}`,
      },
    }
  }
  return {
    title: `${params.slug.replace(/-/g, ' ')} | MYKENKO`,
    description: `Browse products in ${params.slug.replace(/-/g, ' ')}.`,
  }
}

interface ApiProduct {
  name: string
  slug: string
}

async function fetchCategoryProducts(slug: string): Promise<ApiProduct[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'}/products?category=${slug}&per_page=10`,
      { next: { revalidate: 3600 } }
    )
    if (!res.ok) return []
    const data = await res.json()
    return Array.isArray(data?.data) ? data.data : []
  } catch {
    return []
  }
}

function buildJsonLd(slug: string, products: ApiProduct[]): object[] {
  const seo = CATEGORY_SEO[slug]
  if (!seo) return []

  const schemas: object[] = [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'ホーム', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: '商品一覧', item: `${SITE_URL}/shop` },
        { '@type': 'ListItem', position: 3, name: seo.breadcrumbName, item: `${SITE_URL}/categories/${slug}` },
      ],
    },
  ]

  if (seo.faq && seo.faq.length > 0) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: seo.faq.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    })
  }

  if (products.length > 0) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: seo.breadcrumbName,
      itemListElement: products.map((p, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: p.name,
        url: `${SITE_URL}/products/${p.slug}`,
      })),
    })
  }

  return schemas
}

export default async function CategoryPage({ params }: Props) {
  const hasSeo = Boolean(CATEGORY_SEO[params.slug])
  const products = hasSeo ? await fetchCategoryProducts(params.slug) : []
  const jsonLd = buildJsonLd(params.slug, products)

  return (
    <>
      {jsonLd.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      <Suspense fallback={<div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full" /></div>}>
        <CategoryContent slug={params.slug} />
      </Suspense>
    </>
  )
}
