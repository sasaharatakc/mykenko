import type { Metadata } from 'next'
import Link from 'next/link'
import { Scale, ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: '商品比較 | MYKENKO',
  description: 'ED治療薬・AGA治療薬など医薬品の詳細な比較表。シアリスvsバイアグラなど主要製品を徹底比較します。',
}

const CATEGORY_COMPARISONS = [
  {
    category: 'ED治療薬',
    comparisons: [
      { slug: 'cialis-vs-viagra', label: 'シアリス vs バイアグラ', popular: true },
      { slug: 'sildenafil-vs-vardenafil', label: 'シルデナフィル vs バルデナフィル', popular: false },
      { slug: 'tadalafil-daily-vs-ondemand', label: 'タダラフィル毎日 vs 頓服', popular: false },
    ],
  },
  {
    category: 'AGA治療薬',
    comparisons: [
      { slug: 'finasteride-vs-dutasteride', label: 'フィナステリド vs デュタステリド', popular: true },
      { slug: 'minoxidil-topical-vs-oral', label: 'ミノキシジル外用 vs 内服', popular: false },
    ],
  },
  {
    category: '美容薬',
    comparisons: [
      { slug: 'tretinoin-vs-retinol', label: 'トレチノイン vs レチノール', popular: true },
      { slug: 'hydroquinone-vs-kojic-acid', label: 'ハイドロキノン vs コウジ酸', popular: false },
    ],
  },
]

export default function ComparePage() {
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero */}
      <div className="bg-white border-b border-gray-100">
        <div className="container-narrow py-12 text-center">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-500 bg-primary-50 px-3 py-1 rounded-full mb-3">
            <Scale className="w-3.5 h-3.5" />
            COMPARE
          </span>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-gray-900">商品比較</h1>
          <p className="text-gray-500 mt-3 max-w-lg mx-auto text-sm">
            主要医薬品を詳細な比較表で徹底比較。成分・効果・持続時間・価格など多角的に分析します。
          </p>
        </div>
      </div>

      <div className="container-narrow py-10">
        {/* Instruction */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-8 text-center">
          <Scale className="w-10 h-10 text-primary-300 mx-auto mb-3" />
          <h2 className="font-display text-lg font-bold text-gray-900 mb-2">
            比較する商品を選んでください
          </h2>
          <p className="text-sm text-gray-500">
            下記のカテゴリから気になる比較ページをお選びください。
            成分・効果・副作用・価格を一覧表で確認できます。
          </p>
        </div>

        {/* Category sections */}
        <div className="space-y-8">
          {CATEGORY_COMPARISONS.map((cat) => (
            <div key={cat.category}>
              <h2 className="font-display text-lg font-bold text-gray-900 mb-4">
                {cat.category}比較
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {cat.comparisons.map((comp) => (
                  <Link
                    key={comp.slug}
                    href={`/compare/${comp.slug}`}
                    className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-md hover:border-primary-200 transition-all group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
                        <Scale className="w-5 h-5 text-primary-500" />
                      </div>
                      {comp.popular && (
                        <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                          人気
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm mb-1 group-hover:text-primary-500 transition-colors">
                      {comp.label}
                    </h3>
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-2">
                      比較表を見る <ArrowRight className="w-3 h-3" />
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-10 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-6 text-center text-white">
          <h3 className="font-display text-xl font-bold mb-2">商品を探す</h3>
          <p className="text-primary-100 text-sm mb-5">
            比較して気になった商品はそのまま購入できます。
          </p>
          <Link
            href="/shop"
            className="inline-block bg-white text-primary-500 font-semibold text-sm px-6 py-3 rounded-xl hover:bg-primary-50 transition-colors"
          >
            全商品を見る →
          </Link>
        </div>
      </div>
    </div>
  )
}
