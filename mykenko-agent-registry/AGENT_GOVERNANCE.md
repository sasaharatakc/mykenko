# Agent ガバナンスルール

## Agent 命名規則

```
{prefix}-{category}-{function}[-{variant}]
```

### プレフィックス
- `mykenko-` — MYKENKOプロジェクト専用
- プレフィックスなし — 共通利用可能（`common/` カテゴリ）

### 命名例
```
mykenko-yakuki-reviewer         ← MYKENKO専用・薬機法レビュー
mykenko-product-page-writer     ← MYKENKO専用・商品ページ執筆
seo-director                    ← 共通SEOディレクター
compliance-checker              ← 共通コンプライアンスチェッカー
```

### 禁止パターン
- スペース、大文字、アンダースコアは使わない（ハイフン区切り）
- `test-`, `tmp-`, `new-` などの一時的な名前を使わない
- 数字のみのサフィックス（`agent-1`, `agent-2`）は使わない

## Agent カテゴリ

| カテゴリ | 用途 | 例 |
|----------|------|-----|
| executive | 経営・意思決定・全体統括 | kingmaker, ceo-agent |
| seo | 検索エンジン最適化 | seo-director, technical-seo |
| geo | AI検索最適化・GEO | geo-writer, entity-builder |
| llmo | LLM最適化・AI概要対策 | ai-overview-seo |
| research | 調査・情報収集 | google-search-agent, market-research-agent |
| sns | SNS運用 | x-agent, instagram-agent |
| ads | 広告運用 | meta-ads-agent, google-ads-agent |
| content | コンテンツ制作 | copywriter, seo-writer |
| ecommerce | EC戦略・販売 | ecommerce-strategist |
| compliance | 法規制・コンプライアンス | compliance-checker, medical-checker |
| price-monitoring | 価格監視・比較 | mykenko-price-monitor-agent |
| product-db | 商品DB管理 | mykenko-product-db-builder |
| ingredient-db | 成分DB管理 | mykenko-ingredient-db-builder |
| affiliate | アフィリエイト管理 | affiliate-agent |
| agency | 代理店管理 | mykenko-agency-manager |
| sales | 営業・販売 | sales-planner |
| crm | 顧客管理・リテンション | crm-agent, retention-agent |
| automation | 自動化・ワークフロー | automation-agent, workflow-agent |
| data | データ収集・処理 | crawler-agent, normalizer-agent |
| design | デザイン | ui-designer, figma-designer |
| video | 動画制作 | video-designer, video-writer |
| development | 開発・実装 | nextjs-engineer, laravel-engineer |
| devops | インフラ・CI/CD | devops-engineer, deployment-agent |
| github | GitHub操作 | mykenko-github-ops-agent |
| security | セキュリティ | security-engineer |
| finance | 財務・会計 | financial-analyst, cfo-agent |
| common | 汎用・複数プロジェクト共通 | router, editor, translator |
| deprecated | 廃止予定 | — |

## Agent 作成手順

```
1. mykenko-agent-registry/agents/{category}/{agent-name}.md を作成
   └─ templates/agent.template.md をコピーして記入

2. manifests/agents.json に登録
   └─ name, category, scope, skills, tools, risk_level を必ず入力

3. manifests/agent-skill-map.json に使用Skillを登録

4. Claude Code の .claude/agents/ にコピーしてテスト
   └─ bash scripts/copy-to-claude-code.sh {agent-name}

5. レビュー（risk_level: high 以上は第三者レビュー必須）
   └─ docs/HOW_TO_REVIEW_AGENT.md を参照

6. status を approved に変更

7. Console Managed Agentへ反映
   └─ python3 scripts/prepare-console-upload.py

8. manifests/console-map.json にConsole IDとversionを記録
```

## Agent レビュー手順

### レビューチェックリスト
- [ ] name が命名規則に準拠しているか
- [ ] category が適切か
- [ ] risk_level が適切か
- [ ] 必須フィールド（name, category, scope, version, owner）が揃っているか
- [ ] tools に不要な権限（Bash破壊的コマンド）が含まれていないか
- [ ] system prompt に機密情報が含まれていないか
- [ ] 薬機法・YMYL関係の場合、断定的表現がないか
- [ ] 同じ目的のAgentが既に存在しないか（duplicate-report.json確認）
- [ ] skills にリンクされたSkillが実在するか（agent-skill-map.json確認）

### risk_level 別の承認フロー
```
low    → 作成者が自己レビューして承認可
medium → 作成者レビュー後、1名の別メンバーが確認
high   → 作成者レビュー + オーナー(take sasa)の承認必須
critical → 作成者レビュー + オーナー承認 + セキュリティレビュー必須
```

## Agent 廃止手順

```
1. status を deprecated に変更
2. deprecated-report.json に廃止理由・廃止日・後継Agentを記録
3. agents.json の status を deprecated に変更
4. agents/{category}/{agent-name}.md を agents/deprecated/ に移動
   ├─ git mv コマンドを使い、履歴を保持すること
   └─ ファイルは削除しない（アーカイブとして保管）
5. Console に反映済みの場合、Console側でも無効化する
6. console-map.json の status を deprecated に更新
```

## Agent と Skill の紐づけルール

- Agent が使う Skill は `agent-skill-map.json` に明示的に登録する
- Skill なしで動く Agent も `skills: []` として明記する
- 紐づける Skill は必ず `skills.json` に登録済みであること
- Console Managed Agent に反映する際は、紐づいた Skill も Custom Skills Library に登録済みであること

## Agent の権限管理

### tools の許可基準

```
Read, Grep, Glob          → 常に許可
WebSearch, WebFetch        → research/seo/geo系は許可
Write, Edit               → content/development系は許可（慎重に）
Bash(安全なコマンド)       → automation/devops系は許可
Bash(破壊的コマンド)       → 原則禁止。Critical承認のみ
Agent（サブエージェント起動）→ executive/router系のみ許可
```

### 危険な権限の扱い

以下の権限を持つ Agent は `risk_level: critical` に設定し、
system prompt に「実行前にユーザー確認を求めること」を明記する：

- `Bash(rm *)`, `Bash(git reset *)`, `Bash(git push --force *)`
- 本番DBへの直接接続
- APIキー・認証情報の操作
- 決済・個人情報の処理
- 医療・法的判断を含む出力
