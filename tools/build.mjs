import { createHash } from 'node:crypto';
/**
 * Artilier — Phase 2 static generator.
 * Reads /content/*.json and emits crawlable HTML. No invented facts: every
 * sentence below is traceable to existing site copy or repository data.
 * Fields that are empty in the data (material, referenceSize, leadTime,
 * pileHeight, palette) are OMITTED, never guessed.
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync, rmSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';

const ROOT = join(dirname(new URL(import.meta.url).pathname), '..');
const HOST = 'https://artilier.co';
const j = f => JSON.parse(readFileSync(join(ROOT, 'content', f), 'utf8'));
const manifestRaw = readFileSync(join(ROOT, 'assets/media/manifest.json'), 'utf8');
const manifest = JSON.parse(manifestRaw);
/* Cache key for the media manifest. /assets/media/* is cached for a year
   (immutable), so the query string must change whenever the manifest does —
   otherwise browsers keep the old list and new media never appear. */
const MV = createHash('sha256').update(manifestRaw).digest('hex').slice(0, 10);

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

const head = ({ title, desc, canonical, ogTitle, ogDesc, up, schema, robots, lang = 'en', locale = 'en_GB', ogImage, extraHead = '', scripts = '' }) => `<!DOCTYPE html>
<html lang="${lang}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${canonical}">${robots ? `\n<meta name="robots" content="${robots}">` : ''}
<meta property="og:type" content="website">
<meta property="og:site_name" content="Artilier">
<meta property="og:locale" content="${locale}">
<meta property="og:title" content="${esc(ogTitle || title)}">
<meta property="og:description" content="${esc(ogDesc || desc)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${ogImage || HOST + '/assets/og-artilier.png'}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(ogTitle || title)}">
<meta name="twitter:description" content="${esc(ogDesc || desc)}">
<meta name="twitter:image" content="${ogImage || HOST + '/assets/og-artilier.png'}">
<meta name="theme-color" content="#F7F3EB">
<link rel="icon" href="${up}favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="${up}apple-touch-icon.png">
<link rel="sitemap" href="${up}sitemap.xml" type="application/xml">
<script type="application/ld+json">${JSON.stringify(schema)}</script>
<link href="/assets/css/fonts.css?v=2" rel="stylesheet">
<link rel="preload" href="/assets/fonts/jost-latin-300-normal.woff2?v=1" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/cormorant-garamond-latin-400-normal.woff2?v=1" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${up}assets/css/base.css?v=5">
<link rel="stylesheet" href="${up}assets/css/layout.css?v=3">
<link rel="stylesheet" href="${up}assets/css/responsive.css?v=3">
<link rel="stylesheet" href="${up}assets/css/collection-tweaks.css?v=2">
<link rel="stylesheet" href="${up}assets/css/pages.css?v=7">
<script defer src="${up}assets/js/slots.js?v=6" data-manifest="${up}assets/media/manifest.json?v=${MV}"></script>
<script defer src="${up}assets/js/analytics.js?v=5"></script>${scripts}${extraHead}
</head>
<body>
<a class="skip" href="#main">${lang === 'fr' ? 'Aller au contenu' : 'Skip to content'}</a>`;

const home = up => up || './';
const NAV_FR = { 'Collection':'Collection','Rugs':'Tapis','Embroidery':'Broderie','Projects':'Projets','The rug collection':'La collection de tapis','Bespoke':'Sur mesure','Collaborations':'Collaborations','Hospitality':'Hôtellerie','Process':'Processus','Trade':'Professionnels','About':'Le studio',
  'Home':'Accueil','The collection':'La collection','Bespoke development':'Développement sur mesure','Hospitality &amp; contract':'Hôtellerie &amp; contract','Materials':'Matières','The craft':'Le savoir-faire','About the studio':'Le studio','Contact':'Contact','Start a project':'Démarrer un projet' };
