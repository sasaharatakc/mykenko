# Design Spec — 最終実装値

## Tokens（`index.html` `:root`）

- Container: `1320px` / Gutter: `clamp(20px,5vw,80px)`
- Spacing: xs12 / sm24 / md56 / lg112 / xl180
- Radius: sm8 / md14 / pill999
- Fonts: Space Grotesk（EN display/mono見出し）, Zen Kaku Gothic New（JP）, JetBrains Mono（status/chip/btn）

## Color

canvas `#080809` / canvas-2 `#0c0c0e` / surface `#121215`,`#17171b` /
text `#f4f3ef` / muted `#9a9a95` / faint `#6a6a66` / accent `#c8a24a` /
border `rgba(255,255,255,.10)` / glow indigo `#2b2350`, teal `#123049`

## Type scale

| Token | size |
|-------|------|
| .display | clamp(2.5rem,6.1vw,5.4rem) / 900 |
| .h2 | clamp(2rem,4.4vw,3.6rem) / 900 |
| .h3 | clamp(1.35rem,2.2vw,1.9rem) / 700 |
| .lead | clamp(1rem,1.35vw,1.18rem) / lh2 |
| eyebrow/mono | 11.5–13px, ls .16–.28em, uppercase |

## Components

- **btn**: pill, mono 13px uppercase ls.14em, primary=gold / ghost=hairline, 矢印 hover slide
- **chip / marquee**: mono uppercase, hairline pill
- **svc-row**: `80px / 1fr / auto` グリッド、hover で padding 拡張 + go アイコン回転
- **domain / link-card**: gradient surface + radial glow、hover lift
- **faq**: max-height accordion, plus→×回転
- **reveal**: IntersectionObserver（threshold .12）で `.in` 付与、stagger d1–d4

## Breakpoints

- `≤1024px`: hero/philo/contact/footer を段組み解除、MVV 1 カラム
- `≤720px`: nav→ハンバーガー、hero br 解除・縮小、全グリッド 1 カラム、footer 縦積み

## Content Mapping（contents.md → セクション）

Hero→01 / Philosophy(+MVV)→02 / Business→03 / Corporate 3件→04 /
RegTech 4件→05 / Integrated Solutions 4件→06 / Identity→07 / Company→08 /
Contact Lead→09 / FAQ 5件→FAQ / Final CTA→Final。
捏造なし・数値/効能の追加なし・使用禁止表現なし。参考サイトのコピーは不使用。
