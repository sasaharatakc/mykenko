/**
 * /login ページの noindex 設定
 *
 * Next.js App Router では 'use client' ページに metadata を直接 export できない。
 * layout.tsx（Server Component）から metadata を export することで noindex を適用する。
 *
 * noindex の理由:
 *   - ログインページはユーザー固有のセッションページ
 *   - 検索結果に表示されてもコンバージョン価値がない
 *   - クロールバジェットを商品・カテゴリページに集中させる
 */

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ログイン | MYKENKO',
  robots: {
    index: false,
    follow: false,
  },
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
