'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/lib/api'
import toast from 'react-hot-toast'
import {
  Plus, Trash2, Edit2, Check, X, ChevronDown, ChevronRight,
  Table2, Layers, Tag,
} from 'lucide-react'

interface SpecAttribute {
  id: number
  specification_group_id: number
  name: string
  value: string
  order: number
}

interface SpecGroup {
  id: number
  specification_table_id: number
  name: string
  order: number
  attributes: SpecAttribute[]
}

interface SpecTable {
  id: number
  name: string
  status: string | null
  groups_count?: number
  groups?: SpecGroup[]
}

// ─── Inline editable cell ────────────────────────────────────────────────────
function InlineEdit({
  value,
  onSave,
  placeholder,
  className = '',
}: {
  value: string
  onSave: (v: string) => void
  placeholder?: string
  className?: string
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)

  if (!editing) {
    return (
      <span
        className={`cursor-pointer hover:text-primary ${className}`}
        onClick={() => { setDraft(value); setEditing(true) }}
      >
        {value || <span className="text-gray-400 italic">{placeholder}</span>}
      </span>
    )
  }
  return (
    <span className="flex items-center gap-1">
      <input
        autoFocus
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter') { onSave(draft); setEditing(false) }
          if (e.key === 'Escape') setEditing(false)
        }}
        className="border border-primary/40 rounded px-1.5 py-0.5 text-sm focus:outline-none"
      />
      <button onClick={() => { onSave(draft); setEditing(false) }} className="text-green-600 hover:text-green-700"><Check className="w-3.5 h-3.5" /></button>
      <button onClick={() => setEditing(false)} className="text-gray-400 hover:text-gray-600"><X className="w-3.5 h-3.5" /></button>
    </span>
  )
}

// ─── Spec Attribute Row ───────────────────────────────────────────────────────
function AttributeRow({ attr, onUpdate, onDelete }: {
  attr: SpecAttribute
  onUpdate: (id: number, data: object) => void
  onDelete: (id: number) => void
}) {
  return (
    <tr className="border-b border-gray-100 last:border-0">
      <td className="px-3 py-2 text-sm">
        <InlineEdit
          value={attr.name}
          onSave={v => onUpdate(attr.id, { name: v })}
          placeholder="項目名"
        />
      </td>
      <td className="px-3 py-2 text-sm text-gray-600">
        <InlineEdit
          value={attr.value}
          onSave={v => onUpdate(attr.id, { value: v })}
          placeholder="値"
        />
      </td>
      <td className="px-3 py-2 text-right">
        <button
          onClick={() => onDelete(attr.id)}
          className="text-gray-300 hover:text-red-500 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </td>
    </tr>
  )
}

