# /etl-pipeline — ETLパイプライン設計

## 用途
データの抽出（Extract）・変換（Transform）・読み込み（Load）パイプラインを設計・実装する。

## ETLフロー
```
データソース（DB/API/CSV）
    ↓ Extract
生データ（JSON/CSV）
    ↓ Transform
クレンジング・正規化・集計
    ↓ Load
データウェアハウス/分析DB
```

## Python実装例
```python
import pandas as pd

def extract(source_url):
    return pd.read_csv(source_url)

def transform(df):
    df = df.dropna(subset=['email'])  # 欠損削除
    df['created_at'] = pd.to_datetime(df['created_at'])  # 型変換
    df['amount'] = df['amount'].astype(float)  # 型変換
    return df

def load(df, target_db):
    df.to_sql('orders', target_db, if_exists='append', index=False)
```
