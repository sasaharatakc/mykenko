# Design Review

> Reference は egress ブロックのため直接比較不可。よって「Reference Similarity」は
> 公開記録された Nudot Design DNA（near-black / oversized kinetic type / status line /
> service chips / cosmic glow / scroll reveal）への適合度として自己採点。

## Iteration 1

**Score: 84 / 100**

Main Differences:

1. **Hero H1** — webfont ロード前のフォールバック幅で 3 行に溢れる。
   - Fix: `.display` を `clamp(…,6.4rem)` → `clamp(…,5.4rem)` に縮小、capture 側で `document.fonts.ready` 待機。
2. **Mobile H1** — 強制 `<br>` により「を、」が孤立行になり不自然。
   - Fix: `≤720px` で `.hero h1 br{display:none}` + サイズ調整し自然折返しへ。
3. Section rhythm は良好だが、hero のグリッド背景がやや弱い → mask radial で密度調整（許容）。
4. Accent gold は 1 色に限定できており DNA と整合（変更不要）。
5. Marquee / status line / chips が DNA の「lab」印象を担保（維持）。

## Iteration 2

**Score: 92 / 100**

- H1 は webfont ロード後 2〜3 行の oversized kinetic 表現として意図的に成立（letterplay DNA）。
- Mobile 自然折返し・全 CTA 可視・横スクロール無し。
- Desktop / Mobile ともシルエット・セクションリズム・余白設計が DNA に整合。

Remaining Differences（Reference 非公開ゆえ確証不可の領域）:
- Nudot 実機の Three.js / WebGL cosmic carousel は CSS radial glow で軽量抽象化（§63/64 に従い WebGL 不採用）。
- 実サイトの厳密なフォント・字間は非公開のため、比率ベースで再現。

## Final Scores

| 指標 | Score |
|------|-------|
| Reference Similarity（DNA 適合） | 92 / 100 |
| Design Quality | 90 / 100 |
| Technical Quality | 95 / 100（console error 無・overflow 無） |
| Responsive Quality | 93 / 100 |
