# AI PM OS アーキテクチャレビュー & RUN-031以降ロードマップ

> 作成日: 2026-07-09
> 対象: AI PM OS（MVP v2 / Phase D、RUN-023〜030完了時点）
> 位置づけ: シニアプロダクトアーキテクトレビュー。既存設計を壊さず段階的に強化する前提。

---

## 1. 総評

AI PM OSは「AIチャット」ではなく「AI社員を管理・実行・検証する業務OS」という方向性が明確で、
dry-run / preview / evidence / validation / confirm / conformance という安全パイプラインを
最初から中核に据えている点で、世界的に見ても正しい設計思想を持っている。

一方で、現状の弱点は **「安全装置がUI層の運用ルールに留まり、実行層（Execution Fabric）で
強制されていない可能性」** と **「契約（スキーマ）の不在」** に集約される。
次フェーズの主題は機能追加ではなく、**契約の型化・実行層での強制・証跡の改ざん不能化** の3点。
これが済めば Design / n8n Connector の追加は「SDKにプラグインを足す作業」に単純化される。

---

## 2. 強み

| # | 強み | なぜ効くか |
|---|------|-----------|
| 1 | 安全パイプライン先行設計（dry-run→preview→evidence→confirm→conformance） | 後付けの安全対策は必ず穴が空く。先行設計は競合SaaS（AutoGPT系）に対する最大の差別化 |
| 2 | GitHub SSOT との整合（Issue→Branch→PR→CI→Review→Merge） | 実行の承認・監査をGitHubの既存ガバナンスに載せられる。監査ログを自前で作らなくてよい領域が広い |
| 3 | Work Registry による作業の一元管理 | 「AIが何をやっているか分からない」問題の構造的解決。SaaS化時のコア資産 |
| 4 | 「AI社員が働いて見える」体験（AI Office / Timeline） | チャットUIとの決定的差別化。経営者が状態を一目で把握できる |
| 5 | RUN単位の段階的デリバリー | 各RUNが検証可能な増分。ロールバック容易 |
| 6 | Connector抽象（GitHub / SEO / Design / n8n） | 外部連携の増加が線形コストで済む土台がある |

---

## 3. 弱点・抜け・危険な設計

優先度順（S=即対応、A=今フェーズ、B=次フェーズ）。

| 優先度 | 弱点 | リスク |
|--------|------|--------|
| S | **ガードがUI層にある疑い**: dry-run/confirmがWeb Shellの画面遷移で担保され、APIを直接叩けばバイパスできる構造なら、安全設計は実質存在しない | 誤実行・悪意ある実行 |
| S | **ExecutionRequestの契約（スキーマ）未定義**: 実行要求・証跡・適合結果が型化されていないと、Connectorごとに独自解釈が発生し検証不能になる | Connector追加ごとに安全性が劣化 |
| S | **冪等性の欠如**: リトライ・二重クリック・再送で同じmutationが2回走る設計だと、GitHub/n8n/ECの実操作で事故る | 二重PR、二重注文処理、二重投稿 |
| A | **Evidenceの改ざん可能性**: 証跡がただのログ/スクショ保存なら、後から書き換え可能で監査に使えない | コンプライアンス価値ゼロ化 |
| A | **dry-runの忠実度**: dry-runと本実行がコードパスを共有していないと「preview通ったのに本番で違う結果」が起きる | 承認の信頼崩壊 |
| A | **AI社員の権限モデル不在**: どのAgentがどのConnectorのどの操作をどのリスクまで実行できるか（capability）が定義されていない | 全Agentが全能になる |
| A | **キルスイッチ・予算上限の不在**: 暴走時に全実行を止める手段、Agent別のAPIコスト/実行回数上限がない | コスト爆発・連鎖事故 |
| B | **シングルテナント前提**: org/workspace IDがデータモデルにないと、SaaS化時に全テーブル移行が必要になる | SaaS化コスト激増 |
| B | **Connectorの認証情報管理**: トークンが環境変数直置きだと、スコープ最小化・ローテーション・失効検知ができない | 漏洩時の被害拡大 |
| B | **Conformanceのバージョン管理不在**: ルールが版管理されていないと「その時どのルールで承認されたか」を証明できない | 監査不能 |

---

## 4. 改善方針（3原則）

1. **Enforce at the Fabric, not the UI**
   すべてのガード（validation / dry-run必須 / confirm / conformance）を Execution Fabric のサーバ側ステートマシンで強制する。UIはその状態を表示するだけ。APIを直接叩いても同じゲートを通る。

