# COMMAND_REGISTRY — スラッシュコマンド台帳（SSOT）

> `.claude/commands/` 配下コマンドの唯一の台帳。**コマンドの追加・削除・復帰はこのファイルの更新とセットで行う**（検証: `python3 tools/ai/validate-command-registry.py`）。
> 運用ルールは `docs/ai-org/COMMAND_POLICY.md`。監査日: 2026-07-09（63本を監査）
>
> 注意: コマンドは frontmatter を持たず、**先頭見出し行（`# /名前 — 説明`）がスキル一覧として毎セッション注入される**。body は起動時のみ読込。
> `.claude/skills/<カテゴリ>/` に同一内容のコピーが存在するが SKILL.md がないため**読み込まれない**（二重管理・将来の削除候補、人間の承認待ち）。

## サマリー
| tier | 数 | 配置 | セッション注入 |
|---|---|---|---|
| core | 12 | `.claude/commands/` | される（常用の最小セット） |
| optional | 40 | `.claude/commands/` | される（必要時のみ実行） |
| archive-candidate | 11 | `docs/ai-org/commands/archive/` | **されない**（復帰は `.claude/commands/` へ移動） |

## core（頻繁に使う最小セット・上限12本）
| Command | domain | 見出し(注入されるdescription) | 備考(統合先/用途) |
|---|---|---|---|
| article-writing | content | /article-writing — 長文記事執筆フロー | メディア記事の主力フロー |
| bug-fix | dev | /bug-fix — バグ修正フロー | バグ修正の標準フロー |
| laravel-patterns | dev | /laravel-patterns — Laravelコーディングパターン | バックエンド実装規約 |
| new-feature | dev | /new-feature — 新機能実装フロー | 新機能実装の標準フロー |
| nextjs-patterns | dev | /nextjs-patterns — Next.jsコーディングパターン | フロント実装規約 |
| refactor-flow | dev | /refactor-flow — リファクタリングフロー |  |
| security-review | dev | /security-review — セキュリティレビュー | 組み込み/security-reviewスキルと重複あり(挙動確認まで両立) |
| deploy-flow | ops | /deploy-flow — デプロイフロー |  |
| yakki-check | other | /yakki-check — 薬機法チェック | 薬機法チェック(PR必須項目) |
| ymyl-check | other | /ymyl-check — YMYLコンテンツチェック | YMYLチェック(PR必須項目) |
| tdd-workflow | qa | /tdd-workflow — TDD実装フロー |  |
| keyword-research | seo | /keyword-research — キーワードリサーチ |  |

## optional（必要時のみ実行）
| Command | domain | 見出し(注入されるdescription) | 備考(統合先/用途) |
|---|---|---|---|
| content-brief | content | /content-brief — コンテンツブリーフ作成 |  |
| content-optimize | content | /content-optimize — コンテンツ最適化 |  |
| video-script | content | /video-script — 動画台本作成フロー |  |
| campaign-launch | crm | /campaign-launch — キャンペーン実行フロー |  |
| checkout-optimize | crm | /checkout-optimize — チェックアウト最適化 | EC |
| email-flow | crm | /email-flow — メールマーケティングフロー |  |
| meta-ads-flow | crm | /meta-ads-flow — Meta広告運用フロー |  |
| design-system | design | /design-system — デザインシステム構築 |  |
| ux-audit | design | /ux-audit — UX監査フロー |  |
| api-design | dev | /api-design — API設計ガイド |  |
| page-speed | dev | /page-speed — ページ速度改善 |  |
| prompt-engineering | dev | /prompt-engineering — プロンプトエンジニアリング |  |
| rag-workflow | dev | /rag-workflow — RAG（検索拡張生成）実装フロー |  |
| adr | docs | /adr — Architecture Decision Record作成 |  |
| status-report | docs | /status-report — 進捗レポート |  |
| etl-pipeline | ops | /etl-pipeline — ETLパイプライン設計 |  |
| n8n-automation | ops | /n8n-automation — n8n自動化ワークフロー | n8nはdocker-compose導入済み |
| route-task | ops | /route-task — タスクルーティング | routerエージェントと役割重複(統合候補) |
| vendor-onboard | ops | /vendor-onboard — ベンダーオンボーディング | EC |
| webhook-setup | ops | /webhook-setup — Webhook設計 |  |
| playwright-automation | qa | /playwright-automation — Playwright自動化 |  |
| competitor-analysis | research | /competitor-analysis — 競合分析フロー | competitor-deepを吸収 |
| deep-research | research | /deep-research — 深層リサーチフロー | deep-research-flowを吸収 |
| evidence-search | research | /evidence-search — エビデンス検索 | 医療エビデンス |
| reddit-mining | research | /reddit-mining — Redditリサーチ |  |
| regulation-research | research | /regulation-research — 規制・法令調査 |  |
| trend-research | research | /trend-research — トレンドリサーチ |  |
| ai-overview-optimize | seo | /ai-overview-optimize — Google AI Overview最適化 |  |
| backlink-strategy | seo | /backlink-strategy — バックリンク獲得戦略 |  |
| citation-build | seo | /citation-build — 引用獲得戦略 | GEO |
| competitor-seo | seo | /competitor-seo — 競合SEO分析 |  |
| entity-extract | seo | /entity-extract — エンティティ抽出・最適化 | GEO |
| geo-audit | seo | /geo-audit — AI検索（GEO）監査 | GEO |
| internal-link | seo | /internal-link — 内部リンク最適化 |  |
| meta-gen | seo | /meta-gen — メタタグ生成 |  |
| programmatic-seo | seo | /programmatic-seo — プログラマティックSEO |  |
| schema-gen | seo | /schema-gen — 構造化データ生成 | 構造化データ |
| seo-audit | seo | /seo-audit — SEO総合監査 |  |
| serp-analysis | seo | /serp-analysis — SERP（検索結果）分析 | serp-deep-analysisを吸収 |
| technical-check | seo | /technical-check — テクニカルSEOチェック |  |

## archive-candidate（`.claude/commands/` から退避済み・人間の最終判断待ち）
`→名前` は統合先。復帰する場合はファイルを `.claude/commands/` に戻し、このtierを変更する。
| Command | domain | 見出し(注入されるdescription) | 備考(統合先/用途) |
|---|---|---|---|
| claude-api-usage | dev | /claude-api-usage — Claude API活用ガイド | 組み込みclaude-apiスキルと重複 |
| langgraph-workflow | dev | /langgraph-workflow — LangGraphエージェントワークフロー | LangGraph未導入・低頻度 |
| context-compress | ops | /context-compress — コンテキスト圧縮 | 組み込み/compactで代替可 |
| crew-select | ops | /crew-select — Crew選定 | AGENT_REGISTRY.mdの参照で代替 |
| parallel-run | ops | /parallel-run — 並列実行 | ハーネスの並列ツール呼び出しで代替可 |
| priority-sort | ops | /priority-sort — 優先度ソート | CLAUDE.mdの毎朝確認順で代替 |
| workflow-gen | ops | /workflow-gen — ワークフロー生成 | →workflow-agent(エージェント側)と重複 |
| competitor-deep | research | /competitor-deep — 競合深層分析 | →competitor-analysis 重複 |
| deep-research-flow | research | /deep-research-flow — 深層リサーチフロー | →deep-research 完全重複(同名機能) |
| google-search | research | /google-search — Google検索リサーチ | 組み込みWebSearchで代替可 |
| serp-deep-analysis | seo | /serp-deep-analysis — SERP詳細分析 | →serp-analysis 重複 |
