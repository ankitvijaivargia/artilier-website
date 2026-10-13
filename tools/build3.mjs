/**
 * Artilier — Phase 3: conversion, international and indexation pages.
 * Run after build.mjs and build2.mjs:  node tools/build.mjs && node tools/build2.mjs && node tools/build3.mjs
 *
 * Builds /contact/, /about/, /projects/, /hospitality/, /trade/uae/,
 * /trade/saudi-arabia/, /trade/uk/, /trade/us/, /fr/ and /404.html; syncs the
 * shared shell into the hand-maintained pages (collaborations, collection hub);
 * writes sitemap.xml.
 *
 * Rule carried over from Phases 1–2: every factual statement restates existing
 * site copy, repository data, or a public fact (time zones, working weeks).
 * Minimum order, strike-off timing and lead-time range are owner-confirmed (10 Oct 2026). Nothing is asserted about prices, certifications, fire or
 * performance ratings, client names, delivery terms or production locations.
 * Anything that needs the owner's confirmation is listed in
 * SEO_IMPLEMENTATION_LOG.md, not written here.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { MV, HOST, esc, head, nav, footer, crumb, graph, breadcrumb, write, home, ORG, WEBSITE, ROOT, indexable, CATS, by, slotImg } from './build.mjs';

const FORM_ENDPOINT = 'https://formspree.io/f/myklqvgp';   // the endpoint the live homepage form already uses
const rd = f => readFileSync(join(ROOT, f), 'utf8');
const wr = (f, s) => writeFileSync(join(ROOT, f), s);

/* ── page shell ────────────────────────────────────────────────────── */
const shell = ({ path, up, title, desc, lb, h1, h1it, lead, body, nodes = [], lang = 'en', locale = 'en_GB', robots, scripts = '', crumbName, pageType = 'WebPage' }) => {
  const url = `${HOST}/${path}`;
  const crumbs = [{ name:'Artilier', href:home(up), abs:`${HOST}/` }];
  if (path.startsWith('trade/') && path !== 'trade/') crumbs.push({ name:'Trade', href:`${up}trade/`, abs:`${HOST}/trade/` });
  if (path.startsWith('embroidery/') && path !== 'embroidery/') crumbs.push({ name:'Embroidery', href:`${up}embroidery/`, abs:`${HOST}/embroidery/` });
  if (path.startsWith('fr/') && path !== 'fr/') crumbs.push({ name:'Français', href:`${up}fr/`, abs:`${HOST}/fr/` });
  crumbs.push({ name:crumbName || lb, href:url, abs:url });
  const schema = graph([
    { '@type':pageType,'@id':`${url}#webpage`,'url':url,'name':title,'description':desc,
      'isPartOf':{'@id':`${HOST}/#website`},'breadcrumb':{'@id':`${url}#breadcrumb`},
      'about':{'@id':`${HOST}/#organization`},'inLanguage':lang },
    { ...breadcrumb(crumbs), '@id':`${url}#breadcrumb` },
    ...nodes
  ]);
  return head({ title, desc, canonical:url, up, schema, robots, lang, locale, scripts })
    + nav(up, lang) + crumb(crumbs.map(c => ({ name:c.name, href:c.href }))) + `
<main id="main">
<header class="wp-hd">
  <div>
    <span class="lb">${esc(lb)}</span>
    <h1 class="d1">${h1}${h1it ? `<span class="it">${h1it}</span>` : ''}</h1>
  </div>
  <div>
    ${lead}
  </div>
</header>
${body}
</main>` + footer(up, { lang });
};
const sec = (lb, h2, h2it, inner, { dark = false, intro = '' } = {}) => `
<section class="sec${dark ? ' dark' : ''}">
  <div class="sec-hd"><div><span class="lb">${esc(lb)}</span><h2 class="d2">${h2}${h2it ? ` <span class="it">${h2it}</span>` : ''}</h2></div>${intro ? `\n  <p class="bd">${intro}</p>` : ''}</div>
  ${inner}
</section>`;
const list = items => `<div class="prose"><ul>${items.map(i => `<li>${i}</li>`).join('')}</ul></div>`;
const qa = rows => `<dl class="qa">${rows.map(([q, a]) => `<div><dt>${q}</dt><dd>${a}</dd></div>`).join('')}</dl>`;
const ctaBlock = (up, href, label, links = []) => `
<div class="backhome">
  <a href="${up}${href}" class="cta">${label} <span>→</span></a>
  <div class="backhome-l">${links.map(([h, t]) => `<a href="${up}${h}">${esc(t)}</a>`).join('')}</div>
</div>`;
const service = (path, name, serviceType, description, audience, area = 'Worldwide') => ({
  '@type':'Service','@id':`${HOST}/${path}#service`,'name':name,'serviceType':serviceType,'description':description,
  'provider':{'@id':`${HOST}/#organization`},'areaServed':area,
  'audience':{'@type':'Audience','audienceType':audience},'url':`${HOST}/${path}`
});
const country = (name, code) => ({ '@type':'Country','name':name,'identifier':code });

/* ── /contact/ ─────────────────────────────────────────────────────── */
const enquiryForm = (id = 'contactForm') => `
<form class="fx" id="${id}" action="${FORM_ENDPOINT}" method="post" data-enquiry data-endpoint="${FORM_ENDPOINT}" novalidate>
  <fieldset>
    <legend>What is the project?</legend>
    <div class="chips">
      <label><input type="radio" name="sector" value="residential" checked> Residential interior</label>
      <label><input type="radio" name="sector" value="hospitality"> Hospitality / contract</label>
      <label><input type="radio" name="sector" value="bespoke"> Bespoke rug from my artwork</label>
      <label><input type="radio" name="sector" value="collection"> A collection design</label>
      <label><input type="radio" name="sector" value="embroidery"> Embroidery</label>
      <label><input type="radio" name="sector" value="collaboration"> Collaboration</label>
      <label><input type="radio" name="sector" value="other"> Something else</label>
    </div>
  </fieldset>
  <div class="row">
    <div class="f"><label for="c-n">Name *</label><input id="c-n" name="name" type="text" required autocomplete="name" maxlength="120"></div>
    <div class="f"><label for="c-st">Studio or company</label><input id="c-st" name="studio" type="text" autocomplete="organization" maxlength="160"></div>
  </div>
  <div class="row">
    <div class="f"><label for="c-em">Email *</label><input id="c-em" name="email" type="email" required autocomplete="email" maxlength="160"></div>
    <div class="f"><label for="c-lo">Where you are based</label><input id="c-lo" name="based" type="text" autocomplete="address-level2" maxlength="120" placeholder="Dubai, Riyadh, London, Paris, New York…"></div>
  </div>
  <div class="row">
    <div class="f"><label for="c-ct">What do you need?</label>
      <select id="c-ct" name="enquiry">
        <option>Bespoke rug from my own artwork</option><option>A design from the collection, re-sized</option>
        <option>A design from the collection, re-coloured</option><option>Several rugs for one project</option>
        <option>Embroidery — wall panels or framed art</option><option>Embroidered headboards</option><option>Embroidered fabric by the metre</option><option>Embroidery — upholstery panels or soft furnishings</option>
        <option>Samples</option><option>Trade terms</option><option>Not sure yet</option>
      </select>
    </div>
    <div class="f"><label for="c-cs">Construction</label>
      <select id="c-cs" name="construction">
        <option>Open to your recommendation</option><option>Hand-knotted</option><option>Hand-tufted</option><option>Flatweave</option><option>Hand embroidery</option>
      </select>
    </div>
  </div>
  <div class="f"><label for="c-ms">The project *</label><textarea id="c-ms" name="brief" required maxlength="5000" placeholder="The rug or rugs, the rooms, the look you are after — or tell us you are emailing artwork."></textarea></div>
  <div class="row">
    <div class="f"><label for="c-qt">Number of rugs</label><input id="c-qt" name="quantity" type="text" maxlength="60" placeholder="One-off, 4, 20…"></div>
    <div class="f"><label for="c-dm">Dimensions</label><input id="c-dm" name="dimensions" type="text" maxlength="200" placeholder="e.g. 4.2 × 3.0 m or 14 × 10 ft"></div>
  </div>
  <div class="row">
    <div class="f"><label for="c-td">Target date on site</label><input id="c-td" name="target_date" type="text" maxlength="60" placeholder="Month or quarter is enough"></div>
    <div class="f"><label for="c-pl">Project location</label><input id="c-pl" name="project_location" type="text" maxlength="120" placeholder="City and country"></div>
  </div>
  <div class="f"><label>Artwork, drawings or floor plans</label><span class="f-hint">Email them to <a href="mailto:studio@artilier.co">studio@artilier.co</a> with your name in the subject and we will match them to this enquiry.</span></div>
  <button type="submit" class="cta" style="justify-content:center">Send the enquiry <span>→</span></button>
  <p class="f-status" id="${id}Status" role="status" aria-live="polite"></p>
  <p class="f-note">Trade only, no fixed minimum order. We read every enquiry ourselves and reply individually. Rug lead times usually run 6–12 weeks from strike-off approval; embroidered wall panels and headboards typically take 3–4 months, embroidered fabric 6–8 weeks. Costing follows once construction, materials, dimensions and sampling are understood. Your details are used only to reply to this enquiry.</p>
</form>`;

const contact = shell({
  path:'contact/', up:'../', pageType:'ContactPage',
  title:'Contact Artilier — Start a Rug Project | Trade Enquiries',
  desc:'Brief a bespoke rug, a collection design or a hospitality project. Trade enquiries from interior designers and architects, answered individually from New Delhi.',
  lb:'Contact · Start a project', h1:'Start a<br>', h1it:'project.',
  lead:`<p class="bd">Send artwork, a drawing, a reference or an early idea with the sizes. We review it and come back with questions, possibilities and the best way to make it.</p>
    <div class="wp-meta"><span><b>Trade only</b></span><span>Reviewed individually</span><span>New Delhi</span></div>`,
  scripts:`\n<script defer src="../assets/js/enquiry.js?v=3"></script>`,
  body:`
<section class="sec">
  <div class="about">
    <div>
      <span class="lb" style="display:block;margin-bottom:18px">How enquiries work</span>
      <h2 class="d2">Send what you<br><span class="it">have.</span></h2>
      <div class="prose" style="margin-top:22px">
        <p>Artwork or drawing, rug sizes, colour scheme, construction preference, quantity, project location and target date all help — but none is required to start. If information is missing, we tell you what needs resolving before anything can be costed properly.</p>
        <p>What comes back: our thoughts on construction and material, the questions we need answered, and how we would approach the rug. Where there is enough information, an initial cost range follows.</p>
      </div>
      <div class="contact-opts">
        <a href="mailto:studio@artilier.co"><b>Email</b>studio@artilier.co</a>
        <a href="https://wa.me/919828030095" target="_blank" rel="noopener"><b>WhatsApp</b>Message the studio</a>
        <a href="https://www.instagram.com/artilier.co/" target="_blank" rel="noopener"><b>Instagram</b>@artilier.co</a>
        <span><b>Studio</b>New Delhi, India</span>
        <span><b>Clients</b>Trade only — designers · architects · galleries</span>
        <span><b>Contracting</b>Art Avenue Pvt. Ltd., New Delhi</span>
      </div>
    </div>
    ${enquiryForm()}
  </div>
</section>
${sec('Before you write', 'Questions we are', 'often asked.', qa([
  ['Do you sell to private clients?', 'Not directly. Artilier works trade only — with interior designers, architects, design practices and galleries, and with collectors through the galleries that represent them.'],
  ['Can a collection design be changed?', 'Yes. Every design is a starting point: it can be re-scaled, re-proportioned and re-coloured to your scheme, and made to the size the room needs within what the design and construction allow.'],
  ['Can we see samples first?', 'Yes. For rugs, yarn samples, colour trials and a woven strike-off are approved in the hand before the full rug is set on the loom. Where a strike-off is part of the project, it typically takes 2–3 weeks once the design or sketch is approved, and its cost is credited against the order.'],
  ['Is there a minimum order?', 'Trade only. No fixed minimum order quantity — each project is assessed on its design, technical requirements and production specifications.'],
  ['How are prices quoted?', 'Prices are quoted in USD or EUR, usually ex-works; FOB or DDP can be quoted separately on request. Payment terms are set out in the quote, and rugs are usually shipped rolled.'],
  ['Who contracts and invoices?', 'Art Avenue Pvt. Ltd., our manufacturing company in New Delhi. Artilier is its trade studio — one supplier and one point of coordination.'],
  ['How long does it take?', '<b>Rugs:</b> usually 6–12 weeks from strike-off approval, and up to six months in some cases; hand-knotting takes longest, hand-tufting is shorter. <b>Embroidered wall panels and upholstered headboards:</b> production typically takes 3–4 months, depending on the design, specifications and project requirements; more complex projects may require up to 6 months. <b>Embroidered fabric:</b> typically 6–8 weeks; complex work up to 6 months. We confirm delivery dates only after reviewing the specification.']
]))}`
});

