'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi, categoryApi, attributeSetApi } from '@/lib/api'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { ImageUpload } from '@/components/ui/ImageUpload'

const schema = z.object({
  name:         z.string().min(2, '商品名は2文字以上'),
  description:  z.string().optional(),
  content:      z.string().optional(),
  price:        z.coerce.number().min(0),
  sale_price:   z.coerce.number().min(0).optional().or(z.literal('')),
  sku:          z.string().optional(),
  quantity:     z.coerce.number().int().min(0),
  status:       z.enum(['published', 'draft', 'pending']),
  store_id:     z.coerce.number().optional().or(z.literal('')),
  brand_id:     z.coerce.number().optional().or(z.literal('')),
  is_featured:            z.boolean().optional(),
  category_ids:           z.array(z.coerce.number()).optional(),
  attribute_set_ids:      z.array(z.coerce.number()).optional(),
  specification_table_id: z.coerce.number().optional().or(z.literal('')),
  weight:                 z.coerce.number().min(0).optional().or(z.literal('')),
})
type FormData = z.infer<typeof schema>

export default function AdminEditProductPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const queryClient = useQueryClient()

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imageUrl, setImageUrl]   = useState<string>('')

  const { data: categories } = useQuery({
    queryKey: ['categories-flat'],
    queryFn:  () => categoryApi.list().then(r => r.data?.data ?? []),
    staleTime: 5 * 60_000,
  })
  const { data: brandsData } = useQuery({
    queryKey: ['admin-brands-list'],
    queryFn:  () => adminApi.adminBrands({ per_page: 100 }).then(r => r.data),
  })
  const { data: storesData } = useQuery({
    queryKey: ['admin-stores-list'],
    queryFn:  () => adminApi.stores({ per_page: 100 }).then(r => r.data),
  })
  const { data: attrSets } = useQuery({
    queryKey: ['attribute-sets'],
    queryFn:  () => attributeSetApi.list({ per_page: 50 }).then(r => r.data?.data ?? []),
    staleTime: 5 * 60_000,
  })
  const { data: specTablesData } = useQuery({
    queryKey: ['admin-spec-tables-list'],
    queryFn:  () => adminApi.specTables({ per_page: 100 }).then(r => r.data),
    staleTime: 5 * 60_000,
  })

  const { data: productData, isLoading } = useQuery({
    queryKey: ['admin-product', id],
    queryFn:  () => adminApi.showProduct(Number(id)).then(r => r.data?.data),
  })

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (productData) {
      reset({
        name:              productData.name,
        description:       productData.description ?? '',
        content:           productData.content ?? '',
        price:             productData.price,
        sale_price:        productData.sale_price ?? '',
        sku:               productData.sku ?? '',
        quantity:          productData.quantity,
        status:            productData.status,
        store_id:          productData.store_id ?? '',
        brand_id:          productData.brand_id ?? '',
        is_featured:       productData.is_featured ?? false,
        category_ids:      productData.categories?.map((c: any) => c.id) ?? [],
        attribute_set_ids:      productData.attribute_sets?.map((s: any) => s.id) ?? [],
        specification_table_id: productData.specification_table_id ?? '',
        weight:                 productData.weight ?? '',
      })
      if (productData.image) setImageUrl(productData.image)
    }
  }, [productData, reset])

  const mutation = useMutation({
    mutationFn: (data: FormData) => {
      const fd = new FormData()
      fd.append('_method', 'PUT')
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
      // Handle attribute_set_ids array (already handled in Object.entries loop above via attribute_set_ids[])
      return adminApi.updateProduct(Number(id), fd)
    },
    onSuccess: () => {
      toast.success('商品を更新しました')
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
      queryClient.invalidateQueries({ queryKey: ['admin-product', id] })
      router.push('/admin/products')
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? '更新に失敗しました'),
  })

  if (isLoading) {
    return (
      <div className="space-y-5 max-w-3xl animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-48" />
        <div className="h-64 bg-gray-200 rounded-xl" />
        <div className="h-48 bg-gray-200 rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link href="/admin/products" className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">商品を編集</h1>
      </div>

      <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-5">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left: content */}
          <div className="lg:col-span-2 space-y-5">
            {/* Basic Info */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <h2 className="font-semibold text-gray-900">基本情報</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">商品名 <span className="text-red-500">*</span></label>
                <input {...register('name')} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">説明文</label>
                <textarea {...register('description')} rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">詳細コンテンツ</label>
                <textarea {...register('content')} rows={6} placeholder="商品の詳細説明（HTML可）" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none font-mono" />
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <h2 className="font-semibold text-gray-900">価格・在庫</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">価格 <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">¥</span>
                    <input type="number" step="1" {...register('price')} className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  </div>
                  {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">セール価格</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">¥</span>
                    <input type="number" step="1" {...register('sale_price')} className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">在庫数</label>
                  <input type="number" {...register('quantity')} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                  <input {...register('sku')} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="ABC-001" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">重量 (kg)</label>
                <input type="number" step="0.01" {...register('weight')} className="w-40 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
            </div>
          </div>

          {/* Right: sidebar */}
          <div className="space-y-5">
            {/* Image */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="font-semibold text-gray-900 mb-3">商品画像</h2>
              <ImageUpload
                value={imageUrl || undefined}
                onChange={(file, url) => { setImageFile(file); setImageUrl(url ?? '') }}
              />
            </div>

            {/* Organization */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
              <h2 className="font-semibold text-gray-900">分類</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">カテゴリ</label>
                <select multiple {...register('category_ids')} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm h-28 focus:outline-none focus:ring-2 focus:ring-primary/20">
                  {(categories as any[] ?? []).map((c: any) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-400 mt-1">Ctrl/Cmd で複数選択</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">アトリビュートセット</label>
                <select multiple {...register('attribute_set_ids')} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm h-24 focus:outline-none focus:ring-2 focus:ring-primary/20">
                  {(attrSets as any[] ?? []).map((s: any) => (
                    <option key={s.id} value={s.id}>{s.title}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-400 mt-1">バリエーション用（サイズ・カラー等）</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">スペックテーブル</label>
                <select {...register('specification_table_id')} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                  <option value="">なし</option>
                  {(specTablesData?.data ?? []).map((t: any) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ブランド</label>
                <select {...register('brand_id')} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                  <option value="">なし</option>
                  {(brandsData?.data ?? []).map((b: any) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">店舗</label>
                <select {...register('store_id')} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                  <option value="">プラットフォーム</option>
                  {(storesData?.data ?? []).map((s: any) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Status */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
              <h2 className="font-semibold text-gray-900">公開設定</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ステータス</label>
                <select {...register('status')} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                  <option value="draft">下書き</option>
                  <option value="published">公開</option>
                  <option value="pending">審査待ち</option>
                </select>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" {...register('is_featured')} className="w-4 h-4 accent-primary" />
                <span className="text-sm text-gray-700">おすすめ商品としてマーク</span>
              </label>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="px-5 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary-600 disabled:opacity-60"
          >
            {mutation.isPending ? '保存中...' : '変更を保存'}
          </button>
          <Link href="/admin/products" className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
            キャンセル
          </Link>
        </div>
      </form>
    </div>
  )
}
