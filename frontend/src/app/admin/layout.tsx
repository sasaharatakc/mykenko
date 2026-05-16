'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useUserAuthStore } from '@/store/userAuthStore'
import { useQuery } from '@tanstack/react-query'
import { adminApi } from '@/lib/api'
import {
  LayoutDashboard, Package, ShoppingBag, Users, Store,
  LogOut, ChevronRight, ChevronDown, Settings, Tag, Wallet,
  Truck, RotateCcw, Star, Zap, Percent, Award, Mail,
  Layers, List, Hash, BarChart2, Receipt, BookOpen, Calculator, Sliders, Bell, Table2
} from 'lucide-react'
import { cn } from '@/lib/utils'

type NavItem = { href: string; label: string; Icon: any; exact?: boolean }
type NavGroup = { label: string; items: NavItem[] }

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Eコマース',
    items: [
      { href: '/admin',             label: 'ダッシュボード',       Icon: LayoutDashboard, exact: true },
      { href: '/admin/reports',     label: 'レポート',            Icon: BarChart2 },
      { href: '/admin/orders',      label: '注文',               Icon: ShoppingBag },
      { href: '/admin/returns',     label: '返品',               Icon: RotateCcw },
      { href: '/admin/shipments',   label: '出荷',               Icon: Truck },
      { href: '/admin/invoices',    label: '請求書',              Icon: Receipt },
      { href: '/admin/products',    label: '商品',               Icon: Package },
      { href: '/admin/categories',  label: '商品カテゴリ',         Icon: List },
      { href: '/admin/product-tags',label: '商品タグ',            Icon: Tag },
      { href: '/admin/collections', label: '商品コレクション',      Icon: Layers },
      { href: '/admin/labels',      label: '商品ラベル',           Icon: Hash },
      { href: '/admin/brands',      label: 'ブランド',            Icon: Award },
      { href: '/admin/attributes',  label: 'アトリビュート',        Icon: Sliders },
      { href: '/admin/spec-tables', label: 'スペックテーブル',      Icon: Table2 },
      { href: '/admin/reviews',     label: 'レビュー',            Icon: Star },
      { href: '/admin/flash-sales', label: 'フラッシュセール',      Icon: Zap },
      { href: '/admin/discounts',   label: '割引',               Icon: Percent },
      { href: '/admin/taxes',       label: '税金',               Icon: Calculator },
      { href: '/admin/customers',   label: '顧客',               Icon: Users },
    ],
  },
  {
    label: 'マーケットプレイス',
    items: [
      { href: '/admin/stores',      label: 'ベンダー',            Icon: Store },
      { href: '/admin/withdrawals', label: '出金',               Icon: Wallet },
    ],
  },
  {
    label: 'コンテンツ',
    items: [
      { href: '/admin/blog',        label: 'ブログ',              Icon: BookOpen },
      { href: '/admin/newsletter',  label: 'ニュースレター',        Icon: Mail },
    ],
  },
  {
    label: '設定',
    items: [
      { href: '/admin/settings',    label: '設定',               Icon: Settings },
    ],
  },
]

function SidebarGroup({ group, pathname, defaultOpen }: { group: NavGroup; pathname: string; defaultOpen: boolean }) {
  const hasActive = group.items.some(item =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href)
  )
  const [open, setOpen] = useState(defaultOpen || hasActive)

  return (
    <div className="mb-1">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center justify-between w-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500 hover:text-gray-300 transition-colors"
      >
        <span>{group.label}</span>
        <ChevronDown className={cn('w-3 h-3 transition-transform', open ? 'rotate-0' : '-rotate-90')} />
      </button>

      {open && (
        <div className="mt-0.5 space-y-0.5">
          {group.items.map(({ href, label, Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors',
                  active
                    ? 'bg-primary-600 text-white font-medium'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                )}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{label}</span>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

function NotificationBell() {
  const { data } = useQuery({
    queryKey: ['admin-pending-orders-count'],
    queryFn: () => adminApi.orders({ status: 'pending', per_page: 1 }).then(r => r.data?.meta?.total ?? 0),
    refetchInterval: 60_000,
  })
  const count = data ?? 0
  return (
    <Link href="/admin/orders?status=pending" className="relative p-2 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
      <Bell className="w-5 h-5" />
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-2xs font-bold flex items-center justify-center">
          {count > 9 ? '9+' : count}
        </span>
      )}
    </Link>
  )
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { isAuthenticated, user, logout, _hasHydrated } = useUserAuthStore()

  useEffect(() => {
    if (_hasHydrated && !isAuthenticated) {
      router.replace('/login?redirect=/admin')
    }
  }, [_hasHydrated, isAuthenticated, router])

  if (!_hasHydrated || !isAuthenticated) return null

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-60 bg-gray-900 flex flex-col flex-shrink-0">
        <div className="px-5 py-4 border-b border-gray-800">
          <Link href="/admin" className="font-display text-xl font-bold text-white">
            Shofy <span className="text-primary-400 text-sm font-normal">Admin</span>
          </Link>
        </div>

        <nav className="flex-1 px-2 py-3 overflow-y-auto space-y-2">
          {NAV_GROUPS.map((group, i) => (
            <SidebarGroup key={group.label} group={group} pathname={pathname} defaultOpen={i === 0} />
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-gray-800">
          <div className="px-3 py-2 mb-2">
            <p className="text-xs font-medium text-white truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
          <button
            onClick={() => { logout(); router.push('/login?redirect=/admin') }}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            サインアウト
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Link href="/admin" className="hover:text-primary-500 transition-colors">Admin</Link>
            {pathname !== '/admin' && (
              <>
                <ChevronRight className="w-3.5 h-3.5" />
                <span className="text-gray-900 capitalize">
                  {pathname.split('/').filter(Boolean).slice(1).join(' / ')}
                </span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell />
            <Link href="/" target="_blank" className="text-xs text-gray-400 hover:text-primary-500 transition-colors">
              ストアを見る ↗
            </Link>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
