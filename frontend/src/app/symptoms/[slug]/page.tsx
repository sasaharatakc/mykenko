import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { MedicalDisclaimer } from '@/components/ui/MedicalDisclaimer'
import { AlertTriangle, ArrowRight } from 'lucide-react'

interface SymptomData {
  title: string
  category: string
  overview: string
  causes: string[]
  treatments: { name: string; description: string; href: string }[]
  whenToSeeDoctor: string[]
  faq: { q: string; a: string }[]
}

const SYMPTOMS: Record<string, SymptomData> = {
  'hair-loss': {
    title: '薄毛・脱毛症状',
    category: 'AGA',
    overview:
      '薄毛・脱毛（特にAGA：男性型脱毛症）は日本人男性の約30%が経験するとされる非常に一般的な症状です。思春期以降に始まることが多く、加齢とともに進行します。早期に治療を始めることで進行を遅らせ、発毛を促進できる可能性があります。',
    causes: [
      'DHT（ジヒドロテストステロン）による毛乳頭へのダメージ（AGA最大の原因）',
      '遺伝的素因（父方・母方どちらの遺伝も関与）',
      'ストレス・過労による休止期脱毛',
      '栄養不足（特に亜鉛・鉄分・ビオチン）',
      '甲状腺機能異常などの疾患',
    ],
    treatments: [
      {
        name: 'フィナステリド（プロペシア）',
        description: 'DHT産生を約70%抑制するAGA治療の内服薬',
        href: '/ingredient/finasteride',
      },
      {
        name: 'ミノキシジル外用・内服',
        description: '頭皮血流を改善し発毛を促進する外用・内服薬',
        href: '/ingredient/minoxidil',
      },
      {
        name: 'デュタステリド（ザガーロ）',
        description: 'フィナステリドより強力なDHT抑制効果を持つ内服薬',
        href: '/shop?ingredient=dutasteride',
      },
    ],
    whenToSeeDoctor: [
      '急激に大量の抜け毛が起きている',
      '頭皮に痛み・かゆみ・炎症がある',
      '円形脱毛症（円形のはげ）が生じている',
      '全身の脱毛が起きている',
      '甲状腺疾患・貧血などの基礎疾患がある',
    ],
    faq: [
      {
        q: 'AGA（男性型脱毛症）は治りますか？',
        a: '完全な「治癒」は難しいですが、適切な治療で進行を止め現状を維持したり、一定の発毛が期待できます。早期開始ほど効果的です。',
      },
      {
        q: '薄毛は遺伝しますか？',
        a: 'AGAには遺伝的素因があり、父方・母方どちらの影響も受けます。ただし遺伝があっても必ず発症するわけではなく、治療によって進行を抑制できます。',
      },
      {
        q: 'シャンプーで薄毛は改善しますか？',
        a: '市販のシャンプーで薄毛を改善する科学的証拠は限られています。薄毛の主な原因（DHTなど）に直接作用する医薬品治療が有効です。',
      },
    ],
  },
  'erectile-dysfunction': {
    title: '勃起不全（ED）',
    category: 'ED',
    overview:
      'ED（勃起不全・勃起障害）は性行為に十分な勃起が得られない、または維持できない状態です。日本では40代以上の男性の約50%が何らかのEDを経験すると言われています。心理的・血管的・神経的・内分泌的な原因があり、適切な治療で多くの場合改善が可能です。',
    causes: [
      '血管性（動脈硬化・高血圧・糖尿病などによる血流障害）',
      '神経性（脊髄損傷・糖尿病性神経障害など）',
      '心理性（パフォーマンス不安・うつ・ストレス）',
      '内分泌性（テストステロン低下・甲状腺疾患）',
      '薬剤性（降圧薬・抗うつ薬などの副作用）',
    ],
    treatments: [
      {
        name: 'タダラフィル（シアリス）',
        description: '36時間の長時間作用型ED治療薬',
        href: '/ingredient/tadalafil',
      },
      {
        name: 'シルデナフィル（バイアグラ）',
        description: '世界で最も使用されているED治療薬',
        href: '/ingredient/sildenafil',
      },
      {
        name: 'バルデナフィル（レビトラ）',
        description: '素早い効果発現が特徴のED治療薬',
        href: '/shop?ingredient=vardenafil',
      },
    ],
    whenToSeeDoctor: [
      '突然EDが起きた（特に中高年で）',
      '心臓病・糖尿病・高血圧などの持病がある',
      '胸痛・息切れなどの心臓症状がある',
      'テストステロン低下の症状（倦怠感・性欲減退・体毛の減少）がある',
      'うつ症状が続いている',
    ],
    faq: [
      {
        q: 'EDは自然に治りますか？',
        a: '心理的なEDは精神的ストレスの解消で改善することがありますが、血管性・神経性のEDは自然には回復しにくく、治療が必要です。',
      },
      {
        q: 'ED治療薬は毎回使わないといけませんか？',
        a: '頓服タイプは毎回服用が必要ですが、タダラフィル5mg毎日服用タイプは継続使用で自然な性行為に対応できるようになります。',
      },
      {
        q: 'EDは予防できますか？',
        a: '適度な運動・禁煙・節酒・ストレス管理・バランスの取れた食事などの生活習慣改善がEDの予防・改善に有効です。',
      },
    ],
  },
  'insomnia': {
    title: '不眠・睡眠障害',
    category: '睡眠',
    overview:
      '不眠症は寝つきが悪い・夜中に目が覚める・朝早く目が覚めるなどの症状が続き、日中の生活に支障をきたす状態です。日本人の約20〜30%が何らかの不眠症状を経験すると言われています。生活習慣の改善から薬物療法まで、段階的なアプローチが重要です。',
    causes: [
      'ストレス・心配事・うつ・不安障害',
      '睡眠環境の問題（光・音・温度）',
      'カフェイン・アルコール・ニコチンの摂取',
      '不規則な生活リズム・交代勤務',
      '慢性疼痛・頻尿などの身体的問題',
    ],
    treatments: [
      {
        name: 'メラトニン',
        description: '睡眠ホルモンを補充して自然な眠りをサポート',
        href: '/shop?ingredient=melatonin',
      },
      {
        name: 'バレリアンエキス',
        description: 'ハーブ由来の天然睡眠サポートサプリ',
        href: '/shop?ingredient=valerian',
      },
      {
        name: 'テアニン・マグネシウム',
        description: 'リラックス効果で入眠をサポートするサプリメント',
        href: '/shop?category=sleep',
      },
    ],
    whenToSeeDoctor: [
      '2〜4週間以上不眠が続いている',
      '睡眠時無呼吸症候群（いびき・無呼吸）が疑われる',
      'むずむず脚症候群の症状がある',
      'うつ症状を伴う',
      '市販薬・サプリで改善しない',
    ],
    faq: [
      {
        q: '睡眠薬は癖になりますか？',
        a: 'ベンゾジアゼピン系薬には依存リスクがあります。メラトニンや非ベンゾジアゼピン系薬は依存リスクが低いとされています。長期使用の場合は医師に相談を。',
      },
      {
        q: 'アルコールを飲むと眠れますが問題ありますか？',
        a: 'アルコールは入眠を助けますが、睡眠の質（深い睡眠の減少・中途覚醒の増加）を下げます。習慣的な飲酒による入眠は推奨されません。',
      },
    ],
  },
  'overweight': {
    title: '肥満・体重増加',
    category: 'ダイエット',
    overview:
      'BMI25以上を過体重、30以上を肥満と定義します。肥満は糖尿病・高血圧・心臓病・関節疾患などのリスクを高めます。食事・運動による生活習慣改善が基本ですが、必要に応じて薬物療法を補助的に活用することも選択肢の一つです。',
    causes: [
      '摂取カロリー＞消費カロリーの状態が続く',
      '座位中心の生活習慣・運動不足',
      '甲状腺機能低下症などの内分泌疾患',
      'ストレス過食・感情的食行動',
      '遺伝的素因（約40〜70%は遺伝的影響）',
    ],
    treatments: [
      {
        name: 'オルリスタット（ゼニカル）',
        description: '食事の脂肪吸収を約30%阻害するダイエット薬',
        href: '/shop?ingredient=orlistat',
      },
      {
        name: '食欲抑制系サプリメント',
        description: 'ガルシニア・白いんげんなど天然成分の体重管理サポート',
        href: '/shop?category=diet',
      },
      {
        name: 'プロテイン・栄養補助食品',
        description: '筋肉量を維持しながら体脂肪を減らすサポート',
        href: '/shop?category=supplement',
      },
    ],
    whenToSeeDoctor: [
      'BMIが35以上（高度肥満）',
      '糖尿病・高血圧・高脂血症を合併している',
      '急激な体重増加（1ヶ月で5kg以上）',
      '極端な食欲不振や嘔吐・下痢がある',
      '摂食障害が疑われる',
    ],
    faq: [
      {
        q: '薬だけで痩せられますか？',
        a: '現在のダイエット薬は食事・運動との組み合わせで効果を発揮します。薬のみでの大幅な体重減少は難しく、生活習慣改善との併用が必須です。',
      },
      {
        q: '健全な体重減少のペースはどのくらいですか？',
        a: '月1〜2kg（週0.25〜0.5kg）が健康的なペースとされています。急激な減量は筋肉量の低下・栄養不足・リバウンドのリスクがあります。',
      },
    ],
  },
}

