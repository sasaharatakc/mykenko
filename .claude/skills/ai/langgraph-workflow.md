# /langgraph-workflow — LangGraphエージェントワークフロー

## 用途
LangGraphを使ったステートフルなAIエージェントワークフローを設計する。

## 基本構造
```python
from langgraph.graph import StateGraph, END

class AgentState(TypedDict):
    messages: list
    step: str

def research_node(state):
    # リサーチ処理
    return {"messages": [...], "step": "analysis"}

def analysis_node(state):
    # 分析処理
    return {"step": "complete"}

workflow = StateGraph(AgentState)
workflow.add_node("research", research_node)
workflow.add_node("analysis", analysis_node)
workflow.add_edge("research", "analysis")
workflow.add_edge("analysis", END)
app = workflow.compile()
```

## 設計パターン
- **Linear**: A→B→C の直列フロー
- **Conditional**: 条件によって分岐するフロー
- **Loop**: 条件を満たすまで繰り返すフロー
- **Parallel**: 複数ノードを並列実行するフロー
