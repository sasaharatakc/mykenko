# Reference Analysis — Nudot Studio (核點)

**Reference URL:** https://nudot.com.tw/?ref=landing.love

> ⚠️ アクセス制約: 実行環境の egress プロキシが `nudot.com.tw` / `landing.love` / `awwwards.com`
> をブロックしているため、直接のスクリーンショット取得は不可能でした（MASTER PROMPT §60 に従い、
> 取得可能な範囲で最大限解析）。Design DNA は Awwwards / landing.love / 検索インデックスに
> 記録された公開情報から再構成しています。

## Global

- **Design Style:** High-end editorial × technical "lab" aesthetic（ブローシャーより実験室）
- **Visual Density:** Low〜Medium。大きな余白 + 巨大タイポ + ヘアライン構造
- **Brand Personality:** Premium / Cosmic / Kinetic / Precise / Confident
- **Primary Visual Device:** Near-black canvas + oversized kinetic typography + status lines
- **Page Rhythm:** ダーク面の交互切替、セクションごとの cosmic glow、明確なシルエット変化

## Design Keywords

`Dark` `Near-black` `Editorial` `Oversized typography` `Kinetic type` `Monochrome`
`Cosmic` `Technical` `Minimal structure` `Hairline` `Service chips` `Status line`

## Reconstructed DNA（Nudot 公開情報より）

- near-black canvas（漆黒に近いキャンバス）
- letterplay / 巨大な kinetic typography
- status lines（小さなモノスペースの技術ラベル）
- cosmic series carousel（宇宙的モチーフ）
- strategy / motion / WebGL を短い service chips として提示
- scroll-driven Three.js / WebGL の演出（ビジュアル先行 → コピー後追い）
- Awwwards Honorable Mention 受賞の高難度エージェンシー表現

## Section DNA（本再構築に反映した抽象パターン）

| # | Pattern | 反映 |
|---|---------|------|
| 01 | Fixed minimal header + status | ✅ 固定ヘッダー / blur on scroll |
| 02 | Oversized kinetic hero + status line + chips | ✅ Hero |
| 03 | Kinetic marquee strip | ✅ サービス名マーキー |
| 04 | Manifesto / philosophy（大見出し + MVV グリッド） | ✅ Philosophy |
| 05 | Domain split cards（2 分割 + glow） | ✅ Business |
| 06 | Indexed service rows（ホバー展開） | ✅ Corporate / RegTech |
| 07 | Problem-first solution grid | ✅ Integrated Solutions |
| 08 | Identity / Company link cards | ✅ Identity / Company |
| 09 | Contact lead + cosmic glow | ✅ Contact |
| 10 | FAQ accordion | ✅ FAQ |
| 11 | Centered oversized final CTA + glow | ✅ Final CTA |
| 12 | Hairline footer | ✅ Footer |

## Typography Ratio

- Display (H1): `clamp(2.5rem, 6.1vw, 5.4rem)` / weight 900 / line-height 1.12
- H2: `clamp(2rem, 4.4vw, 3.6rem)` / weight 900
- H3: `clamp(1.35rem, 2.2vw, 1.9rem)` / weight 700
- Lead / Body: `1rem〜1.18rem` / line-height 2.0（H1 の約 20%）
- Eyebrow / Status / chips: 11.5〜13px mono, letter-spacing .16〜.28em, uppercase

## Color System

| Role | Hex |
|------|-----|
| Canvas | `#080809` |
| Canvas 2 | `#0c0c0e` |
| Surface | `#121215` / `#17171b` |
| Text | `#f4f3ef` |
| Muted | `#9a9a95` |
| Faint | `#6a6a66` |
| Border | `rgba(255,255,255,.10)` |
| Accent (CTA / index) | `#c8a24a`（warm gold） |
| Cosmic glow | indigo `#2b2350` / teal `#123049` |

## Motion

- Page load / scroll reveal: opacity + translateY(28px), 0.9s cubic-bezier(.2,.7,.3,1), stagger
- Header: scroll 時に blur + hairline
- Marquee: 32s linear infinite
- FAQ: max-height accordion 0.5s
- Hover: ボタン矢印スライド / service row の go アイコン回転 / card lift
- `prefers-reduced-motion` 完全対応

## Responsive Logic

- Desktop 1440 / Tablet 768 / Mobile 390
- Mobile: nav → ハンバーガーパネル、hero br 解除で自然折返し、全グリッド 1 カラム、
  service row の go アイコン非表示、footer 縦積み