2. **Contracts first（契約の型化）**
   ExecutionRequest / Evidence / ConformanceResult / ConnectorManifest をJSON Schemaで定義し、`packages/schemas` 相当の共有パッケージに置く。全Connector・全UIはこの契約に従う。

3. **Evidence is append-only（証跡は追記のみ）**
   証跡はsha256でコンテンツアドレス化し、追記専用ストアに保存。run_idに紐付け、削除・更新APIを作らない。

---

## 5. UI/UX改善案

### 5.1 承認インボックスを第一級画面に（最重要）
- GitHubのPRレビューキューに相当する **Approval Inbox** を新設。
- 承認画面は「diff中心」: 左に変更前、右に変更後（またはplan出力）、下にEvidence・Conformance結果・リスクバッジ。
- 「なぜこれは安全か」パネル: validation結果 / dry-run結果 / conformanceルール通過一覧を1画面で提示。判断材料を探させない。
- risk tier別のUI: `low`はワンクリック承認、`high`は理由入力+二段階確認（将来は2人承認）。

### 5.2 AI Office（AI社員の可視化）
- Agentカード: 状態（idle / working / waiting-approval / blocked / error）、現在のWork、直近のEvidence、本日の実行数とコスト。
- 状態はステートマシンから直接導出（表示用の別管理をしない）。
- 「今日の朝会ビュー」: CLAUDE.mdの毎朝確認順（priority:S → blocked → review → 承認待ち → 失敗Actions）をそのままダッシュボード化。

### 5.3 Runtime Timeline
- run_id / agent / connector / risk でフィルタ。各行に duration・コスト・Evidence件数。
- 失敗runは「どのゲートで止まったか」（VALIDATION / DRY_RUN / APPROVAL / CONFORMANCE / EXECUTE）を色分け表示。

### 5.4 Connector状態の常時表示
- 各Connectorに connected / token期限切れ / rate-limited / error のヘルスバッジ。
- 劣化時は該当Connectorの実行要求を自動的に `blocked` にし、理由を表示。

### 5.5 Execution Request Builder
- フォームではなくコマンドパレット（⌘K）+ スキーマ駆動フォーム: ConnectorManifestのcapability定義からフォームを自動生成。手書きフォームの保守をやめる。

---

## 6. アーキテクチャ改善案

### 6.1 ExecutionRequest 契約（JSON Schema）

```jsonc
{
  "request_id": "uuid",
  "idempotency_key": "string",        // 同一keyの再送は前回結果を返す
  "actor": { "agent_id": "seo-writer", "on_behalf_of": "user_id" },
  "tenant_id": "org_xxx",             // 今は固定値でよい。列だけ今作る
  "connector": "github",
  "operation": "create_pull_request", // ConnectorManifestに定義された操作のみ
  "params": { /* operation別スキーマでvalidate */ },
  "risk_tier": "low|medium|high",     // Manifestの操作定義から自動決定、手動で上書き不可
  "dry_run_evidence_id": "sha256:...",// 本実行はdry-run証跡なしでは受理しない
  "approval": { "token": "...", "expires_at": "...", "approved_by": "..." },
  "created_at": "...", "expires_at": "..."
}
```

### 6.2 実行ステートマシン（サーバ側で強制）

```
DRAFT → VALIDATED → PREVIEWED → PENDING_APPROVAL → APPROVED → EXECUTING → VERIFYING → DONE
                       │                                          │            │
                       └ REJECTED / EXPIRED                       └ FAILED     └ NONCONFORMANT → ROLLED_BACK
```

- 遷移ガード: `PREVIEWED` にはdry-run Evidenceが必須。`APPROVED` には有効期限内の承認トークンが必須。`DONE` にはpost-conformance通過が必須。
- 承認トークンはTTL付き（例: 30分）。パラメータのハッシュに署名するため、**承認後にparamsを変えると無効化される**。
- `risk_tier=low` の read-only操作のみ、ポリシーで自動承認可（それでも記録は残る）。

### 6.3 Evidence Store
- 型付きEvidence: `plan-diff` / `api-response` / `screenshot` / `conformance-report` / `ci-result`。
- 保存時にsha256を計算しIDにする（コンテンツアドレス）。メタデータ（run_id, agent, connector, 型, 時刻）をDBに、本体をオブジェクトストレージに。
- 追記専用。UPDATE/DELETEのAPIを実装しない。

### 6.4 Conformance = Policy as Code
- ルールパックをYAML/JSONで版管理（git内）。例: `github.no-direct-push-to-main`, `content.yakkiho-forbidden-words`, `n8n.no-active-deploy`。
- 評価タイミングは2回: **pre（ゲート）** = APPROVED前、**post（検証）** = EXECUTING後。
- 結果は `conformance-report` Evidenceとして保存し、「どの版のルールで通過したか」を記録。