/* ── /about/ ───────────────────────────────────────────────────────── */
const about = shell({
  path:'about/', up:'../', pageType:'AboutPage',
  title:'About Artilier — Master Craft Studio, New Delhi',
  desc:'A master craft studio in New Delhi for rugs and hand embroidery, working with designers, architects and galleries — led by an interior designer.',
  lb:'About the studio', h1:'A design studio<br>in ', h1it:'New Delhi.',
  lead:`<p class="bd">Artilier is a design-led studio in New Delhi bringing together interior design thinking, material understanding and hands-on manufacturing experience. We work trade only, with interior designers, architects and design practices internationally. We begin with rugs; embroidery and design objects follow.</p>
    <div class="wp-meta"><span><b>Founded on making</b></span><span>Led by design</span><span>Trade only</span></div>`,
  nodes:[
    { '@type':'Person','@id':`${HOST}/about/#ankit`,'name':'Ankit Vijaivargia','jobTitle':'Founder — Manufacturing & Development','worksFor':{'@id':`${HOST}/#organization`} },
    { '@type':'Person','@id':`${HOST}/about/#payal`,'name':'Payal Samal','jobTitle':'Design Head — Interior Designer','worksFor':{'@id':`${HOST}/#organization`} }
  ],
  body:`
${sec('How the studio is built', 'Artilier is new.<br>The experience behind it', "isn't.", `<div class="facts">
    <div><b>Manufacturing</b><span>Over a decade of custom production, Delhi</span></div>
    <div><b>Design direction</b><span>Led by an interior designer</span></div>
    <div><b>Studio</b><span>New Delhi — development, sampling &amp; quality control</span></div>
    <div><b>Weaving</b><span>Established rug workshops across India</span></div>
    <div><b>International</b><span>Trade clients in Europe, the Gulf and the US</span></div>
  </div>`, { intro:'That combination is what closes the gap between a beautiful drawing and a rug that can actually be made well — where artwork, construction, yarn, colour, proportion, cost and finishing all have to come together.' })}
${sec('The people', 'Two perspectives.', 'One studio.', `<div class="cols2">
    <div class="prose"><h3>Ankit Vijaivargia</h3><p><b>Founder · Manufacturing &amp; Development.</b> Ankit brings over a decade of experience in custom manufacturing from New Delhi, with deep knowledge of materials, construction and production. He works on what a design will take to make — yarn, construction, knot count, pile, sampling, costing and quality control — and stays on it from the first drawing to the finished rug.</p></div>
    <div class="prose"><h3>Payal Samal</h3><p><b>Design Head · Interior Designer.</b> Payal is an interior designer by profession and brings a spatial, design-led perspective — colour, material, proportion, pattern and how pieces live within interiors. She leads the studio's design direction: the collection, colourways and the development of bespoke artwork.</p></div>
  </div>`, { dark:true, intro:'Every artwork, drawing and specification passes through both: one person who has spent over a decade making things, and one who designs the interiors those things go into.' })}
${sec('What we do', 'Rugs, developed', 'and made.', list([
  '<b>Bespoke development</b> — rugs developed from a designer’s artwork, drawing, CAD file or colour scheme. <a href="../bespoke/">Bespoke rugs</a>',
  '<b>The collection</b> — named designs in hand-knotted, hand-tufted and flatweave, each a starting point re-coloured and re-sized to the project. <a href="../collection/">The collection</a>',
  '<b>Collaborations</b> — rugs co-developed with designers, architects and artists. <a href="../collaborations/">Collaborations</a>',
  '<b>Hospitality and multi-rug projects</b> — schedules of rugs for boutique hospitality and residential work. <a href="../hospitality/">Hospitality</a>'
]))}
${sec('Artilier and Art Avenue', 'One supplier,', 'one point of coordination.', `<div class="prose"><p>Artilier is the trade studio of Art Avenue Pvt. Ltd., our manufacturing company in New Delhi. Artilier is where design, development, sampling and the client relationship sit; orders are contracted, invoiced and exported through Art Avenue Pvt. Ltd. — so a project has one supplier, one point of coordination and established export documentation.</p></div>`)}
${sec('Where the work sits', 'Studio in Delhi,', 'looms across India.', `<div class="prose"><p>Studio, artwork development, sampling, finishing and quality control sit in New Delhi. Weaving runs through established rug workshops across India, selected for the construction each rug needs. The workshop is chosen to suit the rug; the specification is held and checked in one place. More in <a href="../craft/">the craft</a> and <a href="../process/">the process</a>.</p></div>`, { dark:true })}
${ctaBlock('../', 'contact/', 'Start a project', [['trade/','Working with us'],['bespoke/','Bespoke development'],['collection/','The collection']])}`
});

/* ── /projects/ and /projects/<slug>/ ─────────────────────────────── */
/* Publishes only records with published:true AND permission:true (the
   designer has agreed to what is shown). Nothing is staged or invented. */
const projectsData = JSON.parse(rd('content/projects.json')).projects
  .filter(p => p.published === true && p.permission === true && p.slug && p.name).sort(by);
const hasProjects = projectsData.length > 0;
/* /projects/ index visibility (Stage 5 §9, Stage 6 F1): the index stays
   noindex and out of the sitemap until INDEX_PROJECTS_MIN approved projects
   exist. Individual project pages are indexable from publication. Manual
   override in content/projects.json: "projectsIndexVisibility": "auto" | "index" | "noindex". */
const INDEX_PROJECTS_MIN = 2;
const projectsOverride = String(JSON.parse(rd('content/projects.json')).projectsIndexVisibility || 'auto').toLowerCase();
const indexProjects = projectsOverride === 'index' ? hasProjects
  : projectsOverride === 'noindex' ? false
  : projectsData.length >= INDEX_PROJECTS_MIN;
const pCaption = p => [p.discipline, p.location, p.year].filter(Boolean).join(' · ');
const projects = shell({
  path:'projects/', up:'../', pageType:'CollectionPage',
  title:'Projects — Rugs & Embroidery in Interiors | Artilier',
  desc:'Completed Artilier rugs and embroidery in residential and hospitality interiors — the brief, what we developed and how it was made. Trade only.',
  lb:'Projects', h1:'The work, in its<br>', h1it:'rooms.',
  robots: indexProjects ? undefined : 'noindex,follow',
  lead:`<p class="bd">Completed work — the brief, what we developed for it and how it was made. Some projects are shown without naming the client or the property.</p>`,
  body: hasProjects ? `
<section class="sec"><div class="cg">${projectsData.map((p, i) => `<figure class="cgi">${p.hero ? `<a href="${esc(p.slug)}/" aria-hidden="true" tabindex="-1">${slotImg(p.hero, p.name, '../', i < 3)}</a>` : ''}<figcaption><b><a href="${esc(p.slug)}/">${esc(p.name)}</a></b><span>${esc(pCaption(p))}</span></figcaption>${p.designer ? `<p class="bd-s">With ${esc(p.designer)}</p>` : ''}</figure>`).join('')}</div></section>
${ctaBlock('../', 'contact/', 'Start a project', [['embroidery/','Embroidery'],['hospitality/','Hospitality'],['bespoke/','Bespoke development']])}` : `
<section class="sec">
  <div class="empty-note">
    <span class="lb">Being documented</span>
    <p>Artilier is a new studio. Completed projects are published here only once they are photographed and the people involved have agreed to what is shown — nothing on this page will be staged or invented.</p>
    <p>Until then, the clearest view of our work is <a href="../collection/">the rug collection</a>, <a href="../embroidery/">our embroidery</a> and how we <a href="../bespoke/">develop pieces from a designer’s artwork</a>. If you would like to discuss work relevant to your project, <a href="../contact/">write to us</a>.</p>
  </div>
</section>
${ctaBlock('../', 'contact/', 'Start a project', [['collection/','The rug collection'],['embroidery/','Embroidery'],['bespoke/','Bespoke development']])}`
});

const projectPage = p => {
  const UP = '../../';
  const url = `${HOST}/projects/${p.slug}/`;
  const facts = [
    ['Designer', p.designerUrl ? `<a href="${esc(p.designerUrl)}" target="_blank" rel="noopener">${esc(p.designer)}</a>` : esc(p.designer || '')],
    ['Location', esc(p.location || '')], ['Year', esc(p.year || '')], ['Type', esc(p.category || '')],
    ['What we made', esc(p.scope || '')], ['Technique', esc([].concat(p.techniques || []).join(' · '))],
    ['Materials', esc([].concat(p.materials || []).join(' · '))], ['Size', esc(p.size || '')],
    ['Photography', esc(p.photographer || '')]
  ].filter(([, v]) => v);
  const media = [].concat(p.video ? [p.video] : [], p.images || []);
  const designs = [].concat(p.products || []).map(sl => indexable.find(d => d.slug === sl)).filter(Boolean);
  const title = `${p.name} — ${p.discipline || 'Project'}${p.location ? ', ' + p.location : ''} | Artilier`;
  const descRaw = p.summary || `${p.discipline || 'Work'} by Artilier for ${p.name}${p.location ? ' in ' + p.location : ''}${p.designer ? ', with ' + p.designer : ''}.`;
  const desc = descRaw.length <= 158 ? descRaw : descRaw.slice(0, 157).replace(/[\s,;:—–-]+\S*$/, '') + '…';   // cut at a word boundary
  const schema = graph([
    { '@type':'WebPage','@id':`${url}#webpage`,'url':url,'name':title,'description':desc,'isPartOf':{'@id':`${HOST}/#website`},
      'breadcrumb':{'@id':`${url}#breadcrumb`},'about':{'@id':`${HOST}/#organization`},'inLanguage':'en' },
    { ...breadcrumb([{ name:'Artilier', abs:`${HOST}/` }, { name:'Projects', abs:`${HOST}/projects/` }, { name:p.name, abs:url }]), '@id':`${url}#breadcrumb` }
  ]);
  const ogImage = (() => { try { const m = JSON.parse(rd('assets/media/manifest.json'))[p.hero]; return m && m.type !== 'video' && m.src ? `${HOST}/assets/media/${m.src.split('?')[0]}` : undefined; } catch { return undefined; } })();
  return head({ title, desc, canonical:url, up:UP, schema, ogImage })
    + nav(UP) + crumb([{ name:'Artilier', href:UP }, { name:'Projects', href:'../' }, { name:p.name, href:url }]) + `
<main id="main">
<header class="wp-hd">
  <div>
    <span class="lb">${esc(['Project', p.discipline].filter(Boolean).join(' · '))}</span>
    <h1 class="d1">${esc(p.name)}</h1>
  </div>
  <div>
    ${p.summary ? `<p class="bd">${esc(p.summary)}</p>` : ''}
    <div class="wp-meta">${[p.designer && `<span><b>${esc(p.designer)}</b></span>`, p.location && `<span>${esc(p.location)}</span>`, p.year && `<span>${esc(p.year)}</span>`].filter(Boolean).join('')}</div>
  </div>
</header>
<section class="sec tight">
  ${p.hero ? `<div class="gal">${'<figure class="full">' + slotImg(p.hero, p.name, UP, true) + '</figure>'}</div>` : ''}
  <div class="facts">${facts.map(([k, v]) => `<div><b>${k}</b><span>${v}</span></div>`).join('')}</div>
</section>
${(p.brief || p.developed) ? `<section class="sec"><div class="cols2">${[['The brief', p.brief], ['What we developed', p.developed]].filter(([, t]) => t).map(([lb, t]) => `<div><span class="lb">${lb}</span><div class="prose" style="margin-top:18px">${String(t).split(/\n\n+/).map(par => `<p>${esc(par)}</p>`).join('')}</div></div>`).join('')}</div></section>` : ''}
${media.length ? `<section class="sec gal-sec"><div class="gal">${media.map((id, i) => `<figure${i % 3 === 0 ? ' class="w"' : ''}>${slotImg(id, p.name + ' — detail', UP)}<figcaption data-mf="${esc(id)}"></figcaption></figure>`).join('')}</div></section>` : ''}
${designs.length ? `<section class="sec"><div class="sec-hd"><div><span class="lb">In the collection</span><h2 class="d2">Designs in this<br><span class="it">project.</span></h2></div>
  <p class="bd">${designs.map(d => `<a href="${UP}collection/${esc(d.slug)}/">${esc(d.name)}</a>`).join(' · ')}</p></div></section>` : ''}
${ctaBlock(UP, 'contact/', 'Start a project', [['projects/','All projects'],['bespoke/','Bespoke development'],['embroidery/','Embroidery']])}
</main>` + footer(UP);
};

