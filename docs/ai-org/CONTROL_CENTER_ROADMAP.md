# Local Control Center — 自律管理画面化ロードマップ（Codexへの申し送り）

> **宛先**: Codex
> **目的**: Local Control Center を「固定コマンドの安全なローカル操作盤」から「チャット起点の制約付き自律運用管理画面」へ進化させるためのギャップ分析・実装順・監査プロンプトの引き継ぎ。
> **対象リポジトリ**: `sasaharatakc/ai-pm-os-reference`（ローカル: `~/Documents/Claude/Projects/AIPM`）
> **注意**: 本文書は申し送り原文をそのまま保存したもの。Blueprint v1.0 は Frozen、Execution Fabric を唯一の実行入口とする設計方針を前提とする。
> 登録日: 2026-07-10

---

## 結論

現在の`Local Control Center`は、**固定コマンドを安全に実行するローカル操作盤**です。
まだ「チャットで願いを入力すると、計画・実装・監査・PR・承認・完了確認まで自律的に進む管理画面」ではありません。
目標は、任意シェルをブラウザへ開放することではなく、次のような**制約付き自律運用**です。

```text
チャットで依頼
↓
目的・制約・完了条件を構造化
↓
実行計画を生成
↓
安全性と予算を評価
↓
低リスク工程を自動実行
↓
高リスク工程のみ承認
↓
隔離環境で実装
↓
検証・Claude監査
↓
Draft PR
↓
承認後にmerge
↓
main同期・表示確認
↓
証跡保存・完了報告
```

BlueprintをFrozenとし、Execution Fabricを唯一の実行入口にする設計方針は、この管理画面化と整合しています。

## 現在地

| 項目            |      現状 |
| ------------- | ------: |
| Reference MVP | 約85〜88% |
| 安全なローカル操作盤    |    約90% |
| チャット中心UI      |    約20% |
| 自動計画生成        | 約10〜20% |
| 実行オーケストレーション  | 約30〜40% |
| Approval実配線   | 約20〜30% |
| Evidence自動保存  | 約30〜40% |
| 外部Connector実行 | 約10〜20% |
| 自動復旧・再試行      |    約10% |
| 完全な管理画面運用     | 約35〜45% |

---

# 未完成・弱いところ

## 1. チャットが実行要求になっていない

現在不足しているもの:

* 自然言語から目的を抽出するIntent Compiler
* 対象プロジェクト、成功条件、制約、期限、予算の確定
* 曖昧な依頼を安全な`ExecutionRequest`へ変換する処理
* 会話途中の変更を既存Runへ反映する仕組み
* 「調査だけ」「Draft PRまで」「本番まで」の実行範囲判定

必要な状態:

```text
「medicine.shopのCVRを改善して」
↓
goal
project
scope
successCriteria
risk
budget
approvalPolicy
executionMode
```

## 2. 計画が実行可能なDAGになっていない

不足:

* ステップ間の依存関係
* 並列実行可能性
* 各ステップの担当Agent
* 各ステップの入力・出力
* 完了条件
* 失敗時の代替経路
* 再計画
* ステップ単位の承認
* 計画バージョン管理

単なるチェックリストではなく、機械が実行できるPlan Contractが必要です。

## 3. Control Centerが実行管理基盤ではない

現在の画面は固定action launcherです。

不足:

* Run作成
* Run一覧
* Run詳細
* Step詳細
* Queue
* Worker状態
* Agent状態
* 入力・出力表示
* 承認待ち
* 再試行
* 一時停止
* 再開
* ロールバック
* 依頼内容変更
* 実行履歴
* 完了判定

## 4. Codex・Claudeの安全な実行ブローカーがない

ブラウザから直接`codex`や`claude`を呼ぶのは危険です。

必要:

* 固定Operation Catalog
* サーバー側で生成する引数
* ブラウザからcommand、cwd、path、envを受け取らない
* 独立worktree
* 独立branch
* 1 Run＝1 workspace
* タイムアウト
* 出力上限
* プロセス停止
* orphan process回収
* concurrency制御
* ファイル数制限
* 差分サイズ制限
* 読み取り範囲制限
* main直接編集禁止
* secrets遮断

