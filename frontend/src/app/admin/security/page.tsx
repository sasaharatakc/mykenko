'use client'

import { useState } from 'react'
import { Save, Shield, ExternalLink, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface SecurityForm {
  twoFactor: boolean
  maxLoginAttempts: number
  sessionTimeout: number
  ipWhitelist: string
  minPasswordLength: number
  requireSpecialChars: boolean
  requireUppercase: boolean
  requireNumbers: boolean
}

export default function AdminSecurityPage() {
  const [form, setForm] = useState<SecurityForm>({
    twoFactor: false,
    maxLoginAttempts: 5,
    sessionTimeout: 120,
    ipWhitelist: '',
    minPasswordLength: 8,
    requireSpecialChars: true,
    requireUppercase: true,
    requireNumbers: true,
  })
  const [saving, setSaving] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [lastScan] = useState('2024-01-10 02:00:00')

  async function handleSave() {
    setSaving(true)
    await new Promise((r) => setTimeout(r, 800))
    setSaving(false)
    toast.success('セキュリティ設定を保存しました')
  }

  async function handleScan() {
    setScanning(true)
    await new Promise((r) => setTimeout(r, 2000))
    setScanning(false)
    toast.success('セキュリティスキャンが完了しました')
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
        <h1 className="text-2xl font-bold text-gray-900">セキュリティ設定</h1>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 disabled:opacity-60 text-sm">
          <Save className="w-4 h-4" />
          {saving ? '保存中...' : '設定を保存'}
        </button>
      </div>

      <div className="space-y-4">
        {/* 2FA */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">2要素認証（2FA）</h2>
              <p className="text-sm text-gray-500 mt-1">管理者ログイン時に追加の認証を要求</p>
            </div>
            <Toggle value={form.twoFactor} onChange={() => setForm({ ...form, twoFactor: !form.twoFactor })} />
          </div>
        </div>

        {/* Login attempts & session */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">ログイン設定</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ログイン試行制限（回数）</label>
              <input type="number" value={form.maxLoginAttempts} min={3} max={20}
                onChange={(e) => setForm({ ...form, maxLoginAttempts: Number(e.target.value) })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
              <p className="text-xs text-gray-400 mt-1">この回数を超えるとアカウントがロックされます</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">セッションタイムアウト（分）</label>
              <input type="number" value={form.sessionTimeout} min={15} max={1440}
                onChange={(e) => setForm({ ...form, sessionTimeout: Number(e.target.value) })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
              <p className="text-xs text-gray-400 mt-1">非アクティブ時のセッション有効期限</p>
            </div>
          </div>
        </div>

        {/* IP whitelist */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-2">IPホワイトリスト</h2>
          <p className="text-sm text-gray-500 mb-3">管理パネルへのアクセスを許可するIPアドレス（空欄の場合はすべて許可）</p>
          <textarea value={form.ipWhitelist}
            onChange={(e) => setForm({ ...form, ipWhitelist: e.target.value })}
            rows={4}
            placeholder="192.168.1.0/24&#10;10.0.0.1&#10;203.0.113.0/24"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none" />
          <p className="text-xs text-gray-400 mt-1">1行に1つのIPアドレスまたはCIDR範囲を入力</p>
        </div>

        {/* Password policy */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">パスワードポリシー</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">最小パスワード長</label>
              <input type="number" value={form.minPasswordLength} min={6} max={32}
                onChange={(e) => setForm({ ...form, minPasswordLength: Number(e.target.value) })}
                className="w-32 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
            </div>
            <div className="space-y-3">
              {[
                { key: 'requireSpecialChars' as const, label: '特殊文字を必須にする（!@#$等）' },
                { key: 'requireUppercase' as const, label: '大文字を必須にする' },
                { key: 'requireNumbers' as const, label: '数字を必須にする' },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={form[key]}
                    onChange={() => setForm({ ...form, [key]: !form[key] })}
                    className="w-4 h-4 accent-primary" />
                  <span className="text-sm text-gray-700">{label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Security log link */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">セキュリティログ</h2>
              <p className="text-sm text-gray-500 mt-1">不審なアクティビティや認証ログを確認</p>
            </div>
            <Link href="/admin/logs" className="flex items-center gap-2 text-sm text-primary hover:text-primary-600">
              <ExternalLink className="w-4 h-4" />
              ログを確認
            </Link>
          </div>
        </div>

        {/* Security scan */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">セキュリティスキャン</h2>
              <p className="text-sm text-gray-500 mt-1">最終スキャン: {lastScan}</p>
            </div>
            <button onClick={handleScan} disabled={scanning}
              className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-60">
              {scanning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
              {scanning ? 'スキャン中...' : 'スキャン実行'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
