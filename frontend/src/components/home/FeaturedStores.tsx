'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useQuery } from '@tanstack/react-query'
import { storeApi } from '@/lib/api'
import type { Store } from '@/types'
import { getImageUrl } from '@/lib/utils'
import { Star, Package, BadgeCheck, ArrowRight } from 'lucide-react'

export function FeaturedStores() {
  const { data, isLoading } = useQuery<{ data: Store[] }>({
    queryKey: ['stores', 'featured'],
    queryFn: () => storeApi.list({ per_page: 6 }).then((r) => r.data),
    staleTime: 5 * 60_000,
  })

  if (!data?.data?.length && !isLoading) return null

  return (
    <section className="py-14 bg-gray-50">
      <div className="container-narrow">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-xs font-semibold text-primary-500 uppercase tracking-wider">Our Sellers</span>
            <h2 className="section-title mt-1">Featured Vendors</h2>
          </div>
          <Link href="/stores" className="flex items-center gap-1.5 text-sm font-medium text-primary-500 hover:gap-3 transition-all">
            All Vendors <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {isLoading
            ? [...Array(6)].map((_, i) => (
                <div key={i} className="card p-4 flex flex-col items-center gap-3">
                  <div className="w-16 h-16 rounded-full skeleton" />
                  <div className="h-3 skeleton rounded w-2/3" />
                  <div className="h-3 skeleton rounded w-1/2" />
                </div>
              ))
            : data?.data?.map((store) => (
                <Link
                  key={store.id}
                  href={`/stores/${store.slug}`}
                  className="card p-5 flex flex-col items-center gap-3 hover:shadow-card-hover transition-shadow group text-center"
                >
                  <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-gray-100 group-hover:border-primary-300 transition-colors">
                    <Image
                      src={getImageUrl(store.logo, '/images/store-placeholder.svg')}
                      alt={store.name}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-center gap-1">
                      <p className="font-semibold text-sm text-gray-900 group-hover:text-primary-500 transition-colors line-clamp-1">
                        {store.name}
                      </p>
                      {store.is_verified && (
                        <BadgeCheck className="w-3.5 h-3.5 text-primary-500 flex-shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center justify-center gap-3 mt-1 text-xs text-gray-400">
                      <span className="flex items-center gap-0.5">
                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                        {store.rating.toFixed(1)}
                      </span>
                      <span className="flex items-center gap-0.5">
                        <Package className="w-3 h-3" />
                        {store.products_count ?? 0}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
        </div>
      </div>
    </section>
  )
}