const nav = (up, lang = 'en') => {
  const t = k => lang === 'fr' ? (NAV_FR[k] || k) : k;
  const l = (h, k) => `<a href="${up}${h}"${lang === 'fr' ? ' hreflang="en"' : ''}>${t(k)}</a>`;
  return `
<nav id="nav" class="s">
  <a href="${home(up)}" class="logo">Artilier<em>Art. Made Material.</em></a>
  <ul class="nl">
    <li>${l('collection/','Rugs')}</li>
    <li>${l('embroidery/','Embroidery')}</li>
    <li>${l('bespoke/','Bespoke')}</li>
    <li>${l('hospitality/','Hospitality')}</li>
    <li>${l('projects/','Projects')}</li>
    <li>${l('trade/','Trade')}</li>
    <li>${l('about/','About')}</li>
  </ul>
  <button class="burger" id="burger" type="button" aria-expanded="false" aria-controls="mnav">Menu <span aria-hidden="true">≡</span></button>
  <a href="${up}contact/" class="cta">${t('Start a project')} <span>→</span></a>
</nav>
<div class="mnav" id="mnav" hidden>
  <a href="${home(up)}">${t('Home')}</a>${l('collection/','The rug collection')}${l('embroidery/','Embroidery')}${l('bespoke/','Bespoke development')}${l('collaborations/','Collaborations')}${l('hospitality/','Hospitality &amp; contract')}${l('materials/','Materials')}${l('process/','Process')}${l('craft/','The craft')}${l('projects/','Projects')}${l('trade/','Trade')}${l('about/','About the studio')}${l('contact/','Contact')}<a href="https://www.instagram.com/artilier.co/" target="_blank" rel="noopener">Instagram</a><a href="${up}contact/" class="cta">${t('Start a project')} <span>→</span></a>
</div>`;
};

const crumb = items => `
<div class="crumb" role="navigation" aria-label="Breadcrumb">${items.map((it,i) =>
  i === items.length-1
    ? `<span aria-current="page">${esc(it.name)}</span>`
    : `<a href="${it.href}">${esc(it.name)}</a><span aria-hidden="true">/</span>`).join('')}</div>`;

const FOOT_FR = {'Collection': 'Collection',
  'Hand-knotted rugs': 'Tapis noués main',
  'Hand-tufted rugs': 'Tapis tuftés main',
  'Flatweave rugs': 'Tapis tissés à plat',
  'All designs': 'Tous les modèles',
  'Rug materials': 'Matières',
  'Embroidery': 'Broderie',
  'Projects': 'Projets',
  'Studio': 'Studio',
  'Bespoke development': 'Développement sur mesure',
  'Collaborations': 'Collaborations',
  'Hospitality &amp; contract': 'Hôtellerie &amp; contract',
  'Process': 'Processus',
  'The craft': 'Le savoir-faire',
  'About the studio': 'Le studio',
  'How to brief a rug': 'Guide : rédiger le brief d’un tapis (en anglais)',
  'Trade': 'Professionnels',
  'Working with us': 'Travailler avec nous',
  'UAE': 'Émirats arabes unis',
  'Saudi Arabia': 'Arabie saoudite',
  'United Kingdom': 'Royaume-Uni',
  'United States': 'États-Unis',
  'Contact': 'Contact',
  'New Delhi, India': 'New Delhi, Inde',
  '© 2026 Artilier — a studio of Art Avenue Pvt. Ltd.': '© 2026 Artilier — un studio d’Art Avenue Pvt. Ltd.',
  'New Delhi · Made by hand across India': 'New Delhi · Fait main en Inde',
  'Trade only · Made to order, sized to each project': 'Réservé aux professionnels · Sur mesure, aux dimensions de chaque projet'};
