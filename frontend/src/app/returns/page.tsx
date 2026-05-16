import type { Metadata } from 'next'
import Link from 'next/link'
import { RotateCcw, CheckCircle, XCircle, Clock } from 'lucide-react'

export const metadata: Metadata = { title: 'Return Policy | Shofy' }

export default function ReturnsPage() {
  return (
    <div className="container-narrow py-16">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-display text-4xl font-bold text-gray-900 mb-4">Return Policy</h1>
        <p className="text-gray-500 mb-12">
          We want you to love every purchase. If you're not satisfied, returns are easy.
        </p>

        <div className="bg-primary-50 border border-primary-100 rounded-2xl p-6 mb-12 flex items-start gap-4">
          <RotateCcw className="w-8 h-8 text-primary-500 flex-shrink-0 mt-0.5" />
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">30-Day Returns</h2>
            <p className="text-gray-600">Most items can be returned within 30 days of delivery for a full refund or exchange.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          {[
            { icon: CheckCircle, color: 'text-success', title: 'Eligible', items: ['Unopened items', 'Defective products', 'Wrong item received', 'Damaged in shipping'] },
            { icon: XCircle, color: 'text-danger', title: 'Not Eligible', items: ['Digital downloads', 'Perishable goods', 'Customized items', 'Items without tags'] },
            { icon: Clock, color: 'text-warning', title: 'Timeline', items: ['Request within 30 days', 'Return within 7 days of approval', 'Refund in 5–10 business days'] },
          ].map(({ icon: Icon, color, title, items }) => (
            <div key={title} className="bg-gray-50 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Icon className={`w-5 h-5 ${color}`} />
                <h3 className="font-semibold text-gray-900">{title}</h3>
              </div>
              <ul className="space-y-2">
                {items.map((item) => (
                  <li key={item} className="text-sm text-gray-600 flex items-start gap-2">
                    <span className="text-gray-400 mt-0.5">•</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="prose prose-gray max-w-none">
          <h2>How to Return an Item</h2>
          <ol>
            <li>Go to your <Link href="/account/orders">order history</Link></li>
            <li>Find the order and click "Request Return"</li>
            <li>Select the items and reason for return</li>
            <li>Print the prepaid return label (for eligible returns)</li>
            <li>Drop off the package at any carrier location</li>
          </ol>

          <h2>Refunds</h2>
          <p>Refunds are processed to your original payment method within 5–10 business days after we receive the return.</p>

          <h2>Exchanges</h2>
          <p>For exchanges, place a new order and return the original item. We'll refund the original once received.</p>
        </div>

        <div className="mt-8">
          <Link href="/contact" className="btn-primary">Contact Support</Link>
        </div>
      </div>
    </div>
  )
}
