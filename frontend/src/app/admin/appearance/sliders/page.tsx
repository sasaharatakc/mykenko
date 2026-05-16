'use client'

import { useState } from 'react'
import { Plus, Edit2, Trash2, X, Image as ImageIcon } from 'lucide-react'
import toast from 'react-hot-toast'

interface Slide {
  id: number
  title: string
  subtitle: string
  buttonText: string
  linkUrl: string
  sortOrder: number
  isActive: boolean
  startDate?: string
  endDate?: string
}

interface SlideForm {
  title: string
  subtitle: string
  buttonText: string
  linkUrl: string
  sortOrder: number
  isActive: boolean
  startDate: string
  endDate: string
}

const EMPTY_FORM: SlideForm = {
  title: '',
  subtitle: '',
  buttonText: '',
  linkUrl: '',
  sortOrder: 0,
  isActive: true,
  startDate: '',
  endDate: '',
}

export default function AdminSlidersPage() {
  const [slides, setSlides] = useState<Slide[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editingSlide, setEditingSlide] = useState<Slide | null>(null)
  const [form, setForm] = useState<SlideForm>(EMPTY_FORM)

  function openCreate() {
    setEditingSlide(null)
    setForm(EMPTY_FORM)
    setShowModal(true)
  }

  function openEdit(slide: Slide) {
    setEditingSlide(slide)
    setForm({
      title: slide.title,
      subtitle: slide.subtitle,
      buttonText: slide.buttonText,
      linkUrl: slide.linkUrl,
      sortOrder: slide.sortOrder,
      isActive: slide.isActive,
      startDate: slide.startDate ?? '',
      endDate: slide.endDate ?? '',
    })
    setShowModal(true)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (editingSlide) {
      setSlides((prev) => prev.map((s) => s.id === editingSlide.id ? { ...s, ...form } : s))
      toast.success('スライドを更新しました')
    } else {
      setSlides((prev) => [...prev, { id: Date.now(), ...form }])
      toast.success('スライドを追加しました')
    }
    setShowModal(false)
  }

  function deleteSlide(id: number) {
    if (!confirm('このスライドを削除しますか？')) return
    setSlides((prev) => prev.filter((s) => s.id !== id))
    toast.success('削除しました')
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ヒーロースライダー</h1>
          {slides.length > 0 && (
            <p className="text-sm text-gray-500 mt-1">現在 {slides.length} 件のスライドが設定されています</p>
          )}
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 text-sm"
        >
          <Plus className="w-4 h-4" />
          スライド追加
        </button>
      </div>

      {slides.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-16 text-center">
          <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium mb-2">スライドがまだありません</p>
          <p className="text-gray-400 text-sm mb-6">ヒーローセクションに表示するスライドを追加しましょう</p>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 text-sm"
          >
            <Plus className="w-4 h-4" />
            スライド追加
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['サムネイル', 'タイトル', 'サブタイトル', 'リンク先', '表示順', 'ステータス', 'アクション'].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {slides.map((slide) => (
                  <tr key={slide.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3">
                      <div className="w-16 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <ImageIcon className="w-4 h-4 text-gray-400" />
                      </div>
                    </td>
                    <td className="px-5 py-3 font-medium text-gray-900">{slide.title || '—'}</td>
                    <td className="px-5 py-3 text-gray-500">{slide.subtitle || '—'}</td>
                    <td className="px-5 py-3 text-gray-400 font-mono text-xs">{slide.linkUrl || '—'}</td>
                    <td className="px-5 py-3 text-gray-600">{slide.sortOrder}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        slide.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {slide.isActive ? '表示中' : '非表示'}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(slide)} className="w-7 h-7 flex items-center justify-center rounded text-gray-400 hover:text-primary hover:bg-primary-50">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => deleteSlide(slide.id)} className="w-7 h-7 flex items-center justify-center rounded text-gray-400 hover:text-red-500 hover:bg-red-50">
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

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-xl mx-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">{editingSlide ? 'スライド編集' : 'スライド追加'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-gray-400">
                <ImageIcon className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">画像をアップロード</p>
                <p className="text-xs text-gray-400 mt-1">推奨: 1920×600px</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">タイトル</label>
                  <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">サブタイトル</label>
                  <input type="text" value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ボタンテキスト</label>
                  <input type="text" value={form.buttonText} onChange={(e) => setForm({ ...form, buttonText: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">リンクURL</label>
                  <input type="text" value={form.linkUrl} onChange={(e) => setForm({ ...form, linkUrl: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">表示開始</label>
                  <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">表示終了</label>
                  <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">表示順</label>
                  <input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" min={0} />
                </div>
                <div className="flex items-center gap-3 self-end pb-2">
                  <button type="button" onClick={() => setForm({ ...form, isActive: !form.isActive })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.isActive ? 'bg-primary' : 'bg-gray-200'}`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm`}
                      style={{ transform: form.isActive ? 'translateX(22px)' : 'translateX(2px)' }} />
                  </button>
                  <span className="text-sm text-gray-700">{form.isActive ? '表示中' : '非表示'}</span>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
                  キャンセル
                </button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary-600">
                  保存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
