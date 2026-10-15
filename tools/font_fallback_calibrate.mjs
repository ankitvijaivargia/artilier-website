// Measure, in Chromium, how wide each English page's real text sets in the brand
// font versus the metric-matched fallback faces currently in assets/css/fonts.css.
// Prints "family|weight|style ratio" (brand width / fallback width, weighted by
// font size). With --update, multiplies the ratios into
// tools/font_fallback_calibration.txt; then re-run tools/font_fallbacks.py.
// Uppercase Jost text is measured against the "Jost Caps" faces, everything else
// against the ordinary faces. See tools/font_fallbacks.py for the full procedure.
//   (from the repo root) python3 -m http.server 8000 &
//   node tools/font_fallback_calibrate.mjs http://localhost:8000 [--update]
// Needs puppeteer, the fallback fonts installed locally, and
// PUPPETEER_EXECUTABLE_PATH if Chrome is not where puppeteer expects it.
import puppeteer from 'puppeteer';
import fs from 'fs';

const base = process.argv[2], update = process.argv.includes('--update');
const root = new URL('../', import.meta.url);
const sitemap = fs.readFileSync(new URL('sitemap.xml', root), 'utf8');
const pages = [...new Set([...sitemap.matchAll(/<loc>https:\/\/artilier\.co(\/[^<]*)<\/loc>/g)].map(m => m[1]))]
  .filter(p => !p.startsWith('/fr/'));
const browser = await puppeteer.launch({ executablePath: process.env.PUPPETEER_EXECUTABLE_PATH, args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setRequestInterception(true);
page.on('request', r => (/\/assets\/js\//.test(r.url()) ? r.abort() : r.continue()));
const acc = {};
for (const path of pages) {
  await page.goto(base + path, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  const rows = await page.evaluate(() => {
    const c = document.createElement('canvas').getContext('2d'), out = [];
    for (const e of document.querySelectorAll('body *')) {
      if (e.closest('script,style,.mnav')) continue;
      const own = [...e.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join('').replace(/\s+/g, ' ').trim();
      if (own.length < 3) continue;
      const cs = getComputedStyle(e), fam = cs.fontFamily.replace(/"/g, '');
      const caps = cs.textTransform === 'uppercase';
      let brand, fbs;
      if (fam.startsWith('Cormorant Garamond')) { brand = 'Cormorant Garamond'; fbs = ['Cormorant Garamond Fallback', 'Cormorant Garamond Fallback Noto']; }
      else if (fam.startsWith('Jost, Jost Caps')) { brand = 'Jost'; fbs = ['Jost Caps Fallback', 'Jost Caps Fallback Roboto']; }
      else if (fam.startsWith('Jost')) { brand = 'Jost'; fbs = ['Jost Fallback', 'Jost Fallback Roboto']; }
      else continue;
      if (caps && fbs[0] === 'Jost Fallback') continue;   // stray uppercase outside --s-caps: not representative of either set
      const t = caps ? own.toUpperCase() : own;
      const size = parseFloat(cs.fontSize), w = cs.fontWeight, st = cs.fontStyle;
      const face = +w >= 500 ? 500 : +w > 300 ? 400 : 300;   // the face the browser picks: faces exist at 300/400/500
      c.font = `${st} ${w} 100px "${brand}"`; const bw = c.measureText(t).width;
      for (const fb of fbs) { c.font = `${st} ${w} 100px "${fb}"`; out.push([fb, face, st, bw * size, c.measureText(t).width * size]); }
    }
    return out;
  });
  for (const [fb, w, st, b, f] of rows) { const k = `${fb}|${w}|${st}`; (acc[k] ??= [0, 0, 0]); acc[k][0] += b; acc[k][1] += f; acc[k][2]++; }
}
await browser.close();
const calFile = new URL('tools/font_fallback_calibration.txt', root);
const cal = {};
if (fs.existsSync(calFile)) for (const l of fs.readFileSync(calFile, 'utf8').split('\n')) if (l.trim() && !l.startsWith('#')) { const i = l.lastIndexOf(' '); cal[l.slice(0, i)] = +l.slice(i + 1); }
for (const [k, [b, f, n]] of Object.entries(acc).sort()) {
  const r = b / f; console.log(`${k.padEnd(42)} ${r.toFixed(4)}  (n=${n})`);
  if (update) cal[k] = (cal[k] ?? 1) * r;
}
if (update) {
  fs.writeFileSync(calFile, '# brand width / fallback width corrections, from tools/font_fallback_calibrate.mjs --update\n' +
    Object.entries(cal).sort().map(([k, v]) => `${k} ${v.toFixed(4)}`).join('\n') + '\n');
  console.log('updated', calFile.pathname);
}
