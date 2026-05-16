'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { productApi } from '@/lib/api'
import { ProductCard } from '@/components/product/ProductCard'
import { Pagination } from '@/components/ui/Pagination'
import { Search } from 'lucide-react'
import type { Product } from '@/types'

export default function SearchContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const q = searchParams.get('q') ?? ''
  const page = Number(searchParams.get('page') ?? 1)

  const { data, isLoading } = useQuery({
    queryKey: ['search', q, page],
    queryFn: () => productApi.list({ search: q, page, per_page: 20 }).then((r) => r.data),
    enabled: q.length > 0,
  })

  const products: Product[] = data?.data ?? []
  const meta = data?.meta

  return (
    <div className="container-narrow py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold text-gray-900">
          {q ? `Search results for "${q}"` : 'Search Products'}
        </h1>
        {meta && q && (
          <p className="mt-1 text-gray-500">{meta.total} products found</p>
        )}
      </div>

      {!q && (
        <div className="flex flex-col items-center py-20 text-gray-400">
          <Search className="w-16 h-16 mb-4 opacity-30" />
          <p className="text-lg">Enter a search term to find products</p>
        </div>
      )}

      {q && isLoading && (
        <div className="product-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-xl aspect-[3/4] animate-pulse" />
          ))}
        </div>
      )}

      {q && !isLoading && products.length === 0 && (
        <div className="flex flex-col items-center py-20 text-gray-400">
          <Search className="w-16 h-16 mb-4 opacity-30" />
          <p className="text-lg font-medium text-gray-600">No products found</p>
          <p className="text-sm mt-1">Try different keywords or browse our shop</p>
        </div>
      )}

      {products.length > 0 && (
        <>
          <div className="product-grid">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {meta && meta.last_page > 1 && (
            <div className="mt-10 flex justify-center">
              <Pagination
                currentPage={meta.current_page}
                lastPage={meta.last_page}
                onPageChange={(p) => {
                  const params = new URLSearchParams(searchParams.toString())
                  params.set('page', String(p))
                  router.push(`?${params.toString()}`)
                }}
              />
            </div>
          )}
        </>
      )}
    </div>
  )
}
