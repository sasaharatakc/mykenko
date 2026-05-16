'use client'

import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/lib/api'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2, X, Star, Upload, ExternalLink } from 'lucide-react'
import { getImageUrl } from '@/lib/utils'

const schema = z.object({
  name:        z.string().min(1, 'Name is required'),
  slug:        z.string().optional(),
  description: z.string().optional(),
  website:     z.string().url('有効なURLを入力してください').optional().or(z.literal('')),
  order:       z.number().optional(),
  status:      z.enum(['published', 'draft']).default('published'),
  is_featured: z.boolean().optional(),
})
type FormData = z.infer<typeof schema>

export default function AdminBrandsPage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<number | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string>('')
  const fileRef = useRef<HTMLInputElement>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'brands', search],
    queryFn: () => adminApi.adminBrands({ search: search || undefined, per_page: 50 }).then(r => r.data),
  })

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { status: 'published', is_featured: false },
  })

  function buildFormData(d: FormData): globalThis.FormData {
    const fd = new globalThis.FormData()
    Object.entries(d).forEach(([k, v]) => {
      if (v === undefined || v === null || v === '') return
      fd.append(k, String(v))
    })
    if (logoFile) fd.append('logo', logoFile)
    return fd
  }

  const createMutation = useMutation({
    mutationFn: (d: FormData) => adminApi.createBrand(buildFormData(d)),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'brands'] }); close(); toast.success('ブランドを作成しました') },
    onError: () => toast.error('作成に失敗しました'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: FormData }) => {
      const fd = buildFormData(data)
      fd.append('_method', 'PUT')
      return adminApi.updateBrand(id, fd)
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'brands'] }); close(); toast.success('ブランドを更新しました') },
    onError: () => toast.error('更新に失敗しました'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteBrand(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'brands'] }); toast.success('削除しました') },
    onError: (e: any) => toast.error(e.response?.data?.message ?? '削除に失敗しました'),
  })

  const brands = data?.data ?? []

  function open(b?: any) {
    setLogoFile(null)
    if (b) {
      setEditing(b.id)
      setLogoPreview(b.logo ? getImageUrl(b.logo) : '')
      reset({ name: b.name, slug: b.slug, description: b.description ?? '', website: b.website ?? '', order: b.order ?? 0, status: b.status ?? 'published', is_featured: b.is_featured ?? false })
    } else {
      setEditing(null)
      setLogoPreview('')
      reset({ name: '', slug: '', description: '', website: '', order: 0, status: 'published', is_featured: false })
    }
    setShowModal(true)
  }

  function close() { setShowModal(false); setEditing(null); setLogoFile(null); setLogoPreview('') }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setLogoFile(file)
    setLogoPreview(URL.createObjectURL(file))
  }

  function onSubmit(d: FormData) {
    if (editing) updateMutation.mutate({ id: editing, data: d })
    else createMutation.mutate(d)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">ブランド</h1>
        <button onClick={() => open()} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 text-sm font-medium">
          <Plus className="w-4 h-4" /> ブランドを追加
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ブランドを検索..."
            className="w-full max-w-sm px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" /></div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-4 py-3 text-left">ブランド</th>
                <th className="px-4 py-3 text-left">Slug</th>
                <th className="px-4 py-3 text-left">ウェブサイト</th>
                <th className="px-4 py-3 text-right">商品数</th>
                <th className="px-4 py-3 text-center">おすすめ</th>
                <th className="px-4 py-3 text-center">ステータス</th>
                <th className="px-4 py-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {brands.map((b: any) => (
                <tr key={b.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {b.logo
                        ? <img src={getImageUrl(b.logo)} alt={b.name} className="w-9 h-9 rounded-lg object-contain border border-gray-100" />
                        : <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-400">{b.name?.[0]}</div>
                      }
                      <span className="font-medium text-gray-900">{b.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-sm font-mono">{b.slug}</td>
                  <td className="px-4 py-3 text-sm">
                    {b.website
                      ? <a href={b.website} target="_blank" rel="noopener noreferrer"
                          className="text-primary-500 hover:underline flex items-center gap-1 max-w-[160px] truncate">
                          <ExternalLink className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{b.website.replace(/^https?:\/\//, '')}</span>
                        </a>
                      : <span className="text-gray-400">—</span>
                    }
                  </td>
                  <td className="px-4 py-3 text-right text-gray-700 text-sm">{b.products_count ?? 0}</td>
                  <td className="px-4 py-3 text-center">
                    {b.is_featured && <Star className="w-4 h-4 text-amber-400 fill-amber-400 mx-auto" />}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${b.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {b.status === 'published' ? '公開中' : '下書き'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => open(b)} className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-primary-500">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => { if (confirm('このブランドを削除しますか？')) deleteMutation.mutate(b.id) }}
                        className="p-1.5 rounded hover:bg-red-50 text-gray-500 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {brands.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-400">ブランドがありません</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 flex items-center justify-between px-6 py-4">
              <h2 className="text-lg font-bold text-gray-900">{editing ? 'ブランドを編集' : 'ブランドを追加'}</h2>
              <button onClick={close} className="p-1 rounded hover:bg-gray-100"><X className="w-4 h-4" /></button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              {/* Logo Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ロゴ画像</label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden bg-gray-50 flex-shrink-0">
                    {logoPreview
                      ? <img src={logoPreview} alt="logo" className="w-full h-full object-contain" />
                      : <Upload className="w-5 h-5 text-gray-300" />
                    }
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs text-gray-700 hover:bg-gray-50"
                    >
                      {logoPreview ? '画像を変更' : '画像を選択'}
                    </button>
                    {logoPreview && (
                      <button
                        type="button"
                        onClick={() => { setLogoFile(null); setLogoPreview('') }}
                        className="ml-2 text-xs text-red-500 hover:text-red-700"
                      >
                        削除
                      </button>
                    )}
                    <p className="text-xs text-gray-400 mt-1">PNG, JPG — 最大 2MB</p>
                  </div>
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ブランド名 <span className="text-red-500">*</span></label>
                <input {...register('name')} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                <input {...register('slug')} placeholder="空白の場合は自動生成" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 font-mono" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ウェブサイト</label>
                <input {...register('website')} placeholder="https://..." className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                {errors.website && <p className="text-xs text-red-500 mt-1">{errors.website.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">説明</label>
                <textarea {...register('description')} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">ステータス</label>
                  <select {...register('status')} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                    <option value="published">公開</option>
                    <option value="draft">下書き</option>
                  </select>
                </div>
                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" {...register('is_featured')} className="w-4 h-4 accent-primary" />
                    <span className="text-sm text-gray-700">おすすめ</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={close} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">キャンセル</button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-600 disabled:opacity-60"
                >
                  {createMutation.isPending || updateMutation.isPending ? '保存中...' : '保存'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
