# サイトマップ最適化・クラスタリング設計提案

> 対象: MYKENKO（お薬ショップ／個人輸入EC + メディア）
> 入力: サイトマップ設計スプレッドシート（ページ一覧 42行 + 商品クラスタリング表 約30カテゴリ/162サブカテゴリ）
> 目的: SEOに最適なサイトマップ構成の確定と、カテゴリー／成分／疾患／部位の4軸クラスタリング設計
> 最終更新: 2026-09-02

---

## 0. 結論サマリー

- **医薬品は「一覧（商品グリッド）」ではなく「情報ハブ」として設計する。** 薬機法・医療広告ガイドライン上、医薬品を効能で並べた通販的な一覧は不可。カテゴリー／疾患／部位ページは**解説＋成分＋個別 `/products/{slug}` への内部リンク集**にする（商品カードの羅列にしない）。
- **クラスタリングは4軸のハブ&スポークで構成する。** 「カテゴリー（体系）」「成分（一般名）」「疾患・症状（検索意図）」「部位（探索起点）」の4つを**別レイヤーの情報ハブ**とし、すべてが最終的に `/products/{slug}`（唯一の商品SSOT）へ集約する。
- **既存ルートに重複・表記ゆれが多数あり、統合とリダイレクトが最優先課題。** `/guide`↔`/guides`、`/ingredient`↔`/ingredients`、EC `/symptoms` ↔ メディア `/symptoms` のカニバリゼーションを解消する。
- **スプレッドシートの42ページは概ね妥当**。ただし「疾患（disease）」軸が明示されておらず、「部位」1軸に情報探索が集約されている点が**不足**。逆に認証・マイページ配下は十分（過剰ではない）。詳細は §6。

---

## 1. 現状インベントリと問題点

### 1.1 現在の顧客向けルート（`frontend/src/app/`）

```
/                /about          /blog /blog/[slug]     /brands /brands/[slug]
/categories /categories/[slug]  /products /products/[slug]     /shop
/ingredient /ingredient/[slug]  /symptoms /symptoms/[slug]     /purpose /purpose/[slug]
/ranking /ranking/[slug]        /compare /compare/[slug]       /stores /stores/[slug]
/guide /guide/[slug]            /guides   /search
/cart /checkout /orders /wishlist /contact /faq /privacy /terms /shipping /returns
（認証系: /login /register /forgot-password /reset-password /account/*）
```

### 1.2 メディア（`apps/media/app/(media)/`）

```
/symptoms /symptoms/[slug]      /ingredients /ingredients/[slug]      /lp/aga-selfcheck
```

### 1.3 検出した問題（重要度順）

| # | 問題 | 影響 | 対応 |
|---|------|------|------|
| P1 | **医薬品カテゴリを商品一覧として公開**すると薬機法リスク | 法務・広告停止リスク | カテゴリ/疾患/部位は「情報ハブ」化（§3, §4） |
| P2 | `/ingredient`(EC単数) と `/ingredients`(メディア複数) が並存 | 成分キーワードのカニバリ、被リンク分散 | URL統一 `/ingredients` に寄せ、301（§5） |
| P3 | EC `/symptoms` と メディア `/symptoms` の**二重実装** | 症状KWのドメイン間カニバリ | 役割分離: メディア=解説、EC=商品導線（§4.3） |
| P4 | `/guide` と `/guides` が両立 | 重複・クロール浪費 | 片方に統合し301 |
| P5 | `/shop` `/products` `/categories` の3つが商品入口 | 正規URLが不明瞭 | `/products`=検索/一覧SSOT、`/shop`は301 or canonical |
| P6 | `/purpose`（目的別）が疾患・部位と意味的に重複 | クラスタ境界の曖昧化 | 「疾患」軸へ吸収 or 明確に役割定義（§4.4） |
| P7 | `sitemap.ts` に ingredient/symptom/purpose/brand が**未登録** | 重要ハブが未インデックス化 | XMLサイトマップ拡充（§7） |
| P8 | スプレッドシートの新slug（`/about-us` `/order-guide` `/myaccount` 等）が既存（`/about` `/orders` `/account`）と不一致 | 実装時に二重URL発生 | 移行マッピングと301を先に確定（§5.3） |
| P9 | `docs/seo/README.md` が存在しないファイル（`v2_04_SITEMAP.md`等）を参照 | ドキュメント迷子 | README更新（本PRで実施） |

---

## 2. 規制前提（設計の土台）

医薬品の個人輸入は「販売」ではなく購入代行の情報提供という建付けになるため、ページ設計は次を厳守する。

