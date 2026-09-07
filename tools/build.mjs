/**
 * Artilier — Phase 2 static generator.
 * Reads /content/*.json and emits crawlable HTML. No invented facts: every
 * sentence below is traceable to existing site copy or repository data.
 * Fields that are empty in the data (material, referenceSize, leadTime,
 * pileHeight, palette) are OMITTED, never guessed.
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';

const ROOT = join(dirname(new URL(import.meta.url).pathname), '..');
const HOST = 'https://artilier.co';
const j = f => JSON.parse(readFileSync(join(ROOT, 'content', f), 'utf8'));
const manifest = JSON.parse(readFileSync(join(ROOT, 'assets/media/manifest.json'), 'utf8'));

const designs = j('designs.json').designs.filter(d => d.published !== false);
const collections = j('collections.json').collections.filter(c => c.published !== false);
const taxonomy = j('taxonomy.json').terms.filter(t => t.published !== false);
const site = j('site.json');

const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[c]));
const n2 = n => String(n).padStart(2, '0');
/* Meta descriptions are trimmed on a word boundary — never mid-word. */
const clamp = (t, n) => t.length <= n ? t : t.slice(0, t.lastIndexOf(' ', n - 1)).replace(/[,;:]$/, '') + '…';
const by = (a,b) => (a.order||0)-(b.order||0);
const write = (rel, html) => { const p = join(ROOT, rel); mkdirSync(dirname(p), { recursive:true }); writeFileSync(p, html); return rel; };

/* Technique slug → category page slug. Only constructions with a real
   collection section get a category page. */
const CATS = [
  { slug:'hand-knotted', coll:'knotted' },
  { slug:'hand-tufted',  coll:'tufted'  },
  { slug:'flatweave',    coll:'flatweave' }
];

const indexable = designs.filter(d => d.detail === true);
const WITHHELD = new Set([]);
const shownIn = coll => designs.filter(d => d.collection === coll && !WITHHELD.has(d.slug)).sort(by);
const bySlug = s => designs.find(d => d.slug === s);

/* ── shell ──────────────────────────────────────────────────────────── */

const head = ({ title, desc, canonical, ogTitle, ogDesc, up, schema, robots }) => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${canonical}">${robots ? `\n<meta name="robots" content="${robots}">` : ''}
<meta property="og:type" content="website">
<meta property="og:site_name" content="Artilier">
<meta property="og:title" content="${esc(ogTitle || title)}">
<meta property="og:description" content="${esc(ogDesc || desc)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${HOST}/assets/og-artilier.png">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(ogTitle || title)}">
<meta name="twitter:description" content="${esc(ogDesc || desc)}">
<meta name="twitter:image" content="${HOST}/assets/og-artilier.png">
<meta name="theme-color" content="#F7F3EB">
<link rel="icon" href="${up}favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="${up}apple-touch-icon.png">
<link rel="sitemap" href="${up}sitemap.xml" type="application/xml">
<script type="application/ld+json">${JSON.stringify(schema)}</script>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Jost:wght@300;400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${up}assets/css/base.css?v=2">
<link rel="stylesheet" href="${up}assets/css/layout.css?v=2">
<link rel="stylesheet" href="${up}assets/css/responsive.css?v=2">
<link rel="stylesheet" href="${up}assets/css/collection-tweaks.css?v=2">
<script defer src="${up}assets/js/slots.js?v=4" data-manifest="${up}assets/media/manifest.json?v=5"></script>
</head>
<body>
<a class="skip" href="#main">Skip to content</a>`;

const nav = up => `
<nav id="nav" class="s">
  <a href="${up}index.html" class="logo">Artilier<em>Art. Made Material.</em></a>
  <ul class="nl">
    <li><a href="${up}collection/">Collection</a></li>
    <li><a href="${up}bespoke/">Bespoke</a></li>
    <li><a href="${up}materials/">Materials</a></li>
    <li><a href="${up}process/">Process</a></li>
    <li><a href="${up}trade/">Trade</a></li>
    <li><a href="${up}index.html#about">About</a></li>
  </ul>
  <button class="burger" id="burger" type="button" aria-expanded="false" aria-controls="mnav">Menu <span aria-hidden="true">≡</span></button>
  <a href="${up}index.html#brief" class="cta">Start a project <span>→</span></a>
