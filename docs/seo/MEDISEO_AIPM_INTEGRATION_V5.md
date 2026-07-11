# MediSEO × AIPM 統合設計 v5.0 — スナップショット指向・実行可能契約・縦串先行

> v4.0（MediSEO を AIPM の SEO ドメインパックとして吸収する方針）を前提に、
> アーキテクチャの弱点 4 点を解消した改訂版。関連 Issue: #58
>
> **v4.0 から変わらないもの**: 独自ログイン・カンバン・承認画面・タスク管理・実行基盤・
> Evidence 管理・Timeline・自動 PR を新規開発しない方針。plan-only Connector と
> Runtime Capability の外部 IO 境界。MVP から LangGraph / Qdrant / Meilisearch /
> Langfuse / 自動公開 / 無人運転を外す判断。これらはすべて正しいので維持する。

---

## 0. v4.0 の弱点と v5.0 の解決策（サマリー）

| # | v4.0 の弱点 | v5.0 の解決策 |
|---|------------|--------------|
| 1 | クロールと監査が 1 本のパイプラインに密結合（MEDISEO-003→004）。新しい検出器を足すたびに再クロールが必要で、結果の再現ができない | **Fetch / Analyze の分離**。クロールは不変の `PageSnapshot` Artifact を作るだけ。監査・法務検査・提案生成はすべて Snapshot に対する**純粋関数**にする（§2） |
| 2 | E2E（MEDISEO-008）が最後。統合リスクが最終工程に積み上がり、001〜007 が個別に「完成」しても繋がらないリスクが残る | **ウォーキングスケルトン先行**。2 番目の Goal で「フィクスチャ 1 ページ → 検出器 1 種 → Evidence → Run Detail 表示」の縦串を通し、以降は常にグリーンのまま横に広げる（§4） |
| 3 | MEDISEO-001 の「契約」が文書止まり。後続 Goal が契約に準拠しているかは人間のレビュー頼み | **実行可能な契約パッケージ**。JSON Schema + ゴールデンフィクスチャ + validator CLI を成果物とし、CI が全 Goal の入出力を機械検証する（§3） |
| 4 | Policy-as-Code（MEDISEO-005）が SEO 監査と別ステージ。検出結果の型・Evidence 化・UI 表示を二重に作ることになる | **単一ルールエンジン + ルールファミリー**。SEO 検出器も薬機法検査も同型の「Snapshot → Finding[]」。ルール本体は YAML データとしてコンプライアンス側が保守（§5） |

このほか、v4.0 で未定義だった **クロールの副作用分類（externallyObservable）**、
**予算ガード**、**失敗の一級市民化**、**受入条件の実行可能化** を追加する（§6–§8）。

---

## 1. アーキテクチャ全体像（v5.0）

```text
Goal Registry
→ Next Work Selector
→ MediSEO Connector（plan-only・外部IOなし・v4.0 と同じ）
→ ExecutionRequest（+ budget / externallyObservable を宣言）
→ Runtime Guard（robots・rate・予算・承認を強制）
→ Execution Fabric
   ├─ [不純] Snapshot Capability（Crawl4AI: fetch のみ）──→ PageSnapshot Artifact
   └─ [純粋] Analyze Capability（ルールエンジン + ブリーフ生成）
              入力: PageSnapshot（Evidence Store から読む。ネットワーク禁止）
              出力: Finding[] / Recommendation[]
→ Evidence Store（Snapshot / Finding / Recommendation / RunManifest + SHA-256）
→ Run Detail / Timeline / SEO 読み取り専用プロジェクション
→（承認後のみ）mutationIntent=true の Draft PR 等 — MVP 対象外
```

v4.0 との構造的差分は 1 点だけ: **Capability を「不純な fetch」と「純粋な analyze」に
割る**こと。これにより:

- **再現性**: 同じ Snapshot 集合 + 同じルールセット版 → 必ず同じ Finding。監査結果が再実行で揺れない
- **追加コストの逓減**: 検出器を 5 種 → 20 種に増やしても再クロール不要。過去の Snapshot に新ルールを適用できる
- **リグレッション検知が無料**: 同一 URL の Snapshot 間 diff = サイト変化の検知。SerpBear 的な変化監視の土台が副産物として手に入る
- **テストがネットワーク不要**: フィクスチャ Snapshot に対して全監査ロジックを CI で回せる（§8 の replay 受入の前提）

---

## 2. コア契約: 5 つのオブジェクト

契約は「Goal ごとの定義」ではなく **単一のスキーマパッケージ**（1 ディレクトリ）に集約する。
後続のすべての Goal はこのパッケージだけを参照する（SSOT）。

