'use client'

import { useQuery } from '@tanstack/react-query'
import { vendorApi } from '@/lib/api'
import { Star, TrendingUp } from 'lucide-react'

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(s => (
        <Star key={s} className={`w-4 h-4 ${s <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
      ))}
    </div>
  )
}

export default function ReviewAnalyticsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['vendor-reviews-analytics'],
    queryFn: () => vendorApi.reviews().then(r => (r.data as any)?.data ?? []).catch(() => []),
  })

  const reviews: any[] = data ?? []
  const avg = reviews.length > 0 ? reviews.reduce((s: number, r: any) => s + (r.rating ?? 0), 0) / reviews.length : 0

  const dist = [5,4,3,2,1].map(star => ({
    star,
    count: reviews.filter((r: any) => r.rating === star).length,
    pct: reviews.length > 0 ? Math.round((reviews.filter((r: any) => r.rating === star).length / reviews.length) * 100) : 0,
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <TrendingUp className="w-6 h-6 text-primary-500" />
        <h1 className="text-2xl font-bold text-gray-900">レビュー分析</h1>
      </div>

      {isLoading ? (
        <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-32 bg-white rounded-xl border border-gray-200 animate-pulse" />)}</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Overall */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">総合評価</h2>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-6xl font-bold text-gray-900">{avg.toFixed(1)}</p>
                <StarRating rating={Math.round(avg)} />
                <p className="text-sm text-gray-500 mt-1">{reviews.length}件のレビュー</p>
              </div>
              <div className="flex-1 space-y-2">
                {dist.map(({ star, count, pct }) => (
                  <div key={star} className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 w-4">{star}</span>
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div className="h-full bg-yellow-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs text-gray-500 w-8 text-right">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-2 gap-4 content-start">
            {[
              { label: '5★ レビュー', value: dist[0].count, sub: `${dist[0].pct}%`, color: 'text-green-600' },
              { label: '4★ レビュー', value: dist[1].count, sub: `${dist[1].pct}%`, color: 'text-green-500' },
              { label: '低評価（1-2★）', value: dist[3].count + dist[4].count, sub: `${dist[3].pct + dist[4].pct}%`, color: 'text-red-500' },
              { label: '返信済み', value: reviews.filter((r: any) => r.vendor_reply).length, sub: `${reviews.length > 0 ? Math.round(reviews.filter((r: any) => r.vendor_reply).length / reviews.length * 100) : 0}%`, color: 'text-blue-600' },
            ].map(({ label, value, sub, color }) => (
              <div key={label} className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-xs text-gray-500">{label}</p>
                <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
                <p className="text-xs text-gray-400">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
