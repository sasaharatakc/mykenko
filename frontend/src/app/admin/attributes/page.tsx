'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/lib/api'
import { Plus, Pencil, Trash2, ChevronDown, ChevronRight, Palette, List } from 'lucide-react'
import toast from 'react-hot-toast'

interface AttributeSet {
  id: number
  title: string
  slug: string
  display_layout: 'dropdown' | 'button' | 'color' | 'image'
  order: number
  status: string
  attributes_count?: number
}

interface Attribute {
  id: number
  title: string
  color: string | null
  order: number
  attribute_set_id: number
}

type SetForm = { title: string; display_layout: string; order: number; status: string }
type AttrForm = { title: string; color: string; order: number }

const LAYOUT_LABELS = { dropdown: 'ドロップダウン', button: 'ボタン', color: 'カラースウォッチ', image: '画像' }

export default function AdminAttributesPage() {
  const queryClient = useQueryClient()
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [editSet, setEditSet] = useState<AttributeSet | null>(null)
  const [showSetForm, setShowSetForm] = useState(false)
  const [setForm, setSetForm] = useState<SetForm>({ title: '', display_layout: 'button', order: 0, status: 'published' })

  const [editAttr, setEditAttr] = useState<Attribute | null>(null)
  const [showAttrForm, setShowAttrForm] = useState<number | null>(null) // setId
  const [attrForm, setAttrForm] = useState<AttrForm>({ title: '', color: '', order: 0 })

  const { data, isLoading } = useQuery({
    queryKey: ['admin-attribute-sets'],
    queryFn: () => adminApi.attributeSets({ per_page: 50 }).then(r => r.data),
  })

  const attributesQuery = useQuery({
    queryKey: ['admin-set-attributes', expandedId],
    queryFn: () => adminApi.attributeSetAttributes(expandedId!).then(r => r.data?.data ?? []),
    enabled: expandedId !== null,
  })

  // Set mutations
  const createSet = useMutation({
    mutationFn: (d: SetForm) => adminApi.createAttributeSet(d),
    onSuccess: () => { toast.success('作成しました'); queryClient.invalidateQueries({ queryKey: ['admin-attribute-sets'] }); resetSetForm() },
    onError: () => toast.error('作成に失敗しました'),
  })
  const updateSet = useMutation({
    mutationFn: ({ id, d }: { id: number; d: SetForm }) => adminApi.updateAttributeSet(id, d),
    onSuccess: () => { toast.success('更新しました'); queryClient.invalidateQueries({ queryKey: ['admin-attribute-sets'] }); resetSetForm() },
    onError: () => toast.error('更新に失敗しました'),
  })
  const deleteSet = useMutation({
    mutationFn: (id: number) => adminApi.deleteAttributeSet(id),
    onSuccess: () => { toast.success('削除しました'); queryClient.invalidateQueries({ queryKey: ['admin-attribute-sets'] }) },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? '削除に失敗しました'),
  })

  // Attribute mutations
  const createAttr = useMutation({
    mutationFn: ({ setId, d }: { setId: number; d: AttrForm }) => adminApi.createAttribute(setId, d),
    onSuccess: (_, { setId }) => {
      toast.success('属性値を追加しました')
      queryClient.invalidateQueries({ queryKey: ['admin-set-attributes', setId] })
      queryClient.invalidateQueries({ queryKey: ['admin-attribute-sets'] })
      resetAttrForm()
    },
    onError: () => toast.error('追加に失敗しました'),
  })
  const updateAttr = useMutation({
    mutationFn: ({ setId, attrId, d }: { setId: number; attrId: number; d: AttrForm }) =>
      adminApi.updateAttribute(setId, attrId, d),
    onSuccess: (_, { setId }) => {
      toast.success('更新しました')
      queryClient.invalidateQueries({ queryKey: ['admin-set-attributes', setId] })
      resetAttrForm()
    },
    onError: () => toast.error('更新に失敗しました'),
  })
  const deleteAttr = useMutation({
    mutationFn: ({ setId, attrId }: { setId: number; attrId: number }) =>
      adminApi.deleteAttribute(setId, attrId),
    onSuccess: (_, { setId }) => {
      toast.success('削除しました')
      queryClient.invalidateQueries({ queryKey: ['admin-set-attributes', setId] })
      queryClient.invalidateQueries({ queryKey: ['admin-attribute-sets'] })
    },
    onError: () => toast.error('削除に失敗しました'),
  })

  const resetSetForm = () => { setShowSetForm(false); setEditSet(null); setSetForm({ title: '', display_layout: 'button', order: 0, status: 'published' }) }
  const resetAttrForm = () => { setShowAttrForm(null); setEditAttr(null); setAttrForm({ title: '', color: '', order: 0 }) }

  const openEditSet = (s: AttributeSet) => {
    setEditSet(s)
    setSetForm({ title: s.title, display_layout: s.display_layout, order: s.order, status: s.status })
    setShowSetForm(true)
  }

  const openEditAttr = (a: Attribute) => {
    setEditAttr(a)
    setAttrForm({ title: a.title, color: a.color ?? '', order: a.order })
    setShowAttrForm(a.attribute_set_id)
  }

  const handleSetSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editSet) updateSet.mutate({ id: editSet.id, d: setForm })
    else createSet.mutate(setForm)
  }

  const handleAttrSubmit = (e: React.FormEvent, setId: number) => {
    e.preventDefault()
    if (editAttr) updateAttr.mutate({ setId, attrId: editAttr.id, d: attrForm })
    else createAttr.mutate({ setId, d: attrForm })
  }

  const sets: AttributeSet[] = data?.data ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">アトリビュート管理</h1>
          <p className="text-sm text-gray-500 mt-1">商品バリエーションのサイズ・カラーなどを管理します</p>
        </div>
        <button
          onClick={() => { resetSetForm(); setShowSetForm(true) }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-600"
        >
          <Plus className="w-4 h-4" />
          セットを追加
        </button>
      </div>

      {/* Set Form */}
      {showSetForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">{editSet ? 'セットを編集' : '新規アトリビュートセット'}</h2>
          <form onSubmit={handleSetSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">セット名 <span className="text-red-500">*</span></label>
              <input
                value={setForm.title}
                onChange={e => setSetForm({ ...setForm, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="例: サイズ、カラー"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">表示形式</label>
              <select
                value={setForm.display_layout}
                onChange={e => setSetForm({ ...setForm, display_layout: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                {Object.entries(LAYOUT_LABELS).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">表示順</label>
              <input
                type="number"
                value={setForm.order}
                onChange={e => setSetForm({ ...setForm, order: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ステータス</label>
              <select
                value={setForm.status}
                onChange={e => setSetForm({ ...setForm, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="published">公開</option>
                <option value="draft">非公開</option>
              </select>
            </div>
            <div className="sm:col-span-2 flex gap-3 pt-2">
              <button
                type="submit"
                disabled={createSet.isPending || updateSet.isPending}
                className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium disabled:opacity-60"
              >
                {createSet.isPending || updateSet.isPending ? '保存中...' : '保存'}
              </button>
              <button type="button" onClick={resetSetForm} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
                キャンセル
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Sets List */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : sets.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <List className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">アトリビュートセットがありません。追加してください。</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sets.map(set => (
            <div key={set.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {/* Set Header */}
              <div className="flex items-center justify-between px-5 py-4">
                <button
                  onClick={() => setExpandedId(expandedId === set.id ? null : set.id)}
                  className="flex items-center gap-3 text-left flex-1"
                >
                  {expandedId === set.id ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                  <div>
                    <p className="font-medium text-gray-900">{set.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {LAYOUT_LABELS[set.display_layout as keyof typeof LAYOUT_LABELS]} · {set.attributes_count ?? 0}個の属性値
                    </p>
                  </div>
                </button>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${set.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {set.status === 'published' ? '公開' : '非公開'}
                  </span>
                  <button onClick={() => openEditSet(set)} className="p-1.5 text-gray-400 hover:text-primary rounded-lg hover:bg-gray-50">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => { if (confirm('このセットを削除しますか？')) deleteSet.mutate(set.id) }}
                    className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Expanded Attributes */}
              {expandedId === set.id && (
                <div className="border-t border-gray-100 bg-gray-50 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-gray-700">属性値</h3>
                    <button
                      onClick={() => { resetAttrForm(); setShowAttrForm(set.id) }}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      <Plus className="w-3.5 h-3.5" /> 属性値を追加
                    </button>
                  </div>

                  {/* Attr Form */}
                  {showAttrForm === set.id && (
                    <form onSubmit={e => handleAttrSubmit(e, set.id)} className="bg-white rounded-lg border border-gray-200 p-4 mb-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">名前 <span className="text-red-500">*</span></label>
                        <input
                          value={attrForm.title}
                          onChange={e => setAttrForm({ ...attrForm, title: e.target.value })}
                          className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                          placeholder="例: レッド, S, XL"
                          required
                        />
                      </div>
                      {set.display_layout === 'color' && (
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">カラーコード</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={attrForm.color || '#ffffff'}
                              onChange={e => setAttrForm({ ...attrForm, color: e.target.value })}
                              className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
                            />
                            <input
                              value={attrForm.color}
                              onChange={e => setAttrForm({ ...attrForm, color: e.target.value })}
                              className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-mono"
                              placeholder="#ff0000"
                            />
                          </div>
                        </div>
                      )}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">順序</label>
                        <input
                          type="number"
                          value={attrForm.order}
                          onChange={e => setAttrForm({ ...attrForm, order: Number(e.target.value) })}
                          className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                        />
                      </div>
                      <div className="sm:col-span-3 flex gap-2">
                        <button
                          type="submit"
                          disabled={createAttr.isPending || updateAttr.isPending}
                          className="px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-medium disabled:opacity-60"
                        >
                          {createAttr.isPending || updateAttr.isPending ? '保存中...' : '保存'}
                        </button>
                        <button type="button" onClick={resetAttrForm} className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-600">
                          キャンセル
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Attributes list */}
                  {attributesQuery.isLoading ? (
                    <div className="space-y-2">
                      {[...Array(3)].map((_, i) => <div key={i} className="h-8 bg-gray-200 rounded animate-pulse" />)}
                    </div>
                  ) : (attributesQuery.data as Attribute[] ?? []).length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-4">属性値がありません</p>
                  ) : (
                    <div className="space-y-1.5">
                      {(attributesQuery.data as Attribute[] ?? []).map((attr: Attribute) => (
                        <div key={attr.id} className="flex items-center justify-between bg-white rounded-lg px-4 py-2.5 border border-gray-100">
                          <div className="flex items-center gap-3">
                            {attr.color && (
                              <span
                                className="w-5 h-5 rounded-full border border-gray-200 flex-shrink-0"
                                style={{ backgroundColor: attr.color }}
                              />
                            )}
                            <span className="text-sm text-gray-800">{attr.title}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button onClick={() => openEditAttr(attr)} className="p-1 text-gray-400 hover:text-primary rounded">
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => { if (confirm('削除しますか？')) deleteAttr.mutate({ setId: set.id, attrId: attr.id }) }}
                              className="p-1 text-gray-400 hover:text-red-500 rounded"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
