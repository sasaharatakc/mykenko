const { chromium } = require('playwright-core');
const path = require('path');

(async () => {
  const browser = await chromium.launch({
    executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    args: ['--no-sandbox','--disable-setuid-sandbox','--force-color-profile=srgb']
  });
  const url = 'file://' + path.resolve(__dirname, 'index.html');
  const shots = [
    { name: 'desktop', width: 1440, height: 1200 },
    { name: 'mobile',  width: 390,  height: 844  },
  ];
  for (const s of shots) {
    const ctx = await browser.newContext({ viewport: { width: s.width, height: s.height }, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(300);
    // reveal-all: force reveal classes so full-page capture isn't blank below fold
    await page.addStyleTag({ content: '.reveal{opacity:1!important;transform:none!important}' });
    // fold shot
    await page.screenshot({ path: path.resolve(__dirname, 'output', `${s.name}-fold.png`) });
    // scroll to trigger any lazy states then settle
    await page.evaluate(async () => {
      await new Promise(r => { let y=0; const t=setInterval(()=>{window.scrollTo(0,y); y+=600; if(y>document.body.scrollHeight){clearInterval(t);r();}},30); });
    });
    await page.waitForTimeout(400);
    await page.evaluate(()=>window.scrollTo(0,0));
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.resolve(__dirname, 'output', `${s.name}-full.png`), fullPage: true });
    await ctx.close();
    console.log('captured', s.name);
  }
  await browser.close();
})();
