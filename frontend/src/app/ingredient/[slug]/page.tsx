import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { MedicalDisclaimer } from '@/components/ui/MedicalDisclaimer'

interface IngredientData {
  name: string
  japaneseName: string
  scientificName: string
  category: string
  description: string
  mechanism: string
  dosage: string
  safety: string
  relatedIngredients: string[]
  faq: { q: string; a: string }[]
}

const INGREDIENTS: Record<string, IngredientData> = {
  tadalafil: {
    name: 'タダラフィル（シアリス）',
    japaneseName: 'タダラフィル',
    scientificName: 'Tadalafil',
    category: 'ED治療薬',
    description:
      'タダラフィルはPDE5（ホスホジエステラーゼ5型）阻害薬の一種で、ED（勃起不全）の治療薬シアリスの有効成分です。1999年にICOSが開発し、2003年にFDAで承認されました。効果持続時間が最長36時間と非常に長く、「週末の薬」とも呼ばれています。また、5mg/日の毎日服用タイプも存在し、自然なタイミングでの性行為をサポートします。',
    mechanism:
      'タダラフィルはPDE5という酵素を阻害することで、陰茎海綿体内のcGMP（環状グアノシン一リン酸）の分解を防ぎます。性的刺激があると一酸化窒素（NO）が放出され、cGMPが増加し陰茎の平滑筋が弛緩・血管が拡張します。タダラフィルはこのcGMP分解酵素を阻害することで、勃起を維持しやすくします。',
    dosage:
      '標準用量は10mg（頓服）。必要に応じて5mg（低用量）または20mg（高用量）に調整します。毎日服用タイプは5mg。服用タイミングは性行為の30分〜1時間前が目安。1日1錠を超えて服用しないこと。',
    safety:
      '硝酸薬（ニトログリセリン等）との併用は禁忌。過度のアルコール摂取は避ける。心臓・肝臓・腎臓に持病がある場合は医師に相談。妊娠中または妊娠の可能性がある女性は使用不可。血圧降下薬との併用に注意。',
    relatedIngredients: ['sildenafil', 'vardenafil'],
    faq: [
      {
        q: 'タダラフィルとシルデナフィルの違いは何ですか？',
        a: '最大の違いは効果持続時間です。タダラフィルは最長36時間、シルデナフィルは4〜6時間です。また、タダラフィルは食事の影響を受けにくいです。',
      },
      {
        q: 'タダラフィルは個人輸入できますか？',
        a: 'はい、個人使用目的の個人輸入は日本の薬機法上認められています。MYKENKOでは正規品を取り扱っています。',
      },
      {
        q: 'タダラフィルに耐性はつきますか？',
        a: '一般的にPDE5阻害薬への耐性は報告されていません。ただし、ED治療の根本原因に対処することも重要です。',
      },
    ],
  },
  sildenafil: {
    name: 'シルデナフィル（バイアグラ）',
    japaneseName: 'シルデナフィル',
    scientificName: 'Sildenafil Citrate',
    category: 'ED治療薬',
    description:
      'シルデナフィルはED治療薬バイアグラの有効成分で、世界初のPDE5阻害薬として1998年にFDA承認されました。60カ国以上で承認されており、ED治療の標準的な薬として世界中で広く使用されています。ジェネリック医薬品も多く存在し、比較的手頃な価格で入手できます。',
    mechanism:
      'シルデナフィルはPDE5阻害薬として、陰茎海綿体でのcGMPの分解を阻害します。これにより性的刺激時に陰茎への血流が増加し、勃起が起きやすくなります。薬の作用には必ず性的刺激が必要です（薬だけでは勃起しません）。',
    dosage:
      '一般的な用量は50mg（標準）。効果・副作用に応じて25mg〜100mgに調整。食事（特に高脂肪食）は吸収を遅らせるため、できれば空腹時または軽食後に服用。性行為の30〜60分前に服用。1日1回を超えないこと。',
    safety:
      '硝酸薬との併用は絶対禁忌。α遮断薬・抗高血圧薬との併用時は血圧に注意。グレープフルーツジュースはCYP3A4を阻害しシルデナフィルの血中濃度を上昇させる可能性があるため避けること。網膜色素変性症のある方は禁忌。',
    relatedIngredients: ['tadalafil', 'vardenafil'],
    faq: [
      {
        q: 'シルデナフィルはどのくらいで効きますか？',
        a: '通常、服用後30〜60分で効果が現れます。空腹時だと早く効く傾向があります。',
      },
      {
        q: 'バイアグラとジェネリックシルデナフィルは同じですか？',
        a: '有効成分（シルデナフィル）は同一ですが、添加物や製造方法が異なります。ジェネリックは同等の生物学的利用能を持つことが承認の条件です。',
      },
    ],
  },
  minoxidil: {
    name: 'ミノキシジル',
    japaneseName: 'ミノキシジル',
    scientificName: 'Minoxidil',
    category: 'AGA治療薬',
    description:
      'ミノキシジルはAGA（男性型脱毛症）・FAGA（女性型脱毛症）治療に使用される最も実績ある成分の一つです。もともと高血圧治療薬として開発されましたが、発毛効果が確認されたことから外用・内服の発毛剤として世界中で広く使用されています。外用5%製品はOTC（市販薬）として入手できる国も多く、内服低用量製品への注目も高まっています。',
    mechanism:
      'ミノキシジルの発毛メカニズムは主に①血管拡張による頭皮血流の改善②カリウムチャネル開口による毛乳頭細胞の活性化③毛周期の休止期から成長期への促進の3点です。成長期の延長と毛包の肥大化により、細い産毛が太い終毛へと変わります。',
    dosage:
      '外用：5%（男性）または2%（女性）を1回1mL、1日2回患部に塗布。使用後4〜6時間は洗髪を避けるとよい。内服：0.25〜2.5mg/日（低用量）が一般的。医師の指導のもとで使用推奨。',
    safety:
      '妊娠中・授乳中の女性への内服使用は禁忌。心臓疾患・腎臓疾患のある方は使用前に必ず医師に相談。外用でも皮膚から吸収されるため、禁忌がある方は注意。内服は多毛症・体液貯留・血圧低下のリスクあり。',
    relatedIngredients: ['finasteride', 'dutasteride'],
    faq: [
      {
        q: 'ミノキシジルを止めるとどうなりますか？',
        a: '使用中止後3〜6ヶ月で元の脱毛状態に戻ります。効果を維持するには継続使用が必要です。',
      },
      {
        q: 'ミノキシジルとフィナステリドを一緒に使えますか？',
        a: 'はい、AGA治療では両剤の併用が標準的です。フィナステリドが抜け毛を防ぎ、ミノキシジルが発毛を促進するという相補的な働きがあります。',
      },
    ],
  },
  finasteride: {
    name: 'フィナステリド（プロペシア）',
    japaneseName: 'フィナステリド',
    scientificName: 'Finasteride',
    category: 'AGA治療薬',
    description:
      'フィナステリドはAGA（男性型脱毛症）の内服治療薬プロペシアの有効成分です。5α-リダクターゼII型を選択的に阻害することで、AGAの主な原因であるDHT（ジヒドロテストステロン）の産生を約70%抑制します。世界60カ国以上で承認されており、AGA治療のファーストラインとして確立されています。',
    mechanism:
      'テストステロンは酵素5α-リダクターゼによってDHTに変換されます。DHTは毛乳頭のアンドロゲン受容体に結合し、毛周期を短縮・毛包を萎縮させます。フィナステリドはII型5α-リダクターゼを阻害し、DHT産生を大幅に減少させることで毛周期を正常化します。',
    dosage:
      'AGA治療には1mg/日（プロペシア規格）。毎日同じ時間に1錠服用。食事の影響なし。飲み忘れた場合は気づいた時点で1錠服用し翌日から通常通り（2錠まとめて飲まない）。',
    safety:
      '女性（特に妊婦・妊娠の可能性がある方）は錠剤に触れることも禁忌（フィナステリドが皮膚から吸収される可能性あり）。PSA検査値を約50%低下させるため、前立腺検査の際は医師に服用中であることを伝える。性機能への副作用（約1〜2%）に注意。',
    relatedIngredients: ['minoxidil', 'dutasteride'],
    faq: [
      {
        q: 'フィナステリドはいつまで飲み続けますか？',
        a: '効果を維持するには継続服用が必要です。中止すると6〜12ヶ月で脱毛が再開します。長期服用の安全性は臨床試験で確認されています。',
      },
      {
        q: 'フィナステリドの副作用で性機能に影響が出た場合はどうすればよいですか？',
        a: '副作用が気になる場合は服用を中止し医師に相談してください。多くの場合、中止後に回復します。',
      },
    ],
  },
}

