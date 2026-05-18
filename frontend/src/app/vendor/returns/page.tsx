'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { vendorApi } from '@/lib/api'
import { formatPrice, formatDate } from '@/lib/utils'
import { RotateCcw, Check, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { useState } from 'react'

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending:   { label: '申請中',   color: 'bg-yellow-100 text-yellow-700' },
  approved:  { label: '承認済み', color: 'bg-green-100 text-green-700' },
  rejected:  { label: '却下',     color: 'bg-red-100 text-red-700' },
  processed: { label: '処理済み', color: 'bg-blue-100 text-blue-700' },
}

export default function VendorReturnsPage() {
  const qc = useQueryClient()
  const [filter, setFilter] = useState('all')

  const { data, isLoading } = useQuery({
    queryKey: ['vendor-returns'],
    queryFn: () => vendorApi.returns().then(r => (r.data as any)?.data ?? []).catch(() => []),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => vendorApi.updateReturn(id, { status }),
    onSuccess: () => { toast.success('ステータスを更新しました'); qc.invalidateQueries({ queryKey: ['vendor-returns'] }) },
    onError: () => toast.error('更新に失敗しました'),
  })

  const returns: any[] = (data ?? []).filter((r: any) => filter === 'all' || r.status === filter)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">返品・返金管理</h1>

      {/* Filter */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {[['all', '全て'], ['pending', '申請中'], ['approved', '承認済み'], ['rejected', '却下']].map(([v, l]) => (
          <button key={v} onClick={() => setFilter(v)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${filter === v ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>{l}</button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />)}</div>
        ) : returns.length === 0 ? (
          <div className="p-16 text-center">
            <RotateCcw className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">返品申請はありません</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['注文番号', '顧客', '理由', '金額', '申請日', 'ステータス', '操作'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {returns.map((r: any) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-primary-600">{r.order?.code ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-900">{r.customer?.name ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-600 max-w-[160px] truncate">{r.reason ?? '—'}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{formatPrice(r.amount ?? 0)}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(r.created_at)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_MAP[r.status]?.color ?? 'bg-gray-100 text-gray-600'}`}>
                      {STATUS_MAP[r.status]?.label ?? r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {r.status === 'pending' && (
                      <div className="flex gap-1.5">
                        <button onClick={() => updateMutation.mutate({ id: r.id, status: 'approved' })}
                          className="flex items-center gap-1 px-2.5 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700">
                          <Check className="w-3 h-3" /> 承認
                        </button>
                        <button onClick={() => updateMutation.mutate({ id: r.id, status: 'rejected' })}
                          className="flex items-center gap-1 px-2.5 py-1 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700">
                          <X className="w-3 h-3" /> 却下
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
