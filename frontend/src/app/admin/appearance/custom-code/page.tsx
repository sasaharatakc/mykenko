'use client'

import { useState } from 'react'
import { Save, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'

type Tab = 'css' | 'js'

export default function AdminCustomCodePage() {
  const [tab, setTab] = useState<Tab>('css')
  const [css, setCss] = useState('/* カスタムCSSをここに入力 */')
  const [js, setJs] = useState('// カスタムJavaScriptをここに入力')
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    await new Promise((r) => setTimeout(r, 800))
    setSaving(false)
    toast.success('カスタムコードを保存しました')
  }

  const current = tab === 'css' ? css : js
  const setCurrent = tab === 'css' ? setCss : setJs

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">カスタムコード</h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 disabled:opacity-60 text-sm"
        >
          <Save className="w-4 h-4" />
          {saving ? '保存中...' : '保存'}
        </button>
      </div>

      <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
        <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-yellow-500" />
        <span>このコードはすべてのページに適用されます。誤ったコードはサイトに影響する場合があります。</span>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Tabs */}
        <div className="border-b border-gray-100 flex">
          {(['css', 'js'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                tab === t
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              カスタム{t === 'css' ? 'CSS' : 'JS'}
            </button>
          ))}
          <div className="flex-1" />
          <div className="flex items-center px-4 text-xs text-gray-400">
            {current.length.toLocaleString()} 文字
          </div>
        </div>

        {/* Editor */}
        <div className="relative">
          <textarea
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            className="w-full h-96 p-5 font-mono text-sm text-gray-800 bg-gray-50 focus:outline-none focus:bg-white transition-colors resize-none"
            spellCheck={false}
            placeholder={tab === 'css' ? '/* カスタムCSSをここに入力 */' : '// カスタムJavaScriptをここに入力'}
          />
        </div>
      </div>
    </div>
  )
}
