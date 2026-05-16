import { HeroSection } from '@/components/home/HeroSection'
import { CategoryBar } from '@/components/home/CategoryBar'
import { FeaturedProducts } from '@/components/home/FeaturedProducts'
import { FlashSaleSection } from '@/components/home/FlashSaleSection'
import { NewArrivals } from '@/components/home/NewArrivals'
import { BrandSection } from '@/components/home/BrandSection'
import { BestSellers } from '@/components/home/BestSellers'
import { FeaturedStores } from '@/components/home/FeaturedStores'
import { BlogSection } from '@/components/home/BlogSection'
import { FeatureBanner } from '@/components/home/FeatureBanner'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Shofy - Best Online Marketplace',
  description: 'Shop millions of products from verified vendors. Best prices, fast delivery.',
}

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <CategoryBar />
      <FeatureBanner />
      <FlashSaleSection />
      <FeaturedProducts />
      <NewArrivals />
      <BrandSection />
      <BestSellers />
      <FeaturedStores />
      <BlogSection />
    </>
  )
}
