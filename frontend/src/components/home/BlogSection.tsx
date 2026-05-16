'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useQuery } from '@tanstack/react-query'
import { blogApi } from '@/lib/api'
import type { Blog } from '@/types'
import { getImageUrl, formatDate } from '@/lib/utils'
import { ArrowRight, Clock } from 'lucide-react'

export function BlogSection() {
  const { data, isLoading } = useQuery<{ data: Blog[] }>({
    queryKey: ['blogs', 'home'],
    queryFn: () => blogApi.list({ per_page: 3, featured: true }).then((r) => r.data),
    staleTime: 5 * 60_000,
  })

  if (!data?.data?.length && !isLoading) return null

  return (
    <section className="py-14">
      <div className="container-narrow">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-xs font-semibold text-primary-500 uppercase tracking-wider">Latest</span>
            <h2 className="section-title mt-1">From The Blog</h2>
          </div>
          <Link href="/blog" className="flex items-center gap-1.5 text-sm font-medium text-primary-500 hover:gap-3 transition-all">
            All Posts <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading
            ? [...Array(3)].map((_, i) => (
                <div key={i} className="card overflow-hidden">
                  <div className="h-48 skeleton" />
                  <div className="p-5 space-y-3">
                    <div className="h-3 skeleton rounded w-1/3" />
                    <div className="h-4 skeleton rounded" />
                    <div className="h-4 skeleton rounded w-3/4" />
                    <div className="h-3 skeleton rounded w-1/2" />
                  </div>
                </div>
              ))
            : data?.data?.map((post) => (
                <article key={post.id} className="card overflow-hidden group hover:shadow-card-hover transition-shadow">
                  <Link href={`/blog/${post.slug}`} className="block overflow-hidden">
                    <div className="relative h-48 overflow-hidden bg-gray-100">
                      <Image
                        src={getImageUrl(post.image)}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    </div>
                  </Link>
                  <div className="p-5">
                    {post.categories?.[0] && (
                      <Link
                        href={`/blog?category=${post.categories[0].slug}`}
                        className="text-xs font-semibold text-primary-500 uppercase tracking-wider hover:underline"
                      >
                        {post.categories[0].name}
                      </Link>
                    )}
                    <Link href={`/blog/${post.slug}`}>
                      <h3 className="font-display text-base font-semibold text-gray-900 mt-2 mb-2 line-clamp-2 group-hover:text-primary-500 transition-colors">
                        {post.title}
                      </h3>
                    </Link>
                    <p className="text-sm text-gray-500 line-clamp-2">{post.description}</p>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{post.published_at ? formatDate(post.published_at) : formatDate(post.created_at)}</span>
                      </div>
                      <Link href={`/blog/${post.slug}`} className="flex items-center gap-1 text-xs font-medium text-primary-500 hover:gap-2 transition-all">
                        Read More <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
        </div>
      </div>
    </section>
  )
}
