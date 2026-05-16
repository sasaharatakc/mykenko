'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { productApi } from '@/lib/api'
import type { Product } from '@/types'
import { ProductCard } from '@/components/product/ProductCard'
import { ArrowRight } from 'lucide-react'

export function NewArrivals() {
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ['products', 'new-arrivals'],
    queryFn: () => productApi.newArrivals().then((r) => r.data?.data ?? []),
    staleTime: 5 * 60_000,
  })

  return (
    <section className="py-14 bg-gray-50">
      <div className="container-narrow">
        <div className="flex items-center justify-between mb-7">
          <div>
            <span className="text-xs font-semibold text-primary-500 uppercase tracking-wider">Just In</span>
            <h2 className="section-title mt-1">New Arrivals</h2>
          </div>
          <Link href="/shop?sort=newest" className="flex items-center gap-1.5 text-sm font-medium text-primary-500 hover:gap-3 transition-all">
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