</nav>
<div class="mnav" id="mnav" hidden>
  <a href="${up}index.html">Home</a><a href="${up}collection/">The collection</a><a href="${up}bespoke/">Bespoke development</a><a href="${up}materials/">Materials</a><a href="${up}process/">Process</a><a href="${up}craft/">The craft</a><a href="${up}trade/">Trade</a><a href="${up}index.html#about">About &amp; contact</a><a href="https://www.instagram.com/artilier.co/" target="_blank" rel="noopener">Instagram</a><a href="${up}index.html#brief" class="cta">Start a project <span>→</span></a>
</div>`;

const crumb = items => `
<div class="crumb" role="navigation" aria-label="Breadcrumb">${items.map((it,i) =>
  i === items.length-1
    ? `<span aria-current="page">${esc(it.name)}</span>`
    : `<a href="${it.href}">${esc(it.name)}</a><span aria-hidden="true">/</span>`).join('')}</div>`;

const footer = up => `
<footer>
  <div class="f-top">
    <div>
      <h4>Artilier</h4>
      <p>Art. Made Material. A design-led studio in New Delhi, working trade only. Our first collection is rugs — hand-knotted, hand-tufted and flatweave, made to any dimension, from our collection or developed from your own artwork.</p>
    </div>
    <div class="f-col"><h5>Collection</h5><ul>
      <li><a href="${up}collection/hand-knotted/">Hand-knotted rugs</a></li>
      <li><a href="${up}collection/hand-tufted/">Hand-tufted rugs</a></li>
      <li><a href="${up}collection/flatweave/">Flatweave rugs</a></li>
      <li><a href="${up}collection/">All designs</a></li>
    </ul></div>
    <div class="f-col"><h5>Studio</h5><ul>
      <li><a href="${up}bespoke/">Bespoke development</a></li>
      <li><a href="${up}materials/">Materials</a></li>
      <li><a href="${up}process/">Process</a></li>
      <li><a href="${up}craft/">The craft</a></li>
      <li><a href="${up}trade/">Trade</a></li>
    </ul></div>
    <div class="f-col"><h5>Contact</h5><ul>
      <li><a href="mailto:studio@artilier.co">studio@artilier.co</a></li>
      <li><a href="https://www.instagram.com/artilier.co/" target="_blank" rel="noopener">Instagram</a></li>
      <li><a href="${up}index.html#brief">Start a project</a></li>
      <li><a href="${up}index.html#about">New Delhi, India</a></li>
    </ul></div>
  </div>
  <div class="f-bot">
    <span>© 2026 Artilier — a studio of Art Avenue Pvt. Ltd.</span>
    <span>New Delhi · Woven across India</span>
    <span>Trade only · Any design, any dimension</span>
  </div>
</footer>

