# 命名規則

## 全般ルール

- **小文字ハイフン区切り**（kebab-case）を使う
- スペース・アンダースコア・大文字は使わない
- 具体的で意味のある名前にする
- 省略語は一般的なものだけ使う（seo, crm, sns, db など）

## Agent 命名規則

```
[mykenko-]{category}-{function}[-{variant}]
```

| 要素 | 説明 | 例 |
|------|------|----|
| `mykenko-` | MYKENKO専用の場合のみ付ける | `mykenko-yakuki-reviewer` |
| `{category}` | 機能カテゴリ | `seo`, `compliance`, `content` |
| `{function}` | 主な機能・役割 | `reviewer`, `writer`, `analyzer` |
| `{variant}` | バリアント（省略可）| `v2`, `strict`, `lite` |

### 推奨サフィックス

| サフィックス | 意味 |
|-------------|------|
| `-agent` | 汎用エージェント |
| `-reviewer` | レビュー・チェック特化 |
| `-writer` | 文章生成特化 |
| `-analyzer` | 分析特化 |
| `-director` | 戦略・統括 |
| `-builder` | 構築・生成 |
| `-monitor` | 監視・観測 |
| `-manager` | 管理・調整 |
| `-architect` | 設計・アーキテクチャ |
| `-engineer` | 実装・開発 |

## Skill 命名規則

```
[mykenko-]{category}-{function}[-{variant}]
```

Agent と同じルール。ただし Skill のほうがより「動詞的」な名前を推奨：

```
mykenko-yakuki-check    ← "チェックする"動詞
mykenko-seo-jsonld      ← "JSON-LDを生成する"
mykenko-serp-analysis   ← "SERP分析"
```

## Command 命名規則

Commands はスラッシュコマンド（`/command-name`）として使われる。

```
{action}-{target}[-{variant}]
```

| 要素 | 説明 | 例 |
|------|------|----|
| `{action}` | 実行アクション | `audit`, `check`, `analyze`, `generate` |
| `{target}` | 対象 | `seo`, `yakuki`, `content` |
| `{variant}` | バリアント（省略可） | `deep`, `quick`, `full` |

## ファイル命名規則

```
agents/{category}/{agent-name}.md
skills/{category}/{skill-name}/SKILL.md
commands/{scope}/{command-name}.md
```

- Agent定義ファイル: `{agent-name}.md`
- Skill定義ファイル: `SKILL.md`（ディレクトリ名がSkill名）
- Command定義ファイル: `{command-name}.md`

## バージョン命名規則

セマンティックバージョニング（SemVer）に準拠：

```
MAJOR.MINOR.PATCH

例:
0.1.0  ← 初稿（draft）
0.2.0  ← レビュー後修正
1.0.0  ← 本番投入（approved/published）
1.1.0  ← 小改善・追記
2.0.0  ← 大幅変更
```

## カテゴリ別命名の推奨パターン

### compliance（コンプライアンス）
```
mykenko-yakuki-check          薬機法チェック
mykenko-ymyl-check            YMYL チェック
mykenko-keihyo-check          景表法チェック
mykenko-fda-risk-check        FDA リスクチェック
mykenko-stealth-marketing-check ステルスマーケティングチェック
```

### content（コンテンツ）
```
mykenko-product-page-template  商品ページテンプレート
mykenko-category-page-template カテゴリページテンプレート
mykenko-ingredient-page-template 成分ページテンプレート
```

### seo（SEO）
```
mykenko-seo-jsonld             JSON-LD構造化データ
mykenko-internal-link-design   内部リンク設計
mykenko-serp-analysis          SERP分析
```

### data（データ）
```
mykenko-price-extraction       価格抽出
mykenko-product-normalization  商品DB正規化
mykenko-ingredient-normalization 成分DB正規化
```
