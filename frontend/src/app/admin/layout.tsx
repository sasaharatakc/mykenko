'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useUserAuthStore } from '@/store/userAuthStore'
import { useQuery } from '@tanstack/react-query'
import { adminApi } from '@/lib/api'
import {
  LayoutDashboard, BarChart2,
  Package, PlusCircle, FolderTree, Award, Tag, Sliders, GitBranch, Boxes, Table2, Star,
  ShoppingBag, Receipt, Truck, RotateCcw, CreditCard,
  Users, UsersRound,
  Percent, Zap, Layers, Hash,
  Store, CheckCircle, ShieldCheck,
  DollarSign, Wallet, Banknote,
  FileText, BookOpen, HelpCircle, Menu, Mail, Bell,
  Palette, LayoutTemplate, SlidersHorizontal, Puzzle, PanelBottom, Type, Paintbrush, Code2,
  Tags, Map, FileCode, Braces, LineChart, Facebook,
  UserCog, Shield, KeyRound, Plug, Languages, ScrollText, HardDrive, Database, Clock, Lock,
  Settings, LogOut, ChevronRight, ChevronDown,
  Image as ImageIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type NavItem = { href: string; label: string; Icon: any; exact?: boolean }
type SubHeader = { type: 'subheader'; label: string }
type NavGroup = {
  label: string
  items: Array<NavItem | SubHeader>
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'ダッシュボード',
    items: [
      { href: '/admin',          label: 'ダッシュボード', Icon: LayoutDashboard, exact: true },
      { href: '/admin/reports',  label: 'レポート',       Icon: BarChart2 },
    ],
  },
  {
    label: 'Eコマース',
    items: [
      { type: 'subheader', label: '商品管理' },
      { href: '/admin/products',       label: '商品一覧',       Icon: Package },
      { href: '/admin/products/new',   label: '商品追加',       Icon: PlusCircle, exact: true },
      { href: '/admin/categories',     label: 'カテゴリ',       Icon: FolderTree },
      { href: '/admin/brands',         label: 'ブランド',       Icon: Award },
      { href: '/admin/product-tags',   label: 'タグ',           Icon: Tag },
      { href: '/admin/attributes',     label: 'アトリビュート', Icon: Sliders },
      { href: '/admin/variants',       label: 'バリアント',     Icon: GitBranch },
      { href: '/admin/inventory',      label: '在庫管理',       Icon: Boxes },
      { href: '/admin/spec-tables',    label: 'スペックテーブル', Icon: Table2 },
      { href: '/admin/reviews',        label: 'レビュー',       Icon: Star },

      { type: 'subheader', label: '注文管理' },
      { href: '/admin/orders',         label: '注文一覧',       Icon: ShoppingBag },
      { href: '/admin/invoices',       label: '請求書',         Icon: Receipt },
      { href: '/admin/shipments',      label: '出荷管理',       Icon: Truck },
      { href: '/admin/returns',        label: '返品管理',       Icon: RotateCcw },
      { href: '/admin/payments',       label: '決済管理',       Icon: CreditCard },

      { type: 'subheader', label: '顧客管理' },
      { href: '/admin/customers',      label: '顧客一覧',       Icon: Users },
      { href: '/admin/customer-groups',label: '顧客グループ',   Icon: UsersRound },

      { type: 'subheader', label: 'プロモーション' },
      { href: '/admin/discounts',      label: 'クーポン',       Icon: Percent },
      { href: '/admin/flash-sales',    label: 'フラッシュセール', Icon: Zap },
      { href: '/admin/banners',        label: 'バナー管理',     Icon: ImageIcon },
      { href: '/admin/collections',    label: 'コレクション',   Icon: Layers },
      { href: '/admin/labels',         label: 'ラベル管理',     Icon: Hash },
    ],
  },
  {
    label: 'マーケットプレイス',
    items: [
      { type: 'subheader', label: 'ベンダー管理' },
      { href: '/admin/stores',              label: 'ベンダー一覧',   Icon: Store },
      { href: '/admin/vendor-approval',     label: 'ベンダー承認',   Icon: CheckCircle },
      { href: '/admin/vendor-verification', label: '本人確認',       Icon: ShieldCheck },

      { type: 'subheader', label: '財務管理' },
      { href: '/admin/commissions',    label: '手数料設定',     Icon: DollarSign },
      { href: '/admin/withdrawals',    label: '出金管理',       Icon: Wallet },
      { href: '/admin/vendor-payouts', label: 'ベンダー支払い', Icon: Banknote },
    ],
  },
  {
    label: 'コンテンツ',
    items: [
      { href: '/admin/pages',          label: '固定ページ',     Icon: FileText },
      { href: '/admin/blog',           label: 'ブログ',         Icon: BookOpen },
      { href: '/admin/faq-admin',      label: 'FAQ',            Icon: HelpCircle },
      { href: '/admin/menus',          label: 'メニュー',       Icon: Menu },
      { href: '/admin/media',          label: 'メディア',       Icon: ImageIcon },
      { href: '/admin/contact-forms',  label: 'お問い合わせ',   Icon: Mail },
      { href: '/admin/newsletter',     label: 'ニュースレター', Icon: Bell },
    ],
  },
  {
    label: '外観',
    items: [
      { href: '/admin/appearance/theme',       label: 'テーマ設定',     Icon: Palette },
      { href: '/admin/appearance/homepage',    label: 'ホームビルダー', Icon: LayoutTemplate },
      { href: '/admin/appearance/sliders',     label: 'スライダー',     Icon: SlidersHorizontal },
      { href: '/admin/appearance/widgets',     label: 'ウィジェット',   Icon: Puzzle },
      { href: '/admin/appearance/footer',      label: 'フッター',       Icon: PanelBottom },
      { href: '/admin/appearance/typography',  label: 'タイポグラフィ', Icon: Type },
      { href: '/admin/appearance/colors',      label: 'カラー設定',     Icon: Paintbrush },
      { href: '/admin/appearance/custom-code', label: 'カスタムコード', Icon: Code2 },
    ],
  },
  {
    label: 'SEO',
    items: [
      { href: '/admin/seo/meta',             label: 'メタタグ',          Icon: Tags },
      { href: '/admin/seo/sitemap',          label: 'サイトマップ',      Icon: Map },
      { href: '/admin/seo/robots',           label: 'robots.txt',        Icon: FileCode },
      { href: '/admin/seo/structured-data',  label: '構造化データ',      Icon: Braces },
      { href: '/admin/seo/analytics',        label: 'Google Analytics',  Icon: LineChart },
      { href: '/admin/seo/gtm',              label: 'Google Tag Manager', Icon: Tag },
      { href: '/admin/seo/pixel',            label: 'Facebook Pixel',    Icon: Facebook },
    ],
  },
  {
    label: 'システム',
    items: [
      { href: '/admin/users',       label: '管理ユーザー',   Icon: UserCog },
      { href: '/admin/roles',       label: 'ロール管理',     Icon: Shield },
      { href: '/admin/permissions', label: '権限管理',       Icon: KeyRound },
      { href: '/admin/plugins',     label: 'プラグイン',     Icon: Plug },
      { href: '/admin/language',    label: '言語設定',       Icon: Languages },
      { href: '/admin/logs',        label: 'システムログ',   Icon: ScrollText },
      { href: '/admin/backup',      label: 'バックアップ',   Icon: HardDrive },
      { href: '/admin/cache',       label: 'キャッシュ',     Icon: Database },
      { href: '/admin/cron',        label: 'Cronジョブ',    Icon: Clock },
      { href: '/admin/security',    label: 'セキュリティ',   Icon: Lock },
    ],
  },
  {
    label: '設定',
    items: [
      { href: '/admin/settings', label: 'サイト設定', Icon: Settings },
    ],
  },
]

