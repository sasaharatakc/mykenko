'use client'

import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { productApi } from '@/lib/api'
import { cn } from '@/lib/utils'
import { Star, Trophy, ArrowRight, ChevronDown } from 'lucide-react'
import { useState } from 'react'

interface RankingDef {
  title: string
  description: string
  category: string
  keyword: string
  faqs: { q: string; a: string }[]
  related: { slug: string; label: string }[]
}

const RANKINGS: Record<string, RankingDef> = {
  'ed-medicine': {
    title: 'ED治療薬ランキング',
    description: '2025年最新版。売上・レビュー・有効率をもとに選んだED治療薬（PDE5阻害薬）トップ10',
    category: 'ED治療',
    keyword: 'ed',
    faqs: [
      { q: 'ED治療薬はどこで購入できますか？', a: 'MYKENKOでは個人輸入を通じてED治療薬を購入いただけます。すべて正規品をお届けします。' },
      { q: 'どのED治療薬が一番効果的ですか？', a: 'ランキング1位のタダラフィル（シアリス）は効果持続時間が最長で人気があります。初めての方はシルデナフィル50mgから試すことが多いです。' },
      { q: '個人輸入で購入したED治療薬は安全ですか？', a: 'MYKENKOでは正規製造元から仕入れた製品のみを取り扱っています。ただし使用前に医師・薬剤師にご相談ください。' },
    ],
    related: [
      { slug: 'aga-medicine', label: 'AGA治療薬ランキング' },
      { slug: 'beauty', label: '美容薬ランキング' },
    ],
  },
  'aga-medicine': {
    title: 'AGA治療薬ランキング',
    description: '2025年最新版。薄毛・脱毛症に効果的なAGA治療薬・発毛剤のおすすめランキング',
    category: 'AGA',
    keyword: 'aga',
    faqs: [
      { q: 'AGA治療薬はいつから効果が出ますか？', a: '一般的に3〜6ヶ月で変化を実感し始め、1年以上継続することで明確な効果が現れます。' },
      { q: 'フィナステリドとミノキシジルはどちらがいいですか？', a: '両剤の併用が最も効果的とされています。フィナステリドで抜け毛を防ぎ、ミノキシジルで発毛を促進します。' },
    ],
    related: [
      { slug: 'ed-medicine', label: 'ED治療薬ランキング' },
      { slug: 'beauty', label: '美容薬ランキング' },
    ],
  },
  'beauty': {
    title: '美容薬ランキング',
    description: 'トレチノイン・ハイドロキノン・ビタミンC誘導体など医療美容薬のおすすめランキング',
    category: '美容',
    keyword: 'beauty',
    faqs: [
      { q: 'トレチノインは市販で購入できますか？', a: '日本国内では処方箋が必要ですが、個人輸入では海外製のトレチノイン製品を購入いただけます。' },
      { q: 'シミに効果的な薬は何ですか？', a: 'ハイドロキノンとトレチノインの併用がシミ治療の定番とされています。' },
    ],
    related: [
      { slug: 'ed-medicine', label: 'ED治療薬ランキング' },
      { slug: 'aga-medicine', label: 'AGA治療薬ランキング' },
    ],
  },
  'diet': {
    title: 'ダイエット薬ランキング',
    description: '食欲抑制・脂肪吸収阻害・代謝促進など、目的別ダイエット医薬品のおすすめランキング',
    category: 'ダイエット',
    keyword: 'diet',
    faqs: [
      { q: 'ダイエット薬に副作用はありますか？', a: '薬の種類によって副作用は異なります。食欲抑制薬は口渇・不眠、脂肪吸収阻害薬は油っぽい排便などが報告されています。' },
    ],
    related: [
      { slug: 'beauty', label: '美容薬ランキング' },
      { slug: 'supplement', label: 'サプリランキング' },
    ],
  },
  'sleep': {
    title: '睡眠薬・睡眠サポート薬ランキング',
    description: '不眠改善・睡眠の質向上に役立つ薬・サプリメントのおすすめランキング',
    category: '睡眠',
    keyword: 'sleep',
    faqs: [
      { q: 'メラトニンは毎日飲んでも大丈夫ですか？', a: 'メラトニンは一般的に短期使用が推奨されます。長期使用については医師にご相談ください。' },
    ],
    related: [
      { slug: 'supplement', label: 'サプリランキング' },
      { slug: 'diet', label: 'ダイエット薬ランキング' },
    ],
  },
  'supplement': {
    title: 'サプリメントランキング',
    description: '医療グレードのサプリメント・栄養補助食品のおすすめランキング',
    category: 'サプリメント',
    keyword: 'supplement',
    faqs: [
      { q: 'サプリメントと医薬品の違いは何ですか？', a: 'サプリメントは食品扱いで効果の承認が不要ですが、医薬品は有効性・安全性が科学的に証明されています。医薬品の方が強い効果が期待できます。' },
    ],
    related: [
      { slug: 'beauty', label: '美容薬ランキング' },
      { slug: 'sleep', label: '睡眠薬ランキング' },
    ],
  },
}

