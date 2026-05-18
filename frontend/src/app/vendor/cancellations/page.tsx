'use client'

import { useQuery } from '@tanstack/react-query'
import { vendorApi } from '@/lib/api'
import { formatPrice, formatDate } from '@/lib/utils'
import { XCircle } from 'lucide-react'

export default function VendorCancellationsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['vendor-cancellations'],
    queryFn: () => vendorApi.orders({ status: 'cancelled', per_page: 50 }).then(r => (r.data as any)?.data ?? []).catch(() => []),
  })

  const orders: any[] = data ?? []
  const total = orders.length
  const thisMonth = orders.filter((o: any) => {
    if (!o.created_at) return false
    const d = new Date(o.created_at)
    const now = new Date()
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).length

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">キャンセル管理</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500">今月キャンセル数</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{thisMonth}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500">累計キャンセル数</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{total}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">キャンセル一覧</h2>
        </div>
        {isLoading ? (
          <div className="p-8 space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />)}</div>
        ) : orders.length === 0 ? (
          <div className="p-16 text-center">
            <XCircle className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">キャンセルされた注文はありません</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['注文番号', '顧客', 'キャンセル理由', '金額', 'キャンセル日'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((o: any) => (
                <tr key={o.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-primary-600">{o.code}</td>
                  <td className="px-4 py-3 text-gray-900">{o.shipping_address?.name ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{o.cancel_reason ?? '顧客都合'}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{formatPrice(o.total_amount ?? 0)}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(o.updated_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
