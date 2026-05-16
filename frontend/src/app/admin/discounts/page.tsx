'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/lib/api'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2, X, Tag, Copy } from 'lucide-react'
import { formatDate } from '@/lib/utils'

const schema = z.object({
  code:             z.string().min(1, 'Code is required').transform(v => v.toUpperCase()),
  description:      z.string().optional(),
  type:             z.enum(['percentage', 'fixed']),
  value:            z.number().min(0, 'Value must be ≥ 0'),
  min_order_amount: z.number().min(0).optional(),
  max_uses:         z.number().int().min(1).optional(),
  starts_at:        z.string().optional(),
  expires_at:       z.string().optional(),
  status:           z.enum(['published', 'draft']).default('published'),
})
type FormData = z.infer<typeof schema>

const STATUS_STYLES: Record<string, string> = {
  published: 'bg-green-100 text-green-700',
  draft:     'bg-gray-100 text-gray-500',
}

export default function AdminDiscountsPage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [editing, setEditing] = useState<number | null>(null)
  const [showModal, setShowModal] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'discounts', search, statusFilter],
    queryFn: () => adminApi.discounts({ search: search || undefined, status: statusFilter || undefined }).then(r => r.data),
  })

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { type: 'percentage', status: 'published' },
  })

  const createMutation = useMutation({
    mutationFn: (d: FormData) => adminApi.createDiscount(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'discounts'] }); close(); toast.success('Discount created') },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Failed'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: FormData }) => adminApi.updateDiscount(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'discounts'] }); close(); toast.success('Discount updated') },
    onError: () => toast.error('Failed to update'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteDiscount(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'discounts'] }); toast.success('Discount deleted') },
    onError: () => toast.error('Failed to delete'),
  })

  const discounts = data?.data ?? []

  function open(d?: any) {
    if (d) {
      setEditing(d.id)
      reset({
        code: d.code, description: d.description ?? '', type: d.type, value: d.value,
        min_order_amount: d.min_order_amount ?? undefined, max_uses: d.max_uses ?? undefined,
        starts_at: d.starts_at ? d.starts_at.slice(0, 10) : '',
        expires_at: d.expires_at ? d.expires_at.slice(0, 10) : '',
        status: d.status,
      })
    } else {
      setEditing(null)
      reset({ code: '', description: '', type: 'percentage', value: 10, status: 'published' })
    }
    setShowModal(true)
  }

  function close() { setShowModal(false); setEditing(null) }

  function onSubmit(d: FormData) {
    const payload = { ...d, starts_at: d.starts_at || undefined, expires_at: d.expires_at || undefined }
    if (editing) updateMutation.mutate({ id: editing, data: payload })
    else createMutation.mutate(payload)
  }

  function copyCode(code: string) {
    navigator.clipboard.writeText(code)
    toast.success('Code copied!')
  }

  function isExpired(expiresAt: string | null) {
    if (!expiresAt) return false
    return new Date(expiresAt) < new Date()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Discount Codes</h1>
        <button onClick={() => open()} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600">
          <Plus className="w-4 h-4" /> Add Discount
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search code or description…"
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
          <option value="">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-12"><div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" /></div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Code</th>
                <th className="px-4 py-3 text-left">Type / Value</th>
                <th className="px-4 py-3 text-left">Description</th>
                <th className="px-4 py-3 text-right">Used / Max</th>
                <th className="px-4 py-3 text-left">Min Order</th>
                <th className="px-4 py-3 text-left">Expires</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {discounts.map((d: any) => (
                <tr key={d.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <code className="px-2 py-0.5 bg-gray-100 rounded text-sm font-mono font-bold text-gray-800">{d.code}</code>
                      <button onClick={() => copyCode(d.code)} className="p-1 text-gray-400 hover:text-primary">
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    <span className="capitalize">{d.type}</span>
                    <span className="ml-1 font-semibold text-primary">
                      {d.type === 'percentage' ? `${d.value}%` : `$${d.value}`}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 max-w-[200px] truncate">{d.description || '—'}</td>
                  <td className="px-4 py-3 text-right text-sm">
                    <span className="font-medium">{d.uses ?? 0}</span>
                    <span className="text-gray-400"> / {d.max_uses ?? '∞'}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {d.min_order_amount ? `$${d.min_order_amount}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {d.expires_at
                      ? <span className={isExpired(d.expires_at) ? 'text-red-500' : 'text-gray-600'}>
                          {formatDate(d.expires_at, { month: 'short', day: 'numeric', year: 'numeric' })}
                          {isExpired(d.expires_at) && <span className="ml-1 text-xs">(Expired)</span>}
                        </span>
                      : <span className="text-gray-400">No expiry</span>
                    }
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[d.status] ?? 'bg-gray-100 text-gray-500'}`}>
                      {d.status === 'published' ? 'Active' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => open(d)} className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-primary">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => { if (confirm('Delete this discount?')) deleteMutation.mutate(d.id) }}
                        className="p-1.5 rounded hover:bg-red-50 text-gray-500 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {discounts.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-10 text-center text-gray-400">No discounts found.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">{editing ? 'Edit Discount' : 'Add Discount'}</h2>
              <button onClick={close} className="p-1 rounded hover:bg-gray-100"><X className="w-4 h-4" /></button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Code *</label>
                  <input {...register('code')} placeholder="e.g. SAVE20" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  {errors.code && <p className="text-xs text-red-500 mt-1">{errors.code.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                  <select {...register('type')} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount ($)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Value *</label>
                  <input type="number" step="0.01" {...register('value', { valueAsNumber: true })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  {errors.value && <p className="text-xs text-red-500 mt-1">{errors.value.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Order ($)</label>
                  <input type="number" step="0.01" {...register('min_order_amount', { valueAsNumber: true })} placeholder="No minimum" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input {...register('description')} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input type="date" {...register('starts_at')} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                  <input type="date" {...register('expires_at')} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Uses</label>
                  <input type="number" {...register('max_uses', { valueAsNumber: true })} placeholder="Unlimited" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select {...register('status')} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                    <option value="published">Active</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={close} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-600 disabled:opacity-60"
                >
                  {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
