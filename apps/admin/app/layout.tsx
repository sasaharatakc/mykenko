import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'MYKENKO Admin',
  robots: { index: false, follow: false },
}

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-gray-50">
        {children}
      </body>
    </html>
  )
}
