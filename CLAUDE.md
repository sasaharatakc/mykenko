# AI Organization OS — MYKENKO プロジェクトルール

## 動作モデル
Kingmaker → Gamechanger → @router → Crew選定 → Agent実行 → Skill活用 → ツール/MCP/API → Review Mesh → Approval Gate → Memory Layer → Evolution Layer

## 常に守るルール
- ユーザー向けの計画・説明は日本語を使用（コード・英語固有名詞を除く）
- 実装依頼はチャット説明より実際のファイル変更を優先
- 独立した調査・監査・並列レビューはサブエージェントを使用
- 繰り返しワークフローはスキルを使用
- 明示的な承認なしに本番データの公開・送信・削除・取引・変更を行わない
- 医療/YMYL/医薬品コンテンツは効果の断言を避け、コンプライアンスレビューを実行
- SEO/GEO/SNS/PRは戦略・実行・レビュー・メモリ書き戻しを分離

---

## GitHub 運用ルール（SSOT）

### 原則
GitHubをすべての作業の単一の真実の源（SSOT）とする。
**Issue がなければ作業を開始しない。**

### 作業フロー
```
Issue作成 → Branch作成 → 実装 → PR作成 → CI確認 → Review → Merge
```

### ブランチ命名規則
```
feature/{issue-number}-{short-name}    # 新機能
fix/{issue-number}-{short-name}        # バグ修正
content/{issue-number}-{short-name}    # コンテンツ
seo/{issue-number}-{short-name}        # SEO対応
compliance/{issue-number}-{short-name} # 規制対応
devops/{issue-number}-{short-name}     # インフラ・CI
```

例：
```
feature/21-product-page-v2
compliance/22-yakukiho-review
seo/23-product-schema
```

### Issueラベル体系
```
type:feature / type:bug / type:content / type:seo
type:compliance / type:research / type:automation / type:devops

priority:S  # 売上・法規制・重大バグに直結 → 即日対応
priority:A  # 今週やる
priority:B  # 余裕があれば
priority:C  # いつか

status:todo / status:doing / status:review / status:blocked / status:done

area:media / area:shop / area:ai / area:price-monitor / area:admin / area:infra

risk:low / risk:medium / risk:high / risk:legal
```

### 毎朝確認する順番
1. `priority:S` のIssue
2. `status:blocked` のIssue
3. `status:review` のIssue
4. 承認待ちPR（Checks ✅ かつ Review済み）
5. 失敗しているActions

### PR作成時の必須項目
- 概要・関連Issue（`Closes #番号`）
- 変更内容リスト
- 動作確認チェック
- 規制チェック（コンテンツ変更時は必須）
- Claude/Codexへの申し送り
- 残課題

### mainブランチ保護（必須設定）
以下をGitHub Settings > Branches で手動設定：
- mainへの直接push禁止
- PR必須（最低1件のReview）
- CI（Actions）成功必須
- force push禁止・delete禁止

---

## デフォルトビルドコマンド
- JavaScript/Next.js: `npm run lint`, `npm test`, `npm run build`
- PHP/Laravel: `php artisan test`, `php artisan route:list`
- Python: `pytest`, `ruff check`, `mypy`
- Git: 最終サマリー前に `git status` と `git diff` を確認

## 出力標準
完了したタスクには必ず含める：変更ファイル、検証結果、リスク、次のアクション

---

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

## プロジェクト: MYKENKO
- フロントエンド: Next.js 14 (App Router) — `frontend/`
- バックエンド: Laravel 11 + Sanctum — `backend/`
- DB: SQLite (開発), MySQL (本番)
- 認証: Customer (`auth_token`) / Vendor+Admin (`user_auth_token`)
- Cookie: `mykenko_auth=1` で保護ルートのミドルウェア制御
