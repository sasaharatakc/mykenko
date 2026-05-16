'use client'

import { useState } from 'react'
import { Download, Trash2, Filter } from 'lucide-react'
import toast from 'react-hot-toast'

type LogLevel = 'ERROR' | 'WARNING' | 'INFO' | 'DEBUG'

interface LogEntry {
  id: number
  timestamp: string
  level: LogLevel
  category: string
  message: string
  ip: string
}

const MOCK_LOGS: LogEntry[] = [
  { id: 1, timestamp: '2024-01-15 10:30:42', level: 'ERROR', category: 'Auth', message: 'ログイン試行が5回失敗しました', ip: '192.168.1.1' },
  { id: 2, timestamp: '2024-01-15 10:28:15', level: 'INFO', category: 'Order', message: '新しい注文 #ORD-2024-001 が作成されました', ip: '10.0.0.1' },
  { id: 3, timestamp: '2024-01-15 10:25:03', level: 'WARNING', category: 'Payment', message: '決済タイムアウトが発生しました', ip: '10.0.0.2' },
  { id: 4, timestamp: '2024-01-15 10:22:47', level: 'INFO', category: 'Product', message: '商品在庫が更新されました: ID=123', ip: '—' },
  { id: 5, timestamp: '2024-01-15 10:20:33', level: 'DEBUG', category: 'Cache', message: 'キャッシュがクリアされました', ip: '—' },
  { id: 6, timestamp: '2024-01-15 10:18:22', level: 'ERROR', category: 'Email', message: 'メール送信に失敗しました: SMTP接続エラー', ip: '—' },
  { id: 7, timestamp: '2024-01-15 10:15:11', level: 'INFO', category: 'User', message: '管理者ログイン: admin@mykenko.jp', ip: '192.168.1.100' },
  { id: 8, timestamp: '2024-01-15 10:12:05', level: 'WARNING', category: 'Security', message: '不審なリクエストパターンを検出しました', ip: '45.33.32.156' },
  { id: 9, timestamp: '2024-01-15 10:09:44', level: 'INFO', category: 'Vendor', message: 'ベンダー承認: ショップID=45', ip: '—' },
  { id: 10, timestamp: '2024-01-15 10:07:30', level: 'DEBUG', category: 'DB', message: 'クエリ実行時間: 234ms (products テーブル)', ip: '—' },
]

const LEVEL_STYLES: Record<LogLevel, string> = {
  ERROR: 'bg-red-100 text-red-700',
  WARNING: 'bg-yellow-100 text-yellow-700',
  INFO: 'bg-blue-100 text-blue-700',
  DEBUG: 'bg-gray-100 text-gray-600',
}

export default function AdminLogsPage() {
  const [logs] = useState<LogEntry[]>(MOCK_LOGS)
  const [levelFilter, setLevelFilter] = useState<LogLevel | 'ALL'>('ALL')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const filtered = logs.filter((log) => {
    if (levelFilter !== 'ALL' && log.level !== levelFilter) return false
    return true
  })

  function handleDownload() {
    const csv = [
      'タイムスタンプ,レベル,カテゴリ,メッセージ,IPアドレス',
      ...filtered.map((l) => `"${l.timestamp}","${l.level}","${l.category}","${l.message}","${l.ip}"`),
    ].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `logs-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('ログをダウンロードしました')
  }

  function handleClear() {
    if (!confirm('すべてのログをクリアしますか？この操作は元に戻せません。')) return
    toast.success('ログをクリアしました')
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">システムログ</h1>
        <div className="flex items-center gap-2">
          <button onClick={handleDownload} className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
            <Download className="w-4 h-4" />
            ログをダウンロード
          </button>
          <button onClick={handleClear} className="flex items-center gap-2 px-3 py-2 border border-red-200 text-red-600 rounded-lg text-sm hover:bg-red-50">
            <Trash2 className="w-4 h-4" />
            ログをクリア
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-wrap items-center gap-3">
        <Filter className="w-4 h-4 text-gray-400" />
        <div className="flex gap-1 flex-wrap">
          {(['ALL', 'ERROR', 'WARNING', 'INFO', 'DEBUG'] as (LogLevel | 'ALL')[]).map((level) => (
            <button
              key={level}
              onClick={() => setLevelFilter(level)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                levelFilter === level
                  ? 'bg-primary text-white'
                  : level === 'ALL'
                  ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  : `${LEVEL_STYLES[level as LogLevel]} opacity-70 hover:opacity-100`
              }`}
            >
              {level === 'ALL' ? 'すべて' : level}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
            className="border border-gray-300 rounded-lg px-2 py-1.5 text-xs" />
          <span className="text-gray-400">〜</span>
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
            className="border border-gray-300 rounded-lg px-2 py-1.5 text-xs" />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['タイムスタンプ', 'レベル', 'カテゴリ', 'メッセージ', 'IPアドレス'].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 text-gray-400 text-xs font-mono whitespace-nowrap">{log.timestamp}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${LEVEL_STYLES[log.level]}`}>
                      {log.level}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-600 text-xs">{log.category}</td>
                  <td className="px-5 py-3 text-gray-700 max-w-xs truncate">{log.message}</td>
                  <td className="px-5 py-3 text-gray-400 text-xs font-mono">{log.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-gray-400">ログがありません</div>
        )}
      </div>

      <p className="text-xs text-gray-400 text-center">※ 表示データはモックデータです。実際のログは実装予定です。</p>
    </div>
  )
}
