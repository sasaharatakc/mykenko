import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'MYKENKO - 日本最大のヘルスケア知識プラットフォーム',
  alternates: {
    canonical: 'https://mykenko.jp/',
  },
}

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-b from-primary-50 to-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-primary mb-4">
            ヘルスケアの知識を、科学的に。
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            症状・成分・医薬品の正しい情報を、医師・薬剤師監修のデータベースで提供。
          </p>
          <p className="text-sm text-gray-500 mb-8">
            ※ 本サイトの情報は一般的な情報提供を目的としており、医療アドバイスではありません。常に医師・薬剤師にご相談ください。
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/symptoms/" className="btn-primary">
              症状から調べる
            </Link>
            <Link
              href="/ingredients/"
              className="inline-flex items-center px-6 py-3 border-2 border-primary text-primary font-bold rounded-lg hover:bg-primary-50 transition-colors"
            >
              成分から調べる
            </Link>
          </div>
        </div>
      </section>

      {/* Featured symptom clusters */}
      <section className="py-12 px-4 max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold mb-8">主な症状カテゴリー</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {SYMPTOM_CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/symptoms/${cat.slug}/`}
              className="card p-4 text-center hover:border-primary transition-colors"
            >
              <span className="text-3xl mb-2 block">{cat.emoji}</span>
              <span className="text-sm font-medium">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}

const SYMPTOM_CATEGORIES = [
  { slug: 'aga', name: '育毛・AGA', emoji: '💈' },
  { slug: 'erectile-dysfunction', name: 'ED・性機能', emoji: '🏥' },
  { slug: 'sleep-disorder', name: '睡眠障害', emoji: '😴' },
  { slug: 'obesity', name: '肥満・ダイエット', emoji: '⚖️' },
  { slug: 'acne', name: '肉・ニキビ', emoji: '💫' },
  { slug: 'chronic-fatigue', name: '慢性疲労', emoji: '😴' },
  { slug: 'menopause', name: '更年期障害', emoji: '🌸' },
  { slug: 'allergy', name: 'アレルギー', emoji: '🌼' },
  { slug: 'liver-dysfunction', name: '肝機能', emoji: '🌱' },
  { slug: 'stress-anxiety', name: 'ストレス', emoji: '🧠' },
]