const footer = (up, { lang = 'en' } = {}) => { const T = k => lang === 'fr' ? (FOOT_FR[k] || k) : k; return `
<footer>
  <div class="f-top">
    <div>
      <h4>Artilier</h4>
      <p>${lang === 'fr'
        ? 'Art. Made Material. Studio d’artisanat d’art à New Delhi. Tapis et broderie à la main, réalisés à la commande pour les designers, architectes et galeries — une pièce unique ou une collection entière, sur nos dessins ou les vôtres.'
        : 'Art. Made Material. A master craft studio in New Delhi. Rugs and hand embroidery, made to commission for designers, architects and galleries — one piece or a full collection, from our designs or yours. Design objects follow.'}</p>
    </div>
    <div class="f-col"><h5>${T('Collection')}</h5><ul>
      <li><a href="${up}collection/hand-knotted/">${T('Hand-knotted rugs')}</a></li>
      <li><a href="${up}collection/hand-tufted/">${T('Hand-tufted rugs')}</a></li>
      <li><a href="${up}collection/flatweave/">${T('Flatweave rugs')}</a></li>
      <li><a href="${up}collection/">${T('All designs')}</a></li>
      <li><a href="${up}materials/">${T('Rug materials')}</a></li>
      <li><a href="${up}embroidery/">${T('Embroidery')}</a></li>
      <li><a href="${up}embroidery/headboards/">${T('Embroidered headboards')}</a></li>
      <li><a href="${up}embroidery/fabrics/">${T('Embroidered fabric')}</a></li>
    </ul></div>
    <div class="f-col"><h5>${T('Studio')}</h5><ul>
      <li><a href="${up}bespoke/">${T('Bespoke development')}</a></li>
      <li><a href="${up}collaborations/">${T('Collaborations')}</a></li>
      <li><a href="${up}hospitality/">${T('Hospitality &amp; contract')}</a></li>
      <li><a href="${up}process/">${T('Process')}</a></li>
      <li><a href="${up}craft/">${T('The craft')}</a></li>
      <li><a href="${up}projects/">${T('Projects')}</a></li>
      <li><a href="${up}about/">${T('About the studio')}</a></li>
      <li><a href="${up}guides/briefing-a-bespoke-rug/"${lang === 'fr' ? ' hreflang="en"' : ''}>${T('How to brief a rug')}</a></li>
    </ul></div>
    <div class="f-col"><h5>${T('Trade')}</h5><ul>
      <li><a href="${up}trade/">${T('Working with us')}</a></li>
      <li><a href="${up}trade/uae/">${T('UAE')}</a></li>
      <li><a href="${up}trade/saudi-arabia/">${T('Saudi Arabia')}</a></li>
      <li><a href="${up}trade/uk/">${T('United Kingdom')}</a></li>
      <li><a href="${up}trade/us/">${T('United States')}</a></li>
      <li><a href="${up}fr/" hreflang="fr" lang="fr">Français</a></li>
    </ul></div>
    <div class="f-col"><h5>${T('Contact')}</h5><ul>
      <li><a href="mailto:studio@artilier.co">studio@artilier.co</a></li>
      <li><a href="https://wa.me/919828030095" target="_blank" rel="noopener">WhatsApp</a></li>
      <li><a href="https://www.instagram.com/artilier.co/" target="_blank" rel="noopener">Instagram</a></li>
      <li><a href="${up}contact/">${lang === 'fr' ? 'Démarrer un projet' : 'Start a project'}</a></li>
      <li><a href="${up}about/">${T('New Delhi, India')}</a></li>
    </ul></div>
  </div>
  <div class="f-bot">
    <span>${T('© 2026 Artilier — a studio of Art Avenue Pvt. Ltd.')}</span>
    <span>${T('New Delhi · Made by hand across India')}</span>
    <span>${T('Trade only · Made to order, sized to each project')}</span>
    <span><a href="${up}privacy/">${T('Privacy notice')}</a> · <a href="#cookie-settings" data-consent-open>${T('Cookie settings')}</a></span>
  </div>
</footer>

<a class="mcta" id="mcta" href="${up}contact/">${lang === 'fr' ? 'Démarrer un projet' : 'Start a project'} <span aria-hidden="true">→</span></a>
<script>
const bg=document.getElementById('burger'),mn=document.getElementById('mnav');
if(bg&&mn){
  const setMenu=o=>{o?mn.removeAttribute('hidden'):mn.setAttribute('hidden','');bg.setAttribute('aria-expanded',String(o));document.body.classList.toggle('menu-open',o);bg.firstChild.nodeValue=o?'${lang === 'fr' ? 'Fermer' : 'Close'} ':'Menu '};
  bg.addEventListener('click',()=>setMenu(mn.hasAttribute('hidden')));
  mn.addEventListener('click',e=>{if(e.target.closest('a'))setMenu(false)});
  addEventListener('keydown',e=>{if(e.key==='Escape'&&!mn.hasAttribute('hidden')){setMenu(false);bg.focus()}});
  addEventListener('resize',()=>{if(innerWidth>1040&&!mn.hasAttribute('hidden'))setMenu(false)});
}
const mc=document.getElementById('mcta');
if(mc){addEventListener('scroll',()=>mc.classList.toggle('on',scrollY>innerHeight*.5),{passive:true})}
</script>
</body>
</html>`; };

