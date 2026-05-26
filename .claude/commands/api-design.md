# /api-design — API設計ガイド

## 用途
RESTful APIを設計する際の標準・規約を定義する。

## URL設計規則
```
GET    /api/v1/products          # 一覧
POST   /api/v1/products          # 作成
GET    /api/v1/products/{id}     # 詳細
PUT    /api/v1/products/{id}     # 全更新
PATCH  /api/v1/products/{id}     # 部分更新
DELETE /api/v1/products/{id}     # 削除

# ネスト
GET    /api/v1/products/{id}/reviews
```

## レスポンス標準
```json
{
  "data": {...},
  "meta": {"total": 100, "page": 1, "per_page": 20},
  "errors": []
}
```

## HTTPステータスコード
| コード | 用途 |
|------|-----|
| 200 | 成功 |
| 201 | 作成成功 |
| 204 | 削除成功（ボディなし）|
| 400 | バリデーションエラー |
| 401 | 未認証 |
| 403 | 認可エラー |
| 404 | 未発見 |
| 422 | 処理できないエンティティ |
| 500 | サーバーエラー |
