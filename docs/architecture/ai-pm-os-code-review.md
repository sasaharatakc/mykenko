# AI PM OS コードレビュー（RUN-031前の改善点）

> 作成日: 2026-07-09
> 対象: `sasaharatakc/ai-pm-os-reference` @ 666a943（run-031-design-task-connector マージ後）
> 観点: 設計 / UI / validator / docs / conformance

---

## 1. 問題点（証拠付き）

### 1-1. Work Registry / Execution Fabric / Runtime Events のつながりが「表示文字列」しかない【最重要】

- `work/registry/*.json` は160件全てが `{schema, task, status, assignee, capability}` の5キーのみ。**160件全てが `status: "planned"`**。title・Issue参照・run/evidenceへのリンクが一切ない。
- 状態語彙が3系統に分裂している:
  - Registry: `planned`
  - `services/runtime/state-machine/work-state-machine.ts`: `ready→assigned→executing→review→verified→completed→closed`
  - UIフィクスチャ(`apps/web/data/seo-task-connector.js`等): `ready / queued / review / blocked`
  → 同じWorkの状態を3箇所が別の言葉で持ち、相互変換も検証も存在しない。
- パネル間の「Linkage」は実データの結合ではなく表示文字列。例: `"workRegistryLink: "Work Registry Linkage: TASK-0144..TASK-0147 / WORK-0144..WORK-0147"`。WORK-xxxxというIDはRegistryに存在しない。
- `execution/fabric.json` は16行の静的設定(queues/workers/policies)のみ。**ExecutionRequestというエンティティがリポジトリのどこにも存在しない**。Request Builderは「ビルダー」ではなく固定フィクスチャの静的表示。
- `services/runtime/kernel/execution-kernel.ts` は `KERNEL_RUN_ID` が定数のハードコード。`runtime/execution-history.yaml` も全レコード同一タイムスタンプのフィクスチャ。決定論的リファレンスとしては正しいが、UI→Request→Kernel→History→UIという往復経路が存在しない。

### 1-2. validatorが表面的な文字列チェックになっている【最重要】

- `tools/validate_all.sh` の40本のvalidatorのうち、UI系(RUN-023〜031)は全て `"Dry-run Preview" in dist_html` 形式の**マーカー文字列存在チェック**（例: `tools/ui/validate-github-task-connector.py`）。
  - どこかにその文字列があれば通る（コメントに書いても通る）
  - 文言を1文字変えると壊れる（UI改善の阻害要因）
  - 「Mutation Guard: disabled」という**表示文字列の存在**を検証しており、ガードの**動作**は何も検証していない
- validatorは `apps/web/dist/index.html`（コミット済みビルド成果物）を検査する。**ソースを変更してdistを再ビルドし忘れても、古いdistで全validatorが通る**。dist == build(src) の検証がない。
- `tools/validation_lib.py` の `check_schema` はschema文字列の一致、`check_keys` はキー存在のみ。型・値域・参照整合性の検証なし。devDependenciesに `ajv` があるがデータ検証には未活用。work-item / fabric / history のJSON Schemaファイルが存在しない。
- `tools/work/validate-work-registry.py` はID形式とassignee存在のみ検証。**status語彙もcapabilityの実在も検証していない**。

### 1-3. Web Shellの情報設計が増えすぎている

- `apps/web/index.html` は1ページに**27セクション**（product-home / ai-office-v2 / work-command-center / timeline / release-gate / builder / connector×3 / sync-health / domain-status / quality / organization / access / observability / provider-enablement / deployment-readiness / docs / final-gate…）。左ナビ27アンカーの単一ページで、利用者の導線（毎朝見るもの/承認するもの/設定するもの）が区別されていない。
- RUN-014〜020系の基盤ステータスパネル（Domain/Access/Observability等）と、RUN-023〜030の操作系ビュー（Office/Command Center/Builder/Connector）が同格に並び、「AI社員が働いて見える」体験の主役が埋没している。

### 1-4. RUN-023〜030のUIが一貫していない

