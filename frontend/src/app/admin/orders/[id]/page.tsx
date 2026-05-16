'use client'

import { useParams } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/lib/api'
import Image from 'next/image'
import Link from 'next/link'
import { formatPrice, formatDate, getOrderStatusColor, getPaymentStatusColor, getImageUrl } from '@/lib/utils'
import {
  ArrowLeft, MapPin, CheckCircle2, Truck, Package,
  Printer, RotateCcw, CreditCard, ChevronDown, Plus, ExternalLink,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

const STATUS_STEPS = ['pending', 'processing', 'shipped', 'delivered']

const CARRIERS = ['FedEx', 'UPS', 'USPS', 'DHL', 'Yamato', 'Sagawa', 'Japan Post', 'Other']

const SHIPMENT_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'bg-gray-100 text-gray-600' },
  { value: 'picked_up', label: 'Picked Up', color: 'bg-blue-100 text-blue-700' },
  { value: 'in_transit', label: 'In Transit', color: 'bg-indigo-100 text-indigo-700' },
  { value: 'out_for_delivery', label: 'Out for Delivery', color: 'bg-orange-100 text-orange-700' },
  { value: 'delivered', label: 'Delivered', color: 'bg-green-100 text-green-700' },
  { value: 'failed', label: 'Failed', color: 'bg-red-100 text-red-600' },
]

function getShipmentStatusColor(status: string) {
  return SHIPMENT_STATUSES.find((s) => s.value === status)?.color ?? 'bg-gray-100 text-gray-600'
}

function getTrackingUrl(carrier: string, tracking: string): string | null {
  const c = carrier?.toLowerCase()
  if (c?.includes('fedex')) return `https://www.fedex.com/fedextrack/?trknbr=${tracking}`
  if (c?.includes('ups')) return `https://www.ups.com/track?tracknum=${tracking}`
  if (c?.includes('usps')) return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${tracking}`
  if (c?.includes('dhl')) return `https://www.dhl.com/en/express/tracking.html?AWB=${tracking}`
  return null
}

// ── Packing Slip ─────────────────────────────────────────────────────────────
function printPackingSlip(order: any) {
  const win = window.open('', '_blank', 'width=800,height=600')
  if (!win) return

  const items = (order.products ?? [])
    .map((item: any) => `
      <tr>
        <td style="padding:8px 4px;border-bottom:1px solid #eee">${item.product_name}${item.variation_name ? `<br><small style="color:#888">${item.variation_name}</small>` : ''}</td>
        <td style="padding:8px 4px;border-bottom:1px solid #eee;text-align:center">${item.qty}</td>
        <td style="padding:8px 4px;border-bottom:1px solid #eee;text-align:right">$${Number(item.price).toFixed(2)}</td>
        <td style="padding:8px 4px;border-bottom:1px solid #eee;text-align:right">$${Number(item.sub_total).toFixed(2)}</td>
      </tr>`)
    .join('')

  const addr = order.shipping_address
  win.document.write(`<!DOCTYPE html><html><head>
    <title>Packing Slip — #${order.code}</title>
    <style>
      body{font-family:Arial,sans-serif;font-size:13px;color:#111;padding:32px;max-width:700px;margin:0 auto}
      h1{font-size:20px;margin:0 0 4px}
      .meta{color:#666;font-size:12px;margin-bottom:24px}
      .grid{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:24px}
      .box{padding:14px;border:1px solid #ddd;border-radius:6px}
      .box h3{margin:0 0 8px;font-size:13px;text-transform:uppercase;color:#888;letter-spacing:.05em}
      table{width:100%;border-collapse:collapse}
      thead th{text-align:left;padding:8px 4px;border-bottom:2px solid #111;font-size:12px;text-transform:uppercase}
      .totals{margin-top:12px;text-align:right}
      .totals td{padding:4px 8px;font-size:13px}
      .total-row td{font-weight:bold;font-size:15px;border-top:2px solid #111;padding-top:8px}
      @media print{body{padding:0}.no-print{display:none}}
    </style>
  </head><body>
    <div style="display:flex;justify-content:space-between;align-items:flex-start">
      <div>
        <h1>Packing Slip</h1>
        <p class="meta">Order #${order.code} &nbsp;·&nbsp; ${new Date(order.created_at).toLocaleDateString()}</p>
      </div>
      <button class="no-print" onclick="window.print()" style="padding:8px 18px;background:#0989FF;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:13px">Print</button>
    </div>
    <div class="grid">
      <div class="box">
        <h3>Ship To</h3>
        ${addr ? `<p style="margin:0">${addr.name}<br>${addr.address}<br>${addr.city}, ${addr.state} ${addr.zip_code}<br>${addr.country}</p>` : '<p style="margin:0;color:#888">—</p>'}
      </div>
      <div class="box">
        <h3>Customer</h3>
        <p style="margin:0">${order.customer?.name ?? '—'}<br><small style="color:#666">${order.customer?.email ?? ''}</small></p>
      </div>
    </div>
    <table>
      <thead><tr><th>Item</th><th style="text-align:center">Qty</th><th style="text-align:right">Unit Price</th><th style="text-align:right">Total</th></tr></thead>
      <tbody>${items}</tbody>
    </table>
    <table class="totals" style="width:300px;margin-left:auto">
      <tr><td>Subtotal</td><td>$${Number(order.sub_total).toFixed(2)}</td></tr>
      ${order.discount_amount > 0 ? `<tr><td>Discount</td><td>-$${Number(order.discount_amount).toFixed(2)}</td></tr>` : ''}
      ${order.tax_amount > 0 ? `<tr><td>Tax</td><td>$${Number(order.tax_amount).toFixed(2)}</td></tr>` : ''}
      <tr><td>Shipping</td><td>${order.shipping_amount > 0 ? `$${Number(order.shipping_amount).toFixed(2)}` : 'Free'}</td></tr>
      <tr class="total-row"><td>Total</td><td>$${Number(order.total_amount).toFixed(2)}</td></tr>
    </table>
    <p style="margin-top:32px;font-size:11px;color:#888;text-align:center">Thank you for your order!</p>
  </body></html>`)
  win.document.close()
}

