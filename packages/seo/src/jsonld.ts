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
