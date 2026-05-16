'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { productApi } from '@/lib/api'
import type { Product } from '@/types'
import { ProductCard } from '@/components/product/ProductCard'
import { ArrowRight, TrendingUp } from 'lucide-react'

export function BestSellers() {
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ['products', 'best-sellers'],
    queryFn: () => productApi.bestSellers().then((r) => r.data?.data ?? []),
    staleTime: 5 * 60_000,
  })

  return (
    <section className="py-14">
      <div className="container-narrow">
        <div className="flex items-center justify-between mb-7">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary-500" />
            </div>
            <div>
              <span className="text-xs font-semibold text-primary-500 uppercase tracking-wider">Trending</span>
              <h2 className="section-title mt-0.5">Best Sellers</h2>
            </div>
          </div>
          <Link href="/shop?sort=best_selling" className="flex items-center gap-1.5 text-sm font-medium text-primary-500 hover:gap-3 transition-all">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="product-grid">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="card">
                <div className="aspect-square skeleton rounded-t-xl" />
                <div className="p-4 space-y-2">
                  <div className="h-3 skeleton rounded w-3/4" />
                  <div className="h-4 skeleton rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="product-grid">
            {products?.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
