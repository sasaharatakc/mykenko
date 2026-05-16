'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Heart, ShoppingCart, Eye, GitCompare } from 'lucide-react'
import { useState } from 'react'
import type { Product } from '@/types'
import { formatPrice, getImageUrl, cn } from '@/lib/utils'
import { useCartStore } from '@/store/cartStore'
import { useWishlistStore } from '@/store/wishlistStore'
import { StarRating } from '@/components/ui/StarRating'
import { CountdownTimer } from '@/components/ui/CountdownTimer'

interface ProductCardProps {
  product: Product
  variant?: 'default' | 'list'
}

export function ProductCard({ product, variant = 'default' }: ProductCardProps) {
  const [hovered, setHovered] = useState(false)
  const [addingToCart, setAddingToCart] = useState(false)

  const { addItem } = useCartStore()
  const { toggle, has } = useWishlistStore()

  const isWishlisted = has(product.id)

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (product.has_variations) {
      // Has variations – navigate to product page for attribute selection
      window.location.href = `/products/${product.slug}`
      return
    }
    setAddingToCart(true)
    await addItem({ product_id: product.id, quantity: 1 })
    setAddingToCart(false)
  }

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggle(product.id)
  }

  if (variant === 'list') {
    return (
      <div className="card flex gap-4 p-4 hover:shadow-card-hover transition-shadow">
        <Link href={`/products/${product.slug}`} className="flex-shrink-0">
          <div className="relative w-32 h-32 rounded-lg overflow-hidden bg-gray-50">
            <Image
              src={getImageUrl(product.image)}
              alt={product.name}
              fill
              className="object-contain p-2"
              sizes="128px"
            />
          </div>
        </Link>
        <div className="flex-1 min-w-0">
          <Link href={`/products/${product.slug}`}>
            <h3 className="text-sm font-medium text-gray-900 hover:text-primary-500 line-clamp-2 transition-colors">
              {product.name}
            </h3>
          </Link>
          <StarRating rating={product.reviews_avg} count={product.reviews_count} className="mt-1" size="sm" />
          <div className="flex items-center gap-2 mt-2">
            {product.is_on_sale ? (
              <>
                <span className="price-sale">{formatPrice(product.current_price)}</span>
                <span className="price-original">{formatPrice(product.price)}</span>
              </>
            ) : (
              <span className="price">{formatPrice(product.price)}</span>
            )}
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={handleAddToCart} disabled={addingToCart || !product.in_stock} className="btn-primary text-xs px-4 py-1.5">
              {!product.in_stock ? 'Out of Stock' : addingToCart ? 'Adding…' : 'Add to Cart'}
            </button>
            <button onClick={handleToggleWishlist} className={cn('btn-icon w-8 h-8', isWishlisted && 'border-primary-500 text-primary-500')}>
              <Heart className={cn('w-3.5 h-3.5', isWishlisted && 'fill-current')} />
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn('card group relative', !product.in_stock && 'opacity-90')}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Labels */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
        {product.is_on_sale && (
          <span className="badge bg-danger text-white text-2xs px-2 py-0.5">
            -{product.discount_percent}%
          </span>
        )}
        {product.labels?.map((label) => (
          <span key={label.id} className="badge text-white text-2xs px-2 py-0.5" style={{ backgroundColor: label.color }}>
            {label.name}
          </span>
        ))}
        {!product.in_stock && (
          <span className="badge bg-gray-500 text-white text-2xs px-2 py-0.5">Out of Stock</span>
        )}
      </div>

      {/* Action buttons */}
      <div className={cn(
        'absolute top-3 right-3 z-10 flex flex-col gap-2 transition-all duration-200',
        hovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
      )}>
        <button
          onClick={handleToggleWishlist}
          className={cn('btn-icon w-8 h-8 shadow-sm', isWishlisted && 'border-primary-500 text-primary-500 bg-primary-50')}
          aria-label="Add to wishlist"
        >
          <Heart className={cn('w-3.5 h-3.5', isWishlisted && 'fill-current')} />
        </button>
        <Link href={`/products/${product.slug}`} className="btn-icon w-8 h-8 shadow-sm" aria-label="Quick view">
          <Eye className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Image */}
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-gray-50 rounded-t-xl">
          <Image
            src={getImageUrl(product.image)}
            alt={product.name}
            fill
            className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          />
        </div>
      </Link>

      {/* Info */}
      <div className="p-4">
        {product.brand && (
          <p className="text-2xs text-gray-400 uppercase tracking-wider mb-1">{product.brand.name}</p>
        )}
        <Link href={`/products/${product.slug}`}>
          <h3 className="text-sm font-medium text-gray-900 hover:text-primary-500 line-clamp-2 transition-colors leading-snug">
            {product.name}
          </h3>
        </Link>

        <StarRating rating={product.reviews_avg} count={product.reviews_count} className="mt-1.5" size="sm" />

        {/* Flash sale countdown */}
        {product.sale_ends_at && product.is_on_sale && (
          <CountdownTimer endDate={product.sale_ends_at} className="mt-2" />
        )}

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            {product.is_on_sale ? (
              <>
                <span className="price-sale text-base">{formatPrice(product.current_price)}</span>
                <span className="price-original">{formatPrice(product.price)}</span>
              </>
            ) : (
              <span className="price text-base">{formatPrice(product.price)}</span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={addingToCart || !product.in_stock}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
              product.in_stock
                ? 'bg-primary-500 text-white hover:bg-primary-600'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            )}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            {addingToCart ? '…' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  )
}