## 5. Execution Fabricが全処理の実入口になっていない

設計上は唯一の入口ですが、実際には一部がスクリプトやUIから直接動いています。

必要:

```text
UI
↓
ExecutionRequest
↓
Policy Engine
↓
Approval
↓
Execution Fabric
↓
Worker / Connector
↓
Verifier
↓
Evidence
```

すべての実行経路をこの一本へ統一する必要があります。

## 6. Approvalが契約として弱い

不足:

* Approval ID
* 誰が承認したか
* 何を承認したか
* 対象Plan version
* 対象diff
* 有効期限
* 一度限りの承認
* 承認後に内容が変わった場合の無効化
* 承認レベル
* 自動承認Policy
* 拒否理由
* 取消
* 代理承認
* 二者承認

特に重要なのは、**承認後にコードや計画が変化したら承認を無効にすること**です。

## 7. 高リスク操作の分類が未完成

最低限、次を分類する必要があります。

| リスク | 操作例                      |
| --- | ------------------------ |
| 低   | 読み取り、分析、ローカルbuild、テスト    |
| 中   | ファイル編集、branch作成、Draft PR |
| 高   | merge、メール送信、外部API書き込み    |
| 重大  | 本番反映、削除、支払い、顧客データ変更、医療判断 |

必要:

* Risk Engine
* operationごとのrisk level
* project固有Policy
* 金額・件数・影響範囲による昇格
* emergency stop

## 8. Evidenceが自動実行経路に接続されていない

現在はEvidence schemaとbaselineがありますが、Run完了時の自動生成が不足しています。

必要:

* RunごとにEvidence Bundle生成
* command
* tool
* agent
* prompt version
* input hash
* output hash
* changed files
* commit
* PR
* CI
* screenshots
* approval
* verifier result
* cost
* elapsed time
* rollback情報

「完了」と表示するには、EvidenceとVerifierが必須です。

## 9. 完了判定がAIの自己申告に依存しやすい

AIが「完了しました」と言うだけでは不十分です。

必要:

* Success Criteriaを機械判定
* build PASS
* test PASS
* conformance PASS
* UI HTTP 200
* visual check
* CI SUCCESS
* HEAD一致
* merge commit確認
* production health check
* Evidence completeness

Verifierは実装Agentと分離する必要があります。

## 10. 自動復旧が弱い

不足:

* retry policy
* exponential backoff
* retry可能・不可能の分類
* checkpoint
* resume
* idempotency key
* duplicate execution防止
* partial failure処理
* compensating action
* rollback
* stalled判定
* orphan process recovery
* machine restart後の再開

プロセスが落ちてもRunが消えない永続状態が必要です。

## 11. Work Registry v2移行が未完了

現在は移行Planとvalidatorが中心です。

不足:

* 160件の実移行
* consumer切替
* canonical ID統一
* alias tolerance削除
* legacyWorkId段階廃止
* UI fixtureからRegistry生成への切替
* Evidence links
* Run links
* approval links
* source request links

## 12. ConnectorがPlan中心で実実行に弱い

GitHub、SEO、Designなどは、安全なfixture・plan中心です。

必要:

* ConnectorManifest
* validate
* plan
* execute
* verify
* rollback
* credential scope
* rate limit
* idempotency
* dry-run
* mutation boundary
* evidence adapter
* health check

最初の実ConnectorはGitHubが適しています。

## 13. GitHub運用自動化が未完成

管理画面から最終完了まで行うには次が必要です。

* duplicate Issue検査
* branch作成
* commit
* push
* Draft PR
* CI watch
* Claude監査
* audit fix
* HEAD固定
* Draft解除
* merge
* main同期
* branch cleanup
* Issue close
* Registry同期
* conformance再確認

mergeは常に別Approval Gateに置くべきです。

## 14. Claude監査がRunに組み込まれていない

現在は手動プロンプトです。

必要:

* 高リスク判定時のみ自動監査
* 対象diff自動収集
* 最大ファイル数制限
* Verdictの構造化
* Top 3 risks
* fix要求のRun再投入
* 再監査
* PASSまでmerge不可
* 監査Evidence保存

