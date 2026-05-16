import type { Metadata } from 'next'
import { Truck, Clock, Globe, Package } from 'lucide-react'

export const metadata: Metadata = { title: 'Shipping Policy | Shofy' }

export default function ShippingPage() {
  return (
    <div className="container-narrow py-16">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-display text-4xl font-bold text-gray-900 mb-4">Shipping Policy</h1>
        <p className="text-gray-500 mb-12">Everything you need to know about delivery times and costs.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
          {[
            { icon: Truck, title: 'Free Standard Shipping', desc: 'On all orders over $50 within the US' },
            { icon: Clock, title: 'Express Delivery', desc: '2–3 business days. $14.99 flat rate.' },
            { icon: Globe, title: 'International Shipping', desc: 'Available to 120+ countries from $19.99' },
            { icon: Package, title: 'Overnight Shipping', desc: 'Next business day. $29.99 flat rate.' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex gap-4 p-6 bg-gray-50 rounded-2xl">
              <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <Icon className="w-6 h-6 text-primary-500" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{title}</h3>
                <p className="text-sm text-gray-500 mt-1">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="prose prose-gray max-w-none">
          <h2>Processing Times</h2>
          <p>Orders are processed within 1–2 business days. You'll receive a confirmation email with tracking details once your order ships.</p>

          <h2>Delivery Estimates</h2>
          <table>
            <thead><tr><th>Method</th><th>Estimated Delivery</th><th>Cost</th></tr></thead>
            <tbody>
              <tr><td>Standard</td><td>5–7 business days</td><td>Free over $50, else $5.99</td></tr>
              <tr><td>Express</td><td>2–3 business days</td><td>$14.99</td></tr>
              <tr><td>Overnight</td><td>1 business day</td><td>$29.99</td></tr>
            </tbody>
          </table>

          <h2>International Orders</h2>
          <p>International shipping times vary by destination. Customs duties and taxes are the buyer's responsibility.</p>

          <h2>Lost or Damaged Packages</h2>
          <p>If your package is lost or arrives damaged, contact us within 7 days of the expected delivery date. We'll work with the carrier to resolve the issue.</p>
        </div>
      </div>
    </div>
  )
}