/* ── /privacy/ — privacy notice (Stage 10D). Every statement maps to an actual
   process or setting checked on 11 Oct 2026; see ARTILIER_stage10D report.
   PRIVACY_PUBLISHED must be the real publication date: if this is merged after
   12 October 2026, change the line below to the merge date before merging. ── */
const PRIVACY_PUBLISHED = '12 October 2026';
const privacy = shell({
  path:'privacy/', up:'../', robots:'noindex,follow',
  title:'Privacy Notice | Artilier',
  desc:'How Artilier handles enquiry details, business contact details, analytics and cookies on artilier.co.',
  lb:'Privacy', h1:'Privacy', h1it:'notice.',
  lead:`<p class="bd">This notice explains what information Artilier collects through artilier.co and in the course of its trade enquiries, why, how long it is kept and the choices you have. Artilier is a studio of Art Avenue Pvt. Ltd., New Delhi, India, which is responsible for this information. Write to <a href="mailto:studio@artilier.co">studio@artilier.co</a> about anything in this notice.</p>
    <p class="bd" style="margin-top:12px">Last updated: ${PRIVACY_PUBLISHED}.</p>`,
  body:`
${sec('Enquiries', 'What you', 'send us.', `<div class="prose">
    <p>When you use an enquiry form we receive what you enter — your name, studio or company, email address, where you are based, the type of project, construction, a description of the project, quantities, dimensions, target date and project location. With it we receive the page you sent it from, the page you first arrived on, the website that referred you, any campaign tags in the link you followed and, where relevant, the design or product page that led you to the form.</p>
    <p>The form is delivered to our studio inbox by Formspree, a form-handling service; we have switched off Formspree’s storage of submissions in its dashboard, so the email in our inbox is our record. If you email us directly or send drawings or artwork, they are held in our studio email, which runs on Google Workspace. If you message us on WhatsApp, the conversation is carried by WhatsApp (part of Meta) under its own terms, and we treat it like email: we use it only to reply to you and about the work you ask about.</p>
    <p>We use these details to reply to you, to discuss, quote for and carry out the work you ask about, and to keep a record of our business correspondence. We do not sell them and do not use them for advertising.</p>
  </div>`)}
${sec('Business contacts', 'Studios we', 'write to.', `<div class="prose">
    <p>We introduce our work to interior design and architecture studios. For that we keep business contact details that studios publish themselves — studio name, website, the names and roles of people listed on it, published business email addresses and the projects they show — together with a record of what we sent and any reply. We write only about trade work relevant to the studio. Every email says how to ask us not to write again; if you ask, we stop and keep only what we need to make sure we do not contact you again.</p>
  </div>`, { dark:true })}
${sec('Analytics and cookies', 'How the site', 'is measured.', `<div class="prose">
    <p><b>Hosting.</b> The site is served through Cloudflare, which processes technical information such as IP addresses to deliver pages and protect the site. <b>Cloudflare Web Analytics</b> counts page views without cookies and without identifying you. Fonts are served from artilier.co itself.</p>
    <p><b>Google Analytics 4</b> helps us see which pages are useful and which lead to enquiries. When it runs it sets two first-party cookies, <code>_ga</code> and <code>_ga_8TXE25YJ86</code>, which hold a random identifier and, according to Google, last up to two years. Google states that Google Analytics 4 does not log or store IP addresses. We do not use it for advertising: Google signals, advertising storage and ad personalisation are switched off, and the events we send never include your name, email, phone number or message. In our Google Analytics settings, event-level data is kept for 2 months and user-level data for 14 months.</p>
    <p><b>Your choice.</b> If you visit from the United Kingdom, the European Economic Area or Switzerland — or if we cannot tell where you are — Google Analytics does not load and no analytics cookie is set unless you choose <b>Allow analytics</b>. To decide this, the site asks Cloudflare which country your connection comes from; that answer is not stored. Elsewhere, Google Analytics loads by default. Wherever you are, you can allow or withdraw analytics at any time in <a href="#cookie-settings" data-consent-open>Cookie settings</a>; withdrawing stops Google Analytics on this site and removes its cookies from your browser.</p>
    <p><b>In your browser.</b> Your cookie choice is remembered in your browser's local storage (<code>artilier_consent</code>) until you change it or clear your browser data. For the length of a visit the site may keep the page you arrived on, the referring site and any campaign tags in session storage (<code>artilier_touch</code>), so that an enquiry you send tells us how you found us; in the UK, EEA and Switzerland this happens only after you allow analytics. Session storage is cleared when you close the tab.</p>
  </div>`)}
${sec('Retention', 'How long we', 'keep it.', `<div class="prose">
    <p>We keep enquiries, related correspondence and business-contact records for 24 months after our last meaningful interaction with you, and then delete them — unless we need to keep them longer because of a contract with you, a legal or accounting obligation, or a dispute, in which case we keep them only for as long as that requires. Where you have asked us not to contact you again, we keep the minimum needed to respect that request.</p>
  </div>`, { dark:true })}
${sec('Where it is processed', 'Your rights', 'and choices.', `<div class="prose">
    <p>We are based in India. Our service providers — Google, Formspree and Cloudflare, and WhatsApp if you message us there — may process information in other countries, including the United States.</p>
    <p>Depending on where you are, you may have the right to ask for a copy of the information we hold about you, to have it corrected or deleted, to object to or restrict its use, and to withdraw consent at any time without affecting what happened before. Write to <a href="mailto:studio@artilier.co">studio@artilier.co</a>; we aim to reply within one month. If you are in the UK or the European Economic Area, you can also complain to your data protection authority — in the UK, the Information Commissioner's Office.</p>
    <p>We will update this notice when our practices change and show the date of the latest version at the top.</p>
  </div>`)}
${ctaBlock('../', 'contact/', 'Contact the studio', [['about/','About the studio'],['trade/','Trade']])}`
});

/* ── /hospitality/ — Stage 5 Brief D + Stage 6 C-10 ────────────────── */
/* Rug copy unchanged except the specification section (approved compliance
   sentence). Embroidery lead times are product-labelled; no installation,
   headboard freight or certification statement is made. */
const hospitality = shell({
  path:'hospitality/', up:'../',
  title:'Hotel Rugs, Headboards & Embroidery | Artilier',
  desc:'Custom hotel rugs, embroidered headboards, wall panels and furnishing fabric for hospitality projects, developed from the designer’s scheme. Trade only.',
  lb:'Hospitality & contract', h1:'Rugs and embroidery<br>for ', h1it:'hospitality.',
  lead:`<p class="bd">For hospitality designers, architects and procurement teams: custom rugs for hotels and boutique hospitality projects, made to the dimensions of each room — and embroidered headboards, wall panels and furnishing fabric developed for the same scheme in our New Delhi studio.</p>
    <div class="wp-meta"><span><b>Made to the schedule</b></span><span>Rugs and embroidery</span><span>One point of contact</span></div>`,
  nodes:[ service('hospitality/', 'Custom rugs for hospitality projects', 'Custom rug development and manufacture for hotels and hospitality interiors',
    'Development, sampling, production, quality control and export coordination of custom hand-knotted, hand-tufted and flatweave rugs for hotels and hospitality interiors, made to each room’s dimensions and the designer’s scheme.',
    'Hospitality interior designers, architects and procurement teams'),
    { ...service('hospitality/', 'Embroidery for hospitality projects', 'Custom embroidered headboards, wall panels and furnishing fabric for hotels',
    'Embroidered headboards (complete, or panels for the client’s upholsterer), embroidered wall panels supplied for installation by the project’s appointed contractor, and embroidered furnishing fabric by the metre, developed to the hotel’s scheme.',
    'Hospitality interior designers, architects and procurement teams'), '@id':`${HOST}/hospitality/#service-embroidery` } ],
  body:`
${sec('What we make for hospitality', 'Custom rugs,', 'not stock.', `<div class="mats">
    <div>Hand-knotted <span>Finest definition</span></div>
    <div>Hand-tufted <span>Carving · shorter lead time</span></div>
    <div>Flatweave <span>Low profile · graphic</span></div>
    <div>Sized to each room <span>Made to order</span></div>
    <div>Custom colourways <span>Matched to the scheme</span></div>
    <div>Multi-rug schedules <span>One project, many rooms</span></div>
    <div>No minimum <span>Single pieces welcome</span></div>
    <div>Rug lead time <span>Usually 6–12 weeks from strike-off approval</span></div>
  </div>`, { dark:true, intro:'Hotel rugs are made to order in the construction, material, colourway and dimensions the project needs. Collection designs can be adapted to a scheme, or a rug developed from the designer’s own artwork. See <a href="../bespoke/">bespoke development</a>.' })}
${sec('Embroidery for the same rooms', 'Headboards, walls', 'and fabric.', `<div class="cols2">
    <div class="prose">
      <h3><a href="../embroidery/headboards/">Embroidered headboards</a></h3>
      <p>Complete upholstered headboards, or embroidered panels for your upholsterer. Repeat production for hotel room schedules; no fixed minimum. Production typically takes 3–4 months; more complex projects may require up to 6 months.</p>
      <h3><a href="../embroidery/">Embroidered wall panels</a></h3>
      <p>Bespoke panels for suites, corridors and public areas, from a single piece to a full wall, supplied for installation by your appointed contractor. No fixed minimum. Production typically takes 3–4 months; more complex projects may require up to 6 months.</p>
      <h3><a href="../embroidery/fabrics/">Embroidered fabric</a></h3>
      <p>Furnishing fabric by the metre for upholstery and curtains. Typical lead time 6–8 weeks; complex work up to 6 months.</p>
    </div>
    <div class="gal"><figure class="full">${slotImg('e2', 'Embroidery — zardozi panel on the frame', '../')}<figcaption data-mf="e2"></figcaption></figure></div>
  </div>`, { intro:'Developed in the same studio as the rugs, so colour and motif can carry across a room. Delivery dates are confirmed for each product only after the specification has been reviewed.' })}
${sec('How a hospitality project runs', 'From schedule', 'to dispatch.', `<div class="proc">
    <div class="pstep"><span class="pn">01</span><span class="pt">Understand</span><span class="pd">The rug schedule — rooms, quantities, sizes — with drawings, scheme and application. We come back with our thoughts, questions and what still needs resolving.</span></div>
    <div class="pstep"><span class="pn">02</span><span class="pt">Develop</span><span class="pd">Construction, yarn, pile and colour worked through for each rug type. Where there is enough information, an initial cost range follows.</span></div>
    <div class="pstep"><span class="pn">03</span><span class="pt">Sample</span><span class="pd">Yarn samples, colour trials and woven strike-offs, approved in the hand before production. A strike-off takes 2–3 weeks once the design is approved, and its cost is credited against the order — plan it against any mock-up room date.</span></div>
    <div class="pstep"><span class="pn">04</span><span class="pt">Make</span><span class="pd">Weaving, tufting or flatweaving to each size, in the workshop suited to the construction, with progress photography at agreed points.</span></div>
    <div class="pstep"><span class="pn">05</span><span class="pt">Check</span><span class="pd">Quality control against the specification and approved sample — dimensions, pile, colour, binding, backing and finishing — reviewed in Delhi.</span></div>
    <div class="pstep"><span class="pn">06</span><span class="pt">Deliver</span><span class="pd">Rugs are usually shipped rolled and wrapped, with export documentation and freight coordinated through our logistics partners. Prices are usually quoted ex-works in USD or EUR; FOB or DDP on request.</span></div>
  </div>
  <p class="proc-note">For embroidery, strike-offs, where required, typically take 2–3 weeks. Delivery dates are confirmed only after the specification has been reviewed. Installation on site is by the project’s appointed contractor.</p>`)}
${sec('Specification and documentation', 'Agreed before', 'the order.', `<div class="prose">
    <p>Project-specific documentation and testing requirements can be discussed during specification. Any required standards and supporting evidence must be assessed and agreed before the order is accepted. We do not hold product certifications, and the ability to arrange testing for a project is not a guarantee of a result. Please include any fire, wear or cleaning requirements in the brief.</p>
    <p>We say plainly where a material or construction is unsuited to the traffic a room will take.</p>
  </div>`, { dark:true })}
${sec('What to send', 'A useful', 'first brief.', list([
  '<b>Rug schedule</b> — room or area, quantity and size for each rug type',
  '<b>Embroidery</b> — headboards, wall panels or fabric for the same rooms, with quantities by room type',
  '<b>Design intent</b> — artwork, scheme, references, or the collection designs you are considering',
  '<b>Construction preference</b> — or leave it to our recommendation',
  '<b>Specification requirements</b> — any performance, cleaning or documentation standards',
  '<b>Programme</b> — mock-up room date, target delivery date and project location'
]))}
${sec('Contracting', 'One supplier,', 'one point of contact.', `<div class="prose"><p>Artilier is the trade studio of Art Avenue Pvt. Ltd., our manufacturing company in New Delhi. Orders are contracted, invoiced and exported through that entity, with established export documentation, and you have one point of contact from brief to dispatch. Costing and lead times are given per project once construction, materials, sizes and sampling are understood.</p></div>`)}
${ctaBlock('../', 'contact/?type=hospitality', 'Send a hospitality brief', [['embroidery/headboards/','Embroidered headboards'],['embroidery/','Embroidered wall panels'],['embroidery/fabrics/','Embroidered fabric'],['bespoke/','Bespoke rugs'],['materials/','Materials'],['process/','The process'],['trade/','Trade']])}`
});

