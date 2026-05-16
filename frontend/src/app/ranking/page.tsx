'use client'

import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { productApi } from '@/lib/api'
import { formatPrice, cn } from '@/lib/utils'
import { Star, ArrowRight, Trophy } from 'lucide-react'

// Metadata cannot be exported from a 'use client' file; this page renders as a client component.
// The metadata export is in a server wrapper – for simplicity we keep all in one file and
// rely on the layout title fallback.

const CATEGORY_TABS = [
  { key: 'all', label: '総合' },
  { key: 'ed', label: 'ED治療薬' },
  { key: 'aga', label: 'AGA治療薬' },
  { key: 'beauty', label: '美容' },
  { key: 'diet', label: 'ダイエット' },
  { key: 'sleep', label: '睡眠' },
]

const MOCK_RANKINGS: Record<string, { name: string; slug: string; price: number; rating: number; ratingCount: number; benefit: string; image: string }[]> = {
  all: [
    { name: 'シアリス20mg（タダラフィル）', slug: 'tadalafil-20mg', price: 2980, rating: 4.8, ratingCount: 312, benefit: '36時間の持続効果', image: 'https://picsum.photos/seed/tadalafil20/200/200' },
    { name: 'バイアグラ100mg（シルデナフィル）', slug: 'sildenafil-100mg', price: 1980, rating: 4.7, ratingCount: 425, benefit: '高い有効率・実績豊富', image: 'https://picsum.photos/seed/sildenafil100/200/200' },
    { name: 'プロペシア1mg（フィナステリド）', slug: 'finasteride-1mg', price: 3500, rating: 4.6, ratingCount: 289, benefit: 'AGA治療のスタンダード', image: 'https://picsum.photos/seed/finasteride1/200/200' },
    { name: 'ミノキシジル5%外用液', slug: 'minoxidil-5-topical', price: 2200, rating: 4.5, ratingCount: 198, benefit: '実績ある発毛成分', image: 'https://picsum.photos/seed/minoxidil5/200/200' },
    { name: 'トレチノイン0.025%クリーム', slug: 'tretinoin-cream', price: 4800, rating: 4.7, ratingCount: 156, benefit: '医療美容の最強エイジングケア', image: 'https://picsum.photos/seed/tretinoin/200/200' },
  ],
  ed: [
    { name: 'シアリス20mg（タダラフィル）', slug: 'tadalafil-20mg', price: 2980, rating: 4.8, ratingCount: 312, benefit: '36時間の持続効果', image: 'https://picsum.photos/seed/tadalafil20/200/200' },
    { name: 'バイアグラ100mg（シルデナフィル）', slug: 'sildenafil-100mg', price: 1980, rating: 4.7, ratingCount: 425, benefit: '高い有効率・実績豊富', image: 'https://picsum.photos/seed/sildenafil100/200/200' },
    { name: 'レビトラ20mg（バルデナフィル）', slug: 'vardenafil-20mg', price: 2500, rating: 4.5, ratingCount: 178, benefit: '素早い効果発現', image: 'https://picsum.photos/seed/vardenafil/200/200' },
    { name: 'シアリス5mg（タダラフィル）毎日服用', slug: 'tadalafil-5mg', price: 4500, rating: 4.6, ratingCount: 201, benefit: '毎日服用タイプ・自然な効果', image: 'https://picsum.photos/seed/tadalafil5/200/200' },
    { name: 'ステンドラ（アバナフィル）', slug: 'avanafil', price: 3200, rating: 4.4, ratingCount: 89, benefit: '最速15分で効果発現', image: 'https://picsum.photos/seed/avanafil/200/200' },
  ],
  aga: [
    { name: 'プロペシア1mg（フィナステリド）', slug: 'finasteride-1mg', price: 3500, rating: 4.6, ratingCount: 289, benefit: 'AGA治療のスタンダード', image: 'https://picsum.photos/seed/finasteride1/200/200' },
    { name: 'ミノキシジル5%外用液', slug: 'minoxidil-5-topical', price: 2200, rating: 4.5, ratingCount: 198, benefit: '実績ある発毛成分', image: 'https://picsum.photos/seed/minoxidil5/200/200' },
    { name: 'ザガーロ0.5mg（デュタステリド）', slug: 'dutasteride-0-5mg', price: 5800, rating: 4.7, ratingCount: 143, benefit: '強力なDHT抑制', image: 'https://picsum.photos/seed/dutasteride/200/200' },
    { name: 'ミノキシジル5%泡（ロゲイン）', slug: 'minoxidil-foam', price: 2800, rating: 4.4, ratingCount: 167, benefit: '泡タイプで使いやすい', image: 'https://picsum.photos/seed/minoxidilfoam/200/200' },
    { name: '内服ミノキシジル2.5mg', slug: 'minoxidil-oral-2-5mg', price: 3200, rating: 4.5, ratingCount: 112, benefit: '全頭への効果が期待', image: 'https://picsum.photos/seed/minoxidiloral/200/200' },
  ],
  beauty: [
    { name: 'トレチノイン0.025%クリーム', slug: 'tretinoin-cream', price: 4800, rating: 4.7, ratingCount: 156, benefit: '医療美容の最強エイジングケア', image: 'https://picsum.photos/seed/tretinoin/200/200' },
    { name: 'ハイドロキノン4%クリーム', slug: 'hydroquinone-cream', price: 3200, rating: 4.5, ratingCount: 134, benefit: 'シミ・色素沈着対策', image: 'https://picsum.photos/seed/hydroquinone/200/200' },
    { name: 'ビタミンC誘導体20%美容液', slug: 'vitamin-c-serum', price: 2800, rating: 4.6, ratingCount: 198, benefit: '明るい肌へ・コラーゲン生成', image: 'https://picsum.photos/seed/vitaminc/200/200' },
    { name: 'ナイアシンアミド10%クリーム', slug: 'niacinamide-cream', price: 2200, rating: 4.4, ratingCount: 89, benefit: '毛穴・皮脂コントロール', image: 'https://picsum.photos/seed/niacinamide/200/200' },
    { name: 'アゼライン酸20%クリーム', slug: 'azelaic-acid-cream', price: 3500, rating: 4.5, ratingCount: 76, benefit: 'ニキビ・炎症対策', image: 'https://picsum.photos/seed/azelaic/200/200' },
  ],
  diet: [
    { name: 'フェンテルミン37.5mg', slug: 'phentermine-37-5mg', price: 4500, rating: 4.3, ratingCount: 98, benefit: '食欲抑制・代謝促進', image: 'https://picsum.photos/seed/phentermine/200/200' },
    { name: 'オルリスタット120mg（ゼニカル）', slug: 'orlistat-120mg', price: 3800, rating: 4.2, ratingCount: 134, benefit: '脂肪吸収阻害', image: 'https://picsum.photos/seed/orlistat/200/200' },
    { name: 'メトホルミン（食欲抑制補助）', slug: 'metformin-500mg', price: 2800, rating: 4.4, ratingCount: 76, benefit: '血糖管理・食欲抑制サポート', image: 'https://picsum.photos/seed/metformin/200/200' },
    { name: 'ガルシニアカンボジアサプリ', slug: 'garcinia-supplement', price: 1800, rating: 4.1, ratingCount: 212, benefit: '天然成分・脂肪燃焼サポート', image: 'https://picsum.photos/seed/garcinia/200/200' },
    { name: '白いんげん豆エキス', slug: 'white-kidney-bean', price: 1500, rating: 4.0, ratingCount: 167, benefit: '糖質吸収を抑える', image: 'https://picsum.photos/seed/whitebeans/200/200' },
  ],
  sleep: [
    { name: 'メラトニン5mg', slug: 'melatonin-5mg', price: 1200, rating: 4.6, ratingCount: 345, benefit: '自然な睡眠リズムをサポート', image: 'https://picsum.photos/seed/melatonin/200/200' },
    { name: 'ゾルピデム（睡眠補助）', slug: 'zolpidem-10mg', price: 3800, rating: 4.4, ratingCount: 89, benefit: '入眠困難に効果的', image: 'https://picsum.photos/seed/zolpidem/200/200' },
    { name: 'バレリアンエキスサプリ', slug: 'valerian-supplement', price: 1600, rating: 4.2, ratingCount: 178, benefit: '天然ハーブで穏やかな眠り', image: 'https://picsum.photos/seed/valerian/200/200' },
    { name: 'テアニン200mgサプリ', slug: 'theanine-supplement', price: 1400, rating: 4.3, ratingCount: 234, benefit: 'リラックス・睡眠の質向上', image: 'https://picsum.photos/seed/theanine/200/200' },
    { name: 'マグネシウムグリシネート', slug: 'magnesium-glycinate', price: 1800, rating: 4.4, ratingCount: 156, benefit: '筋弛緩・深い睡眠をサポート', image: 'https://picsum.photos/seed/magnesium/200/200' },
  ],
}

