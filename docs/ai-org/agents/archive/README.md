# アーカイブ済みエージェント（退避候補）

このディレクトリのエージェント定義は **Claude Code に読み込まれない**（セッション毎のトークン注入を削減するため `.claude/agents/` から退避）。定義本体は無傷で保存されており、いつでも復帰できる。

- 退避理由・統合先: `docs/ai-org/AGENT_REGISTRY.md` の archive-candidate 表を参照
- **復帰手順**: ファイルを `.claude/agents/` に `git mv` で戻し、AGENT_REGISTRY.md の tier を optional/core に変更して同じPRでコミット
- **完全削除**: 人間の承認を得た上でファイル削除 + Registry から行を削除（`AGENT_POLICY.md` の削除基準に従う）
