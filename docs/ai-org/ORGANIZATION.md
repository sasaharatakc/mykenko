# AI Organization OS — 組織リファレンス（オンデマンド読み込み）

> このファイルは毎セッション自動読み込みされる CLAUDE.md から退避した参照資料。
> Crew 編成・スキル分類・Memory Layer の全体像が必要になったときだけ読むこと。
> 個々のエージェント定義は `.claude/agents/`、スキル定義は `.claude/skills/`・`.claude/commands/` に実体があり、Claude Code はそれらを自動認識する（この表を読む必要はない）。
> **現在の有効なエージェント台帳（core/optional/archive の tier 管理）は `docs/ai-org/AGENT_REGISTRY.md` が SSOT。** 以下の Crew 表は設計時の全体像であり、一部エージェントは `docs/ai-org/agents/archive/` に退避済み。

## 動作モデル
Kingmaker → Gamechanger → @router → Crew選定 → Agent実行 → Skill活用 → ツール/MCP/API → Review Mesh → Approval Gate → Memory Layer → Evolution Layer

## Crew構成（153エージェント）
| Crew | 目的 | 主要Agent |
|------|------|---------|
| Research Crew | 調査・情報収集 | google-search-agent, competitor-agent, market-research-agent, reddit-agent, news-agent, trend-agent, academic-paper-agent, patent-agent |
| Data Crew | データ収集・処理 | crawler-agent, firecrawl-agent, scraping-agent, parser-agent, normalizer-agent, qdrant-agent, neo4j-agent, data-quality-agent |
| Analysis Crew | 分析・インサイト | seo-analyst, market-analyst, business-analyst, financial-analyst, trend-analyst, competitor-analyst, review-analyst, pricing-analyst, product-analyst |
| Strategy Crew | 戦略立案 | kingmaker, gamechanger, ceo-agent, cmo-agent, coo-agent, cfo-agent, growth-agent, brand-agent, expansion-agent, product-strategy-agent, chief-of-staff |
| Development Crew | 開発・実装 | system-architect, nextjs-engineer, laravel-engineer, python-engineer, typescript-engineer, mobile-engineer, ai-engineer, devops-engineer, database-engineer, security-engineer, qa-engineer, tdd-guide |
| Design Crew | デザイン | creative-director, art-director, ui-designer, ux-designer, lp-designer, banner-designer, video-designer, motion-designer, brand-designer, figma-designer |
| SEO Crew | 検索流入獲得 | technical-seo, onpage-seo, offpage-seo, entity-seo, programmatic-seo-agent, internal-link-seo, schema-seo, local-seo, ai-overview-seo, parasite-seo |
| GEO Crew | AI検索最適化 | geo-writer, citation-builder, mention-builder, entity-builder, authority-builder, knowledge-graph-agent, ai-search-monitor |
| Marketing Crew | 集客 | meta-ads-agent, google-ads-agent, yahoo-ads-agent, tiktok-ads-agent, x-ads-agent, affiliate-agent, email-marketing-agent, crm-agent, influencer-agent, community-agent |
| Sales Crew | 販売・転換 | sales-planner, offer-agent, upsell-agent, cross-sell-agent, retention-agent, ltv-agent, conversion-agent |
| Content Crew | コンテンツ制作 | copywriter, seo-writer, medical-writer, pr-writer, script-writer, video-writer, sns-writer, email-writer, translator, editor |
| PR Crew | 認知拡大 | press-release-agent, media-outreach-agent, pr-writer |
| SNS Crew | SNS運用 | x-agent, instagram-agent, tiktok-agent, threads-agent, youtube-agent, pinterest-agent, linkedin-agent, sns-writer |
| Review Crew | 品質管理 | fact-checker, compliance-checker, seo-checker, ux-checker, design-checker, risk-checker, medical-checker, code-reviewer |
| Execution Crew | 実行・自動化 | workflow-agent, task-agent, scheduler-agent, automation-agent, automation-engineer, notification-agent, deployment-agent, publishing-agent, loop-operator |

## スキル一覧（63スキル）
| カテゴリ | スキル数 | 主要スキル |
|--------|--------|---------|
| router | 7 | /route-task, /crew-select, /parallel-run, /workflow-gen, /context-compress, /priority-sort |
| seo | 14 | /seo-audit, /keyword-research, /content-brief, /technical-check, /ai-overview-optimize, /backlink-strategy |
| geo-llmo | 3 | /geo-audit, /entity-extract, /citation-build |
| research | 9 | /google-search, /deep-research-flow, /competitor-analysis, /trend-research, /reddit-mining, /regulation-research |
| ai | 5 | /prompt-engineering, /rag-workflow, /claude-api-usage, /langgraph-workflow, /n8n-automation |
| automation | 3 | /playwright-automation, /webhook-setup, /etl-pipeline |
| code | 10 | /new-feature, /bug-fix, /security-review, /tdd-workflow, /refactor-flow, /deploy-flow, /adr, /api-design, /laravel-patterns, /nextjs-patterns |
| content | 2 | /article-writing, /video-script |
| design | 2 | /ux-audit, /design-system |
| ecommerce | 2 | /checkout-optimize, /vendor-onboard |
| marketing | 3 | /campaign-launch, /meta-ads-flow, /email-flow |
| medical | 3 | /yakki-check, /ymyl-check, /evidence-search |

## Memory Layer
- Qdrant: ベクター検索・セマンティック記憶
- Neo4j: 関係性グラフ・知識ネットワーク
- Obsidian: 構造化ノート・プロジェクト記録
- Google Drive: ドキュメント・レポート保管

## 接続済みMCPサーバー

### 常時利用可能
| ツール | 用途 |
|-------|------|
| `mcp__firecrawl__*` | Webスクレイピング |
| `mcp__context7__*` | ライブラリドキュメント検索 |

### Claude App OAuth接続済み
| プラグイン | 用途 |
|-----------|------|
| Figma (`mcp__a0ee5616__*`) | デザイン操作 |
| Notion (`mcp__b8c67c59__*`) | ワークスペース管理 |
| Adobe (`mcp__ca458ec0__*`) | Creative Cloud操作 |
| Google Drive (`mcp__4e5dfa69__*`) | ファイル操作 |
| GitHub (`mcp__github__*`) | コード管理 |
