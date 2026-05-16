import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { MedicalDisclaimer } from '@/components/ui/MedicalDisclaimer'
import { CheckCircle, ArrowRight } from 'lucide-react'

interface PurposeData {
  title: string
  description: string
  benefits: string[]
  relatedCategory: string
  steps: { step: string; title: string; body: string }[]
  faq: { q: string; a: string }[]
}

const PURPOSES: Record<string, PurposeData> = {
  'improve-hair-loss': {
    title: '薄毛・抜け毛改善',
    description: '薄毛を改善するためのAGA治療薬・発毛剤を厳選。フィナステリド・ミノキシジルなど科学的に実証された成分でAGAに対処します。',
    benefits: [
      '抜け毛を根本から抑制するDHT阻害薬',
      '発毛を促進するミノキシジル外用・内服',
      '継続使用で薄毛の進行を食い止め',
      '外用薬・内服薬のコンビネーション治療',
    ],
    relatedCategory: 'aga',
    steps: [
      {
        step: 'Step 1',
        title: '薄毛の原因を理解する',
        body: '男性型脱毛症（AGA）はDHTというホルモンが毛乳頭に作用し、毛周期を短縮させることで起こります。まず自分の脱毛パターンを確認しましょう。',
      },
      {
        step: 'Step 2',
        title: '適切な治療薬を選ぶ',
        body: 'AGA治療の基本はフィナステリド（または デュタステリド）でDHT産生を抑え、ミノキシジルで発毛を促進するコンビネーション治療です。',
      },
      {
        step: 'Step 3',
        title: '継続して効果を実感する',
        body: 'AGA治療は最低6ヶ月〜1年の継続が必要です。毎日継続することで抜け毛が減り、発毛が促進されます。',
      },
    ],
    faq: [
      {
        q: 'AGA治療は何歳から始めるべきですか？',
        a: 'AGAは早期対処が効果的です。薄毛が気になり始めたら早めに治療を開始することで、毛包が完全に萎縮する前に食い止めやすくなります。',
      },
      {
        q: '完全に発毛させることはできますか？',
        a: '現在の治療では完全な発毛よりも「進行を止める・現状を維持する・発毛を促す」が現実的な目標です。早期治療ほど良い結果が期待できます。',
      },
      {
        q: 'AGA治療薬はいつまで飲み続ける必要がありますか？',
        a: '効果を維持するには継続服用が必要です。中止すると数ヶ月で脱毛が再開するため、長期的な治療計画が重要です。',
      },
    ],
  },
  'improve-ed': {
    title: 'ED・勃起不全改善',
    description: 'ED（勃起不全）を改善するためのPDE5阻害薬を厳選。シアリス・バイアグラなど実績ある成分で自信を取り戻します。',
    benefits: [
      '硬さと持続時間の改善',
      '36時間効果が続くタダラフィル',
      '毎日服用タイプで自然な性生活をサポート',
      '心理的なパフォーマンス不安の軽減',
    ],
    relatedCategory: 'ed',
    steps: [
      {
        step: 'Step 1',
        title: 'EDの原因を把握する',
        body: 'EDには血管性・神経性・心理性・内分泌性などの原因があります。生活習慣病（糖尿病・高血圧など）がある方は医師への相談も重要です。',
      },
      {
        step: 'Step 2',
        title: '自分に合ったED治療薬を選ぶ',
        body: '短時間で強力な効果を求める方にはシルデナフィル、タイミングを気にしたくない方にはタダラフィルが向いています。',
      },
      {
        step: 'Step 3',
        title: '生活習慣も改善する',
        body: '適度な運動・節酒・禁煙・ストレス管理など生活習慣の改善もEDの改善に効果的です。薬物療法と合わせて取り組みましょう。',
      },
    ],
    faq: [
      {
        q: 'ED治療薬に年齢制限はありますか？',
        a: '一般的に成人男性（18歳以上）を対象としています。65歳以上の方は低用量から開始することが推奨される場合があります。',
      },
      {
        q: 'ED治療薬を使い続けると依存しますか？',
        a: 'PDE5阻害薬に身体的・精神的依存性はありません。「薬がないと不安」という心理的な依存が生じることがありますが、根本的な治療で解決できます。',
      },
    ],
  },
  'weight-loss': {
    title: 'ダイエット・体重管理',
    description: '科学的根拠に基づいたダイエット医薬品・サプリメントで効果的な体重管理をサポートします。',
    benefits: [
      '食欲を適切にコントロール',
      '脂肪吸収を抑制',
      '代謝を促進して脂肪燃焼をサポート',
      '医薬品グレードの成分で安心',
    ],
    relatedCategory: 'diet',
    steps: [
      {
        step: 'Step 1',
        title: '目標体重と方法を決める',
        body: 'BMI・体脂肪率から目標を設定します。急激な体重減少は健康リスクがあるため、月1〜2kgのペースが安全です。',
      },
      {
        step: 'Step 2',
        title: '自分に合ったアプローチを選ぶ',
        body: '過食傾向には食欲抑制薬、脂質の多い食事には脂肪吸収阻害薬、全体的な代謝向上には代謝促進サプリが向いています。',
      },
      {
        step: 'Step 3',
        title: '食事・運動と組み合わせる',
        body: '薬だけでなく、食事のカロリーコントロールと有酸素運動を組み合わせることで相乗効果が期待できます。',
      },
    ],
    faq: [
      {
        q: 'ダイエット薬だけで痩せられますか？',
        a: 'ダイエット薬は補助的な役割です。食事管理・運動との組み合わせで最大の効果が得られます。薬だけへの依存はリバウンドのリスクがあります。',
      },
      {
        q: 'ダイエット薬の副作用は何ですか？',
        a: '薬の種類によりますが、食欲抑制薬では口渇・不眠・動悸、脂肪吸収阻害薬では消化器症状（油性の排便等）が報告されています。',
      },
    ],
  },
  'skin-care': {
    title: '美肌・スキンケア',
    description: 'トレチノイン・ハイドロキノンなど医薬品グレードの成分で、シミ・シワ・ニキビなどの肌悩みを根本から改善します。',
    benefits: [
      'シミ・色素沈着の改善',
      '細かいシワへの対応',
      'ニキビ・毛穴問題の解決',
      '医薬品グレードで市販品より高い効果',
    ],
    relatedCategory: 'beauty',
    steps: [
      {
        step: 'Step 1',
        title: '肌悩みの種類を特定する',
        body: 'シミ・シワ・ニキビ・くすみなど悩みの種類によって最適な成分が異なります。主な悩みを1〜2つに絞りましょう。',
      },
      {
        step: 'Step 2',
        title: '適切な成分を選ぶ',
        body: 'シミには ハイドロキノン+トレチノイン、シワ・エイジングにはトレチノイン、ニキビにはアゼライン酸・ナイアシンアミドが効果的です。',
      },
      {
        step: 'Step 3',
        title: '正しい使い方で継続する',
        body: '医療美容成分は使い始めに肌の調整反応が出ることがあります。少量から始め、肌の状態を確認しながら継続することが大切です。',
      },
    ],
    faq: [
      {
        q: 'トレチノインは毎日使えますか？',
        a: '最初は週2〜3回から始め、肌が慣れてきたら毎日夜に使用するのが一般的です。日中は必ず日焼け止めを使用してください。',
      },
      {
        q: '美容薬と市販化粧品を一緒に使えますか？',
        a: '多くの場合は使用できますが、同じ作用を持つ成分の重複使用は刺激が強くなる場合があります。使用する成分の組み合わせに注意してください。',
      },
    ],
  },
}

