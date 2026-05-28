import type { Metadata } from 'next'
import { Noto_Sans_JP } from 'next/font/google'
import './globals.css'

const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
  variable: '--font-noto-sans-jp',
})

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mykenko.jp'
  ),
  title: {
    template: '%s | MYKENKO',
    default: 'MYKENKO - 日本最大のヘルスケア知識プラットフォーム',
  },
  description:
    '症状・成分・医薬品を科学的根拠に基づいて解説。医師監修のヘルスケア情報プラットフォーム。利用前に必ず医師・薬剤師にご相談ください。',
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    siteName: 'MYKENKO',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className={`${notoSansJP.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}