<a class="mcta" id="mcta" href="${up}index.html#brief">Start a project <span aria-hidden="true">→</span></a>
<script>
const bg=document.getElementById('burger'),mn=document.getElementById('mnav');
if(bg&&mn){
  const setMenu=o=>{o?mn.removeAttribute('hidden'):mn.setAttribute('hidden','');bg.setAttribute('aria-expanded',String(o));document.body.classList.toggle('menu-open',o);bg.firstChild.nodeValue=o?'Close ':'Menu '};
  bg.addEventListener('click',()=>setMenu(mn.hasAttribute('hidden')));
  mn.addEventListener('click',e=>{if(e.target.closest('a'))setMenu(false)});
  addEventListener('keydown',e=>{if(e.key==='Escape'&&!mn.hasAttribute('hidden')){setMenu(false);bg.focus()}});
  addEventListener('resize',()=>{if(innerWidth>1040&&!mn.hasAttribute('hidden'))setMenu(false)});
}
const mc=document.getElementById('mcta');
if(mc){addEventListener('scroll',()=>mc.classList.toggle('on',scrollY>innerHeight*.5),{passive:true})}
</script>
</body>
</html>`;

/* ── pre-rendered media ─────────────────────────────────────────────── */
/* A real <img> inside the slot so the markup is crawlable. slots.js adopts
   an existing [data-pre] image instead of appending a second one, so the
   authored crop and lazy-loading behaviour are unchanged. */
const slotImg = (id, ph, up, eager = false) => {
  const m = manifest[id] || {};
  const src = m.src ? `${up}assets/media/${m.src}` : '';
  if (!src || m.type === 'video') {
    return `<div class="ph"><media-slot id="${esc(id)}" shape="rect" placeholder="${esc(ph)}"></media-slot></div>`;
  }
  return `<div class="ph"><media-slot id="${esc(id)}" shape="rect" placeholder="${esc(ph)}"><img data-pre src="${esc(src)}" alt="${esc(m.alt||'')}"${m.alt?' role="img"':' aria-hidden="true"'} loading="${eager?'eager':'lazy'}" decoding="async"${eager?' fetchpriority="high"':''}></media-slot></div>`;
};

/* ── schema ─────────────────────────────────────────────────────────── */

const ORG = {
  '@type':'Organization','@id':`${HOST}/#organization`,'name':'Artilier','url':`${HOST}/`,
  'email':'studio@artilier.co','sameAs':['https://www.instagram.com/artilier.co/'],
  'description':"Design-led, trade-focused studio in New Delhi. First collection: rugs. Hand-knotted, hand-tufted and flatweave rugs, made to any dimension, from the studio collection or developed from a designer's own artwork.",
  'founder':{'@type':'Person','name':'Ankit Vijaivargia','jobTitle':'Founder — Manufacturing & Development'},
  'employee':{'@type':'Person','name':'Payal Samal','jobTitle':'Design Head — Interior Designer'},
  'address':{'@type':'PostalAddress','addressLocality':'New Delhi','addressCountry':'IN'},
  'areaServed':'Worldwide',
  'knowsAbout':['hand-knotted rugs','hand-tufted rugs','flatweave rugs','custom rug development','bespoke rugs for interior designers']
};
const WEBSITE = { '@type':'WebSite','@id':`${HOST}/#website`,'url':`${HOST}/`,'name':'Artilier','publisher':{'@id':`${HOST}/#organization`},'inLanguage':'en' };
const breadcrumb = items => ({ '@type':'BreadcrumbList','itemListElement':items.map((it,i)=>({ '@type':'ListItem','position':i+1,'name':it.name,'item':it.abs })) });

const graph = nodes => ({ '@context':'https://schema.org','@graph':[ORG, WEBSITE, ...nodes] });

/* ── design pages ───────────────────────────────────────────────────── */

const termName = s => (taxonomy.find(t => t.slug === s) || {}).name;
const catFor = d => CATS.find(c => c.coll === d.collection);

