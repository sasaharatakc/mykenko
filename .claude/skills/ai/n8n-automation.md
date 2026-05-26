# /n8n-automation — n8n自動化ワークフロー

## 用途
n8nを使ってノーコード/ローコードで業務プロセスを自動化する。

## n8n 主要ノード
| ノード | 用途 |
|------|-----|
| HTTP Request | 任意のAPI呼び出し |
| Webhook | 外部からのトリガー受信 |
| Gmail/Outlook | メール送受信 |
| Google Sheets | スプレッドシート操作 |
| Slack | チャット通知 |
| Code | JavaScript/Pythonコード実行 |
| Set | データ変換・整形 |
| IF | 条件分岐 |

## よく使う自動化パターン
- 新規注文通知: Webhook → Slack通知 → Google Sheets記録
- レポート自動送信: Schedule → DB取得 → CSV生成 → メール送信
- SNS自動投稿: Schedule → コンテンツ生成 → SNS投稿
