/**
 * /register ページの noindex 設定
 *
 * /login/layout.tsx と同じ理由で noindex を適用する。
 * 新規登録ページも検索流入ではなくサイト内導線で到達するため
 * インデックス対象から除外する。
 */

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '新規会員登録 | MYKENKO',
  robots: {
    index: false,
    follow: false,
  },
}

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
