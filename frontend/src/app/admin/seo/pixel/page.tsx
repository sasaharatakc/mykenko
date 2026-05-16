'use client'

import { useState } from 'react'
import { Save } from 'lucide-react'
import toast from 'react-hot-toast'

interface PixelForm {
  pixelId: string
  conversionApiToken: string
  advancedMatching: boolean
  events: {
    pageView: boolean
    viewContent: boolean
    addToCart: boolean
    purchase: boolean
    initiateCheckout: boolean
    search: boolean
  }
}

export default function AdminPixelPage() {
  const [form, setForm] = useState<PixelForm>({
    pixelId: '',
    conversionApiToken: '',
    advancedMatching: false,
    events: {
      pageView: true,
      viewContent: true,
      addToCart: true,
      purchase: true,
      initiateCheckout: true,
      search: false,
    },
  })
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    await new Promise((r) => setTimeout(r, 800))
    setSaving(false)
    toast.success('Meta Pixel設定を保存しました')
  }

  const eventLabels: Record<keyof PixelForm['events'], string> = {
    pageView: 'PageView（ページ表示）',
    viewContent: 'ViewContent（商品閲覧）',
    addToCart: 'AddToCart（カート追加）',
    purchase: 'Purchase（購入）',
    initiateCheckout: 'InitiateCheckout（決済開始）',
    search: 'Search（検索）',
  }

  function toggleEvent(key: keyof PixelForm['events']) {
    setForm((prev) => ({
      ...prev,
      events: { ...prev.events, [key]: !prev.events[key] },
    }))
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Facebook / Meta Pixel</h1>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 disabled:opacity-60 text-sm">
          <Save className="w-4 h-4" />
          {saving ? '保存中...' : '設定を保存'}
        </button>
      </div>

      <div className="space-y-4">
        {/* Pixel credentials */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Pixel認証情報</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pixel ID</label>
              <input type="text" value={form.pixelId}
                onChange={(e) => setForm({ ...form, pixelId: e.target.value })}
                placeholder="000000000000000"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">コンバージョンAPI アクセストークン</label>
              <input type="password" value={form.conversionApiToken}
                onChange={(e) => setForm({ ...form, conversionApiToken: e.target.value })}
                placeholder="サーバーサイドAPI用トークン"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
              <p className="text-xs text-gray-400 mt-1">サーバーサイドのイベント送信に使用されます</p>
            </div>
          </div>
        </div>

        {/* Advanced matching */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">Advanced Matching</h2>
              <p className="text-sm text-gray-500 mt-1">メールアドレス・電話番号などでコンバージョンマッチング精度を向上</p>
            </div>
            <button onClick={() => setForm({ ...form, advancedMatching: !form.advancedMatching })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.advancedMatching ? 'bg-primary' : 'bg-gray-200'}`}>
              <span className="inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform"
                style={{ transform: form.advancedMatching ? 'translateX(22px)' : 'translateX(2px)' }} />
            </button>
          </div>
        </div>

        {/* Events */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-1">イベント設定</h2>
          <p className="text-sm text-gray-500 mb-4">追跡するイベントを選択してください</p>
          <div className="space-y-3">
            {(Object.keys(form.events) as (keyof PixelForm['events'])[]).map((key) => (
              <div key={key} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <span className="text-sm text-gray-700">{eventLabels[key]}</span>
                </div>
                <button onClick={() => toggleEvent(key)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.events[key] ? 'bg-primary' : 'bg-gray-200'}`}>
                  <span className="inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform"
                    style={{ transform: form.events[key] ? 'translateX(22px)' : 'translateX(2px)' }} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
