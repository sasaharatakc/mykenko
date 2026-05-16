'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { vendorApi } from '@/lib/api'
import { formatPrice, formatDate } from '@/lib/utils'
import { Wallet, ArrowDownCircle } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'

const withdrawSchema = z.object({
  amount: z.coerce.number().min(10, 'Minimum withdrawal is $10'),
  method: z.string().min(1, 'Select a method'),
  details: z.string().min(1, 'Provide payment details'),
})

type WithdrawForm = z.infer<typeof withdrawSchema>

const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-600',
}

export default function VendorPayoutsPage() {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)

  const { data: dashData } = useQuery({
    queryKey: ['vendor-dashboard'],
    queryFn: () => vendorApi.dashboard().then((r) => r.data),
  })

  const { data: withdrawalsData, isLoading } = useQuery({
    queryKey: ['vendor-withdrawals'],
    queryFn: () => vendorApi.withdrawals().then((r) => r.data),
  })

  const { register, handleSubmit, reset, formState: { errors } } = useForm<WithdrawForm>({
    resolver: zodResolver(withdrawSchema),
  })

  const mutation = useMutation({
    mutationFn: (data: WithdrawForm) => vendorApi.withdraw(data),
    onSuccess: () => {
      toast.success('Withdrawal request submitted!')
      setShowForm(false)
      reset()
      queryClient.invalidateQueries({ queryKey: ['vendor-withdrawals'] })
      queryClient.invalidateQueries({ queryKey: ['vendor-dashboard'] })
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Failed to submit'),
  })

  const available = dashData?.stats?.pending_balance ?? 0
  const totalRevenue = dashData?.stats?.total_revenue ?? 0
  const withdrawn = dashData?.stats?.withdrawn_balance ?? 0
  const withdrawals = withdrawalsData?.data ?? []

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-gray-900">Payouts</h1>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Revenue', value: totalRevenue, Icon: Wallet, color: 'text-primary-500 bg-primary-50' },
          { label: 'Available Balance', value: available, Icon: ArrowDownCircle, color: 'text-green-500 bg-green-50' },
          { label: 'Total Withdrawn', value: withdrawn, Icon: Wallet, color: 'text-gray-500 bg-gray-100' },
        ].map(({ label, value, Icon, color }) => (
          <div key={label} className="card p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-500">{label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{formatPrice(value)}</p>
              </div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Request Payout */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Request Withdrawal</h2>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              disabled={available < 10}
              className="btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Request Payout
            </button>
          )}
        </div>

        {available < 10 && !showForm && (
          <p className="text-sm text-gray-500">Minimum withdrawal amount is $10. You have {formatPrice(available)} available.</p>
        )}

        {showForm && (
          <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4 max-w-md">
            <div>
              <label className="label">Amount ($) <span className="text-red-500">*</span></label>
              <input
                type="number"
                step="0.01"
                max={available}
                {...register('amount')}
                className="input"
                placeholder={`Max: ${formatPrice(available)}`}
              />
              {errors.amount && <p className="text-xs text-red-500 mt-1">{errors.amount.message}</p>}
            </div>

            <div>
              <label className="label">Payment Method <span className="text-red-500">*</span></label>
              <select {...register('method')} className="input">
                <option value="">Select method</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="paypal">PayPal</option>
                <option value="stripe">Stripe</option>
              </select>
              {errors.method && <p className="text-xs text-red-500 mt-1">{errors.method.message}</p>}
            </div>

            <div>
              <label className="label">Account Details <span className="text-red-500">*</span></label>
              <textarea
                {...register('details')}
                rows={3}
                className="input resize-none"
                placeholder="Bank account number, PayPal email, etc."
              />
              {errors.details && <p className="text-xs text-red-500 mt-1">{errors.details.message}</p>}
            </div>

            <div className="flex gap-3">
              <button type="submit" disabled={mutation.isPending} className="btn-primary disabled:opacity-60">
                {mutation.isPending ? 'Submitting…' : 'Submit Request'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); reset() }} className="btn border border-gray-200 text-gray-700 hover:bg-gray-50">
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* History */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Withdrawal History</h2>
        </div>
        {isLoading ? (
          <div className="p-5 space-y-3">
            {[...Array(3)].map((_, i) => <div key={i} className="h-10 skeleton rounded" />)}
          </div>
        ) : !withdrawals.length ? (
          <div className="py-10 text-center text-gray-400 text-sm">No withdrawals yet</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Amount', 'Method', 'Status', 'Note', 'Date'].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {withdrawals.map((w: any) => (
                <tr key={w.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 font-semibold text-gray-900">{formatPrice(w.amount)}</td>
                  <td className="px-5 py-3 text-gray-600 capitalize">{w.payment_channel?.replace('_', ' ')}</td>
                  <td className="px-5 py-3">
                    <span className={`badge text-2xs ${STATUS_COLOR[w.status] ?? 'bg-gray-100 text-gray-600'}`}>{w.status}</span>
                  </td>
                  <td className="px-5 py-3 text-gray-400 text-xs">{w.note ?? '—'}</td>
                  <td className="px-5 py-3 text-gray-400 text-xs">
                    {formatDate(w.created_at, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
