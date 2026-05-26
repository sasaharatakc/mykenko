# /claude-api-usage — Claude API活用ガイド

## 用途
Anthropic Claude APIを最適に活用する実装パターンを適用する。

## モデル選択指針
| モデル | 用途 |
|------|-----|
| claude-opus-4-7 | 複雑な推論・戦略分析 |
| claude-sonnet-4-6 | 汎用開発・分析（バランス重視） |
| claude-haiku-4-5 | 高速・低コスト・分類タスク |

## プロンプトキャッシング
```python
messages = [{
    "role": "user",
    "content": [
        {"type": "text", "text": long_system_context,
         "cache_control": {"type": "ephemeral"}},  # キャッシュ対象
        {"type": "text", "text": user_query}  # 動的部分
    ]
}]
```
キャッシュヒット時: コスト90%削減・速度向上

## Tool Use (Function Calling)
```python
tools = [{"name": "search_web", "description": "...",
           "input_schema": {"type": "object",
                           "properties": {"query": {"type": "string"}}}}]
response = client.messages.create(model="claude-sonnet-4-6",
                                  tools=tools, messages=messages)
```
