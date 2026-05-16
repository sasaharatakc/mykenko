'use client'

import { useQuery } from '@tanstack/react-query'
import { adminApi } from '@/lib/api'
import { formatDate } from '@/lib/utils'
import { Search, Eye } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'
import { Pagination } from '@/components/ui/Pagination'

const STATUSES = ['pending', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'failed']

function statusBadgeClass(status: string): string {
  switch (status) {
    case 'pending':          return 'bg-gray-100 text-gray-600'
    case 'picked_up':        return 'bg-blue-100 text-blue-700'
    case 'in_transit':       return 'bg-indigo-100 text-indigo-700'
    case 'out_for_delivery': return 'bg-orange-100 text-orange-700'
    case 'delivered':        return 'bg-green-100 text-green-700'
    case 'failed':           return 'bg-red-100 text-red-600'
    default:                 return 'bg-gray-100 text-gray-600'
  }
}

function statusLabel(status: string): string {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export default function AdminShipmentsPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin-shipments', { page, search, status }],
    queryFn: () =>
      adminApi
        .shipments({ page, per_page: 20, search: search || undefined, status: status || undefined })
        .then((r) => r.data),
  })

  const shipments = data?.data ?? []
  const meta = data?.meta

  return (
    <div className="space-y-5">
      <h1 className="font-display text-2xl font-bold text-gray-900">Shipments</h1>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search by tracking ID or order code…"
            className="input pl-9 py-2 text-sm w-full"
          />
        </div>
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1) }}
          className="input py-2 text-sm w-44"
        >
          <option value="">All Status</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{statusLabel(s)}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Order', 'Customer', 'Carrier', 'Tracking ID', 'Status', 'Est. Delivery', ''].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading
                ? [...Array(8)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(7)].map((_, j) => (
                      <td key={j} className="px-5 py-3"><div className="h-4 skeleton rounded" /></td>
                    ))}
                  </tr>
                ))
                : shipments.map((s: any) => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3">
                      <Link
                        href={`/admin/orders/${s.order_id}`}
                        className="font-mono font-medium text-primary-600 hover:text-primary-700 transition-colors"
                      >
                        #{s.order?.code ?? s.order_id}
                      </Link>
                    </td>
                    <td className="px-5 py-3">
                      <p className="font-medium text-gray-900">{s.order?.customer?.name ?? '—'}</p>
                      <p className="text-xs text-gray-400">{s.order?.customer?.email}</p>
                    </td>
                    <td className="px-5 py-3 text-gray-600">{s.carrier ?? '—'}</td>
                    <td className="px-5 py-3 font-mono text-xs text-gray-700">{s.tracking_id ?? '—'}</td>
                    <td className="px-5 py-3">
                      <span className={`badge text-2xs ${statusBadgeClass(s.status)}`}>
                        {statusLabel(s.status)}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-500 text-xs whitespace-nowrap">
                      {s.estimated_delivery_date
                        ? formatDate(s.estimated_delivery_date, { month: 'short', day: 'numeric', year: 'numeric' })
                        : '—'}
                    </td>
                    <td className="px-5 py-3">
                      <Link
                        href={`/admin/orders/${s.order_id}`}
                        className="w-7 h-7 flex items-center justify-center rounded text-gray-400 hover:text-primary-500 hover:bg-primary-50 transition-colors"
                        title="View Order"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {!isLoading && !shipments.length && (
          <div className="py-12 text-center text-gray-400">No shipments found</div>
        )}
      </div>

      {meta && meta.last_page > 1 && (
        <Pagination currentPage={meta.current_page} lastPage={meta.last_page} onPageChange={setPage} />
      )}
    </div>
  )
}