/* ── pre-rendered media ─────────────────────────────────────────────── */
/* A real <img> inside the slot so the markup is crawlable. slots.js adopts
   an existing [data-pre] image instead of appending a second one, so the
   authored crop and lazy-loading behaviour are unchanged. */
/* sizes hints match the layouts in layout.css / responsive.css: a design
   page's hero fills the left grid column (~57%) above 860 px and the full
   width below; grid tiles are 3-up, 2-up under 520 px, 1-up under 380 px. */
const SIZES = {
  hero: '(max-width:860px) 100vw, 57vw',
  grid: '(max-width:380px) 100vw, (max-width:520px) 50vw, 33vw',
  gal: '(max-width:760px) 100vw, 33vw',
  full: '100vw',
  wide: '(max-width:760px) 100vw, 67vw',
  quarter: '(max-width:760px) 50vw, 25vw',
};
const srcsetAttr = (m, up) => {
  if (!m.variants || !m.variants.length) return '';
  const stem = m.src.split('?')[0].replace(/\.webp$/, '');
  const list = m.variants.map(w => `${up}assets/media/r/${stem}-${w}.webp ${w}w`);
  list.push(`${up}assets/media/${m.src} ${m.w}w`);
  return ` srcset="${esc(list.join(', '))}"`;
};
const slotImg = (id, ph, up, eager = false, sizes = 'grid') => {
  const m = manifest[id] || {};
  const src = m.src ? `${up}assets/media/${m.src}` : '';
  if (!src || m.type === 'video') {
    return `<div class="ph"><media-slot id="${esc(id)}" shape="rect" placeholder="${esc(ph)}"></media-slot></div>`;
  }
  const dims = m.w && m.h ? ` width="${m.w}" height="${m.h}"` : '';
  const rs = srcsetAttr(m, up);
  /* An authored zoom (view.s > 1) enlarges the image beyond its frame, so the
     candidate must be chosen for the enlarged width: scale every length. */
  const zoom = m.view && m.view.s > 1.1 ? m.view.s : 1;
  const sizesVal = (SIZES[sizes] || sizes).replace(/(\d+)vw/g, (_, n) => zoom === 1 ? `${n}vw` : `calc(${n}vw * ${zoom.toFixed(2)})`);
  const sz = rs ? ` sizes="${esc(sizesVal)}"` : '';
  return `<div class="ph"><media-slot id="${esc(id)}" shape="rect" placeholder="${esc(ph)}"><img data-pre src="${esc(src)}"${rs}${sz}${dims} alt="${esc(m.alt||'')}"${m.alt?' role="img"':' aria-hidden="true"'} loading="${eager?'eager':'lazy'}" decoding="async"${eager?' fetchpriority="high"':''}></media-slot></div>`;
};

/* ── schema ─────────────────────────────────────────────────────────── */

