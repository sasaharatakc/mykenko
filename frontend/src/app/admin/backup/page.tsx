'use client'

import { useState } from 'react'
import { Save, Download, Plus, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'

interface BackupEntry {
  id: number
  date: string
  size: string
  type: 'フル' | 'データベース' | 'ファイル'
  status: '完了' | '進行中' | '失敗'
}

const MOCK_BACKUPS: BackupEntry[] = [
  { id: 1, date: '2024-01-15 01:00:00', size: '2.3 GB', type: 'フル', status: '完了' },
  { id: 2, date: '2024-01-14 01:00:00', size: '2.1 GB', type: 'フル', status: '完了' },
  { id: 3, date: '2024-01-13 01:00:00', size: '2.2 GB', type: 'フル', status: '完了' },
  { id: 4, date: '2024-01-12 01:00:00', size: '2.0 GB', type: 'フル', status: '完了' },
  { id: 5, date: '2024-01-11 01:00:00', size: '—', type: 'データベース', status: '失敗' },
]

type Frequency = '日次' | '週次' | '月次'
type Storage = 'local' | 's3'

interface BackupSettings {
  autoBackup: boolean
  frequency: Frequency
  time: string
  storage: Storage
}

export default function AdminBackupPage() {
  const [backups] = useState<BackupEntry[]>(MOCK_BACKUPS)
  const [creating, setCreating] = useState(false)
  const [settings, setSettings] = useState<BackupSettings>({
    autoBackup: true,
    frequency: '日次',
    time: '01:00',
    storage: 'local',
  })
  const [saving, setSaving] = useState(false)

  async function createBackup() {
    setCreating(true)
    await new Promise((r) => setTimeout(r, 2000))
    setCreating(false)
    toast.success('バックアップを作成しました')
  }

  async function handleSave() {
    setSaving(true)
    await new Promise((r) => setTimeout(r, 800))
    setSaving(false)
    toast.success('バックアップ設定を保存しました')
  }

  const statusStyle = (status: BackupEntry['status']) => {
    switch (status) {
      case '完了': return 'bg-green-100 text-green-700'
      case '進行中': return 'bg-blue-100 text-blue-700'
      case '失敗': return 'bg-red-100 text-red-700'
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">バックアップ管理</h1>
        <button onClick={createBackup} disabled={creating}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 disabled:opacity-60 text-sm">
          {creating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          {creating ? 'バックアップ作成中...' : 'バックアップを作成'}
        </button>
      </div>

      {/* Backup history */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">バックアップ履歴</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['日時', 'サイズ', 'タイプ', 'ステータス', 'ダウンロード'].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {backups.map((backup) => (
                <tr key={backup.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 text-gray-700 font-mono text-xs">{backup.date}</td>
                  <td className="px-5 py-3 text-gray-600">{backup.size}</td>
                  <td className="px-5 py-3">
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">{backup.type}</span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyle(backup.status)}`}>
                      {backup.status}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    {backup.status === '完了' && (
                      <button
                        onClick={() => toast.success('ダウンロードを開始しました')}
                        className="flex items-center gap-1 text-xs text-primary hover:text-primary-600"
                      >
                        <Download className="w-3.5 h-3.5" />
                        DL
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Auto backup settings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">自動バックアップ設定</h2>
          <button
            onClick={() => setSettings({ ...settings, autoBackup: !settings.autoBackup })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.autoBackup ? 'bg-primary' : 'bg-gray-200'}`}
          >
            <span className="inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform"
              style={{ transform: settings.autoBackup ? 'translateX(22px)' : 'translateX(2px)' }} />
          </button>
        </div>

        {settings.autoBackup && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">頻度</label>
                <select value={settings.frequency}
                  onChange={(e) => setSettings({ ...settings, frequency: e.target.value as Frequency })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary">
                  <option>日次</option>
                  <option>週次</option>
                  <option>月次</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">実行時刻</label>
                <input type="time" value={settings.time}
                  onChange={(e) => setSettings({ ...settings, time: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">保存先</label>
              <div className="flex gap-4">
                {[
                  { value: 'local' as const, label: 'ローカルサーバー' },
                  { value: 's3' as const, label: 'AWS S3' },
                ].map((opt) => (
                  <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="storage" value={opt.value}
                      checked={settings.storage === opt.value}
                      onChange={() => setSettings({ ...settings, storage: opt.value })}
                      className="accent-primary" />
                    <span className="text-sm text-gray-700">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary-600 disabled:opacity-60">
            <Save className="w-4 h-4" />
            {saving ? '保存中...' : '設定を保存'}
          </button>
        </div>
      </div>
    </div>
  )
}
