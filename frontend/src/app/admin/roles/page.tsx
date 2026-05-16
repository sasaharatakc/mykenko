'use client'

import { useState } from 'react'
import { Shield, Users, Settings, X } from 'lucide-react'
import toast from 'react-hot-toast'

type AccessLevel = 'all' | 'read' | 'none'

interface RolePermission {
  category: string
  access: AccessLevel
}

interface Role {
  id: string
  name: string
  description: string
  color: string
  userCount: number
  permissions: RolePermission[]
}

const PERMISSION_CATEGORIES = ['Eコマース', 'マーケットプレイス', 'コンテンツ', 'システム']

const INITIAL_ROLES: Role[] = [
  {
    id: 'super-admin',
    name: '超管理者',
    description: 'すべての機能にアクセス可能。システム設定の変更が可能',
    color: 'bg-purple-100 text-purple-700 border-purple-200',
    userCount: 1,
    permissions: PERMISSION_CATEGORIES.map((c) => ({ category: c, access: 'all' as AccessLevel })),
  },
  {
    id: 'admin',
    name: '管理者',
    description: '商品・注文・顧客管理など主要な管理機能にアクセス可能',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    userCount: 2,
    permissions: PERMISSION_CATEGORIES.map((c, i) => ({
      category: c,
      access: i < 3 ? ('all' as AccessLevel) : ('read' as AccessLevel),
    })),
  },
  {
    id: 'moderator',
    name: 'モデレーター',
    description: 'コンテンツのレビュー・承認を担当',
    color: 'bg-amber-100 text-amber-700 border-amber-200',
    userCount: 3,
    permissions: PERMISSION_CATEGORIES.map((c, i) => ({
      category: c,
      access: i === 2 ? ('all' as AccessLevel) : i === 0 ? ('read' as AccessLevel) : ('none' as AccessLevel),
    })),
  },
  {
    id: 'support',
    name: 'サポート',
    description: '顧客サポート・注文確認のみ対応可能',
    color: 'bg-gray-100 text-gray-600 border-gray-200',
    userCount: 5,
    permissions: PERMISSION_CATEGORIES.map((c, i) => ({
      category: c,
      access: i === 0 ? ('read' as AccessLevel) : ('none' as AccessLevel),
    })),
  },
]

const ACCESS_LABELS: Record<AccessLevel, { label: string; class: string }> = {
  all: { label: 'すべてのアクセス', class: 'bg-green-100 text-green-700' },
  read: { label: '読み取りのみ', class: 'bg-yellow-100 text-yellow-700' },
  none: { label: 'アクセスなし', class: 'bg-gray-100 text-gray-500' },
}

export default function AdminRolesPage() {
  const [roles, setRoles] = useState<Role[]>(INITIAL_ROLES)
  const [editingRole, setEditingRole] = useState<Role | null>(null)

  function savePermissions(roleId: string, permissions: RolePermission[]) {
    setRoles((prev) => prev.map((r) => r.id === roleId ? { ...r, permissions } : r))
    setEditingRole(null)
    toast.success('権限を保存しました')
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">ロール管理</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {roles.map((role) => (
          <div key={role.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-50 rounded-lg">
                  <Shield className="w-5 h-5 text-gray-500" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{role.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${role.color}`}>{role.name}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{role.description}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                {role.userCount}名
              </span>
              <span className="flex items-center gap-1.5">
                <Settings className="w-3.5 h-3.5" />
                {role.permissions.filter((p) => p.access !== 'none').length} カテゴリ
              </span>
            </div>

            <div className="space-y-2 mb-4">
              {role.permissions.map((perm) => (
                <div key={perm.category} className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">{perm.category}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ACCESS_LABELS[perm.access].class}`}>
                    {ACCESS_LABELS[perm.access].label}
                  </span>
                </div>
              ))}
            </div>

            {role.id !== 'super-admin' && (
              <button
                onClick={() => setEditingRole({ ...role })}
                className="w-full py-2 border border-gray-300 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                権限編集
              </button>
            )}
            {role.id === 'super-admin' && (
              <div className="py-2 text-center text-xs text-gray-400">
                超管理者の権限は変更できません
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Edit modal */}
      {editingRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">{editingRole.name} の権限編集</h2>
              <button onClick={() => setEditingRole(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-3">
              {editingRole.permissions.map((perm, idx) => (
                <div key={perm.category} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">{perm.category}</span>
                  <div className="flex gap-1">
                    {(['all', 'read', 'none'] as AccessLevel[]).map((level) => (
                      <button
                        key={level}
                        onClick={() => {
                          const newPerms = [...editingRole.permissions]
                          newPerms[idx] = { ...newPerms[idx], access: level }
                          setEditingRole({ ...editingRole, permissions: newPerms })
                        }}
                        className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                          perm.access === level
                            ? ACCESS_LABELS[level].class
                            : 'text-gray-400 hover:bg-gray-100'
                        }`}
                      >
                        {level === 'all' ? '全て' : level === 'read' ? '読取' : 'なし'}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-3 p-5 border-t border-gray-100">
              <button onClick={() => setEditingRole(null)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
                キャンセル
              </button>
              <button onClick={() => savePermissions(editingRole.id, editingRole.permissions)}
                className="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary-600">
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