- **効能効果で商品を並べた一覧・ランキングを作らない**（医薬品）。→ カテゴリー/疾患ページは商品グリッドではなく解説ページ。
- **効能の断定・比較・最上級表現を避ける**（`docs` の薬機法チェック／`/yakki-check`・`medical-checker` を各テンプレートに適用）。
- **個別商品ページ `/products/{slug}` は「商品情報の掲示」に限定**し、疾患解説は疾患ハブ側に置いて相互リンクする（責務分離＝カニバリ回避にも有効）。
- 非医薬品（サプリ・ビタミン・スポーツ栄養・化粧品・ペット等）は**通常のEC商品一覧として一覧化可能**。→ カテゴリ設計を「医薬品カテゴリ＝ハブ型／非医薬品カテゴリ＝一覧型」に二分する。

---

## 3. 推奨サイトマップ構成（確定版）

```
/                                     … TOP
├─ /products                          … 商品検索・一覧（全商品SSOT。医薬品も横断検索はここ）
│  └─ /products/{product-slug}        … 商品詳細（唯一の商品URL。canonical固定）
│
├─ ■ クラスタリング4軸（情報ハブ）
│  ├─ /categories                     … カテゴリ体系トップ（30大カテゴリのハブ）
│  │  └─ /categories/{category-slug}  … 大/中カテゴリ（医薬品=ハブ型 / 非医薬品=一覧型）
│  ├─ /ingredients                    … 成分トップ（一般名ハブ）
│  │  └─ /ingredients/{ingredient-slug} … 成分詳細（例: finasteride, sildenafil）
│  ├─ /conditions                     … 疾患・症状トップ（★新設 = 検索意図の主戦場）
│  │  └─ /conditions/{condition-slug} … 疾患詳細（例: aga, ed, chlamydia, hay-fever）
│  └─ /body                           … 部位から探す（探索UIの起点。疾患/カテゴリへ送客）
│     └─ /body/{part-slug}            … 部位別（例: head, skin, stomach, eye）
│
├─ ■ コンテンツ
│  ├─ /column（or /blog）             … コラム/記事一覧
│  │  └─ /column/{slug}               … 記事詳細
│  ├─ /guides                         … ガイド一覧（/guide は301統合）
│  └─ /faq                            … よくある質問（構造化データFAQ）
│
├─ ■ 販売者・ブランド
│  ├─ /brands /brands/{slug}
│  └─ /stores /stores/{slug}
│
├─ ■ 会社・法務（index）
│  /about /specified-commercial-transactions /personal-import
│  /order-guide /editorial-policy /terms /privacy /cookie-policy /sitemap(HTML)
│
├─ ■ キャンペーン
│  /campaign-list /campaign-list/{slug}
│
└─ ■ 認証・購入・マイページ（noindex）
   /login /register /doctor/login /consultation
   /cart /checkout /checkout/confirm /checkout/complete
   /account(=myaccount)/* /tracking /404
```

### 3.1 4軸の役割分担（クラスタ境界の明確化）

| 軸 | URL | 検索意図 | ページ型 | 一覧可否 |
|----|-----|----------|----------|----------|
| **カテゴリー** | `/categories/{slug}` | 「AGA 薬」「プロテイン おすすめ」等の体系的探索 | 医薬品=ハブ / 非医薬品=一覧 | 医薬品は不可 |
| **成分** | `/ingredients/{slug}` | 「フィナステリド 効果」等の一般名指名 | 情報ハブ（成分解説＋含有商品リンク） | リンク集のみ |
| **疾患・症状** | `/conditions/{slug}` | 「ED 治療」「クラミジア 市販」等の悩み起点 | 情報ハブ（疾患解説＋関連成分＋関連商品） | リンク集のみ |
| **部位** | `/body/{slug}` | 「頭」「胃」等の曖昧・探索初期 | ファセット/導線ページ（疾患・カテゴリへ送客） | 導線のみ |

> 原則: **1キーワード=1担当ページ**。同じ「AGA」を category・condition の両方で最上位に狙わない。`condition/aga` を疾患の主ページ、`categories/aga-treatment` は薬剤タイプ（フィナ/デュタ/ミノキ）の体系整理、と意図を分ける。

---

## 4. クラスタリング設計（ハブ&スポーク）

### 4.1 全体像

```
        [疾患ハブ]  /conditions/aga
         ▲   │  ▲
  (症状) │   │  │ (原因成分の解説へ)
  部位 ──┘   │  └── [成分ハブ] /ingredients/finasteride
             ▼                      │
        [カテゴリ] /categories/aga   │（含有商品）
             │                      ▼
             └────────────► [商品] /products/{slug}  ← 全リンクの集約先(SSOT)
```

