/**
 * YakukihoDisclaimer — 薬機法・景表法準拠の免責表記コンポーネント
 *
 * 使用場所:
 *  - shop.mykenko.jp の商品詳細ページ
 *  - 症状ページ・成分ページの商品推薦セクション
 *  - AGAセルフチェック LP の結果ページ
 *
 * 薬機法対応要件:
 *  - 医薬品ではないことの明示
 *  - 効果・効能の断定表現を含まない
 *  - 医師・薬剤師への相談を促す
 *
 * 景品表示法対応要件:
 *  - 根拠のない「No.1」「最安値」表現を含まない
 *  - エビデンスレベルを明示する場合は研究の質を示す旨を添記
 */

interface YakukihoDisclaimerProps {
  /** 商品カテゴリ（サプリメント/化粧品/医薬部外品）によって文言を変える */
  category?: 'supplement' | 'cosmetic' | 'quasi-drug' | 'general'
  /** コンパクト表示（商品カード内など） */
  compact?: boolean
  /** className上書き */
  className?: string
}

const MESSAGES: Record<NonNullable<YakukihoDisclaimerProps['category']>, string> = {
  supplement:
    '本製品は食品（サプリメント）です。医薬品ではありません。疾患の治療・予防を目的とするものではありません。症状が気になる場合は医師・薬剤師にご相談ください。',
  cosmetic:
    '本製品は化粧品です。効果には個人差があります。肌に異常が現れた場合は使用を中止し、皮膚科医にご相談ください。',
  'quasi-drug':
    '本製品は医薬部外品です。医薬品とは異なります。症状が改善しない場合や気になる症状がある場合は医師・薬剤師にご相談ください。',
  general:
    '本製品は医薬品ではありません。効果には個人差があります。症状が気になる場合は専門家にご相談ください。',
}

export function YakukihoDisclaimer({
  category = 'general',
  compact = false,
  className = '',
}: YakukihoDisclaimerProps) {
  const message = MESSAGES[category]

  if (compact) {
    return (
      <p
        className={`text-xs text-gray-500 leading-relaxed ${className}`}
        role="note"
        aria-label="薬機法に基づく注意事項"
      >
        ※ {message}
      </p>
    )
  }

  return (
    <aside
      role="note"
      aria-label="薬機法に基づく注意事項"
      className={`rounded-md border border-yellow-300 bg-yellow-50 px-4 py-3 ${className}`}
    >
      <p className="text-sm text-yellow-800 leading-relaxed">
        <span className="font-semibold">【ご注意】</span> {message}
      </p>
    </aside>
  )
}

/** 商品ページフッターの法的リンクセット */
export function ShopLegalLinks({ className = '' }: { className?: string }) {
  return (
    <div className={`flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400 ${className}`}>
      <a href="/legal/tokushoho/" className="hover:underline">
        特定商取引法に基づく表記
      </a>
      <a href="/legal/privacy/" className="hover:underline">
        プライバシーポリシー
      </a>
      <a href="/legal/terms/" className="hover:underline">
        利用規約
      </a>
      <a
        href="https://shop.mykenko.jp/contact"
        target="_blank"
        rel="noopener noreferrer"
        className="hover:underline"
      >
        お問い合わせ
      </a>
    </div>
  )
}
