'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/lib/api'
import { formatDate } from '@/lib/utils'
import { Search, UserCheck, UserX, Trash2, Download } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'

async function exportCustomersCsv() {
  try {
    const res = await adminApi.exportCustomers()
    const url = window.URL.createObjectURL(new Blob([res.data]))
    const a = document.createElement('a')
    a.href = url; a.download = `customers-${new Date().toISOString().slice(0,10)}.csv`
    document.body.appendChild(a); a.click(); a.remove()
    window.URL.revokeObjectURL(url)
  } catch { toast.error('エクスポートに失敗しました') }
}
import Link from 'next/link'
import { Pagination } from '@/components/ui/Pagination'

export default function AdminCustomersPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin-customers', { page, search }],
    queryFn: () => adminApi.customers({ page, per_page: 20, search: search || undefined }).then((r) => r.data),
  })

  const toggleMutation = useMutation({
    mutationFn: (id: number) => adminApi.toggleCustomer(id),
    onSuccess: () => {
      toast.success('Status updated')
      queryClient.invalidateQueries({ queryKey: ['admin-customers'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteCustomer(id),
    onSuccess: () => {
      toast.success('Customer deleted')
      queryClient.invalidateQueries({ queryKey: ['admin-customers'] })
    },
    onError: () => toast.error('Failed to delete'),
  })

  const customers = data?.data ?? []
  const meta = data?.meta

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-gray-900">顧客管理</h1>
        <button onClick={exportCustomersCsv} className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
          <Download className="w-4 h-4" /> CSV エクスポート
        </button>
      </div>

      <div className="card p-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search by name or email…"
            className="input pl-9 py-2 text-sm"
          />
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Customer', 'Orders', 'Reviews', 'Status', 'Joined', ''].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading
                ? [...Array(8)].map((_, i) => (
                  <tr key={i}>{[...Array(6)].map((_, j) => <td key={j} className="px-5 py-3"><div className="h-4 skeleton rounded" /></td>)}</tr>
                ))
                : customers.map((c: any) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3">
                      <Link href={`/admin/customers/${c.id}`} className="font-medium text-gray-900 hover:text-primary-500 transition-colors">{c.name}</Link>
                      <p className="text-xs text-gray-400">{c.email}</p>
                    </td>
                    <td className="px-5 py-3 text-gray-600">{c.orders_count}</td>
                    <td className="px-5 py-3 text-gray-600">{c.reviews_count}</td>
                    <td className="px-5 py-3">
                      <span className={`badge text-2xs ${c.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                        {c.is_active ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-400 text-xs">
                      {formatDate(c.created_at, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => toggleMutation.mutate(c.id)}
                          className={`w-7 h-7 flex items-center justify-center rounded transition-colors ${
                            c.is_active
                              ? 'text-gray-400 hover:text-orange-500 hover:bg-orange-50'
                              : 'text-gray-400 hover:text-green-500 hover:bg-green-50'
                          }`}
                          title={c.is_active ? 'Suspend' : 'Activate'}
                        >
                          {c.is_active ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => confirm('Delete customer permanently?') && deleteMutation.mutate(c.id)}
                          className="w-7 h-7 flex items-center justify-center rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
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
        {!isLoading && !customers.length && (
          <div className="py-12 text-center text-gray-400">No customers found</div>
        )}
      </div>

      {meta && meta.last_page > 1 && (
        <Pagination currentPage={meta.current_page} lastPage={meta.last_page} onPageChange={setPage} />
      )}
    </div>
  )
}