function isNavItem(item: NavItem | SubHeader): item is NavItem {
  return !('type' in item)
}

function groupHasActive(group: NavGroup, pathname: string): boolean {
  return group.items.some(item => {
    if (!isNavItem(item)) return false
    return item.exact ? pathname === item.href : pathname.startsWith(item.href)
  })
}

function SidebarGroup({
  group,
  pathname,
}: {
  group: NavGroup
  pathname: string
}) {
  const hasActive = groupHasActive(group, pathname)
  const [open, setOpen] = useState(hasActive)

  // sync open state when active group changes (e.g. navigation)
  useEffect(() => {
    if (hasActive) setOpen(true)
  }, [hasActive])

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
          {group.items.map((item, idx) => {
            if (!isNavItem(item)) {
              return (
                <p
                  key={`subheader-${idx}`}
                  className="text-xs font-semibold text-gray-600 uppercase tracking-wider px-3 pt-4 pb-1 first:pt-1"
                >
                  {item.label}
                </p>
              )
            }
            const { href, label, Icon, exact } = item
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
    <Link
      href="/admin/orders?status=pending"
      className="relative p-2 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
    >
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
      <aside className="w-64 bg-gray-950 flex flex-col flex-shrink-0">
        <div className="px-5 py-4 border-b border-gray-800">
          <Link href="/admin" className="font-display text-xl font-bold text-white">
            MYKENKO <span className="text-primary-400 text-sm font-normal">Admin</span>
          </Link>
        </div>

        <nav className="flex-1 px-2 py-3 overflow-y-auto space-y-2">
          {NAV_GROUPS.map(group => (
            <SidebarGroup key={group.label} group={group} pathname={pathname} />
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
