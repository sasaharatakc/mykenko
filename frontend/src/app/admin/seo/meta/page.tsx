'use client'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { adminApi } from '@/lib/api'
import { Save, Image as ImageIcon } from 'lucide-react'
import toast from 'react-hot-toast'

interface MetaForm {
  defaultTitle: string
  titleTemplate: string
  defaultDescription: string
  twitterCardType: 'summary' | 'summary_large_image'
  noindexPages: string
}

export default function AdminSeoMetaPage() {
  const [form, setForm] = useState<MetaForm>({
    defaultTitle: 'MYKENKO（マイケンコー）',
    titleTemplate: '%s | MYKENKO',
    defaultDescription: '日本初の医療個人輸入マーケットプレイス。安心・安全な医療品をお届けします。',
    twitterCardType: 'summary_large_image',
    noindexPages: '/admin/\n/api/\n/checkout/\n/account/',
  })

  const mutation = useMutation({
    mutationFn: () => adminApi.updateSettings({ seo_meta: form }),
    onSuccess: () => toast.success('メタタグ設定を保存しました'),
    onError: () => toast.error('保存に失敗しました'),
  })

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">グローバルメタタグ設定</h1>
        <button
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 disabled:opacity-60 text-sm"
        >
          <Save className="w-4 h-4" />
          {mutation.isPending ? '保存中...' : '設定を保存'}
        </button>
      </div>

      <div className="space-y-4">
        {/* Title settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">タイトル設定</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">デフォルトタイトル</label>
              <input type="text" value={form.defaultTitle}
                onChange={(e) => setForm({ ...form, defaultTitle: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
              <p className="text-xs text-gray-400 mt-1">タイトルが設定されていないページで使用されます</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">タイトルテンプレート</label>
              <input type="text" value={form.titleTemplate}
                onChange={(e) => setForm({ ...form, titleTemplate: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
              <p className="text-xs text-gray-400 mt-1">%s がページタイトルに置き換えられます。例: %s | MYKENKO</p>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">デフォルトディスクリプション</h2>
          <textarea value={form.defaultDescription}
            onChange={(e) => setForm({ ...form, defaultDescription: e.target.value })}
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none" />
          <div className="flex justify-between items-center mt-1">
            <p className="text-xs text-gray-400">推奨: 120〜160文字</p>
            <span className={`text-xs font-mono ${form.defaultDescription.length > 160 ? 'text-red-500' : 'text-gray-400'}`}>
              {form.defaultDescription.length}/160
            </span>
          </div>
        </div>

        {/* OGP image */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">OGP画像</h2>
          <div className="flex items-center gap-4">
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-gray-400 cursor-pointer flex-1">
              <ImageIcon className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">画像をアップロード</p>
              <p className="text-xs text-gray-400 mt-1">推奨: 1200×630px</p>
            </div>
          </div>
        </div>

        {/* Twitter card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Twitter Cardタイプ</h2>
          <div className="flex gap-4">
            {[
              { value: 'summary' as const, label: 'Summary', desc: '小サムネイル' },
              { value: 'summary_large_image' as const, label: 'Summary Large Image', desc: '大サムネイル（推奨）' },
            ].map((opt) => (
              <label key={opt.value} className={`flex-1 border-2 rounded-xl p-4 cursor-pointer transition-colors ${
                form.twitterCardType === opt.value ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'
              }`}>
                <input type="radio" name="twitterCardType" value={opt.value}
                  checked={form.twitterCardType === opt.value}
                  onChange={() => setForm({ ...form, twitterCardType: opt.value })}
                  className="sr-only" />
                <p className="font-medium text-sm text-gray-900">{opt.label}</p>
                <p className="text-xs text-gray-500 mt-1">{opt.desc}</p>
              </label>
            ))}
          </div>
        </div>

        {/* Noindex pages */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-2">Noindexページリスト</h2>
          <p className="text-sm text-gray-500 mb-3">検索エンジンにインデックスさせたくないパスを1行ずつ入力してください</p>
          <textarea value={form.noindexPages}
            onChange={(e) => setForm({ ...form, noindexPages: e.target.value })}
            rows={5}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none" />
        </div>
      </div>
    </div>
  )
}