/* ── market pages ──────────────────────────────────────────────────── */
const market = m => shell({
  path:`trade/${m.slug}/`, up:'../../', crumbName:m.crumb,
  title:m.title, desc:m.desc, lb:m.lb, h1:m.h1, h1it:m.h1it,
  lead:`<p class="bd">${m.lead}</p>
    <div class="wp-meta">${m.meta.map((x, i) => i ? `<span>${x}</span>` : `<span><b>${x}</b></span>`).join('')}</div>`,
  nodes:[ service(`trade/${m.slug}/`, m.serviceName, 'Custom rug development and manufacture for design practices',
    m.serviceDesc, 'Interior designers, architects, hospitality designers and design practices', m.area) ],
  body: m.body.replace('\n<div class="backhome">', (EMB_LINK[m.slug] || '') + '\n<div class="backhome">')
});
const UP2 = '../../';
const EMB_LINK = Object.fromEntries([['uae','UAE and Gulf'],['saudi-arabia','Saudi'],['uk','UK'],['us','US']].map(([sl, lab]) => [sl, `
<section class="sec">
  <div class="sec-hd"><div><span class="lb">Also from the studio</span><h2 class="d2">Hand embroidery,<br>for the same <span class="it">rooms.</span></h2></div>
  <p class="bd">Wall panels, framed works, headboards, upholstery panels, cushions and drapery in zardozi, zari, aari, raffia and hand embroidery — developed alongside your rugs so colour and motif carry across. <a href="../../embroidery/${sl}/">Embroidery for ${lab} projects</a>.</p></div>
</section>
`]));
const marketLinks = self => [['trade/uae/','UAE'],['trade/saudi-arabia/','Saudi Arabia'],['trade/uk/','United Kingdom'],['trade/us/','United States']].filter(([h]) => !h.includes(self));
const common = {
  samples: ['Can we approve samples before production?', 'Yes. Yarn samples, colour trials and a woven strike-off are approved in the hand before the full rug is set on the loom; the strike-off takes 2–3 weeks once the design is approved, and its cost is credited against the order.'],
  adapt: ['Can a collection design be adapted?', `Yes. Every design in <a href="${UP2}collection/">the collection</a> can be re-scaled, re-proportioned and re-coloured to your scheme, and made to the size the room needs within what the design and construction allow.`],
  contract: ['Who do we contract with?', 'Art Avenue Pvt. Ltd., our manufacturing company in New Delhi. Artilier is its trade studio; orders are contracted, invoiced and exported through that entity.'],
  pricing: ['How are prices quoted, and on what terms?', 'Prices are quoted in USD or EUR, usually ex-works; FOB or DDP can be quoted separately on request. Payment terms are set out in the quote, and rugs are usually shipped rolled.'],
  time: ['What are the lead times, and is there a minimum?', 'Lead times usually run 6–12 weeks from strike-off approval and can extend to six months in some cases. There is no minimum order — a single rug is welcome. Costing follows once construction, materials, dimensions and sampling are understood.']
};

const uae = market({
  slug:'uae', crumb:'UAE',
  title:'Bespoke Rugs & Carpets for UAE Interior Designers | Artilier',
  desc:'Custom rugs for villas, residences and hospitality in Dubai and Abu Dhabi — developed from your scheme in New Delhi and made to size. Trade only.',
  lb:'Trade · United Arab Emirates', h1:'Bespoke rugs for<br>', h1it:'Dubai and Abu Dhabi.',
  lead:'For interior designers, architects and hospitality teams in Dubai and Abu Dhabi: rugs developed from your scheme or artwork in our New Delhi studio, approved in sample, and made to the dimensions of each room.',
  meta:['UAE projects','Made to size','Sampled for approval'],
  serviceName:'Bespoke rugs for UAE design projects', area:[country('United Arab Emirates','AE')],
  serviceDesc:'Custom hand-knotted, hand-tufted and flatweave rugs for residential and hospitality projects in Dubai, Abu Dhabi and the wider UAE, developed and sampled in New Delhi and made to each room’s dimensions.',
  body:`
${sec('Rugs or carpets', 'Brief us in the word', 'your drawings use.', `<div class="prose">
    <p>On UAE specifications, “bespoke carpet” and “bespoke rug” are often used for the same thing: a hand-made piece made to a room’s size and layout. Our work is hand-made rugs in three constructions — <a href="${UP2}collection/hand-knotted/">hand-knotted</a>, <a href="${UP2}collection/hand-tufted/">hand-tufted</a> and <a href="${UP2}collection/flatweave/">flatweave</a> — and we recommend the construction from the artwork, the detail it carries and the traffic the room will take.</p>
  </div>`)}
${sec('Typical briefs', 'Large rooms,', 'exact sizes.', list([
  '<b>Villas and private residences</b> — living and reception rooms, majlis, bedrooms and dining rooms, each rug made to the room rather than to a standard size',
  '<b>Penthouses and apartments</b> — rugs proportioned to furniture layouts and open-plan zones',
  '<b>Boutique hospitality</b> — suites, lobbies and restaurants, often as a schedule of several rug types. See <a href="'+UP2+'hospitality/">hospitality</a>',
  '<b>Rugs from your own artwork</b> — a painting, pattern or CAD file developed into a finished rug. See <a href="'+UP2+'bespoke/">bespoke development</a>'
]), { dark:true })}
${sec('Working together', 'An hour and a half', 'apart.', `<div class="prose">
    <p>New Delhi (IST, UTC+5:30) is one hour thirty minutes ahead of the UAE (GST, UTC+4), and the UAE working week largely runs Monday to Friday — so most of a Dubai or Abu Dhabi working day overlaps with ours. Briefs, drawings and approvals move by email, and for a quick question you can also <a href="https://wa.me/919828030095" target="_blank" rel="noopener">WhatsApp the studio</a>; samples and strike-offs are approved in the hand before production.</p>
  </div>`)}
${sec('What to send', 'A useful', 'UAE brief.', list([
  '<b>Rug schedule</b> — room, quantity and size, in metres or centimetres',
  '<b>Design intent</b> — artwork, scheme or the collection designs you are considering',
  '<b>Application</b> — where each rug sits (majlis, bedroom, lobby…) so material and construction suit the traffic',
  '<b>Delivery</b> — emirate and city, the site contact or fit-out contractor, and the target handover date'
]), { dark:true })}
${sec('Questions', 'From UAE', 'practices.', qa([
  common.samples,
  common.time,
  common.pricing,
  ['Can you make a rug for a majlis or a very large room?', 'Every rug is made to order, so the size follows the room rather than a standard size. Send the floor plan: proportions are resolved with you before sampling, and any size limit for the chosen construction is confirmed at that stage.'],
  ['Carpet or rug — does the wording matter?', 'No. Brief us in the term your drawings use; we confirm the construction, size and finish in the specification.']]))}
${ctaBlock(UP2, 'contact/?type=residential', 'Start a UAE project', [...marketLinks('uae'), ['hospitality/','Hospitality'], ['guides/briefing-a-bespoke-rug/','Briefing guide']])}`
});

const ksa = market({
  slug:'saudi-arabia', crumb:'Saudi Arabia',
  title:'Custom Rugs & Carpets for Saudi Arabia Projects | Artilier',
  desc:'Bespoke rugs for residences and hospitality in Riyadh, Jeddah and AlUla — developed from your scheme, sampled for approval, made to size. Trade only.',
  lb:'Trade · Saudi Arabia', h1:'Custom rugs for<br>', h1it:'Riyadh, Jeddah and AlUla.',
  lead:'For interior designers, architects and hospitality teams working in Saudi Arabia: rugs developed from your scheme or artwork in our New Delhi studio, approved in sample, and made to the dimensions of each room.',
  meta:['Saudi projects','Residential & hospitality','Sampled for approval'],
  serviceName:'Custom rugs for Saudi Arabia design projects', area:[country('Saudi Arabia','SA')],
  serviceDesc:'Custom hand-knotted, hand-tufted and flatweave rugs for residential and hospitality projects in Riyadh, Jeddah, AlUla and across Saudi Arabia, developed and sampled in New Delhi and made to each room’s dimensions.',
  body:`
${sec('Project types', 'Residences,', 'hospitality, destinations.', list([
  '<b>Riyadh and Jeddah residences</b> — villas, palaces and apartments, with rugs made to each room rather than to standard sizes',
  '<b>Hospitality</b> — hotels and resorts, including destination projects such as AlUla, usually briefed as a schedule of rug types across many rooms. See <a href="'+UP2+'hospitality/">hospitality</a>',
  '<b>Rugs from your own artwork</b> — a pattern, painting or CAD file developed into a finished rug. See <a href="'+UP2+'bespoke/">bespoke development</a>'
]))}
${sec('Planning', 'Long programmes,', 'early schedules.', `<div class="prose">
    <p>Larger Saudi projects often run on long programmes with several rug types per building. Send the full rug schedule as early as you can: sampling can then be planned against the programme — including any mock-up room — and each rug type approved in the hand before production begins.</p>
    <p>On Saudi specifications “carpet” is common, particularly in hospitality. Our work is hand-made rugs in three constructions — hand-knotted, hand-tufted and flatweave — made to each room’s size.</p>
  </div>`, { dark:true })}
${sec('Working together', 'Two and a half', 'hours apart.', `<div class="prose">
    <p>Saudi Arabia (AST, UTC+3) is two hours thirty minutes behind New Delhi (IST, UTC+5:30), and the Saudi working week runs Sunday to Thursday. Briefs, drawings and approvals move by email, and for a quick question you can also <a href="https://wa.me/919828030095" target="_blank" rel="noopener">WhatsApp the studio</a>; samples and strike-offs are approved in the hand before production.</p>
  </div>`)}
${sec('What to send', 'A useful', 'Saudi brief.', list([
  '<b>Rug schedule</b> — by building or phase: room, quantity and size in metres or centimetres',
  '<b>Design intent</b> — artwork, scheme or collection designs under consideration',
  '<b>Specification requirements</b> — any performance, cleaning or documentation standards the project sets',
  '<b>Programme</b> — mock-up date, delivery city and target handover'
]), { dark:true })}
${sec('Questions', 'From Saudi', 'practices.', qa([
  ['Can sampling be planned around a mock-up room?', 'Yes. Give us the mock-up date and the rug types it needs; yarn samples, colour trials and strike-offs are scheduled back from it and approved in the hand.'],
  ['Can one supplier cover several rug types?', 'Yes. Hand-knotted, hand-tufted and flatweave rugs can sit in one schedule, developed by Artilier and contracted, invoiced and exported through one entity, Art Avenue Pvt. Ltd.'],
  common.time,
  common.pricing]))}
${ctaBlock(UP2, 'contact/?type=hospitality', 'Start a Saudi project', [...marketLinks('saudi-arabia'), ['hospitality/','Hospitality'], ['guides/briefing-a-bespoke-rug/','Briefing guide']])}`
});

