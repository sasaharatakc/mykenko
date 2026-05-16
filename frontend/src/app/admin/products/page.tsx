'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/lib/api'
import { formatPrice } from '@/lib/utils'
import { Plus, Pencil, Trash2, Search, Filter } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { Pagination } from '@/components/ui/Pagination'

export default function AdminProductsPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [selected, setSelected] = useState<number[]>([])

  const { data, isLoading } = useQuery({
    queryKey: ['admin-products', { page, search, status }],
    queryFn: () => adminApi.products({ page, per_page: 20, search: search || undefined, status: status || undefined }).then((r) => r.data),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteProduct(id),
    onSuccess: () => {
      toast.success('Product deleted')
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
    },
    onError: () => toast.error('Failed to delete'),
  })

  const bulkMutation = useMutation({
    mutationFn: (action: string) => adminApi.bulkProducts({ ids: selected, action }),
    onSuccess: () => {
      toast.success('Action applied')
      setSelected([])
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
    },
  })

  const products = data?.data ?? []
  const meta = data?.meta

  const toggleSelect = (id: number) =>
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])

  const toggleAll = () =>
    setSelected(selected.length === products.length ? [] : products.map((p: any) => p.id))

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="font-display text-2xl font-bold text-gray-900">Products</h1>
        <Link href="/admin/products/new" className="btn-primary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> Add Product
        </Link>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search products…"
            className="input pl-9 py-2 text-sm"
          />
        </div>
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1) }}
          className="input py-2 text-sm w-36"
        >
          <option value="">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="pending">Pending</option>
        </select>

        {selected.length > 0 && (
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-sm text-gray-500">{selected.length} selected</span>
            <button onClick={() => bulkMutation.mutate('publish')} className="btn border border-gray-200 text-xs py-1.5 px-3 hover:bg-gray-50">Publish</button>
            <button onClick={() => bulkMutation.mutate('draft')} className="btn border border-gray-200 text-xs py-1.5 px-3 hover:bg-gray-50">Draft</button>
            <button onClick={() => bulkMutation.mutate('delete')} className="btn border border-red-200 text-red-600 text-xs py-1.5 px-3 hover:bg-red-50">Delete</button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="w-10 px-4 py-3">
                  <input type="checkbox" checked={selected.length === products.length && products.length > 0} onChange={toggleAll} className="rounded" />
                </th>
                {['Product', 'SKU', 'Price', 'Stock', 'Status', 'Store', ''].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading
                ? [...Array(8)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(8)].map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 skeleton rounded" /></td>
                    ))}
                  </tr>
                ))
                : products.map((p: any) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <input type="checkbox" checked={selected.includes(p.id)} onChange={() => toggleSelect(p.id)} className="rounded" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900 line-clamp-1">{p.name}</div>
                      {p.categories?.[0] && <div className="text-xs text-gray-400">{p.categories[0].name}</div>}
                    </td>
                    <td className="px-4 py-3 text-gray-500 font-mono text-xs">{p.sku ?? '—'}</td>
                    <td className="px-4 py-3 font-medium">{formatPrice(p.current_price ?? p.price)}</td>
                    <td className="px-4 py-3">
                      <span className={p.quantity > 0 ? 'text-green-600' : 'text-red-500'}>{p.quantity}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge text-2xs ${p.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{p.store?.name ?? 'Platform'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Link href={`/admin/products/${p.id}/edit`} className="w-7 h-7 flex items-center justify-center rounded text-gray-400 hover:text-primary-500 hover:bg-primary-50 transition-colors">
                          <Pencil className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => confirm('Delete this product?') && deleteMutation.mutate(p.id)}
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

        {!isLoading && !products.length && (
          <div className="py-12 text-center text-gray-400">No products found</div>
        )}
      </div>

      {meta && meta.last_page > 1 && (
        <Pagination currentPage={meta.current_page} lastPage={meta.last_page} onPageChange={setPage} />
      )}
    </div>
  )
}
