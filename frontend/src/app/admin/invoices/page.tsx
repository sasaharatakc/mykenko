'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { adminApi } from '@/lib/api'
import Link from 'next/link'
import { Receipt, Search, ExternalLink, Download } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { Pagination } from '@/components/ui/Pagination'
import toast from 'react-hot-toast'

async function downloadInvoicePdf(id: number) {
  try {
    const res = await adminApi.downloadInvoice(id)
    const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
    const a   = document.createElement('a')
    a.href = url
    a.download = `invoice-${String(id).padStart(6, '0')}.pdf`
    document.body.appendChild(a)
    a.click()
    a.remove()
    window.URL.revokeObjectURL(url)
  } catch {
    toast.error('PDFのダウンロードに失敗しました')
  }
}

const statusColor: Record<string, string> = {
  pending:    'bg-yellow-100 text-yellow-700',
  processing: 'bg-blue-100  text-blue-700',
  shipped:    'bg-purple-100 text-purple-700',
  delivered:  'bg-green-100 text-green-700',
  cancelled:  'bg-red-100   text-red-500',
  refunded:   'bg-gray-100  text-gray-500',
}

export default function AdminInvoicesPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'invoices', page, search],
    queryFn: () => adminApi.invoices({ page, per_page: 20, search: search || undefined }).then(r => r.data),
  })

  const invoices = data?.data ?? []
  const meta = data?.meta

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Receipt className="w-5 h-5" /> 請求書
        </h1>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="注文番号・顧客名で検索…"
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100 text-xs text-gray-500 uppercase">
            <tr>
              <th className="px-5 py-3 text-left">請求書番号</th>
              <th className="px-5 py-3 text-left">顧客</th>
              <th className="px-5 py-3 text-left">注文日</th>
              <th className="px-5 py-3 text-right">金額</th>
              <th className="px-5 py-3 text-center">ステータス</th>
              <th className="px-5 py-3 text-center">支払状況</th>
              <th className="px-5 py-3 text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading
              ? [...Array(8)].map((_, i) => (
                <tr key={i}>
                  {[...Array(7)].map((_, j) => (
                    <td key={j} className="px-5 py-3">
                      <div className="h-4 bg-gray-100 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
              : invoices.map((inv: any) => (
                  <tr key={inv.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 font-mono font-semibold text-primary">
                      #{String(inv.id).padStart(6, '0')}
                    </td>
                    <td className="px-5 py-3">
                      <div className="font-medium text-gray-900">{inv.customer?.name ?? '—'}</div>
                      <div className="text-xs text-gray-400">{inv.customer?.email ?? ''}</div>
                    </td>
                    <td className="px-5 py-3 text-gray-500 text-xs">
                      {inv.created_at ? formatDate(inv.created_at, { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                    </td>
                    <td className="px-5 py-3 text-right font-semibold text-gray-900">
                      ¥{Number(inv.total_amount ?? 0).toLocaleString()}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[inv.status] ?? 'bg-gray-100 text-gray-500'}`}>
                        {inv.status ?? 'pending'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center text-xs">
                      {inv.payment_status === 'paid' || inv.payment_status === 'completed'
                        ? <span className="text-green-600 font-medium">支払済</span>
                        : <span className="text-amber-500">未払い</span>}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => downloadInvoicePdf(inv.id)}
                          className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-primary transition-colors"
                          title="PDF ダウンロード"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <Link
                          href={`/admin/orders/${inv.order_id}`}
                          className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-primary transition-colors"
                          title="注文詳細へ"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
              ))}
          </tbody>
        </table>

        {!isLoading && invoices.length === 0 && (
          <div className="py-12 text-center text-gray-400">請求書がありません</div>
        )}
      </div>

      {meta && meta.last_page > 1 && (
        <Pagination currentPage={meta.current_page} lastPage={meta.last_page} onPageChange={setPage} />
      )}
    </div>
  )
}
