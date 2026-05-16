'use client'

import { useState } from 'react'
import { Plus, Edit2, Trash2, X, Shield } from 'lucide-react'
import toast from 'react-hot-toast'

type Role = '超管理者' | '管理者' | 'モデレーター' | 'サポート'

interface AdminUser {
  id: number
  name: string
  email: string
  role: Role
  lastLogin: string
  isActive: boolean
  isCurrentUser?: boolean
}

const ROLES: Role[] = ['超管理者', '管理者', 'モデレーター', 'サポート']

const ROLE_COLORS: Record<Role, string> = {
  '超管理者': 'bg-purple-100 text-purple-700',
  '管理者': 'bg-blue-100 text-blue-700',
  'モデレーター': 'bg-amber-100 text-amber-700',
  'サポート': 'bg-gray-100 text-gray-600',
}

const INITIAL_USERS: AdminUser[] = [
  { id: 1, name: '山田 太郎', email: 'admin@mykenko.jp', role: '超管理者', lastLogin: '2024-01-15 10:30', isActive: true, isCurrentUser: true },
  { id: 2, name: '佐藤 花子', email: 'editor@mykenko.jp', role: '管理者', lastLogin: '2024-01-14 15:20', isActive: true },
  { id: 3, name: '田中 健二', email: 'mod@mykenko.jp', role: 'モデレーター', lastLogin: '2024-01-12 09:00', isActive: true },
]

interface UserForm {
  name: string
  email: string
  password: string
  role: Role
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>(INITIAL_USERS)
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null)
  const [form, setForm] = useState<UserForm>({ name: '', email: '', password: '', role: '管理者' })

  function openCreate() {
    setEditingUser(null)
    setForm({ name: '', email: '', password: '', role: '管理者' })
    setShowModal(true)
  }

  function openEdit(user: AdminUser) {
    setEditingUser(user)
    setForm({ name: user.name, email: user.email, password: '', role: user.role })
    setShowModal(true)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (editingUser) {
      setUsers((prev) => prev.map((u) => u.id === editingUser.id ? { ...u, ...form } : u))
      toast.success('ユーザーを更新しました')
    } else {
      setUsers((prev) => [...prev, {
        id: Date.now(),
        ...form,
        lastLogin: '—',
        isActive: true,
      }])
      toast.success('管理ユーザーを追加しました')
    }
    setShowModal(false)
  }

  function deleteUser(id: number) {
    if (!confirm('このユーザーを削除しますか？')) return
    setUsers((prev) => prev.filter((u) => u.id !== id))
    toast.success('削除しました')
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">管理ユーザー</h1>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 text-sm"
        >
          <Plus className="w-4 h-4" />
          管理ユーザー追加
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['ユーザー名', 'ロール', '最終ログイン', 'ステータス', 'アクション'].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary text-xs font-bold">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">{user.name}</span>
                          {user.isCurrentUser && (
                            <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">あなた</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${ROLE_COLORS[user.role]}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-400 text-xs">{user.lastLogin}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {user.isActive ? '有効' : '無効'}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(user)} className="w-7 h-7 flex items-center justify-center rounded text-gray-400 hover:text-primary hover:bg-primary-50">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      {!user.isCurrentUser && (
                        <button onClick={() => deleteUser(user.id)} className="w-7 h-7 flex items-center justify-center rounded text-gray-400 hover:text-red-500 hover:bg-red-50">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                <h2 className="font-semibold text-gray-900">{editingUser ? 'ユーザー編集' : '管理ユーザー追加'}</h2>
              </div>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">名前 <span className="text-red-500">*</span></label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">メールアドレス <span className="text-red-500">*</span></label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  パスワード {!editingUser && <span className="text-red-500">*</span>}
                  {editingUser && <span className="text-gray-400 text-xs ml-1">（空白の場合は変更しない）</span>}
                </label>
                <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required={!editingUser} minLength={8}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ロール</label>
                <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as Role })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary">
                  {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
                  キャンセル
                </button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary-600">
                  {editingUser ? '更新' : '追加'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
