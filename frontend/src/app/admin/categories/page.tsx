'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/lib/api'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2, X } from 'lucide-react'

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().optional(),
  description: z.string().optional(),
  parent_id: z.string().optional(),
  order: z.number().optional(),
  status: z.enum(['published', 'draft']).default('published'),
})
type FormData = z.infer<typeof schema>

export default function AdminCategoriesPage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<number | null>(null)
  const [showModal, setShowModal] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'categories', search],
    queryFn: () => adminApi.categories({ search }),
  })

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { status: 'published' },
  })

  const createMutation = useMutation({
    mutationFn: (d: FormData) => adminApi.createCategory(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'categories'] }); close(); toast.success('Category created') },
    onError: () => toast.error('Failed to create category'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: FormData }) => adminApi.updateCategory(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'categories'] }); close(); toast.success('Category updated') },
    onError: () => toast.error('Failed to update category'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteCategory(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'categories'] }); toast.success('Category deleted') },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Failed to delete'),
  })

  const categories = data?.data?.data ?? []

  function open(cat?: any) {
    if (cat) {
      setEditing(cat.id)
      reset({ name: cat.name, slug: cat.slug, description: cat.description ?? '', parent_id: cat.parent_id ?? '', order: cat.order ?? 0, status: cat.status ?? 'published' })
    } else {
      setEditing(null)
      reset({ name: '', slug: '', description: '', parent_id: '', order: 0, status: 'published' })
    }
    setShowModal(true)
  }

  function close() { setShowModal(false); setEditing(null) }

  function onSubmit(d: FormData) {
    const payload = { ...d, parent_id: d.parent_id || undefined, order: d.order ?? 0 }
    if (editing) updateMutation.mutate({ id: editing, data: payload })
    else createMutation.mutate(payload)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
        <button onClick={() => open()} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600">
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search categories..."
            className="w-full max-w-sm px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" /></div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Slug</th>
                <th className="px-4 py-3 text-left">Parent</th>
                <th className="px-4 py-3 text-right">Products</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {categories.map((cat: any) => (
                <tr key={cat.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{cat.name}</td>
                  <td className="px-4 py-3 text-gray-500 text-sm">{cat.slug}</td>
                  <td className="px-4 py-3 text-gray-500 text-sm">{cat.parent?.name ?? '—'}</td>
                  <td className="px-4 py-3 text-right text-gray-700 text-sm">{cat.products_count}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cat.status === 'published' ? 'bg-success-light text-success' : 'bg-gray-100 text-gray-500'}`}>
                      {cat.status === 'published' ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => open(cat)} className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-primary">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => { if (confirm('Delete this category?')) deleteMutation.mutate(cat.id) }}
                        className="p-1.5 rounded hover:bg-danger-light text-gray-500 hover:text-danger"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-400">No categories found.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">{editing ? 'Edit Category' : 'Add Category'}</h2>
              <button onClick={close} className="p-1 rounded hover:bg-gray-100"><X className="w-4 h-4" /></button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input {...register('name')} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                {errors.name && <p className="text-xs text-danger mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                <input {...register('slug')} placeholder="auto-generated if blank" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea {...register('description')} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">親カテゴリ</label>
                <select {...register('parent_id')} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                  <option value="">— なし（ルートカテゴリ）</option>
                  {categories
                    .filter((c: any) => c.id !== editing) // 自分自身は除外
                    .map((c: any) => (
                      <option key={c.id} value={String(c.id)}>{c.name}</option>
                    ))}
                </select>
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
