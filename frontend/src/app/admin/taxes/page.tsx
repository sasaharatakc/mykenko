'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/lib/api'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2, X, Percent } from 'lucide-react'

const schema = z.object({
  title:      z.string().min(1, 'Title is required'),
  percentage: z.number().min(0).max(100),
  priority:   z.number().int().optional(),
  status:     z.enum(['published', 'draft']).default('published'),
})
type FormData = z.infer<typeof schema>

export default function AdminTaxesPage() {
  const qc = useQueryClient()
  const [editing, setEditing] = useState<number | null>(null)
  const [showModal, setShowModal] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'taxes'],
    queryFn: () => adminApi.taxes().then(r => r.data),
  })

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { status: 'published', priority: 0 },
  })

  const createMutation = useMutation({
    mutationFn: (d: FormData) => adminApi.createTax(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'taxes'] }); close(); toast.success('Tax created') },
    onError: () => toast.error('Failed'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: FormData }) => adminApi.updateTax(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'taxes'] }); close(); toast.success('Updated') },
    onError: () => toast.error('Failed'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteTax(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'taxes'] }); toast.success('Deleted') },
    onError: () => toast.error('Failed to delete'),
  })

  const taxes = data?.data ?? []

  function open(t?: any) {
    if (t) {
      setEditing(t.id)
      reset({ title: t.title, percentage: t.percentage, priority: t.priority ?? 0, status: t.status })
    } else {
      setEditing(null)
      reset({ title: '', percentage: 0, priority: 0, status: 'published' })
    }
    setShowModal(true)
  }

  function close() { setShowModal(false); setEditing(null) }

  function onSubmit(d: FormData) {
    if (editing) updateMutation.mutate({ id: editing, data: d })
    else createMutation.mutate(d)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Percent className="w-6 h-6" /> Taxes
        </h1>
        <button onClick={() => open()} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600">
          <Plus className="w-4 h-4" /> Add Tax
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-12"><div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" /></div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-5 py-3 text-left">Title</th>
                <th className="px-5 py-3 text-right">Rate</th>
                <th className="px-5 py-3 text-right">Priority</th>
                <th className="px-5 py-3 text-center">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {taxes.map((t: any) => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 font-medium text-gray-900">{t.title}</td>
                  <td className="px-5 py-3 text-right">
                    <span className="font-semibold text-primary">{t.percentage}%</span>
                  </td>
                  <td className="px-5 py-3 text-right text-gray-500">{t.priority}</td>
                  <td className="px-5 py-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${t.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {t.status === 'published' ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => open(t)} className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-primary"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => { if (confirm('Delete?')) deleteMutation.mutate(t.id) }} className="p-1.5 rounded hover:bg-red-50 text-gray-500 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {taxes.length === 0 && <tr><td colSpan={5} className="px-5 py-10 text-center text-gray-400">No taxes configured.</td></tr>}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">{editing ? 'Edit Tax' : 'Add Tax'}</h2>
              <button onClick={close} className="p-1 rounded hover:bg-gray-100"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input {...register('title')} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rate (%) *</label>
                  <input type="number" step="0.01" {...register('percentage', { valueAsNumber: true })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  {errors.percentage && <p className="text-xs text-red-500 mt-1">{errors.percentage.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <input type="number" {...register('priority', { valueAsNumber: true })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select {...register('status')} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={close} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="flex-1 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-600 disabled:opacity-60">
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
