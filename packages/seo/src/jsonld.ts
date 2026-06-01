/**
 * JSON-LD Schema.org generators for MYKENKO
 * All generators follow Schema.org specs and healthcare compliance requirements.
 */

export interface OrganizationJsonLd {
  '@context': 'https://schema.org'
  '@type': 'Organization'
  name: string
  url: string
  logo: string
  sameAs: string[]
}

export function generateOrganizationJsonLd(): OrganizationJsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'MYKENKO',
    url: 'https://mykenko.jp',
    logo: 'https://mykenko.jp/images/logo.png',
    sameAs: [
      'https://twitter.com/mykenko_jp',
    ],
  }
}

export interface MedicalConditionJsonLd {
  '@context': 'https://schema.org'
  '@type': 'MedicalCondition'
  name: string
  description: string
  url: string
  code?: { '@type': 'MedicalCode'; code: string; codingSystem: string }
}

export function generateSymptomJsonLd(params: {
  name: string
  description: string
  slug: string
  icdCode?: string
}): MedicalConditionJsonLd {
  const base: MedicalConditionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'MedicalCondition',
    name: params.name,
    description: params.description,
    url: `https://mykenko.jp/symptoms/${params.slug}/`,
  }
  if (params.icdCode) {
    base.code = {
      '@type': 'MedicalCode',
      code: params.icdCode,
      codingSystem: 'ICD-10',
    }
  }
  return base
}

export interface DietarySupplementJsonLd {
  '@context': 'https://schema.org'
  '@type': 'DietarySupplement'
  name: string
  description: string
  url: string
  activeIngredient?: string
  safetyConsideration?: string
}

export function generateIngredientJsonLd(params: {
  name: string
  description: string
  slug: string
  safetyNotes?: string
}): DietarySupplementJsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'DietarySupplement',
    name: params.name,
    description: params.description,
    url: `https://mykenko.jp/ingredients/${params.slug}/`,
    ...(params.safetyNotes && { safetyConsideration: params.safetyNotes }),
  }
}

// ── Product JSON-LD (shop product pages) ──────────────────────────────────────

export interface OfferJsonLd {
  '@type': 'Offer'
  price: string
  priceCurrency: string
  availability: string
  url: string
  priceValidUntil?: string
  seller?: { '@type': 'Organization'; name: string }
}

export interface ProductJsonLd {
  '@context': 'https://schema.org'
  '@type': 'Product'
  name: string
  description: string
  url: string
  image?: string | string[]
  brand?: { '@type': 'Brand'; name: string }
  offers: OfferJsonLd
  aggregateRating?: {
    '@type': 'AggregateRating'
    ratingValue: string
    reviewCount: string
  }
  /** NOTE: Do NOT include unsubstantiated health claims.
   *  薬機法・景表法準拠: 医療効果・効能の断定表現を含めないこと */
}

/**
 * Generate Product JSON-LD for shop product pages.
 *
 * 薬機法・景表法注意事項:
 * - `description` に「治る」「効く」「必ず痩せる」などの断定表現を含めないこと
 * - `name` は商品の正式名称のみ（効能・効果を含めないこと）
 * - `aggregateRating` はレビューデータが実在する場合のみ渡すこと
 */
export function generateProductJsonLd(params: {
  name: string
  /** 薬機法準拠: 断定的な効能・効果を含めないこと */
  description: string
  slug: string
  imageUrl?: string | string[]
  brandName?: string
  price: number
  currency?: string
  /** 'InStock' | 'OutOfStock' | 'PreOrder' */
  availability?: string
  priceValidUntil?: string
  rating?: { value: number; count: number }
}): ProductJsonLd {
  const currency = params.currency ?? 'JPY'
  const availability =
    params.availability ?? 'https://schema.org/InStock'
  const url = `https://shop.mykenko.jp/products/${params.slug}/`

  const product: ProductJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: params.name,
    description: params.description,
    url,
    offers: {
      '@type': 'Offer',
      price: String(params.price),
      priceCurrency: currency,
      availability: availability.startsWith('https://')
        ? availability
        : `https://schema.org/${availability}`,
      url,
      seller: { '@type': 'Organization', name: 'MYKENKO' },
      ...(params.priceValidUntil && { priceValidUntil: params.priceValidUntil }),
    },
    ...(params.imageUrl && { image: params.imageUrl }),
    ...(params.brandName && {
      brand: { '@type': 'Brand', name: params.brandName },
    }),
    ...(params.rating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: String(params.rating.value),
        reviewCount: String(params.rating.count),
      },
    }),
  }

  return product
}

// ── FAQ JSON-LD ────────────────────────────────────────────────────────────────

export interface FaqJsonLd {
  '@context': 'https://schema.org'
  '@type': 'FAQPage'
  mainEntity: Array<{
    '@type': 'Question'
    name: string
    acceptedAnswer: { '@type': 'Answer'; text: string }
  }>
}

export function generateFaqJsonLd(
  faqs: Array<{ question: string; answer: string }>
): FaqJsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  }
}

// ── Breadcrumb JSON-LD ─────────────────────────────────────────────────────────

export interface BreadcrumbJsonLd {
  '@context': 'https://schema.org'
  '@type': 'BreadcrumbList'
  itemListElement: Array<{
    '@type': 'ListItem'
    position: number
    name: string
    item: string
  }>
}

export function generateBreadcrumbJsonLd(
  crumbs: Array<{ name: string; url: string }>
): BreadcrumbJsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: crumb.name,
      item: crumb.url,
    })),
  }
}
