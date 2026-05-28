/**
 * MedicalDisclaimer - 全ページ必須の薬機法対応免賬表記
 * 必ず全症状・成分ページに表示すること
 */
export function MedicalDisclaimer() {
  return (
    <div className="medical-disclaimer" role="note" aria-label="医療免賬事項">
      <p className="font-bold text-gray-700 mb-2">ご注意（必ずお読みください）</p>
      <ul className="text-sm text-gray-600 space-y-1 list-disc pl-4">
        <li>本コンテンツは一般的な情報提供を目的としており、医療アドバイス・診断・治療の指示ではありません。</li>
        <li>医薬品・サプリメントの効果は個人の症状や体質により異なります。効果を保証するものではありません。</li>
        <li>購入・使用前に必ず医師・薬剤師にご相談ください。</li>
        <li>専門家の判断なしに医薬品を購入・使用されることはおすすめしません。</li>
      </ul>
    </div>
  )
}
