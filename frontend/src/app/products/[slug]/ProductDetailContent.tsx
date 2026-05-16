'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { productApi, reviewApi } from '@/lib/api'
import type { Product, Review, ReviewStats, ProductVariation, PaginatedResponse } from '@/types'
import { ProductCard } from '@/components/product/ProductCard'
import { StarRating } from '@/components/ui/StarRating'
import { CountdownTimer } from '@/components/ui/CountdownTimer'
import { Pagination } from '@/components/ui/Pagination'
import { useCartStore } from '@/store/cartStore'
import { useWishlistStore } from '@/store/wishlistStore'
import {
  Heart, ShoppingCart, Minus, Plus, Share2, Star,
  Truck, RotateCcw, Shield, BadgeCheck, Package, ChevronRight,
} from 'lucide-react'
import { formatPrice, getImageUrl, cn } from '@/lib/utils'
import toast from 'react-hot-toast'

export function ProductDetailContent({ slug }: { slug: string }) {
  const { data: product, isLoading: productLoading } = useQuery<Product>({
    queryKey: ['product', slug],
    queryFn: () => productApi.show(slug).then((r) => r.data?.data),
    staleTime: 5 * 60_000,
  })

  const { data: related } = useQuery<Product[]>({
    queryKey: ['product', slug, 'related'],
    queryFn: () => productApi.related(slug).then((r) => r.data?.data ?? []),
    enabled: !!product,
    staleTime: 5 * 60_000,
  })

  const [qty, setQty] = useState(1)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [selectedAttributes, setSelectedAttributes] = useState<Record<number, number>>({})
  const [reviewPage, setReviewPage] = useState(1)
  const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'reviews'>('description')

  const { addItem } = useCartStore()
  const { toggle, has } = useWishlistStore()

  const isWishlisted = product ? has(product.id) : false

  const allImages = useMemo(() => {
    if (!product) return []
    return [product.image, ...(product.images ?? [])].filter(Boolean) as string[]
  }, [product])

  // Find matching variation
  const selectedVariation = useMemo<ProductVariation | null>(() => {
    if (!product?.variations?.length) return null
    return product.variations.find((v) => {
      if (!v.variation_items?.length) return false
      return v.variation_items.every((item) =>
        item.attribute_id && selectedAttributes[item.attribute?.attribute_set_id ?? 0] === item.attribute_id
      )
    }) ?? null
  }, [product, selectedAttributes])

  const effectiveProduct = selectedVariation?.product ?? product
  const currentPrice = effectiveProduct?.current_price ?? product?.current_price ?? 0
  const inStock = effectiveProduct?.in_stock ?? product?.in_stock ?? false

  const { data: reviewData } = useQuery<{ data: Review[]; stats: ReviewStats; meta: { total: number; last_page: number; current_page: number } }>({
    queryKey: ['reviews', product?.id, reviewPage],
    queryFn: () => reviewApi.list(product!.id, { per_page: 5, page: reviewPage }).then((r) => r.data),
    enabled: !!product && activeTab === 'reviews',
  })

  if (productLoading) {
    return (
      <div className="container-narrow py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="space-y-4">
            <div className="aspect-square skeleton rounded-2xl" />
            <div className="grid grid-cols-5 gap-2">
              {[...Array(5)].map((_, i) => <div key={i} className="aspect-square skeleton rounded-xl" />)}
            </div>
          </div>
          <div className="space-y-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className={`h-${i === 0 ? '8' : '4'} skeleton rounded w-${i === 0 ? 'full' : '2/3'}`} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!product) return null

  const handleAddToCart = async () => {
    await addItem({
      product_id: product.id,
      quantity: qty,
      variation_id: selectedVariation?.id,
    })
  }

  return (
    <div className="bg-white">
      {/* Breadcrumb */}
      <div className="border-b border-gray-100">
        <div className="container-narrow py-3 flex items-center gap-2 text-sm text-gray-500 overflow-x-auto scrollbar-hide">
          <Link href="/" className="hover:text-primary-500 whitespace-nowrap">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
          <Link href="/shop" className="hover:text-primary-500 whitespace-nowrap">Shop</Link>
          {product.categories?.[0] && (
            <>
              <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
              <Link href={`/shop?category=${product.categories[0].slug}`} className="hover:text-primary-500 whitespace-nowrap">
                {product.categories[0].name}
              </Link>
            </>
          )}
          <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="text-gray-900 font-medium whitespace-nowrap line-clamp-1">{product.name}</span>
        </div>
      </div>

      <div className="container-narrow py-8">
        {/* Product Main */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Images */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-50 border border-gray-100">
              <Image
                src={getImageUrl(allImages[selectedImageIndex] ?? product.image)}
                alt={product.name}
                fill
                className="object-contain p-6"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
              {product.is_on_sale && (
                <div className="absolute top-4 left-4 badge bg-danger text-white text-xs">
                  -{product.discount_percent}%
                </div>
              )}
            </div>
            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImageIndex(i)}
                    className={cn(
                      'relative flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-colors bg-gray-50',
                      i === selectedImageIndex ? 'border-primary-500' : 'border-gray-100 hover:border-gray-300'
                    )}
                  >
                    <Image
                      src={getImageUrl(img)}
                      alt={`Image ${i + 1}`}
                      fill
                      className="object-contain p-1"
                      sizes="64px"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            {/* Brand & Name */}
            {product.brand && (
              <Link href={`/shop?brands=${product.brand.id}`} className="text-xs font-semibold text-primary-500 uppercase tracking-wider hover:underline">
                {product.brand.name}
              </Link>
            )}
            <h1 className="font-display text-2xl md:text-3xl font-bold text-gray-900 mt-1 mb-3 leading-tight">
              {product.name}
            </h1>

            {/* Rating & Reviews */}
            <div className="flex items-center gap-3 mb-4">
              <StarRating rating={product.reviews_avg} count={product.reviews_count} size="md" />
              <button onClick={() => setActiveTab('reviews')} className="text-sm text-gray-400 hover:text-primary-500 transition-colors">
                Write a review
              </button>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-3xl font-bold text-gray-900">{formatPrice(currentPrice)}</span>
              {product.is_on_sale && (
                <span className="text-lg text-gray-400 line-through">{formatPrice(product.price)}</span>
              )}
              {product.is_on_sale && product.sale_ends_at && (
                <CountdownTimer endDate={product.sale_ends_at} />
              )}
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-sm text-gray-600 leading-relaxed mb-5 border-t border-b border-gray-100 py-4">
                {product.description}
              </p>
            )}

            {/* Attributes (variations) */}
            {product.attribute_sets?.map((attrSet) => (
              <div key={attrSet.id} className="mb-5">
                <p className="text-sm font-semibold text-gray-700 mb-2">{attrSet.title}</p>
                <div className="flex flex-wrap gap-2">
                  {attrSet.attributes.map((attr) => (
                    <button
                      key={attr.id}
                      onClick={() => setSelectedAttributes((prev) => ({ ...prev, [attrSet.id]: attr.id }))}
                      className={cn(
                        'px-4 py-2 rounded-lg border text-sm font-medium transition-all',
                        selectedAttributes[attrSet.id] === attr.id
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-200 text-gray-600 hover:border-gray-400'
                      )}
                      style={attrSet.display_layout === 'color' && attr.color ? {
                        backgroundColor: attr.color,
                        color: 'transparent',
                        width: '36px',
                        padding: '0',
                        height: '36px',
                        borderRadius: '50%',
                      } : {}}
                    >
                      {attrSet.display_layout !== 'color' && attr.title}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {/* Stock */}
            <div className="flex items-center gap-2 mb-5">
              <span className={cn('w-2 h-2 rounded-full', inStock ? 'bg-success' : 'bg-danger')} />
              <span className={cn('text-sm font-medium', inStock ? 'text-success' : 'text-danger')}>
                {inStock ? 'In Stock' : 'Out of Stock'}
              </span>
              {product.sku && (
                <span className="text-xs text-gray-400 ml-2">SKU: {product.sku}</span>
              )}
            </div>

            {/* Qty + Cart */}
            <div className="flex gap-3 mb-6">
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setQty(Math.max(product.minimum_order_quantity ?? 1, qty - 1))}
                  className="w-11 h-11 flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-semibold">{qty}</span>
                <button
                  onClick={() => setQty(Math.min(product.maximum_order_quantity ?? 999, qty + 1))}
                  className="w-11 h-11 flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={!inStock}
                className="flex-1 btn-primary gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="w-4.5 h-4.5" />
                {inStock ? 'Add to Cart' : 'Out of Stock'}
              </button>

              <button
                onClick={() => toggle(product.id)}
                className={cn('btn-icon', isWishlisted && 'border-danger text-danger bg-red-50')}
                aria-label="Wishlist"
              >
                <Heart className={cn('w-4.5 h-4.5', isWishlisted && 'fill-current')} />
              </button>

              <button className="btn-icon" aria-label="Share">
                <Share2 className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Store */}
            {product.store && (
              <Link
                href={`/stores/${product.store.slug}`}
                className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 hover:border-primary-200 transition-colors mb-5 group"
              >
                {product.store.logo && (
                  <Image src={getImageUrl(product.store.logo)} alt={product.store.name} width={40} height={40} className="rounded-lg object-contain" />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-semibold text-gray-900 group-hover:text-primary-500 transition-colors">
                      {product.store.name}
                    </p>
                    {product.store.is_verified && <BadgeCheck className="w-4 h-4 text-primary-500" />}
                  </div>
                  <p className="text-xs text-gray-400">Visit store</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-primary-500 transition-colors" />
              </Link>
            )}

            {/* Shipping info */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Truck, label: 'Free Delivery', sub: 'On orders $50+' },
                { icon: RotateCcw, label: 'Easy Returns', sub: '30 days' },
                { icon: Shield, label: 'Secure', sub: 'Payment' },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="flex flex-col items-center text-center gap-1 p-3 rounded-xl bg-gray-50">
                  <Icon className="w-5 h-5 text-primary-500" />
                  <span className="text-xs font-medium text-gray-700">{label}</span>
                  <span className="text-2xs text-gray-400">{sub}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-14">
          <div className="flex border-b border-gray-100 gap-6">
            {(['description', 'specs', 'reviews'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'pb-3 text-sm font-medium capitalize border-b-2 transition-colors -mb-px',
                  activeTab === tab
                    ? 'border-primary-500 text-primary-500'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                )}
              >
                {tab === 'reviews' ? `Reviews (${product.reviews_count})` : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          <div className="py-8">
            {activeTab === 'description' && (
              <div
                className="prose prose-sm max-w-none text-gray-600"
                dangerouslySetInnerHTML={{ __html: product.content ?? product.description ?? '<p>No description available.</p>' }}
              />
            )}

            {activeTab === 'specs' && product.specification_table && (
              <div className="space-y-6">
                {product.specification_table.groups.map((group) => (
                  <div key={group.name}>
                    <h3 className="font-semibold text-gray-900 mb-3">{group.name}</h3>
                    <table className="w-full text-sm">
                      <tbody>
                        {group.attributes.map((attr) => (
                          <tr key={attr.name} className="border-b border-gray-100">
                            <td className="py-2.5 pr-8 text-gray-500 w-1/3 font-medium">{attr.name}</td>
                            <td className="py-2.5 text-gray-900">{attr.value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div>
                {/* Stats */}
                {reviewData?.stats && (
                  <div className="flex flex-col sm:flex-row gap-8 mb-8 p-6 bg-gray-50 rounded-2xl">
                    <div className="flex flex-col items-center justify-center min-w-[120px]">
                      <span className="text-5xl font-bold text-gray-900">{reviewData.stats.average}</span>
                      <StarRating rating={reviewData.stats.average} count={reviewData.stats.total} className="mt-2" />
                    </div>
                    <div className="flex-1 space-y-2">
                      {[5, 4, 3, 2, 1].map((n) => {
                        const count = reviewData.stats.distribution[n] ?? 0
                        const pct = reviewData.stats.total ? Math.round((count / reviewData.stats.total) * 100) : 0
                        return (
                          <div key={n} className="flex items-center gap-3">
                            <span className="text-xs text-gray-500 w-4">{n}</span>
                            <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div className="h-full bg-yellow-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-xs text-gray-400 w-8 text-right">{pct}%</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Review list */}
                <div className="space-y-6">
                  {reviewData?.data?.map((review) => (
                    <div key={review.id} className="border-b border-gray-100 pb-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-600">
                            {review.customer?.name?.[0] ?? 'A'}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 text-sm">{review.customer?.name ?? 'Anonymous'}</p>
                            <StarRating rating={review.star} showCount={false} size="sm" />
                          </div>
                        </div>
                        <span className="text-xs text-gray-400">{formatDate(review.created_at)}</span>
                      </div>
                      {review.comment && <p className="text-sm text-gray-600">{review.comment}</p>}
                      {review.images.length > 0 && (
                        <div className="flex gap-2 mt-3">
                          {review.images.map((img, i) => (
                            <Image key={i} src={getImageUrl(img)} alt="" width={60} height={60} className="rounded-lg object-cover" />
                          ))}
                        </div>
                      )}
                      {review.replies.map((reply) => (
                        <div key={reply.id} className="mt-4 ml-6 pl-4 border-l-2 border-primary-100">
                          <p className="text-xs font-semibold text-primary-500">{reply.user?.name ?? 'Store'}</p>
                          <p className="text-sm text-gray-600 mt-1">{reply.content}</p>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

                {reviewData?.meta && reviewData.meta.last_page > 1 && (
                  <div className="mt-6">
                    <Pagination
                      currentPage={reviewData.meta.current_page}
                      lastPage={reviewData.meta.last_page}
                      onPageChange={setReviewPage}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Related products */}
        {related && related.length > 0 && (
          <div className="mt-12">
            <h2 className="section-title mb-6">Related Products</h2>
            <div className="product-grid">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function formatDate(s: string) {
  return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(s))
}
