'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/lib/api'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2, X, Tag } from 'lucide-react'

export default function AdminProductTagsPage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<{ id: number; name: string; status: string } | null>(null)
  const [newName, setNewName] = useState('')
  const [showModal, setShowModal] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'product-tags', search],
    queryFn: () => adminApi.productTags({ search: search || undefined, per_page: 100 }).then(r => r.data),
  })

  const createMutation = useMutation({
    mutationFn: (name: string) => adminApi.createProductTag({ name, status: 'published' }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'product-tags'] }); setNewName(''); toast.success('Tag created') },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Failed'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, name, status }: { id: number; name: string; status: string }) =>
      adminApi.updateProductTag(id, { name, status }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'product-tags'] }); setShowModal(false); setEditing(null); toast.success('Updated') },
    onError: () => toast.error('Failed'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteProductTag(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'product-tags'] }); toast.success('Deleted') },
    onError: () => toast.error('Failed to delete'),
  })

  const tags = data?.data ?? []

  function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (newName.trim()) createMutation.mutate(newName.trim())
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><Tag className="w-5 h-5" /> Product Tags</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add new tag */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Add New Tag</h2>
          <form onSubmit={handleCreate} className="space-y-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Name *</label>
              <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Tag name" required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <button type="submit" disabled={createMutation.isPending}
              className="w-full px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-600 disabled:opacity-60">
              {createMutation.isPending ? 'Adding...' : 'Add Tag'}
            </button>
          </form>
        </div>

        {/* Tags list */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tags…"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
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
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tags.map((t: any) => (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{t.name}</td>
                    <td className="px-4 py-3 text-gray-400 text-sm">{t.slug}</td>
                    <td className="px-4 py-3 text-right text-gray-600 text-sm">{t.products_count ?? 0}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${t.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                        {t.status === 'published' ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => { setEditing({ id: t.id, name: t.name, status: t.status }); setShowModal(true) }}
                          className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-primary"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => { if (confirm('Delete?')) deleteMutation.mutate(t.id) }}
                          className="p-1.5 rounded hover:bg-red-50 text-gray-500 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {tags.length === 0 && <tr><td colSpan={5} className="px-4 py-10 text-center text-gray-400">No tags found.</td></tr>}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Edit Tag</h2>
              <button onClick={() => setShowModal(false)} className="p-1 rounded hover:bg-gray-100"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Name</label>
                <input value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Status</label>
                <select value={editing.status} onChange={e => setEditing({ ...editing, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
                <button onClick={() => updateMutation.mutate(editing)} disabled={updateMutation.isPending}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-600 disabled:opacity-60">
                  {updateMutation.isPending ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
