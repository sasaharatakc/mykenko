# サイトマップ最適化・クラスタリング設計提案

> 対象: MYKENKO（お薬ショップ／個人輸入EC + メディア）
> 入力: サイトマップ設計スプレッドシート（ページ一覧 42行 + 商品クラスタリング表 約30カテゴリ/162サブカテゴリ）
> 目的: SEOに最適なサイトマップ構成の確定と、カテゴリー／成分／疾患／部位の4軸クラスタリング設計
> 最終更新: 2026-09-02

---

## 0. 結論サマリー

- **医薬品は「一覧（商品グリッド）」ではなく「情報ハブ」として設計する。** 薬機法・医療広告ガイドライン上、医薬品を効能で並べた通販的な一覧は不可。カテゴリー／疾患／部位ページは**解説＋成分＋個別 `/products/{slug}` への内部リンク集**にする（商品カードの羅列にしない）。
- **クラスタリングは3軸のハブ&スポークで構成する。** 「カテゴリー（体系）」「成分（一般名）」「疾患・症状・部位（悩み起点＝統合軸）」の3つを**別レイヤーの情報ハブ**とし、すべてが最終的に `/products/{slug}`（唯一の商品SSOT）へ集約する。
  - **確定事項（2026-09-02）**: ① 疾患・症状・部位は分割せず**単一軸 `/conditions` に統合**（部位はその中のフィルタ／導線として扱い、独立URLツリーを作らない）。② 成分ハブの正典は**EC（`/ingredients`）**とし、メディア側はECへ寄せる／canonicalで一本化する。
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
├─ ■ クラスタリング3軸（情報ハブ）
│  ├─ /categories                     … カテゴリ体系トップ（30大カテゴリのハブ）
│  │  └─ /categories/{category-slug}  … 大/中カテゴリ（医薬品=ハブ型 / 非医薬品=一覧型）
│  ├─ /ingredients                    … 成分トップ（一般名ハブ。★正典=EC）
│  │  └─ /ingredients/{ingredient-slug} … 成分詳細（例: finasteride, sildenafil）
│  └─ /conditions                     … 疾患・症状・部位トップ（★統合軸 = 検索意図の主戦場）
│     ├─ /conditions/{condition-slug} … 疾患・症状詳細（例: aga, ed, chlamydia, hay-fever）
│     └─ /conditions?part={part}      … 部位フィルタ（head/skin/stomach/eye 等。独立URLは作らない）
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
| **成分** | `/ingredients/{slug}` | 「フィナステリド 効果」等の一般名指名 | 情報ハブ（成分解説＋含有商品リンク。★正典=EC） | リンク集のみ |
| **疾患・症状・部位** | `/conditions/{slug}`（部位は `?part=` フィルタ） | 「ED 治療」「クラミジア 市販」「頭の悩み」等 | 情報ハブ（疾患解説＋関連成分＋関連商品。部位から絞込導線） | リンク集のみ |

> 原則: **1キーワード=1担当ページ**。同じ「AGA」を category・condition の両方で最上位に狙わない。`conditions/aga` を疾患の主ページ、`categories/aga-treatment` は薬剤タイプ（フィナ/デュタ/ミノキ）の体系整理、と意図を分ける。部位は独立URLを作らず `/conditions` 内のフィルタ導線に集約する。

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
- **確定: 正典はEC `/ingredients/{slug}`**（成分解説＋含有商品への導線を1ページに統合）。メディア側 `apps/media/.../ingredients/*` は**ECへ301 or `<link rel="canonical">` でECを指す**。既存EC `/ingredient`（単数）は `/ingredients` へ301（§5.2）。`Drug`/`DietarySupplement` schema を付与。

### 4.4 疾患・症状・部位の統合軸 `/conditions` と `/purpose` の整理

