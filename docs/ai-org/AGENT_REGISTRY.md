# AGENT_REGISTRY — エージェント台帳（SSOT）

> `.claude/agents/` 配下エージェントの唯一の台帳。**エージェントの追加・削除・復帰はこのファイルの更新とセットで行う**（検証: `python3 tools/ai/validate-agent-registry.py`）。
> 運用ルールは `docs/ai-org/AGENT_POLICY.md`。監査日: 2026-07-09（153体を監査、description合計 7,648字・最長95字・全件240字以内）

## サマリー
| tier | 数 | 配置 | セッション注入 |
|---|---|---|---|
| core | 14 | `.claude/agents/` | される（常用の最小セット） |
| optional | 92 | `.claude/agents/` | される（必要時のみ起動） |
| archive-candidate | 47 | `docs/ai-org/agents/archive/` | **されない**（復帰は `.claude/agents/` へ移動） |

アーカイブ退避により description 2199 字 + frontmatter オーバーヘッド分の毎セッション注入を削減。

## core（毎日使う最小セット・上限15体）
| Agent | domain | desc文字数 | 備考(統合先/用途) |
|---|---|---|---|
| code-reviewer | dev | 40 | PRレビュー必須フロー |
| database-engineer | dev | 48 | スキーマ・マイグレーション |
| devops-engineer | dev | 39 | CI/CD・環境 |
| laravel-engineer | dev | 88 | EC APIバックエンド実装 |
| nextjs-engineer | dev | 92 | EC/メディアのフロント実装 |
| qa-engineer | dev | 41 | テスト・品質保証 |
| security-engineer | dev | 64 | 認証・脆弱性(EC必須) |
| doc-writer | docs | 42 | CODEBASE_MAP等の保守 |
| editor | docs | 44 | 全コンテンツの校正ゲート |
| router | ops | 94 | タスク振り分けの入口 |
| compliance-checker | other | 60 | 景表法・法令チェック(PR必須項目) |
| medical-checker | other | 49 | 薬機法チェック(PR必須項目) |
| seo-analyst | seo | 50 | SEO計測・優先度付け |
| seo-writer | seo | 47 | メディア記事の主力 |

## optional（必要時のみ起動）
「統合候補」の備考があるものは次回整理の検討対象。
| Agent | domain | desc文字数 | 備考(統合先/用途) |
|---|---|---|---|
| affiliate-agent | crm | 51 | 収益チャネル |
| community-agent | crm | 47 |  |
| conversion-agent | crm | 49 | CRO |
| copywriter | crm | 36 |  |
| crm-agent | crm | 45 |  |
| ecommerce-strategist | crm | 40 |  |
| email-marketing-agent | crm | 48 |  |
| google-ads-agent | crm | 68 |  |
| growth-agent | crm | 59 | 統合候補: ecommerce-strategist |
| influencer-agent | crm | 44 |  |
| instagram-agent | crm | 47 |  |
| meta-ads-agent | crm | 65 |  |
| offer-agent | crm | 48 | upsell/cross-sellを吸収 |
| pr-writer | crm | 60 | press-release/media-outreachを吸収 |
| pricing-strategist | crm | 46 |  |
| retention-agent | crm | 43 | ltv-agentを吸収 |
| sns-writer | crm | 50 |  |
| video-writer | crm | 55 | script-writerを吸収 |
| x-agent | crm | 48 |  |
| youtube-agent | crm | 47 |  |
| banner-designer | design | 44 |  |
| brand-designer | design | 57 |  |
| creative-director | design | 51 |  |
| design-checker | design | 43 | 品質ゲート |
| figma-designer | design | 50 | Figma MCP接続済み |
| lp-designer | design | 49 |  |
| ui-designer | design | 42 |  |
| ux-checker | design | 45 | 品質ゲート |
| ux-designer | design | 48 |  |
| ai-engineer | dev | 59 | LLM/RAG実装 |
| api-engineer | dev | 52 | 統合候補: laravel-engineer |
| performance-optimizer | dev | 62 | Core Web Vitals |
| python-engineer | dev | 80 | スクリプト/データ処理 |
| refactor-engineer | dev | 39 |  |
| system-architect | dev | 68 | architectを吸収 |
| tdd-guide | dev | 62 |  |
| typescript-engineer | dev | 84 | 統合候補: nextjs-engineer |
| translator | docs | 65 |  |
| automation-engineer | ops | 43 |  |
| customer-support-agent | ops | 51 |  |
| data-quality-agent | ops | 43 |  |
| loop-operator | ops | 59 |  |
| normalizer-agent | ops | 34 |  |
| notification-agent | ops | 38 |  |
| order-manager | ops | 39 | EC運用 |
| publishing-agent | ops | 51 |  |
| qdrant-agent | ops | 51 | Qdrantはdocker-compose導入済み |
| vendor-manager | ops | 48 | マルチベンダーEC運用 |
| workflow-agent | ops | 38 | task/scheduler-agentを吸収 |
| fact-checker | other | 43 | 品質ゲート |
| gamechanger | other | 95 | 戦略(CINO) |
| kingmaker | other | 78 | 戦略(Chairman) |
| product-strategy-agent | other | 75 | 戦略 |
| risk-checker | other | 43 | 品質ゲート |
| academic-paper-agent | research | 51 | 医療エビデンス調査 |
| behavior-analyst | research | 48 |  |
| business-analyst | research | 39 |  |
| competitor-agent | research | 45 |  |
| customer-voice-agent | research | 44 |  |
| data-analyst | research | 46 |  |
| financial-analyst | research | 38 |  |
| firecrawl-agent | research | 51 | Firecrawl MCP接続済み |
| google-search-agent | research | 50 | 統合候補: 組み込みWebSearchで代替可 |
| market-research-agent | research | 46 |  |
| news-agent | research | 49 |  |
| product-analyst | research | 41 |  |
| reddit-agent | research | 43 |  |
| regulation-agent | research | 52 | 法規制動向 |
| review-analyst | research | 39 |  |
| sns-research-agent | research | 50 |  |
| trend-agent | research | 37 |  |
| youtube-research-agent | research | 48 |  |
| ai-overview-seo | seo | 65 |  |
| ai-search-monitor | seo | 62 |  |
| authority-builder | seo | 41 |  |
| citation-builder | seo | 49 | GEO |
| entity-builder | seo | 47 | GEO |
| entity-seo | seo | 57 |  |
| geo-writer | seo | 67 | GEO |
| internal-link-seo | seo | 39 |  |
| keyword-agent | seo | 58 |  |
| knowledge-graph-agent | seo | 46 | GEO |
| local-seo | seo | 47 |  |
| medical-writer | seo | 47 | 薬機法対応コンテンツ |
| mention-builder | seo | 45 | GEO |
| offpage-seo | seo | 39 |  |
| onpage-seo | seo | 46 |  |
| parasite-seo | seo | 57 |  |
| programmatic-seo-agent | seo | 48 |  |
| schema-seo | seo | 46 | 構造化データ |
| seo-checker | seo | 40 | 品質ゲート |
| technical-seo | seo | 63 |  |

