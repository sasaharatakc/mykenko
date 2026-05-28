import Link from 'next/link'

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-primary">
          MYKENKO
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link href="/symptoms/" className="hover:text-primary transition-colors">症状</Link>
          <Link href="/ingredients/" className="hover:text-primary transition-colors">成分</Link>
          <Link href="/compare/" className="hover:text-primary transition-colors">比較</Link>
          <Link href="/rankings/" className="hover:text-primary transition-colors">ランキング</Link>
          <Link href="/research/" className="hover:text-primary transition-colors">研究</Link>
        </nav>
        <a
          href={process.env.NEXT_PUBLIC_SHOP_URL ?? 'https://shop.mykenko.jp'}
          className="text-sm bg-medical-orange text-white px-4 py-2 rounded-lg font-bold hover:opacity-90 transition-opacity"
          rel="noopener"
        >
          購入は→
        </a>
      </div>
    </header>
  )
}
