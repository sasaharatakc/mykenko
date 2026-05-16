'use client'

import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useState, useCallback } from 'react'
import { productApi, categoryApi, brandApi } from '@/lib/api'
import type { Product, ProductCategory, Brand, PaginatedResponse } from '@/types'
import { ProductCard } from '@/components/product/ProductCard'
import { ProductFilter } from '@/components/product/ProductFilter'
import { ProductSortBar } from '@/components/product/ProductSortBar'
import { Pagination } from '@/components/ui/Pagination'
import { SlidersHorizontal, X, LayoutGrid, List } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ShopContentProps {
  searchParams: Record<string, string | undefined>
}

export function ShopContent({ searchParams }: ShopContentProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [filterOpen, setFilterOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const params = new URLSearchParams(
    Object.entries(searchParams).filter(([, v]) => v !== undefined) as [string, string][]
  )

  const { data, isLoading, isFetching } = useQuery<PaginatedResponse<Product>>({
    queryKey: ['products', 'shop', searchParams],
    queryFn: () => productApi.list(Object.fromEntries(params)).then((r) => r.data),
    placeholderData: keepPreviousData,
  })

  const { data: categories } = useQuery<ProductCategory[]>({
    queryKey: ['categories', 'tree'],
    queryFn: () => categoryApi.tree().then((r) => r.data?.data ?? []),
    staleTime: 10 * 60_000,
  })

  const { data: brands } = useQuery<Brand[]>({
    queryKey: ['brands'],
    queryFn: () => brandApi.list().then((r) => r.data),
    staleTime: 10 * 60_000,
  })

  const updateParam = useCallback(
    (key: string, value: string | null) => {
      const next = new URLSearchParams(params)
      if (value) next.set(key, value)
      else next.delete(key)
      next.delete('page')
      router.push(`${pathname}?${next.toString()}`)
    },
    [params, pathname, router]
  )

  const activeFilters = [
    searchParams.category && { key: 'category', label: `Category: ${searchParams.category}` },
    searchParams.search && { key: 'search', label: `Search: ${searchParams.search}` },
    searchParams.brands && { key: 'brands', label: `Brands: ${searchParams.brands}` },
    (searchParams.min_price || searchParams.max_price) && {
      key: 'price',
      label: `Price: $${searchParams.min_price ?? 0} - $${searchParams.max_price ?? '∞'}`,
    },
  ].filter(Boolean) as { key: string; label: string }[]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="container-narrow py-4 flex items-center gap-2 text-sm text-gray-500">
          <a href="/" className="hover:text-primary-500 transition-colors">Home</a>
          <span>/</span>
          <span className="text-gray-900 font-medium">Shop</span>
          {searchParams.category && (
            <>
              <span>/</span>
              <span className="text-gray-900 font-medium capitalize">{searchParams.category.replace(/-/g, ' ')}</span>
            </>
          )}
        </div>
      </div>

      <div className="container-narrow py-6">
        <div className="flex gap-6">
          {/* Filter Sidebar */}
          <aside className={cn(
            'w-64 flex-shrink-0 hidden lg:block',
            filterOpen && 'fixed inset-0 z-40 bg-white p-6 overflow-y-auto lg:static lg:bg-transparent lg:z-auto'
          )}>
            {filterOpen && (
              <button onClick={() => setFilterOpen(false)} className="lg:hidden absolute top-4 right-4 btn-icon w-8 h-8">
                <X className="w-4 h-4" />
              </button>
            )}
            <ProductFilter
              categories={categories ?? []}
              brands={brands ?? []}
              searchParams={searchParams}
              onUpdate={updateParam}
            />
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Sort bar */}
            <ProductSortBar
              total={data?.meta?.total ?? 0}
              sort={searchParams.sort ?? 'newest'}
              viewMode={viewMode}
              onSortChange={(v) => updateParam('sort', v)}
              onViewModeChange={setViewMode}
              onFilterOpen={() => setFilterOpen(true)}
            />

            {/* Active filters */}
            {activeFilters.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {activeFilters.map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => {
                      if (key === 'price') {
                        updateParam('min_price', null)
                        updateParam('max_price', null)
                      } else {
                        updateParam(key, null)
                      }
                    }}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-medium hover:bg-primary-100 transition-colors"
                  >
                    {label}
                    <X className="w-3 h-3" />
                  </button>
                ))}
                <button
                  onClick={() => router.push(pathname)}
                  className="text-xs text-gray-400 hover:text-danger transition-colors"
                >
                  Clear all
                </button>
              </div>
            )}

            {/* Products */}
            <div className={cn('mt-5', isFetching && 'opacity-70 pointer-events-none transition-opacity')}>
              {isLoading ? (
                <div className={cn(viewMode === 'grid' ? 'product-grid' : 'space-y-4')}>
                  {[...Array(12)].map((_, i) => (
                    <div key={i} className="card overflow-hidden">
                      <div className="aspect-square skeleton" />
                      <div className="p-4 space-y-2">
                        <div className="h-3 skeleton rounded w-3/4" />
                        <div className="h-4 skeleton rounded w-1/3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : !data?.data?.length ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="font-display text-xl font-semibold text-gray-900 mb-2">No products found</h3>
                  <p className="text-gray-500 text-sm mb-6">Try adjusting your filters or search terms.</p>
                  <button onClick={() => router.push(pathname)} className="btn-primary">
                    Clear Filters
                  </button>
                </div>
              ) : (
                <>
                  <div className={cn(viewMode === 'grid' ? 'product-grid' : 'space-y-4')}>
                    {data.data.map((product) => (
                      <ProductCard key={product.id} product={product} variant={viewMode === 'list' ? 'list' : 'default'} />
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
        </div>
      </div>
    </div>
  )
}