const ORG = {
  '@type':'Organization','@id':`${HOST}/#organization`,'name':'Artilier','url':`${HOST}/`,
  'email':'studio@artilier.co','sameAs':['https://www.instagram.com/artilier.co/'],
  'description':"A master craft studio in New Delhi. Rugs and hand embroidery, made to commission for designers, architects and galleries — one piece or a full collection, from our designs or yours. Design objects follow.",
  'founder':{'@type':'Person','name':'Ankit Vijaivargia','jobTitle':'Founder — Manufacturing & Development'},
  'employee':{'@type':'Person','name':'Payal Samal','jobTitle':'Design Head — Interior Designer'},
  'address':{'@type':'PostalAddress','addressLocality':'New Delhi','addressCountry':'IN'},
  'areaServed':'Worldwide',
  'logo':{'@type':'ImageObject','url':`${HOST}/apple-touch-icon.png`},
  'slogan':'Art. Made Material.',
  'parentOrganization':{'@type':'Organization','name':'Art Avenue Pvt. Ltd.','address':{'@type':'PostalAddress','addressLocality':'New Delhi','addressCountry':'IN'}},
  'contactPoint':{'@type':'ContactPoint','contactType':'Trade enquiries','email':'studio@artilier.co','url':`${HOST}/contact/`,'areaServed':'Worldwide','availableLanguage':['English']},
  'knowsAbout':['hand-knotted rugs','hand-tufted rugs','flatweave rugs','custom rug development','bespoke rugs for interior designers','rug design collaboration','custom rugs for hospitality projects','hand embroidery','bespoke embroidered wall panels','embroidered upholstery and soft furnishings','hand-embroidered wallcoverings','embroidered wallcoverings','zardozi embroidery','zari embroidery','aari embroidery','raffia embroidery','embroidered headboards','bespoke embroidery for interior designers']
};
const WEBSITE = { '@type':'WebSite','@id':`${HOST}/#website`,'url':`${HOST}/`,'name':'Artilier','publisher':{'@id':`${HOST}/#organization`},'inLanguage':'en' };
const breadcrumb = items => ({ '@type':'BreadcrumbList','itemListElement':items.map((it,i)=>({ '@type':'ListItem','position':i+1,'name':it.name,'item':it.abs })) });

const graph = nodes => ({ '@context':'https://schema.org','@graph':[ORG, WEBSITE, ...nodes] });

/* ── design pages ───────────────────────────────────────────────────── */

const termName = s => (taxonomy.find(t => t.slug === s) || {}).name;
const catFor = d => CATS.find(c => c.coll === d.collection);

/* Construction-level facts, taken verbatim in substance from /craft/ and
   /materials/. They describe what the studio offers for the construction,
   not a measured property of an individual rug. */
const CONSTRUCTION = {
  'Hand-knotted': {
    about: 'Knotted by hand on the loom. Hand-knotting gives the finest definition the studio offers and carries painterly artwork best; it also has the longest lead time of the three constructions.',
    yarns: 'New Zealand wool, hand-spun wool, wool-silk blend, bamboo silk or a developed blend'
  },
  'Hand-tufted': {
    about: 'Tufted to the drawing. Hand-tufting allows carving, mixed pile heights and loop-and-cut surfaces, at a shorter lead time than hand-knotting.',
    yarns: 'New Zealand wool, hand-spun wool, wool-silk blend, bamboo silk or a developed blend'
  },
  'Flatweave': {
    about: 'Woven flat and low underfoot. Flatweave reads graphically, suits layering and rooms where a pile would sit too high, and is lighter than a pile rug.',
    yarns: 'Cotton, jute, allo / hemp or a developed blend'
  }
};
const sentence1 = t => (String(t).match(/^.*?[.!?](\s|$)/) || [String(t)])[0].trim();
/* A complete meta description — never cut mid-sentence. */
const designDesc = d => {
  const first = sentence1(d.description);
  const tail = `${d.construction} rug, woven to order, sized and coloured to the project.`;
  for (const c of [`${first} ${tail} Trade only.`, `${first} ${tail}`, `${first} ${d.construction}, made to order and sized to the project.`, first])
    if (c.length <= 158) return c;
  return first.slice(0, first.lastIndexOf(',', 150)) + '.';
};
const titleCaseC = s => String(s).replace(/(^|-)([a-z])/g, (m, a, b) => a + b.toUpperCase());
const ogFor = slug => existsSync(join(ROOT, 'assets/og', slug + '.jpg')) ? `${HOST}/assets/og/${slug}.jpg` : '';

