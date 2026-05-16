'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { orderApi } from '@/lib/api'
import type { Order, PaginatedResponse } from '@/types'
import { Pagination } from '@/components/ui/Pagination'
import { formatPrice, formatDate, getOrderStatusColor, getPaymentStatusColor } from '@/lib/utils'
import { Package, ChevronRight } from 'lucide-react'
import { useState } from 'react'

export default function OrdersPage() {
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery<PaginatedResponse<Order>>({
    queryKey: ['orders', page],
    queryFn: () => orderApi.list({ page, per_page: 10 }).then((r) => r.data),
  })

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white border-b border-gray-100">
        <div className="container-narrow py-8">
          <h1 className="font-display text-2xl font-bold text-gray-900">My Orders</h1>
        </div>
      </div>

      <div className="container-narrow py-8">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="card p-5">
                <div className="h-4 skeleton rounded w-1/4 mb-3" />
                <div className="h-3 skeleton rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : !data?.data?.length ? (
          <div className="flex flex-col items-center py-20 gap-4 text-center">
            <Package className="w-16 h-16 text-gray-200" />
            <h3 className="font-display text-xl font-semibold text-gray-900">No orders yet</h3>
            <Link href="/shop" className="btn-primary">Start Shopping</Link>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {data.data.map((order) => (
                <Link
                  key={order.id}
                  href={`/account/orders/${order.code}`}
                  className="card p-5 hover:shadow-card-hover transition-shadow flex items-center justify-between gap-4 group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-semibold text-gray-900">#{order.code}</span>
                      <span className={`badge text-2xs ${getOrderStatusColor(order.status)}`}>
                        {order.status.replace(/_/g, ' ')}
                      </span>
                      <span className={`badge text-2xs ${getPaymentStatusColor(order.payment_status)}`}>
                        {order.payment_status.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span>{formatDate(order.created_at, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      <span>{order.item_count} item{order.item_count !== 1 ? 's' : ''}</span>
                      <span className="font-medium text-gray-900">{formatPrice(order.total_amount)}</span>
                    </div>
                    {order.store && (
                      <p className="text-xs text-gray-400 mt-1">Sold by {order.store.name}</p>
                    )}
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-primary-500 flex-shrink-0 transition-colors" />
                </Link>
              ))}
            </div>

            {data.meta && data.meta.last_page > 1 && (
              <div className="mt-8">
                <Pagination
                  currentPage={data.meta.current_page}
                  lastPage={data.meta.last_page}
                  onPageChange={setPage}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
