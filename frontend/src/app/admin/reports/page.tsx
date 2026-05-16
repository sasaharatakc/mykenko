'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { adminApi } from '@/lib/api'
import { BarChart2, TrendingUp, ShoppingBag, Users, DollarSign, Package } from 'lucide-react'

const PERIODS = [
  { label: '7日間', value: 7 },
  { label: '30日間', value: 30 },
  { label: '90日間', value: 90 },
]

const statusLabels: Record<string, string> = {
  pending:    '保留中',
  processing: '処理中',
  shipped:    '出荷済',
  delivered:  '配達済',
  cancelled:  'キャンセル',
  refunded:   '返金済',
}

const statusColors: Record<string, string> = {
  pending:    '#F59E0B',
  processing: '#3B82F6',
  shipped:    '#8B5CF6',
  delivered:  '#22C55E',
  cancelled:  '#EF4444',
  refunded:   '#6B7280',
}

function StatCard({ label, value, icon: Icon, color, sub }: { label: string; value: string; icon: any; color: string; sub?: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-center gap-4">
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

function MiniBarChart({ data }: { data: { date: string; revenue: number; orders: number }[] }) {
  if (!data.length) return <div className="text-center text-gray-400 py-8">データなし</div>

  const maxRev = Math.max(...data.map(d => d.revenue), 1)

  return (
    <div className="flex items-end gap-1 h-40 w-full">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
          <div
            className="w-full bg-primary rounded-t transition-all group-hover:bg-primary-600"
            style={{ height: `${Math.max((d.revenue / maxRev) * 100, 2)}%` }}
          />
          {/* tooltip */}
          <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 hidden group-hover:block z-10 bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap shadow-lg">
            {d.date}<br />¥{d.revenue.toLocaleString()}<br />{d.orders}件
          </div>
        </div>
      ))}
    </div>
  )
}

