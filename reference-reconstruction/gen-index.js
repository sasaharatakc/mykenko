/* Generates the single-file index.html (and artifact.html for claude.ai) from the
   same globals.css + content used by the Next.js app, so the two stay in sync.
   Motion: momentum smooth-scroll, masked kinetic headings, fade-up+blur reveals, hero parallax. */
const fs = require("fs");
const path = require("path");

const CSS = fs.readFileSync(path.join(__dirname, "minamoto-next/app/globals.css"), "utf8");

const kin = (tag, cls, lines) =>
  `<${tag} class="kinetic ${cls}">` +
  lines.map((l, i) => `<span class="line-mask"><span class="line-inner" style="transition-delay:${(i * 0.09).toFixed(2)}s">${l}</span></span>`).join("") +
  `</${tag}>`;

const NAV = [["#philosophy","Philosophy"],["#business","Business"],["#solutions","Solutions"],["#company","Company"],["#faq","FAQ"]];
const MVV = [
  {label:"Our Mission",t:["企業の可能性を、","次の未来へつなげる。"],b:"目の前の課題を解決するだけではなく、その先にある成長まで考える。新しい技術やアイデアを磨き続け、企業が前へ進むための選択肢を増やしていきます。"},
  {label:"Our Vision",t:["挑戦が、","次の時代をつくる。"],b:"変化を恐れず、新しいサービスや事業に挑戦する。一つひとつの挑戦を未来につなげ、新しい価値が生まれる循環をつくります。"},
  {label:"Our Value",t:["考える。試す。","前へ進める。"],b:"事業を深く理解する。試行錯誤を続ける。結果に向き合う。一人では生まれない成果を、人と人の力をつなぐことで実現していきます。"},
];
const CORP = [["S/01","公的資金調達","融資・補助金・助成金など、公的な資金制度の活用を通じて、企業の財務面を支援します。"],["S/02","経営コンサルティング","企業が抱える経営課題を整理し、事業や集客の改善につながる選択肢を検討します。"],["S/03","風評被害対策","インターネット上の口コミや書き込み、誹謗中傷など、企業やブランドの信用に関わる問題への対策を支援します。"]];
const REG = [["R/01","アプリ開発","企業やサービスの目的に合わせたアプリケーション開発を提案します。"],["R/02","ソーシャルメディア","複数のソーシャルメディアを活用した運用・情報発信を支援します。"],["R/03","宣伝・広告","目的や予算を踏まえ、企業やサービスを届けるための広告施策を提案します。"],["R/04","リファラル","口コミや人から人への情報伝播を活用し、サービスやブランドの認知拡大につながる施策を提案します。"]];
const SOL = [["01","資金と経営について相談したい","公的資金調達や経営コンサルティングなど、企業経営に関わる領域から検討できます。"],["02","集客や認知を強化したい","SNS・広告・リファラルなど、情報を届ける方法から検討できます。"],["03","デジタルサービスを作りたい","アプリ開発をはじめ、事業目的から必要なデジタル施策を検討できます。"],["04","ネット上の評判について相談したい","口コミや書き込みなど、オンライン上の企業信用に関する課題を相談できます。"]];
const FAQ = [
  ["Q1","どのサービスに相談すればよいか分からなくても問い合わせできますか？","まずは現在抱えている課題や実現したいことをお問い合わせ内容としてお送りください。サービスを選ぶ前の段階でも、相談内容を整理するための入口としてお問い合わせいただけます。"],
  ["Q2","どのような事業を行っていますか？","大きくコーポレート部門とレグテック部門があり、公的資金調達、経営コンサルティング、風評被害対策、アプリ開発、ソーシャルメディア、広告、リファラルなどの事業を展開しています。"],
  ["Q3","複数の課題について相談できますか？","minamotoでは複数領域のサービスを展開し、さまざまな企業課題にワンストップで対応する方針を掲げています。具体的な対応範囲については、お問い合わせ時に確認してください。"],
  ["Q4","風評被害について相談できますか？","インターネット上の悪質な口コミや書き込みなど、風評・誹謗中傷に関する対策事業を提供しています。具体的な対応可否については、対象となる状況を添えてお問い合わせください。"],
  ["Q5","WebやSNSについて相談できますか？","ソーシャルメディア、広告、アプリ開発などのデジタル領域を扱っています。相談したい課題や目的をお問い合わせ時にお伝えください。"],
];
const MARQ = ["公的資金調達","経営コンサルティング","風評被害対策","アプリ開発","ソーシャルメディア","宣伝・広告","リファラル"];

