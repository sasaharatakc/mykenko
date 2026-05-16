'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { Search, ShoppingCart, Heart, User, Menu, X, ChevronDown, Moon, Sun } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { useAuthStore } from '@/store/authStore'
import { useWishlistStore } from '@/store/wishlistStore'
import { cn } from '@/lib/utils'
import { CartDrawer } from '@/components/cart/CartDrawer'
import { SearchModal } from '@/components/layout/SearchModal'
import { useQuery } from '@tanstack/react-query'
import { categoryApi } from '@/lib/api'
import type { ProductCategory } from '@/types'
import { useTheme } from 'next-themes'

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { theme, setTheme } = useTheme()

  const { summary } = useCartStore()
  const itemCount = summary?.item_count ?? 0
  const { isAuthenticated, customer } = useAuthStore()
  const { ids: wishlistIds } = useWishlistStore()

  const { data: categories } = useQuery<ProductCategory[]>({
    queryKey: ['categories'],
    queryFn: () => categoryApi.list().then((r) => r.data?.data ?? []),
    staleTime: 5 * 60_000,
  })

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      {/* Announcement Bar */}
      <div className="bg-primary-500 text-white text-center text-xs py-2 px-4">
        Free shipping on orders over $50! Use code{' '}
        <span className="font-semibold">FREESHIP</span>
      </div>

      {/* Main Header */}
      <header
        className={cn(
          'sticky top-0 z-50 bg-white border-b border-gray-100 transition-shadow duration-200',
          scrolled && 'shadow-dropdown'
        )}
      >
        <div className="container-narrow">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0">
              <span className="font-display text-2xl font-bold text-primary-500">Shofy</span>
            </Link>

            {/* Nav – desktop */}
            <nav className="hidden lg:flex items-center gap-1">
              <Link href="/" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-500 rounded-lg transition-colors">
                Home
              </Link>
              <div className="relative group">
                <button className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-500 rounded-lg transition-colors">
                  Shop <ChevronDown className="w-3.5 h-3.5" />
                </button>
                <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <Link href="/shop" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-500 transition-colors">
                    All Products
                  </Link>
                  {categories?.slice(0, 8).map((cat) => (
                    <Link key={cat.id} href={`/shop?category=${cat.slug}`} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-500 transition-colors">
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>
              <Link href="/stores" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-500 rounded-lg transition-colors">
                Vendors
              </Link>
              <Link href="/blog" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-500 rounded-lg transition-colors">
                Blog
              </Link>
              <Link href="/contact" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-500 rounded-lg transition-colors">
                Contact
              </Link>
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-1">
              <button onClick={() => setSearchOpen(true)} className="btn-icon" aria-label="Search">
                <Search className="w-5 h-5" />
              </button>

              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="btn-icon hidden sm:flex"
                aria-label="Toggle dark mode"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              <Link href="/wishlist" className="btn-icon relative" aria-label="Wishlist">
                <Heart className="w-5 h-5" />
                {wishlistIds.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-danger text-white text-2xs font-bold flex items-center justify-center">
                    {wishlistIds.length > 9 ? '9+' : wishlistIds.length}
                  </span>
                )}
              </Link>

              <button onClick={() => setCartOpen(true)} className="btn-icon relative" aria-label="Cart">
                <ShoppingCart className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-primary-500 text-white text-2xs font-bold flex items-center justify-center">
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </button>

              {isAuthenticated ? (
                <Link href="/account" className="btn-icon" aria-label="Account">
                  {customer?.avatar ? (
                    <Image src={customer.avatar} alt={customer.name} width={28} height={28} className="rounded-full object-cover" />
                  ) : (
                    <User className="w-5 h-5" />
                  )}
                </Link>
              ) : (
                <Link href="/login" className="hidden sm:flex btn-primary text-xs px-4 py-2">
                  Sign In
                </Link>
              )}

              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="lg:hidden btn-icon"
                aria-label="Menu"
              >
                {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="lg:hidden border-t border-gray-100 bg-white animate-slide-down">
            <nav className="container-narrow py-4 flex flex-col gap-1">
              {[
                { href: '/', label: 'Home' },
                { href: '/shop', label: 'Shop' },
                { href: '/stores', label: 'Vendors' },
                { href: '/blog', label: 'Blog' },
                { href: '/contact', label: 'Contact' },
                { href: '/account', label: 'My Account' },
              ].map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="px-4 py-2.5 text-sm font-medium text-gray-700 hover:text-primary-500 hover:bg-gray-50 rounded-lg transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  {label}
                </Link>
              ))}
              {!isAuthenticated && (
                <div className="mt-2 pt-2 border-t border-gray-100 flex gap-2 px-4">
                  <Link href="/login" onClick={() => setMenuOpen(false)} className="flex-1 btn-primary text-center text-sm">
                    Sign In
                  </Link>
                  <Link href="/register" onClick={() => setMenuOpen(false)} className="flex-1 btn-secondary text-center text-sm">
                    Register
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </header>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}
