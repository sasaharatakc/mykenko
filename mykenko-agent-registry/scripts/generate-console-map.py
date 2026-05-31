#!/usr/bin/env python3
"""
generate-console-map.py
Console移行後にconsole-map.jsonを更新するスクリプト。

Usage:
  python3 scripts/generate-console-map.py --agent mykenko-yakuki-reviewer --id agt_xxxxx --version 1.0.0
  python3 scripts/generate-console-map.py --skill mykenko-yakuki-check --id skl_xxxxx --version 1.0.0
  python3 scripts/generate-console-map.py --list  (現在の状態を表示)
"""

import argparse
import json
from datetime import date
from pathlib import Path

REGISTRY_DIR = Path(__file__).parent.parent
CONSOLE_MAP_PATH = REGISTRY_DIR / "manifests" / "console-map.json"


def load_console_map() -> dict:
    return json.loads(CONSOLE_MAP_PATH.read_text(encoding="utf-8"))


def save_console_map(data: dict):
    CONSOLE_MAP_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2))
    print(f"✅ console-map.json を更新しました")


def update_agent(data: dict, name: str, console_id: str, version: str) -> bool:
    for agent in data.get("managed_agents", []):
        if agent.get("local_name") == name:
            agent["console_agent_id"] = console_id
            agent["console_version"] = version
            agent["status"] = "published"
            agent["last_synced_at"] = str(date.today())
            return True
    print(f"⚠️  '{name}' が console-map.json の managed_agents に見つかりません")
    return False


def update_skill(data: dict, name: str, console_id: str, version: str) -> bool:
    for skill in data.get("custom_skills", []):
        if skill.get("local_name") == name:
            skill["console_skill_id"] = console_id
            skill["console_version"] = version
            skill["status"] = "published"
            skill["last_synced_at"] = str(date.today())
            return True
    print(f"⚠️  '{name}' が console-map.json の custom_skills に見つかりません")
    return False


def print_status(data: dict):
    print("\n=== Console移行状態 ===")

    print("\n--- Managed Agents ---")
    for agent in data.get("managed_agents", []):
        status = agent.get("status", "")
        name = agent.get("local_name", "")
        icon = "✅" if status == "published" else "⏳"
        print(f"  {icon} {name}: {status} (ID: {agent.get('console_agent_id', 'なし')})")

    print("\n--- Custom Skills ---")
    for skill in data.get("custom_skills", []):
        status = skill.get("status", "")
        name = skill.get("local_name", "")
        icon = "✅" if status == "published" else "⏳"
        print(f"  {icon} {name}: {status} (ID: {skill.get('console_skill_id', 'なし')})")

    published_agents = sum(1 for a in data.get("managed_agents", []) if a.get("status") == "published")
    published_skills = sum(1 for s in data.get("custom_skills", []) if s.get("status") == "published")
    total_agents = len(data.get("managed_agents", []))
    total_skills = len(data.get("custom_skills", []))
    print(f"\n進捗: Agents {published_agents}/{total_agents}, Skills {published_skills}/{total_skills}")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--agent", help="Managed AgentのLocal名")
    parser.add_argument("--skill", help="Custom SkillのLocal名")
    parser.add_argument("--id", help="Console側のID")
    parser.add_argument("--version", default="1.0.0", help="Consoleに登録したバージョン")
    parser.add_argument("--list", action="store_true", help="現在の状態を表示")
    args = parser.parse_args()

    data = load_console_map()

    if args.list or (not args.agent and not args.skill):
        print_status(data)
        return

    if args.agent:
        if not args.id:
            print("❌ --id が必要です")
            return
        if update_agent(data, args.agent, args.id, args.version):
            save_console_map(data)
            print(f"  Agent: {args.agent} → {args.id} (v{args.version})")

    if args.skill:
        if not args.id:
            print("❌ --id が必要です")
            return
        if update_skill(data, args.skill, args.id, args.version):
            save_console_map(data)
            print(f"  Skill: {args.skill} → {args.id} (v{args.version})")


if __name__ == "__main__":
    print("=== generate-console-map.py ===")
    main()
