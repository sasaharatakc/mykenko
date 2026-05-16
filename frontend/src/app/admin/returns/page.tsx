'use client'

import { useQuery } from '@tanstack/react-query'
import { adminApi } from '@/lib/api'
import { formatDate, formatPrice } from '@/lib/utils'
import { Eye } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'
import { Pagination } from '@/components/ui/Pagination'

const STATUSES = ['pending', 'processing', 'approved', 'rejected', 'completed']

function statusBadgeClass(status: string): string {
  switch (status) {
    case 'pending':    return 'bg-yellow-100 text-yellow-700'
    case 'processing': return 'bg-blue-100 text-blue-700'
    case 'approved':   return 'bg-green-100 text-green-700'
    case 'rejected':   return 'bg-red-100 text-red-600'
    case 'completed':  return 'bg-teal-100 text-teal-700'
    default:           return 'bg-gray-100 text-gray-600'
  }
}

function statusLabel(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

export default function AdminReturnsPage() {
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin-returns', { page, status }],
    queryFn: () =>
      adminApi
        .returns({ page, per_page: 20, status: status || undefined })
        .then((r) => r.data),
  })

  const returns = data?.data ?? []
  const meta = data?.meta

  return (
    <div className="space-y-5">
      <h1 className="font-display text-2xl font-bold text-gray-900">Returns</h1>

      {/* Filter */}
      <div className="card p-4 flex flex-wrap gap-3">
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
                {['Return ID', 'Order', 'Customer', 'Reason', 'Refund Amount', 'Status', 'Date', ''].map((h) => (
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
                    {[...Array(8)].map((_, j) => (
                      <td key={j} className="px-5 py-3"><div className="h-4 skeleton rounded" /></td>
                    ))}
                  </tr>
                ))
                : returns.map((r: any) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 font-mono font-medium text-gray-900">#{r.id}</td>
                    <td className="px-5 py-3">
                      <Link
                        href={`/admin/orders/${r.order_id}`}
                        className="font-mono text-primary-600 hover:text-primary-700 transition-colors"
                      >
                        #{r.order?.code ?? r.order_id}
                      </Link>
                    </td>
                    <td className="px-5 py-3">
                      <p className="font-medium text-gray-900">{r.customer?.name ?? r.order?.customer?.name ?? '—'}</p>
                      <p className="text-xs text-gray-400">{r.customer?.email ?? r.order?.customer?.email}</p>
                    </td>
                    <td className="px-5 py-3 text-gray-600 max-w-[160px] truncate" title={r.return_reason}>
                      {r.return_reason ?? '—'}
                    </td>
                    <td className="px-5 py-3 font-medium text-gray-900">
                      {r.refund_amount != null ? formatPrice(r.refund_amount) : '—'}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`badge text-2xs ${statusBadgeClass(r.status)}`}>
                        {statusLabel(r.status)}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-400 text-xs whitespace-nowrap">
                      {formatDate(r.created_at, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-3">
                      <Link
                        href={`/admin/returns/${r.id}`}
                        className="w-7 h-7 flex items-center justify-center rounded text-gray-400 hover:text-primary-500 hover:bg-primary-50 transition-colors"
                        title="View Return"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {!isLoading && !returns.length && (
          <div className="py-12 text-center text-gray-400">No returns found</div>
        )}
      </div>

      {meta && meta.last_page > 1 && (
        <Pagination currentPage={meta.current_page} lastPage={meta.last_page} onPageChange={setPage} />
      )}
    </div>
  )
}
