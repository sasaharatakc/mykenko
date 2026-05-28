import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '成分データベース - MYKENKO',
  description:
    'フィナステリド・EFミノキシジル等、医薬品・サプリメント成分のエビデンス・副作用・容量を解説。効果を保証するものではありません。',
  alternates: { canonical: 'https://mykenko.jp/ingredients/' },
}

export default async function IngredientsPage() {
  const ingredients = INGREDIENT_SEEDS

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-primary">ホーム</Link>
        {' > '}成分データベース
      </nav>
      <h1 className="text-3xl font-bold mb-4">成分データベース</h1>
      <p className="text-gray-600 mb-8">
        医薬品・サプリメントの成分を科学的な根拠に基づいて解説。効果を保証するものではありません。
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ingredients.map((ing) => (
          <Link
            key={ing.slug}
            href={`/ingredients/${ing.slug}/`}
            className="card p-6 hover:border-primary hover:shadow-md transition-all"
          >
            <div className="flex justify-between items-start mb-2">
              <h2 className="font-bold text-lg">{ing.name}</h2>
              <span className={`text-xs px-2 py-1 rounded font-medium ${
                ing.evidenceLevel === 'A' ? 'bg-green-100 text-green-700' :
                ing.evidenceLevel === 'B' ? 'bg-blue-100 text-blue-700' :
                'bg-gray-100 text-gray-600'
              }`}>
                エビデンス: {ing.evidenceLevel}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-2">{ing.description}</p>
            <p className="text-xs text-gray-500">関連症状: {ing.relatedSymptoms.join(' / ')}</p>
          </Link>
        ))}
      </div>
      <div className="medical-disclaimer mt-12">
        <p>
          ※成分についての情報は一般的な情報です。効果・安全性は個人差があります。必ず医師・薬剤師にご相談の上ご利用ください。
        </p>
      </div>
    </div>
  )
}

const INGREDIENT_SEEDS = [
  { slug: 'finasteride', name: 'フィナステリド', evidenceLevel: 'A', description: 'II型5αリダクターゼ阻害剤。AGA処方薬として山広い実績。', relatedSymptoms: ['AGA'] },
  { slug: 'minoxidil', name: 'ミノキシジル', evidenceLevel: 'A', description: '血管拡張作用。外用・内用両方存在。', relatedSymptoms: ['AGA'] },
  { slug: 'sildenafil', name: 'シルデナフィル', evidenceLevel: 'A', description: 'PDE5阻害剤。ED治療薬としてFDA承認。', relatedSymptoms: ['ED'] },
  { slug: 'melatonin', name: 'メラトニン', evidenceLevel: 'B', description: '海外ではサプリメントとして流通。睡眠リズム調整に関する研究あり。', relatedSymptoms: ['睡眠障害'] },
]
