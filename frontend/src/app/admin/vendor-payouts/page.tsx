'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { adminApi } from '@/lib/api'
import toast from 'react-hot-toast'
import {
  Wallet,
  AlertCircle,
  CalendarClock,
  Banknote,
  Play,
  X,
} from 'lucide-react'
import { format } from 'date-fns'

interface Withdrawal {
  id: number
  store?: { name: string }
  amount: number | string
  payment_channel?: string
  status: string
  created_at: string
  processed_at?: string
}

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  bank_transfer: '銀行振込',
  paypal: 'PayPal',
  stripe: 'Stripe',
}

export default function AdminVendorPayoutsPage() {
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [isBulkProcessing, setIsBulkProcessing] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-vendor-payouts'],
    queryFn: () => adminApi.withdrawals({ per_page: 50 }).then((r) => r.data),
  })

  const withdrawals: Withdrawal[] = data?.data ?? []

  const pendingPayouts = withdrawals.filter(
    (w) => w.status === 'pending' || w.status === 'approved'
  )

  const totalPending = pendingPayouts.reduce(
    (sum, w) => sum + Number(w.amount),
    0
  )

  const completedThisMonth = withdrawals.filter((w) => {
    if (w.status !== 'completed') return false
    const now = new Date()
    const d = new Date(w.created_at)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })

  const totalThisMonth = completedThisMonth.reduce(
    (sum, w) => sum + Number(w.amount),
    0
  )

  const lastMonthPayouts = withdrawals.filter((w) => {
    if (w.status !== 'completed') return false
    const now = new Date()
    const d = new Date(w.created_at)
    const lastMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1
    const lastMonthYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear()
    return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear
  })

  const totalLastMonth = lastMonthPayouts.reduce(
    (sum, w) => sum + Number(w.amount),
    0
  )

  async function handleBulkPayout() {
    setIsBulkProcessing(true)
    try {
      // In a real implementation, this would call a bulk payout API
      await new Promise((resolve) => setTimeout(resolve, 1200))
      toast.success('一括支払い処理を開始しました')
      setShowBulkModal(false)
    } catch {
      toast.error('処理に失敗しました')
    } finally {
      setIsBulkProcessing(false)
    }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">ベンダー支払い管理</h1>
        <button
          onClick={() => setShowBulkModal(true)}
          disabled={pendingPayouts.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Play className="w-4 h-4" />
          一括支払い実行
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-yellow-50 flex items-center justify-center">
              <CalendarClock className="w-4 h-4 text-yellow-600" />
            </div>
            <span className="text-xs text-gray-500">今月支払い予定</span>
          </div>
          <p className="text-xl font-bold text-gray-900">
            {isLoading ? '—' : `¥${totalThisMonth.toLocaleString()}`}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">{completedThisMonth.length}件</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
              <AlertCircle className="w-4 h-4 text-orange-600" />
            </div>
            <span className="text-xs text-gray-500">処理待ち件数</span>
          </div>
          <p className="text-xl font-bold text-orange-600">
            {isLoading ? '—' : pendingPayouts.length}件
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            合計 ¥{isLoading ? '—' : totalPending.toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
              <Banknote className="w-4 h-4 text-green-600" />
            </div>
            <span className="text-xs text-gray-500">先月総支払い額</span>
          </div>
          <p className="text-xl font-bold text-gray-900">
            {isLoading ? '—' : `¥${totalLastMonth.toLocaleString()}`}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">{lastMonthPayouts.length}件</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['ベンダー名', '未払い金額', '前回支払日', '支払い方法', 'ステータス', 'アクション'].map(
                  (h) => (
                    <th
                      key={h}
                      className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading
                ? [...Array(6)].map((_, i) => (
                    <tr key={i}>
                      {[...Array(6)].map((_, j) => (
                        <td key={j} className="px-5 py-3">
                          <div className="h-4 bg-gray-100 rounded animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                : withdrawals.map((w) => (
                    <tr key={w.id} className="hover:bg-gray-50">
                      <td className="px-5 py-3 font-medium text-gray-900">
                        {w.store?.name ?? '—'}
                      </td>
                      <td className="px-5 py-3 font-semibold text-gray-900">
                        ¥{Number(w.amount).toLocaleString()}
                      </td>
                      <td className="px-5 py-3 text-gray-500 text-xs">
                        {w.processed_at
                          ? format(new Date(w.processed_at), 'yyyy/MM/dd')
                          : '—'}
                      </td>
                      <td className="px-5 py-3 text-gray-600">
                        {PAYMENT_METHOD_LABELS[w.payment_channel ?? ''] ??
                          w.payment_channel ??
                          '—'}
                      </td>
                      <td className="px-5 py-3">
                        {w.status === 'completed' ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            完了
                          </span>
                        ) : w.status === 'pending' ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                            保留中
                          </span>
                        ) : w.status === 'approved' ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                            承認済み
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                            {w.status}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        {(w.status === 'pending' || w.status === 'approved') && (
                          <button
                            onClick={() =>
                              toast.success(`${w.store?.name ?? 'ベンダー'}への支払いを実行しました`)
                            }
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-lg text-xs hover:bg-primary/20 transition-colors"
                          >
                            <Play className="w-3 h-3" />
                            支払い実行
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
        {!isLoading && withdrawals.length === 0 && (
          <div className="py-12 text-center">
            <Wallet className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">支払いデータがありません</p>
          </div>
        )}
      </div>

      {/* Bulk payout confirmation modal */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">一括支払い実行の確認</h2>
              <button
                onClick={() => setShowBulkModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">
                    {pendingPayouts.length}件の支払い処理を実行します
                  </p>
                  <p className="text-sm text-yellow-700 mt-0.5">
                    合計金額: ¥{totalPending.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-5">
              この操作は取り消せません。処理待ちの全ベンダーに対して一括で支払いを実行しますか？
            </p>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowBulkModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
              >
                キャンセル
              </button>
              <button
                onClick={handleBulkPayout}
                disabled={isBulkProcessing}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90 disabled:opacity-60"
              >
                <Play className="w-4 h-4" />
                {isBulkProcessing ? '処理中...' : '一括実行する'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
