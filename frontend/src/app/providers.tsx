'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from 'next-themes'
import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useCartStore } from '@/store/cartStore'
import { useUserAuthStore } from '@/store/userAuthStore'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 1,
    },
  },
})

function AppInit() {
  const fetchMe = useAuthStore((s) => s.fetchMe)
  const fetchCart = useCartStore((s) => s.fetchCart)
  const fetchUserMe = useUserAuthStore((s) => s.fetchMe)

  useEffect(() => {
    fetchMe()
    fetchCart()
    fetchUserMe()

    // Register service worker for PWA
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // SW registration failed silently in dev — not critical
      })
    }
  }, [fetchMe, fetchCart, fetchUserMe])

  return null
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
        <AppInit />
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  )
}
