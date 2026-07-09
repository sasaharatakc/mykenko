#!/usr/bin/env python3
"""Validate .claude/agents/ against docs/ai-org/AGENT_REGISTRY.md.

WARNING中心（exit 0）。--strict で警告があれば exit 1。
チェック内容:
  - .claude/agents/ のエージェント数（上限警告）
  - description が長すぎるエージェント（>240字）
  - AGENT_REGISTRY.md に未登録のエージェント / 実体のない登録
  - 類似名エージェント（片方がもう片方を包含する名前）
  - core 指定が多すぎる場合（>15）
依存: 標準ライブラリのみ。
"""
import argparse
import re
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
AGENTS_DIR = REPO / ".claude" / "agents"
REGISTRY = REPO / "docs" / "ai-org" / "AGENT_REGISTRY.md"

MAX_DESC = 240
MAX_CORE = 15
MAX_AGENTS = 120

warnings: list[str] = []


def warn(msg: str) -> None:
    warnings.append(msg)
    print(f"WARNING: {msg}")


def load_agents() -> dict[str, str]:
    """name -> description（.claude/agents/*.md の frontmatter から）"""
    agents = {}
    for f in sorted(AGENTS_DIR.glob("*.md")):
        text = f.read_text(encoding="utf-8")
        m = re.match(r"^---\n(.*?)\n---", text, re.S)
        fm = m.group(1) if m else ""
        nm = re.search(r"^name:\s*(.+)$", fm, re.M)
        dm = re.search(r"^description:\s*(.+)$", fm, re.M)
        name = nm.group(1).strip() if nm else f.stem
        agents[name] = dm.group(1).strip() if dm else ""
        if name != f.stem:
            warn(f"ファイル名とnameが不一致: {f.name} vs name={name}")
    return agents


def load_registry() -> dict[str, str]:
    """name -> tier（AGENT_REGISTRY.md の表から）"""
    if not REGISTRY.exists():
        warn(f"レジストリが存在しない: {REGISTRY}")
        return {}
    tiers = {}
    current = None
    for line in REGISTRY.read_text(encoding="utf-8").splitlines():
        h = re.match(r"^##\s+(core|optional|archive-candidate)", line)
        if h:
            current = h.group(1)
            continue
        row = re.match(r"^\|\s*([a-z0-9][a-z0-9-]*)\s*\|", line)
        if row and current and row.group(1) not in ("tier", "agent"):
            tiers[row.group(1)] = current
    return tiers


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--strict", action="store_true",
                        help="警告があれば exit 1")
    args = parser.parse_args()

    agents = load_agents()
    registry = load_registry()

    print(f".claude/agents/: {len(agents)}体 / レジストリ登録: {len(registry)}体")

    if len(agents) > MAX_AGENTS:
        warn(f"エージェント数 {len(agents)} が上限目安 {MAX_AGENTS} を超過")

    for name, desc in agents.items():
        if len(desc) > MAX_DESC:
            warn(f"description が {MAX_DESC}字超過 ({len(desc)}字): {name}")
        if not desc:
            warn(f"description が空: {name}")

    unregistered = set(agents) - set(registry)
    for name in sorted(unregistered):
        warn(f"AGENT_REGISTRY.md に未登録: {name}")

    for name, tier in sorted(registry.items()):
        if tier != "archive-candidate" and name not in agents:
            warn(f"レジストリに {tier} 登録済みだが .claude/agents/ に実体なし: {name}")
        if tier == "archive-candidate":
            if name in agents:
                warn(f"archive-candidate なのに .claude/agents/ に残存: {name}")
            elif not (REPO / "docs/ai-org/agents/archive" / f"{name}.md").exists():
                warn(f"archive-candidate の退避ファイルなし: {name}")

    # 類似名: 同一語幹で役割種別も同じ（または agent/engineer の重複）場合のみ警告。
    # writer/checker/analyst の同語幹ペアは「実行・レビュー・分析の分離」ルールによる意図的な設計なので対象外。
    def split_role(name: str) -> tuple[str, str]:
        m = re.match(r"^(.*?)-(agent|engineer|analyst|writer|designer|checker)$", name)
        return (m.group(1), m.group(2)) if m else (name, "")

    names = sorted(agents)
    for i, a in enumerate(names):
        stem_a, role_a = split_role(a)
        for b in names[i + 1:]:
            stem_b, role_b = split_role(b)
            if stem_a == stem_b and (
                role_a == role_b or {role_a, role_b} == {"agent", "engineer"}
            ):
                warn(f"類似名エージェント（統合検討）: {a} / {b}")

    core = [n for n, t in registry.items() if t == "core"]
    if len(core) > MAX_CORE:
        warn(f"core が {len(core)}体（上限 {MAX_CORE}）: 削減するか AGENT_POLICY.md を見直す")

    if warnings:
        print(f"\n{len(warnings)}件の警告。運用ルール: docs/ai-org/AGENT_POLICY.md")
        return 1 if args.strict else 0
    print("OK: 警告なし")
    return 0


if __name__ == "__main__":
    sys.exit(main())
