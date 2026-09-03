const { chromium } = require('/home/user/mykenko/reference-reconstruction/node_modules/playwright-core');
(async () => {
  const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args:['--no-sandbox','--force-color-profile=srgb'] });
  const errs=[];
  const ctx = await b.newContext({ viewport:{width:1440,height:1200} });
  const p = await ctx.newPage();
  p.on('pageerror',e=>errs.push('pageerror: '+e));
  p.on('console',m=>{ if(m.type()==='error' && !/net::ERR|404/.test(m.text())) errs.push(m.text()); });
  await p.goto('http://localhost:3211/', { waitUntil:'networkidle' });
  await p.evaluate(()=>document.fonts.ready);
  await p.waitForTimeout(1400); // let hero kinetic settle
  await p.screenshot({ path:'output-next/motion-hero.png' });
  // scroll into philosophy to trigger kinetic there, then capture
  await p.evaluate(()=>window.scrollTo(0, document.querySelector('#business').getBoundingClientRect().top+window.scrollY-100));
  await p.waitForTimeout(1300);
  await p.screenshot({ path:'output-next/motion-business.png' });
  // check kinetic actually present + motion class + at-rest visibility values
  const info = await p.evaluate(()=>{
    const h1 = document.querySelector('.hero .kinetic');
    const li = h1 && h1.querySelector('.line-inner');
    const cs = li && getComputedStyle(li);
    return {
      motionClass: document.documentElement.classList.contains('motion'),
      kineticLines: document.querySelectorAll('.kinetic .line-inner').length,
      heroLineTransform: cs ? cs.transform : 'none',
      revealInCount: document.querySelectorAll('.reveal.in').length,
      overflow: document.documentElement.scrollWidth>innerWidth
    };
  });
  console.log(JSON.stringify(info));
  console.log('JS errors:', errs.length, errs.slice(0,4));
  await b.close();
})();
