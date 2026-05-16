'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/lib/api'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { CheckCircle, XCircle, Clock } from 'lucide-react'
import { Pagination } from '@/components/ui/Pagination'

const STATUS_STYLES: Record<string, string> = {
  pending:   'bg-warning/10 text-warning',
  approved:  'bg-success-light text-success',
  completed: 'bg-success-light text-success',
  rejected:  'bg-danger-light text-danger',
}

export default function AdminWithdrawalsPage() {
  const qc = useQueryClient()
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'withdrawals', status, page],
    queryFn: () => adminApi.withdrawals({ status: status || undefined, page, per_page: 20 }),
  })

  const processMutation = useMutation({
    mutationFn: ({ id, action }: { id: number; action: string }) =>
      adminApi.processWithdrawal(id, { status: action }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'withdrawals'] })
      toast.success('Withdrawal updated')
    },
    onError: () => toast.error('Failed to update withdrawal'),
  })

  const withdrawals = data?.data?.data ?? []
  const meta = data?.data?.meta

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Withdrawals</h1>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="completed">Completed</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden space-y-0">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Store</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3 text-left">Method</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-left">Requested</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {withdrawals.map((w: any) => (
                <tr key={w.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900 text-sm">{w.store?.name ?? '—'}</div>
                    {w.bank_name && <div className="text-xs text-gray-400">{w.bank_name}</div>}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-900">
                    ${Number(w.amount).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 capitalize">
                    {w.payment_channel ?? 'Bank Transfer'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[w.status] ?? 'bg-gray-100 text-gray-500'}`}>
                      {w.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {w.created_at ? format(new Date(w.created_at), 'MMM d, yyyy') : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {w.status === 'pending' && (
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => processMutation.mutate({ id: w.id, action: 'approved' })}
                          title="Approve"
                          className="p-1.5 rounded hover:bg-success-light text-gray-400 hover:text-success transition-colors"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => processMutation.mutate({ id: w.id, action: 'rejected' })}
                          title="Reject"
                          className="p-1.5 rounded hover:bg-danger-light text-gray-400 hover:text-danger transition-colors"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    {w.status === 'approved' && (
                      <button
                        onClick={() => processMutation.mutate({ id: w.id, action: 'completed' })}
                        title="Mark Completed"
                        className="p-1.5 rounded hover:bg-success-light text-gray-400 hover:text-success transition-colors"
                      >
                        <Clock className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {withdrawals.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-gray-400">No withdrawals found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {meta && meta.last_page > 1 && (
        <Pagination currentPage={meta.current_page} lastPage={meta.last_page} onPageChange={(p) => { setPage(p) }} />
      )}
    </div>
  )
}
