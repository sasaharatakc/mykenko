'use client'

import { useState } from 'react'
import { Save } from 'lucide-react'
import toast from 'react-hot-toast'

interface StructuredDataForm {
  orgName: string
  orgUrl: string
  twitter: string
  facebook: string
  instagram: string
  breadcrumb: boolean
  productSchema: boolean
  productBrand: string
  faqSchema: boolean
  reviewSchema: boolean
  medicalWebPage: boolean
}

export default function AdminStructuredDataPage() {
  const [form, setForm] = useState<StructuredDataForm>({
    orgName: 'MYKENKO株式会社',
    orgUrl: 'https://mykenko.jp',
    twitter: 'https://twitter.com/mykenko',
    facebook: '',
    instagram: 'https://instagram.com/mykenko',
    breadcrumb: true,
    productSchema: true,
    productBrand: 'MYKENKO',
    faqSchema: true,
    reviewSchema: true,
    medicalWebPage: true,
  })
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    await new Promise((r) => setTimeout(r, 800))
    setSaving(false)
    toast.success('構造化データ設定を保存しました')
  }

  const jsonLdPreview = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: form.orgName,
    url: form.orgUrl,
    sameAs: [form.twitter, form.facebook, form.instagram].filter(Boolean),
  }, null, 2)

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
        <h1 className="text-2xl font-bold text-gray-900">構造化データ設定</h1>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 disabled:opacity-60 text-sm">
          <Save className="w-4 h-4" />
          {saving ? '保存中...' : '設定を保存'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="space-y-4">
          {/* Organization */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">組織情報（Organization）</h2>
            <div className="space-y-3">
              {[
                { key: 'orgName' as const, label: '組織名' },
                { key: 'orgUrl' as const, label: 'URL' },
                { key: 'twitter' as const, label: 'Twitter/X URL' },
                { key: 'facebook' as const, label: 'Facebook URL' },
                { key: 'instagram' as const, label: 'Instagram URL' },
              ].map(({ key, label }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <input type="text" value={form[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ロゴ</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-gray-400">
                  <p className="text-xs text-gray-500">クリックしてアップロード</p>
                </div>
              </div>
            </div>
          </div>

          {/* Schema toggles */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">スキーマ設定</h2>
            <div className="space-y-4">
              {[
                { key: 'breadcrumb' as const, label: 'パンくずリスト（BreadcrumbList）', desc: '自動でパンくずスキーマを生成' },
                { key: 'productSchema' as const, label: '商品スキーマ（Product）', desc: '価格・在庫情報を含む' },
                { key: 'faqSchema' as const, label: 'FAQスキーマ（FAQ）', desc: 'FAQページ用' },
                { key: 'reviewSchema' as const, label: 'レビュースキーマ（Review）', desc: '評価情報を含む' },
                { key: 'medicalWebPage' as const, label: 'MedicalWebPageスキーマ', desc: '医療サイト特化（推奨）' },
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{label}</p>
                    <p className="text-xs text-gray-500">{desc}</p>
                  </div>
                  <Toggle value={form[key] as boolean} onChange={() => setForm({ ...form, [key]: !form[key] })} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* JSON-LD Preview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-fit">
          <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">JSON-LD プレビュー</span>
            <span className="text-xs text-gray-400">読み取り専用</span>
          </div>
          <pre className="p-5 text-xs font-mono text-gray-700 overflow-auto max-h-96 bg-gray-50">
            {jsonLdPreview}
          </pre>
        </div>
      </div>
    </div>
  )
}
