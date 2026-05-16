'use client'

import { useState } from 'react'
import { Save, GripVertical, Package, FileText, Mail, Tag, Star } from 'lucide-react'
import toast from 'react-hot-toast'

interface Widget {
  id: string
  name: string
  icon: React.ReactNode
  enabled: boolean
}

interface WidgetPosition {
  id: string
  name: string
  widgets: Widget[]
}

const ICON_MAP: Record<string, React.ReactNode> = {
  popular: <Package className="w-4 h-4" />,
  blog: <FileText className="w-4 h-4" />,
  newsletter: <Mail className="w-4 h-4" />,
  categories: <Tag className="w-4 h-4" />,
  brands: <Star className="w-4 h-4" />,
}

const INITIAL_POSITIONS: WidgetPosition[] = [
  {
    id: 'sidebar',
    name: 'サイドバー',
    widgets: [
      { id: 'popular', name: '人気商品', icon: ICON_MAP.popular, enabled: true },
      { id: 'categories', name: 'カテゴリ一覧', icon: ICON_MAP.categories, enabled: true },
      { id: 'brands', name: 'ブランド一覧', icon: ICON_MAP.brands, enabled: false },
    ],
  },
  {
    id: 'footer-top',
    name: 'フッター上部',
    widgets: [
      { id: 'newsletter', name: 'ニュースレター登録', icon: ICON_MAP.newsletter, enabled: true },
      { id: 'blog', name: '最新ブログ', icon: ICON_MAP.blog, enabled: true },
    ],
  },
  {
    id: 'popup',
    name: 'ポップアップ',
    widgets: [
      { id: 'newsletter-popup', name: 'ニュースレター登録', icon: ICON_MAP.newsletter, enabled: false },
    ],
  },
]

export default function AdminWidgetsPage() {
  const [positions, setPositions] = useState<WidgetPosition[]>(INITIAL_POSITIONS)
  const [activePos, setActivePos] = useState('sidebar')
  const [saving, setSaving] = useState(false)

  function toggleWidget(posId: string, widgetId: string) {
    setPositions((prev) =>
      prev.map((p) =>
        p.id === posId
          ? { ...p, widgets: p.widgets.map((w) => w.id === widgetId ? { ...w, enabled: !w.enabled } : w) }
          : p
      )
    )
  }

  async function handleSave() {
    setSaving(true)
    await new Promise((r) => setTimeout(r, 800))
    setSaving(false)
    toast.success('ウィジェット設定を保存しました')
  }

  const activePosData = positions.find((p) => p.id === activePos)!

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">ウィジェット設定</h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 disabled:opacity-60 text-sm"
        >
          <Save className="w-4 h-4" />
          {saving ? '保存中...' : '設定を保存'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        {/* Position selector */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 h-fit">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">表示位置</p>
          <div className="space-y-1">
            {positions.map((pos) => (
              <button
                key={pos.id}
                onClick={() => setActivePos(pos.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between ${
                  activePos === pos.id ? 'bg-primary/10 text-primary font-medium' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span>{pos.name}</span>
                <span className="text-xs text-gray-400">{pos.widgets.filter((w) => w.enabled).length}/{pos.widgets.length}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Widgets list */}
        <div className="md:col-span-3 bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">{activePosData.name} のウィジェット</h2>
          <div className="space-y-3">
            {activePosData.widgets.map((widget) => (
              <div
                key={widget.id}
                className={`flex items-center gap-3 p-4 border-2 rounded-xl transition-colors ${
                  widget.enabled ? 'border-primary/20 bg-primary/5' : 'border-gray-200'
                }`}
              >
                <GripVertical className="w-4 h-4 text-gray-300 cursor-grab" aria-label="ドラッグで並び替え" />
                <div className={`p-2 rounded-lg ${widget.enabled ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-400'}`}>
                  {widget.icon}
                </div>
                <span className={`flex-1 text-sm font-medium ${widget.enabled ? 'text-gray-900' : 'text-gray-400'}`}>
                  {widget.name}
                </span>
                <button
                  onClick={() => toggleWidget(activePos, widget.id)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    widget.enabled ? 'bg-primary' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className="inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform"
                    style={{ transform: widget.enabled ? 'translateX(22px)' : 'translateX(2px)' }}
                  />
                </button>
              </div>
            ))}
            {activePosData.widgets.length === 0 && (
              <div className="py-8 text-center text-gray-400 text-sm">
                このポジションにはウィジェットがありません
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
