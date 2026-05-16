'use client'

import { useState } from 'react'
import { Trash2, RefreshCw, Info, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'

interface CacheType {
  id: string
  name: string
  size: string
  lastUpdated: string
  icon: string
}

const CACHE_TYPES: CacheType[] = [
  { id: 'app', name: 'アプリケーションキャッシュ', size: '24.5 MB', lastUpdated: '2024-01-15 03:00', icon: '⚙️' },
  { id: 'product', name: '商品キャッシュ', size: '156.2 MB', lastUpdated: '2024-01-15 02:30', icon: '📦' },
  { id: 'image', name: '画像キャッシュ', size: '1.2 GB', lastUpdated: '2024-01-14 22:00', icon: '🖼️' },
  { id: 'session', name: 'セッションキャッシュ', size: '8.3 MB', lastUpdated: '2024-01-15 10:28', icon: '👤' },
]

export default function AdminCachePage() {
  const [clearing, setClearing] = useState<string | null>(null)
  const [clearingAll, setClearingAll] = useState(false)
  const [sizes, setSizes] = useState<Record<string, string>>(
    Object.fromEntries(CACHE_TYPES.map((c) => [c.id, c.size]))
  )

  async function clearCache(id: string) {
    if (!confirm('このキャッシュをクリアしますか？')) return
    setClearing(id)
    await new Promise((r) => setTimeout(r, 1000))
    setSizes((prev) => ({ ...prev, [id]: '0 B' }))
    setClearing(null)
    toast.success('キャッシュをクリアしました')
  }

  async function clearAll() {
    if (!confirm('すべてのキャッシュをクリアしますか？一時的にサイトの速度に影響する場合があります。')) return
    setClearingAll(true)
    await new Promise((r) => setTimeout(r, 1500))
    setSizes(Object.fromEntries(CACHE_TYPES.map((c) => [c.id, '0 B'])))
    setClearingAll(false)
    toast.success('全キャッシュをクリアしました')
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">キャッシュ管理</h1>
        <button
          onClick={clearAll}
          disabled={clearingAll}
          className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-60 text-sm"
        >
          {clearingAll ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Trash2 className="w-4 h-4" />
          )}
          {clearingAll ? 'クリア中...' : '全キャッシュをクリア'}
        </button>
      </div>

      <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
        <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-yellow-500" />
        <span>キャッシュのクリアは一時的にサイトの速度に影響します。トラフィックの少ない時間帯に実行することをお勧めします。</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {CACHE_TYPES.map((cache) => (
          <div key={cache.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{cache.icon}</span>
                <div>
                  <h3 className="font-semibold text-gray-900">{cache.name}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-sm text-gray-500">サイズ: <span className="font-medium text-gray-700">{sizes[cache.id]}</span></span>
                    <span className="text-xs text-gray-400">最終更新: {cache.lastUpdated}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => clearCache(cache.id)}
                disabled={clearing === cache.id || clearingAll}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-red-200 text-red-600 rounded-lg text-xs hover:bg-red-50 disabled:opacity-60"
              >
                {clearing === cache.id ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                {clearing === cache.id ? 'クリア中' : 'クリア'}
              </button>
            </div>

            {sizes[cache.id] === '0 B' && (
              <div className="mt-3 flex items-center gap-2 text-xs text-green-600">
                <span className="w-2 h-2 bg-green-400 rounded-full" />
                クリア済み
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-start gap-2 text-xs text-gray-400">
        <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
        <span>※ 表示データはモックです。実際のキャッシュサイズはバックエンド実装後に表示されます。</span>
      </div>
    </div>
  )
}
