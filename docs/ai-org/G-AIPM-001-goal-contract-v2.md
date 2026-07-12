# G-AIPM-001 /goal Contract v2 — GPT(Codex) ハンドオフブリーフ

> **用途**: このファイルをそのまま GPT / Codex に渡す。対象リポジトリは `sasaharatakc/ai-pm-os-reference`。
> v1 からの改善点は3つ: (A) トークン削減を「ルール」ではなく「ファイル構造」で強制する、
> (B) Figma と実装の対応を機械可読スキーマで固定し再現性を上げる、
> (C) `/rpg-office` を Docker healthcheck 付きで自動起動し、毎回の 404 を排除する。

---

## A. トークン削減アーキテクチャ（構造で強制する）

v1 は「completed Issue を再読するな」「全走査するな」という*指示*だった。
v2 は **読めるファイル自体を小さくする**。守れない読み方が物理的にできない構造にする。

### A-1. 2層SSOT: index + card

`task-graph.json` を「ルーティング専用 index」に縮小し、Issue の詳細は 1 Issue = 1 card に分離する。

```text
plans/goals/G-AIPM-001/
├── goal.json                  # Goal定義 + Work優先順位（〜30行）
├── task-graph.json            # index: 16 Issue × 6フィールドのみ（〜120行）
├── issues/
│   ├── CONTROL-001A.json      # card: 選択されたIssueのみ読む
│   ├── ...
│   └── RELEASE-001B.json
├── ledger.json                # 完了台帳（1 Issue = 1行相当）
├── snapshots/latest.json      # Context Snapshot（≤1,500 bytes 固定）
└── issue-migration.json       # 既存Issue dry-run移行表
```

