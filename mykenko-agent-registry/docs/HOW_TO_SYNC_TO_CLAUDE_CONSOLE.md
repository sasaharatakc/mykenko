# Claude Console への同期ガイド

## 前提条件

- `status: approved` 以上のAgent/Skillのみ
- `risk_level: critical` のAgent/Skillは移行しない
- オーナー（take sasa）の承認済み

## 同期フロー

```
GitHub (正本)
  ↓
python3 scripts/package-skills.py   ← Skillのzip化
  ↓
python3 scripts/prepare-console-upload.py  ← アップロード対象の抽出
  ↓
Claude Console でアップロード（手動）
  ↓
python3 scripts/generate-console-map.py  ← IDの記録
  ↓
manifests/console-map.json に反映
```

## Skill の同期手順

```bash
# 1. zip化
python3 scripts/package-skills.py --skill mykenko-yakuki-check

# 2. アップロード対象確認
python3 scripts/prepare-console-upload.py --dry-run

# 3. 実際にアップロード準備
python3 scripts/prepare-console-upload.py

# 4. Claude Console でアップロード
# → Custom Skills → New Skill → dist/skills/mykenko-yakuki-check.zip

# 5. IDを記録
python3 scripts/generate-console-map.py \
  --skill mykenko-yakuki-check \
  --id skl_xxxxx \
  --version 1.0.0
```

## Agent の同期手順

```bash
# 1. アップロード用JSON生成
python3 scripts/prepare-console-upload.py

# 2. Claude Console でManaged Agent作成
# → Managed Agents → New Agent
# → dist/console-upload/managed-agents/mykenko-yakuki-reviewer.json を参考に設定

# 3. IDを記録
python3 scripts/generate-console-map.py \
  --agent mykenko-yakuki-reviewer \
  --id agt_xxxxx \
  --version 1.0.0
```

## 状態確認

```bash
python3 scripts/generate-console-map.py --list
```

## 注意事項

- Console IDは `manifests/console-map.json` に必ず記録すること
- アップロード後に動作確認を行ってからCHANGELOG.mdに記録すること
- Console側でSkillを削除した場合、`status: deprecated` に変更すること
