'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/lib/api'
import toast from 'react-hot-toast'
import { CheckCircle, XCircle, Clock, Store } from 'lucide-react'
import { format } from 'date-fns'

interface Store {
  id: number
  name: string
  slug: string
  status: string
  approval_status?: string
  products_count?: number
  created_at: string
  owner?: { name: string; email: string }
}

type TabType = 'pending' | 'active' | 'rejected' | 'all'

export default function AdminVendorApprovalPage() {
  const queryClient = useQueryClient()
  const [tab, setTab] = useState<TabType>('pending')

  const { data, isLoading } = useQuery({
    queryKey: ['admin-vendor-approval'],
    queryFn: () => adminApi.stores({ per_page: 100 }).then((r) => r.data),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      adminApi.updateStoreCommission(id, { status }),
    onSuccess: (_, vars) => {
      const label = vars.status === 'active' ? '承認しました' : '却下しました'
      toast.success(`ストアを${label}`)
      queryClient.invalidateQueries({ queryKey: ['admin-vendor-approval'] })
    },
    onError: () => toast.error('操作に失敗しました'),
  })

  const allStores: Store[] = data?.data ?? []

  const isPending = (s: Store) =>
    s.status === 'pending' || s.approval_status === 'pending'
  const isActive = (s: Store) => s.status === 'active'
  const isRejected = (s: Store) => s.status === 'rejected'

  const pendingStores = allStores.filter(isPending)
  const activeStores = allStores.filter(isActive)
  const rejectedStores = allStores.filter(isRejected)

  const displayedStores =
    tab === 'pending'
      ? pendingStores
      : tab === 'active'
      ? activeStores
      : tab === 'rejected'
      ? rejectedStores
      : allStores

  const TABS: { key: TabType; label: string; count: number; className: string }[] = [
    {
      key: 'pending',
      label: '審査中',
      count: pendingStores.length,
      className: 'bg-yellow-100 text-yellow-700',
    },
    {
      key: 'active',
      label: '承認済み',
      count: activeStores.length,
      className: 'bg-green-100 text-green-700',
    },
    {
      key: 'rejected',
      label: '却下',
      count: rejectedStores.length,
      className: 'bg-red-100 text-red-700',
    },
    {
      key: 'all',
      label: '全て',
      count: allStores.length,
      className: 'bg-gray-100 text-gray-600',
    },
  ]

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">ベンダー審査</h1>
      </div>

      {/* Summary badges */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {TABS.map((t) => (
          <div
            key={t.key}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center gap-3"
          >
            <span
              className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${t.className}`}
            >
              {isLoading ? '—' : t.count}
            </span>
            <span className="text-sm text-gray-700">{t.label}</span>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex gap-1 flex-wrap">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === t.key
                  ? 'bg-primary text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {t.label}
              {!isLoading && (
                <span
                  className={`ml-1.5 text-xs ${tab === t.key ? 'opacity-80' : 'text-gray-400'}`}
                >
                  ({t.count})
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
                {['ストア名', 'オーナー', '申請日', '商品数', 'ステータス', 'アクション'].map((h) => (
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
                ? [...Array(5)].map((_, i) => (
                    <tr key={i}>
                      {[...Array(6)].map((_, j) => (
                        <td key={j} className="px-5 py-3">
                          <div className="h-4 bg-gray-100 rounded animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                : displayedStores.map((s) => {
                    const pending = isPending(s)
                    return (
                      <tr key={s.id} className="hover:bg-gray-50">
                        <td className="px-5 py-3">
                          <span className="font-medium text-gray-900">{s.name}</span>
                        </td>
                        <td className="px-5 py-3">
                          <p className="text-gray-700">{s.owner?.name ?? '—'}</p>
                          <p className="text-xs text-gray-400">{s.owner?.email ?? ''}</p>
                        </td>
                        <td className="px-5 py-3 text-gray-500 text-xs">
                          {s.created_at
                            ? format(new Date(s.created_at), 'yyyy/MM/dd')
                            : '—'}
                        </td>
                        <td className="px-5 py-3 text-gray-600">
                          {s.products_count ?? 0}
                        </td>
                        <td className="px-5 py-3">
                          {pending ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                              <Clock className="w-3 h-3" />
                              審査中
                            </span>
                          ) : isActive(s) ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                              <CheckCircle className="w-3 h-3" />
                              承認済み
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                              <XCircle className="w-3 h-3" />
                              却下
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3">
                          {pending && (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() =>
                                  updateMutation.mutate({ id: s.id, status: 'active' })
                                }
                                disabled={updateMutation.isPending}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 border border-green-200 text-green-700 rounded-lg text-xs hover:bg-green-100 transition-colors disabled:opacity-60"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                                承認
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`${s.name} を却下しますか？`)) {
                                    updateMutation.mutate({ id: s.id, status: 'rejected' })
                                  }
                                }}
                                disabled={updateMutation.isPending}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs hover:bg-red-100 transition-colors disabled:opacity-60"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                却下
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    )
                  })}
            </tbody>
          </table>
        </div>
        {!isLoading && displayedStores.length === 0 && (
          <div className="py-12 text-center">
            <Store className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">
              {tab === 'pending'
                ? '審査待ちのベンダーはありません'
                : '対象のベンダーがありません'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
