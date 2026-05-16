'use client'

import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { adminApi } from '@/lib/api'
import { CreditCard, Banknote, Wallet, Building2, TrendingUp } from 'lucide-react'
import { format } from 'date-fns'

interface Order {
  id: number
  code: string
  customer?: { name: string }
  payment_method: string
  total: number | string
  payment_status: string
  created_at: string
}

const PAYMENT_METHOD_LABELS: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
  stripe:       { label: 'Stripe', className: 'bg-indigo-100 text-indigo-700', icon: <CreditCard className="w-3 h-3" /> },
  paypal:       { label: 'PayPal', className: 'bg-blue-100 text-blue-700', icon: <Wallet className="w-3 h-3" /> },
  cod:          { label: '代金引換', className: 'bg-orange-100 text-orange-700', icon: <Banknote className="w-3 h-3" /> },
  bank_transfer:{ label: '銀行振込', className: 'bg-teal-100 text-teal-700', icon: <Building2 className="w-3 h-3" /> },
}

const PAYMENT_STATUS_STYLES: Record<string, string> = {
  paid:     'bg-green-100 text-green-700',
  pending:  'bg-yellow-100 text-yellow-700',
  failed:   'bg-red-100 text-red-700',
  refunded: 'bg-blue-100 text-blue-700',
}

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  paid:     '支払い済み',
  pending:  '保留中',
  failed:   '失敗',
  refunded: '返金済み',
}

export default function AdminPaymentsPage() {
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [methodFilter, setMethodFilter] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin-payments'],
    queryFn: () => adminApi.orders({ per_page: 50 }).then((r) => r.data),
  })

  const allOrders: Order[] = data?.data ?? []

  const filteredOrders = useMemo(() => {
    return allOrders.filter((o) => {
      if (methodFilter && o.payment_method !== methodFilter) return false
      if (dateFrom && o.created_at < dateFrom) return false
      if (dateTo && o.created_at > dateTo + 'T23:59:59') return false
      return true
    })
  }, [allOrders, methodFilter, dateFrom, dateTo])

  const totalCollected = useMemo(
    () =>
      filteredOrders
        .filter((o) => o.payment_status === 'paid')
        .reduce((sum, o) => sum + Number(o.total), 0),
    [filteredOrders]
  )

  const paidCount = filteredOrders.filter((o) => o.payment_status === 'paid').length
  const pendingCount = filteredOrders.filter((o) => o.payment_status === 'pending').length
  const failedCount = filteredOrders.filter((o) => o.payment_status === 'failed').length

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">決済管理</h1>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-green-600" />
            </div>
            <span className="text-xs text-gray-500">総受取金額</span>
          </div>
          <p className="text-xl font-bold text-gray-900">
            {isLoading ? '—' : `¥${totalCollected.toLocaleString()}`}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">支払い済み</p>
          <p className="text-2xl font-bold text-green-600">{isLoading ? '—' : paidCount}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">保留中</p>
          <p className="text-2xl font-bold text-yellow-600">{isLoading ? '—' : pendingCount}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">失敗</p>
          <p className="text-2xl font-bold text-red-600">{isLoading ? '—' : failedCount}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">開始日</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">終了日</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">支払い方法</label>
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">すべて</option>
              <option value="stripe">Stripe</option>
              <option value="paypal">PayPal</option>
              <option value="cod">代金引換</option>
              <option value="bank_transfer">銀行振込</option>
            </select>
          </div>
          {(dateFrom || dateTo || methodFilter) && (
            <button
              onClick={() => { setDateFrom(''); setDateTo(''); setMethodFilter('') }}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
            >
              フィルターをクリア
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['注文番号', '顧客', '支払い方法', '金額', '決済状態', '日時'].map((h) => (
                  <th
                    key={h}
                    className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading
                ? [...Array(8)].map((_, i) => (
                    <tr key={i}>
                      {[...Array(6)].map((_, j) => (
                        <td key={j} className="px-5 py-3">
                          <div className="h-4 bg-gray-100 rounded animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                : filteredOrders.map((o) => {
                    const method =
                      PAYMENT_METHOD_LABELS[o.payment_method] ?? {
                        label: o.payment_method,
                        className: 'bg-gray-100 text-gray-600',
                        icon: <CreditCard className="w-3 h-3" />,
                      }
                    const statusClass =
                      PAYMENT_STATUS_STYLES[o.payment_status] ?? 'bg-gray-100 text-gray-600'
                    const statusLabel =
                      PAYMENT_STATUS_LABELS[o.payment_status] ?? o.payment_status

                    return (
                      <tr key={o.id} className="hover:bg-gray-50">
                        <td className="px-5 py-3 font-mono text-xs font-semibold text-gray-700">
                          #{o.code}
                        </td>
                        <td className="px-5 py-3 text-gray-900">
                          {o.customer?.name ?? '—'}
                        </td>
                        <td className="px-5 py-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${method.className}`}
                          >
                            {method.icon}
                            {method.label}
                          </span>
                        </td>
                        <td className="px-5 py-3 font-semibold text-gray-900">
                          ¥{Number(o.total).toLocaleString()}
                        </td>
                        <td className="px-5 py-3">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClass}`}
                          >
                            {statusLabel}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-gray-400 text-xs">
                          {o.created_at
                            ? format(new Date(o.created_at), 'yyyy/MM/dd HH:mm')
                            : '—'}
                        </td>
                      </tr>
                    )
                  })}
            </tbody>
          </table>
        </div>
        {!isLoading && filteredOrders.length === 0 && (
          <div className="py-12 text-center">
            <CreditCard className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">該当する決済データがありません</p>
          </div>
        )}
      </div>
    </div>
  )
}