## 15. Memory / Learningが実運用されていない

不足:

* 過去Run検索
* 成功した手順
* 失敗パターン
* プロジェクト固有ルール
* ユーザー承認傾向
* Agent成功率
* Connector成功率
* コスト
* タスク所要時間
* Prompt version比較
* 学習内容の承認
* 間違ったMemoryの削除・訂正

自動学習は、無検証でPromptを書き換えないようにする必要があります。

## 16. セキュリティモデルがローカル前提

現在は`127.0.0.1`限定なので比較的安全です。

将来不足するもの:

* 認証
* RBAC
* session
* CSRF
* audit log
* secret vault
* credential rotation
* tenant isolation
* project isolation
* signed webhook
* encryption
* data retention
* access review

ローカル版とクラウド版は分離した方が安全です。

## 17. 予算・コスト制御がない

必要:

* Run予算
* token上限
* API call上限
* Agent別上限
* 有料操作前の承認
* 予算超過停止
* 推定コスト
* 実コスト
* ROI
* runaway loop防止

## 18. UI情報設計が未完成

最終画面はControl Centerではなく、次の構成が適切です。

```text
Operate
├─ Chat
├─ Active Runs
├─ Approval Inbox
├─ Failures
└─ Recent Results

Plan
├─ Goal
├─ Steps
├─ Dependencies
└─ Success Criteria

Observe
├─ Timeline
├─ Logs
├─ Cost
├─ Agent Health
└─ Connector Health

Govern
├─ Policies
├─ Approvals
├─ Evidence
├─ Audit
└─ Access

Build
├─ Agents
├─ Connectors
├─ Capabilities
└─ Templates
```

最初に表示するのは`Operate`だけでよく、他は折りたたみます。

## 19. 管理画面自身の安全性検証が不足

必要なnegative test:

* 任意command注入
* path traversal
* env注入
* cwd変更
* shell injection
* unknown action
* approval replay
* stale approval
* tampered plan
* oversized request
* concurrent mutation
* cancellation race
* worker crash
* orphan process
* secret漏えい
* log injection
* Evidence改ざん
* merge HEAD不一致
* CI未完了merge
* main direct push

## 20. Final Autonomous Gateがない

最終的に以下を一回で検証するGateが必要です。

```text
Intent
Plan
Risk
Approval
Execution
Verification
Evidence
Recovery
Cost
Security
UI
Operator Runbook
```

---

# 推奨する実装順

管理画面中心へ切り替える場合、残りを次の9PR程度に分けるのが安全です。

| PR | 内容                             |
| -- | ------------------------------ |
| 1  | PR #523監査修正・merge              |
| 2  | HARDENING-010 Operate中心UI      |
| 3  | Chat Intent → ExecutionRequest |
| 4  | Plan Contract・Step DAG・Run永続化  |
| 5  | Approval Policy・署名付き承認         |
| 6  | 隔離Runner・Codex/Claude broker   |
| 7  | Evidence writer・Verifier配線     |
| 8  | GitHub Connector実実行・復旧         |
| 9  | Final Autonomous Gate・Runbook  |

この後、SEO、Design、n8nなどをConnector単位で追加します。

---

# Claudeへ渡す監査プロンプト

You are performing a senior architecture, security, runtime, and product audit of AI PM OS.

## Goal

The final product must allow the operator to express a goal in chat and have AI PM OS safely complete the entire workflow through a management console:

* understand intent
* define success criteria
* create a plan
* assign agents and tools
* execute steps
* pause for approval when required
* recover from failures
* verify results
* create evidence
* create and validate pull requests
* merge only after explicit approval
* confirm final system state
* report completion

This must not become an arbitrary browser-accessible shell.

## Repository

* Repository: sasaharatakc/ai-pm-os-reference
* Local path: ~/Documents/Claude/Projects/AIPM
* Base branch: main

## Architecture constraints

* Blueprint v1.0 is frozen.
* Reference Architecture v1.0 is the implementation map.
* Domain Packs are deployable service boundaries.
* Execution Fabric must be the only Work execution entrypoint.
* Knowledge and Memory belong to the Intelligence Layer.
* Specifications, code, generated artifacts, reports, UI, and conformance must stay synchronized.
* One PR must have one purpose.
* Do not recommend a broad rewrite.

