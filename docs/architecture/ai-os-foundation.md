# AI-OS Foundation — 完了報告書

**作成日**: 2026-05-31  
**バージョン**: 1.0.0  
**対象環境**: macOS Apple Silicon（ローカル）

---

## AI-OS 構成図

```
┌─────────────────────────────────────────────────────────────────┐
│                        入力レイヤー                               │
│                                                                   │
│   Claude Code ────── Codex ────── Ollama (llama3.2 / mistral)  │
│       │                 │              │                         │
└───────┼─────────────────┼──────────────┼─────────────────────────┘
        │                 │              │
        └─────────┬────────┘              │
                  ▼                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                      理解レイヤー                                  │
│                                                                   │
│  ┌─────────────────────────┐  ┌───────────────────────────────┐ │
│  │  Understand-Anything    │  │  GraphRAG (Microsoft)         │ │
│  │  コードベース知識グラフ   │  │  ドキュメント→ナレッジグラフ   │ │
│  │  47k⭐ MIT              │  │  33k⭐ MIT, Python>=3.11      │ │
│  └─────────────────────────┘  └───────────────────────────────┘ │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                     ストレージレイヤー                             │
│                                                                   │
│       Neo4j ────────────────────── Qdrant                       │
│    (グラフDB・関係性)           (ベクターDB・意味検索)            │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                       記憶レイヤー                                │
│                                                                   │
│              Mem0 (57k⭐ Apache 2.0, Python>=3.10)              │
│              長期記憶 + Qdrant ネイティブ統合                     │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      スキルレイヤー                               │
│                                                                   │
│  ┌──────────────────────┐  ┌─────────────┐  ┌───────────────┐  │
│  │ Anthropic Skills     │  │ Knowledge   │  │ taste-skill   │  │
│  │ claude-plugins-      │  │ Work        │  │ UIデザイン     │  │
│  │ official 29k⭐       │  │ Plugins     │  │ 品質スキル     │  │
│  └──────────────────────┘  └─────────────┘  └───────────────┘  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                     レビューレイヤー                               │
│                                                                   │
│         Review Mesh (MYKENKO 153エージェント Review Crew)         │
│    code-review ✅ feature-dev ✅ compliance-checker ✅           │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      出力レイヤー                                  │
│                                                                   │
│       GitHub SSOT ──────── SNS動画 (MoneyPrinterTurbo 74k⭐)   │
└─────────────────────────────────────────────────────────────────┘

━━━━━━━━━━━━━━━━ 横断監視 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Langfuse (28k⭐) — 全LLMコール・トレース・コスト・評価を一元管理
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## ディレクトリ構成

```
~/AI-OS/                              ← AI-OS ルート（既存プロジェクトと完全分離）
├── repositories/                     ← OSSリポジトリ（clone のみ、インストールなし）
│   ├── Understand-Anything/          ← コードグラフ化 (47k⭐, 49MB) ✅
│   ├── langfuse/                     ← LLM監視基盤 (28k⭐, 47MB) ✅
│   ├── mem0/                         ← 長期記憶 (57k⭐, 50MB) ✅
│   ├── graphrag/                     ← グラフRAG (33k⭐, 32MB) ✅
│   ├── MoneyPrinterTurbo/            ← 動画自動生成 (74k⭐, 335MB) ✅
│   └── anthropic-skills/             ← 公式プラグイン (29k⭐, 8.4MB) ✅
├── skills/                           ← カスタムスキルファイル置き場
│   └── taste-skill/                  ← UIデザイン品質 SKILL.md（手動追加）
├── rag/                              ← RAGインデックス・設定ファイル
│   ├── graphrag-settings.yml         ← GraphRAG設定テンプレート
│   └── mem0-config.py                ← Mem0+Qdrant設定テンプレート
├── monitoring/                       ← Langfuse設定
│   └── docker-compose.override.yml  ← MYKENKOと分離したDocker設定
├── video/                            ← 動画生成作業ディレクトリ
├── docs/                             ← AI-OS技術文書
└── reports/
    └── repository-analysis.md       ← OSS調査レポート ✅

