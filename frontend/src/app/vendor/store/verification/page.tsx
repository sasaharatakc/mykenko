'use client'

import { useState } from 'react'
import { ShieldCheck, Upload, CheckCircle, Clock, X, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

type UploadState = { file: File | null; preview: string | null; status: 'none' | 'uploading' | 'done' }

function DocUpload({ label, hint, state, onChange }: { label: string; hint: string; state: UploadState; onChange: (f: File) => void }) {
  return (
    <div className="border-2 border-dashed border-gray-200 rounded-xl p-5 hover:border-primary-300 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <p className="font-medium text-sm text-gray-900 mb-0.5">{label}</p>
          <p className="text-xs text-gray-400">{hint}</p>
        </div>
        {state.status === 'done' && <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />}
      </div>
      {state.preview ? (
        <div className="mt-3 relative">
          <img src={state.preview} alt="" className="w-full h-32 object-cover rounded-lg" />
          <p className="text-xs text-green-600 mt-1 flex items-center gap-1"><CheckCircle className="w-3 h-3" />{state.file?.name}</p>
        </div>
      ) : (
        <label className="mt-3 flex flex-col items-center gap-2 cursor-pointer p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
          <Upload className="w-6 h-6 text-gray-400" />
          <span className="text-xs text-gray-500">クリックしてアップロード（JPG/PNG/PDF）</span>
          <input type="file" accept="image/*,.pdf" className="hidden" onChange={e => { if (e.target.files?.[0]) onChange(e.target.files[0]) }} />
        </label>
      )}
    </div>
  )
}

export default function VendorVerificationPage() {
  const [verificationStatus] = useState<'unverified' | 'pending' | 'verified'>('unverified')
  const [idDoc, setIdDoc] = useState<UploadState>({ file: null, preview: null, status: 'none' })
  const [addressDoc, setAddressDoc] = useState<UploadState>({ file: null, preview: null, status: 'none' })
  const [businessDoc, setBusinessDoc] = useState<UploadState>({ file: null, preview: null, status: 'none' })
  const [businessType, setBusinessType] = useState<'individual' | 'corporate'>('individual')
  const [submitting, setSubmitting] = useState(false)

  const handleFile = (setter: React.Dispatch<React.SetStateAction<UploadState>>) => (file: File) => {
    const reader = new FileReader()
    reader.onload = e => setter({ file, preview: e.target?.result as string, status: 'done' })
    if (file.type.startsWith('image/')) reader.readAsDataURL(file)
    else setter({ file, preview: null, status: 'done' })
  }

  const submit = async () => {
    if (!idDoc.file || !addressDoc.file) { toast.error('必須書類をアップロードしてください'); return }
    setSubmitting(true)
    await new Promise(r => setTimeout(r, 1500))
    toast.success('書類を提出しました。審査まで2-3営業日お待ちください。')
    setSubmitting(false)
  }

  const STATUS = {
    unverified: { icon: AlertCircle, label: '未確認', color: 'text-gray-500 bg-gray-100' },
    pending:    { icon: Clock,         label: '審査中',   color: 'text-yellow-700 bg-yellow-100' },
    verified:   { icon: CheckCircle,   label: '確認済み', color: 'text-green-700 bg-green-100' },
  }
  const s = STATUS[verificationStatus]

  return (
    <div className="space-y-6 max-w-xl">
      <div className="flex items-center gap-3">
        <ShieldCheck className="w-6 h-6 text-primary-500" />
        <h1 className="text-2xl font-bold text-gray-900">本人確認・ストア認証</h1>
      </div>

      {/* Status */}
      <div className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium text-sm ${s.color}`}>
        <s.icon className="w-5 h-5" />
        認証ステータス: {s.label}
      </div>

      {verificationStatus !== 'verified' && (
        <>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
            本人確認を完了するとストアの信頼性が向上し、より多くのお客様に購入していただけます。確認には通常2〜3営業日かかります。
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
            <h2 className="font-semibold text-gray-900">事業者区分</h2>
            <div className="flex gap-6">
              {[['individual', '個人'], ['corporate', '法人']].map(([v, l]) => (
                <label key={v} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" value={v} checked={businessType === v} onChange={e => setBusinessType(e.target.value as any)} className="text-primary-500" />
                  <span className="text-sm font-medium">{l}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <h2 className="font-semibold text-gray-900">必要書類</h2>
            <DocUpload
              label="身分証明書 *"
              hint="運転免許証、パスポート、マイナンバーカードのいずれか"
              state={idDoc}
              onChange={handleFile(setIdDoc)}
            />
            <DocUpload
              label="住所証明書 *"
              hint="公共料金の明細書、銀行の通帳 (3ヶ月以内のもの)"
              state={addressDoc}
              onChange={handleFile(setAddressDoc)}
            />
            {businessType === 'corporate' && (
              <DocUpload
                label="事業者証明書"
                hint="法人の場合: 登記簿謄本 (3ヶ月以内のもの)"
                state={businessDoc}
                onChange={handleFile(setBusinessDoc)}
              />
            )}
          </div>

          <button
            onClick={submit}
            disabled={submitting || !idDoc.file || !addressDoc.file}
            className="w-full py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors">
            {submitting ? '提出中...' : '書類を提出する'}
          </button>
        </>
      )}
    </div>
  )
}
