'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/lib/api'
import toast from 'react-hot-toast'
import { Star, CheckCircle, XCircle, Trash2, Search } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { Pagination } from '@/components/ui/Pagination'

const STATUS_STYLES: Record<string, string> = {
  pending:  'bg-amber-100 text-amber-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-600',
}

function StarRating({ value }: { value: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} className={`w-3.5 h-3.5 ${i <= value ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}`} />
      ))}
    </div>
  )
}

export default function AdminReviewsPage() {
  const qc = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin-reviews', { page, search, statusFilter }],
    queryFn: () => adminApi.reviews({ page, per_page: 20, search: search || undefined, status: statusFilter || undefined }).then(r => r.data),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => adminApi.updateReview(id, { status }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-reviews'] }); toast.success('Review updated') },
    onError: () => toast.error('Failed to update review'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteReview(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-reviews'] }); toast.success('Review deleted') },
    onError: () => toast.error('Failed to delete'),
  })

  const reviews = data?.data ?? []
  const meta = data?.meta

  return (
    <div className="space-y-5">
      <h1 className="font-display text-2xl font-bold text-gray-900">Product Reviews</h1>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} placeholder="Search by customer…"
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
        </div>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Product', 'Customer', 'Rating', 'Comment', 'Status', 'Date', ''].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading
                ? [...Array(8)].map((_, i) => (
                  <tr key={i}>{[...Array(7)].map((_, j) => <td key={j} className="px-5 py-3"><div className="h-4 skeleton rounded" /></td>)}</tr>
                ))
                : reviews.map((r: any) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 max-w-[160px]">
                      <p className="font-medium text-gray-800 truncate">{r.product?.name ?? '—'}</p>
                    </td>
                    <td className="px-5 py-3">
                      <p className="font-medium text-gray-800">{r.customer?.name ?? '—'}</p>
                      <p className="text-xs text-gray-400">{r.customer?.email}</p>
                    </td>
                    <td className="px-5 py-3">
                      <StarRating value={r.star ?? 0} />
                      <span className="text-xs text-gray-400 mt-0.5 block">{r.star}/5</span>
                    </td>
                    <td className="px-5 py-3 max-w-[200px]">
                      <p className="text-gray-600 text-sm line-clamp-2">{r.comment}</p>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`badge text-xs ${STATUS_STYLES[r.status] ?? 'bg-gray-100 text-gray-500'}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-400 text-xs">
                      {formatDate(r.created_at, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1">
                        {r.status !== 'approved' && (
                          <button
                            onClick={() => updateMutation.mutate({ id: r.id, status: 'approved' })}
                            className="w-7 h-7 flex items-center justify-center rounded text-gray-400 hover:text-green-500 hover:bg-green-50 transition-colors"
                            title="Approve"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        {r.status !== 'rejected' && (
                          <button
                            onClick={() => updateMutation.mutate({ id: r.id, status: 'rejected' })}
                            className="w-7 h-7 flex items-center justify-center rounded text-gray-400 hover:text-orange-500 hover:bg-orange-50 transition-colors"
                            title="Reject"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => confirm('Delete this review permanently?') && deleteMutation.mutate(r.id)}
                          className="w-7 h-7 flex items-center justify-center rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        {!isLoading && !reviews.length && (
          <div className="py-12 text-center text-gray-400">No reviews found</div>
        )}
      </div>

      {meta && meta.last_page > 1 && (
        <Pagination currentPage={meta.current_page} lastPage={meta.last_page} onPageChange={setPage} />
      )}
    </div>
  )
}
