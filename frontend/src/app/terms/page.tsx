import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Terms of Service | MYKENKO' }

export default function TermsPage() {
  return (
    <div className="container-narrow py-16">
      <div className="max-w-3xl mx-auto prose prose-gray">
        <h1>Terms of Service</h1>
        <p className="lead">Last updated: January 1, 2025</p>

        <h2>Acceptance of Terms</h2>
        <p>By using MYKENKO, you agree to these Terms of Service. If you do not agree, please do not use our platform.</p>

        <h2>User Accounts</h2>
        <ul>
          <li>You must be 18 or older to create an account</li>
          <li>You are responsible for maintaining the security of your account</li>
          <li>You must provide accurate and complete information</li>
        </ul>

        <h2>Purchases</h2>
        <p>
          By placing an order, you agree to pay the full amount including taxes and shipping fees.
          All sales are final unless the item is eligible for return per our return policy.
        </p>

        <h2>Vendor Terms</h2>
        <p>
          Vendors agree to list only genuine products, fulfill orders promptly, and comply with all applicable laws.
          MYKENKO charges a commission on each sale as specified in the vendor agreement.
        </p>

        <h2>Prohibited Content</h2>
        <p>You may not list or sell counterfeit goods, hazardous materials, or anything illegal.</p>

        <h2>Limitation of Liability</h2>
        <p>
          MYKENKO is a marketplace platform and is not responsible for disputes between buyers and vendors.
          Our liability is limited to the amount of the transaction in question.
        </p>

        <h2>Changes to Terms</h2>
        <p>We may update these terms at any time. Continued use of the platform constitutes acceptance.</p>

        <h2>Contact</h2>
        <p>Questions? Email <a href="mailto:legal@mykenko.com">legal@mykenko.com</a>.</p>
      </div>
    </div>
  )
}
