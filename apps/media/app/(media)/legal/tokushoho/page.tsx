import type { Metadata } from 'next'
import { generateBreadcrumbJsonLd } from '@mykenko/seo'

export const metadata: Metadata = {
  title: '特定商取引法に基づく表記 | MYKENKO',
  description: 'MYKENKOの特定商取引法に基づく表記ページです。販売業者・連絡先・返品・支払いなどの情報を掲載しています。',
  alternates: {
    canonical: 'https://mykenko.jp/legal/tokushoho/',
  },
  robots: { index: true, follow: true },
}

const breadcrumbJsonLd = generateBreadcrumbJsonLd([
  { name: 'ホーム', url: 'https://mykenko.jp' },
  { name: '特定商取引法に基づく表記', url: 'https://mykenko.jp/legal/tokushoho/' },
])

// ── 表記内容（法的要件: 特定商取引法第11条） ──────────────────────────────

const TOKUSHOHO_ITEMS = [
  {
    label: '販売業者名',
    value: '株式会社MYKENKO（仮称 ※法人設立後に更新）',
  },
  {
    label: '所在地',
    value: '〒000-0000 東京都○○区○○ ○-○-○（申請により開示）',
    note: '個人事業主の場合、請求に応じて遅滞なく開示します。',
  },
  {
    label: '電話番号',
    value: 'お問い合わせフォームよりご連絡ください（請求に応じて開示）',
    note: '電話でのご対応は平日10:00〜17:00となります。',
  },
  {
    label: 'メールアドレス',
    value: 'support@mykenko.jp',
  },
  {
    label: '代表者・運営責任者',
    value: '笹原 武 （ささはら たける）',
  },
  {
    label: '販売URL',
    value: 'https://shop.mykenko.jp',
  },
  {
    label: '販売価格',
    value: '各商品ページに表示の価格（税込）',
    note: '送料は別途かかる場合があります。商品ページでご確認ください。',
  },
  {
    label: '送料',
    value: '全国一律 ○○円（税込）。○○○○円以上のご注文は送料無料。',
    note: '離島・一部地域は追加送料が発生する場合があります。',
  },
  {
    label: '代金の支払い方法',
    value: 'クレジットカード（Visa / Mastercard / American Express / JCB）',
    note: 'Stripe を通じた安全な決済処理を行います。',
  },
  {
    label: '代金の支払い時期',
    value: 'ご注文確定時に即時決済',
  },
  {
    label: '商品の引き渡し時期',
    value: 'ご注文確定後、通常3〜7営業日以内に発送',
    note: '在庫状況・天候・物流状況により遅延する場合があります。',
  },
  {
    label: '返品・交換',
    value: '商品到着後7日以内にメールにてご連絡ください。',
    note: [
      '【返品・交換可能な場合】商品の欠陥・破損・誤送品',
      '【返品・交換不可の場合】お客様都合による返品、開封済み商品（衛生上の理由）、食品・サプリメント類（開封後）',
      '返品送料：当社の瑕疵の場合は当社負担、お客様都合の場合はお客様負担',
    ].join('\n'),
  },
  {
    label: '特記事項',
    value: '本サービスで販売する製品は、薬機法・景品表示法等を遵守して販売しています。医療機器・医薬品ではありません。',
  },
]

// ── Page ──────────────────────────────────────────────────────────────────────

export default function TokushohoPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <main className="mx-auto max-w-3xl px-4 py-10">
        {/* Breadcrumb */}
        <nav aria-label="パンくずリスト" className="mb-6 text-sm text-gray-500">
          <ol className="flex gap-2">
            <li><a href="/" className="hover:text-primary">ホーム</a></li>
            <li>/</li>
            <li aria-current="page">特定商取引法に基づく表記</li>
          </ol>
        </nav>

        <h1 className="mb-8 text-2xl font-bold text-gray-900">
          特定商取引法に基づく表記
        </h1>

        <div className="rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <tbody>
              {TOKUSHOHO_ITEMS.map((item, i) => (
                <tr
                  key={i}
                  className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
                >
                  <th
                    scope="row"
                    className="w-1/3 px-4 py-4 text-left font-semibold text-gray-700 align-top border-r border-gray-200"
                  >
                    {item.label}
                  </th>
                  <td className="px-4 py-4 text-gray-700 align-top">
                    <p className="whitespace-pre-line">{item.value}</p>
                    {item.note && (
                      <p className="mt-1 text-xs text-gray-500 whitespace-pre-line">
                        {item.note}
                      </p>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-6 text-xs text-gray-400">
          最終更新日：{new Date().toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </main>
    </>
  )
}