- **確定: 疾患・症状・部位は分割せず単一軸 `/conditions` に統合**。現状の `/symptoms`・（提案）`/body-symptoms` は `/conditions` に一本化し301。部位は独立URLツリー（`/body/{part}`）を作らず、`/conditions` 内の**フィルタ／ナビ導線（`?part=` またはページ内アンカー）**として提供する。→ 検索意図の重複・カニバリと薄いページ量産を回避。
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
| EC `/ingredient`, `/ingredient/*` | `/ingredients`, `/ingredients/*` | 成分ハブの正典=EC（確定）に統一 |
| メディア `/ingredients/*` | EC `/ingredients/*`（canonical or 301） | 正典=EC（確定）。二重化解消 |
| `/guide` | `/guides` | 重複解消 |
| `/shop` | `/products` | 商品入口の一本化 |
| EC `/symptoms/*`, `/body-symptoms/*` | `/conditions/*`（部位は `?part=`） | 疾患・症状・部位の統合軸（確定） |
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

1. **疾患・症状・部位の統合軸 `/conditions/{slug}`（確定=採用）** — スプレッドシートは情報探索を「部位（/body-symptoms）」に寄せているが、検索は「ED 治療薬」「花粉症 薬」等の**疾患名起点**が主流。→ 疾患・症状・部位を単一の `/conditions` に統合し、部位はフィルタ導線として提供（§4.4）。
2. **成分ハブのSSOT（確定=EC）** — EC `/ingredients` を正典とし、メディアはcanonical/301（§4.3）。
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

- `frontend/src/app/sitemap.ts` に **ingredients / conditions / brands / guides を追加**（現状 products/categories/stores/blog のみ。部位は `/conditions` のフィルタのため独立URLは登録しない）。noindexページ（cart/checkout/account/login等）は**掲載しない**。
- 規模拡大に備え**サイトマップインデックス分割**（products専用、taxonomy専用、content専用）を検討。
- 構造化データ（`packages/seo`）: 疾患=`MedicalWebPage`/`MedicalCondition`、成分=`Drug`/`DietarySupplement`、商品=`Product`（価格・在庫）、パンくず=`BreadcrumbList`、FAQ=`FAQPage`。GEO向けにボット許可（GPTBot/PerplexityBot/ClaudeBot）は既存方針を全ドメインに展開。

---

## 8. 実装ロードマップ（優先度）

| 優先 | 施策 | 担当領域 |
|------|------|----------|
| S | URL重複・大文字の301統一（§5.2, §5.3） | frontend + backend redirects |
| S | 医薬品カテゴリ/疾患ページのハブ化（一覧型/ハブ型の分岐） | frontend テンプレート + compliance |
| A | `/conditions` 統合軸の新設（疾患・症状・部位）と `/symptoms`・`/body-symptoms`・`/purpose` の301統合 | frontend + CMS |
| A | 成分ハブ=EC `/ingredients` に一本化、メディアはcanonical/301 | frontend + media |
| A | `sitemap.ts` 拡充・分割 | frontend |
| B | 内部リンク自動化（疾患↔成分↔カテゴリ↔商品） | media/内部リンク |
| B | カテゴリマスタ正規化（表記ゆれ修正・第1階層集約） | データ |

---

## 付録: カテゴリ・マスタ（スプレッドシート由来 / 正規化対象）

大カテゴリ（約30）: AGA・薄毛治療薬 / ヘアケア / スキンケア・美容 / 皮膚疾患治療薬 / アレルギー・花粉症 / 呼吸器・風邪ケア / 痛み止め・解熱薬 / ED・性の健康 / 性感染症治療薬 / 女性の健康 / 胃腸ケア / 生活習慣病 / メンタルヘルス・脳神経 / アイケア・目の健康 / ダイエット・体重管理 / ビタミン・ミネラル / スポーツ栄養 / 骨・関節ケア / 腎臓・泌尿器ケア / ホルモン・甲状腺 / 抗生物質・感染症治療薬 / アーユルヴェーダ / ホメオパシー / 栄養補助食品・スーパーフード / ベビー・キッズケア / 禁煙・禁酒サポート / ペットケア

> サブカテゴリ162件の完全な対応表は入力スプレッドシート（CL-001〜）を正とする。本提案では「医薬品=ハブ型／非医薬品=一覧型」の二分と、大カテゴリの8〜12集約を推奨。

