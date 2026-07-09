# COMMAND_POLICY — スラッシュコマンド管理ルール

> `.claude/commands/` は1本ごとに毎セッション固定トークンを消費する（先頭見出し行がスキル一覧として常時注入される）。コマンドも「多いほど強い」ではなく**負債**として管理する。運用は `AGENT_POLICY.md` と同じ思想。

## 上限・予算
| 項目 | 上限 | 現状(2026-07-09) |
|---|---|---|
| 先頭見出し行（注入されるdescription） | **80字**（`# /名前 — 説明` を1行） | 最長〜30字程度 |
| core コマンド数 | **12本** | 12本 |
| `.claude/commands/` 総数 | 60本（超過で validator が警告） | 52本 |

## 追加基準（すべて満たすこと）
1. **既存コマンドで代替できない**こと — 追加前に `docs/ai-org/COMMAND_REGISTRY.md` を検索。**似たコマンドの新規作成は禁止**。既存コマンドの body を更新して役割を広げる
2. 組み込み機能（WebSearch・/compact・組み込みスキル等）で代替できないこと
3. 月1回以上使う見込みがあること
4. 見出し行は `# /名前 — 一言説明` の1行のみ（手順・詳細は body へ。bodyは実行時のみ読込）
5. 同じPRで COMMAND_REGISTRY.md に行を追加 — **Registry未登録の追加は validator が警告**

## 削除・統合・退避基準
- 3ヶ月使われていない / 他コマンド・組み込み機能と80%重複 / 責任範囲を一文で説明できない → **archive-candidate**
- 退避 = `git mv .claude/commands/X.md docs/ai-org/commands/archive/X.md` + Registry の tier 変更（定義は消さない・復帰可能）
- 完全削除は人間の承認後のみ。統合時は吸収先コマンドの body に役割を追記する
- **現役コマンドの body・router・手動の一覧表から archive-candidate を参照しない**（validator が警告）

## Agent との責任分界
| 使い分け | 選ぶもの |
|---|---|
| 繰り返しの**手順**（フロー・チェックリスト） | コマンド（`.claude/commands/`） |
| 独立した**調査・監査・並列レビュー**（別コンテキストで実行） | エージェント（`.claude/agents/`、台帳: AGENT_REGISTRY.md） |
| 1回きりの作業 | どちらも作らない（その場のプロンプトで実行） |

## 読み込み順（必要最小限）
1. `CLAUDE.md` / `AGENTS.md` — 自動読込（これ以上増やさない）
2. `docs/CODEBASE_MAP.md` — コードに触る前に必ず
3. `docs/ai-org/AGENT_REGISTRY.md` — **エージェント起動・再設計時だけ**
4. `docs/ai-org/COMMAND_REGISTRY.md` — **コマンド追加・整理・再設計時だけ**（通常の実行は自動認識されるため参照不要）
5. `docs/ai-org/ORGANIZATION.md` — 組織全体の再設計時だけ

## 検証
```bash
python3 tools/ai/validate-command-registry.py   # 単独実行
bash tools/validate_all.sh                       # agent + command まとめて（--strict）
```
