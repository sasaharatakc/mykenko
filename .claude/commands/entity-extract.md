# /entity-extract — エンティティ抽出・最適化

## 用途
MYKENKOをGoogleの知識グラフでエンティティとして認識させるための情報整備を行う。

## エンティティ確立の要素
1. **ブランド名の一貫性** — 全サイト・SNS・外部メンションで同一のブランド名を使用
2. **About ページの整備** — 会社情報・創業年・所在地・ミッションを明記
3. **Wikipedia / Wikidata** — 該当する場合はエントリー作成
4. **Googleビジネスプロフィール** — 正確な情報を登録・維持
5. **権威サイトからのメンション** — ニュースサイト・業界メディアでの掲載

## 構造化データ（Organization）
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "MYKENKO",
  "url": "https://mykenko.com",
  "logo": "https://mykenko.com/logo.png",
  "description": "MYKENKOの説明",
  "sameAs": [
    "https://twitter.com/mykenko",
    "https://instagram.com/mykenko"
  ]
}
```