function DonutChart({ data }: { data: { status: string; count: number }[] }) {
  const total = data.reduce((s, d) => s + d.count, 0)
  if (!total) return <div className="text-center text-gray-400 py-8">データなし</div>

  let cumulativePercent = 0
  const slices = data.map(d => {
    const pct = (d.count / total) * 100
    const start = cumulativePercent
    cumulativePercent += pct
    return { ...d, pct, start }
  })

  // SVG donut
  const cx = 60, cy = 60, r = 45, strokeWidth = 18
  const circumference = 2 * Math.PI * r

  return (
    <div className="flex items-center gap-6">
      <svg width={120} height={120} viewBox="0 0 120 120">
        {slices.map((s, i) => {
          const dashArray = (s.pct / 100) * circumference
          const dashOffset = circumference - (s.start / 100) * circumference
          return (
            <circle
              key={i}
              cx={cx} cy={cy} r={r}
              fill="none"
              stroke={statusColors[s.status] ?? '#ccc'}
              strokeWidth={strokeWidth}
              strokeDasharray={`${dashArray} ${circumference - dashArray}`}
              strokeDashoffset={dashOffset}
              transform={`rotate(-90 ${cx} ${cy})`}
            />
          )
        })}
        <text x={cx} y={cy + 4} textAnchor="middle" className="text-xs font-bold" fill="#111" fontSize={14} fontWeight={700}>
          {total}
        </text>
        <text x={cx} y={cy + 16} textAnchor="middle" fill="#888" fontSize={8}>
          件
        </text>
      </svg>
      <div className="space-y-1.5 flex-1">
        {slices.map(s => (
          <div key={s.status} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: statusColors[s.status] }} />
              <span className="text-gray-600">{statusLabels[s.status] ?? s.status}</span>
            </div>
            <span className="font-medium text-gray-800">{s.count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function AdminReportsPage() {
  const [period, setPeriod] = useState(30)

  const { data: overview, isLoading: loadingOverview } = useQuery({
    queryKey: ['admin', 'reports', 'overview', period],
    queryFn: () => adminApi.reportOverview({ period }).then(r => r.data.data),
  })

  const { data: salesChart, isLoading: loadingChart } = useQuery({
    queryKey: ['admin', 'reports', 'sales-chart', period],
    queryFn: () => adminApi.reportSalesChart({ period }).then(r => r.data.data),
  })

  const { data: topProducts, isLoading: loadingTop } = useQuery({
    queryKey: ['admin', 'reports', 'top-products', period],
    queryFn: () => adminApi.reportTopProducts({ period }).then(r => r.data.data),
  })

  const { data: ordersByStatus } = useQuery({
    queryKey: ['admin', 'reports', 'orders-by-status', period],
    queryFn: () => adminApi.reportOrdersByStatus({ period }).then(r => r.data.data),
  })

  const statsCards = [
    {
      label: '売上合計',
      value: overview ? `¥${Number(overview.revenue ?? 0).toLocaleString()}` : '—',
      icon: DollarSign,
      color: 'bg-primary',
      sub: overview ? `前期比 ${overview.revenue_growth >= 0 ? '+' : ''}${overview.revenue_growth ?? 0}%` : undefined,
    },
    {
      label: '注文数',
      value: overview ? String(overview.orders ?? 0) : '—',
      icon: ShoppingBag,
      color: 'bg-blue-500',
      sub: overview ? `前期比 ${overview.orders_growth >= 0 ? '+' : ''}${overview.orders_growth ?? 0}%` : undefined,
    },
    {
      label: '新規顧客',
      value: overview ? String(overview.new_customers ?? 0) : '—',
      icon: Users,
      color: 'bg-green-500',
    },
    {
      label: '平均注文額',
      value: overview ? `¥${Number(overview.avg_order ?? 0).toLocaleString()}` : '—',
      icon: TrendingUp,
      color: 'bg-amber-500',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <BarChart2 className="w-5 h-5" /> レポート
        </h1>
        <div className="flex gap-1 bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
          {PERIODS.map(p => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                period === p.value
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map(card => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h2 className="font-semibold text-gray-800 mb-4">売上推移</h2>
          {loadingChart ? (
            <div className="h-40 flex items-center justify-center">
              <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          ) : (
            <>
              <MiniBarChart data={salesChart ?? []} />
              <div className="flex justify-between mt-2 text-xs text-gray-400">
                {salesChart && salesChart.length > 0 && (
                  <>
                    <span>{salesChart[0]?.date}</span>
                    <span>{salesChart[salesChart.length - 1]?.date}</span>
                  </>
                )}
              </div>
            </>
          )}
        </div>

        {/* Orders by Status */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h2 className="font-semibold text-gray-800 mb-4">注文ステータス</h2>
          <DonutChart data={ordersByStatus ?? []} />
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <Package className="w-4 h-4 text-gray-400" />
          <h2 className="font-semibold text-gray-800">売上トップ商品</h2>
        </div>
        {loadingTop ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-5 py-3 text-left">#</th>
                <th className="px-5 py-3 text-left">商品名</th>
                <th className="px-5 py-3 text-right">販売数</th>
                <th className="px-5 py-3 text-right">売上</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(topProducts ?? []).map((p: any, i: number) => (
                <tr key={p.id ?? i} className="hover:bg-gray-50">
                  <td className="px-5 py-3 text-gray-400 font-medium">{i + 1}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      {p.thumbnail && (
                        <img src={p.thumbnail} alt="" className="w-8 h-8 rounded object-cover flex-shrink-0" />
                      )}
                      <span className="font-medium text-gray-900 truncate max-w-xs">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-right text-gray-600">{p.total_qty ?? p.qty ?? 0}</td>
                  <td className="px-5 py-3 text-right font-semibold text-primary">
                    ¥{Number(p.total_revenue ?? p.revenue ?? 0).toLocaleString()}
                  </td>
                </tr>
              ))}
              {(!topProducts || topProducts.length === 0) && (
                <tr><td colSpan={4} className="px-5 py-10 text-center text-gray-400">データなし</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
