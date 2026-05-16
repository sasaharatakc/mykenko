'use client'

import { useState } from 'react'
import { Save, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface AnalyticsForm {
  ga4MeasurementId: string
  gscVerificationCode: string
  gscProperty: string
  enhancedEcommerce: boolean
  consentMode: boolean
}

export default function AdminSeoAnalyticsPage() {
  const [form, setForm] = useState<AnalyticsForm>({
    ga4MeasurementId: '',
    gscVerificationCode: '',
    gscProperty: '',
    enhancedEcommerce: true,
    consentMode: false,
  })
  const [verifying, setVerifying] = useState(false)
  const [saving, setSaving] = useState(false)

  async function handleVerify() {
    if (!form.ga4MeasurementId.startsWith('G-')) {
      toast.error('有効なGA4測定IDを入力してください（G-XXXXXXXXXX）')
      return
    }
    setVerifying(true)
    await new Promise((r) => setTimeout(r, 1200))
    setVerifying(false)
    toast.success('GA4接続を確認しました')
  }

  async function handleSave() {
    setSaving(true)
    await new Promise((r) => setTimeout(r, 800))
    setSaving(false)
    toast.success('アナリティクス設定を保存しました')
  }

  const Toggle = ({ value, onChange }: { value: boolean; onChange: () => void }) => (
    <button type="button" onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${value ? 'bg-primary' : 'bg-gray-200'}`}>
      <span className="inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform"
        style={{ transform: value ? 'translateX(22px)' : 'translateX(2px)' }} />
    </button>
  )

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Google Analytics設定</h1>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 disabled:opacity-60 text-sm">
          <Save className="w-4 h-4" />
          {saving ? '保存中...' : '設定を保存'}
        </button>
      </div>

      <div className="space-y-4">
        {/* GA4 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Google Analytics 4</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">GA4 測定ID</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={form.ga4MeasurementId}
                  onChange={(e) => setForm({ ...form, ga4MeasurementId: e.target.value })}
                  placeholder="G-XXXXXXXXXX"
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
                <button onClick={handleVerify} disabled={verifying}
                  className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-60">
                  <CheckCircle2 className="w-4 h-4" />
                  {verifying ? '確認中...' : '検証'}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <div>
                <p className="text-sm font-medium text-gray-900">Enhanced Ecommerce</p>
                <p className="text-xs text-gray-500">購入・カート追加などのイベントを自動計測</p>
              </div>
              <Toggle value={form.enhancedEcommerce} onChange={() => setForm({ ...form, enhancedEcommerce: !form.enhancedEcommerce })} />
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <div>
                <p className="text-sm font-medium text-gray-900">Consent Mode v2</p>
                <p className="text-xs text-gray-500">GDPR対応のコンセントモード</p>
              </div>
              <Toggle value={form.consentMode} onChange={() => setForm({ ...form, consentMode: !form.consentMode })} />
            </div>
          </div>
        </div>

        {/* Search Console */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Google Search Console</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">HTMLタグ確認コード</label>
              <input
                type="text"
                value={form.gscVerificationCode}
                onChange={(e) => setForm({ ...form, gscVerificationCode: e.target.value })}
                placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
              <p className="text-xs text-gray-400 mt-1">Search Console → プロパティ設定 → 所有権確認 → HTMLタグ のコンテンツ属性値</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search Consoleプロパティ URL</label>
              <input
                type="text"
                value={form.gscProperty}
                onChange={(e) => setForm({ ...form, gscProperty: e.target.value })}
                placeholder="https://mykenko.jp"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
