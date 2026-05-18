'use client'

import { GitBranch, Clock, Palette, Ruler, FlaskConical } from 'lucide-react'

export default function VendorVariantsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="font-display text-2xl font-bold text-gray-900">バリアント管理</h1>
        <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 font-medium">
          <Clock className="w-3 h-3" />
          近日公開予定
        </span>
      </div>

      {/* Info card */}
      <div className="card p-6 border-l-4 border-primary-500 bg-primary-50/30">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
            <GitBranch className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 mb-1">バリアント機能とは？</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              バリアント機能を使うと、1つの商品に対してサイズ・カラー・容量などの
              バリエーションを管理できます。各バリアントには個別の価格・在庫・SKUを
              設定することが可能です。
            </p>
          </div>
        </div>
      </div>

      {/* Feature highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { Icon: Palette, label: 'カラーバリアント', desc: '複数カラーを1商品で管理', color: 'bg-pink-50 text-pink-600' },
          { Icon: Ruler, label: 'サイズバリアント', desc: 'S/M/L/XLなどサイズ展開', color: 'bg-blue-50 text-blue-600' },
          { Icon: FlaskConical, label: '容量バリアント', desc: '50ml/100ml/200mlなど', color: 'bg-purple-50 text-purple-600' },
        ].map(({ Icon, label, desc, color }) => (
          <div key={label} className="card p-5">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${color}`}>
              <Icon className="w-4 h-4" />
            </div>
            <h3 className="font-medium text-gray-900 text-sm">{label}</h3>
            <p className="text-xs text-gray-500 mt-1">{desc}</p>
          </div>
        ))}
      </div>

      {/* Preview skeleton */}
      <div className="card overflow-hidden opacity-50">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">バリアント一覧（プレビュー）</h2>
          <div className="h-8 w-32 skeleton rounded-lg" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['商品名', 'バリアント', 'SKU', '価格', '在庫', 'ステータス'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[...Array(4)].map((_, i) => (
                <tr key={i}>
                  {[...Array(6)].map((_, j) => (
                    <td key={j} className="px-5 py-3">
                      <div className="h-4 skeleton rounded" style={{ width: `${60 + (j * 10) % 40}%` }} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-center py-6">
        <p className="text-sm text-gray-500">
          バリアント機能は現在開発中です。公開をお楽しみに。
        </p>
      </div>
    </div>
  )
}