const uk = market({
  slug:'uk', crumb:'United Kingdom',
  title:'Bespoke Rugs to the Trade — London & UK Designers | Artilier',
  desc:'Bespoke hand-knotted, hand-tufted and flatweave rugs for UK interior designers — developed from your artwork, sampled, made to size. Trade only.',
  lb:'Trade · United Kingdom', h1:'Bespoke rugs<br>for ', h1it:'London practices.',
  lead:'For interior designers and architects in London and across the UK: bespoke rugs developed from your artwork or scheme in our New Delhi studio, proved in a strike-off, and made to the size each room needs — to the trade only.',
  meta:['To the trade','Made to size','Strike-off approved'],
  serviceName:'Bespoke rugs for UK interior designers', area:[country('United Kingdom','GB')],
  serviceDesc:'Bespoke hand-knotted, hand-tufted and flatweave rugs for interior designers and architects in London and the UK, developed from the designer’s artwork or scheme and made to order and sized to each project.',
  body:`
${sec('Bespoke, to the trade', 'Your drawing,', 'developed properly.', `<div class="prose">
    <p>We work only with practices — no showroom retail, no consumer pricing. Send a painting, drawing, CAD file or colour scheme; we develop construction, yarn, colour separation and scale with you, then prove it in a woven strike-off before the rug is set on the loom. Collection designs can equally be re-coloured and re-scaled to your scheme.</p>
  </div>`)}
${sec('Typical briefs', 'Townhouses to', 'boutique hotels.', list([
  '<b>Residential</b> — townhouses, country houses and apartments, with rugs sized to the room and the furniture plan',
  '<b>Rugs from artwork</b> — artist or designer collaborations credited to both names. See <a href="'+UP2+'collaborations/">collaborations</a>',
  '<b>Boutique hospitality</b> — suites, public areas and private dining, briefed as a rug schedule. See <a href="'+UP2+'hospitality/">hospitality</a>'
]), { dark:true })}
${sec('Working together', 'Four and a half', 'hours ahead.', `<div class="prose">
    <p>New Delhi is four hours thirty minutes ahead of London in summer (BST) and five hours thirty minutes in winter (GMT), so a London morning overlaps our afternoon. Briefs and approvals move by email; samples and strike-offs are approved in the hand.</p>
  </div>`)}
${sec('What to send', 'A useful', 'UK brief.', list([
  '<b>Artwork or scheme</b> — any medium, vector or scan',
  '<b>Sizes</b> — in metres, centimetres or feet and inches, or a floor plan',
  '<b>Construction</b> — a preference, or leave it to our recommendation',
  '<b>Programme</b> — target date on site and delivery address'
]), { dark:true })}
${sec('Questions', 'From UK', 'practices.', qa([
  ['Can the rug be credited to the artist or designer?', `Yes. Rugs developed from a designer's or artist's own work can be credited to both names — see <a href="${UP2}collaborations/">collaborations</a>.`],
  common.adapt,
  common.samples,
  common.time,
  common.pricing]))}
${ctaBlock(UP2, 'contact/?type=bespoke', 'Start a UK project', [...marketLinks('uk'), ['bespoke/','Bespoke development'], ['guides/briefing-a-bespoke-rug/','Briefing guide']])}`
});

const us = market({
  slug:'us', crumb:'United States',
  title:'Custom Rugs to the Trade — New York & Texas | Artilier',
  desc:'Custom hand-knotted and hand-tufted rugs for interior designers in New York, Dallas, Houston and Austin — developed from your artwork, made to size.',
  lb:'Trade · United States', h1:'Custom rugs<br>', h1it:'to the trade.',
  lead:'For interior designers and architects in New York, the Hamptons, Dallas, Houston and Austin: custom rugs developed from your artwork or scheme in our New Delhi studio, approved in a strike-off, and made to the size each room needs.',
  meta:['To the trade','Feet or metres','Strike-off approved'],
  serviceName:'Custom rugs for US interior designers', area:[country('United States','US')],
  serviceDesc:'Custom hand-knotted, hand-tufted and flatweave rugs for interior designers and architects in New York and Texas, developed from the designer’s artwork or scheme and made to order and sized to each project.',
  body:`
${sec('New York', 'Manhattan', 'and the Hamptons.', `<div class="prose">
    <p>Apartments and townhouses where a rug has to work to an exact furniture plan, and Hamptons houses briefed against the date the house opens for the season. Tell us the date the rug must be on site; sampling and production are planned back from it.</p>
  </div>`)}
${sec('Texas', 'Dallas, Houston', 'and Austin.', `<div class="prose">
    <p>Custom homes and large living spaces where standard sizes rarely fit. Every rug is made to order, so the size follows the room — send the floor plan and we resolve proportions with you before sampling.</p>
  </div>`, { dark:true })}
${sec('Working together', 'Briefed by email,', 'approved in hand.', `<div class="prose">
    <p>New Delhi is nine hours thirty minutes ahead of New York during daylight saving time (ten hours thirty in winter), and Texas is an hour further behind. Work moves by email: a brief sent at the end of your day reaches us at the start of ours. Send sizes in feet and inches or metres, whichever your drawings use. Samples and strike-offs are approved in the hand before production.</p>
  </div>`)}
${sec('Questions', 'From US', 'practices.', qa([
  ['Do you work with private clients?', 'Not directly. Artilier works trade only — with interior designers, architects, design practices and galleries, and with collectors through the galleries that represent them.'],
  ['Can a Hamptons rug be timed to the season?', 'Tell us the date the rug must be on site. Lead times usually run 6–12 weeks from strike-off approval and can extend to six months in some cases, so the earlier the brief, the more options remain open.'],
  common.contract,
  common.pricing]))}
${ctaBlock(UP2, 'contact/?type=residential', 'Start a US project', [...marketLinks('us'), ['collection/','The collection'], ['guides/briefing-a-bespoke-rug/','Briefing guide']])}`
});

/* ── /fr/ — French trade page ──────────────────────────────────────── */
const fr = shell({
  path:'fr/', up:'../', lang:'fr', locale:'fr_FR', crumbName:'Français',
  title:'Tapis sur mesure pour architectes d’intérieur | Artilier',
  desc:'Tapis noués main, tuftés main et tissés à plat, réalisés sur mesure d’après vos dessins pour architectes d’intérieur. Studio à New Delhi, professionnels.',
  lb:'Tapis sur mesure · Réservé aux professionnels', h1:'Votre dessin.<br>Notre ', h1it:'savoir-faire.',
  lead:`<p class="bd">Artilier est un studio de création de tapis basé à New Delhi, qui travaille exclusivement avec les architectes d’intérieur, les architectes et les agences de design. Chaque tapis est réalisé sur mesure — technique, matière, coloris et dimensions — d’après une pièce de notre collection ou d’après votre propre dessin.</p>
    <div class="wp-meta"><span><b>Professionnels uniquement</b></span><span>Dimensions sur mesure</span><span>Coloris sur mesure</span></div>`,
  nodes:[ service('fr/', 'Tapis sur mesure pour architectes d’intérieur', 'Conception et fabrication de tapis sur mesure',
    'Développement de tapis noués main, tuftés main et tissés à plat d’après le dessin, l’œuvre ou la palette de l’architecte d’intérieur, avec échantillonnage avant production.',
    'Architectes d’intérieur, architectes et agences de design') ],
  body:`
${sec('Le tapis sur mesure', 'Un tapis de décoration,', 'pas un tapis de sol standard.', `<div class="prose">
    <p>Nous concevons des tapis d’intérieur haut de gamme pour des projets résidentiels et d’hôtellerie : pièces uniques réalisées aux dimensions exactes de la pièce, d’après un tableau, un dessin, un fichier CAO ou une palette de couleurs. Ce sont des pièces de décoration intérieure, conçues pour une pièce précise — ni tapis d’entrée, ni tapis de sol standard.</p>
  </div>`)}
${sec('Ce que vous pouvez nous envoyer', 'Là où en est', 'votre projet.', list([
  '<b>Une œuvre ou un tableau</b> — quel que soit le support',
  '<b>Un dessin ou un fichier CAO</b> — vectoriel ou numérisé',
  '<b>Une image de référence</b> — comme point de départ',
  '<b>Une palette de couleurs</b> — reproduite à la main',
  '<b>Un plan</b> — pour définir les dimensions'
]) + `<p class="bd" style="margin-top:22px">S’il manque des informations, nous vous indiquons ce qui doit être précisé avant de pouvoir chiffrer correctement le projet.</p>`, { dark:true })}
${sec('Trois techniques', 'Noué main, tufté main ou tissé à plat :', 'quelle technique pour votre projet ?', `<div class="proc">
    <div class="pstep"><span class="pn">01</span><span class="pt">Noué main</span><span class="pd">Nœud par nœud sur le métier : la définition la plus fine, celle qui restitue le mieux une œuvre picturale — et le délai le plus long. <a href="../collection/hand-knotted/">Voir les modèles</a></span></div>
    <div class="pstep"><span class="pn">02</span><span class="pt">Tufté main</span><span class="pd">Sculpture, hauteurs de velours multiples, surfaces bouclées et coupées, pour un délai plus court que le noué main. <a href="../collection/hand-tufted/">Voir les modèles</a></span></div>
    <div class="pstep"><span class="pn">03</span><span class="pt">Tissé à plat</span><span class="pd">Bas, graphique, plus léger : pour le travail géométrique, la superposition et les pièces où un velours serait trop haut. <a href="../collection/flatweave/">Voir les modèles</a></span></div>
  </div>
  <p class="bd" style="margin-top:22px">Nous recommandons la technique selon le dessin, le niveau de détail, le passage que recevra la pièce et le budget — et nous la validons par un échantillon avant production.</p>`)}
${sec('Matières', 'Le choix de la matière', 'fait partie du dessin.', `<div class="mats">
    <div>Laine de Nouvelle-Zélande <span>Velours · résistante</span></div>
    <div>Laine filée main <span>Velours · caractère</span></div>
    <div>Laine et soie <span>Velours · reflets</span></div>
    <div>Soie de bambou <span>Velours · brillance</span></div>
    <div>Coton <span>Chaîne · tissé à plat</span></div>
    <div>Ortie de l’Himalaya (allo) / chanvre <span>Texture · naturelle</span></div>
    <div>Jute <span>Tissé à plat · naturel</span></div>
    <div>Mélanges développés <span>Selon le dessin</span></div>
  </div>
  <p class="proc-note" style="color:rgba(247,243,235,.62)">Fil, filature et bain de teinture sont validés en main, d’après votre palette, avant la mise sur métier.</p>`, { dark:true })}
${sec('Le processus', 'Six étapes,', 'des validations à chaque étape.', `<div class="proc">
    <div class="pstep"><span class="pn">01</span><span class="pt">Comprendre</span><span class="pd">Dessin, dimensions, palette et usage — puis nos remarques, nos questions et ce qui reste à préciser.</span></div>
    <div class="pstep"><span class="pn">02</span><span class="pt">Développer</span><span class="pd">Technique, fil, densité de nœuds, hauteur de velours, séparation des couleurs et échelle. Une première fourchette de prix dès que les informations le permettent.</span></div>
    <div class="pstep"><span class="pn">03</span><span class="pt">Échantillonner</span><span class="pd">Échantillons de fil, essais de couleur et échantillon tissé, validés en main avant la mise sur métier.</span></div>
    <div class="pstep"><span class="pn">04</span><span class="pt">Réaliser</span><span class="pd">Tissage, tuftage ou tissage à plat à vos dimensions, avec des photos d’avancement aux étapes convenues.</span></div>
    <div class="pstep"><span class="pn">05</span><span class="pt">Contrôler</span><span class="pd">Contrôle qualité à New Delhi, d’après la spécification et l’échantillon validé : dimensions, velours, couleur, finitions.</span></div>
    <div class="pstep"><span class="pn">06</span><span class="pt">Livrer</span><span class="pd">Emballage, documents d’exportation et fret coordonnés avec nos partenaires logistiques.</span></div>
  </div>`)}
${sec('Délais et conditions', 'Échantillon, délais,', 'devis.', `<div class="mats">
    <div>Minimum de commande <span>Aucun — une pièce unique est la bienvenue</span></div>
    <div>Échantillon tissé (strike-off) <span>2 à 3 semaines après validation du dessin</span></div>
    <div>Coût de l’échantillon <span>Déduit de la commande</span></div>
    <div>Délai de fabrication <span>En général 6 à 12 semaines après validation de l’échantillon</span></div>
    <div>Devis <span>En USD ou en EUR, en général départ usine (EXW)</span></div>
    <div>Expédition <span>FOB ou DDP chiffrés séparément, sur demande · tapis expédiés roulés</span></div>
  </div>
  <p class="proc-note" style="color:rgba(247,243,235,.62)">Le délai peut aller jusqu’à six mois selon la pièce : le noué main est la technique la plus longue, le tufté main est plus rapide. La taille de l’échantillon dépend du dessin. Les conditions de paiement figurent dans le devis, et le chiffrage se précise à mesure que la technique, les matières, les dimensions et l’échantillonnage sont définis.</p>`, { dark:true })}
${sec('Contractualisation', 'Devis, contrat', 'et export.', `<div class="prose">
    <p>Artilier est le studio professionnel d’Art Avenue Pvt. Ltd., notre société de fabrication à New Delhi. Les commandes sont passées, facturées et exportées par cette entité : un seul fournisseur, un seul interlocuteur, du premier dessin à l’expédition.</p>
    <p>Pour démarrer, écrivez-nous à <a href="mailto:studio@artilier.co">studio@artilier.co</a> en joignant vos dessins, les dimensions et le calendrier du projet, ou utilisez notre <a href="../contact/" hreflang="en">formulaire de contact</a> (en anglais).</p>
  </div>`)}
<div class="backhome">
  <a href="mailto:studio@artilier.co" class="cta">Démarrer un projet <span>→</span></a>
  <div class="backhome-l"><a href="../collection/">La collection</a><a href="../bespoke/" hreflang="en">Bespoke (en anglais)</a><a href="../hospitality/" hreflang="en">Hôtellerie (en anglais)</a></div>
</div>`
});

