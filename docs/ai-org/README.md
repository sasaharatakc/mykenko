# docs/ai-org — AI運用ドキュメントの導線

| ファイル | 内容 | 読むタイミング |
|---|---|---|
| `AGENT_REGISTRY.md` | エージェント台帳（SSOT・tier管理） | エージェント起動・追加・整理時 |
| `AGENT_POLICY.md` | エージェント管理ルール | エージェント追加・削除時 |
| `COMMAND_REGISTRY.md` | スラッシュコマンド台帳（SSOT・tier管理） | コマンド追加・整理時 |
| `COMMAND_POLICY.md` | コマンド管理ルール | コマンド追加・削除時 |
| `ORGANIZATION.md` | 組織全体像（Crew/スキル/MCP/Memory） | 組織再設計時のみ |
| `agents/archive/` | 退避済みエージェント（読み込まれない） | 復帰検討時 |
| `commands/archive/` | 退避済みコマンド（読み込まれない） | 復帰検討時 |

検証: `bash tools/validate_all.sh`（両台帳を `--strict` でチェック）
