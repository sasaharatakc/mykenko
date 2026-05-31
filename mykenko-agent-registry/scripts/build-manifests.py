#!/usr/bin/env python3
"""
build-manifests.py
scan-local-claude.sh の結果またはローカルファイルから
agents.json / skills.json / commands.json のドラフトを生成する。

Usage:
  python3 scripts/build-manifests.py
  python3 scripts/build-manifests.py --scan-file tmp/local-claude-scan.txt
"""

import json
import os
import re
import sys
from datetime import date
from pathlib import Path

REGISTRY_DIR = Path(__file__).parent.parent
MANIFESTS_DIR = REGISTRY_DIR / "manifests"


def extract_frontmatter(filepath: Path) -> dict:
    """MarkdownファイルからYAML frontmatterを抽出する（最小限のパース）"""
    meta = {}
    try:
        content = filepath.read_text(encoding="utf-8", errors="ignore")
        if content.startswith("---"):
            end = content.find("---", 3)
            if end > 0:
                fm = content[3:end].strip()
                for line in fm.splitlines():
                    if ":" in line:
                        key, _, val = line.partition(":")
                        meta[key.strip()] = val.strip()
    except Exception:
        pass
    return meta


def categorize_agent(name: str) -> str:
    """Agent名からカテゴリを推定する"""
    rules = [
        (["kingmaker", "gamechanger", "ceo", "cmo", "coo", "cfo", "chief-of-staff", "executive-director"], "executive"),
        (["technical-seo", "onpage-seo", "offpage-seo", "entity-seo", "programmatic-seo", "internal-link-seo",
          "schema-seo", "local-seo", "ai-overview-seo", "parasite-seo", "seo-analyst", "seo-checker",
          "seo-writer", "keyword-agent", "seo-director"], "seo"),
        (["geo-writer", "citation-builder", "mention-builder", "entity-builder", "authority-builder",
          "ai-search-monitor", "knowledge-graph-agent", "geo-llmo"], "geo"),
        (["google-search", "competitor-agent", "market-research", "reddit-agent", "news-agent",
          "trend-agent", "academic-paper", "patent-agent", "customer-voice", "review-research",
          "regulation-agent", "serp-researcher"], "research"),
        (["x-agent", "instagram", "tiktok-agent", "threads", "youtube-agent", "pinterest",
          "linkedin", "sns-writer", "sns-research", "sns-localizer"], "sns"),
        (["meta-ads", "google-ads", "yahoo-ads", "tiktok-ads", "x-ads", "lp-designer", "ads-lp"], "ads"),
        (["copywriter", "medical-writer", "pr-writer", "script-writer", "video-writer",
          "email-writer", "translator", "editor", "doc-writer", "content-architect", "product-page-writer"], "content"),
        (["compliance", "fact-checker", "medical-checker", "risk-checker",
          "yakuki", "ymyl", "fda", "keihyo"], "compliance"),
        (["ecommerce", "conversion-agent", "offer-agent", "upsell", "cross-sell",
          "retention-agent", "ltv-agent", "order-manager", "vendor-manager"], "ecommerce"),
        (["price-monitor"], "price-monitoring"),
        (["product-db"], "product-db"),
        (["ingredient-db"], "ingredient-db"),
        (["affiliate"], "affiliate"),
        (["agency-manager"], "agency"),
        (["sales-planner", "sales-agent"], "sales"),
        (["crm-agent", "customer-support"], "crm"),
        (["workflow-agent", "task-agent", "scheduler", "automation-agent",
          "notification-agent", "deployment-agent", "publishing-agent", "loop-operator",
          "automation-engineer"], "automation"),
        (["crawler-agent", "firecrawl", "scraping-agent", "parser-agent", "normalizer",
          "qdrant-agent", "neo4j-agent", "data-analyst", "data-quality", "deduplication",
          "database"], "data"),
        (["creative-director", "art-director", "ui-designer", "ux-designer", "banner-designer",
          "video-designer", "motion-designer", "brand-designer", "figma-designer",
          "design-checker", "ux-checker", "design-auditor"], "design"),
        (["video-writer", "youtube-research"], "video"),
        (["system-architect", "architect", "nextjs-engineer", "laravel-engineer",
          "python-engineer", "typescript-engineer", "mobile-engineer", "ai-engineer",
          "api-engineer", "backend-engineer", "frontend-engineer", "ml-engineer",
          "qa-engineer", "tdd-guide", "refactor-engineer", "code-reviewer",
          "performance-optimizer", "dev-architect", "dev-reviewer"], "development"),
        (["devops-engineer", "github-ops"], "devops"),
        (["security-engineer"], "security"),
        (["financial-analyst", "cfo"], "finance"),
    ]
    name_lower = name.lower()
    for keywords, category in rules:
        if any(kw in name_lower for kw in keywords):
            return category
    return "common"


