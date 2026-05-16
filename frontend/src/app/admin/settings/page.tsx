'use client'

import { useEffect } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { adminApi } from '@/lib/api'
import { useForm, Controller } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Save } from 'lucide-react'

interface SettingsForm {
  site_name: string
  site_tagline: string
  site_email: string
  site_phone: string
  site_address: string
  currency: string
  currency_symbol: string
  default_commission: string
  min_withdrawal: string
  tax_rate: string
  maintenance_mode: string   // '1' | '0'
  registration_enabled: string
  vendor_registration_enabled: string
  facebook_url: string
  twitter_url: string
  instagram_url: string
  youtube_url: string
}

const TOGGLE_FIELDS: [keyof SettingsForm, string][] = [
  ['maintenance_mode',              'メンテナンスモード'],
  ['registration_enabled',          '顧客登録'],
  ['vendor_registration_enabled',   'ベンダー登録'],
]

export default function AdminSettingsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'settings'],
    queryFn: () => adminApi.settings(),
  })

  const { register, handleSubmit, reset, control } = useForm<SettingsForm>({
    defaultValues: {
      maintenance_mode: '0',
      registration_enabled: '1',
      vendor_registration_enabled: '1',
    },
  })

  useEffect(() => {
    if (data?.data?.data) reset(data.data.data)
  }, [data, reset])

  const mutation = useMutation({
    mutationFn: (d: SettingsForm) => adminApi.updateSettings(d),
    onSuccess: () => toast.success('設定を保存しました'),
    onError: () => toast.error('保存に失敗しました'),
  })

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">サイト設定</h1>
        <button
          form="settings-form"
          type="submit"
          disabled={mutation.isPending}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 disabled:opacity-60"
        >
          <Save className="w-4 h-4" />
          {mutation.isPending ? '保存中...' : '設定を保存'}
        </button>
      </div>

      <form id="settings-form" onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-6">
        {/* General */}
        <Section title="一般">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="サイト名" name="site_name" register={register} />
            <Field label="タグライン" name="site_tagline" register={register} />
            <Field label="連絡先メール" name="site_email" register={register} type="email" />
            <Field label="電話番号" name="site_phone" register={register} />
            <div className="md:col-span-2">
              <Field label="住所" name="site_address" register={register} />
            </div>
          </div>
        </Section>

        {/* Commerce */}
        <Section title="コマース設定">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="通貨コード" name="currency" register={register} placeholder="JPY" />
            <Field label="通貨記号" name="currency_symbol" register={register} placeholder="¥" />
            <Field label="デフォルト手数料率 (%)" name="default_commission" register={register} type="number" />
            <Field label="最低出金額 (¥)" name="min_withdrawal" register={register} type="number" />
            <Field label="消費税率 (%)" name="tax_rate" register={register} type="number" />
          </div>
        </Section>

        {/* Access */}
        <Section title="アクセス制御">
          <div className="space-y-4">
            {TOGGLE_FIELDS.map(([key, label]) => (
              <Controller
                key={key}
                name={key}
                control={control}
                render={({ field }) => (
                  <label className="flex items-center justify-between cursor-pointer p-3 rounded-lg border border-gray-200 hover:bg-gray-50">
                    <span className="text-sm font-medium text-gray-700">{label}</span>
                    <div className="relative">
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={field.value === '1'}
                        onChange={(e) => field.onChange(e.target.checked ? '1' : '0')}
                      />
                      <div className={`w-11 h-6 rounded-full transition-colors ${field.value === '1' ? 'bg-primary' : 'bg-gray-200'}`} />
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${field.value === '1' ? 'translate-x-6' : 'translate-x-1'}`} />
                    </div>
                  </label>
                )}
              />
            ))}
          </div>
        </Section>

        {/* Social */}
        <Section title="SNS リンク">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Facebook URL" name="facebook_url" register={register} />
            <Field label="Twitter/X URL" name="twitter_url" register={register} />
            <Field label="Instagram URL" name="instagram_url" register={register} />
            <Field label="YouTube URL" name="youtube_url" register={register} />
          </div>
        </Section>
      </form>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-base font-semibold text-gray-900 mb-4">{title}</h2>
      {children}
    </div>
  )
}

function Field({ label, name, register, type = 'text', placeholder }: {
  label: string
  name: string
  register: any
  type?: string
  placeholder?: string
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        {...register(name)}
        type={type}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
      />
    </div>
  )
}
