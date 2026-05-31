# セキュリティルール

## 絶対禁止事項

- APIキー・シークレット・トークン・パスワードをこのリポジトリに含めない
- 個人情報（氏名・メール・電話・住所）をこのリポジトリに含めない
- 本番DBの接続情報・認証情報をこのリポジトリに含めない
- `.env` ファイル、`credentials.json` などをコミットしない

## リスクレベル分類

| レベル | 内容 | 例 |
|--------|------|-----|
| `low` | 通常の文章作成・整理・一般SEO補助 | copywriter, seo-writer |
| `medium` | GitHub・コード編集・DB設計・SNS・広告LP | laravel-engineer, meta-ads-agent |
| `high` | 薬機法・YMYL・景表法・医薬品・FDA・価格監視・スクレイピング | mykenko-yakuki-reviewer, scraping-agent |
| `critical` | APIキー認証・決済・個人情報・医療判断・法的判断・破壊的コマンド | security-engineer（本番操作時） |

## tools 権限の安全基準

### 常に許可
```
Read, Grep, Glob
```

### 目的に応じて許可
```
WebSearch, WebFetch    → research/seo/geo系Agent
Write, Edit           → content/development系Agent
Bash(安全なコマンド)  → automation/devops系Agent
Agent(サブエージェント起動) → executive/router系Agent
```

### 条件付き許可（risk_level: high必須、承認フロー必須）
```
Bash(git push *)      → github-ops系のみ
Bash(curl *)          → 明示的な必要性がある場合のみ
```

### 原則禁止（risk_level: criticalで承認済みの場合のみ）
```
Bash(rm -rf *)
Bash(git reset --hard *)
Bash(git push --force *)
Bash(DROP TABLE *)
Bash(DELETE FROM * WHERE *)
```

## Agent system prompt のセキュリティ要件

### 必ず含めること
```
- 機密情報・認証情報・APIキーは表示しない
- 実行前にユーザーに確認を求める（risk_level: high以上）
- 医療・薬機法・法的判断は断定的表現を避ける
- 不明点は推測せず、リスクとして明記する
```

### 含めてはいけないこと
```
- 本番のAPIキー・トークン・パスワード
- 接続文字列（DATABASE_URL等）
- ユーザーの個人情報
- 他社の機密情報
```

## Skill SKILL.md のセキュリティ要件

- `# Rules` セクションに必ず以下を含める：
  ```
  - 機密情報を出力しない
  - 薬機法・景表法・YMYL関連では断定表現を使わない（該当する場合）
  ```

## コンプライアンス対応

### 薬機法（薬事法）
- 医薬品・医療機器・化粧品の効能・効果を断定的に表現しない
- 「治る」「治療する」「病気が治る」などの表現を使わない
- 未承認の成分・製品について誇大表現をしない
- 対象Agent/Skill: `compliance/` カテゴリ全体、`content/` カテゴリの一部

### 景品表示法
- 根拠のない「No.1」「最安」「最高品質」などの表現を使わない
- 比較広告は根拠データが揃っている場合のみ
- 誇大な割引表示を避ける
- 対象Agent/Skill: `ads/`, `content/`, `ecommerce/` カテゴリ

### YMYL（Your Money Your Life）
- 医療・健康・金融・法律の判断を行う場合は専門家への確認を促す
- 検索エンジン品質評価に影響する領域で不正確な情報を提供しない
- 対象Agent/Skill: `compliance/` カテゴリ全体

### FDA（米国食品医薬品局）
- 米国向け商品の場合、FDA規制に準拠した表現を使う
- 「FDA承認」を根拠なく使わない
- 対象Agent/Skill: `mykenko-fda-risk-check`

## セキュリティレビューの頻度

| 対象 | レビュー頻度 |
|------|-------------|
| risk_level: critical のAgent/Skill | 変更のたびに必須 |
| risk_level: high のAgent/Skill | 月次レビュー |
| risk_level: medium | 四半期レビュー |
| risk_level: low | 半年ごとレビュー |
