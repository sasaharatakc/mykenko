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
  title: 'MYKENKO - 医薬品個人輸入マーケットプレイス',
  description: 'MYKENKOは日本最大級の医薬品個人輸入マーケットプレイスです。安全・安心にご購入いただけます。',
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
