# SEO Docs

MYKENKOのSEO・GEO戦略ドキュメント。

| ファイル | 内容 |
|---------|------|
| `SITEMAP_ARCHITECTURE.md` | サイトマップ最適化・4軸クラスタリング設計（カテゴリー／成分／疾患／部位） |
| `v2_04_SITEMAP.md` | サイトマップ設計・XMLサイトマップ実装 |
| `v2_05_URL_DESIGN.md` | URL設計・正規化・リダイレクト |
| `v2_06_INTERNAL_LINK.md` | 内部リンク戦略・自動化 |
| `v2_07_CATEGORY_MASTER.md` | カテゴリマスタ・L1/L2/L3階層 |
| `v2_10_AI_GEO_DESIGN.md` | GEO（Generative Engine Optimization）戦略 |

## GEO対応クローラー

`apps/media/app/robots.ts` で以下のボットを明示的に許可:
- `GPTBot` — ChatGPT/OpenAI
- `PerplexityBot` — Perplexity AI
- `ClaudeBot` — Anthropic Claude
- `anthropic-ai` — Anthropic AI

## JSON-LD Schema.org

`packages/seo/src/jsonld.ts` に以下のジェネレータを実装:
- `OrganizationJsonLd`
- `MedicalConditionJsonLd`（症状ページ）
- `DietarySupplementJsonLd`（成分ページ）
- `FaqJsonLd`
- `BreadcrumbJsonLd`
