'use client'

import Link from 'next/link'
import Image from 'next/image'
import { X, Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { formatPrice, getImageUrl } from '@/lib/utils'
import { useEffect } from 'react'

interface CartDrawerProps {
  open: boolean
  onClose: () => void
}

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { items, summary: rawSummary, coupon, updateItem, removeItem } = useCartStore()
  const summary = rawSummary ?? { sub_total: 0, subtotal: 0, item_count: 0, discount: 0, tax: 0, shipping: 0, total: 0 }

  const total = summary.sub_total - (coupon?.discount ?? 0)

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 animate-fade-in"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative flex flex-col w-full max-w-md bg-white shadow-xl animate-slide-down">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-primary-500" />
            <h2 className="font-display font-semibold text-gray-900">
              Shopping Cart ({summary.item_count})
            </h2>
          </div>
          <button onClick={onClose} className="btn-icon w-8 h-8" aria-label="Close">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto py-4 px-5">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 py-16">
              <ShoppingCart className="w-16 h-16 text-gray-200" />
              <p className="text-gray-500">Your cart is empty</p>
              <Link href="/shop" onClick={onClose} className="btn-primary">
                Continue Shopping
              </Link>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => (
                <li key={item.id} className="flex gap-3">
                  <Link href={`/products/${item.product?.slug}`} onClick={onClose}>
                    <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-50">
                      <Image
                        src={getImageUrl(item.product?.image)}
                        alt={item.product?.name ?? ''}
                        fill
                        className="object-contain p-1"
                        sizes="64px"
                      />
                    </div>
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link href={`/products/${item.product?.slug}`} onClick={onClose}>
                      <p className="text-sm font-medium text-gray-900 hover:text-primary-500 line-clamp-2 transition-colors">
                        {item.product?.name}
                      </p>
                    </Link>
                    {item.variation && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        {item.variation.attributes?.map((a: any) => a.value).join(' / ')}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                        <button
                          onClick={() => updateItem(item.id, Math.max(1, item.qty - 1))}
                          className="w-7 h-7 flex items-center justify-center hover:bg-gray-50 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center text-sm font-medium">{item.qty}</span>
                        <button
                          onClick={() => updateItem(item.id, item.qty + 1)}
                          className="w-7 h-7 flex items-center justify-center hover:bg-gray-50 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900">
                          {formatPrice(item.subtotal)}
                        </span>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-gray-400 hover:text-danger transition-colors"
                          aria-label="Remove"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 px-5 py-4 space-y-3">
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatPrice(summary.sub_total)}</span>
              </div>
              {coupon && (
                <div className="flex justify-between text-success">
                  <span>Coupon ({coupon.code})</span>
                  <span>-{formatPrice(coupon.discount)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-gray-900 pt-1.5 border-t border-gray-100">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Link href="/cart" onClick={onClose} className="btn-secondary text-center text-sm py-2.5">
                View Cart
              </Link>
              <Link href="/checkout" onClick={onClose} className="btn-primary text-center text-sm py-2.5">
                Checkout
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