### 2.1 Site
```jsonc
{
  "siteId": "medicine-shop",
  "origin": "https://medicine.shop",
  "crawlPolicy": {
    "maxUrls": 100,
    "maxBytesPerPage": 2000000,
    "requestIntervalMs": 1000,
    "respectRobotsTxt": true,
    "includePatterns": ["/products/", "/articles/"],
    "excludePatterns": ["/cart", "/account"]
  }
}
```

### 2.2 PageSnapshot（v5.0 の新設・最重要）
不変。1 URL 1 取得 = 1 Snapshot。以降の全処理の唯一の入力。
```jsonc
{
  "snapshotId": "snap_...",           // = sha256(url + fetchedAt + bodyHash)
  "siteId": "medicine-shop",
  "url": "https://medicine.shop/products/x",
  "fetchedAt": "2026-07-11T00:00:00Z",
  "httpStatus": 200,
  "headers": { "content-type": "text/html; charset=utf-8" },
  "bodyHash": "sha256:...",           // 原文 HTML の Artifact 参照
  "extract": {                         // 正規化済み抽出（Crawl4AI 出力）
    "title": "...", "metaDescription": "...",
    "headings": [{ "level": 1, "text": "..." }],
    "canonical": "...", "jsonLd": [ ... ],
    "internalLinks": [ ... ], "images": [ ... ],
    "mainText": "..."
  },
  "fetchError": null                   // 失敗も Snapshot として記録（§7）
}
```

### 2.3 Finding（v4.0 の「Issue」を改名・統一）
SEO 問題も YMYL/薬機法/景表法違反も**同一スキーマ**。AIPM の共通 Issue へは
このオブジェクトからマッピングする。
```jsonc
{
  "findingId": "find_...",
  "ruleId": "seo.title.missing",       // ルールファミリー.カテゴリ.名前
  "rulesetVersion": "1.2.0",           // どの版のルールが出したか（監査可能性）
  "snapshotId": "snap_...",            // どの取得結果に対する指摘か
  "severity": "high",                  // info | low | medium | high | blocker
  "category": "seo",                   // seo | ymyl | yakki | keihyo | tech
  "message": "title タグがありません",
  "evidence": {                        // 根拠ポインタ（必須）
    "selector": "head > title",
    "textSpan": null,                  // 本文指摘なら { start, end, quoted }
    "artifactRef": "sha256:..."
  },
  "confidence": 1.0,                   // 決定的ルール=1.0、LLM 補助ルール<1.0
  "detectionMethod": "deterministic"   // deterministic | llm-assisted
}
```

### 2.4 Recommendation
**evidence-pointer のない提案をスキーマレベルで禁止**する。これが YMYL サイトでの
ハルシネーション対策の本丸。
```jsonc
{
  "recommendationId": "rec_...",
  "snapshotId": "snap_...",
  "basedOnFindings": ["find_..."],     // minItems: 1（根拠なし提案は invalid）
  "kind": "title",                     // title | h1 | meta | headings | faq | internal-link
  "current": "...",
  "proposed": "...",
  "rationale": "...",
  "citations": [                       // 提案文中の事実主張ごとの根拠
    { "claim": "...", "snapshotId": "snap_...", "textSpan": { ... } }
  ],
  "policyCheck": {                     // 提案自身も Policy ルールを通した結果
    "rulesetVersion": "1.2.0",
    "findings": []                     // 空 = クリーン。違反があれば提案は draft 止まり
  }
}
```

### 2.5 RunManifest
1 回の実行の再現に必要な全パラメータ。冪等キーの材料。
```jsonc
{
  "runId": "run_...",
  "goalId": "GOAL-MEDISEO-AUDIT",
  "idempotencyKey": "sha256(goalId + rulesetVersion + snapshotSetHash)",
  "rulesetVersion": "1.2.0",
  "snapshotSet": ["snap_...", "..."],
  "budget": { "maxUrls": 100, "maxLlmTokens": 200000, "maxDurationSec": 900 },
  "mutationIntent": false,
  "externallyObservable": true         // クロールを含む run は true（§6）
}
```

**冪等性のルール**: `idempotencyKey` が一致する run は Evidence を再利用して
即時完了する。「もう一度実行したら違う結果」を仕組みで排除する。

---

## 3. 契約を「実行可能」にする

MEDISEO-001 の成果物は文書ではなく **契約パッケージ**:

