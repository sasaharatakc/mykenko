'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { vendorApi } from '@/lib/api'
import { formatPrice, formatDate, getOrderStatusColor } from '@/lib/utils'
import { Search, Package, Truck } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { Pagination } from '@/components/ui/Pagination'

export default function VendorOrdersPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [shippingOrderId, setShippingOrderId] = useState<number | null>(null)
  const [trackingNumber, setTrackingNumber] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['vendor-orders', { page, search, status }],
    queryFn: () => vendorApi.orders({ page, per_page: 20, search: search || undefined, status: status || undefined }).then((r) => r.data),
  })

  const processMutation = useMutation({
    mutationFn: (id: number) => vendorApi.processOrder(id),
    onSuccess: () => {
      toast.success('Order marked as processing')
      queryClient.invalidateQueries({ queryKey: ['vendor-orders'] })
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Failed'),
  })

  const shipMutation = useMutation({
    mutationFn: ({ id, tracking }: { id: number; tracking: string }) =>
      vendorApi.shipOrder(id, { tracking_number: tracking }),
    onSuccess: () => {
      toast.success('Order marked as shipped')
      setShippingOrderId(null)
      setTrackingNumber('')
      queryClient.invalidateQueries({ queryKey: ['vendor-orders'] })
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Failed'),
  })

  const orders = data?.data ?? []
  const meta = data?.meta

  return (
    <div className="space-y-5">
      <h1 className="font-display text-2xl font-bold text-gray-900">Orders</h1>

      <div className="card p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search order code…"
            className="input pl-9 py-2 text-sm"
          />
        </div>
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1) }}
          className="input py-2 text-sm w-40"
        >
          <option value="">All Status</option>
          {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((s) => (
            <option key={s} value={s} className="capitalize">{s}</option>
          ))}
        </select>
      </div>

      {/* Ship Modal */}
      {shippingOrderId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/40" onClick={() => setShippingOrderId(null)} />
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="font-semibold text-gray-900 mb-4">Mark as Shipped</h3>
            <div>
              <label className="label">Tracking Number <span className="text-gray-400 font-normal">(optional)</span></label>
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                className="input"
                placeholder="e.g. 1Z999AA10123456784"
                autoFocus
              />
            </div>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => shipMutation.mutate({ id: shippingOrderId, tracking: trackingNumber })}
                disabled={shipMutation.isPending}
                className="btn-primary flex-1 disabled:opacity-60"
              >
                {shipMutation.isPending ? 'Saving…' : 'Confirm'}
              </button>
              <button onClick={() => setShippingOrderId(null)} className="btn border border-gray-200 text-gray-700 hover:bg-gray-50 flex-1">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Order', 'Customer', 'Items', 'Amount', 'Status', 'Date', 'Action'].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading
                ? [...Array(6)].map((_, i) => (
                  <tr key={i}>{[...Array(7)].map((_, j) => <td key={j} className="px-5 py-3"><div className="h-4 skeleton rounded" /></td>)}</tr>
                ))
                : orders.map((o: any) => (
                  <tr key={o.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 font-mono font-medium text-gray-900">#{o.code}</td>
                    <td className="px-5 py-3 text-gray-600">{o.customer?.name ?? '—'}</td>
                    <td className="px-5 py-3 text-gray-600">{o.item_count}</td>
                    <td className="px-5 py-3 font-medium">{formatPrice(o.total_amount)}</td>
                    <td className="px-5 py-3">
                      <span className={`badge text-2xs ${getOrderStatusColor(o.status)}`}>{o.status}</span>
                    </td>
                    <td className="px-5 py-3 text-gray-400 text-xs whitespace-nowrap">
                      {formatDate(o.created_at, { month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1">
                        {o.status === 'pending' && (
                          <button
                            onClick={() => processMutation.mutate(o.id)}
                            className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                          >
                            <Package className="w-3 h-3" /> Process
                          </button>
                        )}
                        {(o.status === 'pending' || o.status === 'processing') && (
                          <button
                            onClick={() => setShippingOrderId(o.id)}
                            className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors"
                          >
                            <Truck className="w-3 h-3" /> Ship
                          </button>
                        )}
                      </div>
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