~/mykenko/                            ← 既存プロジェクト（変更なし）
~/AITrack/                            ← 既存プロジェクト（変更なし）
```

---

## OSS一覧

| # | ツール | GitHub URL | Stars | ライセンス | Clone |
|---|-------|-----------|-------|-----------|-------|
| 1 | **Understand-Anything** | [Lum1104/Understand-Anything](https://github.com/Lum1104/Understand-Anything) | 47k | MIT | ✅ |
| 2 | CodeGraph | Understand-Anythingで代替 | - | - | 代替 |
| 3 | **Langfuse** | [langfuse/langfuse](https://github.com/langfuse/langfuse) | 28k | MIT(EE除く) | ✅ |
| 4 | **Mem0** | [mem0ai/mem0](https://github.com/mem0ai/mem0) | 57k | Apache 2.0 | ✅ |
| 5 | **GraphRAG** | [microsoft/graphrag](https://github.com/microsoft/graphrag) | 33k | MIT | ✅ |
| 6 | taste-skill | コミュニティパターン（複数実装存在） | - | MIT | 手動 |
| 7 | **Anthropic Skills** | [anthropics/claude-plugins-official](https://github.com/anthropics/claude-plugins-official) | 29k | Apache 2.0 | ✅ |
| 8 | Knowledge Work Plugins | Anthropic Skillsに統合済み | - | - | ✅含む |
| 9 | **MoneyPrinterTurbo** | [harry0703/MoneyPrinterTurbo](https://github.com/harry0703/MoneyPrinterTurbo) | 74k | MIT | ✅ |

**合計クローンサイズ**: 521MB（`~/AI-OS/repositories/`）

---

## 導入優先順位

| 優先度 | ツール | 理由 | 工数 |
|--------|-------|------|------|
| 🔴 **S** | Anthropic Skills（code-review, feature-dev） | `claude plugin install`で**即時利用可能** ✅済み | 0分 |
| 🔴 **S** | Understand-Anything | コードグラフ化→全エージェントの理解力UP | 10分 |
| 🟠 **A** | Langfuse | LLM監視の基盤。Dockerで独立稼働 | 30分 |
| 🟠 **A** | Mem0 + Qdrant | 長期記憶でエージェント品質向上 | 1時間 |
| 🟡 **B** | GraphRAG | Neo4j連携で知識グラフ高度化 | 2-3時間 |
| 🟡 **B** | MoneyPrinterTurbo | SNS動画自動生成（独立稼働） | 1時間 |
| 🟢 **C** | taste-skill | CLAUDE.mdへの手動追記のみ | 15分 |

---

## Apple Silicon 対応状況

| ツール | Apple M対応 | 動作確認 | 備考 |
|-------|-----------|---------|------|
| Understand-Anything | ✅ | macOS対応 | Node.js v22+、npxベース |
| Langfuse | ✅ | Docker Desktop ARM | PostgreSQL+ClickHouse+Redis |
| Mem0 | ✅ | macOS pip動作確認済み | Python>=3.10 |
| GraphRAG | ✅ | pip動作確認済み | Python>=3.11、API依存のため軽量 |
| MoneyPrinterTurbo | ✅ | uv sync推奨 | GPU版はDockerで対応 |
| Anthropic Skills | ✅ | ファイルのみ | 環境依存なし |
| taste-skill | ✅ | ファイルのみ | 環境依存なし |

---

## 推奨スペック

| 構成 | 最小 | 推奨 | 理想 |
|-----|------|------|------|
| RAM | 8GB | 16GB | 32GB+ |
| ストレージ | 20GB空き | 50GB空き | 100GB空き |
| CPU | M1 | M2 | M3 Pro/Max |
| GPU（統合） | 不要 | 16GB | 36GB以上 |

**メモリ消費の高いツール**:
- Langfuse（Dockerスタック）: 4-8GB
- MoneyPrinterTurbo（動画処理）: 8GB+
- Mem0 + Qdrant: 2-4GB
- GraphRAG（インデックス構築時）: 4-8GB

---

## Claude Code 連携方法

### 1. Anthropic Skills プラグイン（CLI、✅ 導入済み）

```bash
# 以下はすでに成功済み
claude plugin install code-review      # ✅ 完了
claude plugin install feature-dev      # ✅ 完了

# 追加で導入可能なプラグイン
claude plugin install frontend-design
claude plugin install agent-sdk-dev
```

利用方法（Claude Codeセッション内）:
```
/code-review          # コードレビュー実行
/feature-dev          # 機能開発ガイド
```

---

### 2. Understand-Anything

#### 方法A: デスクトップアプリ最新版（/plugin対応版）
```
/plugin marketplace add Lum1104/Understand-Anything
/plugin install understand-anything
```
**現在のCLIバージョンでは未対応** → バージョンアップ後に利用可能

#### 方法B: CLAUDE.md 手動組み込み（CLIで即時利用可能）

`~/.claude/CLAUDE.md` または `~/mykenko/CLAUDE.md` に追記:

```markdown
## コードグラフ理解

