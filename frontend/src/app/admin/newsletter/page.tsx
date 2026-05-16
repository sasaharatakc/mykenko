'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/lib/api'
import toast from 'react-hot-toast'
import { Search, Trash2, Mail, Users, UserX } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { Pagination } from '@/components/ui/Pagination'

export default function AdminNewsletterPage() {
  const qc = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const { data: stats } = useQuery({
    queryKey: ['admin', 'newsletter-stats'],
    queryFn: () => adminApi.newsletterStats().then(r => r.data.data),
  })

  const { data, isLoading } = useQuery({
    queryKey: ['admin-newsletter', { page, search, statusFilter }],
    queryFn: () => adminApi.newsletter({ page, per_page: 20, search: search || undefined, status: statusFilter || undefined }).then(r => r.data),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteSubscriber(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-newsletter'] })
      qc.invalidateQueries({ queryKey: ['admin', 'newsletter-stats'] })
      toast.success('Subscriber removed')
    },
    onError: () => toast.error('Failed to delete'),
  })

  const subscribers = data?.data ?? []
  const meta = data?.meta

  const statCards = [
    { label: 'Total Subscribers', value: stats?.total ?? 0, Icon: Users, color: 'text-blue-500' },
    { label: 'Active', value: stats?.active ?? 0, Icon: Mail, color: 'text-green-500' },
    { label: 'Unsubscribed', value: stats?.unsubscribed ?? 0, Icon: UserX, color: 'text-red-400' },
  ]

  return (
    <div className="space-y-5">
      <h1 className="font-display text-2xl font-bold text-gray-900">Newsletter Subscribers</h1>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {statCards.map(({ label, value, Icon, color }) => (
          <div key={label} className="card p-5 flex items-center gap-4">
            <div className={`p-3 rounded-xl bg-gray-50 ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</p>
              <p className="text-sm text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} placeholder="Search by email…"
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
        </div>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
          <option value="">All</option>
          <option value="active">Active</option>
          <option value="unsubscribed">Unsubscribed</option>
        </select>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Email', 'Confirmed', 'Status', 'Subscribed Date', ''].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading
                ? [...Array(8)].map((_, i) => (
                  <tr key={i}>{[...Array(5)].map((_, j) => <td key={j} className="px-5 py-3"><div className="h-4 skeleton rounded" /></td>)}</tr>
                ))
                : subscribers.map((s: any) => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 font-medium text-gray-900">{s.email}</td>
                    <td className="px-5 py-3 text-gray-500 text-xs">
                      {s.confirmed_at
                        ? formatDate(s.confirmed_at, { month: 'short', day: 'numeric', year: 'numeric' })
                        : <span className="text-amber-500">Pending</span>}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`badge text-xs ${s.unsubscribed_at ? 'bg-red-100 text-red-500' : 'bg-green-100 text-green-700'}`}>
                        {s.unsubscribed_at ? 'Unsubscribed' : 'Active'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-400 text-xs">
                      {formatDate(s.created_at, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => confirm('Remove subscriber?') && deleteMutation.mutate(s.id)}
                        className="w-7 h-7 flex items-center justify-center rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        {!isLoading && !subscribers.length && (
          <div className="py-12 text-center text-gray-400">No subscribers found</div>
        )}
      </div>

      {meta && meta.last_page > 1 && (
        <Pagination currentPage={meta.current_page} lastPage={meta.last_page} onPageChange={setPage} />
      )}
    </div>
  )
}
