'use client'

import { useState } from 'react'
import { Save } from 'lucide-react'
import toast from 'react-hot-toast'

const FONTS = [
  'Inter',
  'Noto Sans JP',
  'Roboto',
  'Open Sans',
  'Lato',
  'Montserrat',
  'Poppins',
  'Source Sans Pro',
]

interface TypographyForm {
  bodyFont: string
  headingFont: string
  baseFontSize: number
  lineHeight: number
  letterSpacing: number
}

export default function AdminTypographyPage() {
  const [form, setForm] = useState<TypographyForm>({
    bodyFont: 'Noto Sans JP',
    headingFont: 'Inter',
    baseFontSize: 16,
    lineHeight: 1.6,
    letterSpacing: 0,
  })
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    await new Promise((r) => setTimeout(r, 800))
    setSaving(false)
    toast.success('タイポグラフィ設定を保存しました')
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">タイポグラフィ設定</h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 disabled:opacity-60 text-sm"
        >
          <Save className="w-4 h-4" />
          {saving ? '保存中...' : '設定を保存'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-4">
          {/* Font selection */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">フォント選択</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">本文フォント</label>
                <select
                  value={form.bodyFont}
                  onChange={(e) => setForm({ ...form, bodyFont: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                >
                  {FONTS.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">見出しフォント（ディスプレイ）</label>
                <select
                  value={form.headingFont}
                  onChange={(e) => setForm({ ...form, headingFont: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                >
                  {FONTS.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Size & spacing */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">サイズ & スペーシング</h2>
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">ベースフォントサイズ</label>
                  <span className="text-sm font-mono text-primary">{form.baseFontSize}px</span>
                </div>
                <input
                  type="range"
                  min={14}
                  max={18}
                  step={1}
                  value={form.baseFontSize}
                  onChange={(e) => setForm({ ...form, baseFontSize: Number(e.target.value) })}
                  className="w-full accent-primary"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>14px (小)</span>
                  <span>16px (標準)</span>
                  <span>18px (大)</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">行の高さ</label>
                  <span className="text-sm font-mono text-primary">{form.lineHeight.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min={1.4}
                  max={2.0}
                  step={0.1}
                  value={form.lineHeight}
                  onChange={(e) => setForm({ ...form, lineHeight: Number(e.target.value) })}
                  className="w-full accent-primary"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>1.4 (詰める)</span>
                  <span>1.6 (標準)</span>
                  <span>2.0 (広げる)</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">文字間隔</label>
                  <span className="text-sm font-mono text-primary">{form.letterSpacing >= 0 ? '+' : ''}{form.letterSpacing}em</span>
                </div>
                <input
                  type="range"
                  min={-0.05}
                  max={0.2}
                  step={0.01}
                  value={form.letterSpacing}
                  onChange={(e) => setForm({ ...form, letterSpacing: Number(e.target.value) })}
                  className="w-full accent-primary"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>詰める</span>
                  <span>標準</span>
                  <span>広げる</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-fit">
          <h2 className="font-semibold text-gray-900 mb-4">プレビュー</h2>
          <div
            style={{
              fontSize: `${form.baseFontSize}px`,
              lineHeight: form.lineHeight,
              letterSpacing: `${form.letterSpacing}em`,
            }}
            className="space-y-3"
          >
            <p style={{ fontFamily: form.headingFont, fontWeight: 700, fontSize: '1.5em' }}>
              見出しテキスト
            </p>
            <p style={{ fontFamily: form.headingFont, fontWeight: 600, fontSize: '1.2em' }}>
              サブ見出しテキスト
            </p>
            <p style={{ fontFamily: form.bodyFont }} className="text-gray-700">
              本文テキストのサンプルです。MYKENKO（マイケンコー）は日本の医療個人輸入マーケットプレイスです。
            </p>
            <p style={{ fontFamily: form.bodyFont }} className="text-gray-500 text-sm">
              補足テキストのサンプルです。小さめのフォントサイズで表示されます。
            </p>
            <a href="#" className="text-primary text-sm" style={{ fontFamily: form.bodyFont }}>
              リンクテキストのサンプル →
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