- 同一コンポーネント内でも表現が混在: `GitHubTaskConnector.js` はIssueを `<article class="command-preview">`+`<dl>` で、PRを `<li>` にセミコロン連結の文字列で描画。
- **表示ラベルがデータに焼き込まれている**: `"SERP Intent: product education"`, `"Evidence Snapshot: ..."` のようにプレフィックスがデータ値に含まれ、validatorがその文字列を要求するため、UI構造の変更＝データ＋validator＋docsの3点同時修正になっている。
- コネクタ3種でデータ形状がバラバラ（`issueMappings` / `seoWorkMappings` / `designWorkMappings`）。共通のConnector契約がない。
- インタラクションがゼロ（build.jsの文字列置換による静的HTML）。MVPの意図としては正しいが、「Builder」「Replay」という名前と実態（静的表示）が乖離。

### 1-5. Connectorが表示で終わっている

- GitHub/SEO/Designコネクタはいずれも `apps/web/data/*.js` のハードコードフィクスチャを描画するだけ。`manifest / validate / plan` に相当するコードが存在せず、`tools/github/validate-github-*.py` ともUIとも結合していない。
- 「dry-run only」「Mutation Guard: disabled」は**ポリシーとして強制されている状態ではなく、そう書いてあるだけ**。本番化の際に「表示」と「実装」の距離が最も大きいのがここ。

### 1-6. Conformanceがvalidatorの別名になっている

- `tools/conformance.sh` = validate_all + issue範囲 + registry整合 + project整合の4本。ポリシールールの定義・版管理・評価結果の成果物化（レポート出力）がない。「どの版のルールで通過したか」を後から証明できない。

### 1-7. docs・リポジトリ衛生

- リポジトリ直下に空の `_tmp_34_*` / `_tmp_6_*` ファイル6個がコミットされている。
- RUN番号のずれ: Design Task Connectorのデータは `runId: "RUN-031"` だが、運用認識では「RUN-030まで完了、Designはこれから」。docs/README間でもRUN範囲の記述が揺れている（README: RUN-003..020、final-mvp-gate: RUN-001..021）。
- `apps/web/dist/` がコミットされており、freshness検証がない（1-2と同根）。

### 1-8. 本番Connector化の前に不足している安全設計

- ExecutionRequest契約・idempotency key・承認トークン・risk tier・secrets管理・キルスイッチのいずれも未実装。`mutation: false` はカーネルの戻り値の定数であり、ガードではない。
- 「安全である」ことの証拠（evidence成果物）が標準出力のPASS/FAILのみで、保存されない。

---

## 2. 改善案

| # | 改善 | 内容 |
|---|------|------|
| A | **Work Registryを唯一のデータソースに昇格** | work-item schema v2: `{task, title, state(状態機械と同一語彙), assignee, capability, issueRef, links: {runs[], evidence[]}}`。UIの26個のフィクスチャ`data/*.js`を、Registry+execution-history+requestsからのビルド時生成(join)に置換。「Linkage文字列」を実IDの参照に変える |
| B | **状態語彙の統一** | `WorkState` を1箇所（`services/runtime/state-machine`）で定義し、Registry JSON・kernel・UI・validatorが同じ列挙を参照。`planned`→`ready` へ移行スクリプトで一括変換 |
| C | **ExecutionRequest v1の導入** | `execution/requests/*.json`（request_id, idempotency_key, connector, operation, params, risk_tier, dry_run, state）。Request Builderはこのファイルを描画し、kernelはこれを入力に取る。mutation系operationはschemaレベルで定義しない |
| D | **validatorの3層化** | ①JSON Schema検証（ajv/python jsonschema。全データファイルにschema定義を作成） ②参照整合性（task↔assignee↔capability↔issueRef↔history） ③UI検証はマーカー文字列をやめ、HTMLをパースして「セクションIDの存在＋Registry件数と描画行数の一致」を検証 |
| E | **dist freshness検証** | CI/conformanceで `pnpm run build` 実行後に `git diff --exit-code apps/web/dist` を必須化（または distのコミットをやめ、検証はビルド直後の出力に対して行う） |
| F | **Conformance = Policy as Code** | `conformance/rules/*.yaml`（版番号付き）+ 実行結果を `reports/conformance/<timestamp>.json` に保存（evidence成果物化）。「github.no-mutation-path」「ui.no-hardcoded-fixture」等をルール化 |
| G | **Web Shellの情報設計を3層に再編** | ①Operate（AI Office / Work Command Center / Timeline / Approval）＝毎日見る画面 ②Build（Request Builder / Connector×3）＝依頼を作る画面 ③System（Release Gate / 基盤ステータス14パネル / docs）＝確認する画面。左ナビを3グループ化し、基盤パネルはSystem配下に折り畳む |
| H | **UI共通レンダラー** | `components/shared/` に `dlCard()` / `rowTable()` / `statusBadge()` を作り、RUN-023〜031の全パネルを同一パターンに統一。ラベルプレフィックス（"Evidence Snapshot: "等）はデータから剥がしテンプレート側へ |
| I | **Connector契約の先行定義** | `services/connector/` に `manifest() / validate() / plan()` interfaceを定義（executeは意図的に未定義のまま）。GitHub/SEO/Designの3コネクタをこの契約に載せ、UIはmanifest+plan結果を描画する。本番化時はexecuteを足すだけの構造にする |
| J | **衛生** | `_tmp_*` 削除、RUN番号のSSOT表を `docs/index.md` に作成、README/final-mvp-gateのRUN範囲記述を統一 |