function designPage(d) {
  const up = '../../';
  const coll = collections.find(c => c.slug === d.collection) || {};
  const cat = catFor(d);
  const m = manifest[d.hero] || {};
  const url = `${HOST}/collection/${d.slug}/`;
  const catUrl = cat ? `${HOST}/collection/${cat.slug}/` : `${HOST}/collection/`;
  const terms = (d.terms||[]).map(termName).filter(Boolean);
  const peers = indexable.filter(x => x.collection === d.collection && x.slug !== d.slug).sort(by).slice(0,3);

  const crumbs = [
    { name:'Artilier', href:`${up}index.html`, abs:`${HOST}/` },
    { name:'The collection', href:`${up}collection/`, abs:`${HOST}/collection/` },
    ...(cat ? [{ name:coll.name, href:`${up}collection/${cat.slug}/`, abs:catUrl }] : []),
    { name:d.name, href:url, abs:url }
  ];

  /* Only properties with real values are emitted. material / referenceSize /
     pileHeight are absent from the data and are therefore absent here. */
  const work = {
    '@type':'CreativeWork','@id':`${url}#design`,'name':d.name,'url':url,
    'description':d.description,'creator':{'@id':`${HOST}/#organization`},
    'isPartOf':{'@id':`${catUrl}#collection`},
    'inLanguage':'en',
    ...(terms.length ? { 'keywords':terms.join(', ') } : {}),
    ...(d.construction ? { 'artMedium':d.construction } : {}),
    ...(m.src ? { 'image':{ '@type':'ImageObject','@id':`${url}#primaryimage`,
        'url':`${HOST}/assets/media/${String(m.src).split('?')[0]}`,
        ...(m.alt ? { 'caption':m.alt } : {}) } } : {})
  };
  if (d.material) work.material = d.material;

  const schema = graph([
    { '@type':'WebPage','@id':`${url}#webpage`,'url':url,'name':`${d.name} — ${d.construction} rug design`,
      'isPartOf':{'@id':`${HOST}/#website`},'primaryImageOfPage':m.src?{'@id':`${url}#primaryimage`}:undefined,
      'breadcrumb':{'@id':`${url}#breadcrumb`},'about':{'@id':`${url}#design`} },
    { ...breadcrumb(crumbs), '@id':`${url}#breadcrumb` },
    work
  ]);

  const facts = [
    ['Construction', d.construction],
    ['Materials & techniques', terms.filter(t=>t!==d.construction).join(' · ')],
    ['Material', d.material],
    ['Pile height', d.pileHeight],
    ['Reference size', d.referenceSize],
    ['Sizes', (d.availableSizes||[]).join(' · ')],
    ['Lead time', d.leadTime]
  ].filter(([,v]) => v).map(([k,v]) => `<div><b>${esc(k)}</b><span>${esc(v)}</span></div>`).join('\n        ');

  return head({
    title:`${d.name} — ${d.construction} rug design | Artilier`,
    desc:clamp(`${d.description} Made to order in any dimension and colourway.`, 158),
    canonical:url, up,
    ogTitle:`${d.name} — ${d.construction} rug by Artilier`,
    ogDesc:d.description, schema
  }) + nav(up) + crumb(crumbs.map(c=>({name:c.name,href:c.href}))) + `
<main id="main">
<header class="wp-hd">
  <div>
    <span class="lb">${esc([coll.name, d.construction].filter((v,i,a)=>v&&a.indexOf(v)===i).join(' · '))}</span>
    <h1 class="d1">${esc(d.name)}</h1>
  </div>
  <div>
    <p class="bd">${esc(d.description)}</p>
    <div class="wp-meta"><span><b>${esc(d.construction||'')}</b></span><span>Any dimension</span><span>Custom colourways</span></div>
  </div>
</header>
<section class="sec dtl">
  <div class="dtl-in">
    <div class="dtl-media">${slotImg(d.hero, `${d.name} — ${d.construction} rug`, up, true)}</div>
    <div>
      <div class="facts">
        ${facts}
      </div>
      <p class="bd" style="margin-top:clamp(24px,3vw,34px)">${esc(d.name)} is a starting point rather than a fixed product. It can be re-scaled, re-proportioned and re-coloured against your scheme, and woven to the dimensions the room needs. Yarn, colour and construction are confirmed in <a href="${up}process/">sampling</a> before a loom is set.</p>
      <div class="brief-a" style="margin-top:clamp(24px,3vw,34px)">
        <a href="${up}index.html#brief" class="cta">Enquire about this design <span>→</span></a>
        <a href="${up}collection/${cat?cat.slug+'/':''}" class="cta ol">More ${esc((coll.name||'').toLowerCase())} designs</a>
      </div>
    </div>
  </div>
</section>
${peers.length ? `<section class="sec">
  <div class="sec-hd"><div><span class="lb">Also in ${esc(coll.name||'this collection')}</span><h2 class="d2">Related <span class="it">designs.</span></h2></div></div>
  <div class="cg">${peers.map((p,i)=>`<figure class="cgi" data-design="${esc(p.slug)}">${slotImg(p.hero,`${p.name} — ${p.construction} rug`,up)}<figcaption><b><a href="${up}collection/${p.slug}/">${esc(p.name)}</a></b><span></span><span class="cgn">${n2(i+1)}</span></figcaption></figure>`).join('')}</div>
</section>` : ''}
<div class="backhome">
  <a href="${up}collection/" class="cta ol"><span aria-hidden="true">←</span> Back to the collection</a>
  <div class="backhome-l"><a href="${up}bespoke/">Bespoke development</a><a href="${up}materials/">Materials</a><a href="${up}process/">How we work</a><a href="${up}trade/">Trade</a></div>
</div>
</main>` + footer(up);
}

/* ── category pages ─────────────────────────────────────────────────── */

