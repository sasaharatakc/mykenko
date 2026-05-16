'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { Plus, Edit2, Trash2, HelpCircle, X, ChevronDown, ChevronUp } from 'lucide-react'
import toast from 'react-hot-toast'

interface Faq {
  id: number
  question: string
  answer: string
  category: string
  sort_order: number
  is_active: boolean
}

interface FaqForm {
  question: string
  answer: string
  category: string
  sort_order: number
  is_active: boolean
}

const CATEGORIES = ['一般', '注文・購入', '配送', '返品・交換', '支払い', 'アカウント', '医療品', 'その他']

const EMPTY_FORM: FaqForm = {
  question: '',
  answer: '',
  category: '一般',
  sort_order: 0,
  is_active: true,
}

export default function AdminFaqPage() {
  const queryClient = useQueryClient()
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editingFaq, setEditingFaq] = useState<Faq | null>(null)
  const [form, setForm] = useState<FaqForm>(EMPTY_FORM)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-faq'],
    queryFn: () => apiClient.get('/admin/faq').then((r: any) => r.data),
    retry: false,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiClient.delete(`/admin/faq/${id}`),
    onSuccess: () => {
      toast.success('FAQを削除しました')
      queryClient.invalidateQueries({ queryKey: ['admin-faq'] })
    },
    onError: () => toast.error('削除に失敗しました'),
  })

  const saveMutation = useMutation({
    mutationFn: (data: FaqForm & { id?: number }) => {
      if (data.id) return apiClient.put(`/admin/faq/${data.id}`, data)
      return apiClient.post('/admin/faq', data)
    },
    onSuccess: () => {
      toast.success(editingFaq ? 'FAQを更新しました' : 'FAQを追加しました')
      queryClient.invalidateQueries({ queryKey: ['admin-faq'] })
      closeModal()
    },
    onError: () => toast.error('保存に失敗しました'),
  })

  const faqs: Faq[] = data?.data ?? []
  const categories = [...new Set(faqs.map((f) => f.category))]
  const filtered = activeCategory ? faqs.filter((f) => f.category === activeCategory) : faqs

  function openCreate() {
    setEditingFaq(null)
    setForm(EMPTY_FORM)
    setShowModal(true)
  }

  function openEdit(faq: Faq) {
    setEditingFaq(faq)
    setForm({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      sort_order: faq.sort_order,
      is_active: faq.is_active,
    })
    setShowModal(true)
  }

  function closeModal() {
    setShowModal(false)
    setEditingFaq(null)
    setForm(EMPTY_FORM)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    saveMutation.mutate(editingFaq ? { ...form, id: editingFaq.id } : form)
  }

  const isEmpty = !isLoading && (isError || faqs.length === 0)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">FAQ管理</h1>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 text-sm"
        >
          <Plus className="w-4 h-4" />
          FAQ追加
        </button>
      </div>

      {/* Category filter chips */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              activeCategory === null ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            すべて
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat === activeCategory ? null : cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                activeCategory === cat ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        </div>
      ) : isEmpty ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-16 text-center">
          <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium mb-2">FAQがまだありません</p>
          <p className="text-gray-400 text-sm mb-6">よくある質問を追加してユーザーをサポートしましょう</p>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 text-sm"
          >
            <Plus className="w-4 h-4" />
            FAQ追加
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['質問', 'カテゴリ', '順番', 'ステータス', 'アクション'].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((faq) => (
                  <tr key={faq.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3">
                      <p className="font-medium text-gray-900 line-clamp-1">{faq.question}</p>
                      <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{faq.answer}</p>
                    </td>
                    <td className="px-5 py-3">
                      <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">{faq.category}</span>
                    </td>
                    <td className="px-5 py-3 text-gray-600">{faq.sort_order}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        faq.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {faq.is_active ? '公開中' : '非公開'}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEdit(faq)}
                          className="w-7 h-7 flex items-center justify-center rounded text-gray-400 hover:text-primary hover:bg-primary-50 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => confirm('このFAQを削除しますか？') && deleteMutation.mutate(faq.id)}
                          className="w-7 h-7 flex items-center justify-center rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">{editingFaq ? 'FAQ編集' : 'FAQ追加'}</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">質問 <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={form.question}
                  onChange={(e) => setForm({ ...form, question: e.target.value })}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  placeholder="質問を入力"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">回答 <span className="text-red-500">*</span></label>
                <textarea
                  value={form.answer}
                  onChange={(e) => setForm({ ...form, answer: e.target.value })}
                  required
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
                  placeholder="回答を入力"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">カテゴリ</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  >
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">順番</label>
                  <input
                    type="number"
                    value={form.sort_order}
                    onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    min={0}
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, is_active: !form.is_active })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.is_active ? 'bg-primary' : 'bg-gray-200'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form.is_active ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
                <span className="text-sm text-gray-700">{form.is_active ? '公開中' : '非公開'}</span>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={closeModal} className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
                  キャンセル
                </button>
                <button
                  type="submit"
                  disabled={saveMutation.isPending}
                  className="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary-600 disabled:opacity-60"
                >
                  {saveMutation.isPending ? '保存中...' : '保存'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
