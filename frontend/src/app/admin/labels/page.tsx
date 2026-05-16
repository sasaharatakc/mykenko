'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/lib/api'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2, X } from 'lucide-react'

const PRESET_COLORS = ['#0989FF', '#EF4444', '#22C55E', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316']

export default function AdminLabelsPage() {
  const qc = useQueryClient()
  const [editing, setEditing] = useState<{ id: number; name: string; color: string; status: string } | null>(null)
  const [newLabel, setNewLabel] = useState({ name: '', color: '#0989FF', status: 'published' })
  const [showModal, setShowModal] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'labels'],
    queryFn: () => adminApi.labels().then(r => r.data),
  })

  const createMutation = useMutation({
    mutationFn: () => adminApi.createLabel(newLabel),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'labels'] }); setNewLabel({ name: '', color: '#0989FF', status: 'published' }); toast.success('Label created') },
    onError: () => toast.error('Failed'),
  })

  const updateMutation = useMutation({
    mutationFn: () => adminApi.updateLabel(editing!.id, editing!),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'labels'] }); setShowModal(false); setEditing(null); toast.success('Updated') },
    onError: () => toast.error('Failed'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteLabel(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'labels'] }); toast.success('Deleted') },
    onError: () => toast.error('Failed'),
  })

  const labels = data?.data ?? []

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Product Labels</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Add New Label</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Name *</label>
              <input value={newLabel.name} onChange={e => setNewLabel({ ...newLabel, name: e.target.value })} placeholder="e.g. New, Hot, Sale"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Color</label>
              <div className="flex items-center gap-2">
                <input type="color" value={newLabel.color} onChange={e => setNewLabel({ ...newLabel, color: e.target.value })} className="w-10 h-10 rounded cursor-pointer border border-gray-200" />
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_COLORS.map(c => (
                    <button key={c} type="button" onClick={() => setNewLabel({ ...newLabel, color: c })}
                      className={`w-6 h-6 rounded-full border-2 ${newLabel.color === c ? 'border-gray-800 scale-110' : 'border-transparent'} transition-transform`}
                      style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 pt-1">
              <div className="px-3 py-1 rounded-full text-white text-xs font-bold" style={{ backgroundColor: newLabel.color }}>
                {newLabel.name || 'Preview'}
              </div>
            </div>
            <button onClick={() => { if (newLabel.name) createMutation.mutate() }} disabled={!newLabel.name || createMutation.isPending}
              className="w-full px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-600 disabled:opacity-60">
              {createMutation.isPending ? 'Adding...' : 'Add Label'}
            </button>
          </div>
        </div>

        {/* Labels list */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center py-12"><div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" /></div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">Label</th>
                  <th className="px-4 py-3 text-right">Products</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {labels.map((l: any) => (
                  <tr key={l.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: l.color }} />
                        <span className="px-2 py-0.5 rounded-full text-white text-xs font-bold" style={{ backgroundColor: l.color }}>{l.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600 text-sm">{l.products_count ?? 0}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${l.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                        {l.status === 'published' ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => { setEditing({ id: l.id, name: l.name, color: l.color, status: l.status }); setShowModal(true) }}
                          className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-primary"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => { if (confirm('Delete?')) deleteMutation.mutate(l.id) }}
                          className="p-1.5 rounded hover:bg-red-50 text-gray-500 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {labels.length === 0 && <tr><td colSpan={4} className="px-4 py-10 text-center text-gray-400">No labels yet.</td></tr>}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Edit Label</h2>
              <button onClick={() => setShowModal(false)} className="p-1 rounded hover:bg-gray-100"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Name</label>
                <input value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Color</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={editing.color} onChange={e => setEditing({ ...editing, color: e.target.value })} className="w-10 h-10 rounded cursor-pointer" />
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_COLORS.map(c => (
                      <button key={c} type="button" onClick={() => setEditing({ ...editing, color: c })}
                        className={`w-6 h-6 rounded-full border-2 ${editing.color === c ? 'border-gray-800' : 'border-transparent'}`}
                        style={{ backgroundColor: c }} />
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm">Cancel</button>
                <button onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending}
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