```text
packages/mediseo-contract/
├── schemas/            # 上記 5 オブジェクトの JSON Schema（draft 2020-12）
├── fixtures/           # ゴールデンフィクスチャ
│   ├── snapshots/      #   正常ページ・title欠落・薬機法NG文言・robots拒否 各1枚
│   ├── findings/
│   └── recommendations/
├── src/validate.ts     # validator CLI: mediseo-validate <file>
└── CHANGELOG.md        # 契約は semver。破壊的変更は major
```

- 後続の全 Goal は CI で `mediseo-validate` を通す。**契約違反の成果物はマージ不能**
- フィクスチャは「仕様の実例」であり、GPT/Claude どちらに実装させても
  「このフィクスチャを入力したらこの出力」という合意点になる（LLM 間の設計ブレ防止）
- Goal Registry 制約（≤8 パス・≤8 ファイル）には schemas を 1 ファイル 1 スキーマに
  分割せず `mediseo.schema.json` に `$defs` でまとめることで適合させる

---

## 4. 開発順 v5.0 — 縦串先行（最大の変更点）

v4.0 の 001→008 直列は「全部品が揃ってから初めて繋ぐ」ウォーターフォール。
v5.0 は **2 番目に E2E の骨組みを通し、以降の Goal はその骨組みを太らせるだけ**にする。

| 順 | Goal ID | 内容 | 依存 | risk | 外部IO |
|----|---------|------|------|------|--------|
| 1 | `GOAL-MEDISEO-CONTRACT` | 契約パッケージ（§3）。schemas + fixtures + validator | なし | low | なし |
| 2 | `GOAL-MEDISEO-SKELETON` | **ウォーキングスケルトン**: plan-only Connector + stub Analyze Capability。フィクスチャ Snapshot 1 枚 → `seo.title.missing` 1 検出 → Evidence 保存 → Run Detail/Timeline に表示 | 1 | low | なし |
| 3 | `GOAL-MEDISEO-SNAPSHOT` | Crawl4AI Snapshot Capability。fetch のみ・robots/rate/予算強制・最大 100URL・失敗も Snapshot 化 | 1,2 | medium | 読み取りのみ |
| 4 | `GOAL-MEDISEO-RULES` | ルールエンジン + 決定的 SEO 検出器 8 種（title/H1/meta/canonical/見出し階層/内部リンク切れ/JSON-LD 欠落/noindex 事故） | 2 | low | なし |
| 5 | `GOAL-MEDISEO-POLICY` | YMYL・薬機法・景表法ルールパック（YAML データ）。**エンジンは 4 と同一**。`docs/compliance` の既存基準をルール化 | 4 | medium | なし |
| 6 | `GOAL-MEDISEO-BRIEF` | 改善ブリーフ生成（title・H1・meta・H2/H3・FAQ・内部リンク案）。evidence-pointer 必須 + 生成物自身に 5 の Policy ルールを適用 | 4,5 | medium | LLM のみ |
| 7 | `GOAL-MEDISEO-UI` | SEO 読み取り専用プロジェクション。新規画面ではなく Evidence Store 上のビュー（サイト別 Finding 集計・severity 分布・Snapshot diff） | 2 | low | なし |
| 8 | `GOAL-MEDISEO-ACCEPT` | 検出器 15+ 種到達 + **replay 受入スイート**（§8）CI green + medicine.shop 実 100URL run 完走 | 全部 | medium | 読み取りのみ |

- Goal 2 完了時点で「AIPM の画面で MediSEO の結果が見える」状態になる。
  以降の 3〜7 は**どの順で失敗しても縦串は生きている**
- 3（クロール）と 4（ルール）は依存がないため**並行開発可能**。
  v4.0 の直列 8 段より実時間で短い
- 各 Goal は Goal Registry 制約（最大 8 パス・最大 8 ファイル・low/medium risk・
  Draft PR 限定）に適合。mutationIntent=true の Goal は MVP に存在しない

---

## 5. Policy-as-Code の統合設計

```text
rules/
├── seo/            # ruleId: seo.*        deterministic 中心
├── yakki/          # ruleId: yakki.*      薬機法（例: 効能断定表現の辞書 + 文脈判定）
├── keihyo/         # ruleId: keihyo.*     景表法（No.1・最安値・打消し表示）
└── ymyl/           # ruleId: ymyl.*       E-E-A-T・出典・監修表記
```

- **ルール = データ（YAML）、エンジン = コード**。文言辞書の追加・severity 変更は
  コンプライアンス担当がコードを書かずに PR できる
