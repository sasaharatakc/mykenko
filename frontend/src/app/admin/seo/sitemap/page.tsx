'use client'

import { useState } from 'react'
import { Save, RefreshCw, ExternalLink } from 'lucide-react'
import toast from 'react-hot-toast'

type Frequency = 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'

interface ContentTypeConfig {
  enabled: boolean
  frequency: Frequency
  priority: string
}

interface SitemapForm {
  notifySearchConsole: boolean
  types: {
    products: ContentTypeConfig
    categories: ContentTypeConfig
    brands: ContentTypeConfig
    blog: ContentTypeConfig
    guide: ContentTypeConfig
    pages: ContentTypeConfig
  }
}

const FREQ_OPTIONS: Frequency[] = ['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never']
const PRIORITY_OPTIONS = ['0.1', '0.2', '0.3', '0.4', '0.5', '0.6', '0.7', '0.8', '0.9', '1.0']

const TYPE_LABELS: Record<string, string> = {
  products: '商品',
  categories: 'カテゴリ',
  brands: 'ブランド',
  blog: 'ブログ',
  guide: 'ガイド',
  pages: '固定ページ',
}

export default function AdminSitemapPage() {
  const [form, setForm] = useState<SitemapForm>({
    notifySearchConsole: true,
    types: {
      products: { enabled: true, frequency: 'daily', priority: '0.8' },
      categories: { enabled: true, frequency: 'weekly', priority: '0.6' },
      brands: { enabled: true, frequency: 'weekly', priority: '0.5' },
      blog: { enabled: true, frequency: 'weekly', priority: '0.7' },
      guide: { enabled: true, frequency: 'monthly', priority: '0.6' },
      pages: { enabled: true, frequency: 'monthly', priority: '0.5' },
    },
  })
  const [regenerating, setRegenerating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [lastGenerated] = useState('2024-01-15 03:00:00')

  async function handleRegenerate() {
    setRegenerating(true)
    await new Promise((r) => setTimeout(r, 1500))
    setRegenerating(false)
    toast.success('サイトマップを再生成しました')
  }

  async function handleSave() {
    setSaving(true)
    await new Promise((r) => setTimeout(r, 800))
    setSaving(false)
    toast.success('サイトマップ設定を保存しました')
  }

  function updateType(key: keyof SitemapForm['types'], field: keyof ContentTypeConfig, value: string | boolean) {
    setForm((prev) => ({
      ...prev,
      types: {
        ...prev.types,
        [key]: { ...prev.types[key], [field]: value },
      },
    }))
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">サイトマップ管理</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRegenerate}
            disabled={regenerating}
            className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 ${regenerating ? 'animate-spin' : ''}`} />
            {regenerating ? '生成中...' : 'サイトマップを再生成'}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 disabled:opacity-60 text-sm"
          >
            <Save className="w-4 h-4" />
            {saving ? '保存中...' : '設定を保存'}
          </button>
        </div>
      </div>

      {/* Sitemap URL */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">サイトマップURL</h2>
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 font-mono text-sm text-gray-700">
            https://mykenko.jp/sitemap.xml
          </div>
          <a href="https://mykenko.jp/sitemap.xml" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
            <ExternalLink className="w-4 h-4" />
            開く
          </a>
        </div>
        <p className="text-xs text-gray-400 mt-2">最終更新: {lastGenerated}</p>
      </div>

      {/* Content types */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">コンテンツタイプ設定</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['コンテンツ', '含める', '更新頻度', 'Priority'].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(Object.keys(form.types) as (keyof SitemapForm['types'])[]).map((key) => {
                const cfg = form.types[key]
                return (
                  <tr key={key} className="hover:bg-gray-50">
                    <td className="px-5 py-3 font-medium text-gray-900">{TYPE_LABELS[key]}</td>
                    <td className="px-5 py-3">
                      <button onClick={() => updateType(key, 'enabled', !cfg.enabled)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${cfg.enabled ? 'bg-primary' : 'bg-gray-200'}`}>
                        <span className="inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform"
                          style={{ transform: cfg.enabled ? 'translateX(18px)' : 'translateX(2px)' }} />
                      </button>
                    </td>
                    <td className="px-5 py-3">
                      <select value={cfg.frequency}
                        onChange={(e) => updateType(key, 'frequency', e.target.value as Frequency)}
                        disabled={!cfg.enabled}
                        className="border border-gray-300 rounded px-2 py-1 text-xs disabled:opacity-40">
                        {FREQ_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
                      </select>
                    </td>
                    <td className="px-5 py-3">
                      <select value={cfg.priority}
                        onChange={(e) => updateType(key, 'priority', e.target.value)}
                        disabled={!cfg.enabled}
                        className="border border-gray-300 rounded px-2 py-1 text-xs disabled:opacity-40">
                        {PRIORITY_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Search console notification */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-900">Search Console通知</h2>
            <p className="text-sm text-gray-500 mt-1">サイトマップ更新時にGoogle Search Consoleへ自動通知</p>
          </div>
          <button
            onClick={() => setForm({ ...form, notifySearchConsole: !form.notifySearchConsole })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.notifySearchConsole ? 'bg-primary' : 'bg-gray-200'}`}
          >
            <span className="inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform"
              style={{ transform: form.notifySearchConsole ? 'translateX(22px)' : 'translateX(2px)' }} />
          </button>
        </div>
      </div>
    </div>
  )
}
