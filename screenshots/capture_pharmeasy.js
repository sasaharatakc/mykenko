const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const OUT = process.env.OUT_DIR;
const START = 'https://pharmeasy.in/';
const MAX = parseInt(process.env.MAX || '40', 10);

function slug(u) {
  const url = new URL(u);
  let p = (url.pathname + url.search).replace(/^\/+/, '').replace(/\/+$/, '');
  p = p.replace(/[^a-zA-Z0-9._-]+/g, '_');
  if (!p) p = 'home';
  return p.slice(0, 120);
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({
    executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    args: ['--no-sandbox'],
  });
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36',
  });
  const page = await ctx.newPage();

  const visited = new Set();
  const queue = [START];
  const manifest = [];

  // First pass: load homepage, gather same-domain links
  async function collectLinks() {
    try {
      const hrefs = await page.$$eval('a[href]', els => els.map(e => e.href));
      for (const h of hrefs) {
        try {
          const u = new URL(h);
          if (u.hostname === 'pharmeasy.in' && !u.pathname.match(/\.(pdf|jpg|png|zip)$/i)) {
            const clean = u.origin + u.pathname;
            if (!visited.has(clean) && !queue.includes(clean)) queue.push(clean);
          }
        } catch {}
      }
    } catch {}
  }

  let count = 0;
  while (queue.length && count < MAX) {
    const url = queue.shift();
    if (visited.has(url)) continue;
    visited.add(url);
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 });
    } catch (e) {
      try { await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 }); }
      catch (e2) { console.log('FAIL', url, e2.message); continue; }
    }
    // scroll to trigger lazy load
    try {
      await page.evaluate(async () => {
        await new Promise(res => {
          let y = 0; const step = 600;
          const t = setInterval(() => {
            window.scrollBy(0, step); y += step;
            if (y >= document.body.scrollHeight) { clearInterval(t); res(); }
          }, 100);
        });
      });
      await page.waitForTimeout(800);
      await page.evaluate(() => window.scrollTo(0, 0));
    } catch {}
    const name = String(count).padStart(2, '0') + '_' + slug(url) + '.png';
    const file = path.join(OUT, name);
    try {
      await page.screenshot({ path: file, fullPage: true });
      manifest.push({ n: count, url, file: name });
      console.log('OK', name, url);
      count++;
    } catch (e) { console.log('SHOT-FAIL', url, e.message); }
    if (count === 1) await collectLinks();
  }

  fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2));
  await browser.close();
  console.log('DONE', count, 'pages');
})();
