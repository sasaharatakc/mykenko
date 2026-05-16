'use client'

import { useState } from 'react'
import { FileText, Plus, Edit2, Eye, Info } from 'lucide-react'

interface CmsPage {
  id: number
  name: string
  slug: string
  status: '公開済み' | '下書き'
  updatedAt: string
}

const STATIC_PAGES: CmsPage[] = [
  { id: 1, name: 'ホーム', slug: '/', status: '公開済み', updatedAt: '2024-01-15' },
  { id: 2, name: '会社概要', slug: '/about', status: '公開済み', updatedAt: '2024-01-10' },
  { id: 3, name: 'プライバシーポリシー', slug: '/privacy', status: '公開済み', updatedAt: '2024-01-08' },
  { id: 4, name: '利用規約', slug: '/terms', status: '公開済み', updatedAt: '2024-01-08' },
  { id: 5, name: '配送について', slug: '/shipping', status: '公開済み', updatedAt: '2024-01-05' },
  { id: 6, name: '返品ポリシー', slug: '/returns', status: '公開済み', updatedAt: '2024-01-05' },
]

export default function AdminPagesPage() {
  const [pages] = useState<CmsPage[]>(STATIC_PAGES)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">CMSページ管理</h1>
        <button
          onClick={() => alert('この機能は近日実装予定です')}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 text-sm"
        >
          <Plus className="w-4 h-4" />
          ページを作成
        </button>
      </div>

      <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-800">
        <Info className="w-4 h-4 mt-0.5 shrink-0 text-blue-500" />
        <span>フロントエンドのページはコードで管理されています。CMSページ機能は近日実装予定です。</span>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['ページ名', 'スラッグ', 'ステータス', '最終更新', 'アクション'].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pages.map((page) => (
                <tr key={page.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-gray-900">{page.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-gray-500 font-mono text-xs">{page.slug}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      page.status === '公開済み'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {page.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-400 text-xs">{page.updatedAt}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        className="w-7 h-7 flex items-center justify-center rounded text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors"
                        title="プレビュー"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        className="w-7 h-7 flex items-center justify-center rounded text-gray-400 hover:text-primary hover:bg-primary-50 transition-colors"
                        title="編集"
                        onClick={() => alert('この機能は近日実装予定です')}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
