import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { wishlistApi } from '@/lib/api'
import toast from 'react-hot-toast'

interface WishlistStore {
  ids: number[]
  isLoading: boolean
  toggle: (productId: number) => Promise<void>
  has: (productId: number) => boolean
  fetch: () => Promise<void>
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      ids: [],
      isLoading: false,

      toggle: async (productId) => {
        const { ids } = get()
        const wasWishlisted = ids.includes(productId)

        // Optimistic update
        set({ ids: wasWishlisted ? ids.filter((id) => id !== productId) : [...ids, productId] })

        try {
          const { data } = await wishlistApi.toggle(productId)
          toast.success(data.wishlisted ? 'Added to wishlist.' : 'Removed from wishlist.')
        } catch {
          // Revert
          set({ ids })
          toast.error('Failed to update wishlist.')
        }
      },

      has: (productId) => get().ids.includes(productId),

      fetch: async () => {
        try {
          const { data } = await wishlistApi.list()
          set({ ids: data.data.map((p: { id: number }) => p.id) })
        } catch {
          // silent
        }
      },
    }),
    {
      name: 'shofy-wishlist',
      partialize: (state) => ({ ids: state.ids }),
    }
  )
)
