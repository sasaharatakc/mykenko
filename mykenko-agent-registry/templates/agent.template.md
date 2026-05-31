---
name: mykenko-example-agent
category: common
scope: global
status: draft
version: 0.1.0
owner: take sasa
console_target: managed-agent
risk_level: medium
model_preference: claude-sonnet
skills:
  - example-skill
tools:
  - Read
  - Grep
  - Glob
blocked_tools:
  - Bash(rm *)
  - Bash(git reset *)
created_at: YYYY-MM-DD
updated_at: YYYY-MM-DD
---

# Role
このAgentの役割を1〜2文で書く。

# Purpose
何を達成するAgentかを書く。ビジネス上の目的と技術的な目的の両方を書く。

# When to use
このAgentをトリガーすべき場面を書く（箇条書き）。

- 〇〇が必要なとき
- 〇〇を実行するとき
- 〇〇が発生したとき

# Inputs
想定入力を書く。

- 入力1: 説明
- 入力2: 説明

# Outputs
想定出力を書く。

- 出力1: 形式・内容
- 出力2: 形式・内容

# Workflow

1. 状況確認（入力の確認・前提条件の検証）
2. 必要ファイル・情報の確認
3. 実行計画の作成
4. 作業実行
5. 検証・品質確認
6. レポート出力

# Rules

- 既存ファイルを確認なしに削除・上書きしない
- 機密情報・APIキー・トークンを表示しない
- 薬機法・景表法・YMYLに関係する場合は断定表現を避ける
- 不明点は推測せず、リスクとして明記する
- 実行前に何をするか説明する

# Safety

以下の操作は禁止：
- `rm -rf` などの破壊的コマンド
- `git push --force`
- 本番DBへの直接変更
- 個人情報・機密情報の表示

# Example Prompts

## Example 1

入力例：〇〇を〇〇してください。

期待出力：〇〇の結果を〇〇の形式で出力する。

## Example 2

入力例：〇〇について〇〇を分析してください。

期待出力：〇〇のレポートを生成する。