interface Props { params: { slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const purpose = PURPOSES[params.slug]
  if (!purpose) return { title: '目的別ガイド | MYKENKO' }
  return {
    title: `${purpose.title} | MYKENKO`,
    description: purpose.description,
  }
}

export default function PurposePage({ params }: Props) {
  const purpose = PURPOSES[params.slug]
  if (!purpose) notFound()

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: purpose.faq.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <div className="bg-gray-50 min-h-screen">
        {/* Breadcrumb */}
        <div className="bg-white border-b border-gray-100">
          <div className="container-narrow py-3">
            <nav className="flex items-center gap-2 text-xs text-gray-400">
              <Link href="/" className="hover:text-primary-500 transition-colors">ホーム</Link>
              <span>/</span>
              <span>目的から探す</span>
              <span>/</span>
              <span className="text-gray-600">{purpose.title}</span>
            </nav>
          </div>
        </div>

        {/* Hero */}
        <div className="bg-gradient-to-br from-primary-500 to-primary-700 text-white">
          <div className="container-narrow py-12 md:py-16 max-w-3xl">
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-4">{purpose.title}</h1>
            <p className="text-primary-100 text-sm md:text-base mb-6">{purpose.description}</p>
            <ul className="space-y-2 mb-8">
              {purpose.benefits.map((b, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-white">
                  <CheckCircle className="w-4 h-4 text-primary-200 flex-shrink-0" />
                  {b}
                </li>
              ))}
            </ul>
            <Link
              href={`/shop?category=${purpose.relatedCategory}`}
              className="inline-block bg-white text-primary-500 font-semibold text-sm px-6 py-3 rounded-xl hover:bg-primary-50 transition-colors"
            >
              今すぐ探す →
            </Link>
          </div>
        </div>

        <div className="container-narrow py-10 max-w-3xl">
          {/* How it works */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-6">
            <h2 className="font-display text-xl font-bold text-gray-900 mb-6">3ステップで始めよう</h2>
            <div className="space-y-6">
              {purpose.steps.map((s, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-primary-500">{i + 1}</span>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-primary-400 mb-1">{s.step}</p>
                    <h3 className="font-semibold text-gray-900 mb-1">{s.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{s.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <MedicalDisclaimer />

          {/* FAQ */}
          <div className="mt-6 bg-white border border-gray-100 rounded-2xl p-6">
            <h2 className="font-display text-lg font-bold text-gray-900 mb-5">よくある質問</h2>
            <div className="space-y-4">
              {purpose.faq.map((item, i) => (
                <div key={i} className="border border-gray-100 rounded-xl p-5">
                  <p className="font-semibold text-sm text-gray-900 mb-2">Q. {item.q}</p>
                  <p className="text-sm text-gray-600 leading-relaxed">A. {item.a}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="mt-6 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-6 text-center text-white">
            <h3 className="font-display text-xl font-bold mb-2">商品を探す</h3>
            <p className="text-primary-100 text-sm mb-5">
              {purpose.title}に対応した商品をMYKENKOで検索できます。
            </p>
            <Link
              href={`/shop?category=${purpose.relatedCategory}`}
              className="inline-block bg-white text-primary-500 font-semibold text-sm px-6 py-3 rounded-xl hover:bg-primary-50 transition-colors"
            >
              今すぐ探す →
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
