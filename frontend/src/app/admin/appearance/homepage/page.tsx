'use client'

import { useState } from 'react'
import { Save, Settings, ChevronUp, ChevronDown, Plus } from 'lucide-react'
import toast from 'react-hot-toast'

interface Section {
  id: string
  name: string
  visible: boolean
  order: number
}

const INITIAL_SECTIONS: Section[] = [
  { id: 'hero', name: 'ヒーロースライダー', visible: true, order: 1 },
  { id: 'featured-categories', name: '注目カテゴリ', visible: true, order: 2 },
  { id: 'trending', name: 'トレンド商品', visible: true, order: 3 },
  { id: 'popular', name: '人気商品', visible: true, order: 4 },
  { id: 'new-arrivals', name: '新着商品', visible: true, order: 5 },
  { id: 'sale', name: 'セール商品', visible: false, order: 6 },
  { id: 'brands', name: 'ブランドカルーセル', visible: true, order: 7 },
  { id: 'guide', name: 'ガイド記事', visible: true, order: 8 },
  { id: 'blog', name: 'ブログ記事', visible: true, order: 9 },
  { id: 'faq', name: 'FAQセクション', visible: false, order: 10 },
  { id: 'cta', name: 'CTAバナー', visible: true, order: 11 },
]

export default function AdminHomepagePage() {
  const [sections, setSections] = useState<Section[]>(INITIAL_SECTIONS)
  const [saving, setSaving] = useState(false)

  function moveUp(id: string) {
    setSections((prev) => {
      const sorted = [...prev].sort((a, b) => a.order - b.order)
      const idx = sorted.findIndex((s) => s.id === id)
      if (idx <= 0) return prev
      const newArr = [...sorted]
      ;[newArr[idx - 1].order, newArr[idx].order] = [newArr[idx].order, newArr[idx - 1].order]
      return newArr
    })
  }

  function moveDown(id: string) {
    setSections((prev) => {
      const sorted = [...prev].sort((a, b) => a.order - b.order)
      const idx = sorted.findIndex((s) => s.id === id)
      if (idx >= sorted.length - 1) return prev
      const newArr = [...sorted]
      ;[newArr[idx].order, newArr[idx + 1].order] = [newArr[idx + 1].order, newArr[idx].order]
      return newArr
    })
  }

  function toggleVisible(id: string) {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, visible: !s.visible } : s))
    )
  }

  async function handleSave() {
    setSaving(true)
    await new Promise((r) => setTimeout(r, 800))
    setSaving(false)
    toast.success('ホームページ設定を保存しました')
  }

  const sorted = [...sections].sort((a, b) => a.order - b.order)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">ホームページ設定</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => toast('セクション追加は近日実装予定です')}
            className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
          >
            <Plus className="w-4 h-4" />
            セクション追加
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 disabled:opacity-60 text-sm"
          >
            <Save className="w-4 h-4" />
            {saving ? '保存中...' : '変更を保存'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider grid grid-cols-12">
          <span className="col-span-1">順番</span>
          <span className="col-span-7">セクション名</span>
          <span className="col-span-2">表示</span>
          <span className="col-span-2 text-right">操作</span>
        </div>
        <div className="divide-y divide-gray-100">
          {sorted.map((section, idx) => (
            <div key={section.id} className="grid grid-cols-12 items-center px-5 py-4 hover:bg-gray-50">
              <span className="col-span-1 text-gray-400 text-sm font-mono">{idx + 1}</span>
              <div className="col-span-7">
                <span className={`text-sm font-medium ${section.visible ? 'text-gray-900' : 'text-gray-400'}`}>
                  {section.name}
                </span>
              </div>
              <div className="col-span-2">
                <button
                  onClick={() => toggleVisible(section.id)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    section.visible ? 'bg-primary' : 'bg-gray-200'
                  }`}
                >
                  <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform shadow-sm ${
                    section.visible ? 'translate-x-4.5' : 'translate-x-0.5'
                  }`} style={{ transform: section.visible ? 'translateX(18px)' : 'translateX(2px)' }} />
                </button>
              </div>
              <div className="col-span-2 flex items-center justify-end gap-1">
                <button
                  onClick={() => moveUp(section.id)}
                  disabled={idx === 0}
                  className="w-7 h-7 flex items-center justify-center rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  onClick={() => moveDown(section.id)}
                  disabled={idx === sorted.length - 1}
                  className="w-7 h-7 flex items-center justify-center rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
                <button
                  onClick={() => toast('設定は近日実装予定です')}
                  className="w-7 h-7 flex items-center justify-center rounded text-gray-400 hover:text-primary hover:bg-primary-50"
                >
                  <Settings className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