このプロジェクトの構造を調査する際は以下を参照:
- `frontend/` : Next.js 14 App Router構成
- `backend/` : Laravel 11 + Sanctum
- 依存関係: `package.json`, `composer.json`

コードを理解する前に必ず各ディレクトリのREADMEと主要ファイルを確認すること。
```

#### 方法C: install.sh（Codex向け）
```bash
curl -fsSL https://raw.githubusercontent.com/Lum1104/Understand-Anything/main/install.sh | bash -s codex
```

---

### 3. taste-skill（CLAUDE.mdに追記）

`~/mykenko/CLAUDE.md` の末尾に追加:

```markdown
## UIデザイン品質基準（taste-skill）

フロントエンドコンポーネント生成時は以下を必ず適用:
- タイポグラフィ: font-size最小16px、line-height 1.5以上、font-weightは400/500/700の3段階
- スペーシング: 8pxグリッド（4/8/12/16/24/32/48/64px）
- カラー: WCAG AA準拠（コントラスト比4.5:1以上）
- アニメーション: duration 150-300ms、ease-out または spring
- コンポーネント: 汎用的・退屈なデザインを避け、ブランドに沿った一貫性を持たせる
- アンチパターン回避: グレーの四角形、デフォルトフォント、均一なパディング、装飾なしのボタン
```

---

### 4. Langfuse 監視（導入後）

```python
# Python SDK（venv内）
pip install langfuse

from langfuse import Langfuse
langfuse = Langfuse(
    public_key="pk-...",
    secret_key="sk-...",
    host="http://localhost:3000"  # セルフホスト
)

# Claude Code APIコールのトレース
with langfuse.trace(name="mykenko-feature-dev"):
    response = anthropic_client.messages.create(...)
    langfuse.generation(name="claude-call", output=response)
```

---

## Codex 連携方法

### 1. Understand-Anything（Codex対応）

```bash
# one-line インストール
curl -fsSL https://raw.githubusercontent.com/Lum1104/Understand-Anything/main/install.sh | bash -s codex

# インストール先: ~/.agents/skills/（シンボリックリンク）
# 起動: codex内で /understand を実行
```

### 2. Mem0 + Codex

```python
from mem0 import Memory

config = {
    "llm": {"provider": "openai", "config": {"model": "gpt-4o"}},
    "vector_store": {
        "provider": "qdrant",
        "config": {"host": "localhost", "port": 6333}
    }
}
memory = Memory.from_config(config)

# Codexセッション開始時にコンテキスト注入
relevant = memory.search("MYKENKO architecture decisions", limit=5)
context = "\n".join([m["memory"] for m in relevant["results"]])
```

### 3. GraphRAG + Codex

```python
# codex/context.py
import subprocess

def get_graphrag_context(query: str) -> str:
    result = subprocess.run(
        ["graphrag", "query", "--root", "~/AI-OS/rag/mykenko", 
         "--method", "local", "--query", query],
        capture_output=True, text=True
    )
    return result.stdout
```

---

## Ollama 連携方法

### 1. Mem0 + Ollama（ローカルLLMで記憶管理）

```python
config = {
    "llm": {
        "provider": "ollama",
        "config": {
            "model": "llama3.2:latest",
            "ollama_base_url": "http://localhost:11434"
        }
    },
    "embedder": {
        "provider": "ollama",
        "config": {
            "model": "nomic-embed-text:latest",
            "ollama_base_url": "http://localhost:11434"
        }
    },
    "vector_store": {
        "provider": "qdrant",
        "config": {
            "collection_name": "mykenko_memory",
            "host": "localhost",
            "port": 6333
        }
    }
}
memory = Memory.from_config(config)
```

### 2. GraphRAG + Ollama（ローカルLLMでグラフ構築）

```yaml
# ~/AI-OS/rag/mykenko/settings.yml
llm:
  api_type: openai_chat
  model: mistral:latest
  api_base: http://localhost:11434/v1
  api_key: ollama
  max_tokens: 4096

embeddings:
  llm:
    api_type: openai_embedding
    model: nomic-embed-text:latest
    api_base: http://localhost:11434/v1
    api_key: ollama
