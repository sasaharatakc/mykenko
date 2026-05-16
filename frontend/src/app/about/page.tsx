import type { Metadata } from 'next'
import Link from 'next/link'
import { Users, Store, ShoppingBag, Globe } from 'lucide-react'

export const metadata: Metadata = { title: 'About Us | Shofy' }

export default function AboutPage() {
  return (
    <div className="container-narrow py-16">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-display text-4xl font-bold text-gray-900 mb-4">About Shofy</h1>
        <p className="text-lg text-gray-500 mb-12">
          Shofy is a modern multivendor marketplace connecting buyers with thousands of verified sellers worldwide.
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
            We believe everyone deserves access to quality products at fair prices.
            Shofy empowers independent businesses to reach customers globally while
            giving shoppers a trustworthy place to discover unique products.
          </p>

          <h2>For Buyers</h2>
          <p>
            Shop with confidence knowing every vendor on Shofy is verified.
            Enjoy buyer protection, easy returns, and secure payments on every order.
          </p>

          <h2>For Vendors</h2>
          <p>
            Start selling in minutes. Reach millions of customers with zero upfront costs.
            We handle payments, you focus on your products.
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
