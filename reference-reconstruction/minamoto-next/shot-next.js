const { chromium } = require('/home/user/mykenko/reference-reconstruction/node_modules/playwright-core');
const path = require('path');
(async () => {
  const browser = await chromium.launch({
    executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    args: ['--no-sandbox','--disable-setuid-sandbox','--force-color-profile=srgb']
  });
  const out = path.resolve(__dirname, 'output-next');
  require('fs').mkdirSync(out, { recursive: true });
  const errs = [];
  for (const s of [{name:'desktop',width:1440,height:1200},{name:'mobile',width:390,height:844}]) {
    const ctx = await browser.newContext({ viewport:{width:s.width,height:s.height}, deviceScaleFactor:1 });
    const page = await ctx.newPage();
    page.on('pageerror', e => errs.push(s.name+': '+e));
    page.on('console', m => { if (m.type()==='error' && !/net::ERR/.test(m.text())) errs.push(s.name+': '+m.text()); });
    await page.goto('http://localhost:3210/', { waitUntil:'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(out, `${s.name}-fold.png`) });
    await page.evaluate(async () => { await new Promise(r=>{let y=0;const t=setInterval(()=>{scrollTo(0,y);y+=600;if(y>document.body.scrollHeight){clearInterval(t);r();}},25);}); });
    await page.waitForTimeout(400);
    await page.evaluate(()=>scrollTo(0,0));
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(out, `${s.name}-full.png`), fullPage:true });
    const of = await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth?document.documentElement.scrollWidth-innerWidth:0);
    console.log(s.name, 'overflow', of);
    await ctx.close();
  }
  console.log('JS errors:', errs.length, errs.slice(0,5));
  await browser.close();
})();
