'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { brandApi } from '@/lib/api'
import type { Brand } from '@/types'
import { getImageUrl } from '@/lib/utils'

export function BrandSection() {
  const { data: brands, isLoading } = useQuery<Brand[]>({
    queryKey: ['brands', 'featured'],
    queryFn: () => brandApi.list({ featured: true }).then((r) => r.data),
    staleTime: 10 * 60_000,
  })

  if (!brands?.length && !isLoading) return null

  return (
    <section className="py-14 border-y border-gray-100">
      <div className="container-narrow">
        <div className="text-center mb-8">
          <span className="text-xs font-semibold text-primary-500 uppercase tracking-wider">Partners</span>
          <h2 className="section-title mt-1">Top Brands</h2>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
          {isLoading
            ? [...Array(8)].map((_, i) => (
                <div key={i} className="h-16 rounded-xl skeleton" />
              ))
            : brands?.map((brand) => (
                <Link
                  key={brand.id}
                  href={`/shop?brands=${brand.id}`}
                  className="flex items-center justify-center h-16 rounded-xl border border-gray-100 hover:border-primary-200 hover:shadow-card transition-all p-3 group"
                >
                  {brand.logo ? (
                    <Image
                      src={getImageUrl(brand.logo)}
                      alt={brand.name}
                      width={80}
                      height={40}
                      className="object-contain max-h-8 grayscale group-hover:grayscale-0 transition-all"
                    />
                  ) : (
                    <span className="text-sm font-semibold text-gray-500 group-hover:text-primary-500 transition-colors">
                      {brand.name}
                    </span>
                  )}
                </Link>
              ))}
        </div>
      </div>
    </section>
  )
}
