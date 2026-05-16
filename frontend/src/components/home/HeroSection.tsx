'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRef } from 'react'
import { ChevronRight, Star, ShoppingBag, Truck, Shield } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { productApi } from '@/lib/api'
import Autoplay from 'embla-carousel-autoplay'
import useEmblaCarousel from 'embla-carousel-react'

const HERO_SLIDES = [
  {
    id: 1,
    title: 'Discover Amazing\nProducts Online',
    subtitle: 'Shop from thousands of verified vendors',
    badge: 'New Collection 2025',
    cta: { text: 'Shop Now', href: '/shop' },
    image: '/images/hero-1.jpg',
    bg: 'from-blue-50 to-indigo-50',
    accent: 'text-primary-500',
  },
  {
    id: 2,
    title: 'Flash Sale\nUp to 70% Off',
    subtitle: 'Limited time deals on top brands',
    badge: 'Today Only',
    cta: { text: 'View Deals', href: '/shop?sale=1' },
    image: '/images/hero-2.jpg',
    bg: 'from-orange-50 to-amber-50',
    accent: 'text-secondary-500',
  },
]

export function HeroSection() {
  const [emblaRef] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 5000 })])

  return (
    <section className="bg-gray-50">
      <div className="container-narrow py-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Main Slider */}
          <div ref={emblaRef} className="lg:col-span-2 overflow-hidden rounded-2xl">
            <div className="flex">
              {HERO_SLIDES.map((slide) => (
                <div
                  key={slide.id}
                  className={`flex-none w-full bg-gradient-to-br ${slide.bg} rounded-2xl p-8 md:p-12 flex items-center justify-between gap-8 min-h-[380px]`}
                >
                  <div className="flex-1 max-w-sm">
                    <span className={`badge bg-white text-xs font-semibold ${slide.accent} shadow-sm mb-4 inline-flex`}>
                      {slide.badge}
                    </span>
                    <h1 className="font-display text-3xl md:text-4xl font-bold text-gray-900 leading-tight whitespace-pre-line mb-3">
                      {slide.title}
                    </h1>
                    <p className="text-gray-500 mb-6">{slide.subtitle}</p>
                    <Link href={slide.cta.href} className="btn-primary gap-2">
                      {slide.cta.text}
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                    <div className="flex items-center gap-4 mt-6 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" /> 4.9 Rating</span>
                      <span className="flex items-center gap-1"><ShoppingBag className="w-3.5 h-3.5" /> 50k+ Products</span>
                    </div>
                  </div>
                  <div className="hidden md:block relative w-52 h-52 flex-shrink-0">
                    <div className="w-full h-full bg-white/60 rounded-2xl shadow-lg" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Side Banners */}
          <div className="flex flex-col gap-4">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 flex-1">
              <span className="badge bg-white text-success text-xs font-semibold">Free Shipping</span>
              <h3 className="font-display text-xl font-semibold text-gray-900 mt-3 mb-1">Orders over $50</h3>
              <p className="text-sm text-gray-500 mb-4">Enjoy free delivery on all qualifying orders.</p>
              <Link href="/shop" className="flex items-center gap-1 text-primary-500 text-sm font-medium hover:gap-2 transition-all">
                Shop Now <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl p-6 flex-1">
              <span className="badge bg-white text-purple-600 text-xs font-semibold">Vendor Program</span>
              <h3 className="font-display text-xl font-semibold text-gray-900 mt-3 mb-1">Sell on Shofy</h3>
              <p className="text-sm text-gray-500 mb-4">Reach millions of customers. Start for free.</p>
              <Link href="/become-vendor" className="flex items-center gap-1 text-primary-500 text-sm font-medium hover:gap-2 transition-all">
                Get Started <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Feature bars */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          {[
            { icon: Truck, title: 'Free Delivery', desc: 'On orders over $50' },
            { icon: Shield, title: 'Secure Payment', desc: '100% protected' },
            { icon: Star, title: 'Best Quality', desc: 'Verified vendors only' },
            { icon: ShoppingBag, title: 'Easy Returns', desc: '30-day return policy' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-center gap-3 bg-white rounded-xl p-3.5 shadow-card">
              <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-primary-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{title}</p>
                <p className="text-2xs text-gray-400">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