### 6.5 Connector SDK（全Connector共通インターフェース）

```typescript
interface Connector {
  manifest(): ConnectorManifest;   // 操作一覧・paramsスキーマ・risk_tier・必要スコープ
  validate(req): ValidationResult; // 静的検証
  plan(req): Evidence;             // dry-run。本実行と同じコードパスで「何が起きるか」を生成
  execute(req): Evidence;          // 本実行。planと同一パスの最終段のみ分岐
  verify(req, result): Evidence;   // 実行後検証（CI結果、実データ照合）
  rollback?(req, result): Evidence;// 可能な操作のみ
}
```

- **planとexecuteは同一コードパス**にし、最終のAPI呼び出しだけを分岐させる（dry-run忠実度の担保）。
- ConnectorManifestに必要トークンスコープを宣言 → 実行時に実トークンのスコープが過剰なら警告、不足ならblocked。

### 6.6 Work Registry
- Work = `{ work_id, issue_ref(GitHub Issue必須), owner_agent, state, priority, linked_runs[], linked_evidence[] }`。
- CLAUDE.mdの「Issueがなければ作業しない」をシステムで強制: issue_refのないWorkは実行要求を発行できない。

### 6.7 横断的セーフガード
- **キルスイッチ**: グローバル / Connector別 / Agent別の3階層。ONで新規EXECUTINGへの遷移を全拒否（進行中はVERIFYINGまで完走させる）。
- **予算上限**: Agent別に「1日あたり実行回数 / APIコスト」の上限。超過で自動blocked+通知。
- **監査ログ**: 全状態遷移を `who / what / when / from-state / to-state / evidence_id` で記録。

---

## 7. Connector改善案（本番実用レベル設計）

### 7.1 GitHub Connector
- **read**（issue/PR/CI閲覧）: risk=low、自動承認可。
- **mutation は「draft PR作成」と「Issue/コメント操作」に限定**。直接push・merge・force pushはManifestに操作自体を定義しない（=構造的に不可能）。
- plan = 変更ファイルのdiffプレビュー。verify = PR作成後のCI checks結果をEvidence化。
- merge操作は当面人間のみ。将来入れる場合も `risk=high` + CI green + human review済みをpre-conformance条件にする。

### 7.2 SEO Connector
- read: GSC/GAデータ取得、監査レポート生成（risk=low）。
- **mutation（メタタグ・構造化データ・コンテンツ変更）は必ずGitHub Connector経由のPRとして出す**。SEO Connector自身は本番に触らない。→ GitHubのゲートとCIを全部継承できる。
- Evidence: 変更前後のGSCスナップショット・Lighthouseスコア。post-verifyは「翌週の順位/CTR比較」を scheduler で自動起票。
- コンテンツ変更時は `content.yakkiho-*` ルールパックをpre-conformanceで必須通過。

### 7.3 Design Connector（次RUN対象）
- read: Figma `get_design_context` / `get_screenshot` / `get_variable_defs`（risk=low）。
- write: **本番ファイル直接編集は不可**。ステージング用ファイル（またはページ）にのみ生成し、Evidenceとしてbefore/afterスクリーンショットを添付、人間がFigma上でマージ。
- 用途の初手は「デザイン→コード」方向（design contextの取得とUI実装連携）に絞る。write系は read系が安定してから。

### 7.4 n8n Connector（次RUN対象）
- **ワークフローJSONをgitで版管理**し、デプロイはPR経由（GitHub Connectorのゲートを継承）。
- デプロイは常に **inactive状態で作成** → dry-run（pinned data でのテスト実行）Evidence → 人間承認 → activate。activateは独立した `risk=high` 操作。
- 全ワークフローに必須タグ: `owner_agent` / `kill-switch対応`（エラー時に自分をdeactivateするError Trigger）。
- 外部送信系ノード（メール送信・SNS投稿・決済）を含むワークフローは pre-conformance で検出し、承認要件を自動昇格。

---

## 8. SaaS化の優先順位

**結論: 今すぐマルチテナントSaaSを作らない。ただし「後で移行不能になる部分」だけ今仕込む。**