- **末端の商品 `/products/{slug}` を唯一の集約先**にし、カテゴリ変更で商品URLが変わらないよう独立URLを維持（スプレッドシート方針と一致）。
- 各ハブは**双方向リンク**（疾患↔成分↔カテゴリ↔商品↔コラム）で内部リンクのサイロを形成。`internal-link-seo`/`/internal-link` で自動化。

### 4.2 スプレッドシートのクラスタ表の扱い

162サブカテゴリは**カテゴリ軸（`/categories`）のマスタ**として採用。ただし:

- 医薬品系サブカテゴリ（AGA・ED・STD・皮膚疾患・抗生物質・ホルモン等）→ **ハブ型**（解説中心）。
- サプリ/ビタミン/スポーツ栄養/化粧品/ベビー/ペット/アーユルヴェーダ/ホメオパシー等 → **一覧型**（商品グリッド可）。
- 表内の表記ゆれを是正（要修正）:
  - `Ayurveda / ここは検索まとめページ`、`Homeopathy / ここは検索まとめページ` … 作業メモが混入。正式カテゴリ名へ。
  - `Smoking Cessation'＆alcohol サポート` … 全角/引用符の誤り→「禁煙・禁酒サポート」に正規化。
  - `oral care`（小文字）… 表記統一。
  - 大カテゴリ数が多い（約30）。ナビ上は **8〜12の第1階層**に束ね、残りを第2階層に格納するとクロール効率・回遊性が向上（例: 「男性の悩み」「女性の悩み」「皮膚・アレルギー」「生活習慣病」「サプリ・栄養」…）。

### 4.3 成分ハブ `/ingredients`

- 一般名（finasteride, minoxidil, sildenafil, tadalafil, ivermectin …）は**指名検索が強く、GEO/AI検索でも引用されやすい**最重要資産。EC・メディアで**二重に作らない**。
- 推奨: **メディア（mykenko.jp）に成分解説の正典を置き**、EC側 `/ingredients/{slug}` は「この成分を含む商品」への導線に特化 or メディアへcanonical。少なくとも `DietarySupplementJsonLd`/薬剤は適切なschemaを付与。

### 4.4 疾患軸 `/conditions`（新設）と `/purpose` の整理

- 現状 `/symptoms`・`/purpose`・（提案）`/body-symptoms` が意味的に重なる。**「疾患・症状=`/conditions`」を主軸に一本化**し、`/body`（部位）はその上位の探索UIとして残す。
- `/purpose`（目的別: 美白・ダイエット等）は疾患ではないテーマも含むため、**非医薬品カテゴリの別名として `/categories` に吸収**するか、廃止して301。単独で残す積極的理由は薄い。

---

## 5. URL設計・正規化・リダイレクト

### 5.1 URL規則

- 小文字・ハイフン区切り・末尾スラッシュなし。`/Inquiry` → `/inquiry`（大文字禁止）。
- 商品は**カテゴリを含まないフラットURL** `/products/{slug}`（カテゴリ移動の影響を受けない）。
- 検索・絞り込みのクエリ（`?q=` `?category=` `?sort=`）は **noindex + canonical を代表URLへ**。ファセットの組合せ爆発をクロールさせない。

### 5.2 単複・重複の統一（301）

| 現行 | 統一先 | 理由 |
|------|--------|------|
| `/ingredient`, `/ingredient/*` | `/ingredients`, `/ingredients/*` | メディア・スプレッドシートと整合 |
| `/guide` | `/guides` | 重複解消 |
| `/shop` | `/products` | 商品入口の一本化 |
| EC `/symptoms/*` | `/conditions/*`（役割再定義） | 疾患軸の明確化・カニバリ回避 |
| `/purpose/*` | `/categories/*` or 廃止 | 意味重複 |

### 5.3 スプレッドシート新slug ↔ 既存の移行マッピング（実装前に確定）

| スプレッドシート | 既存実装 | 対応 |
|------------------|----------|------|
| `/about-us` | `/about` | どちらかに統一し301（推奨: 既存 `/about` 維持） |
| `/order-guide` | （新規） | 新設可 |
| `/myaccount/*` | `/account/*` | 既存 `/account/*` を正とし、`/myaccount` は301 |
| `/ingredients` | `/ingredient` | §5.2 |
| `/body-symptoms` | （新規, 本提案では `/body` + `/conditions`） | §4.4 |
| `/specified-commercial-transactions` | （新規） | 特商法。新設 |

