import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CheckCircle, XCircle, Minus } from 'lucide-react'

interface ComparisonProduct {
  name: string
  japaneseName: string
  image: string
  ingredient: string
  duration: string
  dosage: string
  onsetTime: string
  foodEffect: string
  sideEffects: string
  price: string
  rating: number
  recommended: boolean
  recommendedFor: string
}

interface ComparisonData {
  title: string
  subtitle: string
  products: [ComparisonProduct, ComparisonProduct]
  rows: { key: keyof ComparisonProduct; label: string }[]
  analysis: string[]
  faq: { q: string; a: string }[]
}

const COMPARISONS: Record<string, ComparisonData> = {
  'cialis-vs-viagra': {
    title: 'シアリス vs バイアグラ 徹底比較',
    subtitle: 'タダラフィルとシルデナフィル、あなたに合うED治療薬はどちら？',
    products: [
      {
        name: 'シアリス（タダラフィル）',
        japaneseName: 'シアリス 20mg',
        image: 'https://picsum.photos/seed/cialis/300/300',
        ingredient: 'タダラフィル',
        duration: '最長36時間',
        dosage: '10mg / 20mg（頓服）\n5mg（毎日服用）',
        onsetTime: '15〜30分',
        foodEffect: 'ほぼなし',
        sideEffects: '頭痛・顔のほてり・背中の痛み',
        price: '¥2,980〜 / 錠',
        rating: 4.8,
        recommended: true,
        recommendedFor: '時間を気にせず自然なタイミングを大切にしたい方',
      },
      {
        name: 'バイアグラ（シルデナフィル）',
        japaneseName: 'バイアグラ 100mg',
        image: 'https://picsum.photos/seed/viagra/300/300',
        ingredient: 'シルデナフィル',
        duration: '4〜6時間',
        dosage: '25mg / 50mg / 100mg',
        onsetTime: '30〜60分',
        foodEffect: '高脂肪食で吸収遅延',
        sideEffects: '頭痛・顔のほてり・鼻づまり',
        price: '¥1,980〜 / 錠',
        rating: 4.7,
        recommended: false,
        recommendedFor: '短時間で確実に効果を得たい・コスト重視の方',
      },
    ],
    rows: [
      { key: 'ingredient', label: '有効成分' },
      { key: 'duration', label: '効果持続時間' },
      { key: 'onsetTime', label: '効果発現時間' },
      { key: 'dosage', label: '用法・用量' },
      { key: 'foodEffect', label: '食事の影響' },
      { key: 'sideEffects', label: '主な副作用' },
      { key: 'price', label: '価格目安' },
    ],
    analysis: [
      '持続時間の点ではシアリス（タダラフィル）が圧倒的に優れており、最長36時間という長い効果持続時間が最大の特長です。性行為の前日に服用しておくことも可能です。',
      'バイアグラ（シルデナフィル）は50年以上の使用実績を持つED治療薬の先駆けで、世界中で最も広く研究されています。価格面でも一般的にシルデナフィルの方が安価です。',
      '食事の影響については、タダラフィルがほとんど受けないのに対し、シルデナフィルは高脂肪食後に服用すると吸収が遅れる可能性があります。',
      '副作用のプロファイルは両者似ていますが、タダラフィルでは背中・筋肉の痛みが特有の副作用として報告されることがあります。',
    ],
    faq: [
      { q: 'シアリスとバイアグラを同時に服用できますか？', a: '同じPDE5阻害薬の重複使用は禁忌です。過度の血圧低下を招く危険があります。' },
      { q: 'どちらが「より強い」ですか？', a: '有効率に大きな差はなく（どちらも約70〜80%）、「強さ」より「持続時間」「食事の影響」「副作用の出やすさ」で選ぶことが重要です。' },
      { q: '初めてED治療薬を試す場合はどちらがよいですか？', a: 'シルデナフィル50mgから始めるケースが多いです。コストが低く、短時間で効果・副作用を確認できます。' },
    ],
  },
  'finasteride-vs-dutasteride': {
    title: 'フィナステリド vs デュタステリド 徹底比較',
    subtitle: 'AGA治療の二大内服薬、どちらを選ぶべきか？',
    products: [
      {
        name: 'フィナステリド（プロペシア）',
        japaneseName: 'プロペシア 1mg',
        image: 'https://picsum.photos/seed/finasteride/300/300',
        ingredient: 'フィナステリド',
        duration: '服用継続中',
        dosage: '1mg 1日1回',
        onsetTime: '3〜6ヶ月で効果実感',
        foodEffect: 'なし',
        sideEffects: '性欲減退・勃起機能低下（約1〜2%）',
        price: '¥3,500〜 / 月',
        rating: 4.6,
        recommended: false,
        recommendedFor: 'AGA治療初心者・副作用リスクを抑えたい方',
      },
      {
        name: 'デュタステリド（ザガーロ）',
        japaneseName: 'ザガーロ 0.5mg',
        image: 'https://picsum.photos/seed/dutasteride/300/300',
        ingredient: 'デュタステリド',
        duration: '服用継続中',
        dosage: '0.5mg 1日1回',
        onsetTime: '3〜6ヶ月で効果実感',
        foodEffect: 'なし',
        sideEffects: '性機能への影響（フィナステリドより若干高め）',
        price: '¥5,800〜 / 月',
        rating: 4.7,
        recommended: true,
        recommendedFor: '抜け毛が多い・より強力なDHT抑制を求める方',
      },
    ],
    rows: [
      { key: 'ingredient', label: '有効成分' },
      { key: 'dosage', label: '用法・用量' },
      { key: 'onsetTime', label: '効果実感時期' },
      { key: 'foodEffect', label: '食事の影響' },
      { key: 'sideEffects', label: '主な副作用' },
      { key: 'price', label: '価格目安' },
    ],
    analysis: [
      'デュタステリドはI型・II型の両方の5α-リダクターゼを阻害するため、フィナステリド（II型のみ）よりDHT抑制効果が強く、臨床試験でも発毛効果でやや優れた結果が示されています。',
      'フィナステリドは長年の使用実績があり、副作用の出現率が若干低いとされています。AGA治療を初めて行う方に広く推奨されています。',
      '価格面ではフィナステリドの方が安価なケースが多く、コストを抑えながら治療を続けたい方に向いています。',
    ],
    faq: [
      { q: 'フィナステリドとデュタステリドを併用できますか？', a: '一般的に併用は推奨されていません。どちらか一方を選択します。' },
      { q: 'デュタステリドに切り替えるべき場合はどんな時ですか？', a: 'フィナステリドを6〜12ヶ月使用しても効果が不十分と感じる場合、医師と相談のうえデュタステリドへの変更を検討します。' },
    ],
  },
  'tretinoin-vs-retinol': {
    title: 'トレチノイン vs レチノール 徹底比較',
    subtitle: 'エイジングケアの主役、医薬品と市販品の違いを比較',
    products: [
      {
        name: 'トレチノイン',
        japaneseName: 'トレチノイン 0.025%',
        image: 'https://picsum.photos/seed/tretinoin2/300/300',
        ingredient: 'トレチノイン酸（レチノイン酸）',
        duration: '使用継続中',
        dosage: '夜1回・極少量',
        onsetTime: '4〜8週間で効果実感',
        foodEffect: 'なし（光に弱いため夜用）',
        sideEffects: '赤み・乾燥・皮むけ（初期反応）',
        price: '¥4,800〜 / チューブ',
        rating: 4.7,
        recommended: true,
        recommendedFor: '確実なエイジングケア効果を求める方',
      },
      {
        name: 'レチノール',
        japaneseName: 'レチノール 1%',
        image: 'https://picsum.photos/seed/retinol/300/300',
        ingredient: 'レチノール（ビタミンA）',
        duration: '使用継続中',
        dosage: '夜1〜2回',
        onsetTime: '8〜16週間で効果実感',
        foodEffect: 'なし（光に弱いため夜用）',
        sideEffects: '乾燥・刺激感（トレチノインより軽度）',
        price: '¥2,000〜 / 本',
        rating: 4.3,
        recommended: false,
        recommendedFor: '肌が敏感・エイジングケア入門の方',
      },
    ],
    rows: [
      { key: 'ingredient', label: '有効成分' },
      { key: 'dosage', label: '用法' },
      { key: 'onsetTime', label: '効果実感時期' },
      { key: 'sideEffects', label: '副作用・刺激' },
      { key: 'price', label: '価格目安' },
    ],
    analysis: [
      'トレチノインはレチノイン酸そのものであり、肌細胞に直接作用します。レチノールは皮膚内でレチノイン酸に変換される必要があるため、効果は穏やかですが刺激も少なくなります。',
      'トレチノインは日本では処方薬ですが、個人輸入で海外製品を入手できます。レチノールは市販の化粧品にも含まれています。',
      '効果の強さはトレチノイン＞レチノール。ただし、トレチノインは使い始めに赤み・皮むけ・乾燥が出る「A反応」が起きやすいため、少量から始めることが推奨されます。',
    ],
    faq: [
      { q: 'トレチノインとレチノールを同時に使えますか？', a: '刺激が重複するため通常は避けます。どちらか一方を使用してください。' },
      { q: 'トレチノイン初心者はどの濃度から始めるべきですか？', a: '0.025%の低濃度から始め、慣れたら0.05%→0.1%と段階的に上げていくことが推奨されます。' },
    ],
  },
  'minoxidil-topical-vs-oral': {
    title: 'ミノキシジル外用 vs 内服 徹底比較',
    subtitle: '外用液・泡タイプと内服錠、どちらが効果的か？',
    products: [
      {
        name: 'ミノキシジル外用5%',
        japaneseName: 'ミノキシジル外用5%',
        image: 'https://picsum.photos/seed/minoxidiltop/300/300',
        ingredient: 'ミノキシジル5%',
        duration: '使用継続中',
        dosage: '1日2回・患部に塗布',
        onsetTime: '3〜6ヶ月',
        foodEffect: 'なし',
        sideEffects: '頭皮のかゆみ・乾燥・接触皮膚炎',
        price: '¥2,200〜 / 本',
        rating: 4.5,
        recommended: false,
        recommendedFor: '副作用リスクを最小化したい・局所的に使いたい方',
      },
      {
        name: 'ミノキシジル内服2.5mg',
        japaneseName: 'ミノキシジル内服2.5mg',
        image: 'https://picsum.photos/seed/minoxidiloral/300/300',
        ingredient: 'ミノキシジル2.5mg',
        duration: '服用継続中',
        dosage: '1日1回・経口服用',
        onsetTime: '2〜4ヶ月',
        foodEffect: 'なし',
        sideEffects: '多毛症・体液貯留・血圧低下（外用より高リスク）',
        price: '¥3,200〜 / 月',
        rating: 4.5,
        recommended: true,
        recommendedFor: '全頭の発毛を望む・外用が面倒な方',
      },
    ],
    rows: [
      { key: 'ingredient', label: '有効成分・濃度' },
      { key: 'dosage', label: '用法' },
      { key: 'onsetTime', label: '効果実感時期' },
      { key: 'sideEffects', label: '副作用' },
      { key: 'price', label: '価格目安' },
    ],
    analysis: [
      '内服ミノキシジルは全身の毛包に作用するため、頭皮全体への効果が期待できます。一方、外用は塗布した部位のみに作用し全身的な副作用が少ないというメリットがあります。',
      '内服の方が効果発現が速い傾向がありますが、顔や体の産毛が増える多毛症の副作用リスクが外用より高まります。',
    ],
    faq: [
      { q: '外用と内服を同時に使えますか？', a: '一部の医師は両者の併用を推奨しますが、副作用リスクが高まる可能性があります。医師に相談して判断してください。' },
    ],
  },
}

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const comp = COMPARISONS[params.slug]
  if (!comp) return { title: '比較 | MYKENKO' }
  return {
    title: `${comp.title} | MYKENKO`,
    description: comp.subtitle,
  }
}

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`text-base ${star <= Math.round(rating) ? 'text-amber-400' : 'text-gray-200'}`}
        >
          ★
        </span>
      ))}
      <span className="text-xs text-gray-500 ml-1">{rating}</span>
    </div>
  )
}

