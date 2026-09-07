/**
 * Artilier — Phase 2 source patches. Idempotent: safe to re-run.
 * Applies the non-generated edits (indexing flags, renderer changes,
 * redirects, internal links) that the page generators depend on.
 */
import { readFileSync, writeFileSync } from 'node:fs';
const rd = f => readFileSync(f, 'utf8');
const wr = (f, s) => writeFileSync(f, s);
/* Python's str.replace is global; JS's String.replace(string, …) is not.
   These link rewrites must hit every occurrence, so use split/join. */
const all = (s, a, b) => s.split(a).join(b);
const sub = (s, a, b, label) => {
  if (s.includes(b)) return s;                 // already applied
  if (!s.includes(a)) throw new Error('patch anchor missing: ' + label);
  return s.replace(a, b);
};

/* 1. Indexing decision lives in the data, not in the templates. */
const EXCLUDE = new Set([
  'vyom','chhaap','bel','gaanth','soum','beel','loop','khadi', // "other techniques": not a standing range
  'parat'                                                       // ct3 carries a supplier tearsheet/SKU
]);
{
  const d = JSON.parse(rd('content/designs.json'));
  for (const r of d.designs) r.detail = !EXCLUDE.has(r.slug);
  wr('content/designs.json', JSON.stringify(d, null, 2) + '\n');
  console.log('designs.json: detail=true on', d.designs.filter(r => r.detail).length);
}

/* 2. slots.js — adopt a pre-rendered <img> rather than appending a second one. */
{
  let s = rd('assets/js/slots.js');
  s = sub(s,
`    _image(src, entry) {
      const img = document.createElement('img');
      img.src = src;
      img.alt = entry.alt || this.getAttribute('alt') || '';
      img.loading = this.hasAttribute('data-eager') ? 'eager' : 'lazy';
      if (img.loading === 'eager') img.fetchPriority = 'high';
      img.decoding = 'async';
      if (entry.alt || this.getAttribute('alt')) img.setAttribute('role', 'img'); else img.setAttribute('aria-hidden', 'true');
      this.appendChild(img);`,
`    _image(src, entry) {
      /* Pages built by tools/build.mjs ship a real <img data-pre> inside the
         slot so the markup is crawlable before JavaScript runs. Adopt it —
         creating a second <img> here would double every image on the page. */
      const pre = this.querySelector('img[data-pre]');
      const img = pre || document.createElement('img');
      if (!pre) {
        img.src = src;
        img.alt = entry.alt || this.getAttribute('alt') || '';
        img.loading = this.hasAttribute('data-eager') ? 'eager' : 'lazy';
        if (img.loading === 'eager') img.fetchPriority = 'high';
        img.decoding = 'async';
        if (entry.alt || this.getAttribute('alt')) img.setAttribute('role', 'img'); else img.setAttribute('aria-hidden', 'true');
        this.appendChild(img);
      } else if (entry.alt && !img.getAttribute('alt')) {
        img.alt = entry.alt;
      }`, 'slots._image');
  wr('assets/js/slots.js', s);
}

/* 3. content.js — respect pre-rendered markup; emit clean design URLs. */
{
  let s = rd('assets/js/content.js');
  s = sub(s,
    '      ? `<a href="design.html?d=${encodeURIComponent(d.slug)}">${esc(d.name)}</a>`',
    '      ? `<a href="${encodeURIComponent(d.slug)}/">${esc(d.name)}</a>`', 'card link');
  s = sub(s,
`    root.innerHTML = colls.map((c, i) =>
      section(c, all.filter(d => d.collection === c.slug).sort(by), i)).join('\\n');

    const filt = el('#filt-in');
    if (filt) {`,
`    /* The collection is pre-rendered at build time so it is crawlable without
       JavaScript. Re-rendering it here would throw that markup away and cause
       a visible flash, so the built HTML is left in place and only the
       derived UI below is wired up. */
    if (!root.dataset.prerendered) {
      root.innerHTML = colls.map((c, i) =>
        section(c, all.filter(d => d.collection === c.slug).sort(by), i)).join('\\n');
    }

    const filt = el('#filt-in');
    if (filt && !filt.children.length) {`, 'renderCollection');
  wr('assets/js/content.js', s);
}

