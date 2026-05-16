import type { Metadata } from 'next'
import Link from 'next/link'
import { Users, Store, ShoppingBag, Globe } from 'lucide-react'

export const metadata: Metadata = { title: 'About Us | MYKENKO' }

export default function AboutPage() {
  return (
    <div className="container-narrow py-16">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-display text-4xl font-bold text-gray-900 mb-4">About MYKENKO</h1>
        <p className="text-lg text-gray-500 mb-12">
          MYKENKO（マイケンコー）は日本最大級の医薬品個人輸入マーケットプレイスで、世界中の認定ベンダーと購入者をつなぎます。
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-16">
          {[
            { icon: Users, stat: '1M+', label: 'Happy Customers' },
            { icon: Store, stat: '50k+', label: 'Verified Vendors' },
            { icon: ShoppingBag, stat: '5M+', label: 'Products' },
            { icon: Globe, stat: '120+', label: 'Countries' },
          ].map(({ icon: Icon, stat, label }) => (
            <div key={label} className="text-center p-6 bg-gray-50 rounded-2xl">
              <Icon className="w-8 h-8 text-primary-500 mx-auto mb-3" />
              <p className="text-2xl font-bold text-gray-900">{stat}</p>
              <p className="text-sm text-gray-500">{label}</p>
            </div>
          ))}
        </div>

        <div className="prose prose-gray max-w-none">
          <h2>Our Mission</h2>
          <p>
            私たちは、すべての方が安全かつ手頃な価格で医薬品を入手できる世界を目指しています。
            MYKENKOは認定ベンダーを世界中のお客様とつなぎ、信頼できる購入体験を提供します。
          </p>

          <h2>For Buyers</h2>
          <p>
            MYKENKOに登録されたすべてのベンダーは審査済みです。
            購入者保護、簡単な返品対応、安全な決済をすべての注文でご利用いただけます。
          </p>

          <h2>For Vendors</h2>
          <p>
            数分でストアを開設できます。初期費用不要で数百万人のお客様にリーチし、
            決済処理はMYKENKOに任せて商品に集中できます。
          </p>
        </div>

        <div className="mt-12 flex gap-4">
          <Link href="/become-vendor" className="btn-primary">Become a Vendor</Link>
          <Link href="/contact" className="btn-secondary">Contact Us</Link>
        </div>
      </div>
    </div>
  )
}
