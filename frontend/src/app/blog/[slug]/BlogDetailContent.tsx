'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { blogApi } from '@/lib/api'
import type { Blog } from '@/types'
import { getImageUrl, formatDate } from '@/lib/utils'
import { Clock, Eye, ArrowLeft, Tag } from 'lucide-react'

interface BlogDetailContentProps {
  slug: string
}

export function BlogDetailContent({ slug }: BlogDetailContentProps) {
  const { data: post, isLoading } = useQuery<Blog>({
    queryKey: ['blog', slug],
    queryFn: () => blogApi.show(slug).then((r) => r.data?.post
      ? { ...r.data.post, related_posts: r.data.related ?? [] }
      : undefined
    ),
  })

  if (isLoading) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="container-narrow py-10 max-w-3xl mx-auto">
          <div className="h-8 skeleton rounded w-2/3 mb-4" />
          <div className="h-4 skeleton rounded w-1/3 mb-8" />
          <div className="h-80 skeleton rounded-2xl mb-8" />
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-4 skeleton rounded" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="flex flex-col items-center py-32 gap-4 text-center">
        <span className="text-6xl">📄</span>
        <h2 className="font-display text-2xl font-semibold text-gray-900">Post not found</h2>
        <Link href="/blog" className="btn-primary">Back to Blog</Link>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="container-narrow py-8 max-w-3xl mx-auto">
          <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-500 transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>

          {post.categories?.[0] && (
            <Link
              href={`/blog?category=${post.categories[0].slug}`}
              className="inline-block text-xs font-semibold text-primary-500 uppercase tracking-wider hover:underline mb-3"
            >
              {post.categories[0].name}
            </Link>
          )}

          <h1 className="font-display text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-500">
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              {post.published_at
                ? formatDate(post.published_at, { month: 'long', day: 'numeric', year: 'numeric' })
                : formatDate(post.created_at, { month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
            <span className="flex items-center gap-1.5">
              <Eye className="w-4 h-4" />
              {post.views} views
            </span>
          </div>
        </div>
      </div>

      <div className="container-narrow py-10 max-w-3xl mx-auto">
        {/* Featured Image */}
        {post.image && (
          <div className="relative h-64 sm:h-96 rounded-2xl overflow-hidden mb-10 shadow-card">
            <Image
              src={getImageUrl(post.image)}
              alt={post.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 800px"
            />
          </div>
        )}

        {/* Description */}
        {post.description && (
          <p className="text-lg text-gray-600 leading-relaxed border-l-4 border-primary-500 pl-4 mb-8">
            {post.description}
          </p>
        )}

        {/* Content */}
        {post.content && (
          <div
            className="prose prose-gray max-w-none prose-headings:font-display prose-a:text-primary-500 prose-img:rounded-xl"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        )}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mt-10 pt-6 border-t border-gray-200">
            <Tag className="w-4 h-4 text-gray-400" />
            {post.tags.map((tag) => (
              <Link
                key={tag.id}
                href={`/blog?tag=${tag.slug}`}
                className="px-3 py-1 bg-gray-100 hover:bg-primary-50 hover:text-primary-500 text-gray-600 text-sm rounded-full transition-colors"
              >
                {tag.name}
              </Link>
            ))}
          </div>
        )}

        {/* Related Posts */}
        {post.related_posts && post.related_posts.length > 0 && (
          <div className="mt-12">
            <h3 className="font-display text-xl font-semibold text-gray-900 mb-6">Related Posts</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {post.related_posts.map((related) => (
                <Link key={related.id} href={`/blog/${related.slug}`} className="card overflow-hidden group hover:shadow-card-hover transition-shadow">
                  <div className="relative h-40 overflow-hidden bg-gray-100">
                    <Image
                      src={getImageUrl(related.image)}
                      alt={related.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 640px) 100vw, 50vw"
                    />
                  </div>
                  <div className="p-4">
                    <h4 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-primary-500 transition-colors">
                      {related.title}
                    </h4>
                    <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {related.published_at
                        ? formatDate(related.published_at, { month: 'short', day: 'numeric', year: 'numeric' })
                        : formatDate(related.created_at, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
