# Claude Code への同期ガイド

## 同期フロー

```
GitHub (正本)
  ↓
scripts/copy-to-claude-code.sh
  ↓
/home/user/mykenko/.claude/agents/    ← プロジェクトAgent
/home/user/mykenko/.claude/skills/    ← プロジェクトSkill
/home/user/mykenko/.claude/commands/  ← スラッシュコマンド
```

## 同期手順

### 1. バリデーション

```bash
cd mykenko-agent-registry
python3 scripts/validate-registry.py
```

エラーがあれば修正してから進む。

### 2. 特定Agentのみ同期

```bash
bash scripts/copy-to-claude-code.sh mykenko-yakuki-reviewer
```

### 3. 全Agentを同期（approved以上）

```bash
bash scripts/copy-to-claude-code.sh
```

ドライランで確認してから実行する：

```bash
bash scripts/copy-to-claude-code.sh --dry-run
bash scripts/copy-to-claude-code.sh  # 問題なければ本実行
```

### 4. 動作確認

Claude Codeで対象Agentを実行して動作を確認する。

```
# Claude Codeのチャットで
@mykenko-yakuki-reviewer この商品説明文をチェックしてください：...
```

## バックアップとロールバック

同期スクリプトは既存ファイルを `tmp/backups/{timestamp}/` にバックアップします。
問題が発生した場合：

```bash
# バックアップを確認
ls tmp/backups/

# 元に戻す
cp tmp/backups/20260531_120000/mykenko-yakuki-reviewer.md.bak \
   /home/user/mykenko/.claude/agents/mykenko-yakuki-reviewer.md
```

## 注意事項

- `status: draft` のAgentは自動的にスキップされます
- `agents/deprecated/` 配下のファイルはコピーされません
- 既存ファイルはバックアップを取ってから上書きされます
