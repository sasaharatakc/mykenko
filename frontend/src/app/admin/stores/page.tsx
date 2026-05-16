'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/lib/api'
import { formatPrice } from '@/lib/utils'
import { Search, BadgeCheck, X, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { Pagination } from '@/components/ui/Pagination'

export default function AdminStoresPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState<'all' | 'pending'>('all')

  const { data, isLoading } = useQuery({
    queryKey: ['admin-stores', { page, search, tab }],
    queryFn: () => adminApi.stores({
      page,
      per_page: 20,
      search: search || undefined,
      is_verified: tab === 'pending' ? 0 : undefined,
    }).then((r) => r.data),
  })

  const verifyMutation = useMutation({
    mutationFn: (id: number) => adminApi.verifyStore(id),
    onSuccess: () => {
      toast.success('Store verified')
      queryClient.invalidateQueries({ queryKey: ['admin-stores'] })
    },
  })

  const stores = data?.data ?? []
  const meta = data?.meta

  return (
    <div className="space-y-5">
      <h1 className="font-display text-2xl font-bold text-gray-900">Vendors</h1>

      <div className="card p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search vendors…"
            className="input pl-9 py-2 text-sm"
          />
        </div>
        <div className="flex rounded-lg border border-gray-200 overflow-hidden text-sm">
          {(['all', 'pending'] as const).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setPage(1) }}
              className={`px-4 py-2 capitalize transition-colors ${tab === t ? 'bg-primary-500 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Store', 'Products', 'Orders', 'Revenue', 'Verified', ''].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading
                ? [...Array(6)].map((_, i) => (
                  <tr key={i}>{[...Array(6)].map((_, j) => <td key={j} className="px-5 py-3"><div className="h-4 skeleton rounded" /></td>)}</tr>
                ))
                : stores.map((s: any) => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3">
                      <Link href={`/admin/stores/${s.id}`} className="font-medium text-gray-900 hover:text-primary-500 transition-colors">{s.name}</Link>
                      <p className="text-xs text-gray-400">{s.owner?.email}</p>
                    </td>
                    <td className="px-5 py-3 text-gray-600">{s.products_count}</td>
                    <td className="px-5 py-3 text-gray-600">{s.orders_count}</td>
                    <td className="px-5 py-3 font-medium">{formatPrice(s.revenues_sum_sub_amount ?? 0)}</td>
                    <td className="px-5 py-3">
                      {s.is_verified ? (
                        <span className="flex items-center gap-1 text-xs text-primary-500 font-medium">
                          <BadgeCheck className="w-3.5 h-3.5" /> Verified
                        </span>
                      ) : (
                        <button
                          onClick={() => verifyMutation.mutate(s.id)}
                          className="btn border border-primary-200 text-primary-600 text-xs py-1 px-3 hover:bg-primary-50"
                        >
                          Verify
                        </button>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <Link href={`/admin/stores/${s.id}`} className="text-primary-500 hover:text-primary-600">
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        {!isLoading && !stores.length && (
          <div className="py-12 text-center text-gray-400">No vendors found</div>
        )}
      </div>

      {meta && meta.last_page > 1 && (
        <Pagination currentPage={meta.current_page} lastPage={meta.last_page} onPageChange={setPage} />
      )}
    </div>
  )
}