const svc = (rows) => `<div class="svc-list">` + rows.map(([n,name,d])=>`<a class="svc-row reveal" href="#contact"><span class="num">${n}</span><span class="svc-body"><span class="svc-name">${name}</span><span class="svc-desc">${d}</span></span><span class="go">↗</span></a>`).join("") + `</div>`;

const BODY = `
<header class="site-header" id="header">
  <div class="container nav">
    <a href="#top" class="brand"><span class="dot"></span>MINAMOTO</a>
    <nav class="nav-links">${NAV.map(([h,l])=>`<a href="${h}">${l}</a>`).join("")}</nav>
    <div class="nav-cta">
      <a href="#contact" class="btn btn-primary">Contact <span class="arrow">→</span></a>
      <button class="nav-toggle" id="navToggle" aria-label="メニュー" aria-expanded="false"><span></span><span></span><span></span></button>
    </div>
  </div>
</header>
<div class="nav-panel" id="navPanel">
  ${NAV.map(([h,l])=>`<a href="${h}">${l}</a>`).join("")}
  <a href="#contact" class="btn btn-primary">お問い合わせ・相談をする <span class="arrow">→</span></a>
</div>

<main id="top">
  <section class="hero" id="hero">
    <div class="hero-glow"></div>
    <div class="hero-grid-bg"></div>
    <div class="container">
      <div class="hero-top">
        <span class="eyebrow reveal">MINAMOTO / TO THE NEXT FUTURE</span>
        <div class="hero-status reveal d1">CORPORATE × REGTECH<br>ONE TEAM / ONE SOLUTION<br>EST. MINAMOTO INC.</div>
      </div>
      ${kin("h1","display",["企業の次の未来を、","アイデアと実行力でつくる。"])}
      <div class="hero-lower">
        <div>
          <p class="lead reveal d2">経営、資金、評判、Web、SNS、広告、開発。企業が成長する過程で生まれるさまざまな課題に、ビジネスとテクノロジーの両面から向き合います。課題ごとにサービスを切り分けるのではなく、必要な支援を組み合わせながら、次の一歩へ。</p>
          <div class="hero-actions reveal d3">
            <a href="#contact" class="btn btn-primary">お問い合わせ・相談をする <span class="arrow">→</span></a>
            <a href="#business" class="btn btn-ghost">事業・サービスを見る <span class="arrow">→</span></a>
          </div>
        </div>
        <div class="hero-points reveal d3">
          <div class="hero-point"><span class="no">01</span><span>経営課題からデジタル施策まで幅広く対応</span></div>
          <div class="hero-point"><span class="no">02</span><span>複数の専門領域から必要な支援を選択</span></div>
          <div class="hero-point"><span class="no">03</span><span>企画だけで終わらず、実行につながる解決策へ</span></div>
        </div>
      </div>
    </div>
  </section>

  <div class="marquee" aria-hidden="true"><div class="marquee-track">${[...MARQ,...MARQ].map(m=>`<span>${m}</span>`).join("")}</div></div>

  <section class="philosophy" id="philosophy">
    <div class="container">
      <div class="philo-intro">
        <div class="section-head">
          <span class="eyebrow reveal">02 — Philosophy</span>
          ${kin("h2","h2",["常識の先にある、","まだ見えていない可能性へ。"])}
        </div>
        <div class="reveal d1">
          <p class="body">事業環境も、テクノロジーも、マーケティングも、変化し続けています。だからこそ、昨日までの正解をそのまま使うのではなく、新しい技術、新しい発想、新しい方法を取り入れながら、企業の未来に必要な選択肢を考え続ける。</p>
          <p class="body gap">minamotoは、多様な才能やアイデアを掛け合わせ、新しい価値を生み出しながら社会へ貢献していくことを企業理念として掲げています。</p>
          <a href="#" class="textlink mt">minamotoの考え方を見る <span class="arrow">→</span></a>
        </div>
      </div>
      <div class="mvv">${MVV.map((m,i)=>`<div class="mvv-item reveal${i?` d${i}`:""}"><span class="label">${m.label}</span><h3 class="h3">${m.t[0]}<br>${m.t[1]}</h3><p class="body">${m.b}</p></div>`).join("")}</div>
    </div>
  </section>

  <section class="business" id="business">
    <div class="container">
      <div class="section-head">
        <span class="eyebrow reveal">03 — Business</span>
        ${kin("h2","h2",["ひとつの課題だけを、","ひとつの方法だけで考えない。"])}
        <p class="body reveal d1">企業の課題は、ひとつの領域だけで完結するとは限りません。資金の問題が事業戦略につながり、ブランドの問題が集客につながり、デジタル施策が企業成長につながることもあります。minamotoでは、大きく「コーポレート部門」と「レグテック部門」の2領域から、企業ごとの課題に合わせたサービスを提供しています。</p>
      </div>
      <div class="domains">
        <div class="domain reveal"><div><span class="index-mark">01 / CORPORATE</span><h3 class="h3">企業経営を、前へ。</h3><p class="body">経営、資金、企業価値、評判。企業活動の土台となる課題に向き合い、事業を前へ進めるための支援を行います。</p></div><div class="domain-foot"><span class="domain-en">Corporate Division</span><a href="#corporate" class="textlink">コーポレート部門を見る <span class="arrow">→</span></a></div></div>
        <div class="domain reveal d1"><div><span class="index-mark">02 / REGTECH</span><h3 class="h3">テクノロジーで、事業を前へ。</h3><p class="body">Web、アプリ、SNS、広告。デジタルを単体施策として考えるのではなく、企業の目的から逆算した活用方法を考えます。</p></div><div class="domain-foot"><span class="domain-en">RegTech Division</span><a href="#regtech" class="textlink">レグテック部門を見る <span class="arrow">→</span></a></div></div>
      </div>
    </div>
  </section>

  <section class="corporate" id="corporate">
    <div class="container">
      <div class="section-head">
        <span class="eyebrow reveal">04 — Corporate</span>
        ${kin("h2","h2",["企業を支える土台から、","成長を考える。"])}
        <p class="body reveal d1">経営には、資金、集客、評判など複数の課題が同時に発生します。必要な領域を整理しながら、企業の状況に合わせた支援へつなげます。</p>
      </div>
      ${svc(CORP)}
    </div>
  </section>

  <section class="regtech" id="regtech">
    <div class="container">
      <div class="section-head">
        <span class="eyebrow reveal">05 — RegTech</span>
        ${kin("h2","h2",["デジタルを、","使うことから成果につなげる。"])}
        <p class="body reveal d1">新しいシステムを作る。SNSを運用する。広告を出す。大切なのは、それ自体ではありません。企業が達成したい目的から考え、必要なデジタル施策を選択すること。minamotoでは複数のデジタル領域から企業活動を支援しています。</p>
      </div>
      ${svc(REG)}
    </div>
  </section>

  <section class="solutions" id="solutions">
    <div class="container">
      <div class="section-head center">
        <span class="eyebrow center reveal">06 — One Team / One Solution</span>
        ${kin("h2","h2 narrow",["必要なのは、","サービスではなく解決策。"])}
        <p class="body reveal d1">企業の課題は、最初から「SNS」「広告」「コンサルティング」と分類されているわけではありません。まずは目的や課題を整理するところから。minamotoが持つ複数の事業領域から、必要な支援につなげます。</p>
      </div>
      <div class="solutions-grid">${SOL.map(([n,t,b],i)=>`<div class="solution reveal${i%2?" d1":""}"><div class="q"><span class="index-mark">${n}</span><span class="qtitle">${t}</span></div><p class="body">${b}</p></div>`).join("")}</div>
      <div class="solutions-cta reveal"><a href="#contact" class="btn btn-primary">自社の課題について相談する <span class="arrow">→</span></a></div>
    </div>
  </section>

  <section class="identity" id="identity">
    <div class="container">
      <div class="section-head">
        <span class="eyebrow reveal">07 — Identity</span>
        ${kin("h2","h2",["すべての仕事に、","minamotoらしい理由を。"])}
        <p class="body reveal d1">ブランドは、ロゴや言葉だけで生まれるものではありません。何を大切にするのか。誰と向き合うのか。どんな未来を目指すのか。その思想が一貫して積み重なった先に、企業の個性があります。minamotoでは、企業理念だけでなくブランドマークなどのVisual Identityにも、企業としての考え方を込めています。</p>
      </div>
      <div class="split">
        <div class="link-card reveal"><div><span class="label">Corporate Identity</span><h3 class="h3">私たちが、何のために存在するのか。</h3><p class="body">Mission、Vision、Valueを通して、minamotoが目指す未来と仕事に向き合う姿勢を紹介します。</p></div><a href="#" class="textlink">Corporate Identityを見る <span class="arrow">→</span></a></div>
        <div class="link-card reveal d1"><div><span class="label">Visual Identity</span><h3 class="h3">思想を、目に見えるかたちへ。</h3><p class="body">ブランドマークをはじめ、minamotoのブランドを形成する背景と考え方を紹介します。</p></div><a href="#" class="textlink">Visual Identityを見る <span class="arrow">→</span></a></div>
      </div>
    </div>
  </section>

  <section class="company" id="company">
    <div class="container">
      <div class="section-head">
        <span class="eyebrow reveal">08 — Company</span>
        ${kin("h2","h2",["未来をつくる会社を、","もっと知る。"])}
        <p class="body reveal d1">株式会社minamotoは、企業経営を支援するコーポレート領域と、デジタルを活用するレグテック領域を中心に事業を展開しています。会社情報、企業理念、事業内容など、minamotoについて詳しくご覧いただけます。</p>
      </div>
      <div class="split split-3">
        <div class="link-card reveal"><div><span class="label">Company Information</span><h3 class="h3">企業情報</h3><p class="body">会社概要や所在地など、株式会社minamotoの基本情報をご案内します。</p></div><a href="#" class="textlink">会社概要を見る <span class="arrow">→</span></a></div>
        <div class="link-card reveal d1"><div><span class="label">Philosophy</span><h3 class="h3">私たちの考え方</h3><p class="body">minamotoが大切にしているMission、Vision、Valueをご紹介します。</p></div><a href="#philosophy" class="textlink">Philosophyを見る <span class="arrow">→</span></a></div>
        <div class="link-card reveal d2"><div><span class="label">Business</span><h3 class="h3">私たちの事業</h3><p class="body">コーポレート部門・レグテック部門の各事業をご紹介します。</p></div><a href="#business" class="textlink">事業一覧を見る <span class="arrow">→</span></a></div>
      </div>
    </div>
  </section>

  <section class="contact-lead" id="contact">
    <div class="glow"></div>
    <div class="container">
      <div class="contact-inner">
        <div>
          <span class="eyebrow reveal">09 — Contact</span>
          ${kin("h2","h2",["まだ答えが決まっていなくても、","課題からご相談ください。"])}
          <p class="body reveal d1">お問い合わせ内容をもとに、必要なサービスや検討すべき方向性を整理するための入口としてお問い合わせください。</p>
          <div class="hero-actions reveal d1"><a href="#" class="btn btn-primary">お問い合わせ・相談をする <span class="arrow">→</span></a><a href="#business" class="btn btn-ghost">事業一覧から探す <span class="arrow">→</span></a></div>
        </div>
        <div class="contact-cases reveal d1">
          <div class="contact-case">どのサービスを選べばいいか分からない</div>
          <div class="contact-case">複数の課題をまとめて相談したい</div>
          <div class="contact-case">まず自社の場合に何ができるか知りたい</div>
        </div>
      </div>
    </div>
  </section>

  <section class="faq" id="faq">
    <div class="container">
      <div class="section-head"><span class="eyebrow reveal">FAQ</span>${kin("h2","h2",["問い合わせ前の、","よくあるご質問。"])}</div>
      <div class="faq-list">${FAQ.map(([q,question,a])=>`<div class="faq-item reveal"><button class="faq-q" aria-expanded="false"><span class="index-mark">${q}</span><span>${question}</span><span class="plus">+</span></button><div class="faq-a"><div class="faq-a-inner">${a}</div></div></div>`).join("")}</div>
    </div>
  </section>

  <section class="final-cta">
    <div class="glow"></div>
    <div class="container">
      <span class="eyebrow center reveal">To the Next Future</span>
      ${kin("h2","display",["次の一歩を、","ここから。"])}
      <p class="body reveal d2">経営のこと。資金のこと。企業の評判のこと。WebやSNS、広告、開発のこと。課題の名前がまだはっきりしていなくても構いません。まずは、現在の状況と実現したい未来をお聞かせください。</p>
      <div class="reveal d2"><a href="#" class="btn btn-primary">お問い合わせ・相談をする <span class="arrow">→</span></a></div>
    </div>
  </section>
</main>

<footer class="site-footer">
  <div class="container">
    <div class="footer-top">
      <div class="footer-brand">
        <a href="#top" class="brand"><span class="dot"></span>MINAMOTO</a>
        <p>企業の次の未来を、アイデアと実行力でつくる。コーポレート領域とレグテック領域から、企業の課題に向き合う株式会社minamoto。</p>
      </div>
      <div class="footer-col"><h4>Business</h4><a href="#corporate">公的資金調達</a><a href="#corporate">経営コンサルティング</a><a href="#corporate">風評被害対策</a><a href="#regtech">アプリ開発</a><a href="#regtech">ソーシャルメディア</a><a href="#regtech">宣伝・広告 / リファラル</a></div>
      <div class="footer-col"><h4>Company</h4><a href="#philosophy">Philosophy</a><a href="#identity">Identity</a><a href="#company">会社概要</a><a href="#faq">FAQ</a><a href="#contact">お問い合わせ・相談</a></div>
    </div>
    <div class="footer-bottom"><span>© <span id="year"></span> MINAMOTO INC. ALL RIGHTS RESERVED.</span><span>CORPORATE × REGTECH — ONE TEAM / ONE SOLUTION</span></div>
  </div>
</footer>`;