## Current implementation summary

Implemented or partially implemented:

* Web Shell and AI Office UI
* Work Command Center
* Timeline and Replay UI
* Request Builder
* Execution Detail
* Approval Inbox UI
* GitHub, SEO, and Design connector fixtures/plans
* ExecutionRequest schema
* runtime request guard
* execution kernel entrypoint
* WorkState vocabulary
* Work Registry v2 migration planner
* Evidence Store schema and validator
* conformance policy-as-code
* negative self-tests
* localhost-only Local Control Center
* fixed action allowlist
* shell:false
* fixed cwd
* no browser-provided command, args, path, cwd, or env
* build, validation, conformance, self-test, cancellation, progress, heartbeat, bounded logs

Current Local Control Center limitations:

* it is an allowlisted command launcher
* it does not accept a goal in chat
* it does not create an ExecutionRequest from intent
* it does not build or execute a durable step plan
* it does not run Codex or Claude through a safe broker
* it does not persist full Run state
* it does not connect Approval and Evidence end to end
* it does not perform GitHub mutation
* it does not automatically recover or resume
* it does not complete a workflow from request to verified outcome

## Audit rules

TOKEN BUDGET MODE.

* Do not scan the whole repository.
* Start from this summary.
* Inspect at most 8 files in the first pass.
* Do not inspect node_modules, dist internals, lockfiles, generated bulk files, or archived reports.
* Do not edit anything.
* Do not run mutation commands.
* Do not create Issues, branches, commits, PRs, or Project items.
* Do not use --confirm.
* Do not provide broad generic advice.
* Identify concrete gaps against the actual code.
* Clearly separate verified findings from inferred risks.
* Prefer minimal evolutionary changes over new architecture.

Suggested first-pass files:

1. apps/web/local-control.js
2. apps/web/server.js
3. packages/schemas/execution-request.schema.json
4. services/runtime/kernel/execution-request-guard.ts
5. services/runtime/kernel/execution-kernel.ts
6. packages/schemas/evidence-store.schema.json
7. services/connector/types.ts
8. tools/ui/validate-local-control-center.py

If one of these paths does not exist, do not search the repository broadly. Report it and use the nearest directly referenced file only.

## Audit domains

Audit all of the following:

### 1. Product completeness

* Can the operator submit a goal from chat?
* Can the system define measurable completion?
* Can the operator understand progress, failures, approvals, cost, and results?
* Is the management console structured around Operate rather than static dashboards?

### 2. Intent and planning

* Intent compilation
* success criteria
* scope
* constraints
* risk
* budget
* step DAG
* dependencies
* replanning
* versioning

### 3. Runtime

* single Execution Fabric entrypoint
* durable Run state
* queue
* workers
* leases
* heartbeat
* checkpoint
* resume
* cancellation
* concurrency
* idempotency
* timeout
* retry
* rollback

### 4. Agent execution

* safe Codex broker
* safe Claude audit broker
* isolated worktrees
* branch isolation
* maximum inspected files
* maximum edited files
* output limits
* process cleanup
* environment isolation
* secret isolation

### 5. Approval and policy

* operation risk levels
* automatic versus manual approval
* approval identity
* approval scope
* plan/diff binding
* expiration
* replay prevention
* invalidation after changes
* two-person approval for critical actions

### 6. Evidence and verification

* evidence creation per step and per Run
* prompt and input hashes
* output and artifact hashes
* commands
* changed files
* commit and PR
* CI
* screenshots
* approvals
* verifier independence
* evidence tamper resistance

### 7. Connectors

* manifest
* validate
* plan
* execute
* verify
* rollback
* dry-run
* credentials
* rate limits
* mutation boundary
* idempotency
* evidence adapter

### 8. GitHub workflow

* duplicate detection
* branch
* commit
* push
* Draft PR
* CI watch
* Claude audit
* audit fixes
* HEAD match
* draft removal
* merge approval
* merge
* main sync
* final validation
* Issue and Registry synchronization

### 9. Security

