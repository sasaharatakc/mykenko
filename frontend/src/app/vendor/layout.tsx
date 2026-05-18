'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useUserAuthStore } from '@/store/userAuthStore'
import {
  LayoutDashboard, Package, PlusCircle, Boxes, GitBranch, Upload, Download,
  ShoppingBag, Truck, RotateCcw, XCircle,
  Store, ShieldCheck, Calculator, Share2,
  TrendingUp, Wallet, Settings,
  Percent, Megaphone, BarChart2,
  Star,
  LogOut, ChevronRight, ChevronDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type NavItem = { href: string; label: string; Icon: any; exact?: boolean }
type NavGroup = { label: string; items: NavItem[]; alwaysOpen?: boolean }

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'ダッシュボード',
    alwaysOpen: true,
    items: [
      { href: '/vendor', label: 'ダッシュボード', Icon: LayoutDashboard, exact: true },
    ],
  },
  {
    label: '商品管理',
    items: [
      { href: '/vendor/products', label: '商品一覧', Icon: Package },
      { href: '/vendor/products/new', label: '商品追加', Icon: PlusCircle, exact: true },
      { href: '/vendor/inventory', label: '在庫管理', Icon: Boxes },
      { href: '/vendor/variants', label: 'バリアント', Icon: GitBranch },
      { href: '/vendor/products/import', label: 'CSVインポート', Icon: Upload, exact: true },
      { href: '/vendor/products/export', label: 'CSVエクスポート', Icon: Download, exact: true },
    ],
  },
  {
    label: '注文管理',
    items: [
      { href: '/vendor/orders', label: '注文一覧', Icon: ShoppingBag },
      { href: '/vendor/shipments', label: '出荷管理', Icon: Truck },
      { href: '/vendor/returns', label: '返品・返金', Icon: RotateCcw },
      { href: '/vendor/cancellations', label: 'キャンセル', Icon: XCircle },
    ],
  },
  {
    label: '店舗設定',
    items: [
      { href: '/vendor/store', label: '基本情報', Icon: Store, exact: true },
      { href: '/vendor/store/verification', label: '本人確認', Icon: ShieldCheck },
      { href: '/vendor/store/tax', label: '税務設定', Icon: Calculator },
      { href: '/vendor/store/social', label: 'SNSリンク', Icon: Share2 },
    ],
  },
  {
    label: '財務管理',
    items: [
      { href: '/vendor/finance', label: '収益レポート', Icon: TrendingUp, exact: true },
      { href: '/vendor/payouts', label: '出金・精算', Icon: Wallet },
      { href: '/vendor/finance/settings', label: '支払い設定', Icon: Settings },
    ],
  },
  {
    label: 'マーケティング',
    items: [
      { href: '/vendor/marketing/coupons', label: 'クーポン', Icon: Percent },
      { href: '/vendor/marketing/campaigns', label: 'キャンペーン', Icon: Megaphone },
      { href: '/vendor/marketing/ads', label: '広告', Icon: BarChart2 },
    ],
  },
  {
    label: 'レビュー',
    items: [
      { href: '/vendor/reviews', label: '顧客レビュー', Icon: Star, exact: true },
      { href: '/vendor/reviews/analytics', label: '評価分析', Icon: TrendingUp },
    ],
  },
]

function groupHasActive(group: NavGroup, pathname: string): boolean {
  return group.items.some(item =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href)
  )
}

function SidebarGroup({ group, pathname }: { group: NavGroup; pathname: string }) {
  const hasActive = groupHasActive(group, pathname)
  const [open, setOpen] = useState(group.alwaysOpen || hasActive)

  useEffect(() => {
    if (hasActive) setOpen(true)
  }, [hasActive])

  return (
    <div className="mb-1">
      {group.alwaysOpen ? (
        <p className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400">
          {group.label}
        </p>
      ) : (
        <button
          onClick={() => setOpen(o => !o)}
          className="flex items-center justify-between w-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400 hover:text-gray-600 transition-colors"
        >
          <span>{group.label}</span>
          <ChevronDown className={cn('w-3 h-3 transition-transform', open ? 'rotate-0' : '-rotate-90')} />
        </button>
      )}

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
                    ? 'bg-primary-50 text-primary-600 font-medium'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
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
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
        <div className="px-5 py-4 border-b border-gray-100">
          <Link href="/vendor" className="block">
            <span className="font-display text-xl font-bold text-gray-900">MYKENKO</span>
            <p className="text-xs text-gray-400 mt-0.5">ベンダーハブ</p>
          </Link>
        </div>

        <nav className="flex-1 px-2 py-3 overflow-y-auto space-y-1">
          {NAV_GROUPS.map(group => (
            <SidebarGroup key={group.label} group={group} pathname={pathname} />
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-gray-100 space-y-1">
          <div className="px-3 py-2">
            <p className="text-xs font-medium text-gray-900 truncate">{user?.name}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          </div>
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Store className="w-4 h-4" />
            ストアを見る ↗
          </Link>
          <button
            onClick={() => { logout(); router.push('/login?redirect=/vendor') }}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            サインアウト
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-2 text-sm text-gray-500">
          <Link href="/vendor" className="hover:text-primary-500 transition-colors text-gray-900 font-medium">
            ベンダー
          </Link>
          {pathname !== '/vendor' && (
            <>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-gray-600">
                {pathname.split('/').filter(Boolean).slice(1).join(' / ')}
              </span>
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
