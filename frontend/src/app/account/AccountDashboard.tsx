'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useQuery } from '@tanstack/react-query'
import { orderApi } from '@/lib/api'
import type { Order, PaginatedResponse } from '@/types'
import { formatPrice, getOrderStatusColor } from '@/lib/utils'
import { Package, Heart, MapPin, User, LogOut, Settings, ArrowRight, ShoppingBag } from 'lucide-react'

export function AccountDashboard() {
  const { customer, isAuthenticated, logout } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) router.push('/login?redirect=/account')
  }, [isAuthenticated, router])

  const { data: ordersData } = useQuery<PaginatedResponse<Order>>({
    queryKey: ['orders', 'recent'],
    queryFn: () => orderApi.list({ per_page: 5 }).then((r) => r.data),
    enabled: isAuthenticated,
  })

  if (!isAuthenticated || !customer) return null

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  const QUICK_LINKS = [
    { icon: Package, label: 'My Orders', href: '/account/orders', desc: `${ordersData?.meta?.total ?? 0} orders` },
    { icon: Heart, label: 'Wishlist', href: '/wishlist', desc: 'Saved items' },
    { icon: MapPin, label: 'Addresses', href: '/account/addresses', desc: 'Manage addresses' },
    { icon: Settings, label: 'Settings', href: '/account/settings', desc: 'Profile & security' },
  ]

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container-narrow">
        {/* Header */}
        <div className="card p-6 flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center">
              <User className="w-7 h-7 text-primary-500" />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold text-gray-900">Welcome back, {customer.name.split(' ')[0]}!</h1>
              <p className="text-sm text-gray-400">{customer.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-danger transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {QUICK_LINKS.map(({ icon: Icon, label, href, desc }) => (
            <Link
              key={href}
              href={href}
              className="card p-5 flex flex-col gap-3 hover:shadow-card-hover transition-shadow group"
            >
              <div className="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center group-hover:bg-primary-100 transition-colors">
                <Icon className="w-5.5 h-5.5 text-primary-500" />
              </div>
              <div>
                <p className="font-semibold text-sm text-gray-900">{label}</p>
                <p className="text-xs text-gray-400">{desc}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Recent Orders */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-base font-semibold text-gray-900">Recent Orders</h2>
            <Link href="/account/orders" className="flex items-center gap-1 text-sm text-primary-500 hover:gap-2 transition-all">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {!ordersData?.data?.length ? (
            <div className="flex flex-col items-center py-10 gap-3 text-center">
              <ShoppingBag className="w-12 h-12 text-gray-200" />
              <p className="text-gray-500 text-sm">You haven't placed any orders yet.</p>
              <Link href="/shop" className="btn-primary text-sm">Start Shopping</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {ordersData.data.map((order) => (
                <Link
                  key={order.id}
                  href={`/account/orders/${order.code}`}
                  className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-colors group"
                >
                  <div>
                    <p className="font-semibold text-sm text-gray-900 group-hover:text-primary-500 transition-colors">
                      #{order.code}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {order.item_count} items · {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`badge text-xs ${getOrderStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                    <span className="font-semibold text-sm text-gray-900">{formatPrice(order.total_amount)}</span>
                    <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-primary-500 transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
