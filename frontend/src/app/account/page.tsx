import { AccountDashboard } from './AccountDashboard'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'My Account',
  robots: { index: false },
}

export default function AccountPage() {
  return <AccountDashboard />
}
