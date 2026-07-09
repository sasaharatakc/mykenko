# アーカイブ済みコマンド（退避候補）

このディレクトリのコマンド定義は **Claude Code に読み込まれない**（スキル一覧への毎セッション注入を削減するため `.claude/commands/` から退避）。定義本体は無傷で保存されており、いつでも復帰できる。

- 退避理由・統合先: `docs/ai-org/COMMAND_REGISTRY.md` の archive-candidate 表を参照
- **復帰手順**: ファイルを `.claude/commands/` に `git mv` で戻し、COMMAND_REGISTRY.md の tier を optional/core に変更して同じPRでコミット
- **完全削除**: 人間の承認を得た上でファイル削除 + Registry から行を削除（`COMMAND_POLICY.md` の削除基準に従う）
- 注意: `.claude/skills/<カテゴリ>/` に同一内容のコピーが残っている場合があるが、SKILL.md がないため読み込まれない（二重管理の解消は別途人間判断）
