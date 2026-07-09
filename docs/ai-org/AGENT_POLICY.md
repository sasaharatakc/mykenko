# AGENT_POLICY — エージェント管理ルール

> `.claude/agents/` は1体ごとに毎セッション固定トークンを消費する（frontmatter の name/description/tools が常時注入される）。エージェントは「多いほど強い」ではなく**負債**として管理する。

## 上限・予算
| 項目 | 上限 | 現状(2026-07-09) |
|---|---|---|
| description 文字数 | **240字**（推奨1〜2文・80字以内） | 最長95字 |
| core エージェント数 | **15体** | 14体 |
| `.claude/agents/` 総数 | 120体（超過で validator が警告） | 106体 |

## 追加基準（すべて満たすこと）
1. **既存エージェントで代替できない**こと — 追加前に `docs/ai-org/AGENT_REGISTRY.md` を検索。**似たエージェントがある場合は新規作成禁止**。既存の定義（body側）を更新して役割を広げる
2. 月1回以上使う見込みがあること（なければ作らず、その場のプロンプトで済ませる）
3. description は「いつ起動するか」だけを1〜2文で書く（手順・ルールは body へ。bodyは起動時のみ読み込まれるため長くてもセッション固定費にならない）
4. 同じPRで AGENT_REGISTRY.md に行を追加（tier / domain / 備考）— **Registry未登録の追加は validator が警告**

## 削除・統合・アーカイブ基準
- 3ヶ月使われていない / 責務が他エージェントと80%重複 / 責任範囲を一文で説明できない → **archive-candidate**
- アーカイブ = `git mv .claude/agents/X.md docs/ai-org/agents/archive/X.md` + Registry の tier 変更（定義は消さない・復帰可能）
- 完全削除は人間の承認後のみ。統合時は吸収先エージェントの body に役割を追記する
- **router や手動ルーティング表（Crew表・エージェント一覧を持つ body）は Registry 上の現役（core/optional）エージェントのみ参照する。** アーカイブ時は参照元を現役エージェントに置き換える（validator が退避済み参照を警告する）

## 責任分界
| 対象 | 置き場所 |
|---|---|
| エージェントの起動条件 | `.claude/agents/*.md` の description（注入される・最小に） |
| エージェントの手順・ルール | `.claude/agents/*.md` の body（起動時のみ読込） |
| 台帳・tier・統合判断 | `docs/ai-org/AGENT_REGISTRY.md`（SSOT） |
| タスクの発生・追跡 | GitHub Issue（Issueがなければ作業しない） |
| 変更の適用 | PR（draft→CI→Review→Merge、mainへ直接pushしない） |
| 組織全体像・Crew編成 | `docs/ai-org/ORGANIZATION.md`（参照用・必要時のみ読む） |

## セッション開始時の読み込み順（必要最小限）
1. `CLAUDE.md` / `AGENTS.md` — 自動読込（これ以上増やさない）
2. `docs/CODEBASE_MAP.md` — コードに触る前に必ず
3. `docs/ai-org/AGENT_REGISTRY.md` — **サブエージェントを起動する時だけ**。coreから選び、optionalは必要時のみ
4. `docs/ai-org/ORGANIZATION.md` — 組織全体の再設計時だけ

## 検証
```bash
python3 tools/ai/validate-agent-registry.py   # 単独実行
bash tools/validate_all.sh                     # まとめて実行
```
CI追加は任意（現状はWARNING中心・exit 0。`--strict` で警告をエラー化）。
