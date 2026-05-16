'use client'

import { useQuery } from '@tanstack/react-query'
import { vendorApi } from '@/lib/api'
import { formatPrice, formatDate, getOrderStatusColor } from '@/lib/utils'
import { TrendingUp, Package, ShoppingBag, Wallet, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function VendorDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['vendor-dashboard'],
    queryFn: () => vendorApi.dashboard().then((r) => r.data),
  })

  const { data: ordersData } = useQuery({
    queryKey: ['vendor-recent-orders'],
    queryFn: () => vendorApi.recentOrders().then((r) => r.data),
  })

  const stats = data?.stats
  const store = data?.store
  const recentOrders = ordersData?.data ?? []

  const CARDS = stats ? [
    { label: 'Monthly Revenue', value: formatPrice(stats.month_revenue), Icon: TrendingUp, color: 'text-green-500 bg-green-50' },
    { label: 'Available Balance', value: formatPrice(stats.pending_balance), Icon: Wallet, color: 'text-blue-500 bg-blue-50' },
    { label: 'Total Orders', value: stats.total_orders, Icon: ShoppingBag, color: 'text-purple-500 bg-purple-50', sub: `${stats.pending_orders} pending` },
    { label: 'Products', value: stats.total_products, Icon: Package, color: 'text-orange-500 bg-orange-50', sub: `${stats.published_products} published` },
  ] : []

  if (!isLoading && !store) {
    return (
      <div className="flex flex-col items-center py-20 gap-4 text-center">
        <AlertCircle className="w-14 h-14 text-amber-400" />
        <h2 className="font-display text-xl font-semibold text-gray-900">No store found</h2>
        <p className="text-gray-500">You don&apos;t have a store yet. Register to start selling.</p>
        <Link href="/become-vendor" className="btn-primary">Create Store</Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900">
          {store?.name ?? 'Dashboard'}
        </h1>
        {store && !store.is_verified && (
          <div className="mt-2 flex items-center gap-2 text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 w-fit">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            Your store is pending verification. Products won&apos;t be visible until approved.
          </div>
        )}
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading
          ? [...Array(4)].map((_, i) => <div key={i} className="card p-5 h-24 skeleton" />)
          : CARDS.map(({ label, value, Icon, color, sub }) => (
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

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/vendor/products/new" className="card p-5 hover:shadow-card-hover transition-shadow text-center group">
          <Package className="w-8 h-8 text-primary-500 mx-auto mb-2" />
          <p className="font-semibold text-gray-900 group-hover:text-primary-500 transition-colors">Add Product</p>
          <p className="text-xs text-gray-500 mt-1">List a new item</p>
        </Link>
        <Link href="/vendor/orders?status=pending" className="card p-5 hover:shadow-card-hover transition-shadow text-center group">
          <ShoppingBag className="w-8 h-8 text-purple-500 mx-auto mb-2" />
          <p className="font-semibold text-gray-900 group-hover:text-primary-500 transition-colors">Pending Orders</p>
          <p className="text-xs text-gray-500 mt-1">{stats?.pending_orders ?? 0} awaiting action</p>
        </Link>
        <Link href="/vendor/payouts" className="card p-5 hover:shadow-card-hover transition-shadow text-center group">
          <Wallet className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <p className="font-semibold text-gray-900 group-hover:text-primary-500 transition-colors">Request Payout</p>
          <p className="text-xs text-gray-500 mt-1">{formatPrice(stats?.pending_balance ?? 0)} available</p>
        </Link>
      </div>

      {/* Recent Orders */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Recent Orders</h2>
          <Link href="/vendor/orders" className="text-sm text-primary-500 hover:underline">View all</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Order', 'Customer', 'Amount', 'Status', 'Date'].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentOrders.map((o: any) => (
                <tr key={o.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 font-mono font-medium text-gray-900">
                    <Link href={`/vendor/orders/${o.id}`} className="hover:text-primary-500">#{o.code}</Link>
                  </td>
                  <td className="px-5 py-3 text-gray-600">{o.customer?.name ?? '—'}</td>
                  <td className="px-5 py-3 font-medium">{formatPrice(o.total_amount)}</td>
                  <td className="px-5 py-3">
                    <span className={`badge text-2xs ${getOrderStatusColor(o.status)}`}>{o.status}</span>
                  </td>
                  <td className="px-5 py-3 text-gray-400 text-xs">
                    {formatDate(o.created_at, { month: 'short', day: 'numeric' })}
                  </td>
                </tr>
              ))}
              {!recentOrders.length && (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-gray-400">No orders yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
