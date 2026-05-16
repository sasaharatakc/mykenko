import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { MedicalDisclaimer } from '@/components/ui/MedicalDisclaimer'

interface GuideData {
  title: string
  category: string
  categorySlug: string
  readTime: string
  toc: { id: string; label: string }[]
  content: { id: string; heading: string; body: string }[]
  faq: { q: string; a: string }[]
  relatedSlugs: string[]
}

const GUIDES: Record<string, GuideData> = {
  'ed-medicine-guide': {
    title: 'ED治療薬完全ガイド｜バイアグラ・シアリスの効果と選び方',
    category: 'ED治療',
    categorySlug: 'ed',
    readTime: '8分',
    toc: [
      { id: 'what-is-ed', label: 'EDとは何か' },
      { id: 'sildenafil', label: 'シルデナフィル（バイアグラ）' },
      { id: 'tadalafil', label: 'タダラフィル（シアリス）' },
      { id: 'how-to-choose', label: '治療薬の選び方' },
      { id: 'safety', label: '安全な使い方' },
    ],
    content: [
      {
        id: 'what-is-ed',
        heading: 'EDとは何か',
        body: 'ED（勃起不全・勃起障害）は、性行為に十分な勃起が得られない、または維持できない状態を指します。日本では40代以上の男性の約半数が何らかのEDを経験するとされており、決して珍しい疾患ではありません。原因としては、動脈硬化・糖尿病・高血圧などの身体的要因のほか、ストレス・うつ・パフォーマンス不安といった心理的要因が挙げられます。ED治療薬（PDE5阻害薬）は、陰茎海綿体の血流を促進することで勃起を助ける薬です。',
      },
      {
        id: 'sildenafil',
        heading: 'シルデナフィル（バイアグラ）',
        body: 'シルデナフィルはPDE5阻害薬として最初に承認された成分で、バイアグラの有効成分です。服用後30〜60分で効果が現れ、約4〜6時間持続します。食事（特に高脂肪食）の影響を受けやすく、空腹時に服用すると効果が出やすいとされています。一般的な用量は25mg・50mg・100mgの3種類。副作用としては頭痛・顔のほてり・鼻づまりが比較的多く報告されています。',
      },
      {
        id: 'tadalafil',
        heading: 'タダラフィル（シアリス）',
        body: 'タダラフィルはシアリスの有効成分で、「週末の薬」とも呼ばれます。効果持続時間が最長36時間と非常に長く、食事の影響をほとんど受けないのが大きな特長です。用量は5mg（毎日服用タイプ）・10mg・20mgがあります。毎日服用タイプは自然な性行為のタイミングに合わせやすいとして人気が高まっています。副作用パターンはシルデナフィルと似ていますが、背中や筋肉の痛みが特徴的に報告されることがあります。',
      },
      {
        id: 'how-to-choose',
        heading: '治療薬の選び方',
        body: 'ED治療薬を選ぶ際の主なポイントは①効果持続時間②食事の影響③副作用のプロファイル④価格の4つです。性行為の予定が立てやすい場合はシルデナフィル、タイミングにとらわれたくない場合はタダラフィルが向いています。初めての方は50mgのシルデナフィルから試すケースが多いです。いずれの薬も心臓疾患のある方や硝酸薬を服用中の方は使用禁忌のため、必ず医師・薬剤師に確認してください。',
      },
      {
        id: 'safety',
        heading: '安全な使い方と注意事項',
        body: 'ED治療薬を安全に使用するために重要な点をまとめます。①硝酸薬（ニトログリセリンなど）との併用は禁忌②アルコールの過剰摂取は避ける③心臓・肝臓・腎臓に持病がある場合は医師に相談④性的刺激がなければ効果は現れない⑤1日1回以上の服用は避ける。副作用が強い場合や効果が感じられない場合は用量の調整が必要なため、専門家に相談することをおすすめします。',
      },
    ],
    faq: [
      {
        q: 'ED治療薬は個人輸入できますか？',
        a: 'はい、個人使用を目的とした医薬品の個人輸入は日本の薬機法上認められています。ただし、転売・譲渡は禁止されています。MYKENKOでは正規ルートで仕入れた信頼性の高い製品を取り扱っています。',
      },
      {
        q: 'バイアグラとシアリスはどちらが効果的ですか？',
        a: '両薬とも臨床試験では約70〜80%の有効率が示されています。どちらが「より効果的」ではなく、個人のライフスタイルや副作用の出やすさによって選ぶことが大切です。',
      },
      {
        q: 'ED治療薬に依存性はありますか？',
        a: 'ED治療薬（PDE5阻害薬）には身体的・精神的依存性はありません。服用を止めても離脱症状は起きません。ただし、心理的に「薬がないと不安」と感じるケースはあるため、根本原因の治療も合わせて検討することが推奨されます。',
      },
      {
        q: '食事はED治療薬に影響しますか？',
        a: 'シルデナフィルは高脂肪食の後に服用すると吸収が遅れ効果発現が遅くなる場合があります。タダラフィルは食事の影響をほとんど受けません。一般的に空腹時か軽食後の服用が推奨されます。',
      },
    ],
    relatedSlugs: ['sildenafil-vs-tadalafil', 'personal-import-guide'],
  },
  'minoxidil-guide': {
    title: 'ミノキシジル完全ガイド｜AGA治療の定番成分の効果と使い方',
    category: 'AGA',
    categorySlug: 'aga',
    readTime: '7分',
    toc: [
      { id: 'what-is-minoxidil', label: 'ミノキシジルとは' },
      { id: 'mechanism', label: '発毛メカニズム' },
      { id: 'topical', label: '外用ミノキシジル' },
      { id: 'oral', label: '内服ミノキシジル' },
      { id: 'side-effects', label: '副作用と注意点' },
    ],
    content: [
      {
        id: 'what-is-minoxidil',
        heading: 'ミノキシジルとは',
        body: 'ミノキシジルはAGA（男性型脱毛症）・FAGA（女性型脱毛症）治療に使用される最も実績のある成分の一つです。もともと高血圧の治療薬として開発されましたが、副作用として多毛が確認されたことから発毛剤として転用されました。現在は外用液・泡タイプと内服薬の2形態が存在し、世界中で広く使用されています。',
      },
      {
        id: 'mechanism',
        heading: '発毛メカニズム',
        body: 'ミノキシジルの主な発毛作用は①血管拡張による頭皮の血流改善②カリウムチャネル開口による毛乳頭細胞の活性化③毛周期の休止期から成長期への促進の3つです。特に休止期にある毛包を成長期に移行させる作用が強く、使用開始後2〜4ヶ月で初期脱毛（一時的に抜け毛が増える現象）が起きることがありますが、これは治療が効いているサインです。',
      },
      {
        id: 'topical',
        heading: '外用ミノキシジルの使い方',
        body: '外用ミノキシジルは5%（男性用）・2%（女性用）が一般的です。1日2回、薄毛の気になる部位に直接塗布します。使用後4〜6時間は洗髪を避けると吸収率が高まります。効果を実感するまでに最低6ヶ月〜1年の継続使用が必要です。使用を中止すると3〜6ヶ月で効果が失われるため、長期継続が基本となります。',
      },
      {
        id: 'oral',
        heading: '内服ミノキシジルの特徴',
        body: '低用量内服ミノキシジル（0.25mg〜2.5mg/日）はここ数年で急速に注目を集めています。外用よりも全身の毛包に作用するため、頭皮全体への効果が期待できます。ただし、顔・体の産毛が増える多毛症や、体液貯留・血圧低下などのリスクも外用より高まるため、医師の監督のもとで使用することが重要です。',
      },
      {
        id: 'side-effects',
        heading: '副作用と注意点',
        body: '外用の主な副作用は頭皮のかゆみ・乾燥・フケ・接触皮膚炎です。内服の場合は多毛症・浮腫・血圧低下・心拍数増加などが報告されています。妊娠中・授乳中の女性への使用は禁忌です。心臓疾患・腎臓疾患のある方も使用前に必ず医師にご相談ください。',
      },
    ],
    faq: [
      {
        q: 'ミノキシジルはどのくらいで効果が出ますか？',
        a: '個人差がありますが、一般的に使用開始から3〜6ヶ月で産毛が生え始め、1年以上継続することで明確な効果が現れることが多いです。',
      },
      {
        q: 'ミノキシジルを止めるとどうなりますか？',
        a: '使用を中止すると、3〜6ヶ月で元の脱毛状態に戻ります（リバウンド脱毛）。そのため、効果を維持するには継続使用が必要です。',
      },
      {
        q: 'フィナステリドとミノキシジルを併用できますか？',
        a: 'はい、AGA治療では両剤の併用が標準的です。フィナステリドがDHTによる毛乳頭へのダメージを防ぎ、ミノキシジルが発毛を促進するという相補的な関係があります。',
      },
    ],
    relatedSlugs: ['finasteride-guide', 'personal-import-guide'],
  },
  'finasteride-guide': {
    title: 'フィナステリドガイド｜プロペシアの効果・副作用・飲み方',
    category: 'AGA',
    categorySlug: 'aga',
    readTime: '6分',
    toc: [
      { id: 'what-is-finasteride', label: 'フィナステリドとは' },
      { id: 'mechanism', label: 'DHT抑制のメカニズム' },
      { id: 'dosage', label: '用量と飲み方' },
      { id: 'side-effects', label: '副作用' },
    ],
    content: [
      {
        id: 'what-is-finasteride',
        heading: 'フィナステリドとは',
        body: 'フィナステリドはAGA（男性型脱毛症）の内服治療薬で、プロペシアの有効成分です。世界60カ国以上で承認されており、AGA治療のファーストラインとして位置づけられています。5α-リダクターゼという酵素を阻害することで、AGAの原因となるDHT（ジヒドロテストステロン）の産生を約70%抑制します。',
      },
      {
        id: 'mechanism',
        heading: 'DHT抑制のメカニズム',
        body: 'テストステロンは5α-リダクターゼの作用によりDHTに変換されます。DHTは毛乳頭の受容体に結合し、毛周期を短縮させ最終的に毛包を萎縮させます。フィナステリドはこの5α-リダクターゼ（主にII型）を阻害し、DHT産生を抑制します。これにより毛周期が正常化し、抜け毛が減少・発毛が促進されます。',
      },
      {
        id: 'dosage',
        heading: '用量と飲み方',
        body: 'フィナステリドの標準用量はAGA治療では1mg/日、1回1錠を毎日同じ時間に服用します。食事の影響を受けないため、いつ飲んでも構いません。飲み忘れた場合は気づいた時点で1錠服用し、翌日から通常通り続けてください（2錠まとめて飲まないこと）。効果が出るまでに3〜6ヶ月かかるため、焦らず継続することが大切です。',
      },
      {
        id: 'side-effects',
        heading: '副作用と注意事項',
        body: 'フィナステリドの副作用として性機能への影響（性欲減退・勃起機能低下・射精量減少）が1〜2%程度報告されています。ただし、多くの場合服用を止めると回復します。まれに「フィナステリド後遺症症候群」と呼ばれる持続的副作用が報告されているため、副作用が気になる方は医師に相談してください。女性（特に妊婦）は錠剤に触れることも禁忌のため取り扱いに注意が必要です。',
      },
    ],
    faq: [
      {
        q: 'フィナステリドは一生飲み続けないといけませんか？',
        a: 'AGA治療の観点からは、効果を維持するために継続服用が推奨されます。服用を中止すると6〜12ヶ月で効果が失われ、元の状態に戻ります。',
      },
      {
        q: 'フィナステリドとデュタステリドはどう違いますか？',
        a: 'デュタステリド（ザガーロ）はI型・II型の両方の5α-リダクターゼを阻害するため、フィナステリドよりDHT抑制効果が強いとされます。ただし、副作用リスクも若干高まる可能性があります。',
      },
    ],
    relatedSlugs: ['minoxidil-guide', 'personal-import-guide'],
  },
  'sildenafil-vs-tadalafil': {
    title: 'シルデナフィル vs タダラフィル｜ED治療薬の徹底比較',
    category: 'ED治療',
    categorySlug: 'ed',
    readTime: '5分',
    toc: [
      { id: 'overview', label: '両成分の概要' },
      { id: 'comparison', label: '効果・持続時間比較' },
      { id: 'which-to-choose', label: 'どちらを選ぶべきか' },
    ],
    content: [
      {
        id: 'overview',
        heading: '両成分の概要',
        body: 'シルデナフィル（バイアグラ）とタダラフィル（シアリス）はいずれもPDE5阻害薬に分類されるED治療薬です。両者とも陰茎海綿体でのcGMPの分解を阻害し、血管を拡張して勃起を助けます。世界で最も広く使用されているED治療成分であり、多くの臨床試験でその有効性と安全性が確認されています。',
      },
      {
        id: 'comparison',
        heading: '効果・持続時間の比較',
        body: 'シルデナフィルの効果発現は30〜60分、持続時間は4〜6時間。タダラフィルは15〜30分で効果が現れ、最長36時間持続します。食事の影響はシルデナフィルが受けやすく（特に高脂肪食）、タダラフィルはほぼ影響なし。副作用のプロファイルは似ていますが、タダラフィルでは背中・筋肉の痛みが特有の副作用として挙げられます。価格面では一般的にジェネリックのシルデナフィルの方が安価です。',
      },
      {
        id: 'which-to-choose',
        heading: 'どちらを選ぶべきか',
        body: '性行為の計画が立てやすく、コスト重視の方にはシルデナフィルが向いています。一方、タイミングにこだわらずリラックスして楽しみたい方、または毎日服用タイプ（5mg）で継続的な効果を望む方にはタダラフィルがおすすめです。初めてED治療薬を試す場合は、まずシルデナフィル50mgから始めてみることが多いです。',
      },
    ],
    faq: [
      {
        q: 'シルデナフィルとタダラフィルを同時に使ってもいいですか？',
        a: '同時使用は禁忌です。同じ作用機序を持つ薬を重ねると過度の血圧低下を起こす危険があります。',
      },
    ],
    relatedSlugs: ['ed-medicine-guide', 'personal-import-guide'],
  },
  'personal-import-guide': {
    title: '医薬品個人輸入ガイド｜合法的に購入するための完全マニュアル',
    category: 'ガイド',
    categorySlug: 'guide',
    readTime: '12分',
    toc: [
      { id: 'legal', label: '個人輸入の法的根拠' },
      { id: 'what-can-import', label: '輸入できる薬・できない薬' },
      { id: 'safe-purchase', label: '安全な購入方法' },
      { id: 'customs', label: '税関・通関について' },
    ],
    content: [
      {
        id: 'legal',
        heading: '個人輸入の法的根拠',
        body: '日本の薬機法（医薬品医療機器等法）では、自己使用を目的とした医薬品の個人輸入は認められています。ただし、輸入量は外用薬で2ヶ月分、内服薬で1ヶ月分が目安とされています。転売・譲渡は禁止されており、違反した場合は罰則の対象となります。',
      },
      {
        id: 'what-can-import',
        heading: '輸入できる薬・できない薬',
        body: '個人輸入できる主なカテゴリ：ED治療薬（シルデナフィル・タダラフィルなど）、AGA治療薬（ミノキシジル・フィナステリドなど）、美容薬（トレチノインなど）、一般的なサプリメント類。輸入禁止・規制対象：麻薬・覚せい剤・向精神薬に分類される薬、危険ドラッグ、指定薬物。不明な場合は厚生労働省の輸入相談窓口にご確認ください。',
      },
      {
        id: 'safe-purchase',
        heading: '安全な購入方法',
        body: '信頼できる個人輸入サービスを利用する際のチェックポイント：①運営会社・所在地が明示されている②カスタマーサポートが整備されている③製品の成分・製造元が明確④適切な注意書き・免責事項が掲載されている⑤口コミ・評判が確認できる。MYKENKOはこれらの基準をすべて満たす正規業者のみを厳選しています。',
      },
      {
        id: 'customs',
        heading: '税関・通関について',
        body: '個人輸入品は日本の税関を通過する際に通関手続きが行われます。医薬品の場合、個人使用の範囲内であれば原則として自己申告のみで通関できます。ただし、関税・消費税が課せられる場合があります。また、希まれに税関で確認が求められるケースもあります。その際は購入証明や医師の処方箋（あれば）を用意しておくとスムーズです。',
      },
    ],
    faq: [
      {
        q: '個人輸入した薬は日本の病院で処方してもらえますか？',
        a: '個人輸入品はその薬そのものを日本の医師が処方する形にはなりません。ただし、同成分の日本国内承認薬を処方してもらうことは可能です。',
      },
      {
        q: '個人輸入した医薬品に副作用が出た場合、補償はありますか？',
        a: '日本の医薬品副作用被害救済制度は個人輸入品には適用されません。使用前に必ず成分・禁忌事項を確認し、医師・薬剤師にご相談ください。',
      },
    ],
    relatedSlugs: ['ed-medicine-guide', 'minoxidil-guide'],
  },
}

