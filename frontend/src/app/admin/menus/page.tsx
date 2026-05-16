'use client'

import { useState } from 'react'
import { Info, GripVertical, Plus, ChevronRight, Edit2, Trash2, X } from 'lucide-react'

interface MenuItem {
  id: number
  label: string
  url: string
  parentId?: number
}

interface MenuSlot {
  id: string
  name: string
  items: MenuItem[]
}

const INITIAL_MENUS: MenuSlot[] = [
  {
    id: 'main',
    name: 'メインナビ',
    items: [
      { id: 1, label: 'ホーム', url: '/' },
      { id: 2, label: '商品', url: '/products' },
      { id: 3, label: 'カテゴリ', url: '/categories' },
      { id: 4, label: 'ブランド', url: '/brands' },
      { id: 5, label: 'ベンダー', url: '/vendors' },
      { id: 6, label: 'ブログ', url: '/blog' },
      { id: 7, label: 'ガイド', url: '/guide' },
      { id: 8, label: 'お問い合わせ', url: '/contact' },
    ],
  },
  {
    id: 'footer',
    name: 'フッターナビ',
    items: [
      { id: 10, label: '会社概要', url: '/about' },
      { id: 11, label: 'プライバシーポリシー', url: '/privacy' },
      { id: 12, label: '利用規約', url: '/terms' },
    ],
  },
  {
    id: 'mobile',
    name: 'モバイルナビ',
    items: [
      { id: 20, label: 'ホーム', url: '/' },
      { id: 21, label: '商品', url: '/products' },
      { id: 22, label: 'アカウント', url: '/account' },
    ],
  },
]

export default function AdminMenusPage() {
  const [menus, setMenus] = useState<MenuSlot[]>(INITIAL_MENUS)
  const [activeMenuId, setActiveMenuId] = useState('main')
  const [showAddForm, setShowAddForm] = useState(false)
  const [newItem, setNewItem] = useState({ label: '', url: '' })

  const activeMenu = menus.find((m) => m.id === activeMenuId)!

  function handleAddItem(e: React.FormEvent) {
    e.preventDefault()
    if (!newItem.label || !newItem.url) return
    setMenus((prev) =>
      prev.map((m) =>
        m.id === activeMenuId
          ? { ...m, items: [...m.items, { id: Date.now(), ...newItem }] }
          : m
      )
    )
    setNewItem({ label: '', url: '' })
    setShowAddForm(false)
  }

  function removeItem(itemId: number) {
    setMenus((prev) =>
      prev.map((m) =>
        m.id === activeMenuId
          ? { ...m, items: m.items.filter((i) => i.id !== itemId) }
          : m
      )
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">メニュー管理</h1>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-medium">開発中</span>
        </div>
      </div>

      <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-800">
        <Info className="w-4 h-4 mt-0.5 shrink-0 text-blue-500" />
        <span>この機能は近日公開予定です - メニューはコードで管理されています。</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        {/* Menu slots sidebar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 h-fit">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">メニュー選択</p>
          <div className="space-y-1">
            {menus.map((m) => (
              <button
                key={m.id}
                onClick={() => setActiveMenuId(m.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between ${
                  activeMenuId === m.id ? 'bg-primary/10 text-primary font-medium' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span>{m.name}</span>
                <span className="text-xs text-gray-400">{m.items.length}項目</span>
              </button>
            ))}
          </div>
        </div>

        {/* Menu editor */}
        <div className="md:col-span-3 space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">{activeMenu.name}</h2>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="flex items-center gap-1.5 text-sm text-primary hover:text-primary-600"
              >
                <Plus className="w-4 h-4" />
                メニュー項目追加
              </button>
            </div>

            {showAddForm && (
              <form onSubmit={handleAddItem} className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
                <p className="text-sm font-medium text-gray-700">新しい項目を追加</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">テキスト</label>
                    <input
                      type="text"
                      value={newItem.label}
                      onChange={(e) => setNewItem({ ...newItem, label: e.target.value })}
                      placeholder="例: お知らせ"
                      className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">URL</label>
                    <input
                      type="text"
                      value={newItem.url}
                      onChange={(e) => setNewItem({ ...newItem, url: e.target.value })}
                      placeholder="例: /news"
                      className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    />
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <button type="button" onClick={() => setShowAddForm(false)} className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">
                    キャンセル
                  </button>
                  <button type="submit" className="px-3 py-1.5 text-sm bg-primary text-white rounded-lg hover:bg-primary-600">
                    追加
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-2">
              {activeMenu.items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors bg-white">
                  <GripVertical className="w-4 h-4 text-gray-300 cursor-grab" aria-label="ドラッグで並び替え" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{item.label}</p>
                    <p className="text-xs text-gray-400 font-mono">{item.url}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                  <div className="flex items-center gap-1">
                    <button className="w-7 h-7 flex items-center justify-center rounded text-gray-400 hover:text-primary hover:bg-primary-50">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="w-7 h-7 flex items-center justify-center rounded text-gray-400 hover:text-red-500 hover:bg-red-50"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {activeMenu.items.length === 0 && (
              <div className="py-8 text-center text-gray-400 text-sm">
                項目がありません。上のボタンから追加してください。
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => alert('この機能は近日実装予定です')}
              className="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary-600"
            >
              変更を保存
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
