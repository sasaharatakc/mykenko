'use client'

import { useState } from 'react'
import { vendorApi } from '@/lib/api'
import { Settings, Banknote } from 'lucide-react'
import toast from 'react-hot-toast'

const BANKS = ['三菱UFJ銀行', '三井住友銀行', 'みずほ銀行', 'りそな銀行', 'ゆうちょ銀行', '楽天銀行', 'PayPay銀行', 'GMOあおぞらネット銀行', 'その他']

export default function VendorFinanceSettingsPage() {
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    bank_name: '', branch_name: '', account_type: '普通', account_number: '', account_holder: '',
  })

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const save = async () => {
    setSaving(true)
    try {
      await vendorApi.updateStore({ payout_settings: form })
      toast.success('支払い設定を保存しました')
    } catch {
      toast.error('保存に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 max-w-xl">
      <div className="flex items-center gap-3">
        <Settings className="w-6 h-6 text-primary-500" />
        <h1 className="text-2xl font-bold text-gray-900">支払い設定</h1>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
        <p className="font-semibold mb-1">⚠️ 重要</p>
        <p>登録した口座情報は出金申請時に使用されます。正確な情報をご入力ください。</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <div className="flex items-center gap-2 pb-4 border-b border-gray-100">
          <Banknote className="w-5 h-5 text-gray-400" />
          <h2 className="font-semibold text-gray-900">銀行口座情報</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">銀行名 <span className="text-red-500">*</span></label>
            <select value={form.bank_name} onChange={e => set('bank_name', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option value="">選択してください</option>
              {BANKS.map(b => <option key={b}>{b}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">支店名 <span className="text-red-500">*</span></label>
            <input value={form.branch_name} onChange={e => set('branch_name', e.target.value)}
              placeholder="例: 新宿支店" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">口座種別 <span className="text-red-500">*</span></label>
            <div className="flex gap-4">
              {['普通', '当座'].map(t => (
                <label key={t} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="account_type" value={t} checked={form.account_type === t} onChange={e => set('account_type', e.target.value)} className="text-primary-500" />
                  <span className="text-sm">{t}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">口座番号 <span className="text-red-500">*</span></label>
            <input value={form.account_number} onChange={e => set('account_number', e.target.value)}
              placeholder="例: 1234567" maxLength={8}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">口座名義（カタカナ） <span className="text-red-500">*</span></label>
            <input value={form.account_holder} onChange={e => set('account_holder', e.target.value)}
              placeholder="例: ヤマダ タロウ"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            <p className="text-xs text-gray-400 mt-1">カタカナでご入力ください</p>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100">
          <button onClick={save} disabled={saving}
            className="w-full py-2.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors">
            {saving ? '保存中...' : '設定を保存'}
          </button>
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 text-sm text-gray-600">
        <p className="font-medium mb-1">最低出金額について</p>
        <p>出金申請には最低 ¥5,000 以上の残高が必要です。出金は毎月15日・末日に処理されます。</p>
      </div>
    </div>
  )
}
