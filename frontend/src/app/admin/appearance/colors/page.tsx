'use client'

import { useState } from 'react'
import { Save, RotateCcw } from 'lucide-react'
import toast from 'react-hot-toast'

interface ColorSet {
  primary: string[]
  secondary: string
  success: string
  warning: string
  error: string
  textPrimary: string
  textSecondary: string
  bgPrimary: string
  bgSecondary: string
}

const DEFAULT_COLORS: ColorSet = {
  primary: ['#e0f2fe', '#bae6fd', '#7dd3fc', '#38bdf8', '#0ea5e9', '#0284c7', '#0369a1'],
  secondary: '#64748b',
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  textPrimary: '#111827',
  textSecondary: '#6b7280',
  bgPrimary: '#ffffff',
  bgSecondary: '#f9fafb',
}

export default function AdminColorsPage() {
  const [colors, setColors] = useState<ColorSet>(DEFAULT_COLORS)
  const [saving, setSaving] = useState(false)

  function setPrimary(idx: number, val: string) {
    const p = [...colors.primary]
    p[idx] = val
    setColors({ ...colors, primary: p })
  }

  async function handleSave() {
    setSaving(true)
    await new Promise((r) => setTimeout(r, 800))
    setSaving(false)
    toast.success('カラー設定を保存しました')
  }

  function handleReset() {
    setColors(DEFAULT_COLORS)
    toast.success('デフォルトに戻しました')
  }

  const primaryLabels = ['50', '100', '200', '300', '400 (main)', '500 (hover)', '600']

  const singleColors: [keyof Omit<ColorSet, 'primary'>, string][] = [
    ['secondary', 'セカンダリ'],
    ['success', '成功'],
    ['warning', '警告'],
    ['error', 'エラー'],
    ['textPrimary', 'テキスト（メイン）'],
    ['textSecondary', 'テキスト（サブ）'],
    ['bgPrimary', '背景（メイン）'],
    ['bgSecondary', '背景（サブ）'],
  ]

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">カラー設定</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
          >
            <RotateCcw className="w-4 h-4" />
            デフォルトに戻す
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 disabled:opacity-60 text-sm"
          >
            <Save className="w-4 h-4" />
            {saving ? '保存中...' : 'テーマに適用'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-4">
          {/* Primary palette */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">プライマリカラー（7段階）</h2>
            <div className="space-y-3">
              {colors.primary.map((c, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-6 text-right">
                    <span className="text-xs text-gray-400">{primaryLabels[i]?.split(' ')[0]}</span>
                  </div>
                  <div className="w-8 h-8 rounded-lg border border-gray-200 overflow-hidden relative flex-shrink-0" style={{ backgroundColor: c }}>
                    <input type="color" value={c} onChange={(e) => setPrimary(i, e.target.value)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  </div>
                  <input type="text" value={c} onChange={(e) => setPrimary(i, e.target.value)}
                    className="w-32 border border-gray-300 rounded-lg px-2 py-1.5 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                  <div className="flex-1 h-8 rounded" style={{ backgroundColor: c }} />
                  {primaryLabels[i]?.includes('(') && (
                    <span className="text-xs text-gray-400 whitespace-nowrap">{primaryLabels[i].split(' ').slice(1).join(' ')}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Other colors */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">その他のカラー</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {singleColors.map(([key, label]) => (
                <div key={key} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg border border-gray-200 overflow-hidden relative flex-shrink-0"
                    style={{ backgroundColor: colors[key] as string }}>
                    <input type="color" value={colors[key] as string}
                      onChange={(e) => setColors({ ...colors, [key]: e.target.value })}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-700">{label}</p>
                    <input type="text" value={colors[key] as string}
                      onChange={(e) => setColors({ ...colors, [key]: e.target.value })}
                      className="w-full border border-gray-300 rounded px-2 py-1 text-xs font-mono mt-1 focus:outline-none focus:ring-1 focus:ring-primary/30" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Live preview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-fit">
          <h2 className="font-semibold text-gray-900 mb-4">ライブプレビュー</h2>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-gray-500 mb-2">ボタン</p>
              <div className="flex flex-wrap gap-2">
                <button className="px-4 py-2 rounded-lg text-sm text-white font-medium" style={{ backgroundColor: colors.primary[4] }}>
                  プライマリ
                </button>
                <button className="px-4 py-2 rounded-lg text-sm text-white font-medium" style={{ backgroundColor: colors.secondary }}>
                  セカンダリ
                </button>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-2">バッジ</p>
              <div className="flex flex-wrap gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium text-white" style={{ backgroundColor: colors.success }}>成功</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium text-white" style={{ backgroundColor: colors.warning }}>警告</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium text-white" style={{ backgroundColor: colors.error }}>エラー</span>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-2">テキスト</p>
              <p className="text-sm font-medium" style={{ color: colors.textPrimary }}>メインテキスト</p>
              <p className="text-sm" style={{ color: colors.textSecondary }}>サブテキスト</p>
              <a href="#" className="text-sm" style={{ color: colors.primary[4] }}>リンクテキスト</a>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-2">背景</p>
              <div className="flex gap-2">
                <div className="flex-1 h-8 rounded border border-gray-200" style={{ backgroundColor: colors.bgPrimary }} />
                <div className="flex-1 h-8 rounded border border-gray-200" style={{ backgroundColor: colors.bgSecondary }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
