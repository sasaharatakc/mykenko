import { ProductDetailContent } from './ProductDetailContent'
import type { Metadata } from 'next'

interface Props { params: { slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/products/${params.slug}`,
      { next: { revalidate: 3600 } }
    )
    const data = await res.json()
    const product = data.data ?? data
    return {
      title: product.name,
      description: product.description,
      openGraph: {
        title: product.name,
        description: product.description,
        images: product.image ? [product.image] : [],
      },
    }
  } catch {
    return { title: 'Product' }
  }
}

export default function ProductPage({ params }: Props) {
  return <ProductDetailContent slug={params.slug} />
}
