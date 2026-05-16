'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/lib/api'
import toast from 'react-hot-toast'
import {
  ShieldCheck,
  ShieldX,
  ShieldAlert,
  FileText,
  ExternalLink,
  ChevronDown,
} from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'

interface Store {
  id: number
  name: string
  slug: string
  verification_status?: string
  is_verified?: boolean
  created_at: string
  owner?: { name: string; email: string }
  documents_count?: number
}

type VerificationStatus = '未提出' | '審査中' | '確認済み' | '否認'

function getVerificationStatus(store: Store): VerificationStatus {
  if (store.verification_status === 'approved' || store.is_verified) return '確認済み'
  if (store.verification_status === 'pending') return '審査中'
  if (store.verification_status === 'rejected') return '否認'
  return '未提出'
}

const VERIFICATION_STYLES: Record<VerificationStatus, string> = {
  '未提出': 'bg-gray-100 text-gray-600',
  '審査中': 'bg-yellow-100 text-yellow-700',
  '確認済み': 'bg-green-100 text-green-700',
  '否認': 'bg-red-100 text-red-700',
}

const VERIFICATION_ICONS: Record<VerificationStatus, React.ReactNode> = {
  '未提出': <ShieldAlert className="w-3 h-3" />,
  '審査中': <ShieldAlert className="w-3 h-3" />,
  '確認済み': <ShieldCheck className="w-3 h-3" />,
  '否認': <ShieldX className="w-3 h-3" />,
}

export default function AdminVendorVerificationPage() {
  const queryClient = useQueryClient()
  const [statusFilter, setStatusFilter] = useState<VerificationStatus | 'all'>('all')
  const [openDropdown, setOpenDropdown] = useState<number | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-vendor-verification'],
    queryFn: () => adminApi.stores({ per_page: 100 }).then((r) => r.data),
  })

  const verifyMutation = useMutation({
    mutationFn: (id: number) => adminApi.verifyStore(id),
    onSuccess: () => {
      toast.success('確認済みに更新しました')
      queryClient.invalidateQueries({ queryKey: ['admin-vendor-verification'] })
      setOpenDropdown(null)
    },
    onError: () => toast.error('操作に失敗しました'),
  })

  const unverifyMutation = useMutation({
    mutationFn: (id: number) => adminApi.unverifyStore(id),
    onSuccess: () => {
      toast.success('ステータスを更新しました')
      queryClient.invalidateQueries({ queryKey: ['admin-vendor-verification'] })
      setOpenDropdown(null)
    },
    onError: () => toast.error('操作に失敗しました'),
  })

  const allStores: Store[] = data?.data ?? []

  const verified = allStores.filter((s) => getVerificationStatus(s) === '確認済み')
  const reviewing = allStores.filter((s) => getVerificationStatus(s) === '審査中')
  const unsubmitted = allStores.filter((s) => getVerificationStatus(s) === '未提出')
  const rejected = allStores.filter((s) => getVerificationStatus(s) === '否認')

  const filteredStores =
    statusFilter === 'all'
      ? allStores
      : allStores.filter((s) => getVerificationStatus(s) === statusFilter)

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">ベンダー本人確認</h1>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">確認済み</p>
          <p className="text-2xl font-bold text-green-600">{isLoading ? '—' : verified.length}件</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">審査中</p>
          <p className="text-2xl font-bold text-yellow-600">{isLoading ? '—' : reviewing.length}件</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">未提出</p>
          <p className="text-2xl font-bold text-gray-500">{isLoading ? '—' : unsubmitted.length}件</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">否認</p>
          <p className="text-2xl font-bold text-red-600">{isLoading ? '—' : rejected.length}件</p>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex gap-1 flex-wrap">
          {(['all', '審査中', '確認済み', '未提出', '否認'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === s
                  ? 'bg-primary text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {s === 'all' ? '全て' : s}
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
                {['ストア名', 'オーナー', '提出書類', '確認ステータス', '申請日', 'アクション'].map(
                  (h) => (
                    <th
                      key={h}
                      className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading
                ? [...Array(6)].map((_, i) => (
                    <tr key={i}>
                      {[...Array(6)].map((_, j) => (
                        <td key={j} className="px-5 py-3">
                          <div className="h-4 bg-gray-100 rounded animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                : filteredStores.map((s) => {
                    const status = getVerificationStatus(s)
                    return (
                      <tr key={s.id} className="hover:bg-gray-50 relative">
                        <td className="px-5 py-3">
                          <span className="font-medium text-gray-900">{s.name}</span>
                        </td>
                        <td className="px-5 py-3">
                          <p className="text-gray-700">{s.owner?.name ?? '—'}</p>
                          <p className="text-xs text-gray-400">{s.owner?.email ?? ''}</p>
                        </td>
                        <td className="px-5 py-3">
                          <span className="inline-flex items-center gap-1.5 text-gray-500 text-xs">
                            <FileText className="w-3.5 h-3.5" />
                            {s.documents_count ?? 0}件
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${VERIFICATION_STYLES[status]}`}
                          >
                            {VERIFICATION_ICONS[status]}
                            {status}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-gray-400 text-xs">
                          {s.created_at
                            ? format(new Date(s.created_at), 'yyyy/MM/dd')
                            : '—'}
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/admin/stores/${s.id}`}
                              className="flex items-center gap-1 px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs text-gray-600 hover:bg-gray-50 transition-colors"
                            >
                              <ExternalLink className="w-3 h-3" />
                              書類を確認
                            </Link>
                            {/* Status dropdown */}
                            <div className="relative">
                              <button
                                onClick={() =>
                                  setOpenDropdown(openDropdown === s.id ? null : s.id)
                                }
                                className="flex items-center gap-1 px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs text-gray-600 hover:bg-gray-50 transition-colors"
                              >
                                ステータス変更
                                <ChevronDown className="w-3 h-3" />
                              </button>
                              {openDropdown === s.id && (
                                <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-20 overflow-hidden">
                                  <button
                                    onClick={() => verifyMutation.mutate(s.id)}
                                    disabled={verifyMutation.isPending}
                                    className="w-full px-3 py-2 text-left text-xs text-green-700 hover:bg-green-50 transition-colors flex items-center gap-2"
                                  >
                                    <ShieldCheck className="w-3.5 h-3.5" />
                                    確認済みにする
                                  </button>
                                  <button
                                    onClick={() => unverifyMutation.mutate(s.id)}
                                    disabled={unverifyMutation.isPending}
                                    className="w-full px-3 py-2 text-left text-xs text-red-700 hover:bg-red-50 transition-colors flex items-center gap-2"
                                  >
                                    <ShieldX className="w-3.5 h-3.5" />
                                    否認する
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
            </tbody>
          </table>
        </div>
        {!isLoading && filteredStores.length === 0 && (
          <div className="py-12 text-center">
            <ShieldCheck className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">対象のベンダーがありません</p>
          </div>
        )}
      </div>

      {/* Click-away to close dropdown */}
      {openDropdown !== null && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setOpenDropdown(null)}
        />
      )}
    </div>
  )
}
