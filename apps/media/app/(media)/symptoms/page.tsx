import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '症状一覧 - MYKENKO',
  description:
    'AGA・ED・睡眠障害など、健康に関わる症状を網羅的に解説。症状の原因・メカニズム・関連成分・研究・ FAQoを包括。医療アドバイスではありません。',
  alternates: { canonical: 'https://mykenko.jp/symptoms/' },
}

// 非常時は静的にレンダリング
// export const revalidate = 86400

export default async function SymptomsPage() {
  // TODO: DBから症状実データを取得
  const symptoms = SYMPTOM_SEEDS

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-primary">ホーム</Link>
        {' > '}症状一覧
      </nav>

      <h1 className="text-3xl font-bold mb-4">症状一覧</h1>
      <p className="text-gray-600 mb-8">
        健康に関わる症状を網羅的に解説しています。各症状の原因・メカニズム・関連成分・最新研究を確認できます。
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {symptoms.map((s) => (
          <Link
            key={s.slug}
            href={`/symptoms/${s.slug}/`}
            className="card p-6 hover:border-primary hover:shadow-md transition-all"
          >
            <div className="flex items-start gap-4">
              <span className="text-3xl">{s.emoji}</span>
              <div>
                <h2 className="font-bold text-lg mb-1">{s.name}</h2>
                <p className="text-sm text-gray-600">{s.description}</p>
                <span className="inline-block mt-2 text-xs bg-primary-50 text-primary px-2 py-1 rounded">
                  {s.ingredientCount}成分分析
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* 必須の免賬事項 */}
      <div className="medical-disclaimer mt-12">
        <p>
          ※本ページの情報は一般的な情報提供を目的としており、医療アドバイス・診断・治療の指示ではありません。
          症状については必ず医師・薬剤師にご相談ください。
          専門家の判断なしに医薬品を購入・使用されることはおすすめしません。
        </p>
      </div>
    </div>
  )
}

const SYMPTOM_SEEDS = [
  { slug: 'aga', name: 'AGA（男性型脱毛症）', emoji: '💈', description: 'ジヒドロテストステロンによる進行性脱毛。フィナステリド・ミノキシジル等で対応可能。', ingredientCount: 12 },
  { slug: 'erectile-dysfunction', name: 'ED（勧起不全）', emoji: '🏥', description: 'シルデナフィル等のED治療薬による改善事例が報告されています。', ingredientCount: 8 },
  { slug: 'sleep-disorder', name: '睡眠障害', emoji: '😴', description: '不眠・過眠・睡眠リズム障害等。メラトニン・ガバ・テアニン等の成分研究。', ingredientCount: 10 },
  { slug: 'obesity', name: '肥満・ダイエット', emoji: '⚖️', description: 'BMI・内臓脂肪等に基づく評価と成分・运動・食事稿。', ingredientCount: 18 },
  { slug: 'acne', name: 'ニキビ・肌荒れ', emoji: '💫', description: '腐肉系・馬銀角系ニキビの原因別対応と成分。', ingredientCount: 14 },
  { slug: 'chronic-fatigue', name: '慢性疲労・倍怀感', emoji: '😴', description: 'コエンザイムQ10・B群・鉄分などのエネルギー成分。', ingredientCount: 9 },
]
