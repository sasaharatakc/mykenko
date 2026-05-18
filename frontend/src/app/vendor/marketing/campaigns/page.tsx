'use client'

import { Megaphone, Plus, Calendar, Tag, Package } from 'lucide-react'

const PREVIEW_CAMPAIGNS = [
  { name: '夏のセール', period: '2024/07/01 - 2024/07/31', discount: '20%OFF', products: 12, status: 'active' },
  { name: 'ポイント2倍キャンペーン', period: '2024/06/15 - 2024/06/30', discount: 'ポイント×2', products: 0, status: 'ended' },
]

export default function VendorCampaignsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">キャンペーン管理</h1>
        <button disabled className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-400 rounded-lg text-sm font-medium cursor-not-allowed">
          <Plus className="w-4 h-4" /> キャンペーン作成
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <Megaphone className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-semibold mb-1">キャンペーン機能について</p>
          <p>セール期間を設定して商品を一括で割引できるキャンペーン機能は近日公開予定です。クーポン機能は現在利用可能です。</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="font-semibold text-gray-900">プレビュー</h2>
          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">近日公開</span>
        </div>
        <div className="space-y-3">
          {PREVIEW_CAMPAIGNS.map(c => (
            <div key={c.name} className={`flex items-center justify-between p-4 rounded-xl border ${c.status === 'active' ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'} opacity-60`}>
              <div className="flex items-center gap-4">
                <div className={`w-2 h-2 rounded-full ${c.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`} />
                <div>
                  <p className="font-medium text-sm text-gray-900">{c.name}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs text-gray-500 flex items-center gap-1"><Calendar className="w-3 h-3" />{c.period}</span>
                    <span className="text-xs text-primary-600 flex items-center gap-1"><Tag className="w-3 h-3" />{c.discount}</span>
                    <span className="text-xs text-gray-500 flex items-center gap-1"><Package className="w-3 h-3" />{c.products}商品</span>
                  </div>
                </div>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {c.status === 'active' ? '実施中' : '終了'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
