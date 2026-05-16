/**
 * Auth store for back-office users: vendors and admins.
 * Customers use authStore; this store handles the User model (users table).
 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { userAuthApi } from '@/lib/api'

export interface BackOfficeUser {
  id: number
  name: string
  email: string
  avatar: string | null
  roles: string[]
  store?: {
    id: number
    name: string
    slug: string
    status: string
  } | null
}

interface UserAuthStore {
  user: BackOfficeUser | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  _hasHydrated: boolean
  login: (email: string, password: string) => Promise<void>
  /** Directly inject a vendor token returned by the store-registration endpoint */
  setVendorAuth: (token: string, user: BackOfficeUser) => void
  logout: () => Promise<void>
  fetchMe: () => Promise<void>
  setHasHydrated: (value: boolean) => void
}

export const useUserAuthStore = create<UserAuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      _hasHydrated: false,

      setHasHydrated: (value) => set({ _hasHydrated: value }),

      setVendorAuth: (token, user) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('user_auth_token', token)
          document.cookie = 'shofy_auth=1; path=/; max-age=2592000; SameSite=Lax'
        }
        set({ user, token, isAuthenticated: true })
      },

      login: async (email, password) => {
        set({ isLoading: true })
        try {
          const { data } = await userAuthApi.login({ email, password })
          if (typeof window !== 'undefined') {
            localStorage.setItem('user_auth_token', data.token)
            document.cookie = 'shofy_auth=1; path=/; max-age=2592000; SameSite=Lax'
          }
          set({ user: data.user, token: data.token, isAuthenticated: true })
        } finally {
          set({ isLoading: false })
        }
      },

      logout: async () => {
        try {
          await userAuthApi.logout()
        } catch {
          // silent
        } finally {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('user_auth_token')
            const customerToken = localStorage.getItem('auth_token')
            if (!customerToken) {
              document.cookie = 'shofy_auth=; path=/; max-age=0'
            }
          }
          set({ user: null, token: null, isAuthenticated: false })
        }
      },

      fetchMe: async () => {
        const token =
          typeof window !== 'undefined' ? localStorage.getItem('user_auth_token') : null
        if (!token) return
        try {
          const { data } = await userAuthApi.me()
          set({ user: data.data, isAuthenticated: true })
        } catch (error: any) {
          // Only clear auth on explicit 401 — network errors must not log the user out
          if (error?.response?.status === 401) {
            if (typeof window !== 'undefined') {
              localStorage.removeItem('user_auth_token')
              document.cookie = 'shofy_auth=; path=/; max-age=0'
            }
            set({ user: null, token: null, isAuthenticated: false })
          }
        }
      },
    }),
    {
      name: 'shofy-user-auth',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        // Called once localStorage rehydration is complete
        state?.setHasHydrated(true)
        // Sync user_auth_token so the axios interceptor can read it
        if (typeof window !== 'undefined' && state?.token) {
          localStorage.setItem('user_auth_token', state.token)
        }
      },
    }
  )
)