interface Props { params: { slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const symptom = SYMPTOMS[params.slug]
  if (!symptom) return { title: '症状から探す | MYKENKO' }
  return {
    title: `${symptom.title}の原因・治療法 | MYKENKO`,
    description: symptom.overview,
  }
}

export default function SymptomPage({ params }: Props) {
  const symptom = SYMPTOMS[params.slug]
  if (!symptom) notFound()

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: symptom.faq.map((f) => ({
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
              <span>症状から探す</span>
              <span>/</span>
              <span className="text-gray-600">{symptom.title}</span>
            </nav>
          </div>
        </div>

        {/* Hero */}
        <div className="bg-white border-b border-gray-100">
          <div className="container-narrow py-10 max-w-3xl">
            <span className="inline-block text-xs font-semibold text-primary-500 bg-primary-50 px-3 py-1 rounded-full mb-3">
              {symptom.category}
            </span>
            <h1 className="font-display text-3xl font-bold text-gray-900 mb-3">{symptom.title}</h1>
            <p className="text-gray-600 text-sm leading-relaxed">{symptom.overview}</p>
          </div>
        </div>

        <div className="container-narrow py-8 max-w-3xl">
          {/* Causes */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-6">
            <h2 className="font-display text-lg font-bold text-gray-900 mb-4">主な原因</h2>
            <ul className="space-y-2">
              {symptom.causes.map((cause, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                  <span className="w-5 h-5 rounded-full bg-primary-50 text-primary-500 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  {cause}
                </li>
              ))}
            </ul>
          </div>

          {/* Treatment options */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-6">
            <h2 className="font-display text-lg font-bold text-gray-900 mb-4">治療・対処の選択肢</h2>
            <div className="space-y-3">
              {symptom.treatments.map((t, i) => (
                <Link
                  key={i}
                  href={t.href}
                  className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:border-primary-300 hover:bg-primary-50 transition-colors group"
                >
                  <div>
                    <p className="font-semibold text-sm text-gray-900 group-hover:text-primary-500 transition-colors">
                      {t.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{t.description}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-primary-500 transition-colors flex-shrink-0" />
                </Link>
              ))}
            </div>
          </div>

          <MedicalDisclaimer />

          {/* When to see doctor */}
          <div className="mt-6 bg-red-50 border border-red-100 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <h2 className="font-display text-lg font-bold text-red-900">医師への相談が必要なサイン</h2>
            </div>
            <ul className="space-y-2">
              {symptom.whenToSeeDoctor.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-red-800">
                  <span className="text-red-400 mt-0.5">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* FAQ */}
          <div className="mt-6 bg-white border border-gray-100 rounded-2xl p-6">
            <h2 className="font-display text-lg font-bold text-gray-900 mb-5">よくある質問</h2>
            <div className="space-y-4">
              {symptom.faq.map((item, i) => (
                <div key={i} className="border border-gray-100 rounded-xl p-5">
                  <p className="font-semibold text-sm text-gray-900 mb-2">Q. {item.q}</p>
                  <p className="text-sm text-gray-600 leading-relaxed">A. {item.a}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="mt-6 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-6 text-center text-white">
            <h3 className="font-display text-xl font-bold mb-2">関連商品を探す</h3>
            <p className="text-primary-100 text-sm mb-5">
              {symptom.title}の改善に役立つ医薬品・サプリメントをお探しいただけます。
            </p>
            <Link
              href={`/shop?category=${symptom.category.toLowerCase()}`}
              className="inline-block bg-white text-primary-500 font-semibold text-sm px-6 py-3 rounded-xl hover:bg-primary-50 transition-colors"
            >
              商品を見る →
            </Link>
          </div>

          {/* Medical disclaimer */}
          <div className="mt-4">
            <MedicalDisclaimer />
          </div>
        </div>
      </div>
    </>
  )
}