/* ── /guides/briefing-a-bespoke-rug/ — specifier guide ─────────────────
 * Every statement restates how the studio already describes its process on
 * /bespoke/, /process/, /materials/ and the market pages, or owner-confirmed
 * working terms (10 Oct 2026). No file formats, knot counts, pile heights,
 * size limits, test results or prices are asserted. */
const G = 'guides/briefing-a-bespoke-rug/';
const UPG = '../../';
const guide = shell({
  path:G, up:UPG, crumbName:'Briefing a bespoke rug', pageType:'WebPage',
  title:'How to Brief a Bespoke Rug: Files, Sizes, Sampling | Artilier',
  desc:'A guide for interior designers and architects: what to send for a bespoke rug, how construction and yarn are chosen, how the strike-off works, and timing.',
  lb:'Guide · For designers and architects', h1:'How to brief<br>', h1it:'a bespoke rug.',
  lead:`<p class="bd">What to send, what gets decided and in what order, and how long the studio’s own stages take — written from the way our New Delhi studio runs commissions for interior designers, architects and hospitality teams. Use it as a checklist before you write to any rug maker, including us.</p>
    <div class="wp-meta"><span><b>Specifier guide</b></span><span>Files · sizes · sampling · timing</span></div>`,
  nodes:[{ '@type':'Article','@id':`${HOST}/${G}#article`,'headline':'How to brief a bespoke rug','inLanguage':'en',
    'description':'What to send for a bespoke rug, how construction and yarn are chosen, how the woven strike-off works, and how to plan the timing.',
    'author':{'@id':`${HOST}/#organization`},'publisher':{'@id':`${HOST}/#organization`},
    'mainEntityOfPage':{'@id':`${HOST}/${G}#webpage`},'datePublished':'2026-10-10','dateModified':'2026-10-10',
    'audience':{'@type':'Audience','audienceType':'Interior designers, architects and hospitality designers'} }],
  body:`
${sec('Before you write', 'Four things', 'decide a rug.', `<div class="prose">
    <p>Every bespoke rug comes down to four decisions: the <b>design</b> (what it shows and how much detail it carries), the <b>size and shape</b> (what the room and the furniture plan need), the <b>application</b> (how much traffic the room takes, and what sits on the rug) and the <b>programme</b> (the date the rug must be on site). A brief that covers all four can be costed and sampled. A brief that covers only some of them can still start — we will tell you what needs resolving before anything can be costed properly.</p>
  </div>`)}
${sec('The design', 'Send what exists,', 'at whatever stage.', list([
  '<b>A painting or artwork</b> — in any medium. Tell us the size of the original; it helps judge how the detail will scale to the finished rug',
  '<b>A drawing or CAD file</b> — vector or scanned. Mark the intended finished size and anything that must stay fixed, such as a border width or a motif that must align with a room feature',
  '<b>A reference image</b> — a starting point rather than a design to copy; say what you want to keep from it',
  '<b>A colour scheme</b> — colours are matched by hand and approved in the hand, so send the references the scheme already uses',
  '<b>A collection design</b> — any design in <a href="'+UPG+'collection/">the collection</a> can be re-scaled, re-proportioned and re-coloured to your scheme'
]) + `<p class="bd" style="margin-top:22px">A rough idea and a floor plan are enough to begin. Development — construction, yarn, colour separation and scale — is worked out with you, so the brief does not need to be finished artwork.</p>`, { dark:true })}
${sec('The size', 'Resolve it', 'from the plan.', `<div class="prose">
    <p>Rugs are made to order, so the size is set by the room rather than by a standard range. What is achievable still depends on the design and the construction, so very large or unusually shaped pieces are confirmed with you before sampling. The most useful thing you can send is the floor plan with the furniture layout, so proportions can be resolved before sampling. On the plan, mark:</p>
  </div>` + list([
  '<b>The rug outline you intend</b> — with dimensions in metres, centimetres or feet and inches, whichever your drawings use',
  '<b>Furniture positions</b> — which pieces sit on the rug and which sit off it',
  '<b>Doors, thresholds and fixed features</b> — anything the rug edge has to clear or align with',
  '<b>Several rugs?</b> — send a rug schedule: room, quantity and size for each'
]) + `<p class="bd" style="margin-top:22px">For very large rooms, any size limit for the chosen construction is confirmed before sampling.</p>`)}
${sec('The construction', 'A technical decision,', 'not a style one.', list([
  '<b>Hand-knotted</b> — knot by knot on the loom: suited to fine detail and painterly artwork, and the longest to make. <a href="'+UPG+'collection/hand-knotted/">Hand-knotted designs</a>',
  '<b>Hand-tufted</b> — carving, mixed pile heights and loop-and-cut surfaces, with a shorter lead time than hand-knotting. <a href="'+UPG+'collection/hand-tufted/">Hand-tufted designs</a>',
  '<b>Flatweave</b> — low, graphic and lighter: for geometric work, layering and rooms where a pile would sit too high. <a href="'+UPG+'collection/flatweave/">Flatweave designs</a>'
]) + `<p class="bd" style="margin-top:22px">You can state a preference or leave it to our recommendation. Either way, the construction is recommended from the artwork, the detail it carries, the traffic the room will take and the budget — and proved in sampling before production.</p>`, { dark:true })}
${sec('The yarn', 'Specified against', 'the room.', `<div class="prose">
    <p>The yarns we work with are New Zealand wool, hand-spun wool, wool-silk blends, bamboo silk, cotton (for warps and flatweaves), allo and hemp, and jute — with blends developed to the design where no single yarn does the job. Yarn, spin and dye lot are approved in the hand against your scheme before a loom is set.</p>
    <p>So tell us where each rug sits and what it will take — a bedroom, a dining room under chairs, a hotel lobby. Yarn is specified against the construction and the traffic, and where a material is unsuitable for the room we say so. If the project sets performance, cleaning or documentation requirements, put them in the brief: we confirm what can be met, and what can be documented, before costing. More on <a href="${UPG}materials/">rug materials</a>.</p>
  </div>`)}
${sec('Sampling', 'Approve it in the hand', 'before the loom.', list([
  '<b>Yarn samples</b> — approved in the hand against your scheme',
  '<b>Colour trials</b> — against your scheme',
  '<b>A woven strike-off</b> — ready 2–3 weeks after the design or sketch is approved. Its size depends on the design, and its cost is credited against the order',
  '<b>Then production</b> — the full rug is set on the loom only once the strike-off is approved, and every finished rug is checked against the approved strike-off before dispatch'
]) + `<p class="bd" style="margin-top:22px">On projects with a mock-up room, give us the mock-up date and the rug types it needs; sampling is scheduled back from it.</p>`, { dark:true })}
${sec('Timing and terms', 'Plan back from', 'the site date.', list([
  '<b>Strike-off</b> — 2–3 weeks after the design or sketch is approved',
  '<b>Production</b> — usually 6–12 weeks from strike-off approval, up to six months in some cases; hand-knotting takes longest, hand-tufting is shorter',
  '<b>Minimum order</b> — none; a single rug is welcome',
  '<b>Quotes</b> — in USD or EUR, usually ex-works; FOB or DDP quoted separately on request',
  '<b>Shipping</b> — rugs usually travel rolled; payment terms are set out in the quote'
]) + `<p class="bd" style="margin-top:22px">To plan a programme, add together the time to approve the design, 2–3 weeks for the strike-off, your approval of it, production, and freight to site. We confirm the timeline for each project and tell you about changes as they arise. Orders are contracted, invoiced and exported through one entity, Art Avenue Pvt. Ltd., of which Artilier is the trade studio.</p>`)}
${sec('Checklist', 'A brief', 'we can cost.', list([
  'Design: artwork, CAD file, reference or collection design — with the size of the original',
  'Size and shape: outline on the floor plan, units stated, furniture marked',
  'Construction: a preference, or “recommend one”',
  'Application: room type and traffic, plus any performance or documentation requirements',
  'Colour: the scheme’s references',
  'Programme: the date the rug must be on site, any mock-up date, delivery city',
  'Quantity: one rug, or a schedule of several'
]), { dark:true })}
${sec('Questions', 'Asked before', 'the first brief.', qa([
  ['Can we start from a rough sketch?', 'Yes. A rough idea and a floor plan are enough to begin; construction, yarn, colour separation and scale are developed with you, and we tell you what needs resolving before costing.'],
  ['Do you work with private clients?', `Not directly. Artilier works trade only — with interior designers, architects, design practices and galleries, and with collectors through the galleries that represent them. See <a href="${UPG}trade/">trade</a>.`],
  ['Can one rug be adapted from the collection rather than developed from scratch?', 'Yes. Collection designs can be re-scaled, re-proportioned and re-coloured to your scheme, and made to the size the room needs within what the design and construction allow.'],
  ['What happens if the strike-off is not right?', 'The full rug is not set on the loom until the strike-off is approved. If it is not right, tell us what needs to change; what a revision involves is agreed with you before anything further is made.']]))}
${ctaBlock(UPG, 'contact/?type=bespoke', 'Send a brief', [['bespoke/','Bespoke development'],['process/','The process'],['hospitality/','Hospitality'],['trade/','Trade']])}`
});

/* ── 404 ───────────────────────────────────────────────────────────── */
const notFound = head({ title:'Page not found | Artilier', desc:'This page does not exist. Find the collection, bespoke rug development or start a project with Artilier.',
  canonical:`${HOST}/404.html`, up:'/', robots:'noindex,follow', schema:{ '@context':'https://schema.org', ...ORG } }).replace(/\n<link rel="canonical"[^>]*>/, '')
  + nav('/') + `
<main id="main">
<section class="nf">
  <span class="lb">404 · Page not found</span>
  <h1 class="d1">This page is<br><span class="it">not here.</span></h1>
  <p class="bd" style="max-width:52ch">The address may have changed. Everything Artilier makes is still a click away.</p>
  <div class="links"><a href="/collection/">The collection</a><a href="/bespoke/">Bespoke development</a><a href="/hospitality/">Hospitality</a><a href="/trade/">Trade</a><a href="/contact/">Start a project</a></div>
</section>
</main>` + footer('/');


/* ── embroidery market pages ───────────────────────────────────────── */
/* Owner-confirmed (11 Oct 2026): zardozi, zari, aari, raffia, hand embroidery,
   appliqué; wall panels, framed art, headboards, upholstery panels, cushions,
   drapery; from the designer's artwork; strike-off 2–3 weeks, credited; no
   minimum; production time per piece in the quote; designers, architects and
   galleries, and collectors through galleries. Time-zone sentences restate the
   rug market pages. No client, project or delivery is claimed. */
const embGal = (ids, up) => `
<section class="sec gal-sec"><div class="gal">${ids.map(id => `<figure class="q">${slotImg(id, 'Embroidery', up)}<figcaption data-mf="${id}"></figcaption></figure>`).join('')}</div></section>`;
const embMarkets = self => [['embroidery/uae/','UAE & Gulf'],['embroidery/saudi-arabia/','Saudi Arabia'],['embroidery/uk/','United Kingdom'],['embroidery/us/','United States'],['fr/broderie/','France (en français)']].filter(([h]) => !h.includes(self));
const embCommon = {
  min: ['Is there a minimum order?', 'No fixed minimum order quantity. Each project is assessed according to its design, technical requirements and production specifications.'],
  time: ['How long does it take?', 'For embroidered wall panels and upholstered headboards, production typically takes 3–4 months, depending on the design, specifications and project requirements; more complex projects may require up to 6 months. Fabric by the metre has its own lead time — see <a href="../../embroidery/fabrics/">embroidered fabric</a>. Where a strike-off is part of the project, it typically takes 2–3 weeks once the design is approved, and its cost is credited against the order. We confirm a delivery date only after reviewing the specification.'],
  install: ['Do you install the panels?', 'No. We make and supply embroidered wall panels; installation is carried out by your appointed installer or contractor.'],
  who: ['Who do you work with?', 'Interior designers, architects and design practices, and galleries — including collectors through the galleries that represent them. We do not sell retail.'],
  /* OWNER DECISION M8 (Stage 8/9): 'FOB or DDP on request' is existing owner-confirmed wording
     (10 Oct). Whether it should stay for Gulf embroidery (freight policy, Hormuz/Red Sea risk)
     is open — do not replace it with invented terms. */
  contract: ['Who contracts and invoices?', 'Art Avenue Pvt. Ltd., our manufacturing company in New Delhi. Artilier is its trade studio; orders are contracted, invoiced and exported through that entity, usually quoted ex-works in USD or EUR, with FOB or DDP on request.']
};
const embMarket = m => shell({
  path:`embroidery/${m.slug}/`, up:UP2, crumbName:m.crumb,
  title:m.title, desc:m.desc, lb:m.lb, h1:m.h1, h1it:m.h1it,
  lead:`<p class="bd">${m.lead}</p>
    <div class="wp-meta">${m.meta.map((x, i) => i ? `<span>${x}</span>` : `<span><b>${x}</b></span>`).join('')}</div>`,
  nodes:[ service(`embroidery/${m.slug}/`, m.serviceName, 'Custom hand embroidery for interiors', m.serviceDesc,
    'Interior designers, architects, design practices and galleries', m.area) ],
  body: m.body + `
${ctaBlock(UP2, 'contact/?type=embroidery', m.cta, [[m.rugs, m.rugsLabel], ['embroidery/','Embroidery'], ...embMarkets(m.slug)])}`
});