const MOCK_PRODUCTS = [
  { name: '商品A', slug: 'product-a', price: 2980, rating: 4.8, ratingCount: 312, benefit: 'ベストセラー製品', image: 'https://picsum.photos/seed/prod1/200/200' },
  { name: '商品B', slug: 'product-b', price: 1980, rating: 4.7, ratingCount: 425, benefit: '高評価・実績豊富', image: 'https://picsum.photos/seed/prod2/200/200' },
  { name: '商品C', slug: 'product-c', price: 3500, rating: 4.6, ratingCount: 289, benefit: 'コスパ最高', image: 'https://picsum.photos/seed/prod3/200/200' },
  { name: '商品D', slug: 'product-d', price: 2200, rating: 4.5, ratingCount: 198, benefit: '効果実証済み', image: 'https://picsum.photos/seed/prod4/200/200' },
  { name: '商品E', slug: 'product-e', price: 4800, rating: 4.4, ratingCount: 156, benefit: 'プレミアム品質', image: 'https://picsum.photos/seed/prod5/200/200' },
  { name: '商品F', slug: 'product-f', price: 1600, rating: 4.3, ratingCount: 234, benefit: 'リーズナブルで高品質', image: 'https://picsum.photos/seed/prod6/200/200' },
  { name: '商品G', slug: 'product-g', price: 3200, rating: 4.2, ratingCount: 178, benefit: '医師推奨成分', image: 'https://picsum.photos/seed/prod7/200/200' },
  { name: '商品H', slug: 'product-h', price: 2600, rating: 4.1, ratingCount: 145, benefit: '副作用リスク低', image: 'https://picsum.photos/seed/prod8/200/200' },
  { name: '商品I', slug: 'product-i', price: 1900, rating: 4.0, ratingCount: 123, benefit: '初心者向け', image: 'https://picsum.photos/seed/prod9/200/200' },
  { name: '商品J', slug: 'product-j', price: 3800, rating: 3.9, ratingCount: 98, benefit: '上級者向け高濃度', image: 'https://picsum.photos/seed/prod10/200/200' },
]

const RANK_STYLES = [
  { bg: 'bg-yellow-400', text: 'text-yellow-900' },
  { bg: 'bg-gray-300', text: 'text-gray-700' },
  { bg: 'bg-amber-600', text: 'text-amber-100' },
]

interface Props { params: { slug: string } }

