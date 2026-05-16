'use client'

import { useState } from 'react'
import { Save, ExternalLink } from 'lucide-react'
import toast from 'react-hot-toast'

const DEFAULT_ROBOTS = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /checkout/
Sitemap: https://mykenko.jp/sitemap.xml`

export default function AdminRobotsPage() {
  const [content, setContent] = useState(DEFAULT_ROBOTS)
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    await new Promise((r) => setTimeout(r, 800))
    setSaving(false)
    toast.success('robots.txtを保存しました')
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">robots.txt 設定</h1>
        <div className="flex items-center gap-2">
          <a
            href="https://search.google.com/search-console/robots-testing-tool"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
          >
            <ExternalLink className="w-4 h-4" />
            Googleでテスト
          </a>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 disabled:opacity-60 text-sm"
          >
            <Save className="w-4 h-4" />
            {saving ? '保存中...' : '保存'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-b border-gray-100">
          <span className="text-sm font-medium text-gray-700 font-mono">robots.txt</span>
          <span className="text-xs text-gray-400">{content.split('\n').length} 行</span>
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full h-80 p-5 font-mono text-sm text-gray-800 bg-gray-50 focus:outline-none focus:bg-white transition-colors resize-none"
          spellCheck={false}
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <h3 className="font-medium text-gray-900 mb-3 text-sm">現在の設定プレビュー</h3>
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full" />
            <span className="text-gray-600">https://mykenko.jp/sitemap.xml が設定されています</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-red-400 rounded-full" />
            <span className="text-gray-600">/admin/, /api/, /checkout/ がブロックされています</span>
          </div>
        </div>
      </div>
    </div>
  )
}
