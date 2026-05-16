'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/lib/api'
import { formatDate } from '@/lib/utils'
import { Plus, Pencil, Trash2, Search } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { Pagination } from '@/components/ui/Pagination'

export default function AdminBlogPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin-blog', { page, search, status }],
    queryFn: () => adminApi.blogs({ page, per_page: 20, search: search || undefined, status: status || undefined }).then((r) => r.data),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteBlog(id),
    onSuccess: () => {
      toast.success('Post deleted')
      queryClient.invalidateQueries({ queryKey: ['admin-blog'] })
    },
    onError: () => toast.error('Failed to delete'),
  })

  const posts = data?.data ?? []
  const meta = data?.meta

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="font-display text-2xl font-bold text-gray-900">Blog Posts</h1>
        <Link href="/admin/blog/new" className="btn-primary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> New Post
        </Link>
      </div>

      <div className="card p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search posts…"
            className="input pl-9 py-2 text-sm"
          />
        </div>
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1) }}
          className="input py-2 text-sm w-36"
        >
          <option value="">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Title', 'Category', 'Author', 'Views', 'Status', 'Published', ''].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading
                ? [...Array(8)].map((_, i) => (
                  <tr key={i}>{[...Array(7)].map((_, j) => <td key={j} className="px-5 py-3"><div className="h-4 skeleton rounded" /></td>)}</tr>
                ))
                : posts.map((p: any) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3">
                      <p className="font-medium text-gray-900 line-clamp-1 max-w-xs">{p.title}</p>
                      {p.is_featured && <span className="badge bg-amber-100 text-amber-700 text-2xs">Featured</span>}
                    </td>
                    <td className="px-5 py-3 text-gray-500 text-xs">{p.categories?.[0]?.name ?? '—'}</td>
                    <td className="px-5 py-3 text-gray-500 text-xs">{p.author?.name ?? '—'}</td>
                    <td className="px-5 py-3 text-gray-600">{p.views?.toLocaleString()}</td>
                    <td className="px-5 py-3">
                      <span className={`badge text-2xs ${p.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-400 text-xs">
                      {p.published_at ? formatDate(p.published_at, { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1">
                        <Link href={`/admin/blog/${p.id}/edit`} className="w-7 h-7 flex items-center justify-center rounded text-gray-400 hover:text-primary-500 hover:bg-primary-50 transition-colors">
                          <Pencil className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => confirm('Delete this post?') && deleteMutation.mutate(p.id)}
                          className="w-7 h-7 flex items-center justify-center rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        {!isLoading && !posts.length && (
          <div className="py-12 text-center text-gray-400">No posts found</div>
        )}
      </div>

      {meta && meta.last_page > 1 && (
        <Pagination currentPage={meta.current_page} lastPage={meta.last_page} onPageChange={setPage} />
      )}
    </div>
  )
}