function designPage(d) {
  const up = '../../';
  const coll = collections.find(c => c.slug === d.collection) || {};
  const cat = catFor(d);
  const m = manifest[d.hero] || {};
  const url = `${HOST}/collection/${d.slug}/`;
  const catUrl = cat ? `${HOST}/collection/${cat.slug}/` : `${HOST}/collection/`;
  const terms = (d.terms||[]).map(termName).filter(Boolean);
  // Rotate through the siblings (the next three after this design, wrapping round) so every
  // design receives links from its neighbours — taking the first three for every page sent
  // all related-design links to the same three designs and left the rest with two inlinks.
  const sibs = indexable.filter(x => x.collection === d.collection).sort(by);
  const at = sibs.findIndex(x => x.slug === d.slug);
  const peers = sibs.length > 1 ? [1,2,3].map(k => sibs[(at + k) % sibs.length]).filter((x,i,a) => x.slug !== d.slug && a.indexOf(x) === i) : [];
  const cx = CONSTRUCTION[d.construction] || {};

  const crumbs = [
    { name:'Artilier', href:home(up), abs:`${HOST}/` },
    { name:'The collection', href:`${up}collection/`, abs:`${HOST}/collection/` },
    ...(cat ? [{ name:coll.name, href:`${up}collection/${cat.slug}/`, abs:catUrl }] : []),
    { name:d.name, href:url, abs:url }
  ];

  /* Only properties with real values are emitted. material / size / pile
     height are absent from the data and are therefore absent here. */
  const work = {
    '@type':'VisualArtwork','@id':`${url}#design`,'name':d.name,'url':url,
    'description':d.description,'creator':{'@id':`${HOST}/#organization`},
    'isPartOf':{'@id':`${catUrl}#collection`},
    'inLanguage':'en','artform':'Rug',
    'keywords':[...terms, d.pattern, ...(d.palette||[])].filter(Boolean).join(', '),
    ...(d.construction ? { 'artMedium':d.construction } : {}),
    ...(m.src ? { 'image':{ '@type':'ImageObject','@id':`${url}#primaryimage`,
        'url':`${HOST}/assets/media/${String(m.src).split('?')[0]}`,
        ...(m.alt ? { 'caption':m.alt } : {}) } } : {})
  };
  if (d.material) work.material = d.material;

  const schema = graph([
    { '@type':'WebPage','@id':`${url}#webpage`,'url':url,'name':`${d.name} — custom ${String(d.construction).toLowerCase()} rug`,
      'isPartOf':{'@id':`${HOST}/#website`},...(m.src?{'primaryImageOfPage':{'@id':`${url}#primaryimage`}}:{}),
      'breadcrumb':{'@id':`${url}#breadcrumb`},'about':{'@id':`${url}#design`},'inLanguage':'en' },
    { ...breadcrumb(crumbs), '@id':`${url}#breadcrumb` },
    work
  ]);

  const facts = [
    ['Construction', d.construction],
    ['Pattern', d.pattern],
    ['Colours shown', (d.palette||[]).length ? `${d.palette.join(' · ')} — re-colourable to your scheme` : ''],
    ['Material', d.material],
    ['Yarn options', !d.material && cx.yarns ? `${cx.yarns} — specified per project` : ''],
    ['Pile height', d.pileHeight],
    ['Reference size', d.referenceSize],
    ['Size', (d.availableSizes||[]).join(' · ') || 'Made to order and sized to the project; limits for the construction confirmed before sampling'],
    ['Colourway', (d.palette||[]).length ? '' : 'Re-coloured to your scheme'],
    ['Sampling', 'Strike-off in 2–3 weeks once the design is approved; its cost is credited against the order'],
    ['Lead time', d.leadTime || 'Usually 6–12 weeks from strike-off approval; up to six months in some cases'],
    ['Minimum order', 'None — a single rug is welcome']
  ].filter(([,v]) => v).map(([k,v]) => `<div><b>${esc(k)}</b><span>${esc(v)}</span></div>`).join('\n        ');

  return head({
    title:`${d.name} — Custom ${titleCaseC(d.construction)} Rug, Made to Size | Artilier`,
    desc:designDesc(d),
    canonical:url, up,
    ogTitle:`${d.name} — ${d.construction} rug by Artilier`,
    ogDesc:d.description, schema, ogImage:ogFor(d.slug)
  }) + nav(up) + crumb(crumbs.map(c=>({name:c.name,href:c.href}))) + `
<main id="main">
<header class="wp-hd">
  <div>
    <span class="lb">${esc([coll.name, d.construction].filter((v,i,a)=>v&&a.indexOf(v)===i).join(' · '))} rug</span>
    <h1 class="d1">${esc(d.name)}</h1>
  </div>
  <div>
    <p class="bd">${esc(d.description)}</p>
    <div class="wp-meta"><span><b>${esc(d.construction||'')}</b></span><span>Made to size</span><span>Custom colourways</span></div>
  </div>
</header>
<section class="sec dtl">
  <div class="dtl-in">
    <div class="dtl-media">${slotImg(d.hero, `${d.name} — ${d.construction} rug`, up, true, 'hero')}</div>
    <div>
      <h2 class="lb" style="display:block;margin-bottom:6px">Specification</h2>
      <div class="facts">
        ${facts}
      </div>
      <p class="bd" style="margin-top:clamp(24px,3vw,34px)">${esc(d.name)} is a starting point rather than a fixed product. It can be re-scaled, re-proportioned and re-coloured against your scheme, and woven to the dimensions the room needs. Yarn, colour and construction are confirmed in <a href="${up}process/">sampling</a> before a loom is set.</p>
      <div class="brief-a" style="margin-top:clamp(24px,3vw,34px)">
        <a href="${up}contact/?design=${esc(d.slug)}" class="cta">Enquire about ${esc(d.name)} <span>→</span></a>
        <a href="${up}collection/${cat?cat.slug+'/':''}" class="cta ol">More ${esc((coll.name||'').toLowerCase())} designs</a>
      </div>
    </div>
  </div>
</section>
${cx.about ? `<section class="sec tight">
  <div class="sec-hd"><div><span class="lb">The construction</span><h2 class="d2">About ${esc(String(d.construction).toLowerCase())} <span class="it">rugs.</span></h2></div>
  <p class="bd">${esc(cx.about)} Which construction suits a design is decided from the artwork, the detail it carries, the traffic the room will take and the budget — see <a href="${up}craft/">the craft</a> and <a href="${up}materials/">materials</a>, or start from <a href="${up}bespoke/">your own artwork</a>.</p></div>
</section>` : ''}
${peers.length ? `<section class="sec">
  <div class="sec-hd"><div><span class="lb">Also in ${esc(coll.name||'this collection')}</span><h2 class="d2">Related <span class="it">designs.</span></h2></div></div>
  <div class="cg">${peers.map((p,i)=>`<figure class="cgi" data-design="${esc(p.slug)}">${slotImg(p.hero,`${p.name} — ${p.construction} rug`,up)}<figcaption><b><a href="${up}collection/${p.slug}/">${esc(p.name)}</a></b><span></span><span class="cgn">${n2(i+1)}</span></figcaption></figure>`).join('')}</div>
</section>` : ''}
<div class="backhome">
  <a href="${up}collection/" class="cta ol"><span aria-hidden="true">←</span> Back to the collection</a>
  <div class="backhome-l">${CATS.filter(c=>c!==cat).map(c=>`<a href="${up}collection/${c.slug}/">${esc((collections.find(x=>x.slug===c.coll)||{}).name)} rugs</a>`).join('')}<a href="${up}bespoke/">Bespoke development</a><a href="${up}hospitality/">Hospitality</a><a href="${up}trade/">Trade</a></div>
</div>
</main>` + footer(up);
}

