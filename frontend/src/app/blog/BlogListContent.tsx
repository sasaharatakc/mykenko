'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { blogApi } from '@/lib/api'
import type { Blog, BlogCategory, PaginatedResponse } from '@/types'
import { Pagination } from '@/components/ui/Pagination'
import { getImageUrl, formatDate } from '@/lib/utils'
import { Search, Clock, Eye, ArrowRight } from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'

interface BlogListContentProps {
  searchParams: { search?: string; category?: string; page?: string }
}

export function BlogListContent({ searchParams }: BlogListContentProps) {
  const router = useRouter()
  const pathname = usePathname()

  const { data, isLoading } = useQuery<PaginatedResponse<Blog>>({
    queryKey: ['blogs', searchParams],
    queryFn: () => blogApi.list({
      search: searchParams.search,
      category: searchParams.category,
      page: searchParams.page,
      per_page: 9,
    }).then((r) => r.data),
  })

  const { data: categories } = useQuery<BlogCategory[]>({
    queryKey: ['blog-categories'],
    queryFn: () => blogApi.categories().then((r) => r.data),
    staleTime: 10 * 60_000,
  })

  const updateParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(
      Object.entries(searchParams).filter(([, v]) => v !== undefined) as [string, string][]
    )
    if (value) params.set(key, value)
    else params.delete(key)
    params.delete('page')
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="container-narrow py-10 text-center">
          <h1 className="font-display text-3xl font-bold text-gray-900">Our Blog</h1>
          <p className="text-gray-500 mt-2">Tips, news and updates from the Shofy team</p>
          <div className="relative max-w-md mx-auto mt-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              defaultValue={searchParams.search}
              placeholder="Search articles…"
              className="input pl-10 py-3"
              onChange={(e) => {
                const value = e.target.value
                const timeout = setTimeout(() => updateParam('search', value || null), 400)
                return () => clearTimeout(timeout)
              }}
            />
          </div>
        </div>
      </div>

      <div className="container-narrow py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="hidden lg:block w-56 flex-shrink-0">
            <div className="bg-white rounded-2xl p-5 border border-gray-100 sticky top-24">
              <h3 className="font-semibold text-sm text-gray-900 mb-3">Categories</h3>
              <ul className="space-y-1">
                <li>
                  <button
                    onClick={() => updateParam('category', null)}
                    className={`text-sm w-full text-left px-2 py-1.5 rounded-lg transition-colors ${!searchParams.category ? 'text-primary-500 font-medium bg-primary-50' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    All Posts
                  </button>
                </li>
                {categories?.map((cat) => (
                  <li key={cat.id}>
                    <button
                      onClick={() => updateParam('category', cat.slug)}
                      className={`flex items-center justify-between text-sm w-full text-left px-2 py-1.5 rounded-lg transition-colors ${searchParams.category === cat.slug ? 'text-primary-500 font-medium bg-primary-50' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                      {cat.name}
                      {cat.posts_count !== undefined && (
                        <span className="text-xs text-gray-400">({cat.posts_count})</span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Posts Grid */}
          <div className="flex-1 min-w-0">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="card overflow-hidden">
                    <div className="h-48 skeleton" />
                    <div className="p-5 space-y-3">
                      <div className="h-3 skeleton rounded w-1/3" />
                      <div className="h-4 skeleton rounded" />
                      <div className="h-3 skeleton rounded w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : !data?.data?.length ? (
              <div className="flex flex-col items-center py-20 gap-4 text-center">
                <span className="text-6xl">📝</span>
                <h3 className="font-display text-xl font-semibold text-gray-900">No posts found</h3>
                <button onClick={() => router.push(pathname)} className="btn-primary">Clear Filters</button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {data.data.map((post) => (
                    <article key={post.id} className="card overflow-hidden group hover:shadow-card-hover transition-shadow">
                      <Link href={`/blog/${post.slug}`} className="block">
                        <div className="relative h-48 overflow-hidden bg-gray-100">
                          <Image
                            src={getImageUrl(post.image)}
                            alt={post.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          />
                          {post.is_featured && (
                            <span className="absolute top-3 left-3 badge bg-primary-500 text-white text-2xs">Featured</span>
                          )}
                        </div>
                      </Link>
                      <div className="p-5">
                        {post.categories?.[0] && (
                          <button
                            onClick={() => updateParam('category', post.categories![0].slug)}
                            className="text-xs font-semibold text-primary-500 uppercase tracking-wider hover:underline"
                          >
                            {post.categories[0].name}
                          </button>
                        )}
                        <Link href={`/blog/${post.slug}`}>
                          <h2 className="font-display text-base font-semibold text-gray-900 mt-2 mb-2 line-clamp-2 group-hover:text-primary-500 transition-colors">
                            {post.title}
                          </h2>
                        </Link>
                        <p className="text-sm text-gray-500 line-clamp-2">{post.description}</p>
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center gap-3 text-xs text-gray-400">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {post.published_at ? formatDate(post.published_at, { month: 'short', day: 'numeric', year: 'numeric' }) : formatDate(post.created_at, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {post.views}
                            </span>
                          </div>
                          <Link href={`/blog/${post.slug}`} className="flex items-center gap-1 text-xs font-medium text-primary-500 hover:gap-2 transition-all">
                            Read <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
                {data.meta && data.meta.last_page > 1 && (
                  <div className="mt-8">
                    <Pagination
                      currentPage={data.meta.current_page}
                      lastPage={data.meta.last_page}
                      onPageChange={(p) => updateParam('page', String(p))}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
