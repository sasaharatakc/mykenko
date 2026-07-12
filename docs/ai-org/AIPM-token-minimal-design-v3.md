# AI PM OS — トークン最小運用設計 v3（+ GPT Deep Research 依頼文）

対象リポジトリ: `sasaharatakc/ai-pm-os-reference`

---

## 0. ゴール（1行）

> **どのAIも「生成された1ページの状態表 + 自分宛の1枚のファイル」だけを読めば、次の一手を間違えずに実行できる。**

### なぜトークンが減るのか（Before / After）

| | Before（現状） | After（v3） |
|---|---|---|
| 状態把握 | 各AIが毎回 PR一覧・Issue・過去文書を読み直して再計画（数千〜数万tokens × AI数 × 回数） | スクリプトが `STATE.md`（2KB ≈ 600 tokens）を生成。**LLMは読むだけ** |
| AI間の受け渡し | 散文で同じ背景説明を毎回コピペ | 固定スキーマのファイル1枚のみ。背景説明ゼロ |
| 次タスク選択 | LLMがバックログ全体を読んで判断 | スクリプトが1行で返す（0 tokens） |
| Baseline調査 | Codexに毎回・都度依頼 | `build-state.sh` 実行のみ。**何度でも0 tokens で再生成** |

原則は3つだけ:

1. **状態はLLMに再構築させない** — git/GitHubの事実からスクリプトが `STATE.md` を生成する
2. **AI間の受け渡しは散文禁止** — 固定スキーマ・サイズ上限つきのファイルのみ
3. **判断だけをAIに残す** — 選択・検証・集計はスクリプト。AIは「外部調査・高リスク監査・仕様確定・実装」だけ

---

## 1. 全体イメージ（毎回起きることの絵）

```text
                     ┌─────────────────────────────────────┐
   GitHub の事実      │  tools/build-state.sh（LLM不使用）    │
   PR / Issue / CI ──▶│  git + gh api → 集計・整形            │──▶ state/STATE.md
   ledger / themes   └─────────────────────────────────────┘     （1ページ・2KB上限）
                                                                        │
                been read by ALL AIs — これ以外の「現状説明」は存在しない    │
              ┌──────────────┬──────────────┬──────────────┬────────────┤
              ▼              ▼              ▼              ▼            ▼
        Deep Research   Claude Code       Work          Cowork       人間
        （外部知識）     （高リスク監査）  （仕様確定）    （計画整理）  （Merge承認）
              │              │              │              │
              ▼              ▼              ▼              ▼
        research/       audit/          brief/         index/ledger
        <topic>.md      <area>.md       <issueId>.md   更新のみ
        ≤400行          ≤100行          ≤150行
                                          │
                                          ▼
                                   Codex（実装専任）
                                   入力 = brief 1枚のみ
                                   出力 = Draft PR + ledger 1行
```

**1 run の総読取量**: STATE.md（600 tokens）+ 自分宛ファイル1枚（300〜1,500 tokens）。以上。
PR本文・過去Issue・過去会話・完了済み成果物は、どのAIも読まない。

---

## 2. 各AIの入出力契約（責任固定の実体）

「責任の固定」は表で宣言するだけでは守られない。**入力と出力をファイルで物理的に固定**する。

| 担当 | 読む（これ以外禁止） | 書く（これ以外禁止） | 上限 |
|---|---|---|---|
| `build-state.sh` | git / gh api / ledger | `state/STATE.md` | 2KB |
| Deep Research | STATE.md + 質問1件 | `research/<topic>.md` | 400行 |
| Claude Code | STATE.md + 対象パスのコード | `audit/<area>.md`（P0〜P2所見のみ） | 100行 |
| Work（GPT） | STATE.md + research + audit | `brief/<issueId>.md`（Codex Brief） | 150行 |
| Cowork | STATE.md | index / ledger の整理 | — |
| Codex | brief 1枚 + brief記載の allowedPaths | Draft PR + ledger 1行 | 8ファイル |
| 人間 | STATE.md + PR | Ready化 / Merge / 削除 / 外部書込み承認 | — |

