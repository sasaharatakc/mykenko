'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useQuery } from '@tanstack/react-query'
import { categoryApi } from '@/lib/api'
import type { ProductCategory } from '@/types'
import { getImageUrl } from '@/lib/utils'

export function CategoryBar() {
  const { data: categories, isLoading } = useQuery<ProductCategory[]>({
    queryKey: ['categories'],
    queryFn: () => categoryApi.list().then((r) => r.data?.data ?? []),
    staleTime: 10 * 60_000,
  })

  const featured = categories?.filter((c) => c.is_featured).slice(0, 10)

  return (
    <section className="py-8 border-b border-gray-100">
      <div className="container-narrow">
        <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide pb-1">
          <Link
            href="/shop"
            className="flex-shrink-0 flex flex-col items-center gap-2 group"
          >
            <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center border-2 border-primary-200 group-hover:border-primary-500 transition-colors">
              <span className="text-2xl">🛍️</span>
            </div>
            <span className="text-xs font-medium text-gray-600 group-hover:text-primary-500 whitespace-nowrap">All</span>
          </Link>

          {isLoading
            ? [...Array(8)].map((_, i) => (
                <div key={i} className="flex-shrink-0 flex flex-col items-center gap-2">
                  <div className="w-16 h-16 rounded-2xl skeleton" />
                  <div className="h-3 w-14 skeleton rounded" />
                </div>
              ))
            : featured?.map((category) => (
                <Link
                  key={category.id}
                  href={`/shop?category=${category.slug}`}
                  className="flex-shrink-0 flex flex-col items-center gap-2 group"
                >
                  <div className="w-16 h-16 rounded-2xl border-2 border-gray-100 group-hover:border-primary-500 overflow-hidden bg-gray-50 transition-colors">
                    {category.image ? (
                      <Image
                        src={getImageUrl(category.image)}
                        alt={category.name}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">
                        {category.icon ?? '📦'}
                      </div>
                    )}
                  </div>
                  <span className="text-xs font-medium text-gray-600 group-hover:text-primary-500 whitespace-nowrap max-w-[70px] text-center line-clamp-1 transition-colors">
                    {category.name}
                  </span>
                </Link>
              ))}
        </div>
      </div>
    </section>
  )
}
