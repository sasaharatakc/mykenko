import Link from 'next/link'

export function SiteFooter() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <p className="font-bold text-white mb-4">MYKENKO</p>
            <p className="text-xs text-gray-500">Healthcare Knowledge Platform</p>
          </div>
          <div>
            <p className="font-bold text-white mb-4">情報データベース</p>
            <ul className="space-y-2 text-sm">
              <li><Link href="/symptoms/" className="hover:text-white">症状</Link></li>
              <li><Link href="/ingredients/" className="hover:text-white">成分</Link></li>
              <li><Link href="/research/" className="hover:text-white">研究</Link></li>
              <li><Link href="/rankings/" className="hover:text-white">ランキング</Link></li>
            </ul>
          </div>
          <div>
            <p className="font-bold text-white mb-4">サービス</p>
            <ul className="space-y-2 text-sm">
              <li><Link href="/compare/" className="hover:text-white">比較</Link></li>
              <li><Link href="/ai-chat/" className="hover:text-white">AI相談</Link></li>
            </ul>
          </div>
          <div>
            <p className="font-bold text-white mb-4">会社情報</p>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about/" className="hover:text-white">会社概要</Link></li>
              <li><Link href="/editorial-policy/" className="hover:text-white">編集ポリシー</Link></li>
              <li><Link href="/compliance/" className="hover:text-white">薬機法表記</Link></li>
              <li><Link href="/privacy-policy/" className="hover:text-white">プライバシー</Link></li>
              <li><Link href="/terms/" className="hover:text-white">利用規約</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 pt-6 text-xs text-gray-500">
          <p className="mb-2">
            ※本サイトの情報は一般的な情報提供を目的としており、医療アドバイス・診断・治療の指示ではありません。
            医薬品の効果を保証するものではありません。必ず医師・薬剤師にご相談の上ご利用ください。
          </p>
          <p>© 2024 MYKENKO. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
