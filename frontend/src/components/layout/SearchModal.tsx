'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, X, ArrowRight, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useQuery } from '@tanstack/react-query'
import { productApi } from '@/lib/api'
import { formatPrice, getImageUrl } from '@/lib/utils'
import type { Product } from '@/types'
import { useRouter } from 'next/navigation'

const POPULAR_SEARCHES = ['iPhone', 'Laptop', 'Shoes', 'Watch', 'Headphones', 'Camera']

interface SearchModalProps {
  open: boolean
  onClose: () => void
}

export function SearchModal({ open, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
      setTimeout(() => inputRef.current?.focus(), 50)
    } else {
      document.body.style.overflow = ''
      setQuery('')
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    if (open) document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const { data, isLoading } = useQuery<{ data: Product[] }>({
    queryKey: ['search', query],
    queryFn: () => productApi.list({ search: query, per_page: 5 }).then((r) => r.data),
    enabled: query.length >= 2,
    staleTime: 30_000,
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
      onClose()
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-slide-down">
        {/* Search input */}
        <form onSubmit={handleSearch} className="flex items-center gap-3 p-4 border-b border-gray-100">
          <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for products, brands, categories…"
            className="flex-1 text-gray-900 placeholder:text-gray-400 text-sm focus:outline-none"
          />
          {query && (
            <button type="button" onClick={() => setQuery('')} className="text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          )}
          <button type="submit" className="btn-primary text-xs px-4 py-2">Search</button>
        </form>

        {/* Results / Popular */}
        <div className="p-4 max-h-96 overflow-y-auto">
          {query.length < 2 ? (
            <div>
              <p className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                <TrendingUp className="w-3.5 h-3.5" /> Popular Searches
              </p>
              <div className="flex flex-wrap gap-2">
                {POPULAR_SEARCHES.map((term) => (
                  <button
                    key={term}
                    onClick={() => setQuery(term)}
                    className="px-3 py-1.5 rounded-full border border-gray-200 text-sm text-gray-600 hover:border-primary-500 hover:text-primary-500 transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          ) : isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3 animate-pulse">
                  <div className="w-12 h-12 rounded-lg skeleton" />
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-3 skeleton rounded w-3/4" />
                    <div className="h-3 skeleton rounded w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : !data?.data?.length ? (
            <p className="text-sm text-gray-500 text-center py-6">No products found for "{query}"</p>
          ) : (
            <>
              <div className="space-y-1">
                {data.data.map((product) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.slug}`}
                    onClick={onClose}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors group"
                  >
                    <div className="relative w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                      <Image
                        src={getImageUrl(product.image)}
                        alt={product.name}
                        fill
                        className="object-contain p-1"
                        sizes="48px"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 line-clamp-1 group-hover:text-primary-500 transition-colors">
                        {product.name}
                      </p>
                      <p className="text-xs text-primary-500 font-semibold">{formatPrice(product.current_price)}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-primary-500 transition-colors" />
                  </Link>
                ))}
              </div>
              <Link
                href={`/search?q=${encodeURIComponent(query)}`}
                onClick={onClose}
                className="flex items-center justify-center gap-2 mt-3 text-sm text-primary-500 font-medium hover:underline"
              >
                View all results for "{query}" <ArrowRight className="w-4 h-4" />
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
