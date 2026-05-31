# AI-OS Foundation 設計書

**作成日**: 2026-05-31  
**バージョン**: 1.0.0  
**ステータス**: 導入準備完了

---

## 概要

MYKENKO・AITrackの既存環境を破壊せずに、Claude Code・Codex・Ollamaを中心としたAI開発OSを構築する設計。  
すべてのツールは `~/AI-OS/` 配下に隔離。

---

## ディレクトリ構成

```
~/AI-OS/
├── repositories/                     # OSSリポジトリ（cloneのみ）
│   ├── Understand-Anything/          # コードグラフ化（49MB）✅
│   ├── langfuse/                     # LLM監視（47MB）✅
│   ├── mem0/                         # 長期記憶（50MB）✅
│   ├── graphrag/                     # グラフRAG（32MB）✅
│   ├── MoneyPrinterTurbo/            # 動画生成（335MB）✅
│   └── anthropic-skills/             # 公式プラグイン（8.4MB）✅
├── skills/                           # カスタムスキルファイル
├── rag/                              # RAGインデックス・設定
├── monitoring/                       # Langfuse設定
├── video/                            # 動画生成作業ディレクトリ
├── docs/                             # ドキュメント
└── reports/
    └── repository-analysis.md       # OSS調査レポート
```

---

## 統合アーキテクチャ

```
Claude Code / Codex / Ollama
         │
         ▼
 Understand-Anything     ← コードベース知識グラフ（47k⭐）
         │
         ▼
      GraphRAG            ← ドキュメント→ナレッジグラフ（33k⭐）
         │
    ┌────┴────┐
    ▼         ▼
  Neo4j    Qdrant         ← グラフDB / ベクターDB
    │         │
    └────┬────┘
         ▼
        Mem0              ← 長期記憶レイヤー（57k⭐）
         │
         ▼
   Skills / Plugins       ← Anthropic Skills（29k⭐）
         │
         ▼
    Code Review           ← 品質ゲート
         │
         ▼
      GitHub              ← SSOT

横断監視: Langfuse（28k⭐）← 全LLMコールをトレース
デザイン強化: taste-skill ← UIデザイン品質
動画生成: MoneyPrinterTurbo（74k⭐）← SNS動画自動生成
```

---

## OSS一覧