// ─── Spec Group Panel ─────────────────────────────────────────────────────────
function GroupPanel({ group, onUpdateGroup, onDeleteGroup, onCreateAttr, onUpdateAttr, onDeleteAttr }: {
  group: SpecGroup
  onUpdateGroup: (id: number, data: object) => void
  onDeleteGroup: (id: number) => void
  onCreateAttr: (groupId: number, data: object) => void
  onUpdateAttr: (id: number, data: object) => void
  onDeleteAttr: (id: number) => void
}) {
  const [newName, setNewName] = useState('')
  const [newValue, setNewValue] = useState('')
  const [showAdd, setShowAdd] = useState(false)

  const handleAddAttr = () => {
    if (!newName.trim() || !newValue.trim()) return
    onCreateAttr(group.id, { name: newName, value: newValue })
    setNewName('')
    setNewValue('')
    setShowAdd(false)
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden mb-3">
      {/* Group header */}
      <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-gray-400" />
          <InlineEdit
            value={group.name}
            onSave={v => onUpdateGroup(group.id, { name: v })}
            className="text-sm font-medium text-gray-700"
            placeholder="グループ名"
          />
          <span className="text-xs text-gray-400">({group.attributes?.length ?? 0}件)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowAdd(v => !v)}
            className="flex items-center gap-1 text-xs text-primary hover:text-primary-600 px-2 py-1 rounded hover:bg-primary/5"
          >
            <Plus className="w-3 h-3" /> 行追加
          </button>
          <button
            onClick={() => onDeleteGroup(group.id)}
            className="text-gray-300 hover:text-red-500 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Attributes table */}
      {(group.attributes?.length > 0 || showAdd) && (
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              <th className="px-3 py-1.5 text-left text-xs text-gray-400 font-medium w-2/5">項目</th>
              <th className="px-3 py-1.5 text-left text-xs text-gray-400 font-medium">値</th>
              <th className="w-8"></th>
            </tr>
          </thead>
          <tbody>
            {group.attributes?.map(attr => (
              <AttributeRow
                key={attr.id}
                attr={attr}
                onUpdate={onUpdateAttr}
                onDelete={onDeleteAttr}
              />
            ))}
            {showAdd && (
              <tr className="border-t border-gray-100">
                <td className="px-3 py-2">
                  <input
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    placeholder="項目名"
                    className="w-full border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary/20"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    value={newValue}
                    onChange={e => setNewValue(e.target.value)}
                    placeholder="値"
                    onKeyDown={e => e.key === 'Enter' && handleAddAttr()}
                    className="w-full border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary/20"
                  />
                </td>
                <td className="px-3 py-2 text-right">
                  <button onClick={handleAddAttr} className="text-green-600 hover:text-green-700"><Check className="w-3.5 h-3.5" /></button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  )
}

// ─── Spec Table Card ──────────────────────────────────────────────────────────
function SpecTableCard({ table, onUpdate, onDelete }: {
  table: SpecTable
  onUpdate: () => void
  onDelete: (id: number) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const qc = useQueryClient()

  const { data: detail } = useQuery({
    queryKey: ['admin', 'spec-tables', table.id],
    queryFn: () => adminApi.showSpecTable(table.id).then(r => r.data.data),
    enabled: expanded,
  })

  const updateTableMutation = useMutation({
    mutationFn: (data: object) => adminApi.updateSpecTable(table.id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'spec-tables'] }); onUpdate() },
  })

  const createGroupMutation = useMutation({
    mutationFn: (data: object) => adminApi.createSpecGroup(table.id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'spec-tables', table.id] }),
    onError: () => toast.error('グループ作成に失敗しました'),
  })

  const updateGroupMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: object }) => adminApi.updateSpecGroup(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'spec-tables', table.id] }),
  })

  const deleteGroupMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteSpecGroup(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'spec-tables', table.id] }),
  })

  const createAttrMutation = useMutation({
    mutationFn: ({ groupId, data }: { groupId: number; data: object }) => adminApi.createSpecAttribute(groupId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'spec-tables', table.id] }),
  })

  const updateAttrMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: object }) => adminApi.updateSpecAttribute(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'spec-tables', table.id] }),
  })

  const deleteAttrMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteSpecAttribute(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'spec-tables', table.id] }),
  })

  const [addingGroup, setAddingGroup] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')

  const groups: SpecGroup[] = detail?.groups ?? []

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4">
        <button
          onClick={() => setExpanded(v => !v)}
          className="flex items-center gap-2 flex-1 text-left"
        >
          {expanded ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
          <Table2 className="w-4 h-4 text-primary" />
          <span className="font-medium text-gray-900">{table.name}</span>
          <span className="text-xs text-gray-400">({table.groups_count ?? 0} グループ)</span>
        </button>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${table.status === 'inactive' ? 'bg-gray-100 text-gray-500' : 'bg-green-100 text-green-700'}`}>
            {table.status === 'inactive' ? '無効' : '有効'}
          </span>
          <button
            onClick={() => updateTableMutation.mutate({ status: table.status === 'inactive' ? 'active' : 'inactive' })}
            className="text-xs text-gray-400 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-50"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => { if (confirm(`「${table.name}」を削除しますか？`)) onDelete(table.id) }}
            className="text-gray-300 hover:text-red-500 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-gray-100 px-5 py-4">
          {groups.map(group => (
            <GroupPanel
              key={group.id}
              group={group}
              onUpdateGroup={(id, data) => updateGroupMutation.mutate({ id, data })}
              onDeleteGroup={id => deleteGroupMutation.mutate(id)}
              onCreateAttr={(groupId, data) => createAttrMutation.mutate({ groupId, data })}
              onUpdateAttr={(id, data) => updateAttrMutation.mutate({ id, data })}
              onDeleteAttr={id => deleteAttrMutation.mutate(id)}
            />
          ))}

          {addingGroup ? (
            <div className="flex items-center gap-2 mt-2">
              <input
                autoFocus
                value={newGroupName}
                onChange={e => setNewGroupName(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && newGroupName.trim()) {
                    createGroupMutation.mutate({ name: newGroupName })
                    setNewGroupName('')
                    setAddingGroup(false)
                  }
                  if (e.key === 'Escape') setAddingGroup(false)
                }}
                placeholder="グループ名を入力"
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <button
                onClick={() => {
                  if (newGroupName.trim()) {
                    createGroupMutation.mutate({ name: newGroupName })
                    setNewGroupName('')
                    setAddingGroup(false)
                  }
                }}
                className="px-3 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary-600"
              >
                追加
              </button>
              <button onClick={() => setAddingGroup(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setAddingGroup(true)}
              className="flex items-center gap-1.5 text-sm text-primary hover:text-primary-600 mt-2"
            >
              <Plus className="w-4 h-4" /> グループを追加
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AdminSpecTablesPage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [newName, setNewName] = useState('')
  const [showNew, setShowNew] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'spec-tables', { search }],
    queryFn: () => adminApi.specTables({ search: search || undefined }).then(r => r.data),
  })

  const tables: SpecTable[] = data?.data ?? []

  const createMutation = useMutation({
    mutationFn: (name: string) => adminApi.createSpecTable({ name }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'spec-tables'] })
      setNewName('')
      setShowNew(false)
      toast.success('スペックテーブルを作成しました')
    },
    onError: () => toast.error('作成に失敗しました'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteSpecTable(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'spec-tables'] })
      toast.success('削除しました')
    },
    onError: () => toast.error('削除に失敗しました'),
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">スペックテーブル</h1>
          <p className="text-sm text-gray-500 mt-0.5">商品仕様表の定義を管理します</p>
        </div>
        <button
          onClick={() => setShowNew(v => !v)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors"
        >
          <Plus className="w-4 h-4" /> 新規作成
        </button>
      </div>

      {/* New table form */}
      {showNew && (
        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4 flex items-center gap-3 shadow-sm">
          <Table2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <input
            autoFocus
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && newName.trim()) createMutation.mutate(newName)
              if (e.key === 'Escape') setShowNew(false)
            }}
            placeholder="テーブル名（例：スマートフォン仕様）"
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <button
            onClick={() => newName.trim() && createMutation.mutate(newName)}
            disabled={createMutation.isPending}
            className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-600 disabled:opacity-50"
          >
            {createMutation.isPending ? '作成中...' : '作成'}
          </button>
          <button onClick={() => setShowNew(false)} className="text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="テーブル名を検索..."
          className="w-full max-w-xs border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Tables list */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : tables.length === 0 ? (
        <div className="py-20 text-center text-gray-400">
          <Tag className="w-12 h-12 mx-auto mb-3 text-gray-200" />
          <p>{search ? '該当するテーブルが見つかりません。' : 'スペックテーブルがまだありません。'}</p>
          <p className="text-sm mt-1">「新規作成」から追加してください。</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tables.map(table => (
            <SpecTableCard
              key={table.id}
              table={table}
              onUpdate={() => qc.invalidateQueries({ queryKey: ['admin', 'spec-tables'] })}
              onDelete={id => deleteMutation.mutate(id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
