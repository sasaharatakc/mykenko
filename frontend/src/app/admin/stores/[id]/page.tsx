'use client'

import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/lib/api'
import { formatPrice, formatDate } from '@/lib/utils'
import {
  ArrowLeft, BadgeCheck, X, ExternalLink,
  Package, ShoppingBag, DollarSign, Percent,
} from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { useState } from 'react'

export default function AdminStoreDetailPage() {
  const { id } = useParams<{ id: string }>()
  const queryClient = useQueryClient()
  const [commissionInput, setCommissionInput] = useState<string>('')
  const [editingCommission, setEditingCommission] = useState(false)

  const { data: store, isLoading } = useQuery({
    queryKey: ['admin-store', id],
    queryFn: () => adminApi.showStore(Number(id)).then((r) => {
      const s = r.data?.data
      setCommissionInput(String(s?.commission_rate ?? ''))
      return s
    }),
  })

  const verifyMutation = useMutation({
    mutationFn: () => adminApi.verifyStore(Number(id)),
    onSuccess: () => {
      toast.success('Store verified')
      queryClient.invalidateQueries({ queryKey: ['admin-store', id] })
      queryClient.invalidateQueries({ queryKey: ['admin-stores'] })
    },
  })

  const unverifyMutation = useMutation({
    mutationFn: () => adminApi.unverifyStore(Number(id)),
    onSuccess: () => {
      toast.success('Verification removed')
      queryClient.invalidateQueries({ queryKey: ['admin-store', id] })
      queryClient.invalidateQueries({ queryKey: ['admin-stores'] })
    },
  })

  const commissionMutation = useMutation({
    mutationFn: (rate: number) => adminApi.updateStoreCommission(Number(id), { commission_rate: rate }),
    onSuccess: () => {
      toast.success('Commission updated')
      setEditingCommission(false)
      queryClient.invalidateQueries({ queryKey: ['admin-store', id] })
    },
    onError: () => toast.error('Failed to update commission'),
  })

  const handleCommissionSave = () => {
    const rate = parseFloat(commissionInput)
    if (isNaN(rate) || rate < 0 || rate > 100) {
      toast.error('Enter a value between 0 and 100')
      return
    }
    commissionMutation.mutate(rate)
  }

  if (isLoading) {
    return (
      <div className="space-y-5">
        <div className="h-8 w-48 skeleton rounded" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="card p-6 h-56 skeleton" />
          <div className="lg:col-span-2 card p-6 h-56 skeleton" />
        </div>
      </div>
    )
  }

  if (!store) return <div className="text-center py-20 text-gray-400">Store not found</div>

  const totalRevenue = store.revenues_sum_sub_amount ?? 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/stores" className="text-gray-400 hover:text-gray-600 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="font-display text-2xl font-bold text-gray-900 flex-1">{store.name}</h1>
        <div className="flex items-center gap-2">
          {store.is_verified ? (
            <button
              onClick={() => confirm('Remove verification from this store?') && unverifyMutation.mutate()}
              disabled={unverifyMutation.isPending}
              className="btn border border-orange-200 text-orange-600 hover:bg-orange-50 text-sm gap-2"
            >
              <X className="w-4 h-4" /> Unverify
            </button>
          ) : (
            <button
              onClick={() => verifyMutation.mutate()}
              disabled={verifyMutation.isPending}
              className="btn border border-primary-200 text-primary-600 hover:bg-primary-50 text-sm gap-2"
            >
              <BadgeCheck className="w-4 h-4" /> Verify
            </button>
          )}
          {store.slug && (
            <Link
              href={`/stores/${store.slug}`}
              target="_blank"
              className="btn border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm gap-2"
            >
              <ExternalLink className="w-4 h-4" /> View Store
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left — Store Info */}
        <div className="space-y-4">
          {/* Info Card */}
          <div className="card p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center font-bold text-primary-600 text-lg flex-shrink-0">
                {store.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{store.name}</p>
                {store.is_verified ? (
                  <span className="flex items-center gap-1 text-xs text-primary-500 font-medium">
                    <BadgeCheck className="w-3.5 h-3.5" /> Verified
                  </span>
                ) : (
                  <span className="text-xs text-gray-400">Not verified</span>
                )}
              </div>
            </div>

            {store.description && (
              <p className="text-sm text-gray-600 leading-relaxed">{store.description}</p>
            )}

            <div className="text-sm space-y-1 text-gray-500">
              <p><span className="font-medium text-gray-700">Owner:</span> {store.owner?.name}</p>
              <p><span className="font-medium text-gray-700">Email:</span> {store.owner?.email}</p>
              {store.created_at && (
                <p><span className="font-medium text-gray-700">Since:</span> {formatDate(store.created_at, { month: 'long', year: 'numeric' })}</p>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="card p-5 grid grid-cols-3 gap-4 text-center">
            {[
              { label: 'Products', value: store.products_count ?? 0, Icon: Package, color: 'text-blue-500' },
              { label: 'Orders', value: store.orders_count ?? 0, Icon: ShoppingBag, color: 'text-purple-500' },
              { label: 'Revenue', value: formatPrice(totalRevenue), Icon: DollarSign, color: 'text-green-500', small: true },
            ].map(({ label, value, Icon, color, small }) => (
              <div key={label}>
                <Icon className={`w-5 h-5 mx-auto mb-1 ${color}`} />
                <p className={`font-bold text-gray-900 ${small ? 'text-base' : 'text-xl'}`}>{value}</p>
                <p className="text-xs text-gray-400">{label}</p>
              </div>
            ))}
          </div>

          {/* Commission */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-1.5">
                <Percent className="w-4 h-4 text-gray-400" /> Commission Rate
              </h3>
              {!editingCommission && (
                <button
                  onClick={() => { setCommissionInput(String(store.commission_rate ?? '')); setEditingCommission(true) }}
                  className="text-xs text-primary-500 hover:underline"
                >
                  Edit
                </button>
              )}
            </div>

            {editingCommission ? (
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={commissionInput}
                    onChange={(e) => setCommissionInput(e.target.value)}
                    className="input py-1.5 text-sm pr-8"
                    autoFocus
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
                </div>
                <button
                  onClick={handleCommissionSave}
                  disabled={commissionMutation.isPending}
                  className="btn btn-primary text-xs py-1.5 px-3"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingCommission(false)}
                  className="btn border border-gray-200 text-gray-600 text-xs py-1.5 px-3"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <p className="text-3xl font-bold text-gray-900">
                {store.commission_rate ?? '—'}<span className="text-base font-normal text-gray-400 ml-1">%</span>
              </p>
            )}
          </div>
        </div>

        {/* Right — Recent Revenues */}
        <div className="lg:col-span-2 card overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Recent Transactions</h2>
            <Link href={`/admin/withdrawals`} className="text-xs text-primary-500 hover:underline">
              View withdrawals →
            </Link>
          </div>

          {store.revenues?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {['Order', 'Sub Total', 'Commission', 'Net', 'Date'].map((h) => (
                      <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {store.revenues.map((rev: any) => {
                    const commission = (rev.sub_amount * (rev.commission_rate ?? store.commission_rate ?? 0)) / 100
                    const net = rev.sub_amount - commission
                    return (
                      <tr key={rev.id} className="hover:bg-gray-50">
                        <td className="px-5 py-3">
                          <Link href={`/admin/orders/${rev.order_id}`} className="text-primary-500 hover:underline font-medium">
                            #{rev.order_id}
                          </Link>
                        </td>
                        <td className="px-5 py-3 font-medium">{formatPrice(rev.sub_amount)}</td>
                        <td className="px-5 py-3 text-gray-500">{formatPrice(commission)}</td>
                        <td className="px-5 py-3 text-green-600 font-medium">{formatPrice(net)}</td>
                        <td className="px-5 py-3 text-gray-400 text-xs">
                          {formatDate(rev.created_at, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-16 text-center text-gray-400">No transactions yet</div>
          )}
        </div>
      </div>
    </div>
  )
}
