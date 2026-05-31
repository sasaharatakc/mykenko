#!/usr/bin/env python3
"""
prepare-console-upload.py
Console移行対象のAgent/Skillを抽出し、アップロード用ファイルを生成する。

出力:
  dist/console-upload/managed-agents/{agent-name}.json
  dist/console-upload/custom-skills/{skill-name}.zip  (package-skills.pyで生成済みのもの)
  dist/console-upload/upload-manifest.json

Usage:
  python3 scripts/prepare-console-upload.py
  python3 scripts/prepare-console-upload.py --dry-run
"""

import argparse
import json
import shutil
from datetime import date
from pathlib import Path

REGISTRY_DIR = Path(__file__).parent.parent
MANIFESTS_DIR = REGISTRY_DIR / "manifests"
DIST_DIR = REGISTRY_DIR / "dist" / "console-upload"
SKILLS_DIST_DIR = REGISTRY_DIR / "dist" / "skills"


def load_manifest(filename: str) -> dict:
    path = MANIFESTS_DIR / filename
    return json.loads(path.read_text(encoding="utf-8"))


def extract_system_prompt(agent_file: Path) -> str:
    """AgentのMarkdownファイルからsystem promptを抽出する"""
    if not agent_file.exists():
        return ""
    content = agent_file.read_text(encoding="utf-8", errors="ignore")
    # frontmatter以降を返す
    if content.startswith("---"):
        end = content.find("---", 3)
        if end > 0:
            return content[end + 3:].strip()
    return content.strip()


def prepare_managed_agents(agents_manifest: dict, dry_run: bool) -> list:
    """Managed Agents用のJSONを生成する"""
    agents_output_dir = DIST_DIR / "managed-agents"
    if not dry_run:
        agents_output_dir.mkdir(parents=True, exist_ok=True)

    upload_list = []

    for agent in agents_manifest.get("agents", []):
        status = agent.get("status", "draft")
        risk_level = agent.get("risk_level", "medium")
        mykenko_related = agent.get("mykenko_related", False)

        # アップロード対象基準
        if status not in ["approved", "published"]:
            continue
        if risk_level == "critical":
            continue
        if not mykenko_related:
            continue

        name = agent.get("name", "")
        registry_path = agent.get("registry_path", "")

        # system promptの抽出
        system_prompt = ""
        if registry_path:
            agent_file = REGISTRY_DIR / registry_path
            system_prompt = extract_system_prompt(agent_file)

        agent_json = {
            "name": name,
            "description": f"MYKENKO - {name}",
            "system_prompt": system_prompt,
            "model": agent.get("model_preference", "claude-sonnet-4-6"),
            "skills": agent.get("skills", []),
            "tools": agent.get("tools", []),
            "version": agent.get("version", "1.0.0"),
            "category": agent.get("category", ""),
            "risk_level": risk_level,
            "prepared_at": str(date.today())
        }

        output_path = agents_output_dir / f"{name}.json"
        if dry_run:
            print(f"  [DRY] Managed Agent: {output_path.relative_to(REGISTRY_DIR)}")
        else:
            output_path.write_text(json.dumps(agent_json, ensure_ascii=False, indent=2))
            print(f"  ✅ 生成: {output_path.relative_to(REGISTRY_DIR)}")

        upload_list.append({"name": name, "type": "managed-agent", "path": str(output_path.relative_to(REGISTRY_DIR))})

    return upload_list


def prepare_custom_skills(skills_manifest: dict, dry_run: bool) -> list:
    """Custom Skills用のzipをdist/console-upload/にコピーする"""
    skills_output_dir = DIST_DIR / "custom-skills"
    if not dry_run:
        skills_output_dir.mkdir(parents=True, exist_ok=True)

    upload_list = []

    for skill in skills_manifest.get("skills", []):
        status = skill.get("status", "draft")
        risk_level = skill.get("risk_level", "medium")
        console_target = skill.get("console_target", "custom-skill")

        # アップロード対象基準
        if status not in ["approved", "published"]:
            continue
        if risk_level == "critical":
            continue
        if console_target == "none":
            continue

        name = skill.get("name", "")
        zip_src = SKILLS_DIST_DIR / f"{name}.zip"

        if not zip_src.exists():
            print(f"  ⏭️  スキップ（zip未生成）: {name} → package-skills.py を先に実行してください")
            continue

        output_path = skills_output_dir / f"{name}.zip"
        if dry_run:
            print(f"  [DRY] Custom Skill: {output_path.relative_to(REGISTRY_DIR)}")
        else:
            shutil.copy2(zip_src, output_path)
            print(f"  ✅ コピー: {output_path.relative_to(REGISTRY_DIR)}")

        upload_list.append({"name": name, "type": "custom-skill", "path": str(output_path.relative_to(REGISTRY_DIR))})

    return upload_list


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    if args.dry_run:
        print("🔍 ドライランモード")

    agents_manifest = load_manifest("agents.json")
    skills_manifest = load_manifest("skills.json")

    print("\n=== Managed Agents 準備 ===")
    agent_list = prepare_managed_agents(agents_manifest, args.dry_run)

    print("\n=== Custom Skills 準備 ===")
    skill_list = prepare_custom_skills(skills_manifest, args.dry_run)

    # アップロードマニフェスト
    upload_manifest = {
        "prepared_at": str(date.today()),
        "total_agents": len(agent_list),
        "total_skills": len(skill_list),
        "managed_agents": agent_list,
        "custom_skills": skill_list
    }

    if not args.dry_run:
        DIST_DIR.mkdir(parents=True, exist_ok=True)
        manifest_path = DIST_DIR / "upload-manifest.json"
        manifest_path.write_text(json.dumps(upload_manifest, ensure_ascii=False, indent=2))
        print(f"\n✅ アップロードマニフェスト: {manifest_path.relative_to(REGISTRY_DIR)}")

    print(f"\n対象: Managed Agents {len(agent_list)}件, Custom Skills {len(skill_list)}件")


if __name__ == "__main__":
    print("=== prepare-console-upload.py ===")
    main()
