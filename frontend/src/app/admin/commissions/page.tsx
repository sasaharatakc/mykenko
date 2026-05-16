'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/lib/api'
import toast from 'react-hot-toast'
import { Save, Plus, Percent, Tag, Store, Trash2 } from 'lucide-react'

interface CommissionRow {
  id: number
  name: string
  rate: string
}

export default function AdminCommissionsPage() {
  const queryClient = useQueryClient()
  const [defaultRate, setDefaultRate] = useState('')
  const [categoryRows, setCategoryRows] = useState<CommissionRow[]>([])
  const [vendorRows, setVendorRows] = useState<CommissionRow[]>([])

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'settings'],
    queryFn: () => adminApi.settings(),
  })

  useEffect(() => {
    if (data?.data?.data?.default_commission !== undefined) {
      setDefaultRate(String(data.data.data.default_commission))
    }
  }, [data])

  const saveMutation = useMutation({
    mutationFn: (rate: string) =>
      adminApi.updateSettings({ default_commission: rate }),
    onSuccess: () => {
      toast.success('デフォルト手数料率を保存しました')
      queryClient.invalidateQueries({ queryKey: ['admin', 'settings'] })
    },
    onError: () => toast.error('保存に失敗しました'),
  })

  function addCategoryRow() {
    setCategoryRows((prev) => [
      ...prev,
      { id: Date.now(), name: '', rate: '' },
    ])
  }

  function addVendorRow() {
    setVendorRows((prev) => [
      ...prev,
      { id: Date.now(), name: '', rate: '' },
    ])
  }

  function removeCategoryRow(id: number) {
    setCategoryRows((prev) => prev.filter((r) => r.id !== id))
  }

  function removeVendorRow(id: number) {
    setVendorRows((prev) => prev.filter((r) => r.id !== id))
  }

  function updateCategoryRow(id: number, field: 'name' | 'rate', value: string) {
    setCategoryRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    )
  }

  function updateVendorRow(id: number, field: 'name' | 'rate', value: string) {
    setVendorRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    )
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">手数料設定</h1>
        <button
          onClick={() => saveMutation.mutate(defaultRate)}
          disabled={saveMutation.isPending || isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm disabled:opacity-60"
        >
          <Save className="w-4 h-4" />
          {saveMutation.isPending ? '保存中...' : '設定を保存'}
        </button>
      </div>

      {/* Global commission rate */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Percent className="w-4 h-4 text-primary" />
          </div>
          <h2 className="text-base font-semibold text-gray-900">グローバル手数料率</h2>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          全てのベンダーに適用されるデフォルト手数料率です。
          カテゴリ別・ベンダー別の設定がある場合はそちらが優先されます。
        </p>
        <div className="flex items-center gap-3 max-w-xs">
          {isLoading ? (
            <div className="h-10 bg-gray-100 rounded-lg animate-pulse flex-1" />
          ) : (
            <>
              <div className="relative flex-1">
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={0.1}
                  value={defaultRate}
                  onChange={(e) => setDefaultRate(e.target.value)}
                  className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="例: 10"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                  %
                </span>
              </div>
              <button
                onClick={() => saveMutation.mutate(defaultRate)}
                disabled={saveMutation.isPending}
                className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90 disabled:opacity-60"
              >
                <Save className="w-3.5 h-3.5" />
                保存
              </button>
            </>
          )}
        </div>
      </div>

      {/* Category commission */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <Tag className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">カテゴリ別手数料</h2>
              <p className="text-xs text-gray-500">カテゴリごとに異なる手数料率を設定します</p>
            </div>
          </div>
          <button
            onClick={addCategoryRow}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-lg text-xs text-gray-700 hover:bg-gray-50"
          >
            <Plus className="w-3.5 h-3.5" />
            追加
          </button>
        </div>

        {categoryRows.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-gray-200 rounded-lg">
            <Tag className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-400">カテゴリ別手数料が設定されていません</p>
            <button
              onClick={addCategoryRow}
              className="mt-3 text-xs text-primary hover:underline"
            >
              最初の設定を追加する
            </button>
          </div>
        ) : (
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">
                    カテゴリ
                  </th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 w-36">
                    手数料率 (%)
                  </th>
                  <th className="w-10" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {categoryRows.map((row) => (
                  <tr key={row.id}>
                    <td className="px-4 py-2">
                      <input
                        type="text"
                        value={row.name}
                        onChange={(e) => updateCategoryRow(row.id, 'name', e.target.value)}
                        placeholder="カテゴリ名"
                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <div className="relative">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={row.rate}
                          onChange={(e) => updateCategoryRow(row.id, 'rate', e.target.value)}
                          placeholder="0"
                          className="w-full px-2 py-1.5 pr-6 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
                          %
                        </span>
                      </div>
                    </td>
                    <td className="px-2 py-2">
                      <button
                        onClick={() => removeCategoryRow(row.id)}
                        className="w-7 h-7 flex items-center justify-center rounded text-gray-400 hover:text-red-500 hover:bg-red-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Vendor commission */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
              <Store className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">ベンダー別手数料</h2>
              <p className="text-xs text-gray-500">特定のベンダーに個別の手数料率を設定します</p>
            </div>
          </div>
          <button
            onClick={addVendorRow}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-lg text-xs text-gray-700 hover:bg-gray-50"
          >
            <Plus className="w-3.5 h-3.5" />
            追加
          </button>
        </div>

        {vendorRows.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-gray-200 rounded-lg">
            <Store className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-400">ベンダー別手数料が設定されていません</p>
            <button
              onClick={addVendorRow}
              className="mt-3 text-xs text-primary hover:underline"
            >
              最初の設定を追加する
            </button>
          </div>
        ) : (
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">
                    ベンダー名
                  </th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 w-36">
                    手数料率 (%)
                  </th>
                  <th className="w-10" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {vendorRows.map((row) => (
                  <tr key={row.id}>
                    <td className="px-4 py-2">
                      <input
                        type="text"
                        value={row.name}
                        onChange={(e) => updateVendorRow(row.id, 'name', e.target.value)}
                        placeholder="ベンダー名"
                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <div className="relative">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={row.rate}
                          onChange={(e) => updateVendorRow(row.id, 'rate', e.target.value)}
                          placeholder="0"
                          className="w-full px-2 py-1.5 pr-6 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
                          %
                        </span>
                      </div>
                    </td>
                    <td className="px-2 py-2">
                      <button
                        onClick={() => removeVendorRow(row.id)}
                        className="w-7 h-7 flex items-center justify-center rounded text-gray-400 hover:text-red-500 hover:bg-red-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