```

### 3. MoneyPrinterTurbo + Ollama

MoneyPrinterTurboの設定画面（WebUI起動後）でLLMプロバイダーを`Ollama`に設定:
```
LLM Provider: Ollama
Model: llama3.2:3b
Base URL: http://localhost:11434
```

### 4. Langfuse + Ollama監視

```python
# OllamaコールをLangfuseでトレース
from langfuse.decorators import observe
import ollama

@observe()
def generate_with_ollama(prompt: str):
    response = ollama.generate(model="llama3.2", prompt=prompt)
    return response["response"]
```

---

## 今後の導入ロードマップ

### Week 1（インストール不要・即時）
- [x] `claude plugin install code-review` ✅ 完了
- [x] `claude plugin install feature-dev` ✅ 完了
- [x] Langfuse / Mem0 / GraphRAG / MoneyPrinterTurbo クローン ✅ 完了
- [ ] taste-skill を `CLAUDE.md` に追記（15分）
- [ ] Claude Code デスクトップアプリ最新版へ更新（`/plugin`対応確認）

### Week 2（Docker環境 - Langfuse）
```bash
cd ~/AI-OS/repositories/langfuse
# MYKENKOのDocker環境のポートを確認してから
cat ~/mykenko/docker-compose.yml | grep ports
# ポート衝突がなければ
cp docker-compose.yml ~/AI-OS/monitoring/langfuse-compose.yml
# ポート3000が空いているか確認後
docker compose -f ~/AI-OS/monitoring/langfuse-compose.yml up -d
```

### Week 3（Mem0 + Qdrant統合）
```bash
# AI-OS専用Python venv作成
python3 -m venv ~/AI-OS/.venv
source ~/AI-OS/.venv/bin/activate
pip install mem0ai qdrant-client

# Mem0設定作成
cp ~/AI-OS/repositories/mem0/examples/ ~/AI-OS/rag/
```

### Week 4（GraphRAG - MYKENKOドキュメント解析）
```bash
source ~/AI-OS/.venv/bin/activate
pip install graphrag

# MYKENKOドキュメントをインデックス化
mkdir ~/AI-OS/rag/mykenko
graphrag init --root ~/AI-OS/rag/mykenko
# settings.ymlを編集（Ollama/Claude設定）
graphrag index --root ~/AI-OS/rag/mykenko
```

### Month 2（Understand-Anything）
```bash
# Claude Codeデスクトップアプリ更新後
/plugin marketplace add Lum1104/Understand-Anything
/plugin install understand-anything
# MYKENKOルートで
/understand --language ja
```

### Month 2（MoneyPrinterTurbo）
```bash
source ~/AI-OS/.venv/bin/activate
cd ~/AI-OS/repositories/MoneyPrinterTurbo
# uv が必要（pip install uv）
uv sync --frozen
python main.py  # WebUI起動
```

---

## リスクと対応策

| リスク | 対象 | 対応 |
|-------|------|------|
| Dockerポート衝突 | Langfuse(3000) vs MYKENKO | 事前に`docker ps`でポート確認 |
| Python環境汚染 | Mem0・GraphRAG・MoneyPrinter | `~/AI-OS/.venv`専用venv使用 |
| API費用増大 | GraphRAG インデックス構築 | まず小規模ドキュメントでテスト |
| ストレージ不足 | MoneyPrinterTurbo 動画 | 動画出力先を外部SSD指定 |
| `/plugin`未対応 | Understand-Anything | CLIアップデートまでCLAUDE.md代替 |

---

## ロールバック方法

```bash
# AI-OS環境全体の削除（既存プロジェクトに影響ゼロ）
rm -rf ~/AI-OS/

# インストール済みClaude Codeプラグインの削除
claude plugin uninstall code-review
claude plugin uninstall feature-dev

# Langfuse Dockerコンテナ停止・削除
docker compose -f ~/AI-OS/monitoring/langfuse-compose.yml down -v
```

既存プロジェクト（MYKENKO・AITrack）への変更: **ゼロ**

---

## 現在の達成状況

| 完了条件 | 状態 |
|---------|------|
| AI-OS構成図 | ✅ |
| ディレクトリ構成 | ✅ `~/AI-OS/`作成済み |
| OSS一覧 | ✅ 9ツール調査済み |
| 導入優先順位 | ✅ |
| Apple Silicon対応状況 | ✅ 全ツール対応確認 |
| 推奨スペック | ✅ |
| Claude Code連携方法 | ✅（Understand-Anythingのみ/pluginバージョン待ち） |
| Codex連携方法 | ✅ |
| Ollama連携方法 | ✅ |
| 今後の導入ロードマップ | ✅ Week1〜Month2 |
