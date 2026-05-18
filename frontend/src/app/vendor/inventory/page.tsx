'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { vendorApi } from '@/lib/api'
import { Package, AlertTriangle, XCircle, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'

type FilterTab = 'all' | 'low' | 'out'

export default function VendorInventoryPage() {
  const queryClient = useQueryClient()
  const [filter, setFilter] = useState<FilterTab>('all')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editValue, setEditValue] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['vendor-products-inventory'],
    queryFn: () => vendorApi.products({ per_page: 100 }).then(r => r.data),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, stock }: { id: number; stock: number }) =>
      vendorApi.updateStock(id, stock),
    onSuccess: () => {
      toast.success('在庫を更新しました')
      setEditingId(null)
      queryClient.invalidateQueries({ queryKey: ['vendor-products-inventory'] })
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? '更新に失敗しました'),
  })

  const products: any[] = data?.data ?? []

  const filtered = products.filter(p => {
    if (filter === 'low') return p.stock > 0 && p.stock < 10
    if (filter === 'out') return p.stock === 0
    return true
  })

  const total = products.length
  const inStock = products.filter(p => p.stock > 0).length
  const lowStock = products.filter(p => p.stock > 0 && p.stock < 10).length
  const outOfStock = products.filter(p => p.stock === 0).length

  function getStatusBadge(stock: number) {
    if (stock === 0) return <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700"><XCircle className="w-3 h-3" />在庫なし</span>
    if (stock < 10) return <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700"><AlertTriangle className="w-3 h-3" />在庫少</span>
    return <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700"><CheckCircle className="w-3 h-3" />在庫あり</span>
  }

  const TABS: { value: FilterTab; label: string; count: number }[] = [
    { value: 'all', label: '全て', count: total },
    { value: 'low', label: '在庫少', count: lowStock },
    { value: 'out', label: '在庫なし', count: outOfStock },
  ]

  return (
    <div className="space-y-5">
      <h1 className="font-display text-2xl font-bold text-gray-900">在庫管理</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: '総商品数', value: total, color: 'text-gray-900', bg: 'bg-gray-50' },
          { label: '在庫あり', value: inStock, color: 'text-green-700', bg: 'bg-green-50' },
          { label: '在庫少（10未満）', value: lowStock, color: 'text-amber-700', bg: 'bg-amber-50' },
          { label: '在庫なし', value: outOfStock, color: 'text-red-700', bg: 'bg-red-50' },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`card p-4 ${bg}`}>
            <p className="text-xs text-gray-500">{label}</p>
            <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
        {TABS.map(tab => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={cn(
              'px-4 py-1.5 rounded-md text-sm font-medium transition-colors',
              filter === tab.value ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            )}
          >
            {tab.label}
            <span className={cn('ml-1.5 text-xs', filter === tab.value ? 'text-primary-600' : 'text-gray-400')}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['商品名', 'SKU', '現在庫', '最低在庫', 'ステータス', '操作'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading
                ? [...Array(6)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(6)].map((_, j) => (
                      <td key={j} className="px-5 py-3"><div className="h-4 skeleton rounded" /></td>
                    ))}
                  </tr>
                ))
                : filtered.map((p: any) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        {p.thumbnail ? (
                          <img src={p.thumbnail} alt={p.name} className="w-8 h-8 rounded object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center">
                            <Package className="w-4 h-4 text-gray-400" />
                          </div>
                        )}
                        <span className="font-medium text-gray-900 line-clamp-1">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-gray-500">{p.sku ?? '—'}</td>
                    <td className="px-5 py-3 font-semibold text-gray-900">{p.stock ?? 0}</td>
                    <td className="px-5 py-3 text-gray-500">{p.min_stock ?? 5}</td>
                    <td className="px-5 py-3">{getStatusBadge(p.stock ?? 0)}</td>
                    <td className="px-5 py-3">
                      {editingId === p.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            value={editValue}
                            onChange={e => setEditValue(e.target.value)}
                            className="input py-1 w-20 text-sm"
                            autoFocus
                          />
                          <button
                            onClick={() => updateMutation.mutate({ id: p.id, stock: Number(editValue) })}
                            disabled={updateMutation.isPending}
                            className="text-xs px-2.5 py-1 rounded-lg bg-primary-50 text-primary-600 hover:bg-primary-100 transition-colors disabled:opacity-60"
                          >
                            更新
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="text-xs px-2 py-1 rounded-lg text-gray-400 hover:text-gray-600"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setEditingId(p.id); setEditValue(String(p.stock ?? 0)) }}
                          className="text-xs px-2.5 py-1 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                        >
                          在庫編集
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
        {!isLoading && !filtered.length && (
          <div className="py-12 text-center text-gray-400">
            <Package className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p>商品がありません</p>
          </div>
        )}
      </div>
    </div>
  )
}
