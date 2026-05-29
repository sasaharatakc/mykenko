import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import {
  generateIngredientJsonLd,
  generateBreadcrumbJsonLd,
  generateFaqJsonLd,
} from '@mykenko/seo'

// ── Types ──────────────────────────────────────────────────────────────────────

type EvidenceLevel = 'A' | 'B' | 'C'

interface IngredientStudy {
  title: string
  url: string | null
  year: number | null
  summary: string | null
}

interface IngredientFaq {
  question: string
  answer: string
}

interface IngredientDetail {
  id: string
  slug: string
  nameJa: string
  nameEn: string | null
  descriptionJa: string | null
  evidenceLevel: EvidenceLevel | null
  casNumber: string | null
  safetyNotes: string | null
  studies: IngredientStudy[]
  faqs: IngredientFaq[]
  isPublished: boolean
}

// ── Evidence level labels ──────────────────────────────────────────────────────

const EVIDENCE_LABELS: Record<EvidenceLevel, string> = {
  A: 'A — 強い根拠あり (複数の無作為化比較試験)',
  B: 'B — 中程度の根拠 (観察研究・予備的試験)',
  C: 'C — 限定的な根拠 (症例報告・伝統的使用)',
}

const EVIDENCE_COLORS: Record<EvidenceLevel, string> = {
  A: 'bg-green-100 text-green-800',
  B: 'bg-yellow-100 text-yellow-800',
  C: 'bg-orange-100 text-orange-800',
}

// ── Data fetching ──────────────────────────────────────────────────────────────

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'

async function fetchIngredient(slug: string): Promise<IngredientDetail | null> {
  try {
    const res = await fetch(`${API_BASE}/api/ingredients/${slug}`, {
      next: { revalidate: 3600 },
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
    const res = await fetch(`${API_BASE}/api/ingredients?limit=1000&fields=slug`, {
      next: { revalidate: 3600 },
    })
    if (!res.ok) return []
    const data = await res.json()
    return (data.data ?? []).map((i: { slug: string }) => i.slug)
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
  const ingredient = await fetchIngredient(params.slug)
  if (!ingredient) return {}

  const title = `${ingredient.nameJa}の効果・安全性・エビデンスを解説 | MYKENKO`
  const description =
    ingredient.descriptionJa?.slice(0, 120) ??
    `${ingredient.nameJa}についての一般情報です。効果を保証するものではありません。医師・薬剤師にご相談ください。`

  return {
    title,
    description,
    alternates: {
      canonical: `https://mykenko.jp/ingredients/${ingredient.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://mykenko.jp/ingredients/${ingredient.slug}`,
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

export default async function IngredientPage({ params }: { params: { slug: string } }) {
  const ingredient = await fetchIngredient(params.slug)
  if (!ingredient || !ingredient.isPublished) notFound()

  // JSON-LD
  const ingredientJsonLd = generateIngredientJsonLd({
    name: ingredient.nameJa,
    description: ingredient.descriptionJa ?? '',
    slug: ingredient.slug,
    safetyNotes: ingredient.safetyNotes ?? undefined,
  })

  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: 'ホーム', url: 'https://mykenko.jp' },
    { name: '成分・素材一覧', url: 'https://mykenko.jp/ingredients' },
    { name: ingredient.nameJa, url: `https://mykenko.jp/ingredients/${ingredient.slug}` },
  ])

  const faqJsonLd =
    ingredient.faqs.length > 0
      ? generateFaqJsonLd(
          ingredient.faqs.map((f) => ({ question: f.question, answer: f.answer })),
        )
      : null

  return (
    <>
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ingredientJsonLd) }}
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
            <li><a href="/ingredients">成分・素材一覧</a></li>
            <li>/</li>
            <li aria-current="page">{ingredient.nameJa}</li>
          </ol>
        </nav>

        {/* Heading */}
        <h1 className="mb-2 text-3xl font-bold">{ingredient.nameJa}</h1>
        {ingredient.nameEn && (
          <p className="mb-2 text-sm text-gray-400">{ingredient.nameEn}</p>
        )}
        {ingredient.casNumber && (
          <p className="mb-4 text-xs text-gray-400">CAS番号: {ingredient.casNumber}</p>
        )}

        {/* Evidence level badge */}
        {ingredient.evidenceLevel && (
          <div className="mb-6">
            <span
              className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${EVIDENCE_COLORS[ingredient.evidenceLevel]}`}
            >
              エビデンスレベル {EVIDENCE_LABELS[ingredient.evidenceLevel]}
            </span>
            {/* 景表法: エビデンスレベルは研究の質を示すものであり、効果を保証するものではない旨を明示 */}
            <p className="mt-1 text-xs text-gray-500">
              ※エビデンスレベルは既存研究の質を示すものです。効果・効能を保証するものではありません。
            </p>
          </div>
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
        {ingredient.descriptionJa && (
          <section className="mb-8">
            <h2 className="mb-3 text-xl font-semibold">概要</h2>
            <p className="leading-relaxed text-gray-700">{ingredient.descriptionJa}</p>
          </section>
        )}

        {/* Safety notes */}
        {ingredient.safetyNotes && (
          <section className="mb-8 rounded-md border border-red-200 bg-red-50 p-4">
            <h2 className="mb-2 text-base font-semibold text-red-800">⚠️ 安全性・注意事項</h2>
            <p className="text-sm text-red-700">{ingredient.safetyNotes}</p>
          </section>
        )}

        {/* Studies / citations */}
        {ingredient.studies.length > 0 && (
          <section className="mb-8">
            <h2 className="mb-4 text-xl font-semibold">参考文献・研究</h2>
            <ul className="space-y-3">
              {ingredient.studies.map((study, i) => (
                <li key={i} className="rounded-md border border-gray-200 p-4">
                  <p className="font-medium text-gray-900">
                    {study.url ? (
                      <a
                        href={study.url}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        className="text-blue-600 hover:underline"
                      >
                        {study.title}
                      </a>
                    ) : (
                      study.title
                    )}
                    {study.year && (
                      <span className="ml-2 text-sm text-gray-400">({study.year})</span>
                    )}
                  </p>
                  {study.summary && (
                    <p className="mt-1 text-sm text-gray-600">{study.summary}</p>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* FAQ */}
        {ingredient.faqs.length > 0 && (
          <section className="mb-8">
            <h2 className="mb-4 text-xl font-semibold">よくある質問</h2>
            <dl className="space-y-4">
              {ingredient.faqs.map((faq, i) => (
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
