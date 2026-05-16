'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { orderApi } from '@/lib/api'
import type { Order } from '@/types'
import { formatPrice, formatDate, getOrderStatusColor, getPaymentStatusColor } from '@/lib/utils'
import { Search, Package, CheckCircle2, MapPin } from 'lucide-react'

export default function TrackOrderPage() {
  const [code, setCode] = useState('')
  const [token, setToken] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const { data: order, isLoading, isError } = useQuery<Order>({
    queryKey: ['track-order', code, token],
    queryFn: () => orderApi.track(code, token).then((r) => r.data?.data),
    enabled: submitted && !!code && !!token,
    retry: false,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  const STATUS_STEPS = ['pending', 'processing', 'shipped', 'delivered']
  const currentStep = order ? STATUS_STEPS.indexOf(order.status) : -1

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white border-b border-gray-100">
        <div className="container-narrow py-10 text-center max-w-lg mx-auto">
          <Package className="w-10 h-10 text-primary-500 mx-auto mb-3" />
          <h1 className="font-display text-2xl font-bold text-gray-900">Track Your Order</h1>
          <p className="text-gray-500 mt-2">Enter your order code and tracking token to see its status.</p>
        </div>
      </div>

      <div className="container-narrow py-10 max-w-lg mx-auto">
        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          <div>
            <label className="label">Order Code</label>
            <input
              type="text"
              value={code}
              onChange={(e) => { setCode(e.target.value.toUpperCase()); setSubmitted(false) }}
              placeholder="e.g. ABC12345"
              className="input uppercase"
            />
          </div>
          <div>
            <label className="label">Order Token</label>
            <input
              type="text"
              value={token}
              onChange={(e) => { setToken(e.target.value); setSubmitted(false) }}
              placeholder="Token from your confirmation email"
              className="input"
            />
          </div>
          <button
            type="submit"
            disabled={!code || !token || isLoading}
            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <Search className="w-4 h-4" />
            {isLoading ? 'Searching…' : 'Track Order'}
          </button>
        </form>

        {submitted && isError && (
          <div className="mt-6 card p-6 text-center">
            <p className="text-gray-500">No order found with those details. Please check and try again.</p>
          </div>
        )}

        {order && (
          <div className="mt-6 space-y-5">
            {/* Header */}
            <div className="card p-5">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h2 className="font-semibold text-gray-900">Order #{order.code}</h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {formatDate(order.created_at, { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
                <div className="flex gap-2">
                  <span className={`badge ${getOrderStatusColor(order.status)}`}>{order.status.replace(/_/g, ' ')}</span>
                  <span className={`badge ${getPaymentStatusColor(order.payment_status)}`}>{order.payment_status.replace(/_/g, ' ')}</span>
                </div>
              </div>
            </div>

            {/* Progress */}
            {STATUS_STEPS.includes(order.status) && (
              <div className="card p-5">
                <div className="flex items-center">
                  {STATUS_STEPS.map((step, i) => (
                    <div key={step} className="flex items-center flex-1 last:flex-none">
                      <div className={`flex flex-col items-center ${i <= currentStep ? 'text-primary-500' : 'text-gray-300'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 text-xs font-bold
                          ${i < currentStep ? 'bg-primary-500 border-primary-500 text-white' :
                            i === currentStep ? 'border-primary-500 text-primary-500' :
                            'border-gray-200 text-gray-300'}`}
                        >
                          {i < currentStep ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                        </div>
                        <span className="text-2xs mt-1 capitalize hidden sm:block">{step}</span>
                      </div>
                      {i < STATUS_STEPS.length - 1 && (
                        <div className={`flex-1 h-0.5 mx-1 ${i < currentStep ? 'bg-primary-500' : 'bg-gray-200'}`} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Shipment tracking */}
            {order.shipment?.histories && order.shipment.histories.length > 0 && (
              <div className="card p-5">
                <h3 className="font-semibold text-gray-900 mb-3">Tracking History</h3>
                {order.shipment.tracking_id && (
                  <p className="text-sm text-gray-500 mb-4">
                    Tracking #: <span className="font-medium text-gray-900">{order.shipment.tracking_id}</span>
                  </p>
                )}
                <ol className="relative border-l border-gray-200 ml-3 space-y-4">
                  {order.shipment.histories.map((h) => (
                    <li key={h.id} className="ml-4">
                      <div className="absolute -left-1.5 w-3 h-3 rounded-full bg-primary-500" />
                      <p className="text-sm font-medium text-gray-900">{h.action?.replace(/_/g, ' ')}</p>
                      {h.description && <p className="text-xs text-gray-500">{h.description}</p>}
                      <p className="text-xs text-gray-400 mt-0.5">
                        {formatDate(h.created_at, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Address */}
            {order.shipping_address && (
              <div className="card p-5">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary-500" />
                  Shipping To
                </h3>
                <address className="text-sm text-gray-600 not-italic">
                  <p className="font-medium text-gray-900">{order.shipping_address.name}</p>
                  <p>{order.shipping_address.address}</p>
                  <p>{order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.zip_code}</p>
                </address>
              </div>
            )}

            {/* Total */}
            <div className="card p-5 flex items-center justify-between">
              <span className="text-gray-600">Order Total</span>
              <span className="font-semibold text-primary-500 text-lg">{formatPrice(order.total_amount)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