| 優先 | 項目 | 今やること |
|------|------|-----------|
| 1 | データモデルのテナント対応 | 全テーブルに `tenant_id` 列を追加（値は固定でよい）。後からの追加は全面移行になる |
| 2 | 認証情報の分離 | Connectorトークンを `tenant_id + connector` 単位のsecrets storeに。環境変数直置きをやめる |
| 3 | 監査ログのエクスポート | 追記専用ログ+CSV/JSONエクスポート。B2B SaaSの必須要件で、単一テナントでも自分の監査に使える |
| 4 | 使用量メータリング | Agent別・Connector別の実行数/コスト記録。予算上限機能（6.7）と実装が共通 |
| 5 | RBAC | owner / approver / operator / viewer の4ロール。承認権限の分離はSaaS前でも価値がある |
| 6 | 課金・オンボーディング | **最後**。Fabric契約が安定するまで着手しない |

---

## 9. 次の実装タスク10個（RUN-031〜040）

| RUN | タスク | 内容 | 完了条件 |
|-----|--------|------|----------|
| RUN-031 | 契約スキーマ定義 | ExecutionRequest / Evidence / ConformanceResult / ConnectorManifest のJSON Schemaを共有パッケージに定義 | 既存の実行要求がスキーマvalidationを通る |
| RUN-032 | 実行ステートマシン | サーバ側で遷移ガード強制 + idempotency_key。UIバイパス不可を確認 | API直叩きでdry-run/承認をスキップできないテストが通る |
| RUN-033 | Approval Gate v2 | TTL付き承認トークン（paramsハッシュ署名）、risk tier別ポリシー、承認後のparams変更で無効化 | 期限切れ・改変トークンが拒否される |
| RUN-034 | Evidence Store | sha256コンテンツアドレス+追記専用ストア、Timeline連携 | UPDATE/DELETE経路が存在しない。全runにEvidenceが紐付く |
| RUN-035 | Conformanceエンジン | ルールパック版管理、pre/post 2段評価、結果のEvidence化 | 「どの版のルールで通過したか」がrunから辿れる |
| RUN-036 | Connector SDK + GitHub移行 | 共通interface実装。GitHub Connectorを移行し、mutationをdraft PR/Issue操作に限定 | plan/executeが同一コードパス。直接push操作がManifestに存在しない |
| RUN-037 | Design Connector v1 | Figma read（design context / screenshot）+ ステージング限定write | 本番ファイルへのwrite経路がない。before/afterスクショがEvidence化 |
| RUN-038 | n8n Connector v1 | workflow JSONのgit管理、inactiveデプロイ→承認→activate分離 | activateなしで動くワークフローをデプロイできない |
| RUN-039 | AI Office v2 + Approval Inbox | 承認インボックス、Agent状態カード、コスト表示、Connectorヘルスバッジ | 承認判断に必要な情報が1画面で完結する |
| RUN-040 | MVP v2 Final Gate | キルスイッチ3階層、Agent別予算上限、E2E conformanceテスト、運用Runbook | 全ゲートのバイパス不能をE2Eで証明。Runbookで復旧手順が再現可能 |

依存関係: 031→032→033→(034,035並行)→036→(037,038並行)→039→040。
034/035と037/038はそれぞれ並列実行可能。

---

## 10. RUN-031以降のロードマップ

```
Phase E: Execution Hardening（RUN-031〜035）… 約2〜3週間
  契約の型化・ステートマシン強制・Evidence改ざん不能化・Conformance版管理
  → ここが終わるまで新規Connectorのmutationを増やさない

Phase F: Connector Expansion（RUN-036〜038）… 約2〜3週間
  Connector SDK化 → GitHub移行 → Design / n8n を SDK準拠で追加
  → 「Connector追加=Manifest+plugin実装」に単純化されたことを確認

Phase G: Operator Experience + Final Gate（RUN-039〜040）… 約1〜2週間
  Approval Inbox / AI Office v2 / キルスイッチ / 予算上限 / E2E証明
  → MVP v2 Final Gate通過 = 「安全に本番業務を任せられる」宣言

Phase H: Business Connectors（RUN-041〜）
  CRM Connector（顧客セグメント読み取り→施策提案はPR/承認経由）
  EC運用 Connector（MYKENKO在庫・価格・注文の read→提案→承認実行）
  ※ いずれもPhase EのゲートとSDKをそのまま継承するため、安全設計の再発明は不要

Phase I: SaaS Readiness（RUN-04x〜）
  RBAC → secrets store → メータリング → マルチテナント有効化 → 課金
  ※ tenant_id列と監査ログはPhase Eで仕込み済みなので移行作業なしで到達できる
```

**判断基準**: 各Phaseの出口で「ゲートをバイパスできないことをテストで証明できるか」を問う。
証明できないままConnectorや自動化を増やすのが、このプロダクトにとって唯一の致命的な失敗パターン。