## archive-candidate（`.claude/agents/` から退避済み・人間の最終判断待ち）
`→名前` は統合先。復帰する場合はファイルを `.claude/agents/` に戻し、このtierを変更する。
| Agent | domain | desc文字数 | 備考(統合先/用途) |
|---|---|---|---|
| brand-agent | crm | 50 | →brand-designer/ecommerce-strategist 低頻度 |
| cross-sell-agent | crm | 38 | →offer-agent 統合 |
| email-writer | crm | 45 | →email-marketing-agent 統合 |
| linkedin-agent | crm | 48 | 低頻度チャネル |
| ltv-agent | crm | 46 | →retention-agent 統合 |
| media-outreach-agent | crm | 44 | →pr-writer 統合 |
| pinterest-agent | crm | 47 | 低頻度チャネル |
| press-release-agent | crm | 34 | →pr-writer 重複 |
| sales-planner | crm | 43 | 低頻度(B2B営業は対象外) |
| threads-agent | crm | 57 | 低頻度チャネル |
| tiktok-ads-agent | crm | 56 | 低頻度チャネル |
| tiktok-agent | crm | 49 | 低頻度チャネル |
| upsell-agent | crm | 37 | →offer-agent 統合 |
| x-ads-agent | crm | 46 | 低頻度チャネル |
| yahoo-ads-agent | crm | 50 | 低頻度チャネル |
| art-director | design | 46 | →creative-director 重複 |
| motion-designer | design | 45 | 低頻度 |
| video-designer | design | 40 | 低頻度 |
| architect | dev | 68 | →system-architect 重複 |
| backend-engineer | dev | 81 | →laravel-engineer 完全重複 |
| database-agent | dev | 54 | →data-analyst 重複 |
| deployment-agent | dev | 32 | →devops-engineer 重複 |
| frontend-engineer | dev | 48 | →nextjs-engineer 完全重複 |
| ml-engineer | dev | 37 | →ai-engineer 統合 |
| mobile-engineer | dev | 57 | モバイルアプリ未着手 |
| script-writer | docs | 55 | →video-writer 統合 |
| automation-agent | ops | 41 | →automation-engineer 重複 |
| deduplication-agent | ops | 24 | →normalizer-agent 重複 |
| neo4j-agent | ops | 44 | Neo4j未導入(docker-compose対象外) |
| parser-agent | ops | 42 | →normalizer-agent 重複 |
| scheduler-agent | ops | 41 | →workflow-agent 重複 |
| task-agent | ops | 36 | →workflow-agent 重複 |
| ceo-agent | other | 52 | →kingmaker 役職ロールプレイ・低頻度 |
| cfo-agent | other | 55 | →financial-analyst 低頻度 |
| chief-of-staff | other | 51 | →router 低頻度 |
| cmo-agent | other | 70 | →kingmaker 低頻度 |
| coo-agent | other | 55 | →kingmaker 低頻度 |
| expansion-agent | other | 44 | 低頻度(現フェーズ対象外) |
| partnership-agent | other | 40 | 低頻度(現フェーズ対象外) |
| competitor-analyst | research | 68 | →competitor-agent 重複 |
| crawler-agent | research | 38 | →firecrawl-agent 重複 |
| market-analyst | research | 53 | →market-research-agent 重複 |
| patent-agent | research | 37 | 低頻度 |
| pricing-analyst | research | 42 | →pricing-strategist 重複 |
| review-research-agent | research | 38 | →review-analyst 重複 |
| scraping-agent | research | 36 | →firecrawl-agent 重複 |
| trend-analyst | research | 39 | →trend-agent 重複 |