const RELATED_GUIDE_TITLES: Record<string, string> = {
  'ed-medicine-guide': 'ED治療薬完全ガイド',
  'minoxidil-guide': 'ミノキシジル完全ガイド',
  'finasteride-guide': 'フィナステリドガイド',
  'sildenafil-vs-tadalafil': 'シルデナフィル vs タダラフィル',
  'personal-import-guide': '医薬品個人輸入ガイド',
}

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const guide = GUIDES[params.slug]
  if (!guide) return { title: 'ガイド | MYKENKO' }
  return {
    title: `${guide.title} | MYKENKO`,
    description: `${guide.title}。${guide.category}に関する医学的根拠に基づいた詳しい解説。`,
  }
}

export default function GuideDetailPage({ params }: Props) {
  const guide = GUIDES[params.slug]
  if (!guide) notFound()

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: guide.faq.map((f) => ({
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
              <Link href="/guides" className="hover:text-primary-500 transition-colors">ガイド</Link>
              <span>/</span>
              <Link href={`/guides?category=${guide.categorySlug}`} className="hover:text-primary-500 transition-colors">{guide.category}</Link>
              <span>/</span>
              <span className="text-gray-600 truncate max-w-[200px]">{guide.title}</span>
            </nav>
          </div>
        </div>

        <div className="container-narrow py-8">
          <div className="flex gap-8">
            {/* Desktop TOC */}
            <aside className="hidden lg:block w-60 flex-shrink-0">
              <div className="bg-white rounded-2xl p-5 border border-gray-100 sticky top-24">
                <h3 className="font-semibold text-sm text-gray-900 mb-4">目次</h3>
                <ul className="space-y-2">
                  {guide.toc.map((item) => (
                    <li key={item.id}>
                      <a
                        href={`#${item.id}`}
                        className="text-sm text-gray-600 hover:text-primary-500 transition-colors"
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <Link
                    href="/shop"
                    className="block w-full text-center bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold py-2.5 px-4 rounded-xl transition-colors"
                  >
                    関連商品を見る →
                  </Link>
                </div>
              </div>
            </aside>

            {/* Article */}
            <div className="flex-1 min-w-0">
              {/* Header */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 mb-6">
                <span className="inline-block text-xs font-semibold text-primary-500 bg-primary-50 px-3 py-1 rounded-full mb-4">
                  {guide.category}
                </span>
                <h1 className="font-display text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                  {guide.title}
                </h1>
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span>読了時間: {guide.readTime}</span>
                  <span>最終更新: 2025年5月</span>
                </div>
              </div>

              <MedicalDisclaimer />

              {/* Content sections */}
              <div className="mt-6 space-y-6">
                {guide.content.map((section) => (
                  <div
                    key={section.id}
                    id={section.id}
                    className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8"
                  >
                    <h2 className="font-display text-xl font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100">
                      {section.heading}
                    </h2>
                    <p className="text-gray-700 leading-relaxed">{section.body}</p>
                  </div>
                ))}
              </div>

              {/* FAQ */}
              <div className="mt-6 bg-white rounded-2xl border border-gray-100 p-6 md:p-8">
                <h2 className="font-display text-xl font-bold text-gray-900 mb-6">よくある質問</h2>
                <div className="space-y-4">
                  {guide.faq.map((item, i) => (
                    <div key={i} className="border border-gray-100 rounded-xl p-5">
                      <p className="font-semibold text-gray-900 mb-2">Q. {item.q}</p>
                      <p className="text-sm text-gray-600 leading-relaxed">A. {item.a}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Related guides */}
              {guide.relatedSlugs.length > 0 && (
                <div className="mt-6 bg-white rounded-2xl border border-gray-100 p-6 md:p-8">
                  <h2 className="font-display text-lg font-bold text-gray-900 mb-4">関連ガイド</h2>
                  <div className="flex flex-col gap-3">
                    {guide.relatedSlugs.map((slug) => (
                      <Link
                        key={slug}
                        href={`/guide/${slug}`}
                        className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-primary-200 hover:bg-primary-50 transition-colors group"
                      >
                        <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-primary-500 text-lg">📖</span>
                        </div>
                        <span className="text-sm font-medium text-gray-700 group-hover:text-primary-500 transition-colors">
                          {RELATED_GUIDE_TITLES[slug] ?? slug}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* CTA */}
              <div className="mt-6 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-6 md:p-8 text-center text-white">
                <h3 className="font-display text-xl font-bold mb-2">関連商品を探す</h3>
                <p className="text-primary-100 text-sm mb-5">
                  ガイドで紹介した医薬品・サプリメントをMYKENKOでお探しいただけます。
                </p>
                <Link
                  href="/shop"
                  className="inline-block bg-white text-primary-500 font-semibold text-sm px-6 py-3 rounded-xl hover:bg-primary-50 transition-colors"
                >
                  関連商品を見る →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
