#!/usr/bin/env python3
"""
package-skills.py
Console Custom Skills Libraryアップロード用にSkillをzip化する。
approved以上のSkillのみzipにする。

Usage:
  python3 scripts/package-skills.py
  python3 scripts/package-skills.py --skill mykenko-yakuki-check
  python3 scripts/package-skills.py --all  (draftも含む)
"""

import argparse
import json
import sys
import zipfile
from datetime import date
from pathlib import Path

REGISTRY_DIR = Path(__file__).parent.parent
SKILLS_DIR = REGISTRY_DIR / "skills"
DIST_DIR = REGISTRY_DIR / "dist" / "skills"
MANIFESTS_DIR = REGISTRY_DIR / "manifests"


def load_skills_manifest() -> list:
    manifest_path = MANIFESTS_DIR / "skills.json"
    if not manifest_path.exists():
        print("❌ manifests/skills.json が見つかりません")
        sys.exit(1)
    data = json.loads(manifest_path.read_text(encoding="utf-8"))
    return data.get("skills", [])


def package_skill(skill_dir: Path, output_path: Path) -> bool:
    """SkillディレクトリをZIPにパッケージ化する"""
    skill_files = list(skill_dir.rglob("*"))
    if not skill_files:
        print(f"  ⚠️  スキップ（ファイルなし）: {skill_dir.name}")
        return False

    # SKILL.mdが存在することを確認
    skill_md = skill_dir / "SKILL.md"
    if not skill_md.exists():
        print(f"  ⚠️  スキップ（SKILL.mdなし）: {skill_dir.name}")
        return False

    output_path.parent.mkdir(parents=True, exist_ok=True)

    with zipfile.ZipFile(output_path, "w", zipfile.ZIP_DEFLATED) as zf:
        for file_path in sorted(skill_dir.rglob("*")):
            if file_path.is_file():
                arcname = file_path.relative_to(skill_dir)
                zf.write(file_path, arcname)

    size_kb = output_path.stat().st_size / 1024
    print(f"  ✅ パッケージ完了: {output_path.name} ({size_kb:.1f} KB)")
    return True


def main():
    parser = argparse.ArgumentParser(description="Skillをzip化してdist/skills/に保存する")
    parser.add_argument("--skill", help="特定のSkill名のみzipにする")
    parser.add_argument("--all", action="store_true", help="draftも含めて全Skillをzip化する")
    args = parser.parse_args()

    DIST_DIR.mkdir(parents=True, exist_ok=True)

    skills = load_skills_manifest()
    packaged = 0
    skipped = 0

    for skill in skills:
        name = skill.get("name", "")
        status = skill.get("status", "draft")
        registry_path = skill.get("registry_path", "")

        # フィルタリング
        if args.skill and name != args.skill:
            continue
        if not args.all and status == "draft":
            print(f"  ⏭️  スキップ（draft）: {name}")
            skipped += 1
            continue
        if skill.get("console_target") == "none":
            print(f"  ⏭️  スキップ（console_target: none）: {name}")
            skipped += 1
            continue

        # SKILL.mdへのパスからスキルディレクトリを特定
        if not registry_path:
            print(f"  ⏭️  スキップ（registry_path未定義）: {name}")
            skipped += 1
            continue

        skill_dir = REGISTRY_DIR / Path(registry_path).parent
        if not skill_dir.exists():
            print(f"  ⏭️  スキップ（ディレクトリ未作成）: {name} ({skill_dir})")
            skipped += 1
            continue

        output_path = DIST_DIR / f"{name}.zip"
        if package_skill(skill_dir, output_path):
            packaged += 1
        else:
            skipped += 1

    print(f"\nzip化完了: {packaged}件, スキップ: {skipped}件")
    print(f"出力先: {DIST_DIR}")


if __name__ == "__main__":
    print("=== package-skills.py ===")
    main()
