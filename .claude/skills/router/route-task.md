# /route-task — タスクルーティング

## 用途
ユーザーの依頼を解析し、最適なAgent・Crewを選定してワークフローを生成する。

## 実行ステップ
1. 依頼の種類を分類する（開発/SEO/マーケティング/分析/戦略）
2. 必要なAgentをリストアップする
3. 並列実行できるタスクを特定する
4. 実行順序と依存関係を整理する
5. ワークフロー概要をユーザーに提示する

## Crew選定基準
| 依頼の種類 | 優先Crew |
|---------|--------|
| コード実装・バグ修正 | Development Crew |
| SEO・コンテンツ | SEO Crew + Content Crew |
| 広告・集客 | Marketing Crew |
| 市場調査・競合分析 | Research Crew |
| 価格・売上戦略 | Ecommerce Crew + Strategy Crew |
| デザイン | Design Crew |
| 法令・品質 | Compliance Crew + Quality Crew |

## 出力形式
```
## ワークフロー
1. [Agent名] → [タスク内容]
2. [Agent名] → [タスク内容] ← [1]に依存
並列: [Agent名A] + [Agent名B]
```
