'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { vendorApi } from '@/lib/api'
import { formatDate } from '@/lib/utils'
import { Percent, Plus, Trash2, X, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'

function randomCode() {
  return Math.random().toString(36).substring(2, 10).toUpperCase()
}

const EMPTY_FORM = { code: '', type: 'percentage' as 'percentage' | 'fixed', value: '', min_order: '', limit: '', expires_at: '' }

export default function VendorCouponsPage() {
  const qc = useQueryClient()
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const { data, isLoading } = useQuery({
    queryKey: ['vendor-coupons'],
    queryFn: () => vendorApi.coupons().then(r => (r.data as any)?.data ?? []).catch(() => []),
  })

  const createMutation = useMutation({
    mutationFn: (d: object) => vendorApi.createCoupon(d),
    onSuccess: () => { toast.success('クーポンを作成しました'); qc.invalidateQueries({ queryKey: ['vendor-coupons'] }); setShowModal(false); setForm(EMPTY_FORM) },
    onError: () => toast.error('作成に失敗しました'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => vendorApi.deleteCoupon(id),
    onSuccess: () => { toast.success('削除しました'); qc.invalidateQueries({ queryKey: ['vendor-coupons'] }) },
    onError: () => toast.error('削除に失敗しました'),
  })

  const coupons: any[] = data ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">クーポン管理</h1>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">
          <Plus className="w-4 h-4" /> クーポン作成
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />)}</div>
        ) : coupons.length === 0 ? (
          <div className="p-16 text-center">
            <Percent className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 text-sm mb-4">クーポンはまだ作成されていません</p>
            <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700">最初のクーポンを作成</button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['コード', '割引タイプ', '割引内容', '利用回数', '有効期限', 'ステータス', '操作'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {coupons.map((c: any) => {
                const expired = c.expires_at && new Date(c.expires_at) < new Date()
                return (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono font-medium text-gray-900">{c.code}</td>
                    <td className="px-4 py-3 text-gray-600">{c.type === 'percentage' ? '割合' : '固定額'}</td>
                    <td className="px-4 py-3 font-medium text-primary-600">
                      {c.type === 'percentage' ? `${c.value}%OFF` : `¥${Number(c.value).toLocaleString()}OFF`}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{c.used_count ?? 0}{c.limit ? ` / ${c.limit}` : ''}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{c.expires_at ? formatDate(c.expires_at) : '期限なし'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${expired ? 'bg-gray-100 text-gray-500' : 'bg-green-100 text-green-700'}`}>
                        {expired ? '期限切れ' : '有効'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => { if (confirm('削除しますか？')) deleteMutation.mutate(c.id) }}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">クーポン作成</h2>
              <button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">クーポンコード</label>
                <div className="flex gap-2">
                  <input value={form.code} onChange={e => set('code', e.target.value.toUpperCase())} placeholder="SALE10" className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 uppercase" />
                  <button onClick={() => set('code', randomCode())} className="px-3 py-2 border border-gray-300 rounded-lg text-gray-500 hover:bg-gray-50 text-xs flex items-center gap-1"><RefreshCw className="w-3 h-3" />生成</button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">割引タイプ</label>
                <div className="flex gap-4">
                  {[['percentage', '割合（%）'], ['fixed', '固定額（¥）']].map(([v, l]) => (
                    <label key={v} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" value={v} checked={form.type === v} onChange={e => set('type', e.target.value)} className="text-primary-500" />
                      <span className="text-sm">{l}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">割引{form.type === 'percentage' ? '率（%）' : '額（¥）'}</label>
                <input type="number" value={form.value} onChange={e => set('value', e.target.value)} placeholder={form.type === 'percentage' ? '10' : '500'} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">最低注文額（¥）</label>
                <input type="number" value={form.min_order} onChange={e => set('min_order', e.target.value)} placeholder="1000" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">有効期限</label>
                <input type="date" value={form.expires_at} onChange={e => set('expires_at', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">キャンセル</button>
              <button
                disabled={!form.code || !form.value || createMutation.isPending}
                onClick={() => createMutation.mutate({ code: form.code, type: form.type, value: Number(form.value), min_order_amount: form.min_order ? Number(form.min_order) : undefined, expires_at: form.expires_at || undefined })}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 disabled:opacity-50">
                {createMutation.isPending ? '作成中...' : '作成する'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
