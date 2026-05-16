'use client'

import { useState } from 'react'
import { Save } from 'lucide-react'
import toast from 'react-hot-toast'

interface Language {
  code: string
  name: string
  nativeName: string
  enabled: boolean
  translationStatus: number // percentage
}

interface LanguageSettings {
  defaultLanguage: string
  dateFormat: string
  numberFormat: string
  timezone: string
}

const LANGUAGES: Language[] = [
  { code: 'ja', name: 'Japanese', nativeName: '日本語', enabled: true, translationStatus: 100 },
  { code: 'en', name: 'English', nativeName: 'English', enabled: false, translationStatus: 85 },
  { code: 'zh-cn', name: 'Chinese (Simplified)', nativeName: '中文（简体）', enabled: false, translationStatus: 60 },
  { code: 'ko', name: 'Korean', nativeName: '한국어', enabled: false, translationStatus: 40 },
]

const DATE_FORMATS = [
  { value: 'YYYY年MM月DD日', label: '2024年01月15日' },
  { value: 'YYYY/MM/DD', label: '2024/01/15' },
  { value: 'DD/MM/YYYY', label: '15/01/2024' },
  { value: 'MM/DD/YYYY', label: '01/15/2024' },
]

const NUMBER_FORMATS = [
  { value: '1,000.00', label: '1,000.00（英米式）' },
  { value: '1.000,00', label: '1.000,00（欧州式）' },
]

const TIMEZONES = [
  'Asia/Tokyo',
  'Asia/Seoul',
  'Asia/Shanghai',
  'America/New_York',
  'America/Los_Angeles',
  'Europe/London',
  'UTC',
]

export default function AdminLanguagePage() {
  const [languages, setLanguages] = useState<Language[]>(LANGUAGES)
  const [settings, setSettings] = useState<LanguageSettings>({
    defaultLanguage: 'ja',
    dateFormat: 'YYYY年MM月DD日',
    numberFormat: '1,000.00',
    timezone: 'Asia/Tokyo',
  })
  const [saving, setSaving] = useState(false)

  function toggleLanguage(code: string) {
    if (code === settings.defaultLanguage) return // can't disable default
    setLanguages((prev) => prev.map((l) => l.code === code ? { ...l, enabled: !l.enabled } : l))
  }

  async function handleSave() {
    setSaving(true)
    await new Promise((r) => setTimeout(r, 800))
    setSaving(false)
    toast.success('言語設定を保存しました')
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">言語設定</h1>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 disabled:opacity-60 text-sm">
          <Save className="w-4 h-4" />
          {saving ? '保存中...' : '設定を保存'}
        </button>
      </div>

      <div className="space-y-4">
        {/* Default language */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">デフォルト言語</h2>
          <select value={settings.defaultLanguage}
            onChange={(e) => setSettings({ ...settings, defaultLanguage: e.target.value })}
            className="w-full max-w-xs border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary">
            {languages.map((l) => (
              <option key={l.code} value={l.code}>{l.nativeName} ({l.name})</option>
            ))}
          </select>
        </div>

        {/* Available languages */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">有効言語</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['言語', '有効', '翻訳進捗'].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {languages.map((lang) => (
                  <tr key={lang.code} className="hover:bg-gray-50">
                    <td className="px-5 py-3">
                      <div>
                        <p className="font-medium text-gray-900">{lang.nativeName}</p>
                        <p className="text-xs text-gray-400">{lang.name}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleLanguage(lang.code)}
                          disabled={lang.code === settings.defaultLanguage}
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors disabled:cursor-not-allowed ${
                            lang.enabled ? 'bg-primary' : 'bg-gray-200'
                          }`}
                        >
                          <span className="inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform"
                            style={{ transform: lang.enabled ? 'translateX(18px)' : 'translateX(2px)' }} />
                        </button>
                        {lang.code === settings.defaultLanguage && (
                          <span className="text-xs text-gray-400">（デフォルト）</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-gray-200 rounded-full h-1.5 max-w-32">
                          <div
                            className="bg-primary h-1.5 rounded-full transition-all"
                            style={{ width: `${lang.translationStatus}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">{lang.translationStatus}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Locale settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">地域設定</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">日付フォーマット</label>
              <select value={settings.dateFormat}
                onChange={(e) => setSettings({ ...settings, dateFormat: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary">
                {DATE_FORMATS.map((f) => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">数字フォーマット</label>
              <select value={settings.numberFormat}
                onChange={(e) => setSettings({ ...settings, numberFormat: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary">
                {NUMBER_FORMATS.map((f) => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">タイムゾーン</label>
              <select value={settings.timezone}
                onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary">
                {TIMEZONES.map((tz) => (
                  <option key={tz} value={tz}>{tz}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
