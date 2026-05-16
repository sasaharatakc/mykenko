'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Clock, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const CATEGORIES = [
  { key: 'all', label: 'すべて' },
  { key: 'ed', label: 'ED治療' },
  { key: 'aga', label: 'AGA' },
  { key: 'beauty', label: '美容' },
  { key: 'diet', label: 'ダイエット' },
  { key: 'sleep', label: '睡眠' },
  { key: 'allergy', label: 'アレルギー' },
  { key: 'supplement', label: 'サプリメント' },
]

const GUIDES = [
  {
    slug: 'ed-medicine-guide',
    title: 'ED治療薬完全ガイド｜バイアグラ・シアリスの効果と選び方',
    excerpt: 'ED（勃起不全）の原因から治療薬の種類、効果的な選び方まで医学的根拠に基づいて解説。バイアグラ（シルデナフィル）とシアリス（タダラフィル）の比較も。',
    category: 'ed',
    categoryLabel: 'ED治療',
    readTime: '8分',
  },
  {
    slug: 'minoxidil-guide',
    title: 'ミノキシジル完全ガイド｜AGA治療の定番成分の効果と使い方',
    excerpt: 'AGA治療の主成分ミノキシジルの作用機序、外用・内服の違い、正しい使い方と副作用を詳しく解説。効果を最大化するためのポイントとは。',
    category: 'aga',
    categoryLabel: 'AGA',
    readTime: '7分',
  },
  {
    slug: 'finasteride-guide',
    title: 'フィナステリドガイド｜プロペシアの効果・副作用・飲み方',
    excerpt: 'フィナステリド（プロペシア）はAGA治療の内服薬として世界中で使用される実績ある成分。DHT抑制のメカニズムから服用方法、注意点まで徹底解説。',
    category: 'aga',
    categoryLabel: 'AGA',
    readTime: '6分',
  },
  {
    slug: 'beauty-tretinoin-guide',
    title: 'トレチノイン（レチノイン酸）ガイド｜エイジングケアの最強成分',
    excerpt: 'トレチノインはシミ・シワ・ニキビに効果的な医療美容の定番成分。正しい使い方と注意点、市販のレチノールとの違いを詳しく説明します。',
    category: 'beauty',
    categoryLabel: '美容',
    readTime: '9分',
  },
  {
    slug: 'diet-medicine-guide',
    title: 'ダイエット薬ガイド｜個人輸入で手に入る医薬品の選び方',
    excerpt: '食欲抑制・脂肪吸収阻害・代謝促進など、作用機序が異なるダイエット医薬品をわかりやすく比較。安全に使うための注意事項もまとめました。',
    category: 'diet',
    categoryLabel: 'ダイエット',
    readTime: '10分',
  },
  {
    slug: 'sleep-medicine-guide',
    title: '睡眠薬・睡眠サポート薬ガイド｜不眠改善のための選択肢',
    excerpt: '不眠症の種類と原因、睡眠薬の種類（ベンゾジアゼピン・非ベンゾジアゼピン）の違い、依存リスクを最小化する使い方を解説します。',
    category: 'sleep',
    categoryLabel: '睡眠',
    readTime: '7分',
  },
  {
    slug: 'allergy-medicine-guide',
    title: '抗アレルギー薬ガイド｜花粉症・アレルギー性鼻炎の対策',
    excerpt: '第一世代・第二世代抗ヒスタミン薬の違いから、フェキソフェナジン・セチリジン・ロラタジンなど人気成分の比較まで詳しく紹介します。',
    category: 'allergy',
    categoryLabel: 'アレルギー',
    readTime: '6分',
  },
  {
    slug: 'supplement-guide',
    title: 'メディカルサプリメントガイド｜科学的根拠のあるサプリの選び方',
    excerpt: 'ビタミン・ミネラル・アミノ酸など医療グレードのサプリメントを正しく選ぶための基準と、証拠に基づいたおすすめサプリメントをご紹介します。',
    category: 'supplement',
    categoryLabel: 'サプリメント',
    readTime: '8分',
  },
  {
    slug: 'sildenafil-vs-tadalafil',
    title: 'シルデナフィル vs タダラフィル｜ED治療薬の徹底比較',
    excerpt: 'ED治療の2大成分シルデナフィルとタダラフィルを効果・持続時間・副作用・価格の観点から比較。あなたに合う治療薬の選び方をガイドします。',
    category: 'ed',
    categoryLabel: 'ED治療',
    readTime: '5分',
  },
  {
    slug: 'personal-import-guide',
    title: '医薬品個人輸入ガイド｜合法的に購入するための完全マニュアル',
    excerpt: '日本での医薬品個人輸入の法的な仕組み、購入できる薬・できない薬の違い、安全に利用するためのポイントを分かりやすく解説します。',
    category: 'all',
    categoryLabel: 'ガイド',
    readTime: '12分',
  },
]

export function GuideListContent() {
  const [activeCategory, setActiveCategory] = useState('all')

  const filtered =
    activeCategory === 'all'
      ? GUIDES
      : GUIDES.filter((g) => g.category === activeCategory)

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero */}
      <div className="bg-white border-b border-gray-100">
        <div className="container-narrow py-12 text-center">
          <span className="inline-block text-xs font-semibold text-primary-500 uppercase tracking-widest mb-3">
            MEDICAL GUIDE
          </span>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-gray-900">
            メディカルガイド
          </h1>
          <p className="text-gray-500 mt-3 max-w-xl mx-auto">
            ED治療薬・AGA治療薬・美容薬など、個人輸入医薬品の正しい使い方・選び方を
            医学的根拠に基づいて解説します。
          </p>
        </div>
      </div>

      {/* Category chips */}
      <div className="bg-white border-b border-gray-100 sticky top-16 z-30">
        <div className="container-narrow py-3 flex gap-2 overflow-x-auto scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={cn(
                'flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors border',
                activeCategory === cat.key
                  ? 'bg-primary-500 text-white border-primary-500'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300 hover:text-primary-500'
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="container-narrow py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((guide) => (
            <article
              key={guide.slug}
              className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow group"
            >
              {/* Thumbnail placeholder */}
              <div className="relative h-44 bg-gradient-to-br from-primary-50 to-primary-100 overflow-hidden">
                <img
                  src={`https://picsum.photos/seed/${guide.slug}/400/200`}
                  alt={guide.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-80"
                />
                <span className="absolute top-3 left-3 bg-primary-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                  {guide.categoryLabel}
                </span>
              </div>

              <div className="p-5">
                <Link href={`/guide/${guide.slug}`}>
                  <h2 className="font-display text-base font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-500 transition-colors">
                    {guide.title}
                  </h2>
                </Link>
                <p className="text-sm text-gray-500 line-clamp-2">{guide.excerpt}</p>
                <div className="flex items-center justify-between mt-4">
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <Clock className="w-3 h-3" />
                    読了時間: {guide.readTime}
                  </span>
                  <Link
                    href={`/guide/${guide.slug}`}
                    className="flex items-center gap-1 text-xs font-medium text-primary-500 hover:gap-2 transition-all"
                  >
                    続きを読む <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg">このカテゴリのガイドは現在準備中です。</p>
          </div>
        )}
      </div>
    </div>
  )
}
