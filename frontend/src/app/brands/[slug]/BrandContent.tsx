'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { brandApi, productApi } from '@/lib/api'
import { ProductCard } from '@/components/product/ProductCard'
import { Pagination } from '@/components/ui/Pagination'
import { Award, Globe, Package } from 'lucide-react'
import Link from 'next/link'
import type { Product, PaginatedResponse } from '@/types'

interface Props { slug: string }

export default function BrandContent({ slug }: Props) {
  const [page, setPage] = useState(1)

  const { data: brand, isLoading: brandLoading } = useQuery({
    queryKey: ['brand', slug],
    queryFn: () => brandApi.show(slug).then(r => r.data),
  })

  const { data: productsData, isLoading: productsLoading } = useQuery<PaginatedResponse<Product>>({
    queryKey: ['brand-products', slug, page],
    queryFn: () => productApi.list({ brand_slug: slug, page, per_page: 20 }).then(r => r.data),
    enabled: !!brand,
  })

  if (brandLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!brand) {
    return (
      <div className="container py-20 text-center">
        <p className="text-gray-500">ブランドが見つかりませんでした。</p>
        <Link href="/shop" className="mt-4 inline-block text-primary hover:underline">ショップに戻る</Link>
      </div>
    )
  }

  const products = productsData?.data ?? []
  const meta = productsData?.meta

  return (
    <div>
      {/* Brand Hero */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-b border-gray-200">
        <div className="container py-12">
          <div className="flex items-center gap-6">
            {brand.logo ? (
              <img
                src={brand.logo}
                alt={brand.name}
                className="w-24 h-24 rounded-2xl object-contain bg-white border border-gray-200 shadow-sm p-3"
              />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Award className="w-10 h-10 text-primary" />
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{brand.name}</h1>
              {brand.description && (
                <p className="text-gray-500 mt-1 max-w-lg">{brand.description}</p>
              )}
              <div className="flex items-center gap-4 mt-3">
                {brand.website && (
                  <a
                    href={brand.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm text-primary hover:underline"
                  >
                    <Globe className="w-3.5 h-3.5" /> 公式サイト
                  </a>
                )}
                <span className="flex items-center gap-1.5 text-sm text-gray-500">
                  <Package className="w-3.5 h-3.5" />
                  {brand.products_count ?? products.length} 商品
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="container py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            {brand.name} の商品
            {meta && <span className="text-gray-400 font-normal text-base ml-2">({meta.total}件)</span>}
          </h2>
        </div>

        {productsLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-2xl aspect-square animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="py-20 text-center text-gray-400">
            <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>このブランドの商品はまだありません。</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {products.map((product: Product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            {meta && meta.last_page > 1 && (
              <div className="mt-8">
                <Pagination
                  currentPage={meta.current_page}
                  lastPage={meta.last_page}
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