- 上流の成果物は**次の1工程だけ**が読む。research を Codex が読むことはない（Work が brief に必要分だけ転記する）。
- どの成果物も「背景」「経緯」セクション禁止。背景は STATE.md にしかない。

---

## 3. STATE.md — 唯一の進捗情報源（生成物・手書き禁止）

```markdown
# AI PM OS STATE — generated 2026-07-12T09:12Z by build-state.sh
base: main @ abc1234 / local=origin 一致 / worktree clean

## Open PRs (3)
| # | draft | CI | mergeable | 目的(1行) | 判断 |
|647| yes | pass | CLEAN | Control Center shell | rebase後Ready候補 |
|578| yes | fail | DIRTY | 旧Registry実装 | 廃止候補(#647と重複) |

## Themes
MVP-v1: done / MVP-v2: 4/6 / Hardening: 2/5
VIBE: stopped (#548がmainと乖離) / AI-Workforce: blocked (full validation失敗)

## Next runnable (select-next-issue.sh)
CONTROL-001A (deps: none)

## Blockers / Claude Code 監査候補 (≤3)
1. Execution Fabric の権限境界
2. ...
```

### build-state.sh の仕様

- 入力: `git fetch origin --prune` → `git status` / `gh pr list --json number,title,isDraft,headRefOid,mergeable,mergeStateStatus,statusCheckRollup` / `gh issue list`（open のみ・ページ5〜10件）/ `ledger.json` / theme ラベル集計
- 「目的(1行)」「判断」列だけは `state/pr-notes.json` から結合（人間/Workが**初回に1度だけ**記入し、以後は差分メンテ）
- 2KB 超過で exit 1（肥大化を機械的に禁止）
- read-only。mutation は一切しない

> ユーザー案の「Current State Baseline を1回だけ作る」は、これで**「何度でも0トークンで作れる」**に置き換わる。Codexへの調査依頼（fetch確認・PR整理・重複特定）は、そのままこのスクリプトの仕様になる — 1回スクリプト化すれば、以後の Baseline 調査トークンは恒久的にゼロ。

---

## 4. 標準フローへのマッピング

```text
① GitHub取得・現状確認   = build-state.sh 実行（人間 or Codexが1コマンド）
② Deep Research          = STATE.md + 質問1件 → research/<topic>.md
③ Claude Code 設計監査    = STATE.md の監査候補のみ → audit/<area>.md
④ Work 仕様確定           = STATE + research + audit → brief/<issueId>.md
⑤ Cowork 計画整理         = STATE.md → index/ledger 更新
⑥ Codex 実装             = brief 1枚 → Draft PR（1PR1目的・≤8ファイル）
⑦ Claude Code 最終監査    = 高リスクPRのみ（audit更新）
⑧ 人間                   = Ready化・Merge → merge後 build-state.sh 再実行で状態更新完了
```

「今どこまで完成しているか」= STATE.md の Themes 行。「次に何を実装すべきか」= Next runnable 行。**この2行に即答できない状態を設計上なくす。**

---

## 5. 最初の一手（実装を増やさない）

新機能ではなく、Codex に read-only で1回だけ実行させる:

```text
Task: build-state.sh v0 の作成と初回 STATE.md 生成
Repository: sasaharatakc/ai-pm-os-reference / Base: main
Constraints: TOKEN BUDGET MODE / 全体走査禁止 / ≤8ファイル /
  既存コード編集禁止 / Issue・PR・Project mutation禁止 / external write禁止 /
  成功ログ全文禁止 / 推測禁止（GitHub上の事実のみ）

手順:
1. git fetch origin --prune → HEAD/origin一致・worktree clean を確認（不一致なら変更せず報告して停止）
2. tools/build-state.sh を新規作成（§3仕様: gh pr list --json / gh issue list / ledger集計 / 2KB超でexit 1 / read-only）
3. state/pr-notes.json の空雛形を生成（PR番号 + 目的:"" + 判断:""）
4. 実行して state/STATE.md を初回生成
5. STATE.md から: 重複PR・stale branch・main乖離候補 / 次に進める1件 / Claude Code監査候補≤3件 を報告

Delivery: 1 branch / 1 Draft PR（新規ファイル3つのみ: build-state.sh, STATE.md, pr-notes.json）
Return: STATE.md全文（2KB以内なので貼付可）/ 推奨する次の1件 / 監査候補 / exact HEAD
```

