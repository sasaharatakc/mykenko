'use client'

import { useState } from 'react'
import { Save, ExternalLink } from 'lucide-react'
import toast from 'react-hot-toast'

interface GtmForm {
  containerId: string
  dataLayerEvents: {
    productView: boolean
    addToCart: boolean
    purchase: boolean
    login: boolean
    signup: boolean
    search: boolean
  }
}

export default function AdminGtmPage() {
  const [form, setForm] = useState<GtmForm>({
    containerId: '',
    dataLayerEvents: {
      productView: true,
      addToCart: true,
      purchase: true,
      login: false,
      signup: false,
      search: false,
    },
  })
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    await new Promise((r) => setTimeout(r, 800))
    setSaving(false)
    toast.success('GTM設定を保存しました')
  }

  const eventLabels: Record<keyof GtmForm['dataLayerEvents'], string> = {
    productView: '商品表示（view_item）',
    addToCart: 'カートに追加（add_to_cart）',
    purchase: '購入完了（purchase）',
    login: 'ログイン（login）',
    signup: '新規登録（sign_up）',
    search: '検索（search）',
  }

  function toggleEvent(key: keyof GtmForm['dataLayerEvents']) {
    setForm((prev) => ({
      ...prev,
      dataLayerEvents: {
        ...prev.dataLayerEvents,
        [key]: !prev.dataLayerEvents[key],
      },
    }))
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Google Tag Manager</h1>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 disabled:opacity-60 text-sm">
          <Save className="w-4 h-4" />
          {saving ? '保存中...' : '設定を保存'}
        </button>
      </div>

      <div className="space-y-4">
        {/* Container ID */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">GTM コンテナID</h2>
          <input
            type="text"
            value={form.containerId}
            onChange={(e) => setForm({ ...form, containerId: e.target.value })}
            placeholder="GTM-XXXXXXX"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
          <p className="text-xs text-gray-400 mt-2">Google Tag Manager のコンテナIDを入力してください</p>
        </div>

        {/* DataLayer events */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-1">データレイヤー設定</h2>
          <p className="text-sm text-gray-500 mb-4">GTMへ送信するイベントを選択してください</p>
          <div className="space-y-3">
            {(Object.keys(form.dataLayerEvents) as (keyof GtmForm['dataLayerEvents'])[]).map((key) => (
              <div key={key} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <span className="text-sm text-gray-700">{eventLabels[key]}</span>
                <button
                  onClick={() => toggleEvent(key)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.dataLayerEvents[key] ? 'bg-primary' : 'bg-gray-200'}`}
                >
                  <span className="inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform"
                    style={{ transform: form.dataLayerEvents[key] ? 'translateX(22px)' : 'translateX(2px)' }} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Preview mode hint */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-2 text-sm">プレビューモード</h2>
          <p className="text-sm text-gray-500 mb-3">GTMのプレビューモードでタグの動作を確認できます</p>
          <a
            href="https://tagmanager.google.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary-600"
          >
            <ExternalLink className="w-4 h-4" />
            Google Tag Manager を開く
          </a>
        </div>
      </div>
    </div>
  )
}
