'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { storeApi } from '@/lib/api'
import type { Store, PaginatedResponse } from '@/types'
import { Pagination } from '@/components/ui/Pagination'
import { StarRating } from '@/components/ui/StarRating'
import { getImageUrl } from '@/lib/utils'
import { BadgeCheck, Search, Package } from 'lucide-react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function StoresContent() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const params = {
    search: searchParams.get('search') ?? undefined,
    page: searchParams.get('page') ?? undefined,
  }

  const { data, isLoading } = useQuery<PaginatedResponse<Store>>({
    queryKey: ['stores', params],
    queryFn: () => storeApi.list({ ...params, per_page: 12 }).then((r) => r.data),
  })

  const updateParam = (key: string, value: string | null) => {
    const p = new URLSearchParams(searchParams.toString())
    if (value) p.set(key, value)
    else p.delete(key)
    p.delete('page')
    router.push(`${pathname}?${p.toString()}`)
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white border-b border-gray-100">
        <div className="container-narrow py-10 text-center">
          <h1 className="font-display text-3xl font-bold text-gray-900">Our Vendors</h1>
          <p className="text-gray-500 mt-2">Shop from verified sellers and discover unique stores</p>
          <div className="relative max-w-md mx-auto mt-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              defaultValue={params.search}
              placeholder="Search vendors…"
              className="input pl-10 py-3"
              onChange={(e) => {
                const v = e.target.value
                const t = setTimeout(() => updateParam('search', v || null), 400)
                return () => clearTimeout(t)
              }}
            />
          </div>
        </div>
      </div>

      <div className="container-narrow py-8">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="card p-5">
                <div className="flex gap-4">
                  <div className="w-16 h-16 rounded-xl skeleton flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 skeleton rounded w-3/4" />
                    <div className="h-3 skeleton rounded w-1/2" />
                    <div className="h-3 skeleton rounded w-2/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : !data?.data?.length ? (
          <div className="flex flex-col items-center py-20 gap-4 text-center">
            <span className="text-6xl">🏪</span>
            <h3 className="font-display text-xl font-semibold text-gray-900">No vendors found</h3>
            <button onClick={() => router.push(pathname)} className="btn-primary">Clear Search</button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.data.map((store) => (
                <Link
                  key={store.id}
                  href={`/stores/${store.slug}`}
                  className="card p-5 hover:shadow-card-hover transition-shadow group"
                >
                  <div className="flex gap-4">
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                      {store.logo ? (
                        <Image
                          src={getImageUrl(store.logo)}
                          alt={store.name}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-6 h-6 text-gray-300" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-semibold text-gray-900 group-hover:text-primary-500 transition-colors truncate">
                          {store.name}
                        </h3>
                        {store.is_verified && (
                          <BadgeCheck className="w-4 h-4 text-primary-500 flex-shrink-0" />
                        )}
                      </div>
                      {store.rating !== undefined && (
                        <div className="mt-1">
                          <StarRating rating={store.rating} count={store.rating_count} size="sm" />
                        </div>
                      )}
                      {store.products_count !== undefined && (
                        <p className="text-xs text-gray-400 mt-1.5">{store.products_count} products</p>
                      )}
                      {store.description && (
                        <p className="text-xs text-gray-500 mt-1.5 line-clamp-2">{store.description}</p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {data.meta && data.meta.last_page > 1 && (
              <div className="mt-8">
                <Pagination
                  currentPage={data.meta.current_page}
                  lastPage={data.meta.last_page}
                  onPageChange={(p) => updateParam('page', String(p))}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default function StoresPage() {
  return (
    <Suspense>
      <StoresContent />
    </Suspense>
  )
}
