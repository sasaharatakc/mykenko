import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import {
  generateSymptomJsonLd,
  generateBreadcrumbJsonLd,
  generateFaqJsonLd,
} from '@mykenko/seo'

// ── Types ──────────────────────────────────────────────────────────────────────

interface SymptomFaq {
  question: string
  answer: string
}

interface SymptomDetail {
  id: string
  slug: string
  nameJa: string
  nameEn: string | null
  descriptionJa: string | null
  icdCode: string | null
  severity: string | null
  bodySystems: string[]
  faqs: SymptomFaq[]
  isPublished: boolean
}

// ── Data fetching ──────────────────────────────────────────────────────────────

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'

async function fetchSymptom(slug: string): Promise<SymptomDetail | null> {
  try {
    const res = await fetch(`${API_BASE}/api/symptoms/${slug}`, {
      next: { revalidate: 3600 }, // ISR: 1 hour
    })
    if (res.status === 404) return null
    if (!res.ok) throw new Error(`API error: ${res.status}`)
    return res.json()
  } catch {
    return null
  }
}

async function fetchAllSlugs(): Promise<string[]> {
  try {
    const res = await fetch(`${API_BASE}/api/symptoms?limit=1000&fields=slug`, {
      next: { revalidate: 3600 },
    })
    if (!res.ok) return []
    const data = await res.json()
    return (data.data ?? []).map((s: { slug: string }) => s.slug)
  } catch {
    return []
  }
}

// ── Static generation ──────────────────────────────────────────────────────────

export async function generateStaticParams() {
  const slugs = await fetchAllSlugs()
  return slugs.map((slug) => ({ slug }))
}

// ── Metadata ───────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const symptom = await fetchSymptom(params.slug)
  if (!symptom) return {}

  const title = `${symptom.nameJa}とは？原因・症状・対策を解説 | MYKENKO`
  const description =
    symptom.descriptionJa?.slice(0, 120) ??
    `${symptom.nameJa}についての一般情報をご紹介します。効果を保証するものではありません。医師・薬剤師にご相談ください。`

  return {
    title,
    description,
    alternates: {
      canonical: `https://mykenko.jp/symptoms/${symptom.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://mykenko.jp/symptoms/${symptom.slug}`,
      siteName: 'MYKENKO',
      locale: 'ja_JP',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}

// ── Page component ─────────────────────────────────────────────────────────────

export default async function SymptomPage({ params }: { params: { slug: string } }) {
  const symptom = await fetchSymptom(params.slug)
  if (!symptom || !symptom.isPublished) notFound()

  // JSON-LD
  const symptomJsonLd = generateSymptomJsonLd({
    name: symptom.nameJa,
    description: symptom.descriptionJa ?? '',
    slug: symptom.slug,
    ...(symptom.icdCode ? { icdCode: symptom.icdCode } : {}),
  })

  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: 'ホーム', url: 'https://mykenko.jp' },
    { name: '症状一覧', url: 'https://mykenko.jp/symptoms' },
    { name: symptom.nameJa, url: `https://mykenko.jp/symptoms/${symptom.slug}` },
  ])

  const faqJsonLd =
    symptom.faqs.length > 0
      ? generateFaqJsonLd(symptom.faqs.map((f) => ({ question: f.question, answer: f.answer })))
      : null

  return (
    <>
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(symptomJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}

      <main className="mx-auto max-w-3xl px-4 py-10">
        {/* Breadcrumb */}
        <nav aria-label="パンくずリスト" className="mb-6 text-sm text-gray-500">
          <ol className="flex gap-2">
            <li><a href="/">ホーム</a></li>
            <li>/</li>
            <li><a href="/symptoms">症状一覧</a></li>
            <li>/</li>
            <li aria-current="page">{symptom.nameJa}</li>
          </ol>
        </nav>

        {/* Heading */}
        <h1 className="mb-2 text-3xl font-bold">{symptom.nameJa}</h1>
        {symptom.nameEn && (
          <p className="mb-4 text-sm text-gray-400">{symptom.nameEn}</p>
        )}
        {symptom.icdCode && (
          <p className="mb-6 text-xs text-gray-400">ICD コード: {symptom.icdCode}</p>
        )}

        {/* Medical disclaimer — 薬機法・医療広告GL 必須 */}
        <aside
          role="note"
          className="mb-8 rounded-md border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-800"
        >
          本ページの情報は一般的な情報提供を目的としており、効果を保証するものではありません。
          個人の症状・体質により異なります。購入・使用前に必ず医師・薬剤師にご相談ください。
        </aside>

        {/* Description */}
        {symptom.descriptionJa && (
          <section className="mb-8">
            <h2 className="mb-3 text-xl font-semibold">概要</h2>
            <p className="leading-relaxed text-gray-700">{symptom.descriptionJa}</p>
          </section>
        )}

        {/* Body systems */}
        {symptom.bodySystems.length > 0 && (
          <section className="mb-8">
            <h2 className="mb-3 text-xl font-semibold">関連する体の系統</h2>
            <ul className="flex flex-wrap gap-2">
              {symptom.bodySystems.map((bs) => (
                <li
                  key={bs}
                  className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700"
                >
                  {bs}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* FAQ */}
        {symptom.faqs.length > 0 && (
          <section className="mb-8">
            <h2 className="mb-4 text-xl font-semibold">よくある質問</h2>
            <dl className="space-y-4">
              {symptom.faqs.map((faq, i) => (
                <div key={i} className="rounded-md border border-gray-200 p-4">
                  <dt className="font-medium text-gray-900">Q. {faq.question}</dt>
                  <dd className="mt-2 text-gray-600">A. {faq.answer}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}
      </main>
    </>
  )
}
