import Link from 'next/link'
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube } from 'lucide-react'
import { NewsletterForm } from '@/components/home/NewsletterForm'

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Newsletter */}
      <div className="bg-primary-500">
        <div className="container-narrow py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="font-display text-xl font-semibold text-white">Subscribe to Newsletter</h3>
              <p className="text-primary-100 text-sm mt-1">Get the latest deals and news delivered to your inbox.</p>
            </div>
            <NewsletterForm />
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container-narrow py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <span className="font-display text-2xl font-bold text-white">Shofy</span>
            <p className="mt-4 text-sm leading-relaxed">
              The best multivendor marketplace for finding quality products from verified sellers worldwide.
            </p>
            <div className="flex gap-3 mt-6">
              {[
                { Icon: Facebook, href: '#', label: 'Facebook' },
                { Icon: Twitter, href: '#', label: 'Twitter' },
                { Icon: Instagram, href: '#', label: 'Instagram' },
                { Icon: Youtube, href: '#', label: 'YouTube' },
              ].map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-full border border-gray-700 flex items-center justify-center hover:bg-primary-500 hover:border-primary-500 hover:text-white transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display text-sm font-semibold text-white uppercase tracking-wider mb-4">Quick Links</h4>
            <ul className="space-y-2.5">
              {[
                { href: '/about', label: 'About Us' },
                { href: '/shop', label: 'Shop' },
                { href: '/stores', label: 'Vendors' },
                { href: '/blog', label: 'Blog' },
                { href: '/contact', label: 'Contact' },
                { href: '/become-vendor', label: 'Become a Vendor' },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-sm hover:text-primary-400 transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Support */}
          <div>
            <h4 className="font-display text-sm font-semibold text-white uppercase tracking-wider mb-4">Support</h4>
            <ul className="space-y-2.5">
              {[
                { href: '/faq', label: 'FAQ' },
                { href: '/shipping', label: 'Shipping Policy' },
                { href: '/returns', label: 'Return Policy' },
                { href: '/privacy', label: 'Privacy Policy' },
                { href: '/terms', label: 'Terms of Service' },
                { href: '/orders/track', label: 'Track Order' },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-sm hover:text-primary-400 transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display text-sm font-semibold text-white uppercase tracking-wider mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex gap-3 text-sm">
                <MapPin className="w-4 h-4 text-primary-400 mt-0.5 flex-shrink-0" />
                <span>123 Commerce Street, New York, NY 10001</span>
              </li>
              <li className="flex gap-3 text-sm">
                <Phone className="w-4 h-4 text-primary-400 flex-shrink-0" />
                <a href="tel:+1234567890" className="hover:text-primary-400 transition-colors">+1 (234) 567-890</a>
              </li>
              <li className="flex gap-3 text-sm">
                <Mail className="w-4 h-4 text-primary-400 flex-shrink-0" />
                <a href="mailto:support@shofy.com" className="hover:text-primary-400 transition-colors">support@shofy.com</a>
              </li>
            </ul>

            {/* Payment Methods */}
            <div className="mt-6">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">We Accept</p>
              <div className="flex flex-wrap gap-2">
                {['Visa', 'Mastercard', 'PayPal', 'Stripe', 'AmEx'].map((method) => (
                  <span key={method} className="px-2 py-1 bg-gray-800 rounded text-xs border border-gray-700">
                    {method}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-gray-800">
        <div className="container-narrow py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Shofy Marketplace. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-gray-300 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-gray-300 transition-colors">Terms</Link>
            <Link href="/sitemap.xml" className="hover:text-gray-300 transition-colors">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