const RANK_STYLES = [
  { bg: 'bg-yellow-400', text: 'text-yellow-900', label: '金' },
  { bg: 'bg-gray-300', text: 'text-gray-700', label: '銀' },
  { bg: 'bg-amber-600', text: 'text-amber-100', label: '銅' },
]

export default function RankingPage() {
  const [activeTab, setActiveTab] = useState('all')

  const { data: apiProducts } = useQuery({
    queryKey: ['products-ranking', activeTab],
    queryFn: () =>
      productApi.list({ sort: 'popular', per_page: 10, category: activeTab !== 'all' ? activeTab : undefined })
        .then((r) => r.data?.data ?? []),
    retry: false,
  })

  const rankingItems = MOCK_RANKINGS[activeTab] ?? MOCK_RANKINGS.all

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero */}
      <div className="bg-white border-b border-gray-100">
        <div className="container-narrow py-12 text-center">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 bg-amber-50 px-3 py-1 rounded-full mb-3">
            <Trophy className="w-3.5 h-3.5" />
            RANKING
          </span>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-gray-900">
            商品ランキング
          </h1>
          <p className="text-gray-500 mt-3">
            売上・評価・満足度をもとに選んだMYKENKOのおすすめ商品ランキング
          </p>
        </div>
      </div>

      {/* Category tabs */}
      <div className="bg-white border-b border-gray-100 sticky top-16 z-30">
        <div className="container-narrow">
          <div className="flex gap-1 overflow-x-auto scrollbar-hide py-1">
            {CATEGORY_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'flex-shrink-0 px-4 py-2.5 text-sm font-medium transition-colors border-b-2',
                  activeTab === tab.key
                    ? 'border-primary-500 text-primary-500'
                    : 'border-transparent text-gray-600 hover:text-primary-500'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Ranking list */}
      <div className="container-narrow py-10 max-w-3xl">
        <div className="space-y-4">
          {rankingItems.map((item, index) => {
            const rank = index + 1
            const rankStyle = RANK_STYLES[index] ?? { bg: 'bg-gray-100', text: 'text-gray-600', label: String(rank) }

            return (
              <div
                key={item.slug}
                className="bg-white border border-gray-100 rounded-2xl p-5 flex gap-5 items-center hover:shadow-md transition-shadow"
              >
                {/* Rank badge */}
                <div className={cn('w-12 h-12 rounded-xl flex-shrink-0 flex flex-col items-center justify-center font-bold', rankStyle.bg, rankStyle.text)}>
                  <span className="text-xs leading-none">No.</span>
                  <span className="text-xl leading-none">{rank}</span>
                </div>

                {/* Image */}
                <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm line-clamp-2">{item.name}</p>
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

                {/* CTA */}
                <Link
                  href={`/products/${item.slug}`}
                  className="flex-shrink-0 text-xs font-medium text-primary-500 flex items-center gap-1 hover:gap-2 transition-all"
                >
                  詳細 <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )
          })}
        </div>

        {/* Links to individual ranking pages */}
        <div className="mt-10">
          <h2 className="font-display text-lg font-bold text-gray-900 mb-4">カテゴリ別ランキング</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { slug: 'ed-medicine', label: 'ED治療薬ランキング' },
              { slug: 'aga-medicine', label: 'AGA治療薬ランキング' },
              { slug: 'beauty', label: '美容薬ランキング' },
              { slug: 'diet', label: 'ダイエット薬ランキング' },
              { slug: 'sleep', label: '睡眠薬ランキング' },
              { slug: 'supplement', label: 'サプリランキング' },
            ].map((cat) => (
              <Link
                key={cat.slug}
                href={`/ranking/${cat.slug}`}
                className="block text-center text-sm font-medium text-gray-700 bg-white border border-gray-100 rounded-xl px-4 py-3 hover:border-primary-300 hover:text-primary-500 transition-colors"
              >
                {cat.label} →
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
