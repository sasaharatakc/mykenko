'use client'

import { useQuery } from '@tanstack/react-query'
import { flashSaleApi } from '@/lib/api'
import type { FlashSale, Product } from '@/types'
import { ProductCard } from '@/components/product/ProductCard'
import { CountdownTimer } from '@/components/ui/CountdownTimer'
import { Zap, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export function FlashSaleSection() {
  const { data: response, isLoading } = useQuery<{ data: FlashSale | null }>({
    queryKey: ['flash-sale', 'active'],
    queryFn: () => flashSaleApi.active().then((r) => r.data),
    refetchInterval: 60_000,
  })

  const sale = response?.data

  if (!sale && !isLoading) return null

  return (
    <section className="py-14 bg-gray-900">
      <div className="container-narrow">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-danger/20 flex items-center justify-center">
              <Zap className="w-5 h-5 text-danger" />
            </div>
            <div>
              <h2 className="section-title text-white">{sale?.name ?? 'Flash Sale'}</h2>
              <p className="text-gray-400 text-sm">Hurry up! Deals end soon.</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {sale?.ends_at && (
              <CountdownTimer endDate={sale.ends_at} label="Ends in:" className="text-white" />
            )}
            <Link href="/shop?sale=1" className="flex items-center gap-1.5 text-sm font-medium text-primary-400 hover:gap-3 transition-all whitespace-nowrap">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="card bg-gray-800 overflow-hidden border-gray-700">
                <div className="aspect-square bg-gray-700 animate-pulse" />
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-gray-700 animate-pulse rounded" />
                  <div className="h-4 bg-gray-700 animate-pulse rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {sale?.products.slice(0, 10).map((product) => (
              <div key={product.id} className="relative">
                <div className="absolute top-3 left-3 z-10">
                  <span className="badge bg-danger text-white text-2xs px-2 py-0.5">
                    {formatPrice(product.flash_sale_price)}
                  </span>
                </div>
                <ProductCard product={{ ...product, current_price: product.flash_sale_price, is_on_sale: true }} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function formatPrice(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}
