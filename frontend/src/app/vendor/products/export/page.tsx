'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { vendorApi } from '@/lib/api'
import { Download, FileText } from 'lucide-react'
import toast from 'react-hot-toast'

const FIELDS = [
  { key: 'name', label: '商品名', required: true },
  { key: 'sku', label: 'SKU', required: true },
  { key: 'price', label: '価格', required: false },
  { key: 'stock', label: '在庫数', required: false },
  { key: 'category', label: 'カテゴリ', required: false },
  { key: 'brand', label: 'ブランド', required: false },
  { key: 'description', label: '説明', required: false },
  { key: 'image', label: '画像URL', required: false },
  { key: 'status', label: 'ステータス', required: false },
  { key: 'created_at', label: '作成日', required: false },
]

export default function VendorProductExportPage() {
  const [selectedFields, setSelectedFields] = useState<string[]>(FIELDS.filter(f => f.required).map(f => f.key))
  const [format, setFormat] = useState<'csv' | 'excel'>('csv')
  const [exporting, setExporting] = useState(false)
  const [lastExport, setLastExport] = useState<string | null>(null)

  const toggleField = (key: string) => {
    if (FIELDS.find(f => f.key === key)?.required) return
    setSelectedFields(s => s.includes(key) ? s.filter(k => k !== key) : [...s, key])
  }

  const { data } = useQuery({
    queryKey: ['vendor-products-count'],
    queryFn: () => vendorApi.products({ per_page: 1 }).then(r => (r.data as any)?.meta?.total ?? 0).catch(() => 0),
  })

  const doExport = async () => {
    setExporting(true)
    try {
      const r = await vendorApi.products({ per_page: 1000 })
      const products: any[] = (r.data as any)?.data ?? []
      const header = selectedFields.join(',')
      const rows = products.map(p =>
        selectedFields.map(f => {
          const v = f === 'category' ? p.category?.name : f === 'brand' ? p.brand?.name : p[f] ?? ''
          return `"${String(v).replace(/"/g, '""')}"`
        }).join(',')
      )
      const csv = '﻿' + [header, ...rows].join('\n')
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = `products-${new Date().toISOString().slice(0,10)}.csv`
      a.click(); URL.revokeObjectURL(url)
      setLastExport(new Date().toLocaleString('ja-JP'))
      toast.success(`${products.length}件をエクスポートしました`)
    } catch { toast.error('エクスポートに失敗しました') }
    finally { setExporting(false) }
  }

  return (
    <div className="space-y-6 max-w-xl">
      <h1 className="text-2xl font-bold text-gray-900">CSVエクスポート</h1>

      {/* Total count */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
        <FileText className="w-5 h-5 text-gray-400" />
        <div>
          <p className="text-sm text-gray-500">総商品数</p>
          <p className="text-xl font-bold text-gray-900">{data ?? 0}件</p>
        </div>
        {lastExport && <p className="ml-auto text-xs text-gray-400">前回: {lastExport}</p>}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        {/* Fields */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-900 text-sm">出力項目</h2>
            <div className="flex gap-2">
              <button onClick={() => setSelectedFields(FIELDS.map(f => f.key))} className="text-xs text-primary-600 hover:text-primary-700">全選択</button>
              <span className="text-gray-300">|</span>
              <button onClick={() => setSelectedFields(FIELDS.filter(f => f.required).map(f => f.key))} className="text-xs text-gray-500 hover:text-gray-700">必須のみ</button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {FIELDS.map(({ key, label, required }) => (
              <label key={key} className={`flex items-center gap-2 cursor-pointer p-2.5 rounded-lg border transition-colors ${selectedFields.includes(key) ? 'border-primary-200 bg-primary-50' : 'border-gray-200'} ${required ? 'cursor-default' : ''}`}>
                <input type="checkbox" checked={selectedFields.includes(key)} onChange={() => toggleField(key)} disabled={required} className="text-primary-500" />
                <span className="text-sm text-gray-700">{label}</span>
                {required && <span className="text-xs text-red-400 ml-auto">必須</span>}
              </label>
            ))}
          </div>
        </div>

        {/* Format */}
        <div className="pt-4 border-t border-gray-100">
          <h2 className="font-semibold text-gray-900 text-sm mb-3">出力形式</h2>
          <div className="flex gap-4">
            {[['csv', 'CSV (.csv)'], ['excel', 'Excel (.xlsx)']].map(([v, l]) => (
              <label key={v} className="flex items-center gap-2 cursor-pointer">
                <input type="radio" value={v} checked={format === v} onChange={e => setFormat(e.target.value as any)} className="text-primary-500" />
                <span className="text-sm">{l}</span>
              </label>
            ))}
          </div>
          {format === 'excel' && <p className="text-xs text-amber-600 mt-2">※ Excelエクスポートは現在CSV形式で出力されます</p>}
        </div>

        <button onClick={doExport} disabled={exporting || selectedFields.length === 0}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50">
          <Download className="w-4 h-4" />
          {exporting ? 'エクスポート中...' : 'エクスポート開始'}
        </button>
      </div>
    </div>
  )
}
