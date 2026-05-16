'use client'

import { useQuery } from '@tanstack/react-query'
import { adminApi } from '@/lib/api'
import { formatPrice, formatDate, getOrderStatusColor } from '@/lib/utils'
import { TrendingUp, Package, ShoppingBag, Users, Store, BarChart2 } from 'lucide-react'
import Link from 'next/link'

interface DashboardStats {
  total_revenue: number
  month_revenue: number
  revenue_growth: number
  total_orders: number
  pending_orders: number
  total_customers: number
  new_customers_month: number
  total_products: number
  out_of_stock: number
  total_stores: number
  pending_stores: number
}

interface SalesDay { date: string; revenue: number; orders: number }

function MiniBarChart({ data }: { data: SalesDay[] }) {
  if (!data.length) return (
    <div className="h-40 flex items-center justify-center text-gray-300 text-sm">データなし</div>
  )
  const maxRev = Math.max(...data.map((d) => d.revenue), 1)
  // Show last 14 points to avoid crowding
  const pts = data.slice(-14)
  return (
    <div className="flex items-end gap-1 h-40 w-full px-1">
      {pts.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
          <div
            className="w-full bg-primary-400 hover:bg-primary-500 rounded-t transition-colors cursor-default"
            style={{ height: `${Math.max((d.revenue / maxRev) * 100, 2)}%` }}
          />
          {/* Tooltip */}
          <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 hidden group-hover:block z-10
            bg-gray-800 text-white text-xs rounded px-2 py-1.5 whitespace-nowrap shadow-lg pointer-events-none">
            <p className="font-medium">{d.date}</p>
            <p>{formatPrice(d.revenue)}</p>
            <p className="text-gray-300">{d.orders} 件</p>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function AdminDashboard() {
  const { data: statsData, isLoading } = useQuery<{ stats: DashboardStats }>({
    queryKey: ['admin-stats'],
    queryFn: () => adminApi.dashboardStats().then((r) => r.data),
    staleTime: 60_000,
  })

  const { data: ordersData } = useQuery<{ data: any[] }>({
    queryKey: ['admin-recent-orders'],
    queryFn: () => adminApi.recentOrders().then((r) => r.data),
  })

  const { data: chartData, isLoading: chartLoading } = useQuery<{ data: SalesDay[] }>({
    queryKey: ['admin-sales-chart'],
    queryFn: () => adminApi.salesChart().then((r) => r.data),
    staleTime: 300_000,
  })

  const stats = statsData?.stats
  const recentOrders = ordersData?.data ?? []
  const salesData: SalesDay[] = chartData?.data ?? []

  // Revenue sparkline values for the header
  const totalRevStr = stats ? formatPrice(stats.total_revenue) : '—'
  const growthBadge = stats
    ? `${stats.revenue_growth >= 0 ? '+' : ''}${stats.revenue_growth}%`
    : null

  const CARDS = stats ? [
    {
      label: '今月の売上',
      value: formatPrice(stats.month_revenue),
      sub: growthBadge ? `${growthBadge} 先月比` : '',
      Icon: TrendingUp,
      color: 'text-green-500 bg-green-50',
    },
    {
      label: '総注文数',
      value: stats.total_orders.toLocaleString(),
      sub: `${stats.pending_orders} 件保留中`,
      Icon: ShoppingBag,
      color: 'text-blue-500 bg-blue-50',
    },
    {
      label: '顧客数',
      value: stats.total_customers.toLocaleString(),
      sub: `今月 +${stats.new_customers_month} 名`,
      Icon: Users,
      color: 'text-purple-500 bg-purple-50',
    },
    {
      label: '商品数',
      value: stats.total_products.toLocaleString(),
      sub: `${stats.out_of_stock} 件在庫なし`,
      Icon: Package,
      color: 'text-orange-500 bg-orange-50',
    },
    {
      label: 'ベンダー数',
      value: stats.total_stores.toLocaleString(),
      sub: `${stats.pending_stores} 件審査待ち`,
      Icon: Store,
      color: 'text-teal-500 bg-teal-50',
    },
  ] : []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-gray-900">ダッシュボード</h1>
        <p className="text-sm text-gray-400">累計売上: <span className="font-semibold text-gray-700">{totalRevStr}</span></p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {isLoading
          ? [...Array(5)].map((_, i) => <div key={i} className="card p-5 h-24 skeleton" />)
          : CARDS.map(({ label, value, sub, Icon, color }) => (
            <div key={label} className="card p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-gray-500">{label}</p>
                  <p className="text-xl font-bold text-gray-900 mt-0.5">{value}</p>
                  {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
                </div>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
      </div>

      {/* Sales Chart + Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <div className="lg:col-span-2 card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-primary-500" />
              売上チャート (直近30日)
            </h2>
            <Link href="/admin/reports" className="text-xs text-primary-500 hover:underline">
              詳細レポート
            </Link>
          </div>
          {chartLoading
            ? <div className="h-40 skeleton rounded-xl" />
            : <MiniBarChart data={salesData} />}
          {/* X-axis labels */}
          {!chartLoading && salesData.length > 0 && (
            <div className="flex justify-between mt-1 px-1">
              <span className="text-2xs text-gray-300">{salesData[Math.max(0, salesData.length - 14)]?.date}</span>
              <span className="text-2xs text-gray-300">{salesData[salesData.length - 1]?.date}</span>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="space-y-4">
          <div className="card p-5">
            <h2 className="font-semibold text-gray-900 mb-3">ステータス別注文</h2>
            {isLoading
              ? <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="h-3 skeleton rounded" />)}</div>
              : stats && (
                <div className="space-y-2 text-sm">
                  {[
                    { label: '保留中', value: stats.pending_orders, color: 'bg-amber-400' },
                    { label: '処理中', value: Math.max(0, stats.total_orders - stats.pending_orders), color: 'bg-blue-400' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${color} flex-shrink-0`} />
                      <span className="text-gray-600 flex-1">{label}</span>
                      <span className="font-semibold text-gray-900">{value}</span>
                    </div>
                  ))}
                </div>
              )}
          </div>
          <div className="card p-5">
            <h2 className="font-semibold text-gray-900 mb-3">クイックアクション</h2>
            <div className="space-y-2">
              {[
                { href: '/admin/orders?status=pending', label: '保留中の注文', badge: stats?.pending_orders },
                { href: '/admin/stores?verified=false', label: '審査待ちベンダー', badge: stats?.pending_stores },
                { href: '/admin/products?status=draft', label: 'ドラフト商品' },
              ].map(({ href, label, badge }) => (
                <Link key={href} href={href}
                  className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 text-sm text-gray-700 transition-colors">
                  <span>{label}</span>
                  {badge != null && badge > 0 && (
                    <span className="bg-red-100 text-red-600 text-xs font-semibold px-2 py-0.5 rounded-full">{badge}</span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">最新注文</h2>
          <Link href="/admin/orders" className="text-sm text-primary-500 hover:underline">すべて見る</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['注文番号', '顧客', 'ストア', '金額', 'ステータス', '日付'].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentOrders.map((order: any) => (
                <tr key={order.id} className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => window.location.href = `/admin/orders/${order.id}`}>
                  <td className="px-5 py-3 font-medium text-gray-900">#{order.code}</td>
                  <td className="px-5 py-3 text-gray-600">{order.customer?.name ?? '—'}</td>
                  <td className="px-5 py-3 text-gray-500 text-xs">{order.store?.name ?? '—'}</td>
                  <td className="px-5 py-3 font-medium">{formatPrice(order.total_amount)}</td>
                  <td className="px-5 py-3">
                    <span className={`badge text-2xs ${getOrderStatusColor(order.status)}`}>{order.status}</span>
                  </td>
                  <td className="px-5 py-3 text-gray-400 text-xs">
                    {formatDate(order.created_at, { month: 'short', day: 'numeric' })}
                  </td>
                </tr>
              ))}
              {!recentOrders.length && (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-gray-400">注文がありません</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