const embUae = embMarket({
  slug:'uae', crumb:'UAE & Gulf',
  title:'Bespoke Embroidery & Wall Panels for Dubai and the UAE | Artilier',
  desc:'Hand-embroidered wallcoverings, wall panels and headboards for Dubai, Abu Dhabi and the Gulf — zardozi, zari, aari, raffia. Trade only.',
  lb:'Embroidery · UAE & Gulf', h1:'Hand embroidery for<br>', h1it:'Dubai and the Gulf.',
  lead:'For interior designers, architects and galleries in Dubai, Abu Dhabi and across the Gulf: embroidered wall panels, framed pieces, headboards and upholstery panels, developed from your scheme or artwork in our New Delhi studio, with a strike-off approved in the hand where the project requires one.',
  meta:['UAE & Gulf projects','Zardozi · zari · aari · raffia','No fixed minimum'],
  serviceName:'Bespoke hand embroidery for UAE and Gulf interiors',
  area:[country('United Arab Emirates','AE'), country('Qatar','QA'), country('Kuwait','KW'), country('Bahrain','BH'), country('Oman','OM')],
  serviceDesc:'Hand-embroidered wall panels, framed art, headboards, upholstery panels, cushions and drapery in zardozi, zari, aari, raffia and hand embroidery, for residential, hospitality and gallery projects in the UAE and the wider Gulf.',
  rugs:'trade/uae/', rugsLabel:'Rugs for UAE projects', cta:'Start a UAE embroidery project',
  body:`
${sec('Where it is used', 'From the majlis', 'to the suite.', list([
  '<b>Majlis and reception rooms</b> — hand-embroidered wallcoverings made wall to wall, or wall panels and framed pieces sized to the wall',
  '<b>Bedrooms and suites</b> — embroidered headboard panels, cushion fronts and drapery borders',
  '<b>Furniture</b> — seat, back and side panels for upholstered pieces made by your joinery or upholstery workshop',
  '<b>Hospitality</b> — lobbies, suites and restaurants, usually briefed as a set of panels across several rooms. See <a href="'+UP2+'hospitality/">hospitality</a>',
  '<b>Galleries and collectors</b> — single works and series, through the galleries that represent them'
]))}
${sec('Techniques', 'Metal thread,', 'at the scale of the room.', `<div class="prose">
    <p>Zardozi and zari — metal thread laid and couched by hand — read from across a large room and hold up close. Aari, raffia and hand embroidery give matt, textured surfaces where metal would be too much, and techniques are combined where a design needs it. The full range is on <a href="${UP2}embroidery/">embroidery</a>.</p>
  </div>`, { dark:true })}
${embGal(['e2','e7','e5','e8'], UP2)}
${sec('Working together', 'An hour and a half', 'apart.', `<div class="prose">
    <p>New Delhi (IST, UTC+5:30) is one hour thirty minutes ahead of the UAE (GST, UTC+4), so most of a Dubai or Abu Dhabi working day overlaps with ours. Briefs from Qatar, Kuwait, Bahrain and Oman run the same way: drawings and approvals by email, and any strike-off approved in the hand before production.</p>
  </div>`)}
${sec('What to send', 'A useful', 'first brief.', list([
  '<b>The piece</b> — wall panel, framed work, headboard, upholstery panel, cushion or drapery, with sizes in centimetres',
  '<b>Design intent</b> — artwork, scheme or references, and any colours or metal tones to match',
  '<b>Ground fabric</b> — if one is already specified; otherwise we propose one in sampling',
  '<b>Mounting</b> — framed, stretched, upholstered or hung, and who fits it on site',
  '<b>Programme</b> — emirate or country, and the date the piece is needed'
]), { dark:true })}
${sec('Questions', 'From Gulf', 'practices.', qa([embCommon.min, embCommon.time, embCommon.install, embCommon.who,
  ['Can embroidery be matched to rugs in the same room?', `Yes. Rugs and embroidery are developed in the same studio, so colour and motif can carry across both. See <a href="${UP2}trade/uae/">rugs for UAE projects</a>.`],
  embCommon.contract]))}`
});

const embKsa = embMarket({
  slug:'saudi-arabia', crumb:'Saudi Arabia',
  title:'Hand Embroidery & Wall Panels for Saudi Projects | Artilier',
  desc:'Hand-embroidered wallcoverings, wall panels and headboards for Riyadh, Jeddah and AlUla — zardozi, zari, aari, raffia. Trade only.',
  lb:'Embroidery · Saudi Arabia', h1:'Hand embroidery for<br>', h1it:'Saudi projects.',
  lead:'For interior designers, architects and galleries working in Riyadh, Jeddah, AlUla and across the Kingdom: embroidered wall panels, framed pieces, headboards and upholstery panels, made to commission from your scheme or artwork, with a strike-off approved in the hand where the project requires one.',
  meta:['Saudi projects','Residential · hospitality · cultural','No fixed minimum'],
  serviceName:'Bespoke hand embroidery for Saudi Arabia interiors', area:[country('Saudi Arabia','SA')],
  serviceDesc:'Hand-embroidered wall panels, framed art, headboards, upholstery panels, cushions and drapery in zardozi, zari, aari, raffia and hand embroidery, for residential, hospitality and cultural projects in Saudi Arabia.',
  rugs:'trade/saudi-arabia/', rugsLabel:'Rugs for Saudi projects', cta:'Start a Saudi embroidery project',
  body:`
${sec('Where it is used', 'Panels, headboards,', 'whole schemes.', list([
  '<b>Residences</b> — wall-to-wall embroidered wallcoverings, majlis wall panels, framed works, headboards and soft furnishings',
  '<b>Hospitality</b> — hotels and resorts, including destination projects, usually briefed as a schedule of panel types across many rooms',
  '<b>Cultural and gallery projects</b> — single works and series, through the galleries and curators who commission them',
  '<b>Furniture</b> — embroidered panels supplied to your upholsterer or joinery workshop'
]))}
${embGal(['e2','e8','e3','e6'], UP2)}
${sec('Long programmes', 'Schedule the strike-off', 'early.', `<div class="prose">
    <p>Larger Saudi projects often run on long programmes with many embroidered pieces per building. Send the full schedule as early as you can: strike-offs can then be planned against your mock-up and approval dates rather than squeezed in at the end.</p>
  </div>`, { dark:true })}
${sec('Working together', 'Two and a half', 'hours apart.', `<div class="prose">
    <p>Saudi Arabia (AST, UTC+3) is two hours thirty minutes behind New Delhi (IST, UTC+5:30), and the Saudi working week runs Sunday to Thursday. Briefs, drawings and approvals move by email; any strike-off is approved in the hand before production.</p>
  </div>`)}
${sec('Questions', 'From Saudi', 'practices.', qa([embCommon.min, embCommon.time, embCommon.install, embCommon.who,
  ['Can embroidery be matched to rugs on the same project?', `Yes. Both are developed in our studio, so a scheme can carry across rugs and embroidered panels. See <a href="${UP2}trade/saudi-arabia/">rugs for Saudi projects</a>.`],
  embCommon.contract]))}`
});

const embUk = embMarket({
  slug:'uk', crumb:'United Kingdom',
  title:'Bespoke Hand Embroidery for London Interior Designers | Artilier',
  desc:'Hand-embroidered wallcoverings, wall panels, headboards and upholstery panels for London and UK interiors — zardozi, zari, aari, raffia. Trade only.',
  lb:'Embroidery · United Kingdom', h1:'Hand embroidery for<br>', h1it:'London interiors.',
  lead:'For interior designers, architects and galleries in London and across the UK: embroidered wall panels, headboards, upholstery panels, cushions and framed works, developed from your drawing in our New Delhi studio, with a strike-off approved in the hand where the project requires one.',
  meta:['London & UK','Made to commission','No fixed minimum'],
  serviceName:'Bespoke hand embroidery for UK interior designers', area:[country('United Kingdom','GB')],
  serviceDesc:'Hand-embroidered wall panels, framed art, headboards, upholstery panels, cushions and drapery in zardozi, zari, aari, raffia and hand embroidery, for residential, hospitality and gallery projects in London and the UK.',
  rugs:'trade/uk/', rugsLabel:'Rugs for UK projects', cta:'Start a UK embroidery project',
  body:`
${sec('Where it is used', 'Made for the drawing,', 'not the catalogue.', list([
  '<b>Residential</b> — hand-embroidered wallcoverings for dining rooms and halls, embroidered headboards, cushion fronts and curtain borders, each made to the room',
  '<b>Upholstery panels</b> — embroidered seat, back and side panels supplied to your upholsterer',
  '<b>Framed and stretched works</b> — single pieces or series for a wall or a stair',
  '<b>Galleries and collectors</b> — commissioned works through the galleries that represent them'
]))}
${embGal(['e7','e8','e2','e3'], UP2)}
${sec('From your artwork', 'Your drawing,', 'in thread.', `<div class="prose">
    <p>Send the drawing, painting or reference with the finished size. We resolve technique, stitch density, thread and ground fabric with you — zardozi, zari, aari, raffia or hand embroidery, alone or combined — and, where the project calls for one, prove it in a strike-off you approve in the hand. More on <a href="${UP2}embroidery/">how embroidery is commissioned</a>.</p>
  </div>`, { dark:true })}
${sec('Working together', 'Four and a half', 'hours ahead.', `<div class="prose">
    <p>New Delhi is four hours thirty minutes ahead of London in summer (BST) and five hours thirty minutes in winter (GMT), so a London morning overlaps our afternoon. Briefs and approvals move by email; strike-offs are approved in the hand.</p>
  </div>`)}
${sec('Questions', 'From UK', 'practices.', qa([embCommon.min, embCommon.time, embCommon.install, embCommon.who,
  ['Can you embroider on a fabric we have specified?', 'Tell us the fabric in the brief. We confirm in sampling whether it will take the technique and density the design needs, and propose an alternative if it will not.'],
  embCommon.contract]))}`
});

const embUs = embMarket({
  slug:'us', crumb:'United States',
  title:'Hand Embroidery for New York Interior Designers | Artilier',
  desc:'Hand-embroidered wallcoverings, wall panels, headboards and upholstery for New York and US interiors — zardozi, zari, aari, raffia. Trade only.',
  lb:'Embroidery · United States', h1:'Hand embroidery for<br>', h1it:'New York and the US.',
  lead:'For interior designers, architects and galleries in New York and across the United States: embroidered wall panels, headboards, upholstery panels and framed works, developed from your drawing in our New Delhi studio, with a strike-off approved in the hand where the project requires one.',
  meta:['New York & US','Made to commission','No fixed minimum'],
  serviceName:'Bespoke hand embroidery for US interior designers', area:[country('United States','US')],
  serviceDesc:'Hand-embroidered wall panels, framed art, headboards, upholstery panels, cushions and drapery in zardozi, zari, aari, raffia and hand embroidery, for residential, hospitality and gallery projects in New York and the United States.',
  rugs:'trade/us/', rugsLabel:'Rugs for US projects', cta:'Start a US embroidery project',
  body:`
${sec('Where it is used', 'Apartments, houses,', 'galleries.', list([
  '<b>Apartments and townhouses</b> — hand-embroidered wallcoverings made wall to wall, wall panels, headboards and cushion fronts sized to the room',
  '<b>Houses</b> — larger runs of panels for living rooms, bedrooms and stairs',
  '<b>Upholstery panels</b> — embroidered panels supplied to your workroom',
  '<b>Galleries and collectors</b> — single works and series, through the galleries that represent them'
]))}
${embGal(['e8','e2','e7','e6'], UP2)}
${sec('Techniques', 'Matt or metal,', 'flat or raised.', `<div class="prose">
    <p>Zardozi and zari for couched metal thread and raised relief; aari for chain-stitch line and dense fields; raffia and appliqué for heavy, graphic texture; hand embroidery in silk, cotton or wool for shading and fine detail. See <a href="${UP2}embroidery/">embroidery</a> for the full range.</p>
  </div>`, { dark:true })}
${sec('Working together', 'A brief at the end of your day,', 'read at the start of ours.', `<div class="prose">
    <p>New Delhi is nine hours thirty minutes ahead of New York during daylight saving time (ten hours thirty in winter). Work moves by email, and sizes can be sent in inches or centimetres, whichever your drawings use. Where there is a strike-off, it is approved in the hand before production.</p>
  </div>`)}
${sec('Questions', 'From US', 'practices.', qa([embCommon.min, embCommon.time, embCommon.install, embCommon.who,
  ['Can embroidery be matched to rugs in the same room?', `Yes. Both are developed in our studio, so colour and motif can carry across. See <a href="${UP2}trade/us/">rugs for US projects</a>.`],
  embCommon.contract]))}`
});

