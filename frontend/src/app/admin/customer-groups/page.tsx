'use client'

import { useState } from 'react'
import { Users, Plus, X, Info, Star, RefreshCw, UserPlus, Stethoscope } from 'lucide-react'

interface GroupForm {
  name: string
  description: string
  conditionType: 'order_count' | 'order_amount'
  conditionValue: string
}

const PRESET_GROUPS = [
  {
    name: 'VIP',
    description: '高額・高頻度購入者',
    icon: <Star className="w-5 h-5 text-yellow-500" />,
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    badge: 'bg-yellow-100 text-yellow-700',
  },
  {
    name: 'リピーター',
    description: '複数回購入した顧客',
    icon: <RefreshCw className="w-5 h-5 text-blue-500" />,
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    badge: 'bg-blue-100 text-blue-700',
  },
  {
    name: '新規顧客',
    description: '初回購入者',
    icon: <UserPlus className="w-5 h-5 text-green-500" />,
    bg: 'bg-green-50',
    border: 'border-green-200',
    badge: 'bg-green-100 text-green-700',
  },
  {
    name: '医療従事者',
    description: '医療・介護関係の顧客',
    icon: <Stethoscope className="w-5 h-5 text-purple-500" />,
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    badge: 'bg-purple-100 text-purple-700',
  },
]

export default function AdminCustomerGroupsPage() {
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState<GroupForm>({
    name: '',
    description: '',
    conditionType: 'order_count',
    conditionValue: '',
  })

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">顧客グループ</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          グループ作成
        </button>
      </div>

      {/* Info card */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-indigo-500 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-indigo-800 mb-1">
            顧客グループを使用してターゲットマーケティングを実現します
          </p>
          <p className="text-sm text-indigo-700">
            顧客をグループ分けすることで、特定のセグメントへの割引提供、メール配信、
            専用コンテンツの表示などが可能になります。この機能は近日公開予定です。
          </p>
        </div>
      </div>

      {/* Planned group types */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          対応予定のグループタイプ
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {PRESET_GROUPS.map((g) => (
            <div
              key={g.name}
              className={`${g.bg} ${g.border} border rounded-xl p-4 flex flex-col items-center text-center gap-2`}
            >
              {g.icon}
              <p className="text-sm font-semibold text-gray-800">{g.name}</p>
              <p className="text-xs text-gray-500">{g.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Ghost table preview */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-700">グループ一覧</p>
          <span className="text-xs text-gray-400">（近日公開）</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['グループ名', '説明', '条件', 'メンバー数', '作成日', '操作'].map((h) => (
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
              {[...Array(4)].map((_, i) => (
                <tr key={i} className="border-b border-gray-50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-gray-100 rounded-full animate-pulse" />
                      <div className="h-4 bg-gray-100 rounded w-20 animate-pulse" />
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="h-4 bg-gray-100 rounded w-36 animate-pulse" />
                  </td>
                  <td className="px-5 py-3">
                    <div className="h-4 bg-gray-100 rounded w-24 animate-pulse" />
                  </td>
                  <td className="px-5 py-3">
                    <div className="h-4 bg-gray-100 rounded w-12 animate-pulse" />
                  </td>
                  <td className="px-5 py-3">
                    <div className="h-4 bg-gray-100 rounded w-20 animate-pulse" />
                  </td>
                  <td className="px-5 py-3">
                    <div className="h-4 bg-gray-100 rounded w-16 animate-pulse" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="py-10 text-center">
          <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-gray-600 mb-1">この機能は近日公開予定です</p>
          <p className="text-xs text-gray-400">
            グループが作成されるとここに表示されます
          </p>
        </div>
      </div>

      {/* Create group modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900">グループ作成</h2>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  グループ名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="例: VIP顧客"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">説明</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="このグループの説明を入力してください"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">条件</label>
                <div className="flex gap-2">
                  <select
                    value={form.conditionType}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        conditionType: e.target.value as GroupForm['conditionType'],
                      }))
                    }
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="order_count">注文数が以上</option>
                    <option value="order_amount">注文金額が以上（¥）</option>
                  </select>
                  <input
                    type="number"
                    min={0}
                    value={form.conditionValue}
                    onChange={(e) => setForm((f) => ({ ...f, conditionValue: e.target.value }))}
                    placeholder={form.conditionType === 'order_count' ? '回数' : '金額'}
                    className="w-28 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
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
                作成（近日公開）
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
