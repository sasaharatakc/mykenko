'use client'

import { useState } from 'react'
import { Plus, Search, Tag, X, Info, Layers } from 'lucide-react'

type VariantType = 'サイズ' | 'カラー' | 'その他'

interface VariantForm {
  productName: string
  variantType: VariantType
  values: string
}

const VARIANT_TYPE_COLORS: Record<VariantType, string> = {
  'サイズ': 'bg-blue-100 text-blue-700',
  'カラー': 'bg-pink-100 text-pink-700',
  'その他': 'bg-gray-100 text-gray-600',
}

export default function AdminVariantsPage() {
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState<VariantForm>({
    productName: '',
    variantType: 'サイズ',
    values: '',
  })

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">バリアント管理</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          バリアント追加
        </button>
      </div>

      {/* Info card */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-blue-800 mb-1">バリアント機能について</p>
          <p className="text-sm text-blue-700">
            商品バリアントを使用すると、同一商品のサイズ・カラー・その他の選択肢を管理できます。
            例：Mサイズ・Lサイズ、赤・青・白など。この機能は近日公開予定です。
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="商品名またはバリアントタイプで検索..."
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['商品名', 'バリアントタイプ', '値', '作成日', ''].map((h) => (
                  <th
                    key={h}
                    className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Ghost skeleton rows indicating future data */}
              {[...Array(5)].map((_, i) => (
                <tr key={i} className="border-b border-gray-50">
                  <td className="px-5 py-3">
                    <div className="h-4 bg-gray-100 rounded w-32 animate-pulse" />
                  </td>
                  <td className="px-5 py-3">
                    <div className="h-5 bg-gray-100 rounded-full w-16 animate-pulse" />
                  </td>
                  <td className="px-5 py-3">
                    <div className="h-4 bg-gray-100 rounded w-48 animate-pulse" />
                  </td>
                  <td className="px-5 py-3">
                    <div className="h-4 bg-gray-100 rounded w-24 animate-pulse" />
                  </td>
                  <td className="px-5 py-3">
                    <div className="h-4 bg-gray-100 rounded w-12 animate-pulse" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty state */}
        <div className="py-14 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gray-100 mb-4">
            <Layers className="w-7 h-7 text-gray-400" />
          </div>
          <p className="text-base font-semibold text-gray-700 mb-1">この機能は近日公開予定です</p>
          <p className="text-sm text-gray-400 max-w-sm mx-auto">
            商品バリアント管理機能は現在開発中です。準備ができ次第、ご利用いただけます。
          </p>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900">バリアント追加</h2>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Product select */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  商品選択
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-gray-400"
                  disabled
                >
                  <option>商品を選択してください（近日公開）</option>
                </select>
              </div>

              {/* Variant type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  バリアントタイプ
                </label>
                <select
                  value={form.variantType}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, variantType: e.target.value as VariantType }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="サイズ">サイズ</option>
                  <option value="カラー">カラー</option>
                  <option value="その他">その他</option>
                </select>
              </div>

              {/* Values */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  値
                </label>
                <input
                  type="text"
                  value={form.values}
                  onChange={(e) => setForm((f) => ({ ...f, values: e.target.value }))}
                  placeholder="例: S, M, L, XL（カンマ区切り）"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <p className="mt-1 text-xs text-gray-400 flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  カンマ（,）で複数の値を区切ってください
                </p>
                {form.values && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {form.values.split(',').map((v) => v.trim()).filter(Boolean).map((tag) => (
                      <span
                        key={tag}
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${VARIANT_TYPE_COLORS[form.variantType]}`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
              >
                キャンセル
              </button>
              <button
                disabled
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm opacity-50 cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
                保存（近日公開）
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
