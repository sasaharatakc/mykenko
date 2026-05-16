'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/lib/api'
import { formatDate, formatPrice } from '@/lib/utils'
import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import Link from 'next/link'
import Image from 'next/image'
import { useParams } from 'next/navigation'

function statusBadgeClass(status: string): string {
  switch (status) {
    case 'pending':    return 'bg-yellow-100 text-yellow-700'
    case 'processing': return 'bg-blue-100 text-blue-700'
    case 'approved':   return 'bg-green-100 text-green-700'
    case 'rejected':   return 'bg-red-100 text-red-600'
    case 'completed':  return 'bg-teal-100 text-teal-700'
    default:           return 'bg-gray-100 text-gray-600'
  }
}

function statusLabel(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

export default function AdminReturnDetailPage() {
  const params = useParams()
  const id = Number(params.id)
  const queryClient = useQueryClient()
  const [rejectOpen, setRejectOpen] = useState(false)
  const [rejectNote, setRejectNote] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin-return', id],
    queryFn: () => adminApi.showReturn(id).then((r) => r.data),
    enabled: !isNaN(id),
  })

  const ret = data?.data ?? data

  const updateMutation = useMutation({
    mutationFn: (payload: object) => adminApi.updateReturn(id, payload),
    onSuccess: () => {
      toast.success('Return updated')
      queryClient.invalidateQueries({ queryKey: ['admin-return', id] })
      queryClient.invalidateQueries({ queryKey: ['admin-returns'] })
      setRejectOpen(false)
      setRejectNote('')
    },
    onError: () => toast.error('Failed to update return'),
  })

  const handleApprove = () => updateMutation.mutate({ status: 'approved' })
  const handleReject = () => {
    if (!rejectNote.trim()) {
      toast.error('Please enter a reason for rejection')
      return
    }
    updateMutation.mutate({ status: 'rejected', note: rejectNote.trim() })
  }
  const handleComplete = () => updateMutation.mutate({ status: 'completed' })

  const canAction = ret && (ret.status === 'pending' || ret.status === 'processing')
  const canComplete = ret && ret.status === 'approved'

  const items: any[] = ret?.items ?? []

  if (isLoading) {
    return (
      <div className="space-y-5">
        <div className="h-8 skeleton rounded w-48" />
        <div className="grid grid-cols-3 gap-5">
          <div className="card p-5 space-y-3">
            {[...Array(6)].map((_, i) => <div key={i} className="h-4 skeleton rounded" />)}
          </div>
          <div className="col-span-2 card p-5 space-y-3">
            {[...Array(4)].map((_, i) => <div key={i} className="h-10 skeleton rounded" />)}
          </div>
        </div>
      </div>
    )
  }

  if (!ret) {
    return (
      <div className="space-y-5">
        <Link href="/admin/returns" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Returns
        </Link>
        <div className="card p-12 text-center text-gray-400">Return not found</div>
      </div>
    )
  }

  const customer = ret.customer ?? ret.order?.customer
  const order = ret.order

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin/returns"
          className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <h1 className="font-display text-2xl font-bold text-gray-900">Return #{id}</h1>
        <span className={`badge text-2xs ${statusBadgeClass(ret.status)}`}>
          {statusLabel(ret.status)}
        </span>
      </div>

      {/* Main layout */}
      <div className="grid grid-cols-3 gap-5 items-start">
        {/* Left: Return info */}
        <div className="card p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-900">Return Details</h2>

          <div className="space-y-3 text-sm">
            {order && (
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Order</p>
                <Link
                  href={`/admin/orders/${ret.order_id}`}
                  className="font-mono font-medium text-primary-600 hover:text-primary-700 transition-colors"
                >
                  #{order.code ?? ret.order_id}
                </Link>
              </div>
            )}

            {customer && (
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Customer</p>
                <p className="font-medium text-gray-900">{customer.name}</p>
                <p className="text-xs text-gray-400">{customer.email}</p>
              </div>
            )}

            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Reason</p>
              <p className="text-gray-700">{ret.return_reason ?? ret.reason ?? '—'}</p>
            </div>

            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Status</p>
              <span className={`badge text-2xs ${statusBadgeClass(ret.status)}`}>
                {statusLabel(ret.status)}
              </span>
            </div>

            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Refund Amount</p>
              <p className="font-semibold text-gray-900">
                {ret.refund_amount != null ? formatPrice(ret.refund_amount) : '—'}
              </p>
            </div>

            {ret.note && (
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Note</p>
                <p className="text-gray-600 text-xs leading-relaxed">{ret.note}</p>
              </div>
            )}

            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Requested</p>
              <p className="text-gray-600 text-xs">
                {formatDate(ret.created_at, { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>

            {ret.updated_at && ret.updated_at !== ret.created_at && (
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Last Updated</p>
                <p className="text-gray-600 text-xs">
                  {formatDate(ret.updated_at, { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Items + Actions */}
        <div className="col-span-2 space-y-5">
          {/* Items table */}
          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900">Returned Items</h2>
            </div>
            {items.length > 0 ? (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {['Product', 'Qty', 'Refund'].map((h) => (
                      <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map((item: any, idx: number) => (
                    <tr key={item.id ?? idx} className="hover:bg-gray-50">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          {item.product?.image ? (
                            <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                              <Image
                                src={item.product.image}
                                alt={item.product.name ?? 'Product'}
                                width={40}
                                height={40}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-gray-100 flex-shrink-0" />
                          )}
                          <span className="font-medium text-gray-900">
                            {item.product?.name ?? item.name ?? '—'}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-gray-600">{item.qty ?? item.quantity ?? '—'}</td>
                      <td className="px-5 py-3 font-medium text-gray-900">
                        {item.refund_amount != null ? formatPrice(item.refund_amount) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="py-8 text-center text-gray-400 text-sm">No items listed</div>
            )}
          </div>

          {/* Action panel */}
          {(canAction || canComplete) && (
            <div className="card p-5 space-y-4">
              <h2 className="text-sm font-semibold text-gray-900">Actions</h2>

              <div className="flex flex-wrap gap-3">
                {canAction && (
                  <>
                    <button
                      onClick={handleApprove}
                      disabled={updateMutation.isPending}
                      className="btn-primary bg-green-500 hover:bg-green-600 disabled:opacity-50"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => setRejectOpen((v) => !v)}
                      disabled={updateMutation.isPending}
                      className="btn-primary bg-red-500 hover:bg-red-600 disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </>
                )}

                {canComplete && (
                  <button
                    onClick={handleComplete}
                    disabled={updateMutation.isPending}
                    className="btn-primary disabled:opacity-50"
                  >
                    Mark Completed
                  </button>
                )}
              </div>

              {rejectOpen && (
                <div className="space-y-3 pt-2 border-t border-gray-100">
                  <label className="block text-xs font-medium text-gray-700">
                    Rejection Reason <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={rejectNote}
                    onChange={(e) => setRejectNote(e.target.value)}
                    rows={3}
                    placeholder="Enter reason for rejection…"
                    className="input text-sm w-full resize-none"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleReject}
                      disabled={updateMutation.isPending || !rejectNote.trim()}
                      className="btn-primary bg-red-500 hover:bg-red-600 disabled:opacity-50 text-sm"
                    >
                      Confirm Rejection
                    </button>
                    <button
                      onClick={() => { setRejectOpen(false); setRejectNote('') }}
                      className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