* arbitrary command execution
* shell injection
* argument injection
* cwd/path/env injection
* path traversal
* localhost assumptions
* CSRF
* authentication
* RBAC
* secrets
* log injection
* oversized requests
* denial of service
* process escape
* workspace escape

### 10. Recovery and reliability

* worker crash
* process interruption
* machine restart
* partial failure
* orphan process
* stale lease
* duplicate execution
* retry storm
* rollback failure
* evidence write failure

### 11. Memory and learning

* successful workflow reuse
* failed pattern storage
* project rules
* prompt versioning
* feedback
* incorrect memory correction
* preventing unverified self-modification

### 12. Cost and governance

* token budgets
* API budgets
* runaway loop limits
* operator-visible estimated and actual cost
* paid action approval
* audit retention
* data retention

### 13. Validation

* missing positive tests
* missing negative tests
* conformance coverage
* browser UI tests
* runtime integration tests
* recovery tests
* approval replay tests
* evidence tampering tests
* HEAD mismatch and failed-CI merge tests

## Required output

### A. Executive verdict

Use exactly one:

* NOT READY
* READY FOR CONTROLLED LOCAL PILOT
* READY FOR INTERNAL MULTI-USER PILOT
* READY FOR PRODUCTION

Explain the verdict in no more than 8 lines.

### B. Verified implementation matrix

Table:

* Capability
* Status: Complete / Partial / Missing
* Evidence file
* Risk
* Minimum next change

### C. Top 15 blockers

For each blocker:

* severity: Critical / High / Medium
* verified or inferred
* affected files
* failure scenario
* minimal fix
* acceptance test

### D. Security threat model

Include:

* assets
* trust boundaries
* entrypoints
* attacker capabilities
* top abuse cases
* mandatory controls

### E. End-to-end missing path

Show the current and required path:

Chat → Intent → ExecutionRequest → Plan → Approval → Execution Fabric → Worker/Connector → Verification → Evidence → Completion

Mark every broken or placeholder link.

### F. Management console gap analysis

Specify the required screens and state:

* Operate
* Run detail
* Plan
* Approval Inbox
* Failures
* Evidence
* Policies
* Agents
* Connectors
* Costs
* Audit

### G. Minimal PR sequence

Propose 6–12 small PRs.

For every PR include:

* title
* one purpose
* maximum 8 files
* dependencies
* acceptance criteria
* whether Claude audit is required
* rollback strategy

### H. Final autonomous gate

Define exact checks required before the system may claim:
"Goal completed successfully."

### I. Questions that must be answered by the owner

Only include decisions that cannot safely be inferred.

### J. Final response format

End with:

Verdict:
Completion toward autonomous management-console goal:
Most dangerous current weakness:
Best next PR:
Files to inspect for that PR:
Claude audit required: YES / NO

## Claudeに特に聞くべき判断事項

Claudeの回答では、次を曖昧にさせないでください。

1. 現在のKernelが本当にExecution Fabric唯一の入口か
2. ApprovalがPlan・diff・HEADに結び付いているか
3. Runがプロセス停止後も再開できるか
4. Evidenceが自動生成され、改ざん検知できるか
5. CodexとClaudeを管理画面から安全に起動できる設計か
6. GitHub mergeをHEAD固定・CI固定で実行できるか
7. ブラウザ入力からshell、args、cwd、envへ到達できないか
8. 失敗途中に変更ファイルやプロセスが残らないか
9. AIの自己申告ではなく独立Verifierが完了を判定するか
10. 「全自動」が無限ループ・費用暴走・大量mutationを起こさないか

## 最初に実装すべきもの

Claude監査後の第一候補は、**HARDENING-010を拡張したOperate Console v1**です。

最初のPRでは実行機能を増やさず、以下だけに限定します。

```text
Chat入力
Run一覧
Run詳細
Plan表示
Approval待ち表示
Evidence表示
Progress
Pause / Cancel
```

その次に、`Chat → ExecutionRequest → dry-run Plan`を接続します。

この順番なら、管理画面を先に見える形へ変えながら、任意コマンド実行や危険な自動化を持ち込まずにゴールへ進められます。
