import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Privacy Policy | Shofy' }

export default function PrivacyPage() {
  return (
    <div className="container-narrow py-16">
      <div className="max-w-3xl mx-auto prose prose-gray">
        <h1>Privacy Policy</h1>
        <p className="lead">Last updated: January 1, 2025</p>

        <h2>Information We Collect</h2>
        <p>
          We collect information you provide when creating an account, placing orders, or contacting us.
          This includes your name, email address, shipping address, and payment information.
        </p>

        <h2>How We Use Your Information</h2>
        <ul>
          <li>Process and fulfill orders</li>
          <li>Send order confirmations and shipping updates</li>
          <li>Provide customer support</li>
          <li>Improve our platform and services</li>
          <li>Send promotional emails (you can opt out at any time)</li>
        </ul>

        <h2>Data Security</h2>
        <p>
          We use industry-standard encryption to protect your personal information.
          Payment data is processed securely by Stripe and PayPal — we never store raw card details.
        </p>

        <h2>Cookies</h2>
        <p>
          We use cookies to keep you signed in, remember your cart, and understand how you use our site.
          You can disable cookies in your browser settings, though some features may not work as expected.
        </p>

        <h2>Your Rights</h2>
        <p>
          You may request a copy of your data, correction of inaccurate information, or deletion of your account
          by contacting us at privacy@shofy.com.
        </p>

        <h2>Contact</h2>
        <p>For privacy concerns, email <a href="mailto:privacy@shofy.com">privacy@shofy.com</a>.</p>
      </div>
    </div>
  )
}
