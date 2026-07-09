#!/usr/bin/env bash
# リポジトリ横断の軽量バリデーション（追加はここに一元化する）
set -uo pipefail
cd "$(dirname "$0")/.."

status=0

echo "== agent registry =="
python3 tools/ai/validate-agent-registry.py --strict || status=1

echo "== command registry =="
python3 tools/ai/validate-command-registry.py --strict || status=1

exit $status
