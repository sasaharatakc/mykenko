'use client'

import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { vendorApi } from '@/lib/api'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { Store, Globe, Phone, Mail, MapPin, Save, ExternalLink } from 'lucide-react'

const schema = z.object({
  name:        z.string().min(1, '店舗名は必須です'),
  description: z.string().optional(),
  phone:       z.string().optional(),
  email:       z.string().email('有効なメールを入力').optional().or(z.literal('')),
  address:     z.string().optional(),
  city:        z.string().optional(),
  state:       z.string().optional(),
  country:     z.string().optional(),
})
type FormData = z.infer<typeof schema>

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}

export default function VendorStorePage() {
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['vendor', 'store'],
    queryFn: () => vendorApi.store().then(r => r.data.data),
  })

  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', description: '', phone: '', email: '', address: '', city: '', state: '', country: '' },
  })

  useEffect(() => {
    if (data) {
      reset({
        name:        data.name ?? '',
        description: data.description ?? '',
        phone:       data.phone ?? '',
        email:       data.email ?? '',
        address:     data.address ?? '',
        city:        data.city ?? '',
        state:       data.state ?? '',
        country:     data.country ?? '',
      })
    }
  }, [data, reset])

  const updateMutation = useMutation({
    mutationFn: (d: FormData) => vendorApi.updateStore(d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vendor', 'store'] })
      toast.success('店舗情報を更新しました')
    },
    onError: () => toast.error('更新に失敗しました'),
  })

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Store className="w-5 h-5" /> 店舗設定
        </h1>
        {data?.slug && (
          <a
            href={`/stores/${data.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm text-primary hover:underline"
          >
            ストアを見る <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>

      {/* Store Status Banner */}
      {data && (
        <div className={`rounded-xl p-4 flex items-center gap-3 ${data.is_verified ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'}`}>
          <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${data.is_verified ? 'bg-green-500' : 'bg-amber-400'}`} />
          <div>
            <p className={`text-sm font-medium ${data.is_verified ? 'text-green-800' : 'text-amber-800'}`}>
              {data.is_verified ? '認証済み店舗' : '審査中 — 管理者によって確認後、公開されます'}
            </p>
            {data.status && (
              <p className="text-xs text-gray-500 mt-0.5">ステータス: {data.status}</p>
            )}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(d => updateMutation.mutate(d))} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Store className="w-4 h-4 text-gray-400" /> 基本情報
          </h2>
          <div className="space-y-4">
            <Field label="店舗名 *" error={errors.name?.message}>
              <input
                {...register('name')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </Field>
            <Field label="店舗説明" error={errors.description?.message}>
              <textarea
                {...register('description')}
                rows={4}
                placeholder="店舗の紹介文を入力してください"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              />
            </Field>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Mail className="w-4 h-4 text-gray-400" /> 連絡先情報
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="メールアドレス" error={errors.email?.message}>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  {...register('email')}
                  type="email"
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </Field>
            <Field label="電話番号" error={errors.phone?.message}>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  {...register('phone')}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </Field>
          </div>
        </div>

        {/* Address */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-400" /> 住所
          </h2>
          <div className="space-y-4">
            <Field label="住所" error={errors.address?.message}>
              <input
                {...register('address')}
                placeholder="番地・建物名"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </Field>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field label="市区町村" error={errors.city?.message}>
                <input
                  {...register('city')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </Field>
              <Field label="都道府県" error={errors.state?.message}>
                <input
                  {...register('state')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </Field>
              <Field label="国" error={errors.country?.message}>
                <input
                  {...register('country')}
                  placeholder="Japan"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </Field>
            </div>
          </div>
        </div>

        {/* Stats (read-only) */}
        {data && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="font-semibold text-gray-800 mb-4">統計情報</h2>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-gray-900">{data.products_count ?? 0}</p>
                <p className="text-sm text-gray-500">商品数</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{data.total_sales ?? 0}</p>
                <p className="text-sm text-gray-500">総売上</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{Number(data.rating ?? 0).toFixed(1)}</p>
                <p className="text-sm text-gray-500">評価 ({data.rating_count ?? 0}件)</p>
              </div>
            </div>
          </div>
        )}

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!isDirty || updateMutation.isPending}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary-600 disabled:opacity-50 transition-colors"
          >
            <Save className="w-4 h-4" />
            {updateMutation.isPending ? '保存中...' : '変更を保存'}
          </button>
        </div>
      </form>
    </div>
  )
}
