'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useUserAuthStore } from '@/store/userAuthStore'
import {
  LayoutDashboard, Package, ShoppingBag, Wallet, LogOut, ChevronRight, Store
} from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/vendor', label: 'ダッシュボード', Icon: LayoutDashboard, exact: true },
  { href: '/vendor/products', label: '商品管理', Icon: Package },
  { href: '/vendor/orders', label: '注文管理', Icon: ShoppingBag },
  { href: '/vendor/payouts', label: '出金・精算', Icon: Wallet },
  { href: '/vendor/store', label: '店舗設定', Icon: Store },
]

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { isAuthenticated, user, logout, _hasHydrated } = useUserAuthStore()

  useEffect(() => {
    if (_hasHydrated && !isAuthenticated) router.replace('/login?redirect=/vendor')
  }, [_hasHydrated, isAuthenticated, router])

  if (!_hasHydrated || !isAuthenticated) return null

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
        <div className="px-5 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-primary-500" />
            <span className="font-display text-lg font-bold text-gray-900">Vendor Hub</span>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV.map(({ href, label, Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  active
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                )}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {label}
              </Link>
            )
          })}
        </nav>

        <div className="px-3 py-4 border-t border-gray-100 space-y-1">
          <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors">
            <Store className="w-4 h-4" />
            View Store
          </Link>
          <button
            onClick={() => { logout(); router.push('/login?redirect=/vendor') }}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-2 text-sm text-gray-500">
          <span className="text-gray-900 font-medium">{user?.name}</span>
          {pathname !== '/vendor' && (
            <>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="capitalize">{pathname.split('/').filter(Boolean).slice(1).join(' / ')}</span>
            </>
          )}
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
