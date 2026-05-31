# Agent レビューガイド

## レビューの目的

- 品質・安全性・命名規則の確認
- 重複の検出と統合
- Console移行前の最終チェック

## レビューチェックリスト

### 基本品質
- [ ] name が命名規則（NAMING_RULES.md）に準拠しているか
- [ ] category が適切か（AGENT_GOVERNANCE.mdのカテゴリ表を参照）
- [ ] risk_level が適切か（SECURITY_RULES.mdの分類基準を参照）
- [ ] frontmatter の必須フィールドが揃っているか
- [ ] system prompt が日本語で明確に書かれているか

### 安全性
- [ ] tools に不要な破壊的権限が含まれていないか
- [ ] system prompt に機密情報（APIキー等）が含まれていないか
- [ ] 薬機法・YMYL・景表法関係の場合、断定的表現がないか
- [ ] risk_level: high 以上の場合、Rules に「実行前にユーザー確認」の記載があるか

### 機能・整合性
- [ ] skills に紐づくSkillが skills.json に存在するか
- [ ] agent-skill-map.json に登録されているか
- [ ] When to use が具体的で明確か
- [ ] Example Prompts が2つ以上あるか

### 重複チェック
- [ ] duplicate-report.json に類似Agentが報告されていないか
- [ ] CLAUDE.mdのCrew構成に同目的のAgentが既にないか

## レビュー後のアクション

問題なし → status を `testing` → テスト後 `approved` に変更

問題あり → 作成者にフィードバック → 修正後に再レビュー

## risk_level 別の承認者

| risk_level | 承認者 |
|-----------|--------|
| low | 作成者自身 |
| medium | 作成者 + 別メンバー1名 |
| high | 作成者 + オーナー（take sasa） |
| critical | 作成者 + オーナー + セキュリティレビュー |
