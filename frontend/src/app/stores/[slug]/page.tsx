'use client'

import Image from 'next/image'
import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { storeApi } from '@/lib/api'
import type { Store, Product, PaginatedResponse } from '@/types'
import { ProductCard } from '@/components/product/ProductCard'
import { Pagination } from '@/components/ui/Pagination'
import { StarRating } from '@/components/ui/StarRating'
import { getImageUrl } from '@/lib/utils'
import { BadgeCheck, Package, MapPin, Calendar } from 'lucide-react'
import { useState } from 'react'

export default function StoreDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const [page, setPage] = useState(1)

  const { data: store, isLoading: storeLoading } = useQuery<Store>({
    queryKey: ['store', slug],
    queryFn: () => storeApi.show(slug).then((r) => r.data?.data),
  })

  const { data: productsData, isLoading: productsLoading } = useQuery<PaginatedResponse<Product>>({
    queryKey: ['store-products', slug, page],
    queryFn: () => storeApi.products(slug, { page, per_page: 12 }).then((r) => r.data),
    enabled: !!slug,
  })

  if (storeLoading) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="h-48 skeleton" />
        <div className="container-narrow py-6">
          <div className="h-6 skeleton rounded w-1/3 mb-2" />
          <div className="h-4 skeleton rounded w-1/2" />
        </div>
      </div>
    )
  }

  if (!store) {
    return (
      <div className="flex flex-col items-center py-32 gap-4 text-center">
        <span className="text-6xl">🏪</span>
        <h2 className="font-display text-2xl font-semibold text-gray-900">Store not found</h2>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Store Banner */}
      <div className="relative h-48 sm:h-64 bg-gray-200 overflow-hidden">
        {store.cover_image ? (
          <Image
            src={getImageUrl(store.cover_image)}
            alt={store.name}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary-500 to-primary-700" />
        )}
      </div>

      {/* Store Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="container-narrow py-5">
          <div className="flex items-start gap-5 -mt-12 sm:-mt-14">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-4 border-white overflow-hidden bg-white shadow-card flex-shrink-0">
              {store.logo ? (
                <Image
                  src={getImageUrl(store.logo)}
                  alt={store.name}
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <Package className="w-8 h-8 text-gray-300" />
                </div>
              )}
            </div>

            <div className="flex-1 pt-14 sm:pt-16">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-display text-xl sm:text-2xl font-bold text-gray-900">{store.name}</h1>
                {store.is_verified && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-primary-500 bg-primary-50 px-2 py-0.5 rounded-full">
                    <BadgeCheck className="w-3.5 h-3.5" />
                    Verified
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 mt-2">
                {store.rating !== undefined && (
                  <StarRating rating={store.rating} count={store.rating_count} size="sm" />
                )}
                {store.products_count !== undefined && (
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Package className="w-3.5 h-3.5" />
                    {store.products_count} products
                  </span>
                )}
                {store.address && (
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {store.address}
                  </span>
                )}
              </div>

              {store.description && (
                <p className="text-sm text-gray-500 mt-2 max-w-2xl">{store.description}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="container-narrow py-8">
        <h2 className="font-display text-lg font-semibold text-gray-900 mb-5">Products</h2>

        {productsLoading ? (
          <div className="product-grid">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="card overflow-hidden">
                <div className="h-52 skeleton" />
                <div className="p-4 space-y-2">
                  <div className="h-4 skeleton rounded" />
                  <div className="h-3 skeleton rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : !productsData?.data?.length ? (
          <div className="flex flex-col items-center py-16 gap-3 text-center">
            <Package className="w-12 h-12 text-gray-200" />
            <p className="text-gray-500">No products available yet.</p>
          </div>
        ) : (
          <>
            <div className="product-grid">
              {productsData.data.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {productsData.meta && productsData.meta.last_page > 1 && (
              <div className="mt-8">
                <Pagination
                  currentPage={productsData.meta.current_page}
                  lastPage={productsData.meta.last_page}
                  onPageChange={setPage}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
