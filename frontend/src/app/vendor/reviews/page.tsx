'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { vendorApi } from '@/lib/api'
import { formatDate } from '@/lib/utils'
import { Star, MessageSquare, Send } from 'lucide-react'
import toast from 'react-hot-toast'

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(s => (
        <Star key={s} className={`w-3.5 h-3.5 ${s <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
      ))}
    </div>
  )
}

export default function VendorReviewsPage() {
  const qc = useQueryClient()
  const [filter, setFilter] = useState('all')
  const [replyId, setReplyId] = useState<number | null>(null)
  const [replyText, setReplyText] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['vendor-reviews'],
    queryFn: () => vendorApi.reviews().then(r => (r.data as any)?.data ?? []).catch(() => []),
  })

  const replyMutation = useMutation({
    mutationFn: ({ id, reply }: { id: number; reply: string }) => vendorApi.replyReview(id, reply),
    onSuccess: () => { toast.success('返信を送信しました'); qc.invalidateQueries({ queryKey: ['vendor-reviews'] }); setReplyId(null); setReplyText('') },
    onError: () => toast.error('返信に失敗しました'),
  })

  const allReviews: any[] = data ?? []
  const filtered = allReviews.filter((r: any) => {
    if (filter === 'unreplied') return !r.vendor_reply
    if (filter === 'low') return r.rating <= 2
    return true
  })

  const avgRating = allReviews.length > 0
    ? allReviews.reduce((s: number, r: any) => s + (r.rating ?? 0), 0) / allReviews.length
    : 0
  const replied = allReviews.filter((r: any) => r.vendor_reply).length
  const replyRate = allReviews.length > 0 ? Math.round((replied / allReviews.length) * 100) : 0

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">顧客レビュー</h1>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
          <p className="text-3xl font-bold text-gray-900">{avgRating.toFixed(1)}</p>
          <StarRating rating={Math.round(avgRating)} />
          <p className="text-xs text-gray-500 mt-1">平均評価</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
          <p className="text-3xl font-bold text-gray-900">{allReviews.length}</p>
          <p className="text-xs text-gray-500 mt-1">総レビュー数</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
          <p className="text-3xl font-bold text-gray-900">{replyRate}%</p>
          <p className="text-xs text-gray-500 mt-1">返信率</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {[['all', '全て'], ['unreplied', '未返信'], ['low', '低評価']].map(([v, l]) => (
          <button key={v} onClick={() => setFilter(v)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${filter === v ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>{l}</button>
        ))}
      </div>

      {/* Reviews */}
      {isLoading ? (
        <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-32 bg-white rounded-xl border border-gray-200 animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
          <MessageSquare className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">レビューはありません</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((r: any) => (
            <div key={r.id} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
                      {r.customer?.name?.[0] ?? 'U'}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{r.customer?.name ?? '匿名'}</p>
                      <p className="text-xs text-gray-400">{formatDate(r.created_at)}</p>
                    </div>
                    <StarRating rating={r.rating ?? 5} />
                  </div>
                  <p className="text-sm text-gray-700 mb-1">{r.product?.name && <span className="text-xs text-gray-400 mr-2">商品: {r.product.name}</span>}</p>
                  <p className="text-sm text-gray-700">{r.comment ?? r.review ?? '—'}</p>

                  {r.vendor_reply && (
                    <div className="mt-3 pl-4 border-l-2 border-primary-200 bg-primary-50 rounded-r-lg p-3">
                      <p className="text-xs font-medium text-primary-600 mb-1">ショップからの返信</p>
                      <p className="text-sm text-gray-700">{r.vendor_reply}</p>
                    </div>
                  )}

                  {replyId === r.id ? (
                    <div className="mt-3 space-y-2">
                      <textarea
                        value={replyText}
                        onChange={e => setReplyText(e.target.value)}
                        rows={3}
                        placeholder="返信内容を入力してください…"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                      />
                      <div className="flex gap-2">
                        <button onClick={() => setReplyId(null)} className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">キャンセル</button>
                        <button
                          disabled={!replyText.trim() || replyMutation.isPending}
                          onClick={() => replyMutation.mutate({ id: r.id, reply: replyText })}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 disabled:opacity-50">
                          <Send className="w-3.5 h-3.5" /> 送信
                        </button>
                      </div>
                    </div>
                  ) : (
                    !r.vendor_reply && (
                      <button onClick={() => setReplyId(r.id)} className="mt-3 text-xs text-primary-600 hover:text-primary-700 font-medium">
                        + 返信する
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
