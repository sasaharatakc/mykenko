'use client'

import { useState } from 'react'
import { vendorApi } from '@/lib/api'
import { Calculator } from 'lucide-react'
import toast from 'react-hot-toast'

export default function VendorStoreTaxPage() {
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    business_type: 'individual' as 'individual' | 'corporate',
    full_name: '', business_name: '', address: '',
    tax_status: 'exempt' as 'taxable' | 'exempt',
    invoice_number: '', withholding: false,
  })
  const set = (k: string, v: string | boolean) => setForm(f => ({ ...f, [k]: v }))

  const save = async () => {
    setSaving(true)
    try {
      await vendorApi.updateStore({ tax_settings: form })
      toast.success('税務設定を保存しました')
    } catch { toast.error('保存に失敗しました') }
    finally { setSaving(false) }
  }

  return (
    <div className="space-y-6 max-w-xl">
      <div className="flex items-center gap-3">
        <Calculator className="w-6 h-6 text-primary-500" />
        <h1 className="text-2xl font-bold text-gray-900">税務設定</h1>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">事業者区分</label>
          <div className="flex gap-6">
            {[['individual', '個人'], ['corporate', '法人']].map(([v, l]) => (
              <label key={v} className="flex items-center gap-2 cursor-pointer">
                <input type="radio" value={v} checked={form.business_type === v} onChange={e => set('business_type', e.target.value)} className="text-primary-500" />
                <span className="text-sm">{l}</span>
              </label>
            ))}
          </div>
        </div>

        {form.business_type === 'individual' ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">氏名</label>
            <input value={form.full_name} onChange={e => set('full_name', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">法人名</label>
            <input value={form.business_name} onChange={e => set('business_name', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">住所</label>
          <input value={form.address} onChange={e => set('address', e.target.value)} placeholder="〒000-0000 東京都..." className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
        </div>

        <div className="pt-4 border-t border-gray-100">
          <label className="block text-sm font-medium text-gray-700 mb-2">消費税課税区分</label>
          <div className="space-y-2">
            {[['taxable', '課税事業者（インボイス発行可能）'], ['exempt', '免税事業者']].map(([v, l]) => (
              <label key={v} className="flex items-start gap-3 cursor-pointer p-3 rounded-lg border-2 has-[:checked]:border-primary-500 has-[:checked]:bg-primary-50 border-gray-200">
                <input type="radio" value={v} checked={form.tax_status === v} onChange={e => set('tax_status', e.target.value)} className="text-primary-500 mt-0.5" />
                <span className="text-sm">{l}</span>
              </label>
            ))}
          </div>
        </div>

        {form.tax_status === 'taxable' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">インボイス登録番号</label>
            <div className="flex items-center gap-2">
              <span className="text-sm font-mono text-gray-500 bg-gray-100 px-2 py-2 rounded-lg">T</span>
              <input value={form.invoice_number} onChange={e => set('invoice_number', e.target.value.replace(/\D/g, '').slice(0, 13))}
                placeholder="0000000000000" maxLength={13}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <p className="text-xs text-gray-400 mt-1">13桁の数字を入力してください</p>
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div>
            <p className="text-sm font-medium text-gray-900">源泉徴収</p>
            <p className="text-xs text-gray-400">報酬に対する源泉徴収の対象設定</p>
          </div>
          <button onClick={() => set('withholding', !form.withholding)}
            className={`w-11 h-6 rounded-full transition-colors ${form.withholding ? 'bg-primary-500' : 'bg-gray-200'}`}>
            <span className={`block w-5 h-5 bg-white rounded-full shadow transition-transform mx-0.5 ${form.withholding ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
        </div>

        <button onClick={save} disabled={saving}
          className="w-full py-2.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50">
          {saving ? '保存中...' : '設定を保存'}
        </button>
      </div>
    </div>
  )
}