const INGREDIENT_NAMES: Record<string, string> = {
  tadalafil: 'タダラフィル',
  sildenafil: 'シルデナフィル',
  vardenafil: 'バルデナフィル',
  minoxidil: 'ミノキシジル',
  finasteride: 'フィナステリド',
  dutasteride: 'デュタステリド',
}

interface Props { params: { slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const ing = INGREDIENTS[params.slug]
  if (!ing) return { title: '成分情報 | MYKENKO' }
  return {
    title: `${ing.japaneseName}（${ing.scientificName}）の効果・副作用・使い方 | MYKENKO`,
    description: `${ing.japaneseName}の作用機序、適切な使用方法、安全情報、よくある質問をまとめました。${ing.category}として使用される成分です。`,
  }
}

export default function IngredientPage({ params }: Props) {
  const ing = INGREDIENTS[params.slug]
  if (!ing) notFound()

  const drugSchema = {
    '@context': 'https://schema.org',
    '@type': 'Drug',
    name: ing.name,
    activeIngredient: ing.scientificName,
    drugClass: ing.category,
    description: ing.description,
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: ing.faq.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(drugSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <div className="bg-gray-50 min-h-screen">
        {/* Breadcrumb */}
        <div className="bg-white border-b border-gray-100">
          <div className="container-narrow py-3">
            <nav className="flex items-center gap-2 text-xs text-gray-400">
              <Link href="/" className="hover:text-primary-500 transition-colors">ホーム</Link>
              <span>/</span>
              <span>成分情報</span>
              <span>/</span>
              <span className="text-gray-600">{ing.japaneseName}</span>
            </nav>
          </div>
        </div>

        <div className="container-narrow py-8 max-w-3xl">
          {/* Header */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
                <span className="text-3xl">💊</span>
              </div>
              <div>
                <span className="inline-block text-xs font-semibold text-primary-500 bg-primary-50 px-3 py-1 rounded-full mb-2">
                  {ing.category}
                </span>
                <h1 className="font-display text-2xl font-bold text-gray-900">{ing.japaneseName}</h1>
                <p className="text-sm text-gray-400 mt-0.5">{ing.scientificName}</p>
              </div>
            </div>
          </div>

          <MedicalDisclaimer />

          {/* Description */}
          <div className="mt-6 bg-white border border-gray-100 rounded-2xl p-6">
            <h2 className="font-display text-lg font-bold text-gray-900 mb-3">{ing.japaneseName}とは</h2>
            <p className="text-gray-700 leading-relaxed text-sm">{ing.description}</p>
          </div>

          {/* Mechanism */}
          <div className="mt-4 bg-white border border-gray-100 rounded-2xl p-6">
            <h2 className="font-display text-lg font-bold text-gray-900 mb-3">作用メカニズム</h2>
            <p className="text-gray-700 leading-relaxed text-sm">{ing.mechanism}</p>
          </div>

          {/* Dosage */}
          <div className="mt-4 bg-white border border-gray-100 rounded-2xl p-6">
            <h2 className="font-display text-lg font-bold text-gray-900 mb-3">用量・使い方</h2>
            <p className="text-gray-700 leading-relaxed text-sm">{ing.dosage}</p>
          </div>

          {/* Safety */}
          <div className="mt-4 bg-amber-50 border border-amber-100 rounded-2xl p-6">
            <h2 className="font-display text-lg font-bold text-amber-900 mb-3">安全情報・注意事項</h2>
            <p className="text-amber-800 leading-relaxed text-sm">{ing.safety}</p>
          </div>

          {/* Products CTA */}
          <div className="mt-4 bg-white border border-gray-100 rounded-2xl p-6">
            <h2 className="font-display text-lg font-bold text-gray-900 mb-3">この成分を含む商品</h2>
            <p className="text-sm text-gray-500 mb-4">
              MYKENKOでは{ing.japaneseName}を含む製品を取り扱っています。
            </p>
            <Link
              href={`/shop?ingredient=${params.slug}`}
              className="inline-block bg-primary-500 hover:bg-primary-600 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors"
            >
              関連商品を見る →
            </Link>
          </div>

          {/* FAQ */}
          <div className="mt-4 bg-white border border-gray-100 rounded-2xl p-6">
            <h2 className="font-display text-lg font-bold text-gray-900 mb-5">よくある質問</h2>
            <div className="space-y-4">
              {ing.faq.map((item, i) => (
                <div key={i} className="border border-gray-100 rounded-xl p-5">
                  <p className="font-semibold text-sm text-gray-900 mb-2">Q. {item.q}</p>
                  <p className="text-sm text-gray-600 leading-relaxed">A. {item.a}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Related ingredients */}
          {ing.relatedIngredients.length > 0 && (
            <div className="mt-4 bg-white border border-gray-100 rounded-2xl p-6">
              <h2 className="font-display text-lg font-bold text-gray-900 mb-4">関連成分</h2>
              <div className="flex flex-wrap gap-3">
                {ing.relatedIngredients.map((slug) => (
                  <Link
                    key={slug}
                    href={`/ingredient/${slug}`}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium text-gray-700 hover:border-primary-300 hover:text-primary-500 transition-colors"
                  >
                    💊 {INGREDIENT_NAMES[slug] ?? slug}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
