'use client'

import { useState } from 'react'
import { Play, Pause, Play as PlayIcon, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'

interface CronJob {
  id: string
  name: string
  schedule: string
  scheduleHuman: string
  lastRun: string
  nextRun: string
  status: 'active' | 'inactive'
  running: boolean
}

const INITIAL_JOBS: CronJob[] = [
  {
    id: 'sitemap',
    name: 'サイトマップ生成',
    schedule: '0 2 * * *',
    scheduleHuman: '毎日 02:00',
    lastRun: '2024-01-15 02:00:03',
    nextRun: '2024-01-16 02:00:00',
    status: 'active',
    running: false,
  },
  {
    id: 'email',
    name: 'メール配信',
    schedule: '0 * * * *',
    scheduleHuman: '毎時',
    lastRun: '2024-01-15 10:00:01',
    nextRun: '2024-01-15 11:00:00',
    status: 'active',
    running: false,
  },
  {
    id: 'inventory',
    name: '在庫同期',
    schedule: '*/30 * * * *',
    scheduleHuman: '毎30分',
    lastRun: '2024-01-15 10:30:05',
    nextRun: '2024-01-15 11:00:00',
    status: 'active',
    running: false,
  },
  {
    id: 'cache',
    name: 'キャッシュクリア',
    schedule: '0 3 * * *',
    scheduleHuman: '毎日 03:00',
    lastRun: '2024-01-15 03:00:02',
    nextRun: '2024-01-16 03:00:00',
    status: 'active',
    running: false,
  },
  {
    id: 'backup',
    name: 'バックアップ',
    schedule: '0 1 * * 0',
    scheduleHuman: '毎週日曜 01:00',
    lastRun: '2024-01-14 01:00:08',
    nextRun: '2024-01-21 01:00:00',
    status: 'active',
    running: false,
  },
]

export default function AdminCronPage() {
  const [jobs, setJobs] = useState<CronJob[]>(INITIAL_JOBS)

  function toggleJob(id: string) {
    setJobs((prev) =>
      prev.map((j) =>
        j.id === id
          ? { ...j, status: j.status === 'active' ? 'inactive' : 'active' }
          : j
      )
    )
    const job = jobs.find((j) => j.id === id)!
    toast.success(`${job.name}を${job.status === 'active' ? '無効化' : '有効化'}しました`)
  }

  async function runJob(id: string) {
    const job = jobs.find((j) => j.id === id)!
    setJobs((prev) => prev.map((j) => j.id === id ? { ...j, running: true } : j))
    await new Promise((r) => setTimeout(r, 1500))
    setJobs((prev) => prev.map((j) =>
      j.id === id ? { ...j, running: false, lastRun: new Date().toLocaleString('ja-JP') } : j
    ))
    toast.success(`${job.name}を実行しました`)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Cronジョブ管理</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['ジョブ名', 'スケジュール', '最終実行', '次回実行', 'ステータス', 'アクション'].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {jobs.map((job) => (
                <tr key={job.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      {job.running && <RefreshCw className="w-3.5 h-3.5 text-primary animate-spin" />}
                      <span className="font-medium text-gray-900">{job.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-gray-700">{job.scheduleHuman}</span>
                    <p className="text-xs text-gray-400 font-mono">{job.schedule}</p>
                  </td>
                  <td className="px-5 py-3 text-gray-400 text-xs">{job.lastRun}</td>
                  <td className="px-5 py-3 text-gray-400 text-xs">{job.status === 'active' ? job.nextRun : '—'}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      job.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {job.status === 'active' ? '有効' : '無効'}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => runJob(job.id)}
                        disabled={job.running || job.status === 'inactive'}
                        className="flex items-center gap-1 px-2.5 py-1.5 text-xs border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-40"
                        title="手動実行"
                      >
                        {job.running ? <RefreshCw className="w-3 h-3 animate-spin" /> : <PlayIcon className="w-3 h-3" />}
                        実行
                      </button>
                      <button
                        onClick={() => toggleJob(job.id)}
                        className={`flex items-center gap-1 px-2.5 py-1.5 text-xs border rounded-lg transition-colors ${
                          job.status === 'active'
                            ? 'border-orange-200 text-orange-600 hover:bg-orange-50'
                            : 'border-green-200 text-green-600 hover:bg-green-50'
                        }`}
                      >
                        {job.status === 'active' ? (
                          <><Pause className="w-3 h-3" />無効化</>
                        ) : (
                          <><Play className="w-3 h-3" />有効化</>
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-gray-400 text-center">※ 表示データはモックです。実際のCronジョブはバックエンド実装後に連携されます。</p>
    </div>
  )
}
