import { Suspense } from 'react'
import type { Metadata } from 'next'
import CategoryContent from './CategoryContent'

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: `${params.slug.replace(/-/g, ' ')} | Shofy`,
    description: `Browse products in ${params.slug.replace(/-/g, ' ')}.`,
  }
}

export default function CategoryPage({ params }: Props) {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full" /></div>}>
      <CategoryContent slug={params.slug} />
    </Suspense>
  )
}