---

## 9. 最終確定サイトマップ（完全版・競合優位設計）

> 対象競合: オオサカ堂 / くすりエクスプレス / お薬なび / ベストケンコー 等の個人輸入代行。
> 勝ち筋: 競合は「カテゴリ→商品」の浅い2階層に留まる。MYKENKOは **疾患×成分×商品の三重内部リンク（トピッククラスタ）+ GEO/AI検索最適化 + E-E-A-T** で情報深度と被引用性で上回る。

### 9.1 競合との差別化サマリー

| 観点 | 競合の典型 | MYKENKOの勝ち筋 |
|------|-----------|-----------------|
| 情報構造 | カテゴリ一覧→商品（2階層・薄い） | 疾患↔成分↔カテゴリ↔商品の相互リンク（トピック権威） |
| 検索意図 | 商品名・成分名の指名のみ | 疾患・症状・部位の悩み起点KWまで面で獲得 |
| AI検索(GEO) | 未対応が多い | 構造化データ＋一次情報引用で被引用（Perplexity/AIO/ChatGPT） |
| E-E-A-T | 運営情報が薄い | 監修者・編集方針・出典明示・更新日で信頼性 |
| 回遊 | 関連商品のみ | 診断/セルフチェック・比較・FAQで滞在と回遊 |
| 薬機法 | 効能で並べがち（リスク） | 商品面と効能解説を分離（安全かつ網羅） |

### 9.2 完全サイトマップ（URL・index方針・ページ型・狙う意図）

```
/                                         index   TOP（各ハブ入口・特集）
│
■ 商品（SSOT）
├─ /products                              index*  商品検索UI（トップのみindex/絞込結果はnoindex+canonical）
│   └─ /products/{product-slug}           index   商品詳細（全リンク集約先。Product schema）
│
■ クラスタリング3軸（トピック権威の中核）
├─ /categories                            index   カテゴリ体系トップ（8–12大カテゴリに集約）
│   └─ /categories/{category-slug}        index   医薬品=ハブ型 / 非医薬品=一覧型
│       └─ /categories/{cat}/{subcat}     index   中カテゴリ（162サブカテゴリ）
├─ /ingredients                           index   成分トップ（一般名ハブ・正典=EC）
│   └─ /ingredients/{ingredient-slug}     index   成分詳細（Drug/Supplement schema・含有商品）
├─ /conditions                            index   疾患・症状・部位トップ（悩み起点の主戦場）
│   ├─ /conditions/{condition-slug}       index   疾患詳細（MedicalWebPage・関連成分/商品/FAQ）
│   └─ /conditions?part={part}            noindex 部位フィルタ（独立URLは作らない）
│
■ 競合優位の武器ページ（他社が持たない）
├─ /compare                               index   成分・薬剤タイプ比較（例: フィナ vs デュタ）
│   └─ /compare/{topic-slug}              index   比較記事（ItemList/Table schema）
├─ /check                                 index   セルフチェック/診断ハブ（AGA・ED・花粉症等）
│   └─ /check/{condition-slug}            index   診断ツール（回遊・被リンク獲得・LP流入受け）
├─ /guides                                index   使い方・服用ガイド（HowTo schema）
│   └─ /guides/{slug}                     index   個別ガイド
├─ /column                                index   コラム/記事（E-E-A-T・GEO被引用の本体）
│   └─ /column/{slug}                     index   記事（Article・監修者・出典・更新日）
├─ /ranking                               index   人気/閲覧ランキング（※医薬品は効能訴求せず販売実績ベースに限定）
│   └─ /ranking/{slug}                    index   カテゴリ別ランキング
├─ /faq                                   index   よくある質問（FAQPage schema）
│   └─ /faq/{category}                    index   カテゴリ別FAQ
│
■ ブランド・販売者
├─ /brands  /brands/{slug}                index   ブランド（製造元）ハブ
├─ /stores  /stores/{slug}                index   出店者ページ
│
■ 会社・信頼性（E-E-A-T / YMYL必須）
├─ /about                                 index   運営者概要
├─ /specified-commercial-transactions     index   特商法表記
├─ /personal-import                       index   個人輸入の仕組み・注意
├─ /order-guide                           index   注文ガイド
├─ /editorial-policy                      index   編集方針（情報源・AI・広告表現）
├─ /supervisors                           index   監修者一覧（★E-E-A-T強化・他社が弱い）
│   └─ /supervisors/{slug}                index   監修者プロフィール（Person schema）
├─ /terms  /privacy  /cookie-policy       index   規約・個人情報・Cookie
├─ /sitemap                               index   HTMLサイトマップ（回遊・発見性）
│
■ キャンペーン
├─ /campaign-list                         index   キャンペーン一覧
│   └─ /campaign-list/{slug}              index   キャンペーン詳細（動的URL化）
│
■ 認証・購入・会員（noindex）
├─ /login /register /doctor/login /consultation
├─ /cart /checkout /checkout/confirm /checkout/complete
├─ /account/*（=マイページ配下すべて）  /tracking
└─ /404 /search（検索結果はnoindex）

* /products トップのみ index。?q=/?category=/?ingredient=/?sort= 等の絞込は noindex + canonical。
```

