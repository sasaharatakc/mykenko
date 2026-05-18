'use client'

import { useState } from 'react'
import { vendorApi } from '@/lib/api'
import { Share2, Twitter, Instagram, Facebook, Youtube } from 'lucide-react'
import toast from 'react-hot-toast'

const SOCIAL_FIELDS = [
  { key: 'twitter', label: 'X（Twitter）', icon: Twitter, placeholder: 'https://x.com/youraccount', color: 'text-gray-900' },
  { key: 'instagram', label: 'Instagram', icon: Instagram, placeholder: 'https://instagram.com/youraccount', color: 'text-pink-500' },
  { key: 'facebook', label: 'Facebook', icon: Facebook, placeholder: 'https://facebook.com/yourpage', color: 'text-blue-600' },
  { key: 'youtube', label: 'YouTube', icon: Youtube, placeholder: 'https://youtube.com/@yourchannel', color: 'text-red-500' },
  { key: 'tiktok', label: 'TikTok', placeholder: 'https://tiktok.com/@youraccount', color: 'text-gray-900' },
  { key: 'line', label: 'LINE公式アカウント', placeholder: 'https://lin.ee/xxxxxxx', color: 'text-green-500' },
]

export default function VendorStoreSocialPage() {
  const [saving, setSaving] = useState(false)
  const [links, setLinks] = useState<Record<string, string>>({})

  const save = async () => {
    setSaving(true)
    try {
      await vendorApi.updateStore({ social_links: links })
      toast.success('SNSリンクを保存しました')
    } catch { toast.error('保存に失敗しました') }
    finally { setSaving(false) }
  }

  return (
    <div className="space-y-6 max-w-xl">
      <div className="flex items-center gap-3">
        <Share2 className="w-6 h-6 text-primary-500" />
        <h1 className="text-2xl font-bold text-gray-900">SNSリンク</h1>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <p className="text-sm text-gray-500">設定したSNSリンクはストアページに表示されます。</p>

        {SOCIAL_FIELDS.map(({ key, label, icon: Icon, placeholder, color }) => (
          <div key={key} className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0 ${color}`}>
              {Icon ? <Icon className="w-4 h-4" /> : <span className="text-xs font-bold">{label[0]}</span>}
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
              <input
                value={links[key] ?? ''}
                onChange={e => setLinks(l => ({ ...l, [key]: e.target.value }))}
                placeholder={placeholder}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        ))}

        <div className="pt-4 border-t border-gray-100">
          <button onClick={save} disabled={saving}
            className="w-full py-2.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50">
            {saving ? '保存中...' : 'リンクを保存'}
          </button>
        </div>
      </div>
    </div>
  )
}
