'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect } from 'react'
import { useWishlistStore } from '@/store/wishlistStore'
import { useCartStore } from '@/store/cartStore'
import { getImageUrl, formatPrice } from '@/lib/utils'
import { Heart, ShoppingCart, Trash2 } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { wishlistApi } from '@/lib/api'
import type { Product } from '@/types'

export default function WishlistPage() {
  const { ids, toggle, fetch: fetchWishlist } = useWishlistStore()
  const { addItem } = useCartStore()

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ['wishlist-products', ids],
    queryFn: () => wishlistApi.list().then((r) => r.data?.data ?? []),
    enabled: ids.length > 0,
  })

  useEffect(() => {
    fetchWishlist()
  }, [fetchWishlist])

  if (!ids.length) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="container-narrow py-20 flex flex-col items-center gap-6 text-center">
          <Heart className="w-20 h-20 text-gray-200" />
          <h2 className="font-display text-2xl font-semibold text-gray-900">Your wishlist is empty</h2>
          <p className="text-gray-500">Save items you love by clicking the heart icon.</p>
          <Link href="/shop" className="btn-primary">Explore Products</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white border-b border-gray-100">
        <div className="container-narrow py-8">
          <h1 className="font-display text-2xl font-bold text-gray-900">My Wishlist</h1>
          <p className="text-gray-500 mt-1">{ids.length} saved item{ids.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="container-narrow py-8">
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {ids.map((id) => (
              <div key={id} className="card overflow-hidden">
                <div className="h-48 skeleton" />
                <div className="p-4 space-y-2">
                  <div className="h-4 skeleton rounded" />
                  <div className="h-3 skeleton rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {products?.map((product) => (
              <div key={product.id} className="card overflow-hidden group">
                <Link href={`/products/${product.slug}`} className="block relative h-48 overflow-hidden bg-gray-100">
                  <Image
                    src={getImageUrl(product.image)}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                  {product.is_on_sale && (
                    <span className="absolute top-2 left-2 badge bg-red-500 text-white text-2xs">
                      -{product.discount_percent}%
                    </span>
                  )}
                </Link>

                <div className="p-4">
                  <Link href={`/products/${product.slug}`} className="font-medium text-gray-900 text-sm line-clamp-2 hover:text-primary-500 transition-colors">
                    {product.name}
                  </Link>

                  <div className="flex items-center gap-2 mt-2">
                    <span className="price text-sm">{formatPrice(product.current_price)}</span>
                    {product.is_on_sale && (
                      <span className="price-original text-xs">{formatPrice(product.price)}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={() =>
                        product.has_variations
                          ? (window.location.href = `/products/${product.slug}`)
                          : addItem({ product_id: product.id, quantity: 1 })
                      }
                      className="flex-1 btn-primary text-xs py-2 flex items-center justify-center gap-1.5"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      Add to Cart
                    </button>
                    <button
                      onClick={() => toggle(product.id)}
                      className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 text-red-400 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
