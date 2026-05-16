'use client'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { adminApi } from '@/lib/api'
import { Save, Sun, Moon, Monitor } from 'lucide-react'
import toast from 'react-hot-toast'

type ThemeMode = 'light' | 'dark' | 'system'
type BorderRadius = 'none' | 'sm' | 'md' | 'lg'

interface ThemeForm {
  primaryColor: string
  secondaryColor: string
  accentColor: string
  mode: ThemeMode
  borderRadius: BorderRadius
}

export default function AdminThemePage() {
  const [form, setForm] = useState<ThemeForm>({
    primaryColor: '#0ea5e9',
    secondaryColor: '#64748b',
    accentColor: '#f59e0b',
    mode: 'light',
    borderRadius: 'md',
  })

  const mutation = useMutation({
    mutationFn: () => adminApi.updateSettings({ theme: form }),
    onSuccess: () => toast.success('テーマ設定を保存しました'),
    onError: () => toast.error('保存に失敗しました'),
  })

  const borderRadiusOptions: { value: BorderRadius; label: string; preview: string }[] = [
    { value: 'none', label: 'なし', preview: 'rounded-none' },
    { value: 'sm', label: '小', preview: 'rounded-sm' },
    { value: 'md', label: '中', preview: 'rounded-md' },
    { value: 'lg', label: '大', preview: 'rounded-xl' },
  ]

  const modeOptions: { value: ThemeMode; label: string; icon: React.ReactNode }[] = [
    { value: 'light', label: 'ライト', icon: <Sun className="w-4 h-4" /> },
    { value: 'dark', label: 'ダーク', icon: <Moon className="w-4 h-4" /> },
    { value: 'system', label: 'システム', icon: <Monitor className="w-4 h-4" /> },
  ]

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">テーマ設定</h1>
        <button
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 disabled:opacity-60 text-sm"
        >
          <Save className="w-4 h-4" />
          {mutation.isPending ? '保存中...' : '設定を保存'}
        </button>
      </div>

      <div className="space-y-4">
        {/* Theme colors */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">テーマカラー</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { key: 'primaryColor' as const, label: 'プライマリカラー' },
              { key: 'secondaryColor' as const, label: 'セカンダリカラー' },
              { key: 'accentColor' as const, label: 'アクセントカラー' },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg border-2 border-gray-200 cursor-pointer overflow-hidden relative"
                    style={{ backgroundColor: form[key] }}
                  >
                    <input
                      type="color"
                      value={form[key]}
                      onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                  <input
                    type="text"
                    value={form[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    placeholder="#000000"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Theme mode */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">テーマモード</h2>
          <div className="flex gap-3">
            {modeOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setForm({ ...form, mode: opt.value })}
                className={`flex-1 flex items-center justify-center gap-2 py-3 border-2 rounded-xl transition-colors text-sm font-medium ${
                  form.mode === opt.value
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                {opt.icon}
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Border radius */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">ボーダー半径</h2>
          <div className="flex gap-4">
            {borderRadiusOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setForm({ ...form, borderRadius: opt.value })}
                className={`flex flex-col items-center gap-2 p-4 border-2 rounded-xl transition-colors ${
                  form.borderRadius === opt.value
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div
                  className={`w-10 h-10 bg-gray-300 ${opt.preview}`}
                />
                <span className={`text-xs font-medium ${form.borderRadius === opt.value ? 'text-primary' : 'text-gray-600'}`}>
                  {opt.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Logo settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">ロゴ設定</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: 'ファビコン', hint: '32×32 px推奨' },
              { label: 'ロゴ（ライト）', hint: '白背景用' },
              { label: 'ロゴ（ダーク）', hint: '黒背景用' },
            ].map(({ label, hint }) => (
              <div key={label}>
                <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-gray-400 cursor-pointer transition-colors">
                  <div className="w-8 h-8 bg-gray-200 rounded mx-auto mb-2" />
                  <p className="text-xs text-gray-500">クリックしてアップロード</p>
                  <p className="text-xs text-gray-400 mt-1">{hint}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