export default function RankingDetailPage({ params }: Props) {
  const ranking = RANKINGS[params.slug]
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  if (!ranking) notFound()

  const { data: apiProducts } = useQuery({
    queryKey: ['products-ranking-detail', params.slug],
    queryFn: () =>
      productApi.list({ sort: 'popular', per_page: 10, category: ranking.keyword })
        .then((r) => r.data?.data ?? []),
    retry: false,
  })

  const products = MOCK_PRODUCTS

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="container-narrow py-3">
          <nav className="flex items-center gap-2 text-xs text-gray-400">
            <Link href="/" className="hover:text-primary-500 transition-colors">ホーム</Link>
            <span>/</span>
            <Link href="/ranking" className="hover:text-primary-500 transition-colors">ランキング</Link>
            <span>/</span>
            <span className="text-gray-600">{ranking.title}</span>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <div className="bg-white border-b border-gray-100">
        <div className="container-narrow py-10 text-center max-w-2xl">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 bg-amber-50 px-3 py-1 rounded-full mb-3">
            <Trophy className="w-3.5 h-3.5" />
            {ranking.category}
          </span>
          <h1 className="font-display text-3xl font-bold text-gray-900">{ranking.title}</h1>
          <p className="text-gray-500 mt-2 text-sm">{ranking.description}</p>
        </div>
      </div>

      <div className="container-narrow py-10 max-w-3xl">
        {/* Methodology */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-8 text-sm text-blue-800">
          <p className="font-semibold mb-1">このランキングの選定基準</p>
          <p>売上数・顧客評価（5段階）・レビュー数・成分の有効性・コストパフォーマンスを総合的に評価してランキングを作成しています。最終更新: 2025年5月</p>
        </div>

        {/* Ranking list */}
        <div className="space-y-4">
          {products.map((item, index) => {
            const rank = index + 1
            const rankStyle = RANK_STYLES[index] ?? { bg: 'bg-gray-100', text: 'text-gray-500' }

            return (
              <div
                key={item.slug}
                className="bg-white border border-gray-100 rounded-2xl p-5 flex gap-5 items-center hover:shadow-md transition-shadow"
              >
                <div className={cn('w-14 h-14 rounded-xl flex-shrink-0 flex flex-col items-center justify-center font-bold text-lg', rankStyle.bg, rankStyle.text)}>
                  {rank <= 3 ? (
                    <>
                      <span className="text-xs leading-none">No.</span>
                      <span className="text-xl leading-none">{rank}</span>
                    </>
                  ) : (
                    <span className="text-2xl font-bold">{rank}</span>
                  )}
                </div>

                <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                  <Image src={item.image} alt={item.name} fill className="object-cover" sizes="64px" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm">{item.name}</p>
                  <p className="text-xs text-primary-500 mt-0.5">{item.benefit}</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="flex items-center gap-1 text-xs text-amber-500">
                      <Star className="w-3 h-3 fill-amber-400" />
                      {item.rating}
                      <span className="text-gray-400">({item.ratingCount}件)</span>
                    </span>
                    <span className="text-sm font-bold text-gray-900">¥{item.price.toLocaleString()}</span>
                  </div>
                </div>

                <Link
                  href={`/products/${item.slug}`}
                  className="flex-shrink-0 bg-primary-500 hover:bg-primary-600 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
                >
                  購入する
                </Link>
              </div>
            )
          })}
        </div>

        {/* FAQ */}
        <div className="mt-10 bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-display text-lg font-bold text-gray-900 mb-5">よくある質問</h2>
          <div className="space-y-3">
            {ranking.faqs.map((faq, i) => (
              <div key={i} className="border border-gray-100 rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="font-medium text-sm text-gray-900">{faq.q}</span>
                  <ChevronDown className={cn('w-4 h-4 text-gray-400 transition-transform flex-shrink-0', openFaq === i && 'rotate-180')} />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-100">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Related rankings */}
        <div className="mt-6">
          <h2 className="font-display text-lg font-bold text-gray-900 mb-4">関連ランキング</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ranking.related.map((r) => (
              <Link
                key={r.slug}
                href={`/ranking/${r.slug}`}
                className="flex items-center justify-between bg-white border border-gray-100 rounded-xl px-5 py-4 hover:border-primary-300 hover:text-primary-500 transition-colors group"
              >
                <span className="text-sm font-medium text-gray-700 group-hover:text-primary-500">{r.label}</span>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-primary-500 transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
