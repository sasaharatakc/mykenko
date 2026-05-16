import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem, CartSummary } from '@/types'
import { cartApi } from '@/lib/api'
import toast from 'react-hot-toast'

/**
 * Returns a stable guest session ID, generating one if it doesn't exist.
 * Used so guest cart items persist across requests (since the SPA sends no
 * session cookies – withCredentials is false in the axios client).
 */
function getGuestSessionId(): string {
  if (typeof window === 'undefined') return ''
  const KEY = 'mykenko_guest_session'
  let id = localStorage.getItem(KEY)
  if (!id) {
    id = 'guest-' + Math.random().toString(36).slice(2) + Date.now().toString(36)
    localStorage.setItem(KEY, id)
  }
  return id
}

interface CartStore {
  items: CartItem[]
  summary: CartSummary
  coupon: { code: string; discount: number } | null
  isLoading: boolean
  fetchCart: () => Promise<void>
  addItem: (params: { product_id: number; quantity?: number; variation_id?: number; options?: Record<string, string> }) => Promise<void>
  updateItem: (id: number, qty: number) => Promise<void>
  removeItem: (id: number) => Promise<void>
  clearCart: () => Promise<void>
  applyCoupon: (code: string) => Promise<void>
  removeCoupon: () => void
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      summary: { sub_total: 0, subtotal: 0, item_count: 0, discount: 0, tax: 0, shipping: 0, total: 0 },
      coupon: null,
      isLoading: false,

      fetchCart: async () => {
        try {
          set({ isLoading: true })
          const sessionId = getGuestSessionId()
          const { data } = await cartApi.get(sessionId)
          set({ items: data.items, summary: data.summary })
        } catch {
          // silent
        } finally {
          set({ isLoading: false })
        }
      },

      addItem: async ({ product_id, quantity = 1, variation_id, options = {} }) => {
        try {
          set({ isLoading: true })
          const sessionId = getGuestSessionId()
          const { data } = await cartApi.add({ product_id, qty: quantity, variation_id, options, session_id: sessionId })
          set({ items: data.items, summary: data.summary })
          toast.success('Added to cart!')
        } catch (error: any) {
          toast.error(error.response?.data?.message || 'Failed to add item.')
        } finally {
          set({ isLoading: false })
        }
      },

      updateItem: async (id, qty) => {
        try {
          const sessionId = getGuestSessionId()
          const { data } = await cartApi.update(id, qty, sessionId)
          set({ items: data.items, summary: data.summary })
        } catch (error: any) {
          toast.error(error.response?.data?.message || 'Failed to update cart.')
        }
      },

      removeItem: async (id) => {
        try {
          const sessionId = getGuestSessionId()
          const { data } = await cartApi.remove(id, sessionId)
          set({ items: data.items, summary: data.summary })
          toast.success('Item removed.')
        } catch {
          toast.error('Failed to remove item.')
        }
      },

      clearCart: async () => {
        try {
          const sessionId = getGuestSessionId()
          await cartApi.clear(sessionId)
          set({ items: [], summary: { sub_total: 0, subtotal: 0, item_count: 0, discount: 0, tax: 0, shipping: 0, total: 0 }, coupon: null })
        } catch {
          // silent
        }
      },

      applyCoupon: async (code) => {
        try {
          const sessionId = getGuestSessionId()
          const { data } = await cartApi.applyCoupon(code, sessionId)
          set({ coupon: { code: data.coupon.code, discount: data.discount } })
          toast.success('Coupon applied!')
        } catch (error: any) {
          toast.error(error.response?.data?.message || 'Invalid coupon.')
          throw error
        }
      },

      removeCoupon: () => set({ coupon: null }),
    }),
    {
      name: 'mykenko-cart',
      partialize: (state) => ({ coupon: state.coupon }),
    }
  )
)
