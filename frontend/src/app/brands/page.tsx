'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { brandApi } from '@/lib/api'
import Link from 'next/link'
import { Award, Search, Package } from 'lucide-react'

interface Brand {
  id: number
  name: string
  slug: string
  logo: string | null
  description: string | null
  website: string | null
  products_count?: number
}

export default function BrandsPage() {
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['brands'],
    queryFn: () => brandApi.list({ per_page: 100 }).then(r => r.data?.data ?? r.data),
  })

  const brands: Brand[] = Array.isArray(data) ? data : []

  const filtered = brands.filter(b =>
    b.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="container py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">ブランド一覧</h1>
        <p className="text-gray-500 mt-1">取り扱いブランドをご確認ください</p>
      </div>

      {/* Search */}
      <div className="relative max-w-sm mb-8">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="ブランドを検索..."
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-2xl h-36 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center text-gray-400">
          <Award className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>{search ? '該当するブランドが見つかりませんでした。' : 'ブランドがまだ登録されていません。'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map((brand) => (
            <Link
              key={brand.id}
              href={`/brands/${brand.slug}`}
              className="group bg-white border border-gray-200 rounded-2xl p-5 flex flex-col items-center gap-3 hover:border-primary/40 hover:shadow-md transition-all"
            >
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0">
                {brand.logo ? (
                  <img
                    src={brand.logo}
                    alt={brand.name}
                    className="w-full h-full object-contain p-1"
                  />
                ) : (
                  <Award className="w-7 h-7 text-gray-300" />
                )}
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-gray-900 group-hover:text-primary transition-colors line-clamp-1">
                  {brand.name}
                </p>
                {brand.products_count !== undefined && (
                  <p className="text-xs text-gray-400 mt-0.5 flex items-center justify-center gap-1">
                    <Package className="w-3 h-3" />
                    {brand.products_count}商品
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
