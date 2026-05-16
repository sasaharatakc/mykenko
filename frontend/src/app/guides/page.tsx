import type { Metadata } from 'next'
import { GuideListContent } from './GuideListContent'

export const metadata: Metadata = {
  title: 'メディカルガイド | MYKENKO',
  description:
    'MYKENKOの医薬品ガイド。ED治療薬、AGA治療薬、美容薬など個人輸入医薬品の正しい使い方・選び方を解説します。',
  openGraph: {
    title: 'メディカルガイド | MYKENKO',
    description:
      'ED治療薬、AGA治療薬、美容薬など個人輸入医薬品の正しい使い方・選び方を医学的根拠に基づいて解説します。',
  },
}

export default function GuidesPage() {
  return <GuideListContent />
}