const embFr = shell({
  path:'fr/broderie/', up:UP2, lang:'fr', locale:'fr_FR', crumbName:'Broderie',
  title:'Broderie main sur mesure pour architectes d’intérieur | Artilier',
  desc:'Panneaux muraux brodés, têtes de lit, panneaux d’ameublement et œuvres encadrées — zardozi, zari, aari, raphia. Sur mesure, échantillon d’abord.',
  lb:'Broderie · Paris & France', h1:'La broderie main,<br>', h1it:'sur mesure.',
  lead:`<p class="bd">Pour les architectes d’intérieur, les architectes et les galeries à Paris et en France : panneaux muraux brodés, œuvres encadrées, têtes de lit, panneaux d’ameublement, coussins et rideaux, développés d’après votre dessin dans notre studio de New Delhi et validés sur échantillon avant production.</p>
    <div class="wp-meta"><span><b>Paris & France</b></span><span>Sur commande</span><span>Échantillon d’abord</span></div>`,
  nodes:[ service('fr/broderie/', 'Broderie main sur mesure pour architectes d’intérieur', 'Broderie main sur mesure pour l’intérieur',
    'Panneaux muraux brodés, œuvres encadrées, têtes de lit, panneaux d’ameublement, coussins et rideaux en zardozi, zari, aari, raphia et broderie main, pour projets résidentiels, hôteliers et galeries en France.',
    'Architectes d’intérieur, architectes, agences de design et galeries', [country('France','FR')]) ],
  body:`
${sec('Techniques', 'Le point que le dessin', 'demande.', list([
  '<b>Zardozi</b> — fils, cannetilles et paillettes métalliques couchés à la main, en relief',
  '<b>Zari</b> — fil métallique fin travaillé à plat, pour le trait et le remplissage',
  '<b>Aari</b> — point de chaînette au crochet sur métier, et sur machines guidées à la main pour les grands aplats',
  '<b>Raphia</b> — raphia et cordons enroulés, couchés et cousus pour des reliefs graphiques',
  '<b>Broderie main</b> — passé plat, passé empiétant, couchure et points noués, en soie, coton ou laine',
  '<b>Appliqué</b> — tissus découpés et cousus, associés à des boucles en relief'
]))}
${embGal(['e2','e7','e8','e3'], UP2)}
${sec('Applications', 'Pour le mur, le lit', 'et la fenêtre.', list([
  '<b>Revêtements muraux brodés</b> — d’un mur à l’autre, panneaux posés bord à bord selon vos élévations',
  '<b>Panneaux muraux</b> — à l’unité ou en série, aux dimensions du mur',
  '<b>Œuvres encadrées</b> — pièces uniques ou séries, y compris pour les galeries et leurs collectionneurs',
  '<b>Têtes de lit et panneaux d’ameublement</b> — fournis à votre tapissier',
  '<b>Coussins et rideaux</b> — devants de coussins, bordures et bords d’attaque brodés'
]), { dark:true })}
${sec('Travailler ensemble', 'Votre dessin,', 'en fil.', `<div class="prose">
    <p>Envoyez le dessin, l’œuvre ou la référence avec les dimensions finies. Nous définissons avec vous la technique, la densité, le fil et le tissu de fond, puis nous les validons sur un échantillon brodé, réalisé en 2 à 3 semaines après validation du dessin et déduit de la commande. Pas de minimum de commande ; le délai de production est confirmé pièce par pièce dans le devis.</p>
    <p>New Delhi a trois heures trente d’avance sur Paris en été et quatre heures trente en hiver : les échanges se font par e-mail, les échantillons sont validés en main. Écrivez-nous à <a href="mailto:studio@artilier.co">studio@artilier.co</a>.</p>
  </div>`)}
<div class="backhome">
  <a href="${UP2}contact/?type=embroidery" class="cta" hreflang="en">Démarrer un projet <span>→</span></a>
  <div class="backhome-l"><a href="${UP2}fr/">Tapis sur mesure</a><a href="${UP2}embroidery/" hreflang="en">Embroidery (en anglais)</a></div>
</div>`
});

/* ── write ─────────────────────────────────────────────────────────── */
const built = { 'privacy/index.html':privacy, 'contact/index.html':contact, 'about/index.html':about, 'projects/index.html':projects, 'hospitality/index.html':hospitality,
  'trade/uae/index.html':uae, 'trade/saudi-arabia/index.html':ksa, 'trade/uk/index.html':uk, 'trade/us/index.html':us, 'fr/index.html':fr, 'embroidery/uae/index.html':embUae, 'embroidery/saudi-arabia/index.html':embKsa, 'embroidery/uk/index.html':embUk, 'embroidery/us/index.html':embUs, 'fr/broderie/index.html':embFr, [G + 'index.html']:guide, '404.html':notFound };
for (const p of projectsData) built[`projects/${p.slug}/index.html`] = projectPage(p);
for (const [f, html] of Object.entries(built)) write(f, html);
console.log(`built ${Object.keys(built).length} phase-3 pages`);

/* ── shell sync for hand-maintained pages ──────────────────────────── */
const syncShell = (file, up, { ctaLabel } = {}) => {
  let s = rd(file);
  const navRe = /<nav id="nav"[\s\S]*?<\/nav>\s*<div class="mnav" id="mnav" hidden>[\s\S]*?<\/div>/;
  if (!navRe.test(s)) throw new Error('nav block not found in ' + file);
  s = s.replace(navRe, nav(up).trim());
  const foot = footer(up);
  const footBlock = foot.slice(foot.indexOf('<footer>'), foot.indexOf('</footer>') + 9);
  s = s.replace(/<footer>[\s\S]*?<\/footer>/, footBlock);
  s = s.replace(/<a class="mcta" id="mcta" href="[^"]*">([^<]*)/, (m, label) => `<a class="mcta" id="mcta" href="${up}contact/">${ctaLabel || label}`);
  s = s.split(`${up}index.html#brief`).join(`${up}contact/`).split(`${up}index.html#about`).join(`${up}about/`).split(`href="${up}index.html"`).join(`href="${up}"`);
  s = s.replace(/manifest\.json\?v=[0-9a-f]+/g, `manifest.json?v=${MV}`);
  s = s.replace(/slots\.js\?v=4/g, 'slots.js?v=5').replace(/pages\.css\?v=[345]/g, 'pages.css?v=6');
  if (!s.includes('pages.css')) s = s.replace(/(<link rel="stylesheet" href="[^"]*collection-tweaks\.css\?v=2">)/, `$1\n<link rel="stylesheet" href="${up}assets/css/pages.css?v=3">`);
  if (!s.includes('analytics.js')) s = s.replace('</head>', `<script defer src="${up}assets/js/analytics.js?v=5"></script>\n</head>`);
  /* one Organization entity everywhere: replace the inline copy with the shared one */
  s = s.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/, (m, json) => {
    const data = JSON.parse(json);
    if (Array.isArray(data['@graph'])) data['@graph'] = data['@graph'].map(n => n['@type'] === 'Organization' ? ORG : n);
    return `<script type="application/ld+json">${JSON.stringify(data)}</script>`;
  });
  wr(file, s);
};
syncShell('collaborations/index.html', '../', { ctaLabel:'Start a collaboration ' });

/* collection hub: shell + full graph instead of a lone BreadcrumbList */
{
  syncShell('collection/index.html', '../');
  let s = rd('collection/index.html');
  const url = `${HOST}/collection/`;
  const items = indexable.slice().sort(by);
  const hub = { '@context':'https://schema.org','@graph':[ORG, WEBSITE,
    { '@type':'CollectionPage','@id':`${url}#collection`,'url':url,'name':'The collection — hand-knotted, hand-tufted and flatweave rug designs',
      'isPartOf':{'@id':`${HOST}/#website`},'about':{'@id':`${HOST}/#organization`},'breadcrumb':{'@id':`${url}#breadcrumb`},'inLanguage':'en',
      'hasPart':CATS.map(c => ({ '@id':`${HOST}/collection/${c.slug}/#collection` })),
      'mainEntity':{ '@type':'ItemList','numberOfItems':items.length,'itemListElement':items.map((d, i) => ({ '@type':'ListItem','position':i + 1,'name':d.name,'url':`${HOST}/collection/${d.slug}/` })) } },
    { '@type':'BreadcrumbList','@id':`${url}#breadcrumb`,'itemListElement':[
      { '@type':'ListItem','position':1,'name':'Artilier','item':`${HOST}/` },
      { '@type':'ListItem','position':2,'name':'The collection','item':url } ] } ] };
  s = s.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, `<script type="application/ld+json">${JSON.stringify(hub)}</script>`);
  s = s.replace(/<title>[^<]*<\/title>/, '<title>Rug Collection: Hand-Knotted, Hand-Tufted &amp; Flatweave | Artilier</title>');
  s = s.replace(/<meta property="og:title" content="[^"]*">/, '<meta property="og:title" content="The collection — Artilier rug designs">');
  wr('collection/index.html', s);
}
console.log('synced shell: collaborations, collection hub');

/* ── sitemap: canonical, indexable, 200-status URLs only ───────────── */
/* No <lastmod>: every page is rewritten on each build (shared footer), so a
   build date would claim changes that did not happen. <priority> is ignored
   by Google and was dropped too. */

const urls = [
  ['', '1.0'], ['collection/', '0.9'], ...CATS.map(c => [`collection/${c.slug}/`, '0.8']),
  ['bespoke/', '0.9'], ['hospitality/', '0.9'], ['trade/', '0.8'], ['collaborations/', '0.8'], ['contact/', '0.8'], ['about/', '0.7'],
  ['trade/uae/', '0.8'], ['trade/saudi-arabia/', '0.8'], ['trade/uk/', '0.7'], ['trade/us/', '0.7'], ['fr/', '0.8'],
  ['materials/', '0.7'], ['process/', '0.7'], ['craft/', '0.7'], ['embroidery/', '0.9'], ['embroidery/headboards/', '0.8'], ['embroidery/fabrics/', '0.8'], ['embroidery/uae/', '0.8'], ['embroidery/saudi-arabia/', '0.8'], ['embroidery/uk/', '0.8'], ['embroidery/us/', '0.8'], ['fr/broderie/', '0.8'], [G, '0.7'],
  ...(indexProjects ? [['projects/', '0.8']] : []), ...projectsData.map(p => [`projects/${p.slug}/`, '0.7']),
  ...indexable.slice().sort(by).map(d => [`collection/${d.slug}/`, '0.6'])
];
for (const [u] of urls) {           // every listed URL must exist and be indexable
  const f = join(ROOT, u, 'index.html');
  if (!existsSync(f)) throw new Error('sitemap URL has no file: ' + u);
  if (/<meta name="robots" content="noindex/.test(readFileSync(f, 'utf8'))) throw new Error('noindex page in sitemap: ' + u);
}
wr('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(([u, p]) => `  <url><loc>${HOST}/${u}</loc></url>`).join('\n')}
</urlset>
`);
console.log(`sitemap: ${urls.length} URLs`);

/* ── media manifest cache key on hand-maintained pages ───────────── */
for (const f of ['index.html', 'collection/design.html']) {
  wr(f, rd(f).replace(/manifest\.json\?v=[0-9a-f]+/g, `manifest.json?v=${MV}`));
}
/* ── homepage: shared footer + one Organization graph (nav stays anchor-based) ── */
{
  let s = rd('index.html');
  const foot = footer('');
  s = s.replace(/<footer>[\s\S]*?<\/footer>/, foot.slice(foot.indexOf('<footer>'), foot.indexOf('</footer>') + 9));
  const url = `${HOST}/`;
  const g = { '@context':'https://schema.org','@graph':[ORG, WEBSITE,
    { '@type':'WebPage','@id':`${url}#webpage`,'url':url,'name':'Bespoke Rugs & Embroidery for Interior Designers | Artilier',
      'isPartOf':{'@id':`${HOST}/#website`},'about':{'@id':`${HOST}/#organization`},'inLanguage':'en',
      'primaryImageOfPage':{ '@type':'ImageObject','url':`${HOST}/assets/media/hero-main-poster.webp` } } ] };
  s = s.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, `<script type="application/ld+json">${JSON.stringify(g)}</script>`);
  wr('index.html', s);
  console.log('synced homepage footer and schema');
}
