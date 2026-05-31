#!/bin/bash
# copy-to-claude-code.sh
# mykenko-agent-registryのAgent/SkillをClaude Codeの.claude/配下にコピーする
# 既存ファイルはバックアップを取ってから上書きする
#
# Usage:
#   bash scripts/copy-to-claude-code.sh                    # 全Agentをコピー（確認付き）
#   bash scripts/copy-to-claude-code.sh mykenko-yakuki-reviewer  # 特定Agentのみ
#   bash scripts/copy-to-claude-code.sh --dry-run          # ドライラン（実際にはコピーしない）

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REGISTRY_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
TARGET_AGENTS_DIR="/home/user/mykenko/.claude/agents"
TARGET_SKILLS_DIR="/home/user/mykenko/.claude/skills"
BACKUP_DIR="$REGISTRY_DIR/tmp/backups/$(date '+%Y%m%d_%H%M%S')"
DRY_RUN=false
SPECIFIC_AGENT=""

# 引数処理
for arg in "$@"; do
  if [ "$arg" = "--dry-run" ]; then
    DRY_RUN=true
  elif [ -n "$arg" ]; then
    SPECIFIC_AGENT="$arg"
  fi
done

if $DRY_RUN; then
  echo "🔍 ドライランモード（実際にはコピーしません）"
fi

mkdir -p "$BACKUP_DIR"

copy_file() {
  local src="$1"
  local dst="$2"
  local name="$(basename "$src")"

  if [ -f "$dst" ]; then
    if $DRY_RUN; then
      echo "  [DRY] バックアップ → コピー: $name"
    else
      cp "$dst" "$BACKUP_DIR/$name.bak"
      cp "$src" "$dst"
      echo "  ✅ コピー完了（バックアップ済み）: $name"
    fi
  else
    if $DRY_RUN; then
      echo "  [DRY] 新規コピー: $name"
    else
      cp "$src" "$dst"
      echo "  ✅ 新規コピー: $name"
    fi
  fi
}

# Agents のコピー
echo "=== Agents コピー ==="
if [ -n "$SPECIFIC_AGENT" ]; then
  # 特定Agentのみ
  AGENT_FILE=$(find "$REGISTRY_DIR/agents" -name "${SPECIFIC_AGENT}.md" -type f 2>/dev/null | head -1)
  if [ -z "$AGENT_FILE" ]; then
    echo "❌ Agent が見つかりません: $SPECIFIC_AGENT"
    exit 1
  fi
  copy_file "$AGENT_FILE" "$TARGET_AGENTS_DIR/$(basename "$AGENT_FILE")"
else
  # 全Agent（approved以上のみ）
  COPIED=0
  SKIPPED=0
  while IFS= read -r agent_file; do
    name="$(basename "$agent_file" .md)"
    # statusがdraftのものはスキップ
    if grep -q "^status: draft" "$agent_file" 2>/dev/null; then
      echo "  ⏭️  スキップ（draft）: $name"
      SKIPPED=$((SKIPPED + 1))
      continue
    fi
    copy_file "$agent_file" "$TARGET_AGENTS_DIR/$(basename "$agent_file")"
    COPIED=$((COPIED + 1))
  done < <(find "$REGISTRY_DIR/agents" -name "*.md" -type f | grep -v "deprecated" | sort)
  echo ""
  echo "コピー: $COPIED 件, スキップ: $SKIPPED 件"
fi

echo ""
echo "バックアップ: $BACKUP_DIR"
if $DRY_RUN; then
  echo ""
  echo "💡 実際にコピーするには --dry-run を外して実行してください"
fi