/* Category copy — every claim restates /craft/, /materials/ or collections.json. */
const CAT_COPY = {
  'hand-knotted': {
    desc: n => `${n} hand-knotted rug designs, each woven to order, sized and coloured to the project, with knot count, yarn and dye lot set per design. Trade only, New Delhi.`,
    when: 'Specify hand-knotting when the artwork carries fine detail, tonal gradation or painterly marks, or when the rug is the focal piece of a formal room. It holds the finest definition of the three constructions, and it has the longest lead time — plan the programme around it.',
    yarn: 'Pile yarns are selected per design from New Zealand wool, hand-spun wool, wool-silk blends, bamboo silk and developed blends; knot count is set to the detail the artwork needs.'
  },
  'hand-tufted': {
    desc: n => `${n} hand-tufted rug designs with carved outlines and high-low pile, woven to order, sized and coloured to the project at shorter lead times. Trade only.`,
    when: 'Specify hand-tufting for carved outlines, sculpted relief, mixed pile heights and loop-and-cut surfaces — or where the programme needs a shorter lead time than hand-knotting allows.',
    yarn: 'Pile yarns are selected per design from New Zealand wool, hand-spun wool, wool-silk blends, bamboo silk and developed blends; pile heights and carving are drawn into the specification.'
  },
  'flatweave': {
    desc: n => `${n} flatweave rug designs for graphic work, layering and low-profile rooms, woven to order, sized and coloured to the project. Trade only, New Delhi.`,
    when: 'Specify flatweave for graphic and geometric work, for layering, and for rooms where a pile would sit too high. It is lower and lighter underfoot than a pile rug, and reversible in some constructions.',
    yarn: 'Flatweaves are specified in cotton, jute, allo / hemp and developed blends, chosen for the surface the room needs.'
  }
};