---

## 3. 優先順位

| 優先度 | 項目 | 理由 |
|--------|------|------|
| **S（RUN-031本体の前に必須）** | B 状態語彙統一 → A Registry昇格 → D validator 3層化 | ここが直らない限り、以降の全RUNが「文字列チェックに守られたフィクスチャ」を積み増すことになり、後で全面書き直しになる |
| **S** | E dist freshness | 今日から事故を防げる最安の1本。半日で入る |
| **A（RUN-031〜032で）** | C ExecutionRequest導入 → I Connector契約 | 本番Connector化の前提。UI表示との距離を先に縮める |
| **A** | F Conformance policy化 | Final Gateの証明力の源泉 |
| **B（並行可）** | G 情報設計再編 → H 共通レンダラー | Dでマーカー検証をやめた後にやると手戻りゼロ。先にやるとvalidator全滅する |
| **B** | J 衛生 | 30分で終わる。次のPRに同梱 |

**Final Gateに向けて不足しているもの（結論）**: ①「ゲートをバイパスできない」ことを示すE2E（validatorが文字列でなく振る舞いを検証） ②conformance結果のevidence成果物 ③dist/src一致証明 ④ExecutionRequest契約。この4つが揃わない限り、Final Gateは「全部PASSと表示される」だけで何も証明しない。

---

## 4. 具体的な修正ファイル

**S: 状態語彙・Registry・validator**
- `services/runtime/state-machine/work-state-machine.ts` — WorkStateをexportし唯一の語彙に
- `work/registry/TASK-*.json`（160件） — schema v2へ移行（`tools/work/migrate-registry-v2.ts` 新規）
- `tools/work/generate.ts` — v2形式で生成するよう更新
- `tools/work/validate-work-registry.py` — status語彙・capability実在・issueRef整合の検証を追加
- `schemas/`（新規） — `work-item.schema.json` / `execution-fabric.schema.json` / `execution-history.schema.json` / `execution-request.schema.json`
- `tools/validation_lib.py` — jsonschema検証ヘルパー追加
- `tools/ui/validate-*.py`（10本） — マーカー文字列→HTML構造+件数一致検証へ書き換え
- `tools/validate_all.sh` / `tools/conformance.sh` — dist freshnessチェック追加

**A: Request/Connector**
- `execution/requests/`（新規） — ExecutionRequestフィクスチャ
- `services/connector/types.ts`（新規） — `ConnectorManifest` / `validate` / `plan` interface
- `services/connector/github/` `seo/` `design/`（新規） — 3コネクタのmanifest+plan実装
- `apps/web/data/github-task-connector.js` ほか26ファイル — ビルド時生成に置換（`apps/web/build.js` 拡張）
- `conformance/rules/*.yaml`（新規） + `tools/conformance/run.ts` — ルール評価とレポート出力