function categoryPage(cat) {
  const up = '../../';
  const coll = collections.find(c => c.slug === cat.coll);
  const ds = shownIn(cat.coll);
  const linked = ds.filter(d => d.detail === true);
  const url = `${HOST}/collection/${cat.slug}/`;
  const crumbs = [
    { name:'Artilier', href:`${up}index.html`, abs:`${HOST}/` },
    { name:'The collection', href:`${up}collection/`, abs:`${HOST}/collection/` },
    { name:coll.name, href:url, abs:url }
  ];
  const schema = graph([
    { '@type':'CollectionPage','@id':`${url}#collection`,'url':url,'name':`${coll.name} rugs — Artilier`,
      'isPartOf':{'@id':`${HOST}/#website`},'breadcrumb':{'@id':`${url}#breadcrumb`},
      'about':{'@id':`${HOST}/#organization`},
      'mainEntity':{ '@type':'ItemList','numberOfItems':linked.length,
        'itemListElement':linked.map((d,i)=>({ '@type':'ListItem','position':i+1,'name':d.name,'url':`${HOST}/collection/${d.slug}/` })) } },
    { ...breadcrumb(crumbs), '@id':`${url}#breadcrumb` }
  ]);
  return head({
    title:`${coll.name} rugs — custom ${cat.slug} rug designs | Artilier`,
    desc:`${coll.intro} ${ds.length} ${coll.name.toLowerCase()} designs from Artilier, a trade rug design studio in New Delhi — each woven to order in any dimension and colourway.`,
    canonical:url, up, schema
  }) + nav(up) + crumb(crumbs.map(c=>({name:c.name,href:c.href}))) + `
<main id="main">
<header class="wp-hd">
  <div>
    <span class="lb">${esc(coll.eyebrow)} · The collection</span>
    <h1 class="d1">${esc(coll.title)}<span class="it">${esc(coll.titleItalic)}</span></h1>
  </div>
  <div>
    <p class="bd">${esc(coll.intro)}</p>
    <p class="bd" style="margin-top:16px">${esc(coll.subtitle)} Every design here is made to order: re-coloured, re-scaled and re-proportioned for the project. Nothing is stock.</p>
    <div class="wp-meta"><span><b>${ds.length} designs</b></span><span>Any dimension</span><span>Custom colourways</span></div>
  </div>
</header>
<section class="cgs" data-subcategory="${esc(cat.coll)}">
  <div class="cg">${ds.map((d,i)=>`<figure class="cgi" data-design="${esc(d.slug)}">${slotImg(d.hero,`${d.name} — ${d.construction} rug`,up,i<3)}<figcaption><b>${d.detail === true ? `<a href="${up}collection/${d.slug}/">${esc(d.name)}</a>` : esc(d.name)}</b><span></span><span class="cgn">${n2(i+1)}</span></figcaption></figure>`).join('')}</div>
  <p class="cg-note">${esc(String(coll.note||'').replace('{n}', ds.length))}</p>
</section>
<div class="backhome">
  <a href="${up}collection/" class="cta ol"><span aria-hidden="true">←</span> The whole collection</a>
  <div class="backhome-l">${CATS.filter(c=>c.slug!==cat.slug).map(c=>`<a href="${up}collection/${c.slug}/">${esc((collections.find(x=>x.slug===c.coll)||{}).name)}</a>`).join('')}<a href="${up}bespoke/">Bespoke development</a><a href="${up}materials/">Materials</a></div>
</div>
</main>` + footer(up);
}

/* ── run ────────────────────────────────────────────────────────────── */
const KEEP = new Set([...indexable.map(d=>d.slug), ...CATS.map(c=>c.slug)]);
let pruned = 0;
for (const e of readdirSync(ROOT+'/collection', { withFileTypes:true })) {
  if (!e.isDirectory() || KEEP.has(e.name)) continue;
  rmSync(ROOT+'/collection/'+e.name, { recursive:true, force:true });
  pruned++;
}
console.log('  pruned:     '+pruned);
const built = [];
for (const d of indexable) built.push(write(`collection/${d.slug}/index.html`, designPage(d)));
for (const c of CATS) built.push(write(`collection/${c.slug}/index.html`, categoryPage(c)));
console.log(`built ${built.length} pages`);
console.log(`  designs:    ${indexable.length}`);
console.log(`  categories: ${CATS.length}`);
export { indexable, CATS, HOST, esc, head, nav, footer, crumb, slotImg, graph, breadcrumb, write, collections, designs, manifest, site, n2, by };
