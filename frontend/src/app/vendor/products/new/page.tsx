'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation } from '@tanstack/react-query'
import { vendorApi, categoryApi, attributeSetApi } from '@/lib/api'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { ImageUpload } from '@/components/ui/ImageUpload'

const schema = z.object({
  name:         z.string().min(2, '商品名は2文字以上'),
  description:  z.string().optional(),
  price:        z.coerce.number().min(0, '価格を入力してください'),
  sale_price:   z.coerce.number().min(0).optional().or(z.literal('')),
  sku:          z.string().optional(),
  quantity:     z.coerce.number().int().min(0),
  status:            z.enum(['published', 'draft']),
  weight:            z.coerce.number().min(0).optional().or(z.literal('')),
  category_ids:      z.array(z.coerce.number()).optional(),
  attribute_set_ids: z.array(z.coerce.number()).optional(),
})
type FormData = z.infer<typeof schema>

export default function VendorNewProductPage() {
  const router = useRouter()
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imageUrl, setImageUrl]   = useState<string>('')

  const { data: categories } = useQuery({
    queryKey: ['categories-flat'],
    queryFn:  () => categoryApi.list().then(r => r.data?.data ?? []),
    staleTime: 5 * 60_000,
  })
  const { data: attrSets } = useQuery({
    queryKey: ['attribute-sets'],
    queryFn:  () => attributeSetApi.list({ per_page: 50 }).then(r => r.data?.data ?? []),
    staleTime: 5 * 60_000,
  })

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { status: 'draft', quantity: 0, price: 0 },
  })

  const mutation = useMutation({
    mutationFn: (data: FormData) => {
      const fd = new FormData()
      Object.entries(data).forEach(([k, v]) => {
        if (v === '' || v === undefined || v === null) return
        if ((k === 'category_ids' || k === 'attribute_set_ids') && Array.isArray(v)) {
          v.forEach(id => fd.append(`${k}[]`, String(id)))
        } else {
          fd.append(k, String(v))
        }
      })
      if (imageFile) fd.append('image', imageFile)
      else if (imageUrl) fd.append('image_url', imageUrl)
      return vendorApi.createProduct(fd)
    },
    onSuccess: () => { toast.success('商品を作成しました'); router.push('/vendor/products') },
    onError:   (e: any) => toast.error(e?.response?.data?.message ?? '作成に失敗しました'),
  })

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link href="/vendor/products" className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">商品を追加</h1>
      </div>

      <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-5">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left */}
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <h2 className="font-semibold text-gray-900">基本情報</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">商品名 <span className="text-red-500">*</span></label>
                <input {...register('name')} placeholder="例: プレミアム ワイヤレスヘッドフォン" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">説明文</label>
                <textarea {...register('description')} rows={4} placeholder="商品の説明を入力…" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">カテゴリ</label>
                <select multiple {...register('category_ids')} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm h-28 focus:outline-none focus:ring-2 focus:ring-primary/20">
                  {(categories as any[])?.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-400 mt-1">Ctrl/Cmd で複数選択</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">アトリビュートセット</label>
                <select multiple {...register('attribute_set_ids')} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm h-20 focus:outline-none focus:ring-2 focus:ring-primary/20">
                  {(attrSets as any[])?.map((s: any) => (
                    <option key={s.id} value={s.id}>{s.title}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-400 mt-1">バリエーション用（サイズ・カラー等）</p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <h2 className="font-semibold text-gray-900">価格・在庫</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">価格 <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">¥</span>
                    <input type="number" step="1" {...register('price')} className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="0" />
                  </div>
                  {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">セール価格</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">¥</span>
                    <input type="number" step="1" {...register('sale_price')} className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="0" />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">在庫数 <span className="text-red-500">*</span></label>
                  <input type="number" {...register('quantity')} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                  <input {...register('sku')} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="ABC-001" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">重量 (kg)</label>
                <input type="number" step="0.01" {...register('weight')} className="w-32 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="0.00" />
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="space-y-5">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <ImageUpload
                value={imageUrl || undefined}
                onChange={(file, url) => { setImageFile(file); setImageUrl(url ?? '') }}
              />
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="font-semibold text-gray-900 mb-3">公開設定</h2>
              <div className="flex gap-4">
                {(['draft', 'published'] as const).map(s => (
                  <label key={s} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" {...register('status')} value={s} className="w-4 h-4 accent-primary" />
                    <span className="text-sm text-gray-700">{s === 'draft' ? '下書き' : '公開'}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={mutation.isPending}
            className="px-5 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary-600 disabled:opacity-60">
            {mutation.isPending ? '作成中...' : '商品を作成'}
          </button>
          <Link href="/vendor/products" className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
            キャンセル
          </Link>
        </div>
      </form>
    </div>
  )
}