### 9.3 トピッククラスタ（内部リンク）の勝ちパターン

例: AGA（脱毛）クラスタ — 競合は「AGA商品一覧」1枚だが、MYKENKOは面で構成する。

```
[疾患] /conditions/aga  ──┬─ [診断] /check/aga
   ▲  ▲  ▲               ├─ [比較] /compare/finasteride-vs-dutasteride
   │  │  └───── [コラム] /column/aga-*（原因・対策・副作用・体験）
   │  └──────── [成分] /ingredients/finasteride, /minoxidil, /dutasteride
   │                        │（含有商品）
   └──[カテゴリ] /categories/aga-treatment ──▼
                                    [商品] /products/{slug}  ← 集約先（唯一の購入面）
```

- **相互リンク必須**: 疾患→成分→商品→比較→診断→コラム→疾患 の環状リンクでクラスタ内PageRankを循環。
- **1クラスタ = 1疾患**を単位に、AGA/ED/STD/花粉症/ダイエット等の主要クラスタから着手（検索volと収益の高い順）。
- 自動化は `/internal-link`・`internal-link-seo` で「成分↔含有商品」「疾患↔関連成分」を機械生成。

### 9.4 GEO / AI検索で勝つ要件（競合が未対応）

- 各ハブ冒頭に**40–60字の定義文（回答スニペット）**を置き、AI Overview/Perplexityに引用させる。
- `MedicalWebPage` `Drug` `FAQPage` `HowTo` `BreadcrumbList` `Person`(監修者) を全ハブで実装。
- robots で GPTBot/PerplexityBot/ClaudeBot を全ドメイン許可（既存メディア方針をEC・全体に展開）。
- 一次情報（添付文書・公的機関・論文）へ**出典リンク＋監修者名＋最終更新日**を明示 → E-E-A-T と被引用の両立。

### 9.5 実装の着手順（改訂ロードマップ）

| 優先 | 施策 | 効果 |
|------|------|------|
| S | URL重複301統一（§5.2/5.3）+ `/products` 絞込の noindex/canonical | インデックス健全化・カニバリ解消 |
| S | 医薬品カテゴリ/疾患のハブ化テンプレート（一覧型/ハブ型分岐） | 薬機法リスク回避 |
| A | `/conditions` 統合軸 + 主要5クラスタ（AGA/ED/STD/花粉症/ダイエット）構築 | 悩み起点KWの面獲得 |
| A | 成分ハブEC一本化 + 成分↔商品自動内部リンク | トピック権威・回遊 |
| A | 構造化データ全ハブ実装 + `sitemap.ts` 拡充・分割 | リッチリザルト・GEO被引用 |
| B | `/compare`・`/check`・`/supervisors` の武器ページ | 差別化・被リンク・E-E-A-T |
| B | `/column` の監修・出典・更新日運用フロー | YMYL信頼性 |