- **index（task-graph.json）の許可フィールド**: `issueId` / `workId` / `priority` / `status` / `dependencies` / `riskClass` のみ。1 Issue ≈ 40 tokens、グラフ全体 ≈ 700 tokens。
- **card（issues/*.json）**: `title` / `userOutcome` / `allowedPaths` / `maximumFiles` / `focusedValidation` / `fullValidationRequired` / `visibleProof` / `approvalKind` / `completionCriteria` / `designSpec`（UI Issueのみ、§B）。
- **実行時の読取は「index + 選択された1 card」のみ**。16 card を一括で読む操作は禁止。

### A-2. 完了台帳（ledger.json）

Issue 完了時、card は以後読まない。台帳に1エントリ追記して終わり:

```json
{ "issueId": "CONTROL-001A", "pr": 652, "mergedSha": "abc1234", "evidence": "evidence/CONTROL-001A/" }
```

依存判定は index の `status` と ledger だけで完結する。完了 Issue の card・過去PR・過去会話を依存判定のために開くことを禁止する。

### A-3. Snapshot ハードキャップ

- `snapshots/latest.json` は**固定スキーマ・上限 1,500 bytes**。超過したら invalid として stop。
- フィールド: `goalId` / `graphDigest` / `activeIssueId` / `phase` / `headSha` / `openPr` / `repairCycle` / `blockedReason`。散文禁止。
- 常に最新1件のみ読む。過去 Snapshot の再読禁止（履歴はgitにある）。

### A-4. 決定的 Issue 選択（LLM推論を選択から排除）

次 Issue の選択を LLM の判断にさせない。スクリプト化する:

```bash
tools/select-next-issue.sh G-AIPM-001
# 出力は1行のみ: "CONTROL-001B" または "GOAL_COMPLETE" または "BLOCKED:<issueId>"
```

ロジック: Work優先順（CONTROL→WORKFORCE→AGENT→DESIGN→RELEASE）で最初の
`status:todo` かつ全 dependencies が ledger にある Issue を返す。
これで「バックログ全体を読んで考える」トークンがゼロになる。

### A-5. Evidence は参照のみ・失敗ログは tail

- Evidence（ログ・スクリーンショット・E2E結果）は `evidence/<issueId>/` に保存し、**パス参照のみ**をSnapshot/PR/Returnに書く。本文へのインライン貼付禁止。
- 成功ログは全文保存もしない（exit code と1行サマリのみ）。失敗ログは **tail 30行まで**を修復Taskの入力にする。

### A-6. プロンプトキャッシュ安定化

- この Contract 本文（§C）はリポジトリに凍結保存し、毎回**バイト同一**で渡す → prompt cache のヒット率が最大化する。
- 可変情報（選択Issue・Snapshot）は必ず Contract の**後ろ**に連結する。Contract 内に日付・SHA等の可変値を埋め込まない。

### A-7. 読取バジェット（1 run あたり）

| フェーズ | 読んでよいもの | 上限 |
|---|---|---|
| 起動 | goal.json / task-graph.json / snapshots/latest.json / ledger.json | 4ファイル固定 |
| 選択 | `select-next-issue.sh` の出力1行 + 選択Issueの card | 1ファイル |
| 実装 | card の `allowedPaths` 内 | ≤8ファイル |
| GitHub | 自PRのCI結果のみ（minimal_output） | Issue/過去PRの読取ゼロ |

---

## B. Figma × 実装の再現性（機械可読スキーマで固定）

「Figmaを見て実装する」を廃止し、**トークンとマッピングファイルだけが両者の橋**になる構造にする。

### B-1. design-tokens.json を唯一の橋にする

```text
design/
├── design-tokens.json   # color / spacing / typography / radius / breakpoints
└── code-connect.json    # Figma node ↔ codeコンポーネントの対応表
```

- コードのテーマと Figma Variables は**両方とも design-tokens.json から生成**する。手動で色やpxを書いた時点で違反。
- Figma との差分は「見た目の記述」ではなく **token delta / component delta** として表現する。

### B-2. UI Issue の card に designSpec を必須化

```json
"designSpec": {
  "figmaNodeUrl": "https://www.figma.com/design/...?node-id=...",
  "componentMap": [
    { "figma": "GoalCard", "code": "app/components/control/GoalCard.tsx" }
  ],
  "states": ["default", "loading", "error", "empty"],
  "breakpoints": ["sm", "md", "lg"],
  "tokensUsed": ["color.surface.primary", "space.4"]
}
```

実装者（Codex）は figmaNodeUrl の node と componentMap の対応**だけ**を根拠に実装する。
「Figma全体を眺めて解釈」は禁止 — 迷いの原因とトークン消費の両方を断つ。

### B-3. DesignChange Task の固定スキーマ（Figma → code 方向）

Figma上の修正は必ずこの形式の Task になってから実装に入る。自由文の依頼は受理しない:

```json
{
  "type": "DesignChange",
  "nodeId": "123:456",
  "component": "app/components/control/GoalCard.tsx",
  "property": "padding",
  "before": "space.3",
  "after": "space.4",
  "tokenDelta": null,
  "screenshotRef": "evidence/DESIGN-001B/goalcard-after.png",
  "acceptance": "GoalCard padding matches space.4 at md breakpoint"
}
```

### B-4. 再現性の検証を自動化する

- **視覚回帰**: 管理画面の各ルートを Playwright でスクリーンショット固定（viewport 3種）。PR毎に前回Evidence と比較し、差分が designSpec に紐づかない場合は FIX_REQUIRED。
- **staging Figma は code から一方向生成**（マージ済みUIのスクリーンショット/コンテキストを Figma MCP で反映）。Figma がリポジトリコードを直接書くことは引き続き禁止。
- **アクセシビリティ**: DESIGN-001C で axe チェックを focusedValidation に含める。

---

## C. /goal Contract v2（凍結本文 — このまま Codex に渡す）

```text
# AI PM OS /goal Contract v2
Command: /goal <goalId>
Repository: sasaharatakc/ai-pm-os-reference

## Step 0 — Runtime preflight (mandatory, before any read)
1. Run: bin/dev-up.sh
2. It must exit 0 with the app healthy at http://127.0.0.1:3000/rpg-office (HTTP 200).
3. If not healthy within 90s, stop with RUNTIME_DOWN. Never proceed against a dead runtime.

## Execute
1. Read exactly 4 files: goal.json, task-graph.json (index), snapshots/latest.json, ledger.json.
2. Validate goalId, graph digest, snapshot size (<=1500 bytes) and schema.
3. If an active run exists in the snapshot, resume it idempotently.
4. Select next issue via tools/select-next-issue.sh (single-line output). Do not reason over the backlog.
5. Read only issues/<selectedId>.json (the card). Process one Issue only.
6. Implement within card.allowedPaths, max 8 inspected/edited files. UI issues follow card.designSpec only.
7. Delegate implementation to Codex through Execution Fabric (the only execution entrypoint).
8. Run card.focusedValidation. Run full validation once, only if card.fullValidationRequired, before commit.
9. Create a Draft PR, verify exact-head CI.
10. Use Claude Code only for runtime, approval, external-I/O, destructive or merge-gate risk.
11. Convert FIX_REQUIRED into one bounded repair Task; max 3 cycles; input = failing log tail (30 lines max).
12. On completion: append ledger entry, set index status, write snapshots/latest.json, store evidence by path.
13. Continue automatically unless a stop condition applies.

## Priority (fixed)
CONTROL-001 > WORKFORCE-001 > AGENT-001 > DESIGN-001 > RELEASE-001
Never start a lower Work while a higher Work has a runnable required Issue.

## Token limits (hard)
- Startup reads: the 4 files above. Backlog reads: 1 card.
- Never re-read completed issue cards, past snapshots, past PRs or GitHub Issues during a run.
- Evidence by path reference only; no success logs; failing logs tail-30 only.
- This contract text is frozen; variable context is appended after it, never inside it.

## Limits
- One Issue = one outcome = one Draft PR. Max 8 files. No repository-wide scan.
- No main push, force-push or automatic merge.
- Figma never writes repository code; design deltas arrive only as DesignChange tasks (fixed schema).
- Blueprint v1.0 remains frozen.

## Stop only for
Merge Approval / Production External Write Approval / exact-head mismatch /
CI failure or conflict / invalid or oversized Snapshot / RUNTIME_DOWN /
missing authority, dependency, budget or rollback / 3 failed repair cycles.

## GOAL_COMPLETE only when
all required Issues in ledger + required PRs merged + management controls pass Host E2E +
real employee execution proven + agent create/edit proven + Figma P0/P1 findings zero +
final evidence stored.

## Return only (max 40 lines total)
Current state / Problem or blocker / Next safe action / Codex implementation brief / Completion criteria
```

---

## D. /rpg-office Docker 自動起動（404 恒久対策）

404 の原因は「dev サーバが起動していない or 起動直後で route 未ビルド」。対策は
**healthcheck が `/rpg-office` 自体に 200 を返すまでを起動の定義にする**こと。ポート開放では判定しない。

### D-1. Dockerfile（ai-pm-os-reference ルート）

```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM node:20-alpine
WORKDIR /app
COPY --from=build /app ./
EXPOSE 3000
CMD ["pnpm", "start"]
```

### D-2. docker-compose.yml

```yaml
services:
  web:
    build: .
    ports:
      - "3000:3000"
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "-q", "--spider", "http://127.0.0.1:3000/rpg-office"]
      interval: 5s
      timeout: 3s
      retries: 18
      start_period: 20s

  web-dev:
    profiles: ["dev"]
    build:
      context: .
      target: build
    command: pnpm dev
    ports:
      - "3000:3000"
    volumes:
      - .:/app
      - /app/node_modules
    healthcheck:
      test: ["CMD", "wget", "-q", "--spider", "http://127.0.0.1:3000/rpg-office"]
      interval: 5s
      timeout: 3s
      retries: 18
      start_period: 30s
```

### D-3. bin/dev-up.sh（/goal Step 0 が呼ぶ唯一の起動口）

```bash
#!/usr/bin/env bash
set -euo pipefail
docker compose up -d web
for i in $(seq 1 18); do
  state=$(docker inspect -f '{{.State.Health.Status}}' "$(docker compose ps -q web)")
  [ "$state" = "healthy" ] && echo "OK: /rpg-office is up" && exit 0
  sleep 5
done
echo "RUNTIME_DOWN: /rpg-office not healthy in 90s" >&2
docker compose logs --tail 30 web >&2
exit 1
```

- Playwright E2E・スクリーンショットEvidence もすべてこのコンテナに向ける（環境の一意化）。
- ホットリロードが必要な作業のみ `docker compose --profile dev up -d web-dev` を使う。

---

## E. Codex 初回タスク: G-AIPM-001 v2 Issue Rebaseline（改訂版）

```text
Task: G-AIPM-001 v2 Issue Rebaseline
Purpose: replace the old 6-Work/15-Task structure with the 5-Work/16-Issue layered SSOT
         (index + cards + ledger + snapshot) so /goal G-AIPM-001 runs deterministically
         with minimal context.

Allowed files only (planning artifacts, no implementation code):
1. plans/goals/G-AIPM-001/goal.json
2. plans/goals/G-AIPM-001/task-graph.json            # index fields only (see spec A-1)
3. plans/goals/G-AIPM-001/issues/<issueId>.json      # 16 cards
4. plans/goals/G-AIPM-001/ledger.json                # initialized empty: []
5. plans/goals/G-AIPM-001/issue-migration.json       # dry-run table: KEEP/ABSORB/SUPERSEDE/REVIEW
6. issues/planned/G-AIPM-001.md                      # human-readable design doc
7. tools/select-next-issue.sh                        # deterministic selector (spec A-4)
8. bin/dev-up.sh + Dockerfile + docker-compose.yml   # runtime preflight (spec D)

Required Works (fixed order): CONTROL-001, WORKFORCE-001, AGENT-001, DESIGN-001, RELEASE-001
Required Issues: CONTROL-001A..D, WORKFORCE-001A..D, AGENT-001A..C, DESIGN-001A..C, RELEASE-001A..B
UI issues (CONTROL-001A..D, AGENT-001B..C, DESIGN-001A..C) must include designSpec (spec B-2).

Rules (unchanged from v1): one verifiable outcome per Issue; max 8 files; no cycles;
no duplicate outcomes; reuse merged implementation; extend /rpg-office, never rebuild;
UI controls route through Execution Fabric; agent edits validate before executable;
Figma diffs become DesignChange tasks; /goal start == resume (idempotent);
completed issues never reloaded. Do not create/update/close/relabel GitHub Issues.

Validation: JSON syntax; schema/required fields; index-field whitelist respected;
unique IDs; valid dependency refs; no cycles; priority ordering; maximumFiles<=8;
every card has visibleProof + completionCriteria; snapshot schema documented;
select-next-issue.sh returns CONTROL-001A on the fresh graph; bin/dev-up.sh reaches
healthy and GET /rpg-office returns 200; git diff --check.

Delivery: one planning-only branch, one Draft PR, no implementation code beyond the
runtime preflight files, no GitHub Issue mutation, no merge.

Return only: changed files / Work-Issue count / graph validation result /
migration classification count / dev-up health result / Draft PR / exact HEAD / remaining blocker.
```

> v1 の「maximum four changed files」は 2層SSOT 化に伴い**意図的に緩和**した（cards 16件 + preflight 3件が増えるため）。
> 代わりに「実装コード0行・planning/runtime-preflight のみ」で範囲を縛る。

---

## F. 完了条件（v2）

- Goal が 5 Work・16 Issue（index + card 構造）へ整理される
- `/goal G-AIPM-001` の起動時読取が 4ファイル + card 1件に収まる
- 次 Issue 選択が `select-next-issue.sh` で決定的に返る
- 完了 Issue は ledger 参照のみで、card を再読しない
- 全 UI Issue が designSpec を持ち、Figma差分は DesignChange スキーマ経由でのみ実装に入る
- `bin/dev-up.sh` 一発で `/rpg-office` が HTTP 200（healthcheck 定義）になる
- 既存 GitHub Issue の移行先が issue-migration.json（dry-run）で明確。実mutationは明示承認後のみ
