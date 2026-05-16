'use client'

import { useState } from 'react'
import { ImageIcon, Upload, X, Edit3, ToggleLeft, ToggleRight, Info } from 'lucide-react'

interface BannerSlot {
  id: string
  name: string
  location: string
  dimensions: string
  isActive: boolean
  description: string
}

const BANNER_SLOTS: BannerSlot[] = [
  {
    id: 'home_top',
    name: 'ホームページトップ',
    location: 'home_top',
    dimensions: '1920 × 600 px (推奨)',
    isActive: false,
    description: 'サイトのメインビジュアル。最も目立つ位置です。',
  },
  {
    id: 'home_middle',
    name: 'ホームページ中段',
    location: 'home_middle',
    dimensions: '1200 × 400 px (推奨)',
    isActive: false,
    description: 'プロモーションや特集コンテンツの表示に最適です。',
  },
  {
    id: 'category_page',
    name: 'カテゴリページ',
    location: 'category_page',
    dimensions: '1200 × 300 px (推奨)',
    isActive: false,
    description: '各カテゴリページの上部に表示されます。',
  },
  {
    id: 'popup',
    name: 'ポップアップ',
    location: 'popup',
    dimensions: '600 × 500 px (推奨)',
    isActive: false,
    description: 'サイト訪問時に表示されるポップアップバナーです。',
  },
]

export default function AdminBannersPage() {
  const [slots, setSlots] = useState<BannerSlot[]>(BANNER_SLOTS)
  const [editingSlot, setEditingSlot] = useState<BannerSlot | null>(null)

  function toggleActive(id: string) {
    setSlots((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isActive: !s.isActive } : s))
    )
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">バナー管理</h1>
      </div>

      {/* Info card */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-amber-800 mb-1">バナー管理について</p>
          <p className="text-sm text-amber-700">
            各バナースロットにプロモーション画像を設定できます。画像はJPG・PNG・WebP形式に対応予定です。
            バナーのアップロード機能は近日公開予定です。
          </p>
        </div>
      </div>

      {/* Banner slot grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {slots.map((slot) => (
          <div
            key={slot.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
          >
            {/* Banner preview area */}
            <div className="relative bg-gray-100 h-40 flex flex-col items-center justify-center">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjZjFmNWY5Ii8+PHJlY3QgeD0iMTAiIHk9IjEwIiB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIGZpbGw9IiNmMWY1ZjkiLz48cmVjdCB4PSIxMCIgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjZTJlOGYwIi8+PHJlY3QgeT0iMTAiIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIgZmlsbD0iI2UyZThmMCIvPjwvc3ZnPg==')] opacity-50" />
              <ImageIcon className="w-10 h-10 text-gray-300 relative z-10 mb-2" />
              <p className="text-xs text-gray-400 relative z-10">{slot.dimensions}</p>
              <label className="relative z-10 mt-2 flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs text-gray-600 hover:bg-gray-50 cursor-pointer shadow-sm">
                <Upload className="w-3 h-3" />
                画像をアップロード（近日公開）
                <input type="file" className="hidden" disabled />
              </label>
            </div>

            {/* Slot info */}
            <div className="p-4">
              <div className="flex items-start justify-between mb-1">
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">{slot.name}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{slot.description}</p>
                </div>
                <button
                  onClick={() => toggleActive(slot.id)}
                  className="flex-shrink-0 ml-3"
                  title={slot.isActive ? '無効にする' : '有効にする'}
                >
                  {slot.isActive ? (
                    <ToggleRight className="w-6 h-6 text-primary" />
                  ) : (
                    <ToggleLeft className="w-6 h-6 text-gray-400" />
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between mt-3">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    slot.isActive
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {slot.isActive ? 'アクティブ' : '非アクティブ'}
                </span>
                <button
                  onClick={() => setEditingSlot(slot)}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-lg text-xs text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <Edit3 className="w-3 h-3" />
                  バナーを編集
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit modal */}
      {editingSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900">
                {editingSlot.name} — バナー編集
              </h2>
              <button
                onClick={() => setEditingSlot(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Upload area */}
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
              <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-700 mb-1">
                画像をドラッグ＆ドロップ
              </p>
              <p className="text-xs text-gray-400 mb-3">
                または クリックして選択
              </p>
              <p className="text-xs text-gray-400">
                推奨サイズ: {editingSlot.dimensions}
              </p>
              <p className="text-xs text-gray-400">
                対応形式: JPG, PNG, WebP（最大 5MB）
              </p>
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  リンク先URL（任意）
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/campaign"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  代替テキスト
                </label>
                <input
                  type="text"
                  placeholder="バナーの説明"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  disabled
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setEditingSlot(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
              >
                閉じる
              </button>
              <button
                disabled
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm opacity-50 cursor-not-allowed"
              >
                保存（近日公開）
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