// ── Shipment Form ─────────────────────────────────────────────────────────────
function ShipmentSection({ order, onSuccess }: { order: any; onSuccess: () => void }) {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(!order.shipment)
  const shipment = order.shipment
  const [addingNote, setAddingNote] = useState(false)
  const [noteText, setNoteText] = useState('')

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: shipment ? {
      carrier: shipment.carrier ?? '',
      tracking_id: shipment.tracking_id ?? '',
      shipping_method: shipment.shipping_method ?? '',
      status: shipment.status ?? 'pending',
      estimated_delivery_date: shipment.estimated_delivery_date ?? '',
      note: shipment.note ?? '',
    } : {
      carrier: '',
      tracking_id: '',
      shipping_method: '',
      status: 'pending',
      estimated_delivery_date: '',
      note: '',
    }
  })

  const createMutation = useMutation({
    mutationFn: (data: any) => adminApi.createShipment({ ...data, order_id: order.id }),
    onSuccess: () => { toast.success('Shipment created'); setShowForm(false); onSuccess() },
    onError: () => toast.error('Failed to create shipment'),
  })

  const updateMutation = useMutation({
    mutationFn: (data: any) => adminApi.updateShipment(shipment.id, data),
    onSuccess: () => { toast.success('Shipment updated'); setShowForm(false); onSuccess() },
    onError: () => toast.error('Failed to update'),
  })

  const historyMutation = useMutation({
    mutationFn: () => adminApi.addShipmentHistory(shipment.id, { action: 'note', description: noteText }),
    onSuccess: () => { toast.success('Note added'); setAddingNote(false); setNoteText(''); onSuccess() },
  })

  const onSubmit = (data: any) => {
    const payload = { ...data, estimated_delivery_date: data.estimated_delivery_date || null }
    if (shipment) updateMutation.mutate(payload)
    else createMutation.mutate(payload)
  }

  const trackingUrl = shipment ? getTrackingUrl(shipment.carrier, shipment.tracking_id) : null

  return (
    <div className="card overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <Truck className="w-4 h-4 text-primary-500" /> Shipment
        </h3>
        <div className="flex items-center gap-2">
          {shipment && (
            <button
              onClick={() => { setShowForm(!showForm); reset({ carrier: shipment.carrier ?? '', tracking_id: shipment.tracking_id ?? '', shipping_method: shipment.shipping_method ?? '', status: shipment.status ?? 'pending', estimated_delivery_date: shipment.estimated_delivery_date ?? '', note: '' }) }}
              className="text-xs text-primary-500 hover:underline"
            >
              {showForm ? 'Cancel' : 'Edit'}
            </button>
          )}
        </div>
      </div>

      <div className="p-5">
        {/* Existing shipment info */}
        {shipment && !showForm && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className={`badge ${getShipmentStatusColor(shipment.status)}`}>
                {SHIPMENT_STATUSES.find(s => s.value === shipment.status)?.label ?? shipment.status}
              </span>
              {trackingUrl && (
                <a href={trackingUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-primary-500 hover:underline">
                  Track <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-xs text-gray-400">Carrier</p><p className="font-medium">{shipment.carrier ?? '—'}</p></div>
              <div><p className="text-xs text-gray-400">Tracking #</p><p className="font-medium font-mono">{shipment.tracking_id ?? '—'}</p></div>
              <div><p className="text-xs text-gray-400">Method</p><p className="font-medium">{shipment.shipping_method ?? '—'}</p></div>
              <div><p className="text-xs text-gray-400">Est. Delivery</p><p className="font-medium">{shipment.estimated_delivery_date ? formatDate(shipment.estimated_delivery_date, { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}</p></div>
            </div>

            {/* Shipment history */}
            {shipment.histories && shipment.histories.length > 0 && (
              <div className="mt-3 border-t border-gray-100 pt-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">History</p>
                <ol className="relative border-l border-gray-200 ml-2 space-y-2">
                  {shipment.histories.map((h: any) => (
                    <li key={h.id} className="ml-3">
                      <div className="absolute -left-1 w-2 h-2 rounded-full bg-primary-400 border border-white" />
                      <p className="text-xs font-medium capitalize">{h.action}</p>
                      {h.description && <p className="text-xs text-gray-400">{h.description}</p>}
                      <p className="text-2xs text-gray-300">{formatDate(h.created_at, { month: 'short', day: 'numeric' })}</p>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Add note */}
            {addingNote ? (
              <div className="border-t border-gray-100 pt-3 space-y-2">
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  className="input text-sm resize-none"
                  rows={2}
                  placeholder="Add tracking note…"
                />
                <div className="flex gap-2">
                  <button onClick={() => historyMutation.mutate()} disabled={!noteText || historyMutation.isPending} className="btn btn-primary text-xs py-1.5 px-3">Add</button>
                  <button onClick={() => setAddingNote(false)} className="btn border border-gray-200 text-gray-600 text-xs py-1.5 px-3">Cancel</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setAddingNote(true)} className="flex items-center gap-1 text-xs text-gray-400 hover:text-primary-500 transition-colors mt-1">
                <Plus className="w-3 h-3" /> Add note
              </button>
            )}
          </div>
        )}

        {/* Create / Edit form */}
        {(!shipment || showForm) && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            {!shipment && (
              <p className="text-xs text-gray-400 mb-3">No shipment created yet. Fill in the details below.</p>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label text-xs">Carrier</label>
                <select {...register('carrier')} className="input py-2 text-sm">
                  <option value="">Select carrier</option>
                  {CARRIERS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="label text-xs">Tracking Number</label>
                <input {...register('tracking_id')} className="input py-2 text-sm" placeholder="e.g. 1Z999AA10123456784" />
              </div>
              <div>
                <label className="label text-xs">Shipping Method</label>
                <input {...register('shipping_method')} className="input py-2 text-sm" placeholder="e.g. Express, Standard" />
              </div>
              <div>
                <label className="label text-xs">Status</label>
                <select {...register('status')} className="input py-2 text-sm">
                  {SHIPMENT_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="label text-xs">Est. Delivery Date</label>
                <input {...register('estimated_delivery_date')} type="date" className="input py-2 text-sm" />
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="btn btn-primary text-xs py-2 px-4">
                {shipment ? 'Update Shipment' : 'Create Shipment'}
              </button>
              {shipment && (
                <button type="button" onClick={() => setShowForm(false)} className="btn border border-gray-200 text-gray-600 text-xs py-2 px-4">Cancel</button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const qc = useQueryClient()
  const [showPaymentEdit, setShowPaymentEdit] = useState(false)

  const { data: order, isLoading } = useQuery({
    queryKey: ['admin-order', id],
    queryFn: () => adminApi.showOrder(Number(id)).then((r) => r.data?.data),
  })

  const statusMutation = useMutation({
    mutationFn: (status: string) => adminApi.updateOrderStatus(Number(id), { status }),
    onSuccess: () => {
      toast.success('Status updated')
      qc.invalidateQueries({ queryKey: ['admin-order', id] })
      qc.invalidateQueries({ queryKey: ['admin-orders'] })
    },
    onError: () => toast.error('Failed to update'),
  })

  const paymentMutation = useMutation({
    mutationFn: (payment_status: string) => adminApi.updateOrderPaymentStatus(Number(id), { payment_status }),
    onSuccess: () => {
      toast.success('Payment status updated')
      setShowPaymentEdit(false)
      qc.invalidateQueries({ queryKey: ['admin-order', id] })
    },
    onError: () => toast.error('Failed to update'),
  })

  const refresh = () => qc.invalidateQueries({ queryKey: ['admin-order', id] })

  if (isLoading) return <div className="card p-6 h-64 skeleton" />
  if (!order) return (
    <div className="text-center py-20 text-gray-400">
      <p>Order not found.</p>
      <Link href="/admin/orders" className="text-primary-500 hover:underline text-sm mt-2 inline-block">← Back to orders</Link>
    </div>
  )

  const currentStep = STATUS_STEPS.indexOf(order.status)

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/admin/orders" className="btn-icon w-8 h-8 text-gray-500">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Order #{order.code}</h1>
          <p className="text-sm text-gray-400">{formatDate(order.created_at, { month: 'long', day: 'numeric', year: 'numeric' })}</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className={`badge ${getOrderStatusColor(order.status)}`}>{order.status}</span>
          <span className={`badge ${getPaymentStatusColor(order.payment_status)}`}>{order.payment_status}</span>
          <button
            onClick={() => printPackingSlip(order)}
            className="btn border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm gap-2"
          >
            <Printer className="w-4 h-4" /> Packing Slip
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* ── Left column ── */}
        <div className="lg:col-span-2 space-y-5">
          {/* Order Status Progress */}
          <div className="card p-5">
            {STATUS_STEPS.includes(order.status) && (
              <div className="flex items-center mb-5">
                {STATUS_STEPS.map((step, i) => (
                  <div key={step} className="flex items-center flex-1 last:flex-none">
                    <div className={`flex flex-col items-center ${i <= currentStep ? 'text-primary-500' : 'text-gray-300'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 text-xs font-bold
                        ${i < currentStep ? 'bg-primary-500 border-primary-500 text-white' :
                          i === currentStep ? 'border-primary-500 text-primary-500' : 'border-gray-200 text-gray-300'}`}>
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
            )}

            <div>
              <label className="label text-xs">Change Status</label>
              <div className="flex flex-wrap gap-2">
                {['pending','processing','shipped','delivered','completed','cancelled','refunded'].map((s) => (
                  <button
                    key={s}
                    onClick={() => statusMutation.mutate(s)}
                    disabled={order.status === s || statusMutation.isPending}
                    className={`px-3 py-1.5 text-xs rounded-lg border capitalize transition-colors disabled:opacity-40
                      ${order.status === s
                        ? 'border-primary-500 bg-primary-50 text-primary-600 font-semibold'
                        : 'border-gray-200 text-gray-600 hover:border-primary-300 hover:text-primary-500'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
              <Package className="w-4 h-4 text-primary-500" />
              <span className="font-semibold text-gray-900">Items ({order.products?.length ?? 0})</span>
            </div>
            <ul className="divide-y divide-gray-100">
              {order.products?.map((item: any) => (
                <li key={item.id} className="flex gap-4 p-5">
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                    <Image src={getImageUrl(item.product_image)} alt={item.product_name} fill className="object-cover" sizes="56px" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm">{item.product_name}</p>
                    {item.variation_name && <p className="text-xs text-gray-400">{item.variation_name}</p>}
                    <div className="flex justify-between mt-1.5">
                      <span className="text-sm text-gray-500">Qty: {item.qty} × {formatPrice(item.price)}</span>
                      <span className="font-semibold text-gray-900 text-sm">{formatPrice(item.sub_total)}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Shipment */}
          <ShipmentSection order={order} onSuccess={refresh} />

          {/* Returns */}
          {order.returns && order.returns.length > 0 && (
            <div className="card overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-orange-500" /> Returns ({order.returns.length})
                </h3>
              </div>
              <div className="divide-y divide-gray-100">
                {order.returns.map((ret: any) => (
                  <div key={ret.id} className="p-5 flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`badge text-2xs ${
                          ret.status === 'approved' ? 'bg-green-100 text-green-700' :
                          ret.status === 'rejected' ? 'bg-red-100 text-red-600' :
                          ret.status === 'completed' ? 'bg-teal-100 text-teal-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>{ret.status}</span>
                        {ret.refund_amount > 0 && (
                          <span className="text-xs font-medium text-green-600">Refund: {formatPrice(ret.refund_amount)}</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{ret.return_reason ?? 'No reason provided'}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{formatDate(ret.created_at, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                    <Link href={`/admin/returns/${ret.id}`} className="text-xs text-primary-500 hover:underline flex-shrink-0">
                      Manage →
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Timeline */}
          {order.histories && order.histories.length > 0 && (
            <div className="card p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Order History</h3>
              <ol className="relative border-l border-gray-200 ml-3 space-y-4">
                {order.histories.map((h: any) => (
                  <li key={h.id} className="ml-4">
                    <div className="absolute -left-1.5 w-3 h-3 rounded-full bg-primary-500 border-2 border-white" />
                    <p className="text-sm font-medium text-gray-900 capitalize">{h.action?.replace(/_/g, ' ')}</p>
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

        {/* ── Right column ── */}
        <div className="space-y-5">
          {/* Summary */}
          <div className="card p-5">
            <h3 className="font-semibold text-gray-900 mb-3">Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>{formatPrice(order.sub_total)}</span></div>
              {order.discount_amount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-{formatPrice(order.discount_amount)}</span></div>}
              {order.tax_amount > 0 && <div className="flex justify-between text-gray-600"><span>Tax</span><span>{formatPrice(order.tax_amount)}</span></div>}
              <div className="flex justify-between text-gray-600"><span>Shipping</span><span>{order.shipping_amount > 0 ? formatPrice(order.shipping_amount) : 'Free'}</span></div>
              <div className="border-t border-gray-100 pt-2 flex justify-between font-semibold text-gray-900">
                <span>Total</span><span className="text-primary-500">{formatPrice(order.total_amount)}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1 text-gray-500">
                  <CreditCard className="w-3.5 h-3.5" /> Payment
                </span>
                <div className="flex items-center gap-1.5">
                  {showPaymentEdit ? (
                    <>
                      {['pending','completed','failed','refunded'].map((ps) => (
                        <button key={ps} onClick={() => paymentMutation.mutate(ps)}
                          disabled={order.payment_status === ps}
                          className={`px-2 py-0.5 text-2xs rounded border capitalize ${order.payment_status === ps ? 'border-primary-500 text-primary-600 bg-primary-50' : 'border-gray-200 text-gray-600 hover:border-primary-300'}`}
                        >{ps}</button>
                      ))}
                      <button onClick={() => setShowPaymentEdit(false)} className="text-gray-400 hover:text-gray-600 ml-1">✕</button>
                    </>
                  ) : (
                    <>
                      <span className={`badge text-2xs ${getPaymentStatusColor(order.payment_status)}`}>{order.payment_status}</span>
                      <button onClick={() => setShowPaymentEdit(true)} className="text-primary-500 hover:underline text-2xs">Edit</button>
                    </>
                  )}
                </div>
              </div>
              {order.payment_method && <p className="text-xs text-gray-500">Method: <span className="font-medium text-gray-700">{order.payment_method}</span></p>}
              {order.coupon_code && <p className="text-xs text-gray-500">Coupon: <span className="font-medium text-gray-700">{order.coupon_code}</span></p>}
            </div>
          </div>

          {/* Customer */}
          <div className="card p-5">
            <h3 className="font-semibold text-gray-900 mb-3">Customer</h3>
            <p className="font-medium text-gray-900">{order.customer?.name}</p>
            <p className="text-sm text-gray-500">{order.customer?.email}</p>
            {order.customer?.id && (
              <Link href={`/admin/customers/${order.customer.id}`} className="text-xs text-primary-500 hover:underline mt-2 inline-block">
                View profile →
              </Link>
            )}
          </div>

          {/* Shipping address */}
          {order.shipping_address && (
            <div className="card p-5">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary-500" /> Ship To
              </h3>
              <address className="not-italic text-sm text-gray-600 leading-relaxed">
                <p className="font-medium text-gray-900">{order.shipping_address.name}</p>
                <p>{order.shipping_address.address}</p>
                <p>{order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.zip_code}</p>
                <p>{order.shipping_address.country}</p>
                {order.shipping_address.phone && <p className="mt-1 text-gray-400">{order.shipping_address.phone}</p>}
              </address>
            </div>
          )}

          {/* Store */}
          {order.store && (
            <div className="card p-5">
              <h3 className="font-semibold text-gray-900 mb-3">Vendor</h3>
              <p className="font-medium text-gray-900">{order.store.name}</p>
              <Link href={`/admin/stores/${order.store.id}`} className="text-xs text-primary-500 hover:underline mt-1 inline-block">
                View vendor →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
