'use client'

import { useState } from 'react'
import { Save } from 'lucide-react'
import toast from 'react-hot-toast'

type Role = '超管理者' | '管理者' | 'モデレーター' | 'サポート'

interface Permission {
  id: string
  label: string
  module: string
}

const ROLES: Role[] = ['超管理者', '管理者', 'モデレーター', 'サポート']

const PERMISSIONS: Permission[] = [
  { id: 'products.view', label: '商品を見る', module: '商品管理' },
  { id: 'products.create', label: '商品を作成', module: '商品管理' },
  { id: 'products.edit', label: '商品を編集', module: '商品管理' },
  { id: 'products.delete', label: '商品を削除', module: '商品管理' },
  { id: 'orders.view', label: '注文を見る', module: '注文管理' },
  { id: 'orders.update', label: '注文を更新', module: '注文管理' },
  { id: 'orders.refund', label: '返金処理', module: '注文管理' },
  { id: 'customers.view', label: '顧客を見る', module: '顧客管理' },
  { id: 'customers.edit', label: '顧客を編集', module: '顧客管理' },
  { id: 'customers.delete', label: '顧客を削除', module: '顧客管理' },
  { id: 'vendors.view', label: 'ベンダーを見る', module: 'ベンダー管理' },
  { id: 'vendors.approve', label: 'ベンダーを承認', module: 'ベンダー管理' },
  { id: 'vendors.edit', label: 'ベンダーを編集', module: 'ベンダー管理' },
  { id: 'content.blog', label: 'ブログ管理', module: 'コンテンツ' },
  { id: 'content.faq', label: 'FAQ管理', module: 'コンテンツ' },
  { id: 'content.media', label: 'メディア管理', module: 'コンテンツ' },
  { id: 'settings.view', label: '設定を見る', module: '設定' },
  { id: 'settings.edit', label: '設定を変更', module: '設定' },
  { id: 'users.manage', label: 'ユーザー管理', module: '設定' },
]

type PermissionMatrix = Record<string, Record<Role, boolean>>

function buildInitialMatrix(): PermissionMatrix {
  const matrix: PermissionMatrix = {}
  PERMISSIONS.forEach((p) => {
    matrix[p.id] = {
      '超管理者': true,
      '管理者': !['settings.edit', 'users.manage', 'customers.delete'].includes(p.id),
      'モデレーター': ['products.view', 'orders.view', 'customers.view', 'vendors.view', 'content.blog', 'content.faq', 'content.media'].includes(p.id),
      'サポート': ['orders.view', 'customers.view'].includes(p.id),
    }
  })
  return matrix
}

export default function AdminPermissionsPage() {
  const [matrix, setMatrix] = useState<PermissionMatrix>(buildInitialMatrix())
  const [saving, setSaving] = useState(false)

  function toggle(permId: string, role: Role) {
    if (role === '超管理者') return // super admin always has all
    setMatrix((prev) => ({
      ...prev,
      [permId]: {
        ...prev[permId],
        [role]: !prev[permId][role],
      },
    }))
  }

  async function handleSave() {
    setSaving(true)
    await new Promise((r) => setTimeout(r, 800))
    setSaving(false)
    toast.success('権限マトリクスを保存しました')
  }

  const modules = [...new Set(PERMISSIONS.map((p) => p.module))]

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">権限マトリクス</h1>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 disabled:opacity-60 text-sm">
          <Save className="w-4 h-4" />
          {saving ? '保存中...' : '保存'}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">権限</th>
                {ROLES.map((role) => (
                  <th key={role} className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">
                    {role}
                    {role === '超管理者' && <p className="text-gray-400 text-xs font-normal normal-case">（固定）</p>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {modules.map((module) => (
                <>
                  <tr key={`module-${module}`} className="bg-gray-50">
                    <td colSpan={5} className="px-5 py-2 text-xs font-bold text-gray-600 uppercase tracking-wider">
                      {module}
                    </td>
                  </tr>
                  {PERMISSIONS.filter((p) => p.module === module).map((perm) => (
                    <tr key={perm.id} className="border-t border-gray-50 hover:bg-gray-50/50">
                      <td className="px-5 py-3 text-gray-700">{perm.label}</td>
                      {ROLES.map((role) => (
                        <td key={role} className="px-4 py-3 text-center">
                          <input
                            type="checkbox"
                            checked={matrix[perm.id]?.[role] ?? false}
                            onChange={() => toggle(perm.id, role)}
                            disabled={role === '超管理者'}
                            className="w-4 h-4 accent-primary cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
