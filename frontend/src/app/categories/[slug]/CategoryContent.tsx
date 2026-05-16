'use client'

import { useQuery } from '@tanstack/react-query'
import { categoryApi, productApi } from '@/lib/api'
import { ProductCard } from '@/components/product/ProductCard'
import { Pagination } from '@/components/ui/Pagination'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { ChevronRight } from 'lucide-react'
import type { Product, ProductCategory } from '@/types'

interface Props {
  slug: string
}

export default function CategoryContent({ slug }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const page = Number(searchParams.get('page') ?? 1)

  const { data: category, isLoading: catLoading } = useQuery<ProductCategory>({
    queryKey: ['category', slug],
    queryFn: () => categoryApi.show(slug).then((r) => r.data?.data),
  })

  const { data: productsData, isLoading: prodLoading } = useQuery({
    queryKey: ['products', 'category', slug, page],
    queryFn: () => productApi.list({ category: slug, page, per_page: 20 }).then((r) => r.data),
    enabled: !!slug,
  })

  const products: Product[] = productsData?.data ?? []
  const meta = productsData?.meta

  if (catLoading) {
    return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full" /></div>
  }

  if (!category) {
    return (
      <div className="container-narrow py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Category not found</h1>
        <Link href="/shop" className="text-primary-500 hover:underline">Browse all products</Link>
      </div>
    )
  }

  return (
    <div className="container-narrow py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-primary-500 transition-colors">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/shop" className="hover:text-primary-500 transition-colors">Shop</Link>
        {category.parent && (
          <>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href={`/categories/${category.parent.slug}`} className="hover:text-primary-500 transition-colors">
              {category.parent.name}
            </Link>
          </>
        )}
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-gray-900 font-medium">{category.name}</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start gap-6">
          {category.image && (
            <img src={category.image} alt={category.name} className="w-20 h-20 rounded-xl object-cover flex-shrink-0" />
          )}
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-900">{category.name}</h1>
            {category.description && <p className="mt-2 text-gray-500 max-w-2xl">{category.description}</p>}
            {meta && <p className="mt-1 text-sm text-gray-400">{meta.total} products</p>}
          </div>
        </div>
      </div>

      {/* Subcategories */}
      {category.children && category.children.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Subcategories</h2>
          <div className="flex flex-wrap gap-3">
            {category.children.map((sub) => (
              <Link
                key={sub.id}
                href={`/categories/${sub.slug}`}
                className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-primary-50 hover:text-primary-600 border border-gray-200 hover:border-primary-200 rounded-full text-sm font-medium text-gray-700 transition-colors"
              >
                {sub.icon && <span>{sub.icon}</span>}
                {sub.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Products */}
      {prodLoading ? (
        <div className="product-grid">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-xl aspect-[3/4] animate-pulse" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-gray-400 text-lg">No products found in this category.</p>
          <Link href="/shop" className="mt-4 inline-block text-primary-500 hover:underline">Browse all products</Link>
        </div>
      ) : (
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