**B: UI/衛生**
- `apps/web/index.html` — 左ナビ3グループ化・基盤パネル折り畳み
- `apps/web/components/shared/renderers.js`（新規） + RUN-023〜031コンポーネント10本の統一
- `_tmp_*` 6ファイル削除、`docs/index.md` にRUN番号SSOT表、`README.md` 修正

---

## 5. Codexに渡す実装プロンプト

以下をそのまま使用可能（1プロンプト=1PR推奨）。

### プロンプト1: 状態語彙統一 + Registry v2（優先度S）

```
リポジトリ: ai-pm-os-reference
ブランチ: run-032-registry-v2-state-unification

目的: Work Registryの状態語彙を実行ステートマシンと統一し、Registryを唯一のデータソースに昇格する。

タスク:
1. services/runtime/state-machine/work-state-machine.ts の WorkKernelState を
   WorkState として export し、これを唯一の状態語彙とする。
2. schemas/work-item.schema.json を新規作成（JSON Schema draft-07）:
   必須: schema="aipm.work-item/v2", task, title, state(WorkStateのenum),
   assignee, capability, issueRef(nullable), links{runs[], evidence[]}
3. tools/work/migrate-registry-v2.ts を作成し、work/registry/ の160ファイルを
   v2へ変換（status:"planned" → state:"ready"、title は issues/generated/ から取得、
   なければ task IDから生成）。冪等にすること（再実行しても差分ゼロ）。
4. tools/work/validate-work-registry.py を強化:
   - jsonschemaによるschema検証
   - state がWorkStateの語彙に含まれるか
   - capability が employees/registry.json のいずれかのemployeeのcapabilityに存在するか
5. tools/work/generate.ts をv2形式に更新。

制約:
- GitHub Issues/Projects への書き込み禁止（ローカルのみ）
- 既存validatorが全て通ること: bash tools/validate_all.sh && bash tools/conformance.sh
- pnpm run lint / typecheck / test / build が通ること

受け入れ基準:
- work/registry/*.json 160件が全てv2かつschema検証をパス
- 状態語彙が work-state-machine.ts の1箇所にのみ定義されている
- migrate再実行で git diff が空
```

### プロンプト2: validator 3層化 + dist freshness（優先度S）

```
リポジトリ: ai-pm-os-reference
ブランチ: run-033-validator-hardening

目的: マーカー文字列チェックを構造検証に置き換え、コミット済みdistの鮮度を保証する。

タスク:
1. tools/validation_lib.py に validate_json_schema(root, rel, schema_rel, errors) を追加
   （python3標準にjsonschemaがない場合はpip不要の軽量実装で、type/required/enumのみ対応で可）。
2. schemas/ に execution-fabric / execution-history / kernel-result のschemaを追加し、
   tools/execution/validate-execution-fabric.py 等をschema検証に切り替え。
3. tools/ui/validate-*.py（10本）を書き換え:
   - マーカー文字列の存在チェックを廃止
   - dist/index.html をパースし（html.parser使用）、以下を検証:
     a. 対象セクションの id が存在する
     b. セクション内の描画行数が、対応するデータソースの件数と一致する
     c. EmptyStateはデータ0件のときのみ出現する
4. tools/validate_all.sh の冒頭に dist freshness チェックを追加:
   node apps/web/build.js を実行し、git diff --exit-code apps/web/dist で差分があれば
   「dist is stale: run build and commit」でFAILさせる。
5. docs/quality/ にvalidator設計方針（3層: schema / 参照整合 / UI構造）を1ページ追加。

制約:
- 表示文言の変更は不要（この段階ではUIを触らない）
- 全validator・lint・typecheck・test・buildが通ること

受け入れ基準:
- 任意のUI文言を変更してもvalidatorが壊れない（構造が同じ限り）
- データ件数と描画件数の不一致を意図的に作るとvalidatorがFAILする
- dist未再ビルドのコミットがconformanceでFAILする
```

### プロンプト3: ExecutionRequest契約 + Connector interface（優先度A）

