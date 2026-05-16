'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/lib/api'
import toast from 'react-hot-toast'
import { Package, Save, AlertTriangle } from 'lucide-react'

interface Product {
  id: number
  name: string
  sku: string | null
  stock: number
  status: string
}

type StockFilter = 'all' | 'in_stock' | 'low_stock' | 'out_of_stock'

function getStockStatus(stock: number): { label: string; className: string } {
  if (stock === 0) return { label: '在庫なし', className: 'bg-red-100 text-red-700' }
  if (stock < 10) return { label: '在庫少', className: 'bg-yellow-100 text-yellow-700' }
  return { label: '在庫あり', className: 'bg-green-100 text-green-700' }
}

export default function AdminInventoryPage() {
  const queryClient = useQueryClient()
  const [filter, setFilter] = useState<StockFilter>('all')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingStock, setEditingStock] = useState<string>('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin-inventory'],
    queryFn: () => adminApi.products({ per_page: 50 }).then((r) => r.data),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, stock }: { id: number; stock: number }) =>
      adminApi.updateProduct(id, { stock }),
    onSuccess: () => {
      toast.success('在庫数を更新しました')
      queryClient.invalidateQueries({ queryKey: ['admin-inventory'] })
      setEditingId(null)
    },
    onError: () => toast.error('更新に失敗しました'),
  })

  const allProducts: Product[] = data?.data ?? []

  const filteredProducts = allProducts.filter((p) => {
    if (filter === 'in_stock') return p.stock >= 10
    if (filter === 'low_stock') return p.stock > 0 && p.stock < 10
    if (filter === 'out_of_stock') return p.stock === 0
    return true
  })

  const inStockCount = allProducts.filter((p) => p.stock >= 10).length
  const lowStockCount = allProducts.filter((p) => p.stock > 0 && p.stock < 10).length
  const outOfStockCount = allProducts.filter((p) => p.stock === 0).length

  const TABS: { key: StockFilter; label: string; count?: number }[] = [
    { key: 'all', label: '全て', count: allProducts.length },
    { key: 'in_stock', label: '在庫あり', count: inStockCount },
    { key: 'low_stock', label: '在庫少', count: lowStockCount },
    { key: 'out_of_stock', label: '在庫なし', count: outOfStockCount },
  ]

  function handleSave(id: number) {
    const stock = parseInt(editingStock, 10)
    if (isNaN(stock) || stock < 0) {
      toast.error('正しい在庫数を入力してください')
      return
    }
    updateMutation.mutate({ id, stock })
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">在庫管理</h1>
        {lowStockCount > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-700">
            <AlertTriangle className="w-4 h-4" />
            在庫少の商品が {lowStockCount} 件あります
          </div>
        )}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">在庫あり</p>
          <p className="text-2xl font-bold text-green-600">{isLoading ? '—' : inStockCount}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">在庫少（10未満）</p>
          <p className="text-2xl font-bold text-yellow-600">{isLoading ? '—' : lowStockCount}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">在庫なし</p>
          <p className="text-2xl font-bold text-red-600">{isLoading ? '—' : outOfStockCount}</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex gap-1 flex-wrap">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === tab.key
                  ? 'bg-primary text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.label}
              {!isLoading && tab.count !== undefined && (
                <span className={`ml-1.5 text-xs ${filter === tab.key ? 'opacity-80' : 'text-gray-400'}`}>
                  ({tab.count})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['商品名', 'SKU', '在庫数', '最低在庫', 'ステータス', '操作'].map((h) => (
                  <th
                    key={h}
                    className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading
                ? [...Array(8)].map((_, i) => (
                    <tr key={i}>
                      {[...Array(6)].map((_, j) => (
                        <td key={j} className="px-5 py-3">
                          <div className="h-4 bg-gray-100 rounded animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                : filteredProducts.map((p) => {
                    const stockStatus = getStockStatus(p.stock)
                    const isEditing = editingId === p.id
                    return (
                      <tr key={p.id} className="hover:bg-gray-50">
                        <td className="px-5 py-3">
                          <span className="font-medium text-gray-900">{p.name}</span>
                        </td>
                        <td className="px-5 py-3 text-gray-500 font-mono text-xs">
                          {p.sku ?? '—'}
                        </td>
                        <td className="px-5 py-3">
                          {isEditing ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                min={0}
                                value={editingStock}
                                onChange={(e) => setEditingStock(e.target.value)}
                                className="w-20 px-2 py-1 border border-primary/50 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSave(p.id)
                                  if (e.key === 'Escape') setEditingId(null)
                                }}
                              />
                              <button
                                onClick={() => handleSave(p.id)}
                                disabled={updateMutation.isPending}
                                className="flex items-center gap-1 px-2 py-1 bg-primary text-white rounded text-xs hover:bg-primary/90 disabled:opacity-60"
                              >
                                <Save className="w-3 h-3" />
                                保存
                              </button>
                              <button
                                onClick={() => setEditingId(null)}
                                className="px-2 py-1 border border-gray-300 rounded text-xs text-gray-600 hover:bg-gray-50"
                              >
                                取消
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setEditingId(p.id)
                                setEditingStock(String(p.stock))
                              }}
                              className="group flex items-center gap-1.5 text-gray-900 font-semibold hover:text-primary transition-colors"
                            >
                              {p.stock.toLocaleString()}
                              <span className="text-xs text-gray-400 group-hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                編集
                              </span>
                            </button>
                          )}
                        </td>
                        <td className="px-5 py-3 text-gray-500">10</td>
                        <td className="px-5 py-3">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stockStatus.className}`}
                          >
                            {stockStatus.label}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          {!isEditing && (
                            <button
                              onClick={() => {
                                setEditingId(p.id)
                                setEditingStock(String(p.stock))
                              }}
                              className="text-xs text-primary hover:underline"
                            >
                              在庫編集
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
            </tbody>
          </table>
        </div>
        {!isLoading && filteredProducts.length === 0 && (
          <div className="py-12 text-center">
            <Package className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">対象の商品がありません</p>
          </div>
        )}
      </div>
    </div>
  )
}