export default function CompareDetailPage({ params }: Props) {
  const comp = COMPARISONS[params.slug]
  if (!comp) notFound()

  const [p1, p2] = comp.products

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: comp.faq.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="bg-gray-50 min-h-screen">
        {/* Breadcrumb */}
        <div className="bg-white border-b border-gray-100">
          <div className="container-narrow py-3">
            <nav className="flex items-center gap-2 text-xs text-gray-400">
              <Link href="/" className="hover:text-primary-500 transition-colors">ホーム</Link>
              <span>/</span>
              <Link href="/compare" className="hover:text-primary-500 transition-colors">比較</Link>
              <span>/</span>
              <span className="text-gray-600">{comp.title}</span>
            </nav>
          </div>
        </div>

        {/* Hero */}
        <div className="bg-white border-b border-gray-100">
          <div className="container-narrow py-10 text-center">
            <h1 className="font-display text-2xl md:text-3xl font-bold text-gray-900">{comp.title}</h1>
            <p className="text-gray-500 mt-2 text-sm">{comp.subtitle}</p>
          </div>
        </div>

        <div className="container-narrow py-8">
          {/* Product header cards */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {[p1, p2].map((p, i) => (
              <div
                key={i}
                className={`bg-white border rounded-2xl p-5 text-center relative ${p.recommended ? 'border-primary-300 shadow-md' : 'border-gray-100'}`}
              >
                {p.recommended && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    おすすめ
                  </span>
                )}
                <img
                  src={p.image}
                  alt={p.name}
                  className="w-20 h-20 rounded-xl object-cover mx-auto mb-3"
                />
                <h3 className="font-display font-bold text-gray-900 text-sm">{p.japaneseName}</h3>
                <RatingStars rating={p.rating} />
                <p className="text-sm font-bold text-primary-500 mt-2">{p.price}</p>
                <p className="text-xs text-gray-500 mt-2">{p.recommendedFor}</p>
                <Link
                  href={`/products/${p.japaneseName.toLowerCase().replace(/\s/g, '-')}`}
                  className="block mt-4 bg-primary-500 hover:bg-primary-600 text-white text-xs font-semibold py-2 px-4 rounded-xl transition-colors"
                >
                  購入する
                </Link>
              </div>
            ))}
          </div>

          {/* Comparison table */}
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden mb-6">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 w-1/3">比較項目</th>
                  <th className="text-center px-3 py-3 text-xs font-semibold text-gray-900 w-1/3">{p1.japaneseName}</th>
                  <th className="text-center px-3 py-3 text-xs font-semibold text-gray-900 w-1/3">{p2.japaneseName}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {comp.rows.map((row) => (
                  <tr key={row.key} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4 text-sm text-gray-600 font-medium">{row.label}</td>
                    <td className={`px-3 py-4 text-sm text-center ${p1.recommended ? 'text-primary-600 font-medium' : 'text-gray-700'}`}>
                      {String(p1[row.key]).split('\n').map((line, i) => (
                        <span key={i}>{line}{i < String(p1[row.key]).split('\n').length - 1 && <br />}</span>
                      ))}
                    </td>
                    <td className={`px-3 py-4 text-sm text-center ${p2.recommended ? 'text-primary-600 font-medium' : 'text-gray-700'}`}>
                      {String(p2[row.key]).split('\n').map((line, i) => (
                        <span key={i}>{line}{i < String(p2[row.key]).split('\n').length - 1 && <br />}</span>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Analysis */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-6">
            <h2 className="font-display text-lg font-bold text-gray-900 mb-4">詳細分析</h2>
            <ul className="space-y-3">
              {comp.analysis.map((text, i) => (
                <li key={i} className="flex gap-3 text-sm text-gray-700 leading-relaxed">
                  <CheckCircle className="w-4 h-4 text-primary-500 flex-shrink-0 mt-0.5" />
                  {text}
                </li>
              ))}
            </ul>
          </div>

          {/* FAQ */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-6">
            <h2 className="font-display text-lg font-bold text-gray-900 mb-5">よくある質問</h2>
            <div className="space-y-4">
              {comp.faq.map((item, i) => (
                <div key={i} className="border border-gray-100 rounded-xl p-5">
                  <p className="font-semibold text-sm text-gray-900 mb-2">Q. {item.q}</p>
                  <p className="text-sm text-gray-600 leading-relaxed">A. {item.a}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-6 text-center text-white">
            <h3 className="font-display text-xl font-bold mb-2">どちらを購入しますか？</h3>
            <p className="text-primary-100 text-sm mb-5">
              MYKENKOで両製品をチェック。詳細な商品情報と口コミもご確認いただけます。
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Link
                href="/shop"
                className="inline-block bg-white text-primary-500 font-semibold text-sm px-6 py-3 rounded-xl hover:bg-primary-50 transition-colors"
              >
                全商品を見る →
              </Link>
              <Link
                href="/compare"
                className="inline-block border border-white/40 text-white font-semibold text-sm px-6 py-3 rounded-xl hover:bg-white/10 transition-colors"
              >
                他の比較を見る
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
