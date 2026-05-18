'use client'

import { BarChart2, Home, Search, Layers, ShoppingBag } from 'lucide-react'

const AD_SLOTS = [
  { icon: Home, name: 'ホームページ特集', desc: 'トップページのフィーチャーセクションに商品を掲載', price: '¥9,800/月', slots: '残り 2枠', color: 'text-purple-600 bg-purple-50' },
  { icon: Search, name: '検索結果上位', desc: '検索結果の最上部にスポンサー商品として表示', price: '¥5,800/月', slots: '残り 5枠', color: 'text-blue-600 bg-blue-50' },
  { icon: Layers, name: 'カテゴリトップ', desc: 'カテゴリページの最上部に表示（カテゴリ指定）', price: '¥3,800/月', slots: '残り 8枠', color: 'text-green-600 bg-green-50' },
  { icon: ShoppingBag, name: '関連商品欄', desc: '他商品の詳細ページの関連商品に表示', price: '¥1,980/月', slots: '無制限', color: 'text-orange-600 bg-orange-50' },
]

export default function VendorAdsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <BarChart2 className="w-6 h-6 text-primary-500" />
        <h1 className="text-2xl font-bold text-gray-900">広告・プロモーション</h1>
      </div>

      <div className="bg-primary-50 border border-primary-200 rounded-xl p-4 text-sm text-primary-800">
        <p className="font-semibold mb-1">💡 広告を活用して売上を増やしましょう</p>
        <p>有料広告枠を利用することで、商品の露出を大幅に増やすことができます。広告機能は現在準備中です。</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {AD_SLOTS.map(({ icon: Icon, name, desc, price, slots, color }) => (
          <div key={name} className="bg-white rounded-xl border border-gray-200 p-5 opacity-75">
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">{name}</h3>
                <p className="text-sm text-gray-500 mb-3">{desc}</p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-primary-600">{price}</span>
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{slots}</span>
                </div>
                <button disabled className="mt-3 w-full py-2 bg-gray-200 text-gray-400 rounded-lg text-sm cursor-not-allowed font-medium">
                  準備中
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-400 text-center">広告機能は近日公開予定です。開始時にメールでお知らせします。</p>
    </div>
  )
}
