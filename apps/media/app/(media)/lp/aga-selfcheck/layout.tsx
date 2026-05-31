import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'AGAセルフチェック - あなたの薄毛リスクを確認 | MYKENKO',
  description:
    '5つの質問でAGAの傾向を無料チェック。フィナステリド・ミノキシジルなど科学的根拠に基づく情報を提供。本チェックは医学的診断ではありません。',
  alternates: {
    canonical: 'https://mykenko.jp/lp/aga-selfcheck/',
  },
  robots: { index: true, follow: true },
}

export default function AgaSelfCheckLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
