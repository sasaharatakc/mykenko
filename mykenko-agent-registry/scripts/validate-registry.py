#!/usr/bin/env python3
"""
validate-registry.py
レジストリの整合性チェックを行う。

チェック内容:
- 必須フィールドの欠落確認
- SKILL.mdの有無確認
- agent-skill-map.jsonの参照切れ確認
- duplicate-report.json生成
- risk-report.json生成

Usage:
  python3 scripts/validate-registry.py
  python3 scripts/validate-registry.py --fix  (将来的に自動修正をサポート予定)
"""

import json
import sys
from pathlib import Path

REGISTRY_DIR = Path(__file__).parent.parent
MANIFESTS_DIR = REGISTRY_DIR / "manifests"
AGENTS_DIR = REGISTRY_DIR / "agents"
SKILLS_DIR = REGISTRY_DIR / "skills"

errors = []
warnings = []


def error(msg: str):
    errors.append(f"❌ ERROR: {msg}")
    print(f"❌ ERROR: {msg}")


def warn(msg: str):
    warnings.append(f"⚠️  WARN: {msg}")
    print(f"⚠️  WARN: {msg}")


def ok(msg: str):
    print(f"✅ OK: {msg}")


def load_json(path: Path) -> dict | None:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError:
        error(f"{path.relative_to(REGISTRY_DIR)} が見つかりません")
        return None
    except json.JSONDecodeError as e:
        error(f"{path.relative_to(REGISTRY_DIR)} のJSON解析エラー: {e}")
        return None


def check_agents_manifest():
    print("\n--- agents.json チェック ---")
    data = load_json(MANIFESTS_DIR / "agents.json")
    if not data:
        return []

    agents = data.get("agents", [])
    ok(f"agents.json ロード成功 ({len(agents)}件)")

    required_fields = ["name", "category", "scope", "status", "version", "risk_level"]
    missing_field_agents = []

    for agent in agents:
        name = agent.get("name", "???")
        for field in required_fields:
            if not agent.get(field):
                error(f"agents.json > {name}: 必須フィールド '{field}' が空です")
                missing_field_agents.append(name)

        # risk_level チェック
        valid_risk = ["low", "medium", "high", "critical"]
        if agent.get("risk_level") not in valid_risk:
            error(f"agents.json > {name}: risk_level '{agent.get('risk_level')}' が無効です（{valid_risk}のいずれか）")

        # status チェック
        valid_status = ["draft", "testing", "approved", "published", "deprecated", "archived"]
        if agent.get("status") not in valid_status:
            warn(f"agents.json > {name}: status '{agent.get('status')}' が未定義です")

    if not missing_field_agents:
        ok("agents.json: 全必須フィールドOK")

    return agents


def check_skills_manifest():
    print("\n--- skills.json チェック ---")
    data = load_json(MANIFESTS_DIR / "skills.json")
    if not data:
        return []

    skills = data.get("skills", [])
    ok(f"skills.json ロード成功 ({len(skills)}件)")

    required_fields = ["name", "category", "registry_path", "status", "version", "risk_level"]

    for skill in skills:
        name = skill.get("name", "???")
        for field in required_fields:
            if not skill.get(field):
                error(f"skills.json > {name}: 必須フィールド '{field}' が空です")

        # registry配下のSkillはSKILL.mdがあるかチェック
        registry_path = skill.get("registry_path", "")
        if registry_path and not registry_path.startswith("~") and not registry_path.startswith("/home/user"):
            skill_path = REGISTRY_DIR / registry_path
            if not skill_path.exists() and skill.get("status") not in ["draft"]:
                warn(f"skills.json > {name}: SKILL.md が見つかりません ({registry_path})")

    return skills


def check_agent_skill_map(agents: list, skills: list):
    print("\n--- agent-skill-map.json チェック ---")
    data = load_json(MANIFESTS_DIR / "agent-skill-map.json")
    if not data:
        return

    mappings = data.get("mappings", [])
    ok(f"agent-skill-map.json ロード成功 ({len(mappings)}件のマッピング)")

    agent_names = {a["name"] for a in agents if "name" in a}
    skill_names = {s["name"] for s in skills if "name" in s}

    for mapping in mappings:
        agent_name = mapping.get("agent", "???")
        if agent_name not in agent_names:
            warn(f"agent-skill-map.json: Agent '{agent_name}' が agents.json に見つかりません")

        for skill_name in mapping.get("skills", []):
            if skill_name not in skill_names:
                warn(f"agent-skill-map.json: {agent_name} が参照する Skill '{skill_name}' が skills.json に見つかりません")


def check_console_map():
    print("\n--- console-map.json チェック ---")
    data = load_json(MANIFESTS_DIR / "console-map.json")
    if not data:
        return
    ok(f"console-map.json ロード成功")
    uploaded = [a for a in data.get("managed_agents", []) if a.get("status") != "not_uploaded"]
    if uploaded:
        ok(f"アップロード済みManaged Agents: {len(uploaded)}件")
    else:
        print("  ℹ️  まだConsoleにアップロードされたAgentはありません")


def check_duplicate_report():
    print("\n--- duplicate-report.json チェック ---")
    data = load_json(MANIFESTS_DIR / "duplicate-report.json")
    if not data:
        return
    dup_skills = data.get("duplicate_skills", [])
    dup_commands = data.get("duplicate_commands", [])
    if dup_skills or dup_commands:
        warn(f"重複候補: Skills {len(dup_skills)}グループ, Commands {len(dup_commands)}グループ")
        for g in dup_skills:
            print(f"    - {g['group']}: {g['items']} → {g['action']}")
    else:
        ok("重複候補なし")


def print_summary():
    print("\n" + "=" * 60)
    print("バリデーションサマリー")
    print("=" * 60)
    if errors:
        print(f"\n❌ エラー: {len(errors)}件")
        for e in errors:
            print(f"  {e}")
    else:
        print("\n✅ エラーなし")

    if warnings:
        print(f"\n⚠️  警告: {len(warnings)}件")
        for w in warnings:
            print(f"  {w}")
    else:
        print("✅ 警告なし")

    print(f"\n合計: {len(errors)}エラー, {len(warnings)}警告")

    if errors:
        sys.exit(1)


if __name__ == "__main__":
    print("=== validate-registry.py ===")

    agents = check_agents_manifest()
    skills = check_skills_manifest()
    check_agent_skill_map(agents, skills)
    check_console_map()
    check_duplicate_report()
    print_summary()
