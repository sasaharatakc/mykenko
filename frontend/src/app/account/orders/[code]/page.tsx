'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { orderApi, apiClient } from '@/lib/api'
import type { Order } from '@/types'
import { getImageUrl, formatPrice, formatDate, getOrderStatusColor, getPaymentStatusColor } from '@/lib/utils'
import { ArrowLeft, Package, MapPin, CheckCircle2, Download } from 'lucide-react'
import toast from 'react-hot-toast'

export default function OrderDetailPage() {
  const { code } = useParams<{ code: string }>()
  const queryClient = useQueryClient()

  const { data: order, isLoading } = useQuery<Order>({
    queryKey: ['order', code],
    queryFn: () => orderApi.show(code).then((r) => r.data?.data),
  })

  const [cancelOpen, setCancelOpen] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [downloadingInvoice, setDownloadingInvoice] = useState(false)

  const cancelMutation = useMutation({
    mutationFn: (reason: string) => orderApi.cancel(code, reason),
    onSuccess: () => {
      toast.success('注文をキャンセルしました')
      queryClient.invalidateQueries({ queryKey: ['order', code] })
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      setCancelOpen(false)
      setCancelReason('')
    },
    onError: () => toast.error('キャンセルに失敗しました'),
  })

  const handleDownloadInvoice = async () => {
    setDownloadingInvoice(true)
    try {
      const res = await apiClient.get(`/orders/${code}/invoice`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
      const a = document.createElement('a')
      a.href = url
      a.download = `invoice-${code}.pdf`
      document.body.appendChild(a); a.click(); a.remove()
      window.URL.revokeObjectURL(url)
    } catch {
      toast.error('請求書のダウンロードに失敗しました')
    } finally {
      setDownloadingInvoice(false)
    }
  }

  if (isLoading) {
    return (
      <div className="bg-gray-50 min-h-screen container-narrow py-8">
        <div className="h-6 skeleton rounded w-1/3 mb-8" />
        <div className="card p-6 space-y-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-4 skeleton rounded" />)}
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center py-32 gap-4 text-center">
        <Package className="w-16 h-16 text-gray-200" />
        <h2 className="font-display text-2xl font-semibold text-gray-900">Order not found</h2>
        <Link href="/account/orders" className="btn-primary">Back to Orders</Link>
      </div>
    )
  }

  const STATUS_STEPS = ['pending', 'processing', 'shipped', 'delivered']
  const currentStep = STATUS_STEPS.indexOf(order.status)

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white border-b border-gray-100">
        <div className="container-narrow py-8">
          <Link href="/account/orders" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-500 transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Orders
          </Link>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="font-display text-2xl font-bold text-gray-900">Order #{order.code}</h1>
              <p className="text-gray-500 text-sm mt-1">
                Placed on {formatDate(order.created_at, { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`badge ${getOrderStatusColor(order.status)}`}>{order.status.replace(/_/g, ' ')}</span>
              <span className={`badge ${getPaymentStatusColor(order.payment_status)}`}>{order.payment_status.replace(/_/g, ' ')}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container-narrow py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Items + Timeline */}
        <div className="lg:col-span-2 space-y-6">
          {/* Progress */}
          {STATUS_STEPS.includes(order.status) && (
            <div className="card p-5">
              <h2 className="font-semibold text-gray-900 mb-5">Order Progress</h2>
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

          {/* Items */}
          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 font-semibold text-gray-900">
              Items ({order.item_count})
            </div>
            <ul className="divide-y divide-gray-100">
              {order.products?.map((item) => (
                <li key={item.id} className="flex gap-4 p-5">
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                    <Image
                      src={getImageUrl(item.product_image)}
                      alt={item.product_name}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm">{item.product_name}</p>
                    {item.variation_name && (
                      <p className="text-xs text-gray-400 mt-0.5">{item.variation_name}</p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm text-gray-500">Qty: {item.qty}</span>
                      <span className="font-semibold text-gray-900">{formatPrice(item.sub_total)}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Shipment Timeline */}
          {order.shipment?.histories && order.shipment.histories.length > 0 && (
            <div className="card p-5">
              <h2 className="font-semibold text-gray-900 mb-4">Tracking</h2>
              {order.shipment.tracking_id && (
                <p className="text-sm text-gray-500 mb-4">
                  Tracking: <span className="font-medium text-gray-900">{order.shipment.tracking_id}</span>
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
        </div>

        {/* Right: Summary + Actions */}
        <div className="space-y-5">
          {/* Order Summary */}
          <div className="card p-5">
            <h2 className="font-semibold text-gray-900 mb-4">Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatPrice(order.sub_total)}</span>
              </div>
              {order.discount_amount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-{formatPrice(order.discount_amount)}</span>
                </div>
              )}
              {order.tax_amount > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Tax</span>
                  <span>{formatPrice(order.tax_amount)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>{order.shipping_amount > 0 ? formatPrice(order.shipping_amount) : 'Free'}</span>
              </div>
              <div className="border-t border-gray-100 pt-2 flex justify-between font-semibold text-gray-900">
                <span>Total</span>
                <span className="text-primary-500">{formatPrice(order.total_amount)}</span>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          {order.shipping_address && (
            <div className="card p-5">
              <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary-500" />
                Shipping Address
              </h2>
              <address className="text-sm text-gray-600 not-italic leading-relaxed">
                <p className="font-medium text-gray-900">{order.shipping_address.name}</p>
                <p>{order.shipping_address.address}</p>
                <p>{order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.zip_code}</p>
                <p>{order.shipping_address.country}</p>
                {order.shipping_address.phone && <p className="mt-1">{order.shipping_address.phone}</p>}
              </address>
            </div>
          )}

          {/* Actions */}
          <div className="card p-5 space-y-3">
            {order.can_cancel && !cancelOpen && (
              <button
                onClick={() => setCancelOpen(true)}
                className="w-full btn border border-red-200 text-red-600 hover:bg-red-50"
              >
                注文をキャンセル
              </button>
            )}
            {cancelOpen && (
              <div className="space-y-3 p-3 border border-red-100 rounded-lg bg-red-50">
                <p className="text-sm font-medium text-red-700">キャンセル理由</p>
                <textarea
                  value={cancelReason}
                  onChange={e => setCancelReason(e.target.value)}
                  placeholder="キャンセルの理由を入力してください（任意）"
                  rows={3}
                  className="w-full text-sm border border-red-200 rounded-lg p-2 resize-none focus:outline-none focus:ring-2 focus:ring-red-200"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => cancelMutation.mutate(cancelReason)}
                    disabled={cancelMutation.isPending}
                    className="flex-1 btn bg-red-500 text-white hover:bg-red-600 disabled:opacity-60 text-sm py-2"
                  >
                    {cancelMutation.isPending ? 'キャンセル中…' : 'キャンセルを確定'}
                  </button>
                  <button
                    onClick={() => { setCancelOpen(false); setCancelReason('') }}
                    className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg"
                  >
                    戻る
                  </button>
                </div>
              </div>
            )}
            <button
              onClick={handleDownloadInvoice}
              disabled={downloadingInvoice}
              className="w-full btn border border-gray-200 text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <Download className="w-4 h-4" />
              {downloadingInvoice ? 'ダウンロード中…' : '請求書をダウンロード'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
