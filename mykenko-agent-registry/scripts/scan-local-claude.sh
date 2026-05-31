#!/bin/bash
# scan-local-claude.sh
# ローカルClaude環境のAgent/Skill/Commandを一覧化するスキャンスクリプト
# 秘密情報は表示しない。結果を tmp/local-claude-scan.txt に保存。

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REGISTRY_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
OUTPUT_FILE="$REGISTRY_DIR/tmp/local-claude-scan.txt"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

mkdir -p "$REGISTRY_DIR/tmp"

echo "# local-claude-scan" > "$OUTPUT_FILE"
echo "# Generated: $TIMESTAMP" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

log() {
  echo "$@"
  echo "$@" >> "$OUTPUT_FILE"
}

log "=== Claude環境スキャン ==="
log "実行日時: $TIMESTAMP"
log ""

# グローバル設定
log "=== グローバル設定 ==="
if [ -d "$HOME/.claude" ]; then
  log "~/.claude が存在します"
  ls -la "$HOME/.claude" 2>/dev/null | grep -v "^total" >> "$OUTPUT_FILE" || true
else
  log "~/.claude が見つかりません"
fi
log ""

# グローバルAgents（~/.claude/agents/）
log "=== グローバル Agents (~/.claude/agents/) ==="
if [ -d "$HOME/.claude/agents" ]; then
  GLOBAL_AGENT_COUNT=$(find "$HOME/.claude/agents" -name "*.md" -type f 2>/dev/null | wc -l)
  log "件数: $GLOBAL_AGENT_COUNT"
  find "$HOME/.claude/agents" -name "*.md" -type f 2>/dev/null | \
    sed "s#$HOME#~#g" | sort >> "$OUTPUT_FILE"
else
  log "（存在しません）"
fi
log ""

# グローバルSkills（~/.claude/skills/）
log "=== グローバル Skills (~/.claude/skills/) ==="
if [ -d "$HOME/.claude/skills" ]; then
  GLOBAL_SKILL_COUNT=$(find "$HOME/.claude/skills" -name "*.md" -type f 2>/dev/null | wc -l)
  log "件数: $GLOBAL_SKILL_COUNT"
  find "$HOME/.claude/skills" -name "*.md" -type f 2>/dev/null | \
    sed "s#$HOME#~#g" | sort >> "$OUTPUT_FILE"
else
  log "（存在しません）"
fi
log ""

# グローバルCommands（~/.claude/commands/）
log "=== グローバル Commands (~/.claude/commands/) ==="
if [ -d "$HOME/.claude/commands" ]; then
  GLOBAL_COMMAND_COUNT=$(find "$HOME/.claude/commands" -name "*.md" -type f 2>/dev/null | wc -l)
  log "件数: $GLOBAL_COMMAND_COUNT"
  find "$HOME/.claude/commands" -name "*.md" -type f 2>/dev/null | \
    sed "s#$HOME#~#g" | sort >> "$OUTPUT_FILE"
else
  log "（存在しません）"
fi
log ""

# プロジェクト設定ファイル
log "=== グローバル設定ファイル ==="
for config_file in "$HOME/.claude/settings.json" "$HOME/.claude.json"; do
  if [ -f "$config_file" ]; then
    DISPLAY_PATH=$(echo "$config_file" | sed "s#$HOME#~#g")
    log "$DISPLAY_PATH が存在します"
    # APIキー・トークン・パスワードは表示しない
    if grep -qi "key\|token\|secret\|password\|auth" "$config_file" 2>/dev/null; then
      log "  ⚠️  注意: 認証情報と思われるフィールドが含まれています（表示しません）"
    fi
  fi
done
log ""

# プロジェクト配下のAgent/Skill/Command
log "=== プロジェクト配下 ==="
PROJECT_DIRS=(
  "/home/user/mykenko"
  "$HOME/Documents/Claude/Projects"
)

for BASE_DIR in "${PROJECT_DIRS[@]}"; do
  if [ -d "$BASE_DIR" ]; then
    log "--- $BASE_DIR ---"

    # Agents
    PROJECT_AGENT_COUNT=$(find "$BASE_DIR" -path "*/.claude/agents/*.md" -type f 2>/dev/null | wc -l)
    log "  Agents: $PROJECT_AGENT_COUNT 件"
    find "$BASE_DIR" -path "*/.claude/agents/*.md" -type f 2>/dev/null | \
      sed "s#$HOME#~#g" | sed "s#/home/user#~#g" | sort | head -200 >> "$OUTPUT_FILE" || true

    # Skills
    PROJECT_SKILL_COUNT=$(find "$BASE_DIR" -path "*/.claude/skills/*.md" -type f 2>/dev/null | wc -l)
    log "  Skills: $PROJECT_SKILL_COUNT 件"
    find "$BASE_DIR" -path "*/.claude/skills/**/*.md" -type f 2>/dev/null | \
      sed "s#$HOME#~#g" | sed "s#/home/user#~#g" | sort | head -200 >> "$OUTPUT_FILE" || true

    # Commands
    PROJECT_COMMAND_COUNT=$(find "$BASE_DIR" -path "*/.claude/commands/*.md" -type f 2>/dev/null | wc -l)
    log "  Commands: $PROJECT_COMMAND_COUNT 件"
    find "$BASE_DIR" -path "*/.claude/commands/*.md" -type f 2>/dev/null | \
      sed "s#$HOME#~#g" | sed "s#/home/user#~#g" | sort | head -200 >> "$OUTPUT_FILE" || true
  fi
done
log ""

# サマリー
log "=== スキャンサマリー ==="
TOTAL_AGENTS=$(find "$HOME/.claude" /home/user/mykenko -path "*/.claude/agents/*.md" -o -path "*/agents/*.md" -type f 2>/dev/null | grep -v "mykenko-agent-registry" | wc -l || echo "0")
TOTAL_SKILLS=$(find "$HOME/.claude" /home/user/mykenko -path "*/.claude/skills/**/*.md" -o -path "*/skills/**/*.md" -type f 2>/dev/null | grep -v "mykenko-agent-registry" | wc -l || echo "0")
TOTAL_COMMANDS=$(find "$HOME/.claude" /home/user/mykenko -path "*/.claude/commands/*.md" -o -path "*/commands/*.md" -type f 2>/dev/null | grep -v "mykenko-agent-registry" | wc -l || echo "0")
log "総Agent数（推定）: $TOTAL_AGENTS"
log "総Skill数（推定）: $TOTAL_SKILLS"
log "総Command数（推定）: $TOTAL_COMMANDS"
log ""
log "出力ファイル: $OUTPUT_FILE"

echo ""
echo "✅ スキャン完了: $OUTPUT_FILE"
