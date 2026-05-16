import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Customer } from '@/types'
import { authApi } from '@/lib/api'

interface AuthStore {
  customer: Customer | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: object) => Promise<void>
  logout: () => Promise<void>
  fetchMe: () => Promise<void>
  setCustomer: (customer: Customer) => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      customer: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true })
        try {
          const { data } = await authApi.login({ email, password })
          if (typeof window !== 'undefined') {
            localStorage.setItem('auth_token', data.token)
            document.cookie = 'mykenko_auth=1; path=/; max-age=2592000; SameSite=Lax'
          }
          set({ customer: data.customer, token: data.token, isAuthenticated: true })
        } finally {
          set({ isLoading: false })
        }
      },

      register: async (formData) => {
        set({ isLoading: true })
        try {
          const { data } = await authApi.register(formData)
          if (typeof window !== 'undefined') {
            localStorage.setItem('auth_token', data.token)
            document.cookie = 'mykenko_auth=1; path=/; max-age=2592000; SameSite=Lax'
          }
          set({ customer: data.customer, token: data.token, isAuthenticated: true })
        } finally {
          set({ isLoading: false })
        }
      },

      logout: async () => {
        try {
          await authApi.logout()
        } catch {
          // silent
        } finally {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('auth_token')
            // Only clear the shared auth cookie if the vendor session is also gone
            const userToken = localStorage.getItem('user_auth_token')
            if (!userToken) {
              document.cookie = 'mykenko_auth=; path=/; max-age=0'
            }
          }
          set({ customer: null, token: null, isAuthenticated: false })
        }
      },

      fetchMe: async () => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
        if (!token) return
        try {
          const { data } = await authApi.me()
          // me() returns a JsonResource, which wraps the customer in { data: {...} }
          set({ customer: data.data, isAuthenticated: true })
        } catch (error: any) {
          // Only clear auth on explicit 401 — network errors must not log the user out
          if (error?.response?.status === 401) {
            if (typeof window !== 'undefined') {
              localStorage.removeItem('auth_token')
              const userToken = localStorage.getItem('user_auth_token')
              if (!userToken) {
                document.cookie = 'mykenko_auth=; path=/; max-age=0'
              }
            }
            set({ customer: null, token: null, isAuthenticated: false })
          }
        }
      },

      setCustomer: (customer) => set({ customer }),
    }),
    {
      name: 'mykenko-auth',
      partialize: (state) => ({ token: state.token, customer: state.customer, isAuthenticated: state.isAuthenticated }),
      onRehydrateStorage: () => (state) => {
        // Sync auth_token so the axios interceptor can read it
        if (typeof window !== 'undefined' && state?.token) {
          localStorage.setItem('auth_token', state.token)
        }
      },
    }
  )
)
