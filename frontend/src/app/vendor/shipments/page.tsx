'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { vendorApi } from '@/lib/api'
import { formatDate } from '@/lib/utils'
import { Truck, Package, X, Check } from 'lucide-react'
import toast from 'react-hot-toast'

const CARRIERS = ['ヤマト運輸', '佐川急便', '日本郵便', 'Amazon Logistics', 'その他']

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  processing: { label: '発送待ち', color: 'bg-yellow-100 text-yellow-700' },
  shipped:    { label: '発送済み', color: 'bg-blue-100 text-blue-700' },
  delivered:  { label: '配達済み', color: 'bg-green-100 text-green-700' },
}

export default function VendorShipmentsPage() {
  const qc = useQueryClient()
  const [tab, setTab] = useState<'processing' | 'shipped' | 'delivered'>('processing')
  const [modal, setModal] = useState<{ orderId: number; orderCode: string } | null>(null)
  const [carrier, setCarrier] = useState(CARRIERS[0])
  const [tracking, setTracking] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['vendor-orders-shipment', tab],
    queryFn: () => vendorApi.orders({ status: tab, per_page: 50 }).then(r => (r.data as any)?.data ?? []),
  })

  const shipMutation = useMutation({
    mutationFn: ({ id, carrier, tracking_number }: { id: number; carrier: string; tracking_number: string }) =>
      vendorApi.shipOrder(id, { carrier, tracking_number }),
    onSuccess: () => {
      toast.success('発送情報を登録しました')
      qc.invalidateQueries({ queryKey: ['vendor-orders-shipment'] })
      setModal(null)
      setTracking('')
    },
    onError: () => toast.error('登録に失敗しました'),
  })

  const orders: any[] = data ?? []
  const tabs: Array<'processing' | 'shipped' | 'delivered'> = ['processing', 'shipped', 'delivered']

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">出荷管理</h1>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === t ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
            {STATUS_MAP[t].label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />)}</div>
        ) : orders.length === 0 ? (
          <div className="p-16 text-center">
            <Truck className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">{STATUS_MAP[tab].label}の注文はありません</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['注文番号', '顧客', '商品', '配送業者', '追跡番号', '状態', '操作'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((o: any) => (
                <tr key={o.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-primary-600">{o.code}</td>
                  <td className="px-4 py-3 text-gray-900">{o.shipping_address?.name ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-600 max-w-[160px] truncate">{o.items?.[0]?.product?.name ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{o.carrier ?? '—'}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">{o.tracking_id ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_MAP[o.status]?.color ?? 'bg-gray-100 text-gray-600'}`}>
                      {STATUS_MAP[o.status]?.label ?? o.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {o.status === 'processing' && (
                      <button onClick={() => setModal({ orderId: o.id, orderCode: o.code })}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 text-white text-xs rounded-lg hover:bg-primary-700 transition-colors">
                        <Truck className="w-3.5 h-3.5" /> 発送登録
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Ship Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">発送情報の登録</h2>
              <button onClick={() => setModal(null)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <p className="text-sm text-gray-500">注文番号: <span className="font-mono font-medium text-gray-900">{modal.orderCode}</span></p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">配送業者</label>
                <select value={carrier} onChange={e => setCarrier(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                  {CARRIERS.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">追跡番号</label>
                <input value={tracking} onChange={e => setTracking(e.target.value)} placeholder="例: 1234-5678-9012" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setModal(null)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">キャンセル</button>
              <button
                disabled={!tracking || shipMutation.isPending}
                onClick={() => shipMutation.mutate({ id: modal.orderId, carrier, tracking_number: tracking })}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 disabled:opacity-50">
                <Check className="w-4 h-4" /> 登録する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
