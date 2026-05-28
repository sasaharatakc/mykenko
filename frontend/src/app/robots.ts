/**
 * MYKENKO — robots.ts
 *
 * Next.js App Router の MetadataRoute.Robots を使用。
 * public/robots.txt が存在する場合はこちらが優先されるため、
 * public/robots.txt は削除してこのファイルで一元管理する。
 *
 * ブロック対象の設計方針:
 *   - 認証必須ページ（/account, /checkout, /cart, /wishlist）
 *       → ユーザー固有データのため SEO 価値なし
 *   - ダッシュボード（/admin, /vendor）
 *       → セキュリティリスク・インデックス不要
 *   - 検索パラメータ系（/shop?sort=, /shop?page=）
 *       → canonical で正規 URL に集約するため重複クロール不要
 *   - API エンドポイント (/api/)
 *       → JSON レスポンスをクロールさせない
 *   - トラッキング・内部ツール (/tracking, /order-complete)
 *       → ユーザー固有セッションページ
 *
 * AI クローラーへの対応（2025年以降の標準）:
 *   - Googlebot, Bingbot: 通常許可
 *   - AI クローラー（GPTBot, ClaudeBot, PerplexityBot 等）: 許可
 *     MYKENKOの商品が AI 検索・AI Overview に露出するメリットを優先
 *
 * Crawl-delay:
 *   - robots.txt の Crawl-delay は Google が無視するため記述しない
 *   - Bingbot には Crawl-delay を設定（Bing は尊重する）
 */

import type { MetadataRoute } from 'next'

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mykenko.com'

/** インデックス不要・クロール禁止パス一覧 */
const DISALLOWED_PATHS = [
  // ダッシュボード系
  '/admin/',
  '/vendor/',
  // 認証・ユーザー固有
  '/account/',
  '/checkout/',
  '/cart',
  '/wishlist',
  '/order-complete/',
  '/tracking/',
  // 内部 API
  '/api/',
  // 検索・フィルタ系（パラメータ付き URL のクロールを抑止）
  // ※ canonical タグで /shop に集約するため
  '/shop?',
]

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // ── 通常クローラー ──────────────────────────────────────────────────
      {
        userAgent: '*',
        allow: '/',
        disallow: DISALLOWED_PATHS,
      },
      // ── Bingbot（Crawl-delay を尊重するため個別設定）─────────────────
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: DISALLOWED_PATHS,
        crawlDelay: 2,
      },
      // ── AI クローラー（明示的に許可して AI 検索露出を確保）───────────
      // GPTBot (ChatGPT), ClaudeBot, PerplexityBot, Google-Extended は
      // デフォルトルール (*) で許可済みだが明示的に記述することで意図を明確化
      {
        userAgent: 'GPTBot',
        allow: '/',
        disallow: DISALLOWED_PATHS,
      },
      {
        userAgent: 'ClaudeBot',
        allow: '/',
        disallow: DISALLOWED_PATHS,
      },
      {
        userAgent: 'PerplexityBot',
        allow: '/',
        disallow: DISALLOWED_PATHS,
      },
      {
        userAgent: 'Google-Extended',
        allow: '/',
        disallow: DISALLOWED_PATHS,
      },
    ],
    // サイトマップインデックス URL
    sitemap: [
      `${BASE}/sitemap.xml`,
      `${BASE}/products/sitemap.xml`,
      `${BASE}/categories/sitemap.xml`,
      `${BASE}/stores/sitemap.xml`,
      `${BASE}/blog/sitemap.xml`,
      `${BASE}/brands/sitemap.xml`,
    ],
  }
}
