'use client'

import type { Metadata } from 'next'
import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

const FAQS = [
  {
    q: 'How do I track my order?',
    a: 'You can track your order by visiting the "Track Order" page and entering your order code and email address. You\'ll also receive tracking updates via email.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept Visa, Mastercard, American Express, PayPal, and bank transfers. All payments are processed securely.',
  },
  {
    q: 'How do I return an item?',
    a: 'Items can be returned within 30 days of delivery. Visit your order history, select the order, and click "Request Return". We\'ll email you a return label.',
  },
  {
    q: 'When will I receive my order?',
    a: 'Standard shipping takes 5–7 business days. Express shipping takes 2–3 days. You\'ll receive a tracking number once your order ships.',
  },
  {
    q: 'How do I become a vendor?',
    a: 'Click "Become a Vendor" and fill out the registration form. After verification (usually 1–2 business days), you can start listing products.',
  },
  {
    q: 'Is my payment information secure?',
    a: 'Yes. All payments are processed by Stripe or PayPal using industry-standard TLS encryption. We never store your card details.',
  },
  {
    q: 'Can I cancel my order?',
    a: 'Orders can be cancelled before they are shipped. Visit your order history and click "Cancel Order". Once shipped, you\'ll need to request a return.',
  },
  {
    q: 'How do I contact customer support?',
    a: 'You can reach us via the Contact page, email support@shofy.com, or live chat during business hours (Mon–Fri, 9am–6pm EST).',
  },
]

export default function FAQPage() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <div className="container-narrow py-16">
      <div className="max-w-2xl mx-auto">
        <h1 className="font-display text-4xl font-bold text-gray-900 mb-2 text-center">
          Frequently Asked Questions
        </h1>
        <p className="text-gray-500 text-center mb-12">Can't find an answer? Contact our support team.</p>

        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="font-medium text-gray-900">{faq.q}</span>
                <ChevronDown className={cn('w-4 h-4 text-gray-400 transition-transform flex-shrink-0', open === i && 'rotate-180')} />
              </button>
              {open === i && (
                <div className="px-5 pb-4 text-gray-600 text-sm leading-relaxed border-t border-gray-100">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
