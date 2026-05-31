# Skill レビューガイド

## レビューチェックリスト

### 基本品質
- [ ] name が命名規則に準拠しているか
- [ ] SKILL.md の必須セクションが全て揃っているか
- [ ] Description が1〜3文で明確か
- [ ] Use Cases が3つ以上あるか
- [ ] Procedure が番号付きリストで書かれているか
- [ ] Examples が1つ以上あるか

### 安全性
- [ ] 薬機法・YMYL・景表法関係の場合、Rules に断定表現禁止が明記されているか
- [ ] risk_level が適切か
- [ ] console_target が適切か（Consoleに載せる必要がないものは none）

### 整合性
- [ ] skills.json に登録されているか
- [ ] 重複するSkillが既にないか（duplicate-report.json確認）

## レビュー後のアクション

問題なし → status を `approved` に変更、version を `1.0.0` に更新

Console移行対象 → `python3 scripts/package-skills.py` でzip化してConsoleへアップロード