/* ── category pages ─────────────────────────────────────────────────── */

function categoryPage(cat) {
  const up = '../../';
  const coll = collections.find(c => c.slug === cat.coll);
  const ds = shownIn(cat.coll);
  const linked = ds.filter(d => d.detail === true);
  const url = `${HOST}/collection/${cat.slug}/`;
  const crumbs = [
    { name:'Artilier', href:home(up), abs:`${HOST}/` },
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
    title:`${titleCaseC(coll.name)} Rugs — Custom Designs, Made to Size | Artilier`,
    desc:CAT_COPY[cat.slug].desc(ds.length),
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
    <div class="wp-meta"><span><b>${ds.length} designs</b></span><span>Made to size</span><span>Custom colourways</span></div>
  </div>
</header>
<section class="cgs" data-subcategory="${esc(cat.coll)}">
  <div class="cg">${ds.map((d,i)=>`<figure class="cgi" data-design="${esc(d.slug)}">${slotImg(d.hero,`${d.name} — ${d.construction} rug`,up,i<3)}<figcaption><b>${d.detail === true ? `<a href="${up}collection/${d.slug}/">${esc(d.name)}</a>` : esc(d.name)}</b><span></span><span class="cgn">${n2(i+1)}</span></figcaption></figure>`).join('')}</div>
  <p class="cg-note">${esc(String(coll.note||'').replace('{n}', ds.length))}</p>
</section>
<section class="sec">
  <div class="sec-hd"><div><span class="lb">Specifying ${esc(coll.name.toLowerCase())}</span><h2 class="d2">When to specify<br><span class="it">${esc(coll.name.toLowerCase())}.</span></h2></div>
  <p class="bd">${esc(CAT_COPY[cat.slug].when)}</p></div>
  <div class="sec-hd"><div><span class="lb">Yarn and sampling</span><h2 class="d2">Yarn, colour<br>and <span class="it">specification.</span></h2></div>
  <p class="bd">${esc(CAT_COPY[cat.slug].yarn)} Yarn, spin and dye lot are approved in the hand against your scheme, and a woven strike-off — ready in 2–3 weeks once the design is approved — is signed off before the full rug is set on the loom. Lead times usually run 6–12 weeks from strike-off approval, up to six months in some cases. There is no minimum order. <a href="${up}materials/">Rug materials</a> · <a href="${up}process/">The process</a> · <a href="${up}contact/?type=bespoke">Brief a ${esc(coll.name.toLowerCase())} rug</a></p></div>
</section>
<div class="backhome">
  <a href="${up}collection/" class="cta ol"><span aria-hidden="true">←</span> The whole collection</a>
  <div class="backhome-l">${CATS.filter(c=>c.slug!==cat.slug).map(c=>`<a href="${up}collection/${c.slug}/">${esc((collections.find(x=>x.slug===c.coll)||{}).name)} rugs</a>`).join('')}<a href="${up}bespoke/">Bespoke development</a><a href="${up}hospitality/">Hospitality</a><a href="${up}contact/">Start a project</a></div>
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
export { MV, indexable, CATS, HOST, esc, head, nav, footer, crumb, slotImg, graph, breadcrumb, write, collections, designs, manifest, site, n2, by, home, ORG, WEBSITE, ROOT, CONSTRUCTION, titleCaseC };