| # | ツール | GitHub | Stars | ライセンス | 状態 |
|---|-------|--------|-------|-----------|------|
| 1 | Understand-Anything | [Lum1104/Understand-Anything](https://github.com/Lum1104/Understand-Anything) | 47k | MIT | ✅ Clone済 |
| 2 | CodeGraph | Understand-Anythingで代替 | - | - | ✅ 代替採用 |
| 3 | Langfuse | [langfuse/langfuse](https://github.com/langfuse/langfuse) | 28k | MIT(EE除く) | ✅ Clone済 |
| 4 | Mem0 | [mem0ai/mem0](https://github.com/mem0ai/mem0) | 57k | Apache 2.0 | ✅ Clone済 |
| 5 | GraphRAG | [microsoft/graphrag](https://github.com/microsoft/graphrag) | 33k | MIT | ✅ Clone済 |
| 6 | taste-skill | コミュニティパターン（複数実装） | - | MIT | 手動設定 |
| 7 | Anthropic Skills | [anthropics/claude-plugins-official](https://github.com/anthropics/claude-plugins-official) | 29k | Apache 2.0 | ✅ Clone済 |
| 8 | Knowledge Work Plugins | Anthropic Skillsに統合 | - | - | ✅ 含む |
| 9 | MoneyPrinterTurbo | [harry0703/MoneyPrinterTurbo](https://github.com/harry0703/MoneyPrinterTurbo) | 74k | MIT | ✅ Clone済 |

---

## 導入優先順位

| 優先度 | ツール | アクション |
|--------|-------|----------|
| 🔴 S | Understand-Anything | `npx understand-anything@latest install` |
| 🔴 S | Anthropic Skills | `claude plugin install code-review` |
| 🟠 A | Mem0 + Qdrant | Docker + pip install (venv) |
| 🟠 A | Langfuse | Docker Compose（ポート調整要） |
| 🟡 B | GraphRAG | pip install + インデックス構築 |
| 🟡 B | MoneyPrinterTurbo | uv sync (venv) |
| 🟢 C | taste-skill | CLAUDE.mdに手動追記 |

---

## Apple Silicon対応状況

| ツール | Apple M対応 | 備考 |
|-------|-----------|------|
| Understand-Anything | ✅ | Node.js/npxベース |
| Langfuse | ✅ | Docker Desktop ARM |
| Mem0 | ✅ | Python pip |
| GraphRAG | ✅ | Python pip、API依存 |
| MoneyPrinterTurbo | ✅ | uv sync推奨 |
| Anthropic Skills | ✅ | ファイルのみ |
| taste-skill | ✅ | ファイルのみ |

---

## Claude Code連携方法

### 1. Understand-Anything（即時利用可）
```bash
npx understand-anything@latest install
```
MYKENKOルートで実行するとClaude Code Pluginとして自動登録。以後のセッションでコードグラフを自動参照。

### 2. Anthropic Skills プラグイン
```bash
# コードレビュー
claude plugin install code-review

# 機能開発ガイド
claude plugin install feature-dev

# フロントエンドデザイン品質
claude plugin install frontend-design
```

### 3. taste-skill（CLAUDE.md追記）
`CLAUDE.md`の末尾に追記：
```markdown
## Design Quality Standards
UI/UXコンポーネント生成時は以下を適用：
- タイポグラフィ: font-size 16px最小、line-height 1.5以上
- スペーシング: 8px グリッド系
- カラー: アクセシビリティ AA以上（コントラスト比4.5:1）
- アニメーション: 200-300ms、ease-out
```

---

## Codex連携方法

### Understand-Anything
Codex対応はREADMEの `#codex` セクション参照。`codex.md`に以下を追加：
```markdown
## Knowledge Graph
This project uses Understand-Anything for codebase visualization.
Run: npx understand-anything@latest query "..."
```

### GraphRAG + Mem0
Codex実行環境にて：
```python
# MemoryManager初期化
from mem0 import Memory
memory = Memory.from_config({...})
# 過去のコンテキストを注入
context = memory.search("MYKENKO architecture decisions")
```

---

## Ollama連携方法

### Mem0 with Ollama
```python
config = {
    "llm": {
        "provider": "ollama",
        "config": {
            "model": "llama3.2",
            "ollama_base_url": "http://localhost:11434"
        }
    },
    "vector_store": {
        "provider": "qdrant",
        "config": {"host": "localhost", "port": 6333}
    }
}
memory = Memory.from_config(config)
```

### GraphRAG with Ollama
```yaml
# graphrag/settings.yaml
llm:
  model: llama3.1
  api_base: http://localhost:11434/v1
  api_key: ollama
```

### MoneyPrinterTurbo with Ollama
設定画面からOllamaをLLMプロバイダーとして選択可能（v1.2以降）。

---

## 注意事項・絶対禁止事項

- 既存MYKENKO/AITrackプロジェクトの変更禁止
- 既存GitHub設定の変更禁止
- 既存.envファイルの変更禁止
- 既存DBへのアクセス禁止
- 既存Docker環境の変更禁止（Langfuse用は別docker-compose.yml）
- sudo実行禁止
- 削除系コマンド禁止
- 強制上書き禁止

---

## ロールバック

```bash
# AI-OS環境の完全削除（既存プロジェクトに影響なし）
rm -rf ~/AI-OS/

# インストール済みClaude Codeプラグインの削除
claude plugin uninstall code-review
claude plugin uninstall feature-dev
claude plugin uninstall understand-anything
```

---

## 参考リソース

- [OSS調査レポート](./../../AI-OS/reports/repository-analysis.md) - 詳細なリポジトリ分析
- [AI-OS-MANIFEST](./../../AI-OS/AI-OS-MANIFEST.md) - 統合マニフェスト
- [Claude Code Plugin Docs](https://code.claude.com/docs/en/plugins-reference)
