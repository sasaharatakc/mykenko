'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/lib/api'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2, X, Layers, Star } from 'lucide-react'

const schema = z.object({
  name:        z.string().min(1, 'Name is required'),
  slug:        z.string().optional(),
  description: z.string().optional(),
  status:      z.enum(['published', 'draft']).default('published'),
  is_featured: z.boolean().optional(),
  order:       z.number().optional(),
})
type FormData = z.infer<typeof schema>

export default function AdminCollectionsPage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<number | null>(null)
  const [showModal, setShowModal] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'collections', search],
    queryFn: () => adminApi.collections({ search: search || undefined }).then(r => r.data),
  })

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { status: 'published', is_featured: false, order: 0 },
  })

  const createMutation = useMutation({
    mutationFn: (d: FormData) => adminApi.createCollection(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'collections'] }); close(); toast.success('Collection created') },
    onError: () => toast.error('Failed'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: FormData }) => adminApi.updateCollection(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'collections'] }); close(); toast.success('Updated') },
    onError: () => toast.error('Failed'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteCollection(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'collections'] }); toast.success('Deleted') },
    onError: () => toast.error('Failed to delete'),
  })

  const collections = data?.data ?? []

  function open(c?: any) {
    if (c) {
      setEditing(c.id)
      reset({ name: c.name, slug: c.slug, description: c.description ?? '', status: c.status, is_featured: c.is_featured, order: c.order ?? 0 })
    } else {
      setEditing(null)
      reset({ name: '', slug: '', description: '', status: 'published', is_featured: false, order: 0 })
    }
    setShowModal(true)
  }

  function close() { setShowModal(false); setEditing(null) }

  function onSubmit(d: FormData) {
    const payload = { ...d, slug: d.slug || undefined }
    if (editing) updateMutation.mutate({ id: editing, data: payload })
    else createMutation.mutate(payload)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><Layers className="w-5 h-5" /> Collections</h1>
        <button onClick={() => open()} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600">
          <Plus className="w-4 h-4" /> Add Collection
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search collections…"
            className="w-full max-w-sm px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
        </div>
        {isLoading ? (
          <div className="flex justify-center py-12"><div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" /></div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Slug</th>
                <th className="px-4 py-3 text-right">Products</th>
                <th className="px-4 py-3 text-center">Featured</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {collections.map((c: any) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{c.name}</td>
                  <td className="px-4 py-3 text-gray-400 text-sm">{c.slug}</td>
                  <td className="px-4 py-3 text-right text-gray-600 text-sm">{c.products_count ?? 0}</td>
                  <td className="px-4 py-3 text-center">{c.is_featured && <Star className="w-4 h-4 text-amber-400 fill-amber-400 mx-auto" />}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                      {c.status === 'published' ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => open(c)} className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-primary"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => { if (confirm('Delete?')) deleteMutation.mutate(c.id) }} className="p-1.5 rounded hover:bg-red-50 text-gray-500 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {collections.length === 0 && <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-400">No collections found.</td></tr>}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">{editing ? 'Edit Collection' : 'Add Collection'}</h2>
              <button onClick={close} className="p-1 rounded hover:bg-gray-100"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input {...register('name')} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                <input {...register('slug')} placeholder="auto-generated if blank" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea {...register('description')} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select {...register('status')} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" {...register('is_featured')} className="w-4 h-4 accent-primary" />
                    <span className="text-sm text-gray-700">Featured</span>
                  </label>
                </div>
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
