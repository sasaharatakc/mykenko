/**
 * /stores/[slug] ページの SSR Metadata
 *
 * 現在の page.tsx は 'use client' のため generateMetadata を使用できない。
 * layout.tsx（Server Component）から動的 metadata を生成して
 * ストアページの OGP・title を適切に設定する。
 *
 * 将来的には page.tsx を Server Component + Client Component に分離し
 * generateMetadata を page.tsx に移動することを推奨する。
 */

import type { Metadata } from 'next'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'
const BASE    = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mykenko.com'

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const res = await fetch(`${API_URL}/stores/${params.slug}`, {
      next: { revalidate: 3600 },
    })
    if (!res.ok) return { title: 'ストア | MYKENKO' }
    const json = await res.json()
    const store = json?.data ?? json

    const name        = store?.name ?? params.slug.replace(/-/g, ' ')
    const description = store?.description
      ?? `${name} の商品一覧 — MYKENKO（マイケンコー）マーケットプレイス`
    const image       = store?.logo ?? store?.cover_image

    return {
      title: `${name} | MYKENKO`,
      description,
      alternates: {
        canonical: `${BASE}/stores/${params.slug}`,
      },
      openGraph: {
        title: `${name} | MYKENKO`,
        description,
        images: image ? [image] : [],
        type: 'website',
      },
    }
  } catch {
    return { title: 'ストア | MYKENKO' }
  }
}

export default function StoreSlugLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