/* 4. Legacy query-string design URLs forward to the canonical page. */
{
  let s = rd('collection/design.html');
  if (!s.includes('ARTILIER_PHASE2_REDIRECT')) {
    s = s.replace('</head>', `<script>/* ARTILIER_PHASE2_REDIRECT — design.html?d=<slug> is superseded by
   /collection/<slug>/. Forward before anything renders; the page keeps its
   noindex so the legacy URL never competes with the canonical one. */
(function(){var d=new URLSearchParams(location.search).get('d');
if(d&&/^[a-z0-9-]+$/.test(d))location.replace('../collection/'+d+'/');})();</script>
</head>`);
    wr('collection/design.html', s);
  }
}

/* 5. _redirects must not shadow the new pages. */
{
  let s = rd('_redirects');
  for (const l of ['/bespoke      /#bespoke       301\n','/trade        /#trade         301\n',
                   '/materials    /#materials     301\n','/process      /#process       301\n']) s = s.replace(l, '');
  s = sub(s, '# Legacy design-environment filenames',
`# Real pages now exist at /bespoke/ /trade/ /materials/ /process/ /craft/ —
# they must NOT be redirected to homepage anchors. Non-slash forms normalise
# onto the canonical trailing-slash URL.
/bespoke      /bespoke/       301
/trade        /trade/         301
/materials    /materials/     301
/process      /process/       301
/craft        /craft/         301
/collection   /collection/    301
/collection/index.html        /collection/   301

# Legacy design-environment filenames`, '_redirects');
  wr('_redirects', s);
}

/* 6. Homepage + collection: link to the real pages. */
{
  let s = rd('index.html');
  s = sub(s,
`    <div class="f-col"><h5>Site</h5><ul>
      <li><a href="collection/index.html">Collection</a></li>
      <li><a href="#bespoke">Bespoke development</a></li>
      <li><a href="#studio">The studio</a></li>
      <li><a href="#process">Process</a></li><li><a href="#about">About &amp; contact</a></li>
    </ul></div>`,
`    <div class="f-col"><h5>Studio</h5><ul>
      <li><a href="collection/">Collection</a></li>
      <li><a href="bespoke/">Bespoke development</a></li>
      <li><a href="process/">Process</a></li>
      <li><a href="craft/">The craft</a></li>
      <li><a href="trade/">Trade</a></li>
    </ul></div>`, 'home footer site col');
  s = sub(s,
`      <li><a href="collection/index.html#knotted">Hand-knotted</a></li><li><a href="collection/index.html#tufted">Hand-tufted</a></li>
      <li><a href="collection/index.html#flatweave">Flatweave</a></li><li><a href="#materials">Rug materials</a></li>`,
`      <li><a href="collection/hand-knotted/">Hand-knotted</a></li><li><a href="collection/hand-tufted/">Hand-tufted</a></li>
      <li><a href="collection/flatweave/">Flatweave</a></li><li><a href="materials/">Rug materials</a></li>`, 'home footer construction col');
  s = all(s, '<a href="#materials">Materials</a><a href="#process">Process</a>',
              '<a href="materials/">Materials</a><a href="process/">Process</a><a href="craft/">The craft</a>');
  s = all(s, '<a href="collection/index.html">The collection</a>','<a href="collection/">The collection</a>');
  s = all(s, '<a href="#bespoke">Bespoke rug development</a>','<a href="bespoke/">Bespoke rug development</a>');
  s = all(s, '<li><a href="collection/index.html">Collection</a></li>','<li><a href="collection/">Collection</a></li>');
  s = all(all(s, 'slots.js?v=3','slots.js?v=4'), 'content.js?v=2','content.js?v=3');
  wr('index.html', s);
}
{
  let s = rd('collection/index.html');
  const L = [
    ['<a href="../index.html#bespoke">Bespoke development</a>','<a href="../bespoke/">Bespoke development</a>'],
    ['<a href="../index.html#materials">Rug materials</a>','<a href="../materials/">Rug materials</a>'],
    ['<a href="../index.html#process">How we work</a>','<a href="../process/">How we work</a>'],
    ['<li><a href="../index.html#process">Process</a></li>','<li><a href="../process/">Process</a></li>'],
    ['<li><a href="#knotted">Hand-knotted designs</a></li>','<li><a href="hand-knotted/">Hand-knotted designs</a></li>'],
    ['<li><a href="#tufted">Hand-tufted designs</a></li>','<li><a href="hand-tufted/">Hand-tufted designs</a></li>'],
    ['<li><a href="#flatweave">Flatweave designs</a></li>','<li><a href="flatweave/">Flatweave designs</a></li>']
  ];
  for (const [a,b] of L) s = all(s, a, b);
  wr('collection/index.html', s);
}
console.log('source patches applied');
