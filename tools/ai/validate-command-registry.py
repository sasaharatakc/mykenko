#!/usr/bin/env python3
"""Validate .claude/commands/ against docs/ai-org/COMMAND_REGISTRY.md.

WARNING中心（exit 0）。--strict で警告があれば exit 1。
チェック内容:
  - .claude/commands/ のコマンド数（上限警告）
  - 見出し行（注入されるdescription）が長すぎる / 欠落しているコマンド
  - COMMAND_REGISTRY.md に未登録のコマンド / 実体のない登録
  - archive-candidate の残存・退避ファイル欠落
  - 類似名コマンド（同一語幹）
  - core 指定が多すぎる場合（>12）
  - 現役コマンドの body が archive-candidate を参照していないか
  - .claude/skills/ にコマンドの重複コピーが再作成されていないか（SSOTは .claude/commands/）
依存: 標準ライブラリのみ。
"""
import argparse
import re
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
CMD_DIR = REPO / ".claude" / "commands"
ARCHIVE_DIR = REPO / "docs" / "ai-org" / "commands" / "archive"
REGISTRY = REPO / "docs" / "ai-org" / "COMMAND_REGISTRY.md"

MAX_TITLE = 80
MAX_CORE = 12
MAX_COMMANDS = 60

warnings: list[str] = []


def warn(msg: str) -> None:
    warnings.append(msg)
    print(f"WARNING: {msg}")


def title_of(f: Path) -> str:
    for line in f.read_text(encoding="utf-8").splitlines():
        if line.startswith("# "):
            return line[2:].strip()
    return ""


def load_commands() -> dict[str, str]:
    """name -> 見出し行テキスト"""
    return {f.stem: title_of(f) for f in sorted(CMD_DIR.glob("*.md"))}


def load_registry() -> dict[str, str]:
    """name -> tier（COMMAND_REGISTRY.md の表から）"""
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
        if row and current and row.group(1) not in ("tier", "command"):
            tiers[row.group(1)] = current
    return tiers


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--strict", action="store_true",
                        help="警告があれば exit 1")
    args = parser.parse_args()

    cmds = load_commands()
    registry = load_registry()

    print(f".claude/commands/: {len(cmds)}本 / レジストリ登録: {len(registry)}本")

    if len(cmds) > MAX_COMMANDS:
        warn(f"コマンド数 {len(cmds)} が上限目安 {MAX_COMMANDS} を超過")

    for name, title in cmds.items():
        if not title:
            warn(f"先頭見出し行（# /名前 — 説明）がない: {name}")
        elif len(title) > MAX_TITLE:
            warn(f"見出し行が {MAX_TITLE}字超過 ({len(title)}字): {name}")

    for name in sorted(set(cmds) - set(registry)):
        warn(f"COMMAND_REGISTRY.md に未登録: {name}")

    for name, tier in sorted(registry.items()):
        if tier != "archive-candidate" and name not in cmds:
            warn(f"レジストリに {tier} 登録済みだが .claude/commands/ に実体なし: {name}")
        if tier == "archive-candidate":
            if name in cmds:
                warn(f"archive-candidate なのに .claude/commands/ に残存: {name}")
            elif not (ARCHIVE_DIR / f"{name}.md").exists():
                warn(f"archive-candidate の退避ファイルなし: {name}")

    # 類似名: 同一語幹（末尾の -flow / -check / 深掘りサフィックス等を除いた形）が重複したら警告
    def stem(name: str) -> str:
        return re.sub(r"-(flow|check|audit|gen|research|analysis|deep(-analysis)?)$", "", name)

    names = sorted(cmds)
    for i, a in enumerate(names):
        for b in names[i + 1:]:
            if stem(a) == stem(b):
                warn(f"類似名コマンド（統合検討）: {a} / {b}")

    # 現役コマンドの body 内で退避済みコマンドを参照していないか（/name 形式・単語境界）
    archived = sorted(n for n, t in registry.items() if t == "archive-candidate")
    if archived:
        pat = re.compile(
            r"(?<![\w/-])/(" + "|".join(re.escape(n) for n in archived) + r")(?![\w-])"
        )
        for f in sorted(CMD_DIR.glob("*.md")):
            for i, line in enumerate(f.read_text(encoding="utf-8").splitlines(), 1):
                m = pat.search(line)
                if m:
                    warn(f"退避済みコマンド /{m.group(1)} を参照: "
                         f".claude/commands/{f.name}:{i}（現役コマンドに置き換えるか復帰させる）")

    # .claude/skills/ への重複コピー再作成の検知（コマンドのSSOTは .claude/commands/ のみ。
    # SKILL.md を持つ正規のスキルディレクトリは対象外）
    skills_dir = REPO / ".claude" / "skills"
    if skills_dir.exists():
        for f in sorted(skills_dir.rglob("*.md")):
            if f.name == "SKILL.md" or (f.parent / "SKILL.md").exists():
                continue
            if f.stem in registry:
                warn(f"コマンドの重複コピー: {f.relative_to(REPO)}"
                     f"（SSOTは .claude/commands/{f.stem}.md — コピーは削除する）")

    core = [n for n, t in registry.items() if t == "core"]
    if len(core) > MAX_CORE:
        warn(f"core が {len(core)}本（上限 {MAX_CORE}）: 削減するか COMMAND_POLICY.md を見直す")

    if warnings:
        print(f"\n{len(warnings)}件の警告。運用ルール: docs/ai-org/COMMAND_POLICY.md")
        return 1 if args.strict else 0
    print("OK: 警告なし")
    return 0


if __name__ == "__main__":
    sys.exit(main())