```
リポジトリ: ai-pm-os-reference
ブランチ: run-034-execution-request-connector-contract

目的: ExecutionRequestエンティティとConnector契約を導入し、UI表示を実データの描画に変える。

タスク:
1. schemas/execution-request.schema.json を作成:
   request_id, idempotency_key, connector(github|seo|design), operation,
   params(object), risk_tier(low|medium|high), dry_run(true固定), state
   (draft|validated|previewed|blocked), created_at
2. execution/requests/ にフィクスチャ4件を作成（github 2, seo 1, design 1。全て dry_run: true）。
3. services/connector/types.ts に interface を定義:
   ConnectorManifest { id, operations: { name, paramsSchema, riskTier }[] }
   Connector { manifest(): ConnectorManifest; validate(req): {ok, errors[]}; plan(req): PlanResult }
   ※ execute は意図的に定義しない（本番化フェーズまで型レベルで存在させない）。
4. services/connector/{github,seo,design}/ に3コネクタを実装。
   plan() は決定論的なPlanResult（plannedActions[], skipped[], evidence[]）を返す。
   既存の apps/web/data/*-task-connector.js の内容をplan()の出力として再現する。
5. apps/web/build.js を拡張し、connector系データファイルを
   「execution/requests + connector.plan()」から生成する（ハードコードデータ廃止）。
6. tools/execution/validate-execution-requests.py を新規作成し validate_all.sh に登録。

制約:
- 外部API呼び出しコードを一切含めない（fetch/axios/child_process禁止）
- mutation系operation（create/update/delete）をmanifestに定義しない
- 全validator・conformance・lint・typecheck・test・buildが通ること

受け入れ基準:
- Request Builder / Connector×3 の画面内容が execution/requests/*.json を変えると変わる
- manifestに未定義のoperationを持つrequestはvalidateでblockedになる
- リポジトリ全体をgrepしても execute() の実装が存在しない
```

### プロンプト4: Web Shell情報設計再編 + 共通レンダラー（優先度B、プロンプト2完了後）

```
リポジトリ: ai-pm-os-reference
ブランチ: run-035-web-shell-ia-refresh

目的: 27セクション単一ページを3層の情報設計に再編し、RUN-023〜031のUIパターンを統一する。

タスク:
1. 左ナビを3グループに再編（apps/web/index.html）:
   - Operate: Product Home / AI Office v2 / Work Command Center / Runtime Timeline
   - Build: Execution Request Builder / GitHub / SEO / Design Connector
   - System: Release Gate / Final MVP Gate / 基盤ステータスパネル群 / Documentation
   System配下の基盤パネル14個は <details> で折り畳み、初期状態は閉じる。
2. apps/web/components/shared/renderers.js を新規作成:
   dlCard(title, entries) / rowTable(headers, rows) / statusBadge(state) / emptyState(msg)
3. RUN-023〜031の10コンポーネントを共通レンダラーに置換。
   データ値に焼き込まれたラベルプレフィックス（"Evidence Snapshot: " 等）は
   データから削除し、テンプレート側のラベルに移す。
4. リポジトリ直下の _tmp_* 6ファイルを削除。
5. docs/index.md にRUN番号SSOT表（RUN-001〜031: 名称・状態・関連docs）を追加し、
   README.md のRUN範囲記述を一致させる。

制約:
- プロンプト2のvalidator改修が先にマージされていること（マーカー検証が残っていると全滅する）
- 情報の削除はしない（折り畳み・移動のみ）
- 全validator・conformance・lint・typecheck・test・buildが通ること

受け入れ基準:
- 初期表示のスクロール量が現状の1/3以下（Operateグループのみ展開）
- 10コンポーネントのHTMLパターンが共通レンダラー経由で統一されている
- git grep "_tmp_" が空
```

---

## 総括

このリポジトリは「決定論的・ローカルファースト・no-mutation」という規律が徹底されており、リファレンス実装としての骨格は良い。ただし現状の実態は**「フィクスチャを描画する静的サイト + 文字列存在チェック」**であり、Work Registry・Fabric・Runtime・Connectorの「つながり」はまだ表示文言上にしか存在しない。RUN-031以降で機能を積む前に、①状態語彙の統一 ②Registryのデータソース昇格 ③validatorの構造検証化 ④dist鮮度保証 の4点（プロンプト1・2）を先に済ませるべき。これを飛ばすと、Final Gateは「PASSと表示されるが何も証明しないゲート」のまま完成してしまう。
