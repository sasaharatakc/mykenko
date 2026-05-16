'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/lib/api'
import { formatPrice, formatDate, getOrderStatusColor, getPaymentStatusColor } from '@/lib/utils'
import { Search, ChevronRight, Download } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'

async function exportOrdersCsv() {
  try {
    const res = await adminApi.exportOrders()
    const url = window.URL.createObjectURL(new Blob([res.data]))
    const a = document.createElement('a')
    a.href = url; a.download = `orders-${new Date().toISOString().slice(0,10)}.csv`
    document.body.appendChild(a); a.click(); a.remove()
    window.URL.revokeObjectURL(url)
  } catch { toast.error('エクスポートに失敗しました') }
}
import Link from 'next/link'
import { Pagination } from '@/components/ui/Pagination'

export default function AdminOrdersPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [paymentStatus, setPaymentStatus] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', { page, search, status, paymentStatus, dateFrom, dateTo }],
    queryFn: () => adminApi.orders({
      page, per_page: 20,
      search: search || undefined,
      status: status || undefined,
      payment_status: paymentStatus || undefined,
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
    }).then((r) => r.data),
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      adminApi.updateOrderStatus(id, { status }),
    onSuccess: () => {
      toast.success('Order status updated')
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] })
    },
    onError: () => toast.error('Failed to update'),
  })

  const orders = data?.data ?? []
  const meta = data?.meta

  const STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'completed', 'cancelled', 'refunded']

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-gray-900">注文管理</h1>
        <button onClick={exportOrdersCsv} className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
          <Download className="w-4 h-4" /> CSV エクスポート
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder="Order code or customer email…"
            className="input pl-9 py-2 text-sm"
          />
        </div>
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1) }}
          className="input py-2 text-sm w-36"
        >
          <option value="">全ステータス</option>
          {STATUSES.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
        </select>
        <select
          value={paymentStatus}
          onChange={(e) => { setPaymentStatus(e.target.value); setPage(1) }}
          className="input py-2 text-sm w-36"
        >
          <option value="">全支払い</option>
          {['pending', 'completed', 'failed', 'refunded'].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => { setDateFrom(e.target.value); setPage(1) }}
          className="input py-2 text-sm w-36"
          title="開始日"
        />
        <input
          type="date"
          value={dateTo}
          onChange={(e) => { setDateTo(e.target.value); setPage(1) }}
          className="input py-2 text-sm w-36"
          title="終了日"
        />
        {(status || paymentStatus || dateFrom || dateTo || search) && (
          <button
            onClick={() => { setStatus(''); setPaymentStatus(''); setDateFrom(''); setDateTo(''); setSearch(''); setPage(1) }}
            className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg"
          >
            クリア
          </button>
        )}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Order', 'Customer', 'Store', 'Items', 'Amount', 'Status', 'Payment', 'Date', ''].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading
                ? [...Array(8)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(9)].map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 skeleton rounded" /></td>
                    ))}
                  </tr>
                ))
                : orders.map((o: any) => (
                  <tr key={o.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono font-medium text-gray-900">#{o.code}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{o.customer?.name ?? '—'}</p>
                      <p className="text-xs text-gray-400">{o.customer?.email}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{o.store?.name ?? 'Platform'}</td>
                    <td className="px-4 py-3 text-gray-600">{o.item_count}</td>
                    <td className="px-4 py-3 font-medium">{formatPrice(o.total_amount)}</td>
                    <td className="px-4 py-3">
                      <select
                        value={o.status}
                        onChange={(e) => statusMutation.mutate({ id: o.id, status: e.target.value })}
                        className={`text-xs font-medium px-2 py-1 rounded-full border-0 outline-none cursor-pointer ${getOrderStatusColor(o.status)}`}
                      >
                        {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge text-2xs ${getPaymentStatusColor(o.payment_status)}`}>
                        {o.payment_status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                      {formatDate(o.created_at, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/orders/${o.id}`} className="text-primary-500 hover:text-primary-600">
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {!isLoading && !orders.length && (
          <div className="py-12 text-center text-gray-400">No orders found</div>
        )}
      </div>

      {meta && meta.last_page > 1 && (
        <Pagination currentPage={meta.current_page} lastPage={meta.last_page} onPageChange={setPage} />
      )}
    </div>
  )
}
