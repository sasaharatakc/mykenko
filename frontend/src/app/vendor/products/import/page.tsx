'use client'

import { useState, useRef } from 'react'
import { Upload, FileText, CheckCircle, AlertCircle, ChevronRight, Download } from 'lucide-react'
import toast from 'react-hot-toast'

const FIELD_OPTIONS = ['商品名', 'SKU', '価格', '在庫数', 'カテゴリ', 'ブランド', '説明', '画像URL', 'ステータス', 'スキップ']
const STEPS = ['ファイル選択', 'マッピング確認', 'インポート実行', '完了']

export default function VendorProductImportPage() {
  const [step, setStep] = useState(0)
  const [file, setFile] = useState<File | null>(null)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState({ success: 0, error: 0, skip: 0 })
  const fileRef = useRef<HTMLInputElement>(null)

  const onFile = (f: File) => {
    if (f.size > 5 * 1024 * 1024) { toast.error('ファイルサイズは5MB以下にしてください'); return }
    setFile(f); setStep(1)
  }

  const runImport = async () => {
    setStep(2); setProgress(0)
    for (let i = 0; i <= 100; i += 10) { await new Promise(r => setTimeout(r, 200)); setProgress(i) }
    setResult({ success: 47, error: 2, skip: 1 })
    setStep(3)
  }

  const reset = () => { setStep(0); setFile(null); setProgress(0) }

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900">CSVインポート</h1>

      {/* Step indicator */}
      <div className="flex items-center gap-0">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${i === step ? 'bg-primary-100 text-primary-700' : i < step ? 'text-green-600' : 'text-gray-400'}`}>
              {i < step ? <CheckCircle className="w-4 h-4" /> : <span className="w-5 h-5 rounded-full border-2 flex items-center justify-center text-xs border-current">{i+1}</span>}
              <span className="hidden sm:inline">{s}</span>
            </div>
            {i < STEPS.length - 1 && <ChevronRight className="w-4 h-4 text-gray-300 mx-1" />}
          </div>
        ))}
      </div>

      {/* Notes */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800 space-y-1">
        <p className="font-semibold">注意事項</p>
        <ul className="space-y-0.5 text-xs">
          <li>• 既存SKUのデータは上書きされます</li>
          <li>• 画像は外部URLまたはメディアライブラリのパスを使用してください</li>
          <li>• 一度に最大1,000件までインポート可能です</li>
        </ul>
      </div>

      {step === 0 && (
        <div
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) onFile(f) }}
          className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-12 text-center hover:border-primary-400 transition-colors cursor-pointer"
          onClick={() => fileRef.current?.click()}
        >
          <Upload className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="font-medium text-gray-700 mb-1">CSVまたはExcelファイルをドラッグ&ドロップ</p>
          <p className="text-sm text-gray-400 mb-4">またはクリックしてファイルを選択（最大5MB）</p>
          <div className="flex items-center justify-center gap-3">
            <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded text-xs">.csv</span>
            <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded text-xs">.xlsx</span>
          </div>
          <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={e => { if (e.target.files?.[0]) onFile(e.target.files[0]) }} />
        </div>
      )}

      {step === 0 && (
        <div className="text-center">
          <a href="/admin/products/export?template=1" className="inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700">
            <Download className="w-4 h-4" /> テンプレートをダウンロード
          </a>
        </div>
      )}

      {step === 1 && file && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
            <FileText className="w-5 h-5 text-green-600" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
              <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">列マッピング（最初の5行プレビュー）</p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border border-gray-200 rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-gray-50">
                    {['列A', '列B', '列C', '列D', '列E'].map(h => (
                      <th key={h} className="px-3 py-2 text-left border-b border-gray-200">
                        <select className="text-xs border border-gray-300 rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-primary-500 bg-white">
                          {FIELD_OPTIONS.map(o => <option key={o}>{o}</option>)}
                        </select>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[['商品A', 'SKU001', '1980', '50', 'ED治療薬'], ['商品B', 'SKU002', '2980', '30', 'AGA']].map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      {row.map((cell, j) => <td key={j} className="px-3 py-2 text-gray-600">{cell}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={reset} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">やり直す</button>
            <button onClick={runImport} className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700">インポート実行</button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center space-y-4">
          <p className="font-medium text-gray-900">インポート中...</p>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-primary-500 h-2 rounded-full transition-all duration-200" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-sm text-gray-500">{progress}% 完了</p>
        </div>
      )}

      {step === 3 && (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center space-y-6">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
          <h2 className="text-xl font-bold text-gray-900">インポート完了</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-green-50 rounded-xl p-4"><p className="text-2xl font-bold text-green-600">{result.success}</p><p className="text-xs text-gray-500">成功</p></div>
            <div className="bg-red-50 rounded-xl p-4"><p className="text-2xl font-bold text-red-500">{result.error}</p><p className="text-xs text-gray-500">エラー</p></div>
            <div className="bg-gray-50 rounded-xl p-4"><p className="text-2xl font-bold text-gray-500">{result.skip}</p><p className="text-xs text-gray-500">スキップ</p></div>
          </div>
          <button onClick={reset} className="px-6 py-2.5 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700">新しいインポートを開始</button>
        </div>
      )}
    </div>
  )
}
