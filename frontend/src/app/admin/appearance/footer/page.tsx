'use client'

import { useState } from 'react'
import { Save } from 'lucide-react'
import toast from 'react-hot-toast'

interface FooterLink {
  label: string
  url: string
}

interface FooterForm {
  logoDescription: string
  copyright: string
  bgColor: string
  showStripe: boolean
  showPaypal: boolean
  showVisa: boolean
  showMastercard: boolean
  links: {
    company: FooterLink[]
    service: FooterLink[]
    support: FooterLink[]
    social: FooterLink[]
  }
}

export default function AdminFooterPage() {
  const [form, setForm] = useState<FooterForm>({
    logoDescription: 'MYKENKO（マイケンコー）は日本初の医療個人輸入マーケットプレイスです。',
    copyright: '© 2024 MYKENKO. All rights reserved.',
    bgColor: '#1a1a2e',
    showStripe: true,
    showPaypal: true,
    showVisa: true,
    showMastercard: true,
    links: {
      company: [
        { label: '会社概要', url: '/about' },
        { label: 'プレスリリース', url: '/press' },
        { label: 'キャリア', url: '/careers' },
      ],
      service: [
        { label: '商品を探す', url: '/products' },
        { label: 'ブランド', url: '/brands' },
        { label: 'ガイド', url: '/guide' },
      ],
      support: [
        { label: 'よくある質問', url: '/faq' },
        { label: 'お問い合わせ', url: '/contact' },
        { label: '配送について', url: '/shipping' },
      ],
      social: [
        { label: 'Twitter/X', url: 'https://twitter.com/mykenko' },
        { label: 'Instagram', url: 'https://instagram.com/mykenko' },
        { label: 'LINE', url: 'https://line.me/mykenko' },
      ],
    },
  })

  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    await new Promise((r) => setTimeout(r, 800))
    setSaving(false)
    toast.success('フッター設定を保存しました')
  }

  const linkGroupLabels: [keyof FooterForm['links'], string][] = [
    ['company', '会社情報'],
    ['service', 'サービス'],
    ['support', 'サポート'],
    ['social', 'フォロー'],
  ]

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">フッター設定</h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 disabled:opacity-60 text-sm"
        >
          <Save className="w-4 h-4" />
          {saving ? '保存中...' : '設定を保存'}
        </button>
      </div>

      <div className="space-y-4">
        {/* Logo & description */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">フッターロゴ & 説明文</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ロゴ画像</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 cursor-pointer w-48">
                <p className="text-xs text-gray-500">クリックしてアップロード</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">説明文</label>
              <textarea
                value={form.logoDescription}
                onChange={(e) => setForm({ ...form, logoDescription: e.target.value })}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
              />
            </div>
          </div>
        </div>

        {/* Footer links */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">フッターリンク</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {linkGroupLabels.map(([key, label]) => (
              <div key={key}>
                <p className="text-sm font-semibold text-gray-700 mb-3">{label}</p>
                <div className="space-y-2">
                  {form.links[key].map((link, idx) => (
                    <div key={idx} className="space-y-1">
                      <input
                        type="text"
                        value={link.label}
                        onChange={(e) => {
                          const newLinks = [...form.links[key]]
                          newLinks[idx] = { ...newLinks[idx], label: e.target.value }
                          setForm({ ...form, links: { ...form.links, [key]: newLinks } })
                        }}
                        className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary/30"
                        placeholder="リンクテキスト"
                      />
                      <input
                        type="text"
                        value={link.url}
                        onChange={(e) => {
                          const newLinks = [...form.links[key]]
                          newLinks[idx] = { ...newLinks[idx], url: e.target.value }
                          setForm({ ...form, links: { ...form.links, [key]: newLinks } })
                        }}
                        className="w-full border border-gray-200 rounded px-2 py-1 text-xs font-mono text-gray-400 focus:outline-none focus:ring-1 focus:ring-primary/30"
                        placeholder="URL"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Copyright */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">コピーライト</h2>
          <input
            type="text"
            value={form.copyright}
            onChange={(e) => setForm({ ...form, copyright: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>

        {/* Payment logos */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">決済ロゴ表示</h2>
          <div className="flex flex-wrap gap-4">
            {[
              { key: 'showStripe' as const, label: 'Stripe' },
              { key: 'showPaypal' as const, label: 'PayPal' },
              { key: 'showVisa' as const, label: 'Visa' },
              { key: 'showMastercard' as const, label: 'Mastercard' },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, [key]: !form[key] })}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${form[key] ? 'bg-primary' : 'bg-gray-200'}`}
                >
                  <span className="inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform"
                    style={{ transform: form[key] ? 'translateX(18px)' : 'translateX(2px)' }} />
                </button>
                <span className="text-sm text-gray-700">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Background color */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">フッター背景色</h2>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg border-2 border-gray-200 overflow-hidden relative" style={{ backgroundColor: form.bgColor }}>
              <input type="color" value={form.bgColor} onChange={(e) => setForm({ ...form, bgColor: e.target.value })}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
            </div>
            <input type="text" value={form.bgColor} onChange={(e) => setForm({ ...form, bgColor: e.target.value })}
              className="w-40 border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
          </div>
        </div>
      </div>
    </div>
  )
}
