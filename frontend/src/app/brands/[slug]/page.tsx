import { Suspense } from 'react'
import type { Metadata } from 'next'
import BrandContent from './BrandContent'

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const name = params.slug.replace(/-/g, ' ')
  return {
    title: `${name} | Shofy`,
    description: `${name} の商品一覧 — Shofy マーケットプレイスで最高の ${name} 商品を探しましょう。`,
  }
}

export default function BrandPage({ params }: Props) {
  return (
    <Suspense fallback={
      <div className="flex justify-center py-20">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    }>
      <BrandContent slug={params.slug} />
    </Suspense>
  )
}