PR #647 / #578 / #548 / AI Workforce validation / VIBE 再開のどれを先に進めるかは、**この初回 STATE.md を見てから1件だけ**選ぶ（ユーザー案と同じ判断順序。判断材料の作り方だけをスクリプトに変えた）。

---

## 6. GPT Deep Research 依頼文（このままコピペ可）

```text
# 調査依頼: トークン最小・多エージェント開発パイプライン設計の検証と改善

## 背景（前提としてそのまま受け入れる）
1人のオーナーが GitHub 上の1リポジトリを、役割固定した複数AIで開発している。
GitHub=事実 / Deep Research=外部知識 / Claude Code=高リスク監査のみ /
Work(GPT)=仕様確定とCodex Brief作成 / Cowork=計画・Issue・依存整理 /
Codex=実装(1PR1目的・最大8ファイル・Draft PRまで) / 人間=Ready化・Merge・外部書込み承認。
問題: 各AIに同じ状況説明を毎回渡し、各AIが独自に計画を作り直すため、
トークンが浪費され「今どこまで完成し、次に何を作るべきか」が見えない。

## 検証してほしい設計案（仮説）
1. 状態はLLMに再構築させない。スクリプトが git / GitHub API の事実から
   STATE.md（1ページ・2KB上限・生成物）を作り、全AIの唯一の入力にする。
2. AI間の受け渡しは散文禁止。固定スキーマ・行数上限つきの成果物ファイル
   （research/audit/brief）のみ。上流成果物は次の1工程だけが読む。
3. 次タスク選択・検証・進捗集計は決定的スクリプト。
   LLMには外部調査・高リスク監査・仕様確定・実装だけを残す。

## 調査項目
1. 状態外部化の実例: 生成された状態ファイルを単一入力とするエージェント
   パイプラインの公開事例・OSS（LangGraph checkpointer、AutoGen/CrewAIの
   state管理、Claude Codeのmemory/compaction、GitHub Agentic Workflows、
   Devin/Sweep等の公開設計情報）
2. コンテキストエンジニアリングの一次情報: Anthropic/OpenAI公式ガイドに
   おける compaction・structured note-taking・sub-agent handoff schema
3. 多エージェント役割分担の失敗パターン: 責任重複・状態分散・計画の
   再発明が起きる典型例と、実務での回避策
4. 「1ページ状態表」の最適スキーマ: 何を含め何を捨てるか、サイズ上限の
   根拠、鮮度保証（生成タイムスタンプ/ダイジェスト）の実例
5. パイプライン全体のトークン消費を定点観測する実務的な測定方法
6. この設計の弱点と対策: 状態生成スクリプト自体のバグ（single point of
   failure）、人間が書く「PR目的1行メモ」の陳腐化、生成物スキーマの硬直化

## 制約
- 英語圏の一次情報（公式ドキュメント・エンジニアリングブログ・OSS実装）を優先
- 事例は5件以上、比較表つき
- 推測と事実を区別し、出典を明記

## 出力形式
1ページ要約 → 事例比較表 → この設計案への提言（keep / change / add 各3件以内）→ 出典リスト
```

---

## 7. 完了条件

- 全AIの起動時入力が「STATE.md + 自分宛ファイル1枚」に収まる
- 「今どこまで / 次に何を」が STATE.md の2行で即答できる
- Baseline 調査が `build-state.sh` 1コマンドで何度でも再生成できる（LLM調査ゼロ化）
- 各工程の成果物が固定スキーマ・上限つきで、背景説明の重複が消える
- Deep Research の keep/change/add 提言を受けてから、この設計を確定する
- CI成功・HEAD一致・MERGEABLE/CLEAN 確認後も、Merge 前に必ず停止（人間承認）