def infer_risk_level(name: str, category: str) -> str:
    """名前とカテゴリからリスクレベルを推定する"""
    high_keywords = ["yakuki", "ymyl", "fda", "keihyo", "medical", "compliance",
                     "scraping", "crawler", "security", "devops", "deploy", "price-monitor",
                     "ingredient", "stealth-marketing", "affiliate-policy", "github-ops"]
    critical_keywords = ["rm -rf", "reset --hard", "push --force", "payment", "personal-data"]

    name_lower = name.lower()
    if any(kw in name_lower for kw in critical_keywords):
        return "critical"
    if any(kw in name_lower for kw in high_keywords):
        return "high"
    if category in ["development", "devops", "data", "automation", "ads", "ecommerce", "crm", "sales"]:
        return "medium"
    return "low"


def build_agents_manifest():
    """agents.jsonを再生成する（既存を上書きしないためdraftとしてtmpに書く）"""
    agents_dir = REGISTRY_DIR / "agents"
    existing_manifest = MANIFESTS_DIR / "agents.json"

    agents = []
    today = str(date.today())

    # registryのagents/配下を走査
    for agent_file in sorted(agents_dir.rglob("*.md")):
        rel = agent_file.relative_to(agents_dir)
        parts = rel.parts
        if len(parts) < 2:
            continue
        category = parts[0]
        name = parts[-1].replace(".md", "")
        meta = extract_frontmatter(agent_file)

        agents.append({
            "name": meta.get("name", name),
            "category": meta.get("category", category),
            "scope": meta.get("scope", "project"),
            "source_path": meta.get("source_path", ""),
            "registry_path": f"agents/{category}/{name}.md",
            "console_target": meta.get("console_target", "managed-agent"),
            "status": meta.get("status", "draft"),
            "version": meta.get("version", "0.1.0"),
            "skills": [],
            "tools": [],
            "risk_level": meta.get("risk_level", infer_risk_level(name, category)),
            "mykenko_related": name.startswith("mykenko-") or meta.get("mykenko_related", "false") == "true",
            "duplicate_of": None,
            "notes": meta.get("notes", "")
        })

    manifest = {
        "version": "1.0.0",
        "generated_at": today,
        "source": "registry-scan",
        "total": len(agents),
        "agents": agents
    }

    output_path = REGISTRY_DIR / "tmp" / "agents_draft.json"
    output_path.parent.mkdir(exist_ok=True)
    output_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2))
    print(f"✅ Agentsドラフト: {output_path} ({len(agents)}件)")
    return manifest


def build_skills_manifest():
    """skills.jsonを再生成する（tmpにドラフトとして書く）"""
    skills_dir = REGISTRY_DIR / "skills"
    today = str(date.today())
    skills = []

    for skill_md in sorted(skills_dir.rglob("SKILL.md")):
        rel = skill_md.relative_to(skills_dir)
        parts = rel.parts
        if len(parts) < 2:
            continue
        category = parts[0]
        skill_name = parts[1] if len(parts) >= 2 else parts[0]
        meta = extract_frontmatter(skill_md)

        skills.append({
            "name": meta.get("name", skill_name),
            "category": meta.get("category", category),
            "source_path": meta.get("source_path", ""),
            "registry_path": str(skill_md.relative_to(REGISTRY_DIR)),
            "entry": "SKILL.md",
            "console_target": meta.get("console_target", "custom-skill"),
            "status": meta.get("status", "draft"),
            "version": meta.get("version", "0.1.0"),
            "risk_level": meta.get("risk_level", "medium"),
            "mykenko_related": skill_name.startswith("mykenko-") or meta.get("mykenko_related", "false") == "true",
            "duplicate_of": None,
            "notes": meta.get("notes", "")
        })

    manifest = {
        "version": "1.0.0",
        "generated_at": today,
        "source": "registry-scan",
        "total": len(skills),
        "skills": skills
    }

    output_path = REGISTRY_DIR / "tmp" / "skills_draft.json"
    output_path.parent.mkdir(exist_ok=True)
    output_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2))
    print(f"✅ Skillsドラフト: {output_path} ({len(skills)}件)")
    return manifest


if __name__ == "__main__":
    print("=== build-manifests.py ===")
    print("※ 既存のmanifests/agents.json等は上書きしません")
    print("※ ドラフトは tmp/ に生成されます")
    print("")

    build_agents_manifest()
    build_skills_manifest()

    print("")
    print("ドラフトを確認後、問題なければ manifests/ に手動でコピーしてください。")
