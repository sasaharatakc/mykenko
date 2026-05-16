'use client'

import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/lib/api'
import { formatPrice, formatDate, getOrderStatusColor } from '@/lib/utils'
import {
  ArrowLeft, UserCheck, UserX, Trash2, Mail, Phone,
  MapPin, ShoppingBag, Star, Heart,
} from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function AdminCustomerDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const queryClient = useQueryClient()

  const { data: customer, isLoading } = useQuery({
    queryKey: ['admin-customer', id],
    queryFn: () => adminApi.showCustomer(Number(id)).then((r) => r.data?.data),
  })

  const toggleMutation = useMutation({
    mutationFn: () => adminApi.toggleCustomer(Number(id)),
    onSuccess: () => {
      toast.success('Status updated')
      queryClient.invalidateQueries({ queryKey: ['admin-customer', id] })
      queryClient.invalidateQueries({ queryKey: ['admin-customers'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => adminApi.deleteCustomer(Number(id)),
    onSuccess: () => {
      toast.success('Customer deleted')
      queryClient.invalidateQueries({ queryKey: ['admin-customers'] })
      router.push('/admin/customers')
    },
    onError: () => toast.error('Failed to delete'),
  })

  if (isLoading) {
    return (
      <div className="space-y-5">
        <div className="h-8 w-48 skeleton rounded" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="card p-6 h-48 skeleton" />
          <div className="lg:col-span-2 card p-6 h-48 skeleton" />
        </div>
      </div>
    )
  }

  if (!customer) return <div className="text-center py-20 text-gray-400">Customer not found</div>

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/customers" className="text-gray-400 hover:text-gray-600 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="font-display text-2xl font-bold text-gray-900 flex-1">{customer.name}</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleMutation.mutate()}
            disabled={toggleMutation.isPending}
            className={`btn text-sm gap-2 ${
              customer.is_active
                ? 'border border-orange-200 text-orange-600 hover:bg-orange-50'
                : 'border border-green-200 text-green-600 hover:bg-green-50'
            }`}
          >
            {customer.is_active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
            {customer.is_active ? 'Suspend' : 'Activate'}
          </button>
          <button
            onClick={() => confirm('Permanently delete this customer?') && deleteMutation.mutate()}
            disabled={deleteMutation.isPending}
            className="btn border border-red-200 text-red-600 hover:bg-red-50 text-sm gap-2"
          >
            <Trash2 className="w-4 h-4" /> Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left — Profile */}
        <div className="space-y-4">
          {/* Info Card */}
          <div className="card p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center font-bold text-primary-600 text-lg flex-shrink-0">
                {customer.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{customer.name}</p>
                <span className={`badge text-2xs ${customer.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                  {customer.is_active ? 'Active' : 'Suspended'}
                </span>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="truncate">{customer.email}</span>
              </div>
              {customer.phone && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span>{customer.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-gray-500 text-xs">
                <span>Joined {formatDate(customer.created_at, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="card p-5 grid grid-cols-3 gap-4 text-center">
            {[
              { label: 'Orders', value: customer.orders_count ?? 0, Icon: ShoppingBag, color: 'text-blue-500' },
              { label: 'Reviews', value: customer.reviews_count ?? 0, Icon: Star, color: 'text-yellow-500' },
              { label: 'Wishlist', value: customer.wishlists_count ?? 0, Icon: Heart, color: 'text-red-400' },
            ].map(({ label, value, Icon, color }) => (
              <div key={label}>
                <Icon className={`w-5 h-5 mx-auto mb-1 ${color}`} />
                <p className="text-xl font-bold text-gray-900">{value}</p>
                <p className="text-xs text-gray-400">{label}</p>
              </div>
            ))}
          </div>

          {/* Addresses */}
          {customer.addresses?.length > 0 && (
            <div className="card p-5">
              <h3 className="font-semibold text-gray-900 mb-3 text-sm">Addresses</h3>
              <div className="space-y-3">
                {customer.addresses.map((addr: any) => (
                  <div key={addr.id} className="flex gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div className="text-gray-600">
                      {addr.is_default && (
                        <span className="text-xs bg-primary-50 text-primary-600 px-1.5 py-0.5 rounded font-medium mr-1">Default</span>
                      )}
                      <span>{addr.address}</span>
                      <br />
                      <span>{addr.city}{addr.state ? `, ${addr.state}` : ''} {addr.zip_code}</span>
                      <br />
                      <span>{addr.country}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right — Order History */}
        <div className="lg:col-span-2 card overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Recent Orders</h2>
          </div>
          {customer.orders?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {['Order', 'Items', 'Total', 'Status', 'Date', ''].map((h) => (
                      <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {customer.orders.map((order: any) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-5 py-3 font-medium text-gray-900">#{order.code}</td>
                      <td className="px-5 py-3 text-gray-600">{order.items_count ?? order.order_items?.length ?? '—'}</td>
                      <td className="px-5 py-3 font-medium">{formatPrice(order.total_amount)}</td>
                      <td className="px-5 py-3">
                        <span className={`badge text-2xs ${getOrderStatusColor(order.status)}`}>{order.status}</span>
                      </td>
                      <td className="px-5 py-3 text-gray-400 text-xs">
                        {formatDate(order.created_at, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-5 py-3">
                        <Link href={`/admin/orders/${order.id}`} className="text-primary-500 hover:underline text-xs">View</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-16 text-center text-gray-400">No orders yet</div>
          )}
        </div>
      </div>
    </div>
  )
}