---

## 6. スプレッドシートの過不足レビュー

### 6.1 不足（追加推奨）

1. **疾患軸ページ `/conditions/{slug}`** — 現状は `/body-symptoms`（部位）に情報探索が集約されている。ユーザーの検索は「ED 治療薬」「花粉症 薬」のような**疾患名起点**が主流。部位だけでは指名検索を取りこぼす。→ 疾患ハブを独立させる。
2. **成分ハブのSSOT定義** — EC/メディアどちらが正典か未定義。二重化するとカニバる（§4.3）。
3. **HTMLサイトマップ `/sitemap`** はスプレッドシートにあるが、**カテゴリ×成分×疾患の相互リンク面**としての設計指針が無い。回遊ハブとして明記。
4. **キャンペーン詳細の動的URL** `/campaign-list/{slug}`（現状 `/campaign-list/detail` 固定は複数キャンペーンでURL重複）。
5. **404以外のシステムページ**（500、メンテナンス）方針。

### 6.2 過不足なし・妥当

- 認証／購入フロー／マイページ配下（No.14〜35）の noindex 設計は妥当。**過剰ではない**。
- `/consultation`（お薬相談）を診断・処方と区別する注記は適切（規制上重要）。
- 法務ページ群（特商法・個人輸入・編集方針・プライバシー）は E-E-A-T 上必須で、揃っている。

### 6.3 過剰・整理対象

- 大カテゴリ約30は**ナビ第1階層としては多すぎ**。8〜12に集約（§4.2）。
- `/purpose` は他軸と重複（§4.4）。
- クラスタ表の「検索まとめページ」等の作業メモ行は本番タクソノミから除外。

---

## 7. XMLサイトマップ／robots／構造化データ

- `frontend/src/app/sitemap.ts` に **ingredients / conditions / body / brands / guides を追加**（現状 products/categories/stores/blog のみ）。noindexページ（cart/checkout/account/login等）は**掲載しない**。
- 規模拡大に備え**サイトマップインデックス分割**（products専用、taxonomy専用、content専用）を検討。
- 構造化データ（`packages/seo`）: 疾患=`MedicalWebPage`/`MedicalCondition`、成分=`Drug`/`DietarySupplement`、商品=`Product`（価格・在庫）、パンくず=`BreadcrumbList`、FAQ=`FAQPage`。GEO向けにボット許可（GPTBot/PerplexityBot/ClaudeBot）は既存方針を全ドメインに展開。

---

## 8. 実装ロードマップ（優先度）

| 優先 | 施策 | 担当領域 |
|------|------|----------|
| S | URL重複・大文字の301統一（§5.2, §5.3） | frontend + backend redirects |
| S | 医薬品カテゴリ/疾患ページのハブ化（一覧型/ハブ型の分岐） | frontend テンプレート + compliance |
| A | `/conditions` 疾患軸の新設と `/symptoms`・`/purpose` の整理 | frontend + CMS |
| A | 成分ハブのSSOT確定（EC or メディア）とcanonical | frontend + media |
| A | `sitemap.ts` 拡充・分割 | frontend |
| B | 内部リンク自動化（疾患↔成分↔カテゴリ↔商品） | media/内部リンク |
| B | カテゴリマスタ正規化（表記ゆれ修正・第1階層集約） | データ |

---

## 付録: カテゴリ・マスタ（スプレッドシート由来 / 正規化対象）

大カテゴリ（約30）: AGA・薄毛治療薬 / ヘアケア / スキンケア・美容 / 皮膚疾患治療薬 / アレルギー・花粉症 / 呼吸器・風邪ケア / 痛み止め・解熱薬 / ED・性の健康 / 性感染症治療薬 / 女性の健康 / 胃腸ケア / 生活習慣病 / メンタルヘルス・脳神経 / アイケア・目の健康 / ダイエット・体重管理 / ビタミン・ミネラル / スポーツ栄養 / 骨・関節ケア / 腎臓・泌尿器ケア / ホルモン・甲状腺 / 抗生物質・感染症治療薬 / アーユルヴェーダ / ホメオパシー / 栄養補助食品・スーパーフード / ベビー・キッズケア / 禁煙・禁酒サポート / ペットケア

> サブカテゴリ162件の完全な対応表は入力スプレッドシート（CL-001〜）を正とする。本提案では「医薬品=ハブ型／非医薬品=一覧型」の二分と、大カテゴリの8〜12集約を推奨。