const SCRIPT = `
(function(){
  var doc=document, root=doc.documentElement;
  var y=new Date().getFullYear(); var ye=doc.getElementById('year'); if(ye) ye.textContent=y;

  // mobile nav
  var toggle=doc.getElementById('navToggle'), panel=doc.getElementById('navPanel');
  if(toggle&&panel){
    toggle.addEventListener('click',function(){var o=panel.classList.toggle('open');toggle.setAttribute('aria-expanded',o);});
    panel.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(){panel.classList.remove('open');toggle.setAttribute('aria-expanded','false');});});
  }

  // FAQ accordion
  doc.querySelectorAll('.faq-item').forEach(function(item){
    var q=item.querySelector('.faq-q'), a=item.querySelector('.faq-a');
    q.addEventListener('click',function(){var o=item.classList.toggle('open');q.setAttribute('aria-expanded',o);a.style.maxHeight=o?a.scrollHeight+'px':null;});
  });

  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var coarse=matchMedia('(pointer: coarse)').matches;
  if(!reduce) root.classList.add('motion');

  // scroll reveal (fade-up + kinetic lines)
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});},{threshold:0.14,rootMargin:'0px 0px -8% 0px'});
  doc.querySelectorAll('.reveal, .kinetic').forEach(function(el){io.observe(el);});

  // momentum smooth scroll + hero parallax
  var header=doc.getElementById('header'), glow=doc.querySelector('.hero-glow'), grid=doc.querySelector('.hero-grid-bg');
  var yy=window.scrollY, target=yy, active=false;
  function maxY(){return Math.max(0,doc.documentElement.scrollHeight-window.innerHeight);}
  function setHeader(){if(header)header.classList.toggle('scrolled',yy>24);}
  function parallax(){if(glow)glow.style.transform='translate3d(0,'+(yy*0.18)+'px,0)';if(grid)grid.style.transform='translate3d(0,'+(yy*0.10)+'px,0)';}
  function apply(){window.scrollTo(0,yy);parallax();setHeader();}
  function raf(){yy+=(target-yy)*0.09;if(Math.abs(target-yy)<0.4){yy=target;active=false;}apply();if(active)requestAnimationFrame(raf);}
  function kick(){if(!active){active=true;requestAnimationFrame(raf);}}
  if(!reduce&&!coarse){
    window.addEventListener('wheel',function(e){if(e.ctrlKey)return;e.preventDefault();target=Math.max(0,Math.min(maxY(),target+e.deltaY));kick();},{passive:false});
    window.addEventListener('scroll',function(){if(!active){yy=target=window.scrollY;parallax();setHeader();}},{passive:true});
  }else{
    window.addEventListener('scroll',function(){yy=window.scrollY;parallax();setHeader();},{passive:true});
  }

  // anchor smooth scroll (fixed-header offset)
  doc.querySelectorAll('a[href^="#"]').forEach(function(a){
    a.addEventListener('click',function(e){
      var id=a.getAttribute('href'); if(id.length<2)return;
      var t=doc.querySelector(id); if(!t)return;
      e.preventDefault();
      var top=t.getBoundingClientRect().top+window.scrollY-72; top=Math.max(0,Math.min(maxY(),top));
      if(reduce||coarse){window.scrollTo({top:top,behavior:reduce?'auto':'smooth'});}
      else{target=top;kick();}
    });
  });
  setHeader();
})();`;

const HEAD = `<title>株式会社minamoto｜TO THE NEXT FUTURE</title>
<meta name="description" content="株式会社minamoto — 企業の次の未来を、アイデアと実行力でつくる。コーポレート領域とレグテック領域から、資金・経営・評判・Web・SNS・広告・開発の課題に向き合います。" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Zen+Kaku+Gothic+New:wght@400;500;700;900&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
<style>
${CSS}
</style>`;

// artifact.html : head-contents + body + script (no doc wrapper; claude.ai skeleton adds it)
const artifact = `${HEAD}\n${BODY}\n<script>${SCRIPT}</script>\n`;
fs.writeFileSync(path.join(__dirname, "artifact.html"), artifact);

// index.html : full standalone document
const index = `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
${HEAD}
</head>
<body>
${BODY}
<script>${SCRIPT}</script>
</body>
</html>
`;
fs.writeFileSync(path.join(__dirname, "index.html"), index);

console.log("wrote index.html (" + index.length + " bytes) and artifact.html (" + artifact.length + " bytes)");
