# Claude Console 移行ガイド

## Claude Code と Claude Console の違い

| 観点 | Claude Code | Claude Console |
|------|-------------|----------------|
| 用途 | ローカル開発・テスト・CLI | 本番運用・組織管理 |
| Agent管理 | `.claude/agents/*.md` ファイル | Managed Agents（GUI管理） |
| Skill管理 | `.claude/skills/` ディレクトリ | Custom Skills Library（zip） |
| バージョン管理 | git | Console内バージョン管理 |
| 権限管理 | ローカルユーザー | 組織・チームレベル |
| 実行環境 | ローカルマシン | クラウドホスト |
| コスト | 개발者のAPIコスト | 組織のConsoleライセンス |

## Managed Agents 化する対象

以下の条件を満たすAgentをConsole Managed Agentsへ移行する：

### 必須条件
- status: approved 以上
- version: 1.0.0 以上
- リスクレベル: high 以下（criticalは原則移行しない）
- 複数人・複数プロジェクトで使用する
- system promptが安定している
- Consoleで管理するメリットがある（チーム共有、アクセス制御など）

### 移行優先リスト

| Agent | カテゴリ | 優先度 | 理由 |
|-------|----------|--------|------|
| mykenko-executive-director | executive | 高 | 全体統括・常用 |
| mykenko-yakuki-reviewer | compliance | 高 | コンプライアンス必須 |
| mykenko-ymyl-reviewer | compliance | 高 | YMYL対応必須 |
| mykenko-keihyo-reviewer | compliance | 高 | 景表法対応必須 |
| mykenko-product-page-writer | content | 高 | 商品ページ頻繁に作成 |
| mykenko-seo-director | seo | 高 | SEO戦略統括 |
| mykenko-compliance-reviewer | compliance | 高 | 全コンテンツに適用 |
| mykenko-dev-architect | development | 中 | 開発設計 |
| mykenko-github-ops-agent | github | 中 | GitHub操作 |
| mykenko-serp-researcher | research | 中 | SERP分析 |

## Custom Skills Library へ入れる対象

以下の条件を満たすSkillをCustom Skills Libraryへ移行する：

### 必須条件
- status: approved 以上
- SKILL.md が完備されている
- 複数AgentやプロジェクトをまたいでReuse可能
- risk_level: high 以下

### 移行優先リスト

| Skill | カテゴリ | 優先度 |
|-------|----------|--------|
| mykenko-yakuki-check | compliance | 最高 |
| mykenko-ymyl-check | compliance | 最高 |
| mykenko-keihyo-check | compliance | 最高 |
| mykenko-fda-risk-check | compliance | 高 |
| mykenko-stealth-marketing-check | compliance | 高 |
| mykenko-product-page-template | content | 高 |
| mykenko-seo-jsonld | seo | 高 |
| mykenko-serp-analysis | seo | 高 |
| mykenko-price-extraction | price-monitoring | 中 |
| mykenko-product-normalization | product-db | 中 |
| mykenko-ingredient-normalization | ingredient-db | 中 |
| mykenko-sns-japanese-localization | sns | 中 |
| mykenko-ad-lp-template | ads | 中 |
| mykenko-affiliate-policy-check | affiliate | 中 |
| mykenko-agent-review | common | 中 |

## Console 移行の手順

### Step 1: 事前準備

```bash
# レジストリの整合性チェック
python3 scripts/validate-registry.py

# 移行対象の一覧確認
python3 scripts/prepare-console-upload.py --dry-run
```

### Step 2: Skill のパッケージ化

```bash
# 全Skillをzip化
python3 scripts/package-skills.py

# 確認
ls dist/skills/
```

### Step 3: Console へのアップロード

**Custom Skills Library（Skill）**
1. Claude Console → Custom Skills → New Skill
2. `dist/skills/{skill-name}.zip` をアップロード
3. バージョン・説明を入力して保存
4. テスト実行

**Managed Agents（Agent）**
1. Claude Console → Managed Agents → New Agent
2. `dist/console-upload/{agent-name}.json` の内容を参考に設定
3. system prompt を入力
4. 使用するSkillを選択（Custom Skills Libraryから）
5. テスト実行

### Step 4: 記録の更新

```json
// manifests/console-map.json を更新
{
  "managed_agents": [
    {
      "local_name": "mykenko-yakuki-reviewer",
      "console_agent_id": "agt_xxxxx",
      "console_version": "1.0.0",
      "status": "published",
      "last_synced_at": "2026-05-31"
    }
  ]
}
```

## 移行前チェックリスト

- [ ] `python3 scripts/validate-registry.py` がエラーなしで通過する
- [ ] status が approved 以上になっている
- [ ] SKILL.md の全必須フィールドが入力されている
- [ ] risk_level が high 以下である
- [ ] APIキー・トークンなどの機密情報が含まれていない
- [ ] 重複するAgentやSkillが Console に既にないことを確認
- [ ] オーナー（take sasa）の承認を得ている

## 移行後チェックリスト

- [ ] Console でAgentが正常に動作する
- [ ] ConsoleでSkillが正常にロードされる
- [ ] エラーメッセージが出ていない
- [ ] 期待通りの出力が得られる
- [ ] `manifests/console-map.json` に console_agent_id/console_skill_id が記録された
- [ ] `CHANGELOG.md` に移行記録を追加した

## ロールバック手順

**Skillのロールバック**
1. Console → Custom Skills → 対象Skill → 以前のバージョンに戻す
2. `console-map.json` の `console_version` を前バージョンに更新

**Managed Agentのロールバック**
1. Console → Managed Agents → 対象Agent → 無効化 または 前バージョンに戻す
2. `console-map.json` の status を更新

**Claude Code側のロールバック**
```bash
# git で前バージョンに戻す（削除は行わない）
git log --oneline agents/{category}/{agent-name}.md
git show {commit-hash}:agents/{category}/{agent-name}.md > /tmp/rollback.md
# 内容を確認してから適用
```

## console-map.json の更新方法

`manifests/console-map.json` は Console 側の状態を追跡する台帳です。
アップロード・更新・削除のたびに必ず手動で更新してください。

```bash
# 更新スクリプト
python3 scripts/generate-console-map.py --agent mykenko-yakuki-reviewer --id agt_xxxxx --version 1.0.0
```
