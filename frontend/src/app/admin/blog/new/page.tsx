'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation } from '@tanstack/react-query'
import { adminApi, blogApi } from '@/lib/api'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { ArrowLeft, Upload, X } from 'lucide-react'

const schema = z.object({
  title: z.string().min(2, 'Title required'),
  description: z.string().max(500).optional(),
  content: z.string().optional(),
  status: z.enum(['published', 'draft']),
  is_featured: z.boolean().optional(),
  published_at: z.string().optional(),
  category_ids: z.array(z.coerce.number()).optional(),
})

type FormData = z.infer<typeof schema>

export default function AdminNewBlogPage() {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')

  const { data: categories } = useQuery({
    queryKey: ['blog-categories-admin'],
    queryFn: () => blogApi.categories().then((r) => r.data),
    staleTime: 5 * 60_000,
  })

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { status: 'draft' },
  })

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  function buildFormData(data: FormData): globalThis.FormData {
    const fd = new globalThis.FormData()
    Object.entries(data).forEach(([k, v]) => {
      if (v === undefined || v === null || v === '') return
      if (k === 'category_ids' && Array.isArray(v)) {
        v.forEach((id) => fd.append('category_ids[]', String(id)))
      } else {
        fd.append(k, String(v))
      }
    })
    if (imageFile) fd.append('image', imageFile)
    return fd
  }

  const mutation = useMutation({
    mutationFn: (data: FormData) => adminApi.createBlog(buildFormData(data)),
    onSuccess: () => { toast.success('Post created!'); router.push('/admin/blog') },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Failed'),
  })

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href="/admin/blog" className="btn-icon w-8 h-8 text-gray-500"><ArrowLeft className="w-4 h-4" /></Link>
        <h1 className="font-display text-2xl font-bold text-gray-900">New Blog Post</h1>
      </div>

      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-5">
        {/* Cover image */}
        <div className="card p-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">Cover Image</label>
          {imagePreview ? (
            <div className="relative rounded-xl overflow-hidden aspect-video bg-gray-100">
              <img src={imagePreview} alt="cover" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => { setImageFile(null); setImagePreview('') }}
                className="absolute top-2 right-2 w-7 h-7 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-full border-2 border-dashed border-gray-200 rounded-xl aspect-video flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-primary-300 hover:text-primary-400 transition-colors"
            >
              <Upload className="w-8 h-8" />
              <span className="text-sm">Click to upload cover image</span>
              <span className="text-xs">PNG, JPG — max 4MB</span>
            </button>
          )}
          {!imagePreview && (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="mt-2 text-xs text-primary-500 hover:underline"
            >
              {imagePreview ? 'Change image' : 'Select image'}
            </button>
          )}
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />
        </div>

        <div className="card p-6 space-y-4">
          <div>
            <label className="label">Title <span className="text-red-500">*</span></label>
            <input type="text" {...register('title')} className="input text-lg font-medium" placeholder="Post title…" autoFocus />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <label className="label">Excerpt <span className="text-gray-400 font-normal">(shown in listings)</span></label>
            <textarea {...register('description')} rows={2} className="input resize-none" placeholder="Brief summary of the post…" />
          </div>

          <div>
            <label className="label">Content</label>
            <textarea {...register('content')} rows={12} className="input resize-y font-mono text-sm" placeholder="Write your post content (HTML supported)…" />
          </div>

          <div>
            <label className="label">Categories</label>
            <select multiple {...register('category_ids')} className="input h-28 text-sm">
              {(categories as any[] ?? []).map((c: any) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Publish Settings</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Status</label>
              <select {...register('status')} className="input">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
            <div>
              <label className="label">Publish Date <span className="text-gray-400 font-normal">(optional)</span></label>
              <input type="datetime-local" {...register('published_at')} className="input text-sm" />
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" {...register('is_featured')} className="w-4 h-4 rounded text-primary-500" />
            <span className="text-sm text-gray-700">Mark as featured</span>
          </label>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={mutation.isPending} className="btn-primary disabled:opacity-60">
            {mutation.isPending ? 'Saving…' : 'Publish Post'}
          </button>
          <Link href="/admin/blog" className="btn border border-gray-200 text-gray-700 hover:bg-gray-50">Cancel</Link>
        </div>
      </form>
    </div>
  )
}
