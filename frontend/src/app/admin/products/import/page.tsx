'use client'

import { useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import { ChevronRight, Upload, FileSpreadsheet, CheckCircle2, AlertCircle, SkipForward, Download, Info, X } from 'lucide-react'

const COLUMN_OPTIONS = [
  { value: '', label: '-- マッピングしない --' },
  { value: 'name', label: '商品名' },
  { value: 'sku', label: 'SKU' },
  { value: 'price', label: '価格' },
  { value: 'stock', label: '在庫数' },
  { value: 'category', label: 'カテゴリ' },
  { value: 'brand', label: 'ブランド' },
  { value: 'description', label: '説明' },
  { value: 'image_url', label: '画像URL' },
  { value: 'status', label: 'ステータス' },
]

const STEPS = [
  { num: 1, label: 'ファイル選択' },
  { num: 2, label: 'マッピング確認' },
  { num: 3, label: 'インポート実行' },
  { num: 4, label: '完了' },
]

function parseCSV(text: string): string[][] {
  const lines = text.trim().split('\n')
  return lines.map(line => {
    const cols: string[] = []
    let cur = ''
    let inQuote = false
    for (let i = 0; i < line.length; i++) {
      const ch = line[i]
      if (ch === '"') { inQuote = !inQuote }
      else if (ch === ',' && !inQuote) { cols.push(cur.trim()); cur = '' }
      else { cur += ch }
    }
    cols.push(cur.trim())
    return cols
  })
}

export default function ProductImportPage() {
  const [step, setStep] = useState(1)
  const [file, setFile] = useState<File | null>(null)
  const [csvRows, setCsvRows] = useState<string[][]>([])
  const [headers, setHeaders] = useState<string[]>([])
  const [mapping, setMapping] = useState<Record<number, string>>({})
  const [progress, setProgress] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [results, setResults] = useState({ success: 0, error: 0, skip: 0 })
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback((f: File) => {
    if (!f) return
    if (f.size > 5 * 1024 * 1024) {
      setError('ファイルサイズが5MBを超えています。')
      return
    }
    const ext = f.name.split('.').pop()?.toLowerCase()
    if (!['csv', 'xlsx', 'xls'].includes(ext ?? '')) {
      setError('CSV または Excel ファイルを選択してください。')
      return
    }
    setError(null)
    setFile(f)
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const rows = parseCSV(text)
      if (rows.length < 2) { setError('データが見つかりませんでした。'); return }
      const hdrs = rows[0]
      setHeaders(hdrs)
      setCsvRows(rows.slice(1, 6))
      // auto-map headers to known fields
      const autoMap: Record<number, string> = {}
      hdrs.forEach((h, i) => {
        const lower = h.toLowerCase()
        if (lower.includes('name') || lower.includes('商品名')) autoMap[i] = 'name'
        else if (lower.includes('sku')) autoMap[i] = 'sku'
        else if (lower.includes('price') || lower.includes('価格')) autoMap[i] = 'price'
        else if (lower.includes('stock') || lower.includes('在庫')) autoMap[i] = 'stock'
        else if (lower.includes('category') || lower.includes('カテゴリ')) autoMap[i] = 'category'
        else if (lower.includes('brand') || lower.includes('ブランド')) autoMap[i] = 'brand'
        else if (lower.includes('desc') || lower.includes('説明')) autoMap[i] = 'description'
        else if (lower.includes('image') || lower.includes('画像')) autoMap[i] = 'image_url'
        else if (lower.includes('status') || lower.includes('ステータス')) autoMap[i] = 'status'
      })
      setMapping(autoMap)
      setStep(2)
    }
    reader.readAsText(f)
  }, [])

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) handleFile(f)
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  const runImport = async () => {
    setStep(3)
    setProgress(0)
    // Simulate import progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) { clearInterval(interval); return prev }
        return prev + Math.random() * 15
      })
    }, 200)
    await new Promise(r => setTimeout(r, 2200))
    clearInterval(interval)
    setProgress(100)
    // Simulate results
    const total = csvRows.length
    setResults({ success: Math.max(1, total - 1), error: 0, skip: Math.min(1, total) })
    await new Promise(r => setTimeout(r, 400))
    setStep(4)
  }

  const reset = () => {
    setStep(1)
    setFile(null)
    setCsvRows([])
    setHeaders([])
    setMapping({})
    setProgress(0)
    setError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-1">
          <Link href="/admin/products" className="hover:text-primary-500 transition-colors">商品</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-gray-900 font-medium">インポート</span>
        </div>
        <h1 className="font-display text-2xl font-bold text-gray-900">商品インポート</h1>
      </div>

      {/* Step indicator */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center">
          {STEPS.map((s, i) => (
            <div key={s.num} className="flex items-center flex-1 last:flex-none">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 transition-colors ${
                  step > s.num ? 'bg-green-500 text-white' :
                  step === s.num ? 'bg-primary-600 text-white' :
                  'bg-gray-100 text-gray-400'
                }`}>
                  {step > s.num ? <CheckCircle2 className="w-4 h-4" /> : s.num}
                </div>
                <span className={`text-sm font-medium whitespace-nowrap ${
                  step === s.num ? 'text-gray-900' : 'text-gray-400'
                }`}>{s.label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-3 transition-colors ${step > s.num ? 'bg-green-400' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 注意事項 */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
        <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-blue-800 mb-1">注意事項</p>
          <ul className="text-sm text-blue-700 space-y-0.5 list-disc list-inside">
            <li>既存SKUは上書きされます</li>
            <li>画像URLは外部URLを使用してください</li>
            <li>最大5,000件まで一括インポート可能</li>
          </ul>
        </div>
      </div>

      {/* Step 1: File selection */}
      {step === 1 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">ファイルを選択</h2>
            <a
              href="/admin/products/export?template=1"
              className="flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
            >
              <Download className="w-4 h-4" />
              テンプレートをダウンロード
            </a>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
              <button onClick={() => setError(null)} className="ml-auto"><X className="w-4 h-4" /></button>
            </div>
          )}

          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${
              isDragging ? 'border-primary-400 bg-primary-50' : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
            }`}
          >
            <FileSpreadsheet className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-base font-medium text-gray-700 mb-1">
              ファイルをドラッグ＆ドロップ
            </p>
            <p className="text-sm text-gray-500 mb-3">または クリックしてファイルを選択</p>
            <p className="text-xs text-gray-400">CSV, Excel (.xlsx, .xls) 対応 / 最大 5MB</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={onFileChange}
              className="hidden"
            />
          </div>
        </div>
      )}

      {/* Step 2: Column mapping */}
      {step === 2 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-gray-900">カラムマッピング確認</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                ファイル: <span className="font-medium text-gray-700">{file?.name}</span>
              </p>
            </div>
            <button onClick={reset} className="text-sm text-gray-500 hover:text-gray-700 underline">
              ファイルを変更
            </button>
          </div>

          {/* Mapping dropdowns */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">各カラムのフィールドを設定してください</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {headers.map((header, i) => (
                <div key={i}>
                  <label className="block text-xs font-medium text-gray-500 mb-1 truncate" title={header}>
                    {header}
                  </label>
                  <select
                    value={mapping[i] ?? ''}
                    onChange={e => setMapping(prev => ({ ...prev, [i]: e.target.value }))}
                    className="w-full text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    {COLUMN_OPTIONS.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* Preview table */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">プレビュー（先頭5行）</p>
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full text-xs">
                <thead>
                  <tr className="bg-gray-50">
                    {headers.map((h, i) => (
                      <th key={i} className="px-3 py-2 text-left font-medium text-gray-600 whitespace-nowrap border-b border-gray-200">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {csvRows.map((row, ri) => (
                    <tr key={ri} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                      {headers.map((_, ci) => (
                        <td key={ci} className="px-3 py-2 text-gray-700 whitespace-nowrap max-w-[200px] truncate">
                          {row[ci] ?? ''}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button onClick={reset} className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              キャンセル
            </button>
            <button
              onClick={runImport}
              className="px-5 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              インポート実行
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Progress */}
      {step === 3 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center space-y-6">
          <div>
            <Upload className="w-12 h-12 text-primary-500 mx-auto mb-3 animate-pulse" />
            <h2 className="text-lg font-semibold text-gray-900 mb-1">インポート中...</h2>
            <p className="text-sm text-gray-500">しばらくお待ちください</p>
          </div>
          <div className="max-w-sm mx-auto">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>進捗</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
              <div
                className="h-3 bg-primary-500 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Results */}
      {step === 4 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center space-y-6">
          <div>
            <CheckCircle2 className="w-14 h-14 text-green-500 mx-auto mb-3" />
            <h2 className="text-lg font-semibold text-gray-900 mb-1">インポートが完了しました</h2>
            <p className="text-sm text-gray-500">処理結果は以下の通りです</p>
          </div>

          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <CheckCircle2 className="w-6 h-6 text-green-500 mx-auto mb-1" />
              <p className="text-2xl font-bold text-green-700">{results.success}</p>
              <p className="text-xs text-green-600 mt-0.5">成功</p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <AlertCircle className="w-6 h-6 text-red-400 mx-auto mb-1" />
              <p className="text-2xl font-bold text-red-600">{results.error}</p>
              <p className="text-xs text-red-500 mt-0.5">エラー</p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <SkipForward className="w-6 h-6 text-gray-400 mx-auto mb-1" />
              <p className="text-2xl font-bold text-gray-600">{results.skip}</p>
              <p className="text-xs text-gray-500 mt-0.5">スキップ</p>
            </div>
          </div>

          <div className="flex justify-center gap-3">
            <button
              onClick={reset}
              className="px-5 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              もう一度インポート
            </button>
            <Link
              href="/admin/products"
              className="px-5 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
            >
              商品一覧に戻る
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
