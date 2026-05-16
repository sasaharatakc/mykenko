import { blogApi } from '@/lib/api'
import { BlogDetailContent } from './BlogDetailContent'
import type { Metadata } from 'next'

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const res = await blogApi.show(params.slug)
    const post = res.data?.post
    return {
      title: post?.title,
      description: post?.description,
      openGraph: {
        title: post?.title,
        description: post?.description,
        images: post?.image ? [post.image] : [],
      },
    }
  } catch {
    return { title: 'Blog Post' }
  }
}

export default function BlogDetailPage({ params }: Props) {
  return <BlogDetailContent slug={params.slug} />
}
