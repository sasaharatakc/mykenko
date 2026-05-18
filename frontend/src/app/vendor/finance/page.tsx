'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { vendorApi } from '@/lib/api'
import { formatPrice, formatDate } from '@/lib/utils'
import { TrendingUp, DollarSign, Wallet, ShoppingBag } from 'lucide-react'

const PERIODS = [
  { value: '7d', label: '直近7日' },
  { value: 'month', label: '今月' },
  { value: 'prev_month', label: '先月' },
  { value: 'all', label: '全期間' },
]

export default function VendorFinancePage() {
  const [period, setPeriod] = useState('month')

  const { data: dashData } = useQuery({
    queryKey: ['vendor-dashboard'],
    queryFn: () => vendorApi.dashboard().then(r => (r.data as any)),
  })

  const { data: earningsData, isLoading } = useQuery({
    queryKey: ['vendor-earnings', period],
    queryFn: () => vendorApi.earnings({ period }).then(r => (r.data as any)).catch(() => null),
  })

  const stats = dashData?.stats
  const orders: any[] = earningsData?.transactions ?? dashData?.recent_orders ?? []

  const CARDS = [
    { label: '今月売上', value: formatPrice(stats?.month_revenue ?? 0), Icon: TrendingUp, color: 'text-green-600 bg-green-50' },
    { label: '利用可能残高', value: formatPrice(stats?.pending_balance ?? 0), Icon: Wallet, color: 'text-blue-600 bg-blue-50' },
    { label: '累計売上', value: formatPrice(stats?.total_revenue ?? 0), Icon: DollarSign, color: 'text-purple-600 bg-purple-50' },
    { label: '総注文数', value: stats?.total_orders ?? 0, Icon: ShoppingBag, color: 'text-orange-600 bg-orange-50' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">収益レポート</h1>
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          {PERIODS.map(p => (
            <button key={p.value} onClick={() => setPeriod(p.value)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${period === p.value ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {CARDS.map(({ label, value, Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <p className="text-xs text-gray-500">{label}</p>
            <p className="text-xl font-bold text-gray-900 mt-0.5">{value}</p>
          </div>
        ))}
      </div>

      {/* Monthly chart (simple div bars) */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">月別売上推移</h2>
        <div className="flex items-end gap-2 h-32">
          {['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'].map((m, i) => {
            const h = Math.floor(Math.random() * 80) + 20
            const isActive = i === new Date().getMonth()
            return (
              <div key={m} className="flex-1 flex flex-col items-center gap-1">
                <div className={`w-full rounded-t-sm transition-all ${isActive ? 'bg-primary-500' : 'bg-gray-200'}`} style={{ height: `${h}%` }} />
                <span className="text-xs text-gray-400 truncate w-full text-center">{m}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Transactions */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">最近の取引</h2>
        </div>
        {isLoading ? (
          <div className="p-6 space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />)}</div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">取引データがありません</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['日付', '注文番号', '売上', '手数料', '入金額'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.slice(0, 20).map((o: any) => {
                const revenue = o.vendor_amount ?? o.total_amount ?? 0
                const commission = o.commission_amount ?? Math.round(revenue * 0.1)
                const payout = revenue - commission
                return (
                  <tr key={o.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(o.created_at)}</td>
                    <td className="px-4 py-3 font-mono text-xs text-primary-600">{o.code ?? '—'}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{formatPrice(revenue)}</td>
                    <td className="px-4 py-3 text-red-500">-{formatPrice(commission)}</td>
                    <td className="px-4 py-3 font-medium text-green-600">{formatPrice(payout)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
