import { BlogListContent } from './BlogListContent'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blog - Latest News & Updates',
  description: 'Read the latest news, updates, and guides from MYKENKO.',
}

interface Props {
  searchParams: { search?: string; category?: string; page?: string }
}

export default function BlogPage({ searchParams }: Props) {
  return <BlogListContent searchParams={searchParams} />
}