- **決定的ルールと LLM 補助ルールを分離**:
  - ブロッキング判定（`severity: blocker`）を出せるのは deterministic のみ
  - LLM 補助ルール（文脈依存の薬機法判定など）は `confidence < 1.0` +
    evidence の `textSpan` 引用必須。最終判断は人間の承認ゲート
- ルールセットは **semver でバージョニング**し、全 Finding が
  `rulesetVersion` を持つ。「いつの基準で検査したか」が常に監査可能

---

## 6. Runtime Guard の拡張: 副作用の 3 分類

v4.0 は `mutationIntent` の true/false 二値だが、クロールは
「変更はしないが対象サイトに負荷を与える = 外部から観測可能」であり、純粋な読み取りと同格に扱うのは危険。

| 分類 | 例 | Guard の扱い |
|------|----|-------------|
| pure read | Evidence Store の読み取り、フィクスチャ解析 | 無条件 |
| **externallyObservable** | 実サイトへのクロール | robots.txt・rate limit・`crawlPolicy` の URL/バイト上限・時間帯制約を強制。予算超過で run を安全に打ち切り部分結果を Evidence 化 |
| mutation | Draft PR・CMS 下書き | 既存 Approval Gate（v4.0 と同じ・MVP 対象外） |

**予算ガード**は ExecutionRequest の `budget`（§2.5）を Guard が強制する。
LLM トークン上限を含めることで、ブリーフ生成の暴走コストも同じ仕組みで止まる。

---

## 7. 失敗の一級市民化

- robots 拒否・404・タイムアウト・パース失敗は**すべて `fetchError` 付き Snapshot**
  として Evidence に残す（silent skip 禁止）
- 部分失敗した run は「失敗」ではなく「N/100 URL 完了 + 失敗一覧」という
  **部分成功の RunManifest** で完了する
- 4xx/5xx の多発・robots 全面拒否は、それ自体を `tech.crawl.*` の Finding として
  検出する（クロール可能性の問題は SEO 問題そのものであるため）

---

## 8. 受入条件は「JSON 文書」ではなく「replay で走る CI テスト」

v4.0 の「MVP 受入条件 JSON」を、**フィクスチャ Snapshot に対してネットワークなしで
E2E を実行する replay スイート**に置き換える。

```text
受入 = 以下がすべて CI で green:
1. mediseo-validate が全フィクスチャを pass
2. replay run: フィクスチャ 10 Snapshot → Finding 15+ 種 → Recommendation 生成
   → 全成果物がスキーマ valid → Evidence 保存 → 冪等キー再実行で Evidence 再利用
3. Policy: 薬機法 NG フィクスチャに blocker Finding が出る／
   クリーンなフィクスチャに false positive が出ない
4. Recommendation: basedOnFindings 空の提案が reject される
5. Guard: 予算超過フィクスチャで run が部分成功として打ち切られる
```

これに加えて 1 回だけ、medicine.shop への**実クロール 100URL run の完走**を
人間が Run Detail で確認して MVP 完了とする。以降のリグレッションは
すべて replay スイートが守る。

---

## 9. 却下した代替案と再導入基準

| 候補 | 却下理由（v4.0 と同意） | 再導入の基準（v5.0 で明文化） |
|------|------------------------|------------------------------|
| LangGraph | 単一 Connector の plan() で表現可能 | plan() で表現できない多段分岐フローが 3 件以上定常化した時 |
| Qdrant | MVP に意味検索は不要 | Snapshot 横断の類似コンテンツ検出（カニバリ検知）を要件化した時 |
| Meilisearch | Finding 件数が少なく全件表示で足りる | Finding が 1 万件を超え UI 検索が要件化した時 |
| Langfuse | Evidence Store + RunManifest で追跡可能 | LLM 補助ルールの精度チューニングを定常運用に載せた時 |
| SerpBear フォーク | 順位追跡は監査と別ドメイン | Snapshot diff 基盤（§1）の上に順位データソースを足す形で検討 |
| 自動 CMS 公開 / 自動 merge | YMYL サイトで無人変更は法的リスク | 恒久的に人間承認を維持（再導入しない） |

---

## 10. 最初の実装対象

v4.0 と同じく **`GOAL-MEDISEO-CONTRACT`（契約パッケージ）から開始**する。
ただし成果物が「文書」から「schemas + fixtures + validator」に変わっているため、
完了の定義は「`mediseo-validate fixtures/**` が green」という機械判定になる。

次の `GOAL-MEDISEO-SKELETON` が完了した時点で、AIPM の Run Detail に
MediSEO の Finding が 1 件表示される。**そこから先は毎 Goal がデモ可能**。
