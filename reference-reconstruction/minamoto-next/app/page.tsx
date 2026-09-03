"use client";

import { useEffect, useRef, useState } from "react";

/* ---------- content data (from contents.md) ---------- */
const NAV = [
  ["#philosophy", "Philosophy"],
  ["#business", "Business"],
  ["#solutions", "Solutions"],
  ["#company", "Company"],
  ["#faq", "FAQ"],
] as const;

const MVV = [
  { label: "Our Mission", title: ["企業の可能性を、", "次の未来へつなげる。"], body: "目の前の課題を解決するだけではなく、その先にある成長まで考える。新しい技術やアイデアを磨き続け、企業が前へ進むための選択肢を増やしていきます。" },
  { label: "Our Vision", title: ["挑戦が、", "次の時代をつくる。"], body: "変化を恐れず、新しいサービスや事業に挑戦する。一つひとつの挑戦を未来につなげ、新しい価値が生まれる循環をつくります。" },
  { label: "Our Value", title: ["考える。試す。", "前へ進める。"], body: "事業を深く理解する。試行錯誤を続ける。結果に向き合う。一人では生まれない成果を、人と人の力をつなぐことで実現していきます。" },
];

const CORPORATE = [
  ["S/01", "公的資金調達", "融資・補助金・助成金など、公的な資金制度の活用を通じて、企業の財務面を支援します。"],
  ["S/02", "経営コンサルティング", "企業が抱える経営課題を整理し、事業や集客の改善につながる選択肢を検討します。"],
  ["S/03", "風評被害対策", "インターネット上の口コミや書き込み、誹謗中傷など、企業やブランドの信用に関わる問題への対策を支援します。"],
];

const REGTECH = [
  ["R/01", "アプリ開発", "企業やサービスの目的に合わせたアプリケーション開発を提案します。"],
  ["R/02", "ソーシャルメディア", "複数のソーシャルメディアを活用した運用・情報発信を支援します。"],
  ["R/03", "宣伝・広告", "目的や予算を踏まえ、企業やサービスを届けるための広告施策を提案します。"],
  ["R/04", "リファラル", "口コミや人から人への情報伝播を活用し、サービスやブランドの認知拡大につながる施策を提案します。"],
];

const SOLUTIONS = [
  ["01", "資金と経営について相談したい", "公的資金調達や経営コンサルティングなど、企業経営に関わる領域から検討できます。"],
  ["02", "集客や認知を強化したい", "SNS・広告・リファラルなど、情報を届ける方法から検討できます。"],
  ["03", "デジタルサービスを作りたい", "アプリ開発をはじめ、事業目的から必要なデジタル施策を検討できます。"],
  ["04", "ネット上の評判について相談したい", "口コミや書き込みなど、オンライン上の企業信用に関する課題を相談できます。"],
];

const FAQ = [
  ["Q1", "どのサービスに相談すればよいか分からなくても問い合わせできますか？", "まずは現在抱えている課題や実現したいことをお問い合わせ内容としてお送りください。サービスを選ぶ前の段階でも、相談内容を整理するための入口としてお問い合わせいただけます。"],
  ["Q2", "どのような事業を行っていますか？", "大きくコーポレート部門とレグテック部門があり、公的資金調達、経営コンサルティング、風評被害対策、アプリ開発、ソーシャルメディア、広告、リファラルなどの事業を展開しています。"],
  ["Q3", "複数の課題について相談できますか？", "minamotoでは複数領域のサービスを展開し、さまざまな企業課題にワンストップで対応する方針を掲げています。具体的な対応範囲については、お問い合わせ時に確認してください。"],
  ["Q4", "風評被害について相談できますか？", "インターネット上の悪質な口コミや書き込みなど、風評・誹謗中傷に関する対策事業を提供しています。具体的な対応可否については、対象となる状況を添えてお問い合わせください。"],
  ["Q5", "WebやSNSについて相談できますか？", "ソーシャルメディア、広告、アプリ開発などのデジタル領域を扱っています。相談したい課題や目的をお問い合わせ時にお伝えください。"],
];

