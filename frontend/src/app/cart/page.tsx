'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCartStore } from '@/store/cartStore'
import { getImageUrl, formatPrice } from '@/lib/utils'
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag, X } from 'lucide-react'
import { useState } from 'react'

export default function CartPage() {
  const { items, summary: rawSummary, coupon, isLoading, updateItem, removeItem, clearCart, applyCoupon, removeCoupon } = useCartStore()
  const summary = rawSummary ?? { sub_total: 0, subtotal: 0, item_count: 0, discount: 0, tax: 0, shipping: 0, total: 0 }
  const [couponCode, setCouponCode] = useState('')
  const [couponLoading, setCouponLoading] = useState(false)

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return
    setCouponLoading(true)
    await applyCoupon(couponCode.trim())
    setCouponLoading(false)
    setCouponCode('')
  }

  if (!items.length) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="container-narrow py-20 flex flex-col items-center gap-6 text-center">
          <ShoppingBag className="w-20 h-20 text-gray-200" />
          <h2 className="font-display text-2xl font-semibold text-gray-900">Your cart is empty</h2>
          <p className="text-gray-500">Looks like you haven&apos;t added anything yet.</p>
          <Link href="/shop" className="btn-primary">Start Shopping</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white border-b border-gray-100">
        <div className="container-narrow py-8">
          <h1 className="font-display text-2xl font-bold text-gray-900">Shopping Cart</h1>
          <p className="text-gray-500 mt-1">{summary.item_count} item{summary.item_count !== 1 ? 's' : ''} in your cart</p>
        </div>
      </div>

      <div className="container-narrow py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">Items</h2>
                <button onClick={() => clearCart()} className="text-sm text-red-500 hover:text-red-600 transition-colors">
                  Clear all
                </button>
              </div>

              <ul className="divide-y divide-gray-100">
                {items.map((item) => (
                  <li key={item.id} className="flex gap-4 p-5">
                    <Link href={`/products/${item.product?.slug ?? '#'}`} className="flex-shrink-0">
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-100">
                        {item.product && (
                          <Image
                            src={getImageUrl(item.product.image)}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                            sizes="80px"
                          />
                        )}
                      </div>
                    </Link>

                    <div className="flex-1 min-w-0">
                      <Link href={`/products/${item.product?.slug ?? '#'}`} className="font-medium text-gray-900 hover:text-primary-500 transition-colors line-clamp-1">
                        {item.product?.name ?? '商品'}
                      </Link>
                      {item.variation && item.variation.attributes?.length > 0 && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          {item.variation.attributes.map((a) => `${a.set}: ${a.value}`).join(' / ')}
                        </p>
                      )}
                      <p className="text-primary-500 font-semibold mt-1">{formatPrice(item.price)}</p>

                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                          <button
                            onClick={() => updateItem(item.id, item.qty - 1)}
                            disabled={item.qty <= 1 || isLoading}
                            className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-10 text-center text-sm font-medium">{item.qty}</span>
                          <button
                            onClick={() => updateItem(item.id, item.qty + 1)}
                            disabled={isLoading}
                            className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-gray-900">{formatPrice(item.subtotal)}</span>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-24">
              <h2 className="font-semibold text-gray-900 mb-4">Order Summary</h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatPrice(summary.subtotal)}</span>
                </div>

                {summary.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-{formatPrice(summary.discount)}</span>
                  </div>
                )}

                {summary.tax > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Tax</span>
                    <span>{formatPrice(summary.tax)}</span>
                  </div>
                )}

                <div className="border-t border-gray-100 pt-3 flex justify-between font-semibold text-gray-900 text-base">
                  <span>Total</span>
                  <span className="text-primary-500">{formatPrice(summary.total)}</span>
                </div>
              </div>

              {/* Coupon */}
              <div className="mt-5">
                {coupon ? (
                  <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-3 py-2.5">
                    <span className="flex items-center gap-1.5 text-sm text-green-700">
                      <Tag className="w-4 h-4" />
                      <span className="font-medium">{coupon.code}</span>
                    </span>
                    <button onClick={() => removeCoupon()} className="text-green-500 hover:text-green-700">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                      placeholder="Coupon code"
                      className="input flex-1 py-2.5 text-sm"
                    />
                    <button
                      onClick={handleApplyCoupon}
                      disabled={!couponCode.trim() || couponLoading}
                      className="btn-primary px-4 py-2.5 text-sm disabled:opacity-60"
                    >
                      Apply
                    </button>
                  </div>
                )}
              </div>

              <Link href="/checkout" className="btn-primary w-full mt-5 flex items-center justify-center gap-2">
                Proceed to Checkout
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link href="/shop" className="mt-3 text-sm text-center text-gray-500 hover:text-primary-500 transition-colors block">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
