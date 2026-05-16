'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { Mail, X, Archive, Eye, Inbox } from 'lucide-react'
import toast from 'react-hot-toast'

type ContactStatus = '未読' | '既読' | '返信済み'

interface Contact {
  id: number
  subject: string
  name: string
  email: string
  message: string
  status: ContactStatus
  created_at: string
}

export default function AdminContactFormsPage() {
  const queryClient = useQueryClient()
  const [selected, setSelected] = useState<Contact | null>(null)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-contacts'],
    queryFn: () => apiClient.get('/admin/contacts').then((r: any) => r.data),
    retry: false,
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: ContactStatus }) =>
      apiClient.put(`/admin/contacts/${id}`, { status }),
    onSuccess: () => {
      toast.success('ステータスを更新しました')
      queryClient.invalidateQueries({ queryKey: ['admin-contacts'] })
    },
  })

  const contacts: Contact[] = data?.data ?? []
  const isEmpty = !isLoading && (isError || contacts.length === 0)

  const statusBadge = (status: ContactStatus) => {
    switch (status) {
      case '未読': return 'bg-red-100 text-red-700'
      case '既読': return 'bg-gray-100 text-gray-600'
      case '返信済み': return 'bg-green-100 text-green-700'
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">お問い合わせ</h1>
        {contacts.length > 0 && (
          <span className="text-sm text-gray-500">{contacts.filter(c => c.status === '未読').length}件の未読</span>
        )}
      </div>

      {isLoading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-14 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      ) : isEmpty ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-16 text-center">
          <Inbox className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium mb-2">お問い合わせがありません</p>
          <p className="text-gray-400 text-sm">新しいお問い合わせが届くとここに表示されます</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['件名', '差出人', 'メール', '日時', 'ステータス', 'アクション'].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {contacts.map((contact) => (
                  <tr
                    key={contact.id}
                    className={`hover:bg-gray-50 cursor-pointer ${contact.status === '未読' ? 'font-medium' : ''}`}
                    onClick={() => setSelected(contact)}
                  >
                    <td className="px-5 py-3 text-gray-900">{contact.subject}</td>
                    <td className="px-5 py-3 text-gray-700">{contact.name}</td>
                    <td className="px-5 py-3 text-gray-500">{contact.email}</td>
                    <td className="px-5 py-3 text-gray-400 text-xs">{contact.created_at}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadge(contact.status)}`}>
                        {contact.status}
                      </span>
                    </td>
                    <td className="px-5 py-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setSelected(contact)}
                          className="w-7 h-7 flex items-center justify-center rounded text-gray-400 hover:text-blue-500 hover:bg-blue-50"
                          title="開く"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => updateMutation.mutate({ id: contact.id, status: '既読' })}
                          className="w-7 h-7 flex items-center justify-center rounded text-gray-400 hover:text-primary hover:bg-primary-50"
                          title="既読にする"
                        >
                          <Mail className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => updateMutation.mutate({ id: contact.id, status: '返信済み' })}
                          className="w-7 h-7 flex items-center justify-center rounded text-gray-400 hover:text-orange-500 hover:bg-orange-50"
                          title="アーカイブ"
                        >
                          <Archive className="w-3.5 h-3.5" />
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

      {/* Slide-out panel */}
      {selected && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/40" onClick={() => setSelected(null)} />
          <div className="w-full max-w-lg bg-white shadow-xl flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900 truncate">{selected.subject}</h2>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 ml-4 shrink-0">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400 text-xs mb-1">差出人</p>
                  <p className="font-medium text-gray-900">{selected.name}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-1">メール</p>
                  <p className="text-gray-700">{selected.email}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-1">受信日時</p>
                  <p className="text-gray-700">{selected.created_at}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-1">ステータス</p>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge(selected.status)}`}>
                    {selected.status}
                  </span>
                </div>
              </div>
              <div className="border-t border-gray-100 pt-4">
                <p className="text-gray-400 text-xs mb-2">メッセージ</p>
                <p className="text-gray-800 text-sm whitespace-pre-wrap leading-relaxed">{selected.message}</p>
              </div>
            </div>
            <div className="p-5 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => { updateMutation.mutate({ id: selected.id, status: '既読' }); setSelected(null) }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
              >
                既読にする
              </button>
              <button
                onClick={() => { updateMutation.mutate({ id: selected.id, status: '返信済み' }); setSelected(null) }}
                className="flex-1 px-3 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary-600"
              >
                返信済みにする
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