const MARQUEE = ["公的資金調達", "経営コンサルティング", "風評被害対策", "アプリ開発", "ソーシャルメディア", "宣伝・広告", "リファラル"];

/* ---------- masked kinetic heading (React-native, no DOM mutation) ---------- */
function Kinetic({ tag: Tag = "h2", className = "", lines }: { tag?: any; className?: string; lines: string[] }) {
  return (
    <Tag className={`kinetic ${className}`}>
      {lines.map((l, i) => (
        <span className="line-mask" key={i}>
          <span className="line-inner" style={{ transitionDelay: `${i * 0.09}s` }}>{l}</span>
        </span>
      ))}
    </Tag>
  );
}

/* ---------- FAQ item ---------- */
function FaqItem({ q, question, answer }: { q: string; question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div className={`faq-item reveal${open ? " open" : ""}`}>
      <button className="faq-q" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <span className="index-mark">{q}</span>
        <span>{question}</span>
        <span className="plus">+</span>
      </button>
      <div className="faq-a" ref={ref} style={{ maxHeight: open && ref.current ? ref.current.scrollHeight : 0 }}>
        <div className="faq-a-inner">{answer}</div>
      </div>
    </div>
  );
}

export default function Page() {
  const [navOpen, setNavOpen] = useState(false);
  const [year, setYear] = useState<number | null>(null);

  useEffect(() => {
    setYear(new Date().getFullYear());
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const header = document.querySelector<HTMLElement>(".site-header");
    const glow = document.querySelector<HTMLElement>(".hero-glow");
    const grid = document.querySelector<HTMLElement>(".hero-grid-bg");

    /* opt into entrance animations only once JS runs (keeps first frame visible) */
    if (!reduce) document.documentElement.classList.add("motion");

    /* --- scroll reveal (fade-up + kinetic lines) --- */
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -8% 0px" }
    );
    document.querySelectorAll(".reveal, .kinetic").forEach((el) => io.observe(el));

    /* --- momentum smooth scroll + hero parallax --- */
    let y = window.scrollY;
    let target = y;
    let active = false;
    const maxY = () => Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    const setHeader = () => header && header.classList.toggle("scrolled", y > 24);
    const parallax = () => {
      if (glow) glow.style.transform = `translate3d(0,${y * 0.18}px,0)`;
      if (grid) grid.style.transform = `translate3d(0,${y * 0.1}px,0)`;
    };
    const apply = () => {
      window.scrollTo(0, y);
      parallax();
      setHeader();
    };
    const raf = () => {
      y += (target - y) * 0.09;
      if (Math.abs(target - y) < 0.4) { y = target; active = false; }
      apply();
      if (active) requestAnimationFrame(raf);
    };
    const kick = () => { if (!active) { active = true; requestAnimationFrame(raf); } };

    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey) return; // let pinch-zoom through
      e.preventDefault();
      target = Math.max(0, Math.min(maxY(), target + e.deltaY));
      kick();
    };
    const onNativeScroll = () => { if (!active) { y = target = window.scrollY; parallax(); setHeader(); } };

    if (!reduce && !coarse) {
      window.addEventListener("wheel", onWheel, { passive: false });
      window.addEventListener("scroll", onNativeScroll, { passive: true });
    } else {
      window.addEventListener("scroll", () => { y = window.scrollY; setHeader(); }, { passive: true });
    }

    /* --- anchor smooth scroll to target (fixed-header offset) --- */
    const anchors = Array.from(document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]'));
    const onAnchor = (e: Event, a: HTMLAnchorElement) => {
      const id = a.getAttribute("href") || "";
      if (id.length < 2) return;
      const t = document.querySelector<HTMLElement>(id);
      if (!t) return;
      e.preventDefault();
      let top = t.getBoundingClientRect().top + window.scrollY - 72;
      top = Math.max(0, Math.min(maxY(), top));
      if (reduce || coarse) { window.scrollTo({ top, behavior: reduce ? "auto" : "smooth" }); }
      else { target = top; kick(); }
    };
    const handlers = anchors.map((a) => {
      const h = (e: Event) => onAnchor(e, a);
      a.addEventListener("click", h);
      return [a, h] as const;
    });

    setHeader();
    return () => {
      io.disconnect();
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("scroll", onNativeScroll);
      handlers.forEach(([a, h]) => a.removeEventListener("click", h));
    };
  }, []);

  const closeNav = () => setNavOpen(false);

  return (
    <>
      {/* ============ HEADER ============ */}
      <header className="site-header">
        <div className="container nav">
          <a href="#top" className="brand"><span className="dot" />MINAMOTO</a>
          <nav className="nav-links">
            {NAV.map(([href, label]) => <a key={href} href={href}>{label}</a>)}
          </nav>
          <div className="nav-cta">
            <a href="#contact" className="btn btn-primary">Contact <span className="arrow">→</span></a>
            <button className="nav-toggle" aria-label="メニュー" aria-expanded={navOpen} onClick={() => setNavOpen((o) => !o)}>
              <span /><span /><span />
            </button>
          </div>
        </div>
      </header>
      <div className={`nav-panel${navOpen ? " open" : ""}`}>
        {NAV.map(([href, label]) => <a key={href} href={href} onClick={closeNav}>{label}</a>)}
        <a href="#contact" className="btn btn-primary" onClick={closeNav}>お問い合わせ・相談をする <span className="arrow">→</span></a>
      </div>

      <main id="top">
        {/* ============ 01 HERO ============ */}
        <section className="hero" id="hero">
          <div className="hero-glow" />
          <div className="hero-grid-bg" />
          <div className="container">
            <div className="hero-top">
              <span className="eyebrow reveal">MINAMOTO / TO THE NEXT FUTURE</span>
              <div className="hero-status reveal d1">
                CORPORATE × REGTECH<br />ONE TEAM / ONE SOLUTION<br />EST. MINAMOTO INC.
              </div>
            </div>
            <Kinetic tag="h1" className="display" lines={["企業の次の未来を、", "アイデアと実行力でつくる。"]} />
            <div className="hero-lower">
              <div>
                <p className="lead reveal d2">経営、資金、評判、Web、SNS、広告、開発。企業が成長する過程で生まれるさまざまな課題に、ビジネスとテクノロジーの両面から向き合います。課題ごとにサービスを切り分けるのではなく、必要な支援を組み合わせながら、次の一歩へ。</p>
                <div className="hero-actions reveal d3">
                  <a href="#contact" className="btn btn-primary">お問い合わせ・相談をする <span className="arrow">→</span></a>
                  <a href="#business" className="btn btn-ghost">事業・サービスを見る <span className="arrow">→</span></a>
                </div>
              </div>
              <div className="hero-points reveal d3">
                <div className="hero-point"><span className="no">01</span><span>経営課題からデジタル施策まで幅広く対応</span></div>
                <div className="hero-point"><span className="no">02</span><span>複数の専門領域から必要な支援を選択</span></div>
                <div className="hero-point"><span className="no">03</span><span>企画だけで終わらず、実行につながる解決策へ</span></div>
              </div>
            </div>
          </div>
        </section>

        {/* ============ MARQUEE ============ */}
        <div className="marquee" aria-hidden="true">
          <div className="marquee-track">
            {[...MARQUEE, ...MARQUEE].map((m, i) => <span key={i}>{m}</span>)}
          </div>
        </div>

        {/* ============ 02 PHILOSOPHY ============ */}
        <section className="philosophy" id="philosophy">
          <div className="container">
            <div className="philo-intro">
              <div className="section-head">
                <span className="eyebrow reveal">02 — Philosophy</span>
                <Kinetic className="h2" lines={["常識の先にある、", "まだ見えていない可能性へ。"]} />
              </div>
              <div className="reveal d1">
                <p className="body">事業環境も、テクノロジーも、マーケティングも、変化し続けています。だからこそ、昨日までの正解をそのまま使うのではなく、新しい技術、新しい発想、新しい方法を取り入れながら、企業の未来に必要な選択肢を考え続ける。</p>
                <p className="body gap">minamotoは、多様な才能やアイデアを掛け合わせ、新しい価値を生み出しながら社会へ貢献していくことを企業理念として掲げています。</p>
                <a href="#" className="textlink mt">minamotoの考え方を見る <span className="arrow">→</span></a>
              </div>
            </div>
            <div className="mvv">
              {MVV.map((m, i) => (
                <div className={`mvv-item reveal${i ? ` d${i}` : ""}`} key={m.label}>
                  <span className="label">{m.label}</span>
                  <h3 className="h3">{m.title[0]}<br />{m.title[1]}</h3>
                  <p className="body">{m.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============ 03 BUSINESS ============ */}
        <section className="business" id="business">
          <div className="container">
            <div className="section-head">
              <span className="eyebrow reveal">03 — Business</span>
              <Kinetic className="h2" lines={["ひとつの課題だけを、", "ひとつの方法だけで考えない。"]} />
              <p className="body reveal d1">企業の課題は、ひとつの領域だけで完結するとは限りません。資金の問題が事業戦略につながり、ブランドの問題が集客につながり、デジタル施策が企業成長につながることもあります。minamotoでは、大きく「コーポレート部門」と「レグテック部門」の2領域から、企業ごとの課題に合わせたサービスを提供しています。</p>
            </div>
            <div className="domains">
              <div className="domain reveal">
                <div>
                  <span className="index-mark">01 / CORPORATE</span>
                  <h3 className="h3">企業経営を、前へ。</h3>
                  <p className="body">経営、資金、企業価値、評判。企業活動の土台となる課題に向き合い、事業を前へ進めるための支援を行います。</p>
                </div>
                <div className="domain-foot">
                  <span className="domain-en">Corporate Division</span>
                  <a href="#corporate" className="textlink">コーポレート部門を見る <span className="arrow">→</span></a>
                </div>
              </div>
              <div className="domain reveal d1">
                <div>
                  <span className="index-mark">02 / REGTECH</span>
                  <h3 className="h3">テクノロジーで、事業を前へ。</h3>
                  <p className="body">Web、アプリ、SNS、広告。デジタルを単体施策として考えるのではなく、企業の目的から逆算した活用方法を考えます。</p>
                </div>
                <div className="domain-foot">
                  <span className="domain-en">RegTech Division</span>
                  <a href="#regtech" className="textlink">レグテック部門を見る <span className="arrow">→</span></a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============ 04 CORPORATE ============ */}
        <section className="corporate" id="corporate">
          <div className="container">
            <div className="section-head">
              <span className="eyebrow reveal">04 — Corporate</span>
              <Kinetic className="h2" lines={["企業を支える土台から、", "成長を考える。"]} />
              <p className="body reveal d1">経営には、資金、集客、評判など複数の課題が同時に発生します。必要な領域を整理しながら、企業の状況に合わせた支援へつなげます。</p>
            </div>
            <div className="svc-list">
              {CORPORATE.map(([num, name, desc]) => (
                <a className="svc-row reveal" href="#contact" key={num}>
                  <span className="num">{num}</span>
                  <span className="svc-body"><span className="svc-name">{name}</span><span className="svc-desc">{desc}</span></span>
                  <span className="go">↗</span>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* ============ 05 REGTECH ============ */}
        <section className="regtech" id="regtech">
          <div className="container">
            <div className="section-head">
              <span className="eyebrow reveal">05 — RegTech</span>
              <Kinetic className="h2" lines={["デジタルを、", "使うことから成果につなげる。"]} />
              <p className="body reveal d1">新しいシステムを作る。SNSを運用する。広告を出す。大切なのは、それ自体ではありません。企業が達成したい目的から考え、必要なデジタル施策を選択すること。minamotoでは複数のデジタル領域から企業活動を支援しています。</p>
            </div>
            <div className="svc-list">
              {REGTECH.map(([num, name, desc]) => (
                <a className="svc-row reveal" href="#contact" key={num}>
                  <span className="num">{num}</span>
                  <span className="svc-body"><span className="svc-name">{name}</span><span className="svc-desc">{desc}</span></span>
                  <span className="go">↗</span>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* ============ 06 SOLUTIONS ============ */}
        <section className="solutions" id="solutions">
          <div className="container">
            <div className="section-head center">
              <span className="eyebrow center reveal">06 — One Team / One Solution</span>
              <Kinetic className="h2 narrow" lines={["必要なのは、", "サービスではなく解決策。"]} />
              <p className="body reveal d1">企業の課題は、最初から「SNS」「広告」「コンサルティング」と分類されているわけではありません。まずは目的や課題を整理するところから。minamotoが持つ複数の事業領域から、必要な支援につなげます。</p>
            </div>
            <div className="solutions-grid">
              {SOLUTIONS.map(([n, title, body], i) => (
                <div className={`solution reveal${i % 2 ? " d1" : ""}`} key={n}>
                  <div className="q"><span className="index-mark">{n}</span><span className="qtitle">{title}</span></div>
                  <p className="body">{body}</p>
                </div>
              ))}
            </div>
            <div className="solutions-cta reveal">
              <a href="#contact" className="btn btn-primary">自社の課題について相談する <span className="arrow">→</span></a>
            </div>
          </div>
        </section>

        {/* ============ 07 IDENTITY ============ */}
        <section className="identity" id="identity">
          <div className="container">
            <div className="section-head">
              <span className="eyebrow reveal">07 — Identity</span>
              <Kinetic className="h2" lines={["すべての仕事に、", "minamotoらしい理由を。"]} />
              <p className="body reveal d1">ブランドは、ロゴや言葉だけで生まれるものではありません。何を大切にするのか。誰と向き合うのか。どんな未来を目指すのか。その思想が一貫して積み重なった先に、企業の個性があります。minamotoでは、企業理念だけでなくブランドマークなどのVisual Identityにも、企業としての考え方を込めています。</p>
            </div>
            <div className="split">
              <div className="link-card reveal">
                <div>
                  <span className="label">Corporate Identity</span>
                  <h3 className="h3">私たちが、何のために存在するのか。</h3>
                  <p className="body">Mission、Vision、Valueを通して、minamotoが目指す未来と仕事に向き合う姿勢を紹介します。</p>
                </div>
                <a href="#" className="textlink">Corporate Identityを見る <span className="arrow">→</span></a>
              </div>
              <div className="link-card reveal d1">
                <div>
                  <span className="label">Visual Identity</span>
                  <h3 className="h3">思想を、目に見えるかたちへ。</h3>
                  <p className="body">ブランドマークをはじめ、minamotoのブランドを形成する背景と考え方を紹介します。</p>
                </div>
                <a href="#" className="textlink">Visual Identityを見る <span className="arrow">→</span></a>
              </div>
            </div>
          </div>
        </section>

        {/* ============ 08 COMPANY ============ */}
        <section className="company" id="company">
          <div className="container">
            <div className="section-head">
              <span className="eyebrow reveal">08 — Company</span>
              <Kinetic className="h2" lines={["未来をつくる会社を、", "もっと知る。"]} />
              <p className="body reveal d1">株式会社minamotoは、企業経営を支援するコーポレート領域と、デジタルを活用するレグテック領域を中心に事業を展開しています。会社情報、企業理念、事業内容など、minamotoについて詳しくご覧いただけます。</p>
            </div>
            <div className="split split-3">
              <div className="link-card reveal">
                <div><span className="label">Company Information</span><h3 className="h3">企業情報</h3><p className="body">会社概要や所在地など、株式会社minamotoの基本情報をご案内します。</p></div>
                <a href="#" className="textlink">会社概要を見る <span className="arrow">→</span></a>
              </div>
              <div className="link-card reveal d1">
                <div><span className="label">Philosophy</span><h3 className="h3">私たちの考え方</h3><p className="body">minamotoが大切にしているMission、Vision、Valueをご紹介します。</p></div>
                <a href="#philosophy" className="textlink">Philosophyを見る <span className="arrow">→</span></a>
              </div>
              <div className="link-card reveal d2">
                <div><span className="label">Business</span><h3 className="h3">私たちの事業</h3><p className="body">コーポレート部門・レグテック部門の各事業をご紹介します。</p></div>
                <a href="#business" className="textlink">事業一覧を見る <span className="arrow">→</span></a>
              </div>
            </div>
          </div>
        </section>

        {/* ============ 09 CONTACT ============ */}
        <section className="contact-lead" id="contact">
          <div className="glow" />
          <div className="container">
            <div className="contact-inner">
              <div>
                <span className="eyebrow reveal">09 — Contact</span>
                <Kinetic className="h2" lines={["まだ答えが決まっていなくても、", "課題からご相談ください。"]} />
                <p className="body reveal d1">お問い合わせ内容をもとに、必要なサービスや検討すべき方向性を整理するための入口としてお問い合わせください。</p>
                <div className="hero-actions reveal d1">
                  <a href="#" className="btn btn-primary">お問い合わせ・相談をする <span className="arrow">→</span></a>
                  <a href="#business" className="btn btn-ghost">事業一覧から探す <span className="arrow">→</span></a>
                </div>
              </div>
              <div className="contact-cases reveal d1">
                <div className="contact-case">どのサービスを選べばいいか分からない</div>
                <div className="contact-case">複数の課題をまとめて相談したい</div>
                <div className="contact-case">まず自社の場合に何ができるか知りたい</div>
              </div>
            </div>
          </div>
        </section>

        {/* ============ FAQ ============ */}
        <section className="faq" id="faq">
          <div className="container">
            <div className="section-head">
              <span className="eyebrow reveal">FAQ</span>
              <Kinetic className="h2" lines={["問い合わせ前の、", "よくあるご質問。"]} />
            </div>
            <div className="faq-list">
              {FAQ.map(([q, question, answer]) => (
                <FaqItem key={q} q={q} question={question} answer={answer} />
              ))}
            </div>
          </div>
        </section>

        {/* ============ FINAL CTA ============ */}
        <section className="final-cta">
          <div className="glow" />
          <div className="container">
            <span className="eyebrow center reveal">To the Next Future</span>
            <Kinetic tag="h2" className="display" lines={["次の一歩を、", "ここから。"]} />
            <p className="body reveal d2">経営のこと。資金のこと。企業の評判のこと。WebやSNS、広告、開発のこと。課題の名前がまだはっきりしていなくても構いません。まずは、現在の状況と実現したい未来をお聞かせください。</p>
            <div className="reveal d2"><a href="#" className="btn btn-primary">お問い合わせ・相談をする <span className="arrow">→</span></a></div>
          </div>
        </section>
      </main>

      {/* ============ FOOTER ============ */}
      <footer className="site-footer">
        <div className="container">
          <div className="footer-top">
            <div className="footer-brand">
              <a href="#top" className="brand"><span className="dot" />MINAMOTO</a>
              <p>企業の次の未来を、アイデアと実行力でつくる。コーポレート領域とレグテック領域から、企業の課題に向き合う株式会社minamoto。</p>
            </div>
            <div className="footer-col">
              <h4>Business</h4>
              <a href="#corporate">公的資金調達</a>
              <a href="#corporate">経営コンサルティング</a>
              <a href="#corporate">風評被害対策</a>
              <a href="#regtech">アプリ開発</a>
              <a href="#regtech">ソーシャルメディア</a>
              <a href="#regtech">宣伝・広告 / リファラル</a>
            </div>
            <div className="footer-col">
              <h4>Company</h4>
              <a href="#philosophy">Philosophy</a>
              <a href="#identity">Identity</a>
              <a href="#company">会社概要</a>
              <a href="#faq">FAQ</a>
              <a href="#contact">お問い合わせ・相談</a>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© {year ?? ""} MINAMOTO INC. ALL RIGHTS RESERVED.</span>
            <span>CORPORATE × REGTECH — ONE TEAM / ONE SOLUTION</span>
          </div>
        </div>
      </footer>
    </>
  );
}
