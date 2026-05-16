import type { Metadata } from 'next'
import { Inter, Poppins } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { ConditionalShell } from '@/components/layout/ConditionalShell'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })
const poppins = Poppins({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-poppins',
  display: 'swap',
})

export const metadata: Metadata = {
  title: { default: 'MYKENKO — 医薬品個人輸入マーケットプレイス', template: '%s | MYKENKO' },
  description: 'MYKENKOは日本最大級の医薬品個人輸入マーケットプレイスです。ED治療薬・AGA・美容・ダイエットなど幅広い医薬品を安全に購入できます。',
  keywords: ['EC', 'ショッピング', 'マーケットプレイス', 'オンラインショップ', '通販', 'ecommerce', '医薬品', '個人輸入'],
  authors: [{ name: 'MYKENKO' }],
  creator: 'MYKENKO',
  manifest: '/manifest.json',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    siteName: 'MYKENKO マーケットプレイス',
    title: 'MYKENKO — 医薬品個人輸入マーケットプレイス',
    description: 'MYKENKOは日本最大級の医薬品個人輸入マーケットプレイスです。ED治療薬・AGA・美容・ダイエットなど幅広い医薬品を安全に購入できます。',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'MYKENKO Marketplace' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MYKENKO — 医薬品個人輸入マーケットプレイス',
    description: 'MYKENKOは日本最大級の医薬品個人輸入マーケットプレイスです。',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-video-preview': -1, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ?? '',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={`${inter.variable} ${poppins.variable}`} suppressHydrationWarning>
      <body className="font-sans bg-white text-gray-900 antialiased">
        <Providers>
          <ConditionalShell>{children}</ConditionalShell>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: { fontSize: '0.875rem', borderRadius: '8px' },
            }}
          />
        </Providers>
      </body>
    </html>
  )
}
