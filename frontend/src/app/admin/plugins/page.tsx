'use client'

import { useState } from 'react'
import { Settings } from 'lucide-react'
import toast from 'react-hot-toast'

interface Plugin {
  id: string
  name: string
  description: string
  version: string
  icon: string
  enabled: boolean
  configured: boolean
}

const INITIAL_PLUGINS: Plugin[] = [
  {
    id: 'stripe',
    name: 'Stripe決済',
    description: 'クレジットカード・電子マネー決済を提供',
    version: '3.2.1',
    icon: '💳',
    enabled: true,
    configured: true,
  },
  {
    id: 'paypal',
    name: 'PayPal決済',
    description: 'PayPalを使った安全なオンライン決済',
    version: '2.1.0',
    icon: '🅿️',
    enabled: true,
    configured: true,
  },
  {
    id: 'email',
    name: 'メール通知',
    description: '注文確認・発送通知などのメールを自動送信',
    version: '1.5.2',
    icon: '📧',
    enabled: true,
    configured: true,
  },
  {
    id: 'ai-search',
    name: 'AI検索',
    description: 'AIを活用した自然言語検索機能',
    version: '1.0.0-beta',
    icon: '🤖',
    enabled: false,
    configured: false,
  },
  {
    id: 'phone-verify',
    name: '電話番号確認',
    description: 'SMS認証によるユーザー本人確認',
    version: '1.2.0',
    icon: '📱',
    enabled: false,
    configured: false,
  },
  {
    id: 'pdf-invoice',
    name: 'PDF請求書',
    description: '注文ごとにPDF形式の請求書を自動生成',
    version: '2.0.3',
    icon: '📄',
    enabled: true,
    configured: true,
  },
]

export default function AdminPluginsPage() {
  const [plugins, setPlugins] = useState<Plugin[]>(INITIAL_PLUGINS)

  function togglePlugin(id: string) {
    const plugin = plugins.find((p) => p.id === id)!
    setPlugins((prev) => prev.map((p) => p.id === id ? { ...p, enabled: !p.enabled } : p))
    toast.success(`${plugin.name}を${plugin.enabled ? '無効化' : '有効化'}しました`)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">プラグイン管理</h1>
        <span className="text-sm text-gray-500">{plugins.filter((p) => p.enabled).length}/{plugins.length} 有効</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {plugins.map((plugin) => (
          <div key={plugin.id} className={`bg-white rounded-xl border-2 p-5 transition-colors ${
            plugin.enabled ? 'border-primary/20' : 'border-gray-200'
          }`}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{plugin.icon}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900 text-sm">{plugin.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      plugin.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {plugin.enabled ? '有効' : '無効'}
                    </span>
                  </div>
                  {plugin.configured && plugin.enabled && (
                    <span className="text-xs text-gray-400">設定済み</span>
                  )}
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-500 mb-3 leading-relaxed">{plugin.description}</p>
            <p className="text-xs text-gray-400 mb-4">v{plugin.version}</p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => togglePlugin(plugin.id)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${plugin.enabled ? 'bg-primary' : 'bg-gray-200'}`}
              >
                <span className="inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform"
                  style={{ transform: plugin.enabled ? 'translateX(18px)' : 'translateX(2px)' }} />
              </button>
              <span className="text-xs text-gray-500 flex-1">{plugin.enabled ? 'オン' : 'オフ'}</span>
              <button
                onClick={() => toast(`${plugin.name}の設定は近日実装予定です`)}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                <Settings className="w-3.5 h-3.5" />
                設定
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
