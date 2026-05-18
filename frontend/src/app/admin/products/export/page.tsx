'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronRight, Download, FileSpreadsheet, File, Calendar } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { adminApi } from '@/lib/api'

const FIELD_OPTIONS = [
  { key: 'name',       label: '商品名',   defaultOn: true },
  { key: 'sku',        label: 'SKU',      defaultOn: true },
  { key: 'price',      label: '価格',     defaultOn: true },
  { key: 'stock',      label: '在庫',     defaultOn: true },
  { key: 'category',   label: 'カテゴリ', defaultOn: true },
  { key: 'brand',      label: 'ブランド', defaultOn: false },
  { key: 'description',label: '説明',     defaultOn: false },
  { key: 'image_url',  label: '画像URL',  defaultOn: false },
  { key: 'created_at', label: '作成日',   defaultOn: false },
]

const STATUS_OPTIONS = [
  { key: 'published', label: '公開済み' },
  { key: 'draft',     label: '下書き' },
  { key: 'out_of_stock', label: '在庫なし' },
]

function toCSV(rows: any[], fields: string[]): string {
  const header = fields.join(',')
  const lines = rows.map(row => {
    return fields.map(f => {
      let val = ''
      if (f === 'name') val = row.name ?? ''
      else if (f === 'sku') val = row.sku ?? ''
      else if (f === 'price') val = row.price ?? ''
      else if (f === 'stock') val = row.stock ?? row.quantity ?? ''
      else if (f === 'category') val = row.category?.name ?? row.category ?? ''
      else if (f === 'brand') val = row.brand?.name ?? row.brand ?? ''
      else if (f === 'description') val = (row.description ?? '').replace(/"/g, '""')
      else if (f === 'image_url') val = row.image ?? row.thumbnail ?? ''
      else if (f === 'created_at') val = row.created_at ? new Date(row.created_at).toLocaleDateString('ja-JP') : ''
      if (typeof val === 'string' && (val.includes(',') || val.includes('"') || val.includes('\n'))) {
        val = `"${val}"`
      }
      return val
    }).join(',')
  })
  return [header, ...lines].join('\n')
}

export default function ProductExportPage() {
  const [scope, setScope] = useState<'all' | 'category' | 'status'>('all')
  const [selectedCategories, setSelectedCategories] = useState<number[]>([])
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(['published'])
  const [selectedFields, setSelectedFields] = useState<string[]>(
    FIELD_OPTIONS.filter(f => f.defaultOn).map(f => f.key)
  )
  const [format, setFormat] = useState<'csv' | 'excel'>('csv')
  const [isExporting, setIsExporting] = useState(false)
  const [lastExport, setLastExport] = useState<Date | null>(null)

  const { data: categoriesData } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: () => adminApi.categories({ per_page: 100 }).then(r => r.data),
  })

  const { data: productsData } = useQuery({
    queryKey: ['admin-products-export-count'],
    queryFn: () => adminApi.products({ per_page: 1 }).then(r => r.data),
  })

  const categories = categoriesData?.data ?? []
  const totalProducts = productsData?.meta?.total ?? 0

  const toggleCategory = (id: number) => {
    setSelectedCategories(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    )
  }

  const toggleStatus = (s: string) => {
    setSelectedStatuses(prev =>
      prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
    )
  }

  const toggleField = (key: string) => {
    setSelectedFields(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    )
  }

  const handleExport = async () => {
    if (selectedFields.length === 0) return
    setIsExporting(true)
    try {
      // Fetch products (up to 1000)
      const params: Record<string, any> = { per_page: 1000 }
      if (scope === 'category' && selectedCategories.length > 0) {
        params.category_ids = selectedCategories.join(',')
      }
      if (scope === 'status' && selectedStatuses.length > 0) {
        params.status = selectedStatuses.join(',')
      }
      const res = await adminApi.products(params)
      const products = res.data?.data ?? []

      // Generate CSV
      const csv = toCSV(products, selectedFields)
      const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const now = new Date()
      const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`
      a.download = `products_export_${dateStr}.${format === 'excel' ? 'csv' : 'csv'}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      setLastExport(now)
    } catch (err) {
      console.error('Export failed', err)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="space-y-5 max-w-3xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-1">
          <Link href="/admin/products" className="hover:text-primary-500 transition-colors">商品</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-gray-900 font-medium">エクスポート</span>
        </div>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="font-display text-2xl font-bold text-gray-900">商品エクスポート</h1>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1.5">
              <File className="w-4 h-4" />
              総商品数: <strong className="text-gray-900">{totalProducts}件</strong>
            </span>
            {lastExport && (
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                前回エクスポート: <strong className="text-gray-900">
                  {lastExport.toLocaleDateString('ja-JP')} {lastExport.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                </strong>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Export scope */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
        <h2 className="text-base font-semibold text-gray-900">エクスポート範囲</h2>
        <div className="flex flex-wrap gap-3">
          {[
            { value: 'all', label: '全商品' },
            { value: 'category', label: '選択カテゴリ' },
            { value: 'status', label: 'ステータス別' },
          ].map(opt => (
            <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="scope"
                value={opt.value}
                checked={scope === opt.value}
                onChange={() => setScope(opt.value as any)}
                className="accent-primary-600"
              />
              <span className="text-sm text-gray-700">{opt.label}</span>
            </label>
          ))}
        </div>

        {/* Category selection */}
        {scope === 'category' && (
          <div className="border border-gray-200 rounded-lg p-4 max-h-48 overflow-y-auto">
            {categories.length === 0 ? (
              <p className="text-sm text-gray-400">カテゴリを読み込み中...</p>
            ) : (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {categories.map((cat: any) => (
                  <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(cat.id)}
                      onChange={() => toggleCategory(cat.id)}
                      className="accent-primary-600 rounded"
                    />
                    <span className="text-sm text-gray-700 truncate">{cat.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Status selection */}
        {scope === 'status' && (
          <div className="flex flex-wrap gap-4">
            {STATUS_OPTIONS.map(s => (
              <label key={s.key} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedStatuses.includes(s.key)}
                  onChange={() => toggleStatus(s.key)}
                  className="accent-primary-600 rounded"
                />
                <span className="text-sm text-gray-700">{s.label}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Field selection */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">出力フィールド</h2>
          <div className="flex gap-3 text-sm">
            <button
              onClick={() => setSelectedFields(FIELD_OPTIONS.map(f => f.key))}
              className="text-primary-600 hover:text-primary-700"
            >
              全選択
            </button>
            <button
              onClick={() => setSelectedFields([])}
              className="text-gray-500 hover:text-gray-700"
            >
              全解除
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {FIELD_OPTIONS.map(field => (
            <label key={field.key} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedFields.includes(field.key)}
                onChange={() => toggleField(field.key)}
                className="accent-primary-600 rounded"
              />
              <span className="text-sm text-gray-700">{field.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Format selection */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
        <h2 className="text-base font-semibold text-gray-900">ファイル形式</h2>
        <div className="flex gap-4">
          <label className={`flex items-center gap-3 cursor-pointer border-2 rounded-xl px-5 py-3 transition-colors ${format === 'csv' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}>
            <input
              type="radio"
              name="format"
              value="csv"
              checked={format === 'csv'}
              onChange={() => setFormat('csv')}
              className="accent-primary-600"
            />
            <File className="w-5 h-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">CSV</span>
          </label>
          <label className={`flex items-center gap-3 cursor-pointer border-2 rounded-xl px-5 py-3 transition-colors ${format === 'excel' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}>
            <input
              type="radio"
              name="format"
              value="excel"
              checked={format === 'excel'}
              onChange={() => setFormat('excel')}
              className="accent-primary-600"
            />
            <FileSpreadsheet className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-gray-700">Excel</span>
          </label>
        </div>
      </div>

      {/* Export button */}
      <div className="flex justify-end">
        <button
          onClick={handleExport}
          disabled={isExporting || selectedFields.length === 0}
          className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isExporting ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              エクスポート中...
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              エクスポート開始
            </>
          )}
        </button>
      </div>
    </div>
  )
}
