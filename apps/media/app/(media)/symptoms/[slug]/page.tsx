import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
// import { db } from '@/lib/db'
// import { generateSymptomJsonLd } from '@mykenko/seo'

type Props = {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const symptom = getSymptomBySlug(params.slug)
  if (!symptom) return {}

  return {
    title: `${symptom.name}とは？原因・成分・対策 | MYKENKO`,
    description: `${symptom.name}の原因・メカニズム・有効成分・研究・ FAQを解説。医師監修。効果を保証するものではありません。`,
    alternates: {
      canonical: `https://mykenko.jp/symptoms/${params.slug}/`,
    },
    openGraph: {
      title: `${symptom.name}の情報 | MYKENKO`,
      type: 'article',
    },
  }
}

// TODO: DBに切り替える
export async function generateStaticParams() {
  return SYMPTOM_SEEDS.map((s) => ({ slug: s.slug }))
}

export default async function SymptomPage({ params }: Props) {
  const symptom = getSymptomBySlug(params.slug)
  if (!symptom) notFound()

  return (
    <article className="max-w-4xl mx-auto px-4 py-12">
      {/* パンくず */}
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-primary">ホーム</Link>
        {' > '}
        <Link href="/symptoms/" className="hover:text-primary">症状一覧</Link>
        {' > '}{symptom.name}
      </nav>

      <h1 className="text-3xl font-bold mb-2">{symptom.name}とは</h1>

      {/* 定義文（AI引用されやすい簡潔定義） */}
      <p className="text-gray-700 mb-8 text-lg leading-relaxed">
        {symptom.definition}
      </p>

      {/* 原因・メカニズム */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">{symptom.name}の原因・メカニズム</h2>
        <p className="text-gray-700 leading-relaxed">{symptom.mechanism}</p>
      </section>

      {/* 関連成分 */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">関連する成分・有効成分</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {symptom.relatedIngredients.map((ing) => (
            <Link
              key={ing.slug}
              href={`/ingredients/${ing.slug}/`}
              className="card p-4 hover:border-primary transition-colors"
            >
              <span className="font-bold">{ing.name}</span>
              <p className="text-sm text-gray-600 mt-1">{ing.summary}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">よくある質問</h2>
        <div className="space-y-4">
          {symptom.faqs.map((faq, i) => (
            <div key={i} className="card p-4">
              <h3 className="font-bold text-primary mb-2">Q. {faq.question}</h3>
              <p className="text-gray-700 text-sm">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Commerce CTA */}
      <section className="bg-primary-50 border border-primary rounded-xl p-6 mb-8">
        <h3 className="font-bold text-lg mb-2">
          {symptom.name}の関連商品を比較する
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          全ての商品は購入・使用前に必ず医師・薬剤師にご相談ください。効果を保証するものではありません。
        </p>
        <a
          href={`${process.env.NEXT_PUBLIC_SHOP_URL ?? 'https://shop.mykenko.jp'}/category/${params.slug}/`}
          className="btn-primary"
          rel="noopener"
        >
          商品ランキングを見る →
        </a>
      </section>

      {/* 必須免賬表記 */}
      <div className="medical-disclaimer">
        <p className="font-bold mb-1">ご注意</p>
        <p>
          本ページは一般的な情報提供を目的としており、医療アドバイス・診断・治療の指示ではありません。
          個人の症状や体質により異なります。必ず医師・薬剤師にご相談ください。
          専門家の判断なしに医薬品を購入・使用されることはおすすめしません。
        </p>
      </div>
    </article>
  )
}

function getSymptomBySlug(slug: string) {
  return SYMPTOM_SEEDS.find((s) => s.slug === slug) ?? null
}

// TODO: Payload CMS / DBに移行
const SYMPTOM_SEEDS = [
  {
    slug: 'aga',
    name: 'AGA（男性型脱毛症）',
    definition:
      'AGA（アンドロジェネティック・アロペシア）は、ディハイドロテストステロン（DHT）による進行性脱毛症であり、日本人男性の素4人に1人にみられる（日本皮膚科学会）。',
    mechanism:
      '5αリダクターゼによりテストステロンがDHTに変換され、毛髪当のアンドロゲン受容体に結合することで毛髪の成長期が短縮する。フィナステリドはII型5αリダクターゼを選択的に阻害し、DHT産生を抑制する。',
    relatedIngredients: [
      { slug: 'finasteride', name: 'フィナステリド', summary: 'II型5αリダクターゼ阻害剤。AGA処方薬。' },
      { slug: 'minoxidil', name: 'ミノキシジル', summary: '血管拡張作用による育毛成分。市販・処方両方あり。' },
      { slug: 'dutasteride', name: 'デュタステリド', summary: 'I型・II型両方5αリダクターゼ阻害剤。' },
    ],
    faqs: [
      {
        question: 'AGAは完治できますか？',
        answer:
          'AGAは多くの場合沿療による改善が記載されていますが、完治を保証するものではありません。実際の効果は個人差があります。必ず医師にご相談ください。',
      },
      {
        question: 'AGAは何科を受診すればいいですか？',
        answer:
          '皮膚科や毛髪状態を専門とするクリニックが導口です。AGA専門外来やオンライン誊療クリニックも選択肢の一つです。',
      },
    ],
  },
]
