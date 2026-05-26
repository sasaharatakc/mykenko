# /rag-workflow — RAG（検索拡張生成）実装フロー

## 用途
社内ドキュメント・ナレッジベースをLLMと組み合わせたRAGシステムを構築する。

## RAGアーキテクチャ
```
ドキュメント → テキスト分割 → Embedding生成 → Qdrant保存
クエリ → Embedding生成 → Qdrant検索 → コンテキスト取得 → LLM生成
```

## 実装ステップ
1. **ドキュメント準備**: PDF/Markdown/HTMLを読み込む
2. **チャンキング**: 500〜1000トークンで分割する
3. **Embedding**: text-embedding-3-small/claude-embedding で変換する
4. **Vector Store**: Qdrantに保存する
5. **検索**: コサイン類似度でTop-K件取得する
6. **生成**: コンテキストをLLMに渡して回答を生成する

## 検索精度向上
- ハイブリッド検索（Vector + BM25キーワード）
- Re-ranking（Cross-Encoderで再ランク）
- Query Expansion（クエリを複数バリエーションに展開）
