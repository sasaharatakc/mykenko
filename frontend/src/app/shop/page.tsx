import { ShopContent } from './ShopContent'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Shop - Browse All Products',
  description: 'Browse thousands of products from verified vendors. Filter by category, brand, price and more.',
}

interface ShopPageProps {
  searchParams: {
    search?: string
    category?: string
    brands?: string
    min_price?: string
    max_price?: string
    sort?: string
    page?: string
    in_stock?: string
    rating?: string
  }
}

export default function ShopPage({ searchParams }: ShopPageProps) {
  return <ShopContent searchParams={searchParams} />
}
