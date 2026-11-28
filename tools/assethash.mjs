/**
 * ARTILIER — content-hash cache keys for CSS and JS. Idempotent.
 * Imported at the end of build3.mjs, after every page is written.
 *
 * Why (SEO audit, 27 Nov 2026): /assets/css/* and /assets/js/* were cached
 * for one hour because their ?v= numbers were bumped by hand, and a forgotten
 * bump once froze the stylesheets. Every reference now carries the first 10
 * hex characters of the file's SHA-256, so a changed file always gets a new
 * URL and _headers can cache these folders for a year (immutable).
 *
 * Hand-written ?v= numbers in the templates are overwritten here; no need to
 * bump them any more.
 */
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, dirname } from 'node:path';

const ROOT = join(dirname(new URL(import.meta.url).pathname), '..');
const hash = {};
for (const dir of ['css', 'js']) {
  for (const n of readdirSync(join(ROOT, 'assets', dir))) {
    hash[`${dir}/${n}`] = createHash('sha256').update(readFileSync(join(ROOT, 'assets', dir, n))).digest('hex').slice(0, 10);
  }
}

const SKIP = new Set(['.git', 'assets', 'content', 'tools', 'node_modules']);
const walk = d => readdirSync(d).flatMap(n => {
  const p = join(d, n);
  if (statSync(p).isDirectory()) return SKIP.has(n) ? [] : walk(p);
  return n.endsWith('.html') ? [p] : [];
});

const REF = /(assets\/)(css|js)\/([A-Za-z0-9._-]+\.(?:css|js))(?:\?v=[0-9A-Za-z]+)?/g;
let files = 0, missing = new Set();
for (const f of walk(ROOT)) {
  const s = readFileSync(f, 'utf8');
  const out = s.replace(REF, (m, a, dir, name) => {
    const h = hash[`${dir}/${name}`];
    if (!h) { missing.add(`${dir}/${name}`); return m; }
    return `${a}${dir}/${name}?v=${h}`;
  });
  if (out !== s) { writeFileSync(f, out); files++; }
}
if (missing.size) throw new Error('assethash: referenced but missing: ' + [...missing].join(', '));
console.log(`assethash: ${Object.keys(hash).length} assets, ${files} pages updated`);
