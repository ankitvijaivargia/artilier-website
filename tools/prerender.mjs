/**
 * ARTILIER — pre-render media into hand-maintained pages. Idempotent.
 * Run last:  node tools/build.mjs && node tools/build2.mjs && node tools/build3.mjs
 * (build3.mjs imports this file at its end, so a normal build runs it.)
 *
 * Why (SEO audit, 27 Nov 2026): the homepage, /collection/, /leather/,
 * /stone/, /inlay/ and /wall-works/ shipped empty <media-slot> elements, so
 * every photograph on them existed only after slots.js ran. Crawlers that do
 * not execute JavaScript, and AI answer engines, saw no images at all.
 *
 * What it does: every empty <media-slot>/<image-slot> whose manifest entry is
 * an image gets the same <img data-pre> that tools/build.mjs writes on the
 * generated pages. slots.js already adopts that element instead of creating a
 * second one, so the authored crop and lazy loading are unchanged.
 *
 * Video slots get their poster as a real <img data-pre data-poster>. slots.js
 * keeps it on top of the film until the film plays, then removes it, so the
 * poster is the first paint (it no longer waits for the script and the
 * manifest) and below-the-fold posters load lazily instead of all at once.
 * No copy, alt text or image is invented — everything comes from manifest.json.
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';

const ROOT = join(dirname(new URL(import.meta.url).pathname), '..');
const manifest = JSON.parse(readFileSync(join(ROOT, 'assets/media/manifest.json'), 'utf8'));
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[c]));

/* Width hints by gallery figure class (pages.css). A lazy image gets
   `sizes="auto, …"`: browsers that support auto-sizes use the real slot
   width; the others skip "auto" and use the hint that follows it. */
const HINT = {
  full: '100vw',
  w: '(max-width:760px) 100vw, 67vw',
  q: '(max-width:760px) 50vw, 25vw',
  hero: '(max-width:760px) 50vw, 25vw',      // homepage hero mosaic tiles (.hs-*)
  default: '(max-width:760px) 100vw, 50vw',
};

const SKIP_DIRS = new Set(['.git', 'assets', 'content', 'tools', 'node_modules']);
const walk = dir => readdirSync(dir).flatMap(n => {
  const p = join(dir, n);
  if (statSync(p).isDirectory()) return SKIP_DIRS.has(n) ? [] : walk(p);
  return n.endsWith('.html') ? [p] : [];
});

const srcset = (m, up) => {
  if (!m.variants || !m.variants.length || !m.w) return '';
  const stem = m.src.split('?')[0].replace(/\.webp$/, '');
  const list = m.variants.map(w => `${up}assets/media/r/${stem}-${w}.webp ${w}w`);
  list.push(`${up}assets/media/${m.src} ${m.w}w`);
  return list.join(', ');
};

const SLOT = /<(media-slot|image-slot)(\s[^>]*)?>\s*<\/\1>/g;
let pages = 0, total = 0;

for (const file of walk(ROOT)) {
  const rel = relative(ROOT, file);
  const depth = rel.split('/').length - 1;
  const up = '../'.repeat(depth);
  const src0 = readFileSync(file, 'utf8');
  let n = 0;
  /* Only the first eager slot on a page (the hero) earns fetchpriority="high";
     other eager slots (the homepage hero mosaic) must not outrank it. */
  let firstEager = true;
  const out = src0.replace(SLOT, (whole, tag, attrs = '', offset) => {
    const id = (attrs.match(/\sid="([^"]+)"/) || [])[1];
    const m = id && manifest[id];
    if (!m || !m.src) return whole;
    const eager = /\sdata-eager\b/.test(attrs);
    const high = eager && firstEager;
    if (eager) firstEager = false;
    const isVideo = m.type === 'video' || /\.(mp4|webm|mov|m4v)(\?|$)/i.test(m.src);
    const pinned = /\ssrc="/.test(attrs);
    if (pinned && !isVideo) return whole;
    const alt = m.alt || (attrs.match(/\salt="([^"]*)"/) || [])[1] || '';
    const tail = `${alt ? ' role="img"' : ' aria-hidden="true"'} loading="${eager ? 'eager' : 'lazy'}" decoding="async"${high ? ' fetchpriority="high"' : ''}>`;
    if (isVideo) {
      if (!m.poster) return whole;
      n++;
      return `<${tag}${attrs}><img data-pre data-poster src="${esc(m.poster)}" alt="${esc(alt)}"${tail}</${tag}>`;
    }
    /* the nearest enclosing <figure class="…"> decides the width hint */
    const before = src0.slice(Math.max(0, offset - 400), offset);
    const fig = before.match(/<figure(?:\s+class="([^"]*)")?[^>]*>(?:(?!<\/figure>)[\s\S])*$/);
    const cls = fig && fig[1] ? fig[1].split(/\s+/) : [];
    const inHero = /<div class="hs-[a-z]">\s*$/.test(before);
    const hint = inHero ? HINT.hero : HINT[cls.find(c => HINT[c])] || HINT.default;
    const set = srcset(m, up);
    const dims = m.w && m.h ? ` width="${m.w}" height="${m.h}"` : '';
    const sizes = set ? ` sizes="${eager ? hint : 'auto, ' + hint}"` : '';
    n++;
    return `<${tag}${attrs}><img data-pre src="${up}assets/media/${esc(m.src)}"${set ? ` srcset="${esc(set)}"` : ''}${sizes}${dims} alt="${esc(alt)}"${tail}</${tag}>`;
  });
  if (n) { writeFileSync(file, out); pages++; total += n; }
}
console.log(`prerender: ${total} images written into ${pages} pages`);
