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
import { HOST, esc, head, nav, footer, crumb, graph, breadcrumb, write, home, ORG, WEBSITE, ROOT, indexable, CATS, by, slotImg } from './build.mjs';

const FORM_ENDPOINT = 'https://formspree.io/f/myklqvgp';   // the endpoint the live homepage form already uses
const rd = f => readFileSync(join(ROOT, f), 'utf8');
const wr = (f, s) => writeFileSync(join(ROOT, f), s);

/* ── page shell ────────────────────────────────────────────────────── */
const shell = ({ path, up, title, desc, lb, h1, h1it, lead, body, nodes = [], lang = 'en', locale = 'en_GB', robots, scripts = '', crumbName, pageType = 'WebPage' }) => {
  const url = `${HOST}/${path}`;
  const crumbs = [{ name:'Artilier', href:home(up), abs:`${HOST}/` }];
  if (path.startsWith('trade/') && path !== 'trade/') crumbs.push({ name:'Trade', href:`${up}trade/`, abs:`${HOST}/trade/` });
  crumbs.push({ name:crumbName || lb, href:url, abs:url });
  const schema = graph([
    { '@type':pageType,'@id':`${url}#webpage`,'url':url,'name':title,'description':desc,
      'isPartOf':{'@id':`${HOST}/#website`},'breadcrumb':{'@id':`${url}#breadcrumb`},
      'about':{'@id':`${HOST}/#organization`},'inLanguage':lang },
    { ...breadcrumb(crumbs), '@id':`${url}#breadcrumb` },
    ...nodes
  ]);
  return head({ title, desc, canonical:url, up, schema, robots, lang, locale, scripts })
    + nav(up) + crumb(crumbs.map(c => ({ name:c.name, href:c.href }))) + `
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
        <option>Samples</option><option>Trade terms</option><option>Not sure yet</option>
      </select>
    </div>
    <div class="f"><label for="c-cs">Construction</label>
      <select id="c-cs" name="construction">
        <option>Open to your recommendation</option><option>Hand-knotted</option><option>Hand-tufted</option><option>Flatweave</option>
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
  <p class="f-note">Trade only, no minimum order. We read every enquiry ourselves and reply individually. Lead times usually run 6–12 weeks from strike-off approval; costing follows once construction, materials, dimensions and sampling are understood. Your details are used only to reply to this enquiry.</p>
</form>`;

const contact = shell({
  path:'contact/', up:'../', pageType:'ContactPage',
  title:'Contact Artilier — Start a Rug Project | Trade Enquiries',
  desc:'Brief a bespoke rug, a collection design or a hospitality project. Trade enquiries from interior designers and architects, answered individually from New Delhi.',
  lb:'Contact · Start a project', h1:'Start a<br>', h1it:'project.',
  lead:`<p class="bd">Send artwork, a drawing, a reference or an early idea with the sizes. We review it and come back with questions, possibilities and the best way to make it.</p>
    <div class="wp-meta"><span><b>Trade only</b></span><span>Reviewed individually</span><span>New Delhi</span></div>`,
  scripts:`\n<script defer src="../assets/js/enquiry.js?v=1"></script>`,
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
        <a href="https://www.instagram.com/artilier.co/" target="_blank" rel="noopener"><b>Instagram</b>@artilier.co</a>
        <span><b>Studio</b>New Delhi, India</span>
        <span><b>Clients</b>Trade only — designers · architects · studios</span>
        <span><b>Contracting</b>Art Avenue Pvt. Ltd., New Delhi</span>
      </div>
    </div>
    ${enquiryForm()}
  </div>
</section>
${sec('Before you write', 'Questions we are', 'often asked.', qa([
  ['Do you sell to private clients?', 'No. Artilier works trade only — with interior designers, architects, design practices and the hospitality teams who specify with them.'],
  ['Can a collection design be changed?', 'Yes. Every design is a starting point: it can be re-scaled, re-proportioned and re-coloured to your scheme, and woven to any dimension.'],
  ['Can we see samples first?', 'Yes. Yarn samples, colour trials and a woven strike-off are approved in the hand before the full rug is set on the loom. The strike-off takes 2–3 weeks once the design or sketch is approved, and its cost is credited against the order.'],
  ['Is there a minimum order?', 'No. We make single pieces as readily as multi-rug schedules.'],
  ['How are prices quoted?', 'Prices are quoted in USD or EUR, usually ex-works; FOB or DDP can be quoted separately on request. Payment terms are set out in the quote, and rugs are usually shipped rolled.'],
  ['Who contracts and invoices?', 'Art Avenue Pvt. Ltd., our manufacturing company in New Delhi. Artilier is its trade studio — one supplier and one point of coordination.'],
  ['How long does it take?', 'Usually 6–12 weeks from strike-off approval, and up to six months in some cases; we confirm the timeline for each project. Hand-knotting takes longest; hand-tufting is shorter.']
]))}`
});

/* ── /about/ ───────────────────────────────────────────────────────── */
const about = shell({
  path:'about/', up:'../', pageType:'AboutPage',
  title:'About Artilier — Craft Studio for Interiors, New Delhi',
  desc:'Design-led craft studio for interiors in New Delhi, working trade only — rugs first, led by an interior designer and over a decade of custom manufacturing.',
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

/* ── /projects/ ────────────────────────────────────────────────────── */
const projectsData = JSON.parse(rd('content/projects.json')).projects.filter(p => p.published !== false);
const hasProjects = projectsData.length > 0;
const projects = shell({
  path:'projects/', up:'../', pageType:'CollectionPage',
  title:'Projects — Rugs in Residential & Hospitality Interiors | Artilier',
  desc:'Installed Artilier rugs in residential and hospitality interiors, documented with the designers who specified them. Trade only, New Delhi.',
  lb:'Projects', h1:'Rugs in their<br>', h1it:'rooms.',
  robots: hasProjects ? undefined : 'noindex,follow',
  lead:`<p class="bd">Installed work, shown with the designers who specified it — the room, the brief, the construction and what we developed for it.</p>`,
  body: hasProjects ? `
<section class="sec"><div class="cg">${projectsData.sort(by).map((p, i) => `<figure class="cgi">${p.hero ? slotImg(p.hero, p.name, '../', i < 3) : ''}<figcaption><b>${esc(p.name)}</b><span>${esc([p.category, p.location].filter(Boolean).join(' · '))}</span></figcaption>${p.description ? `<p class="bd-s">${esc(p.description)}</p>` : ''}</figure>`).join('')}</div></section>
${ctaBlock('../', 'contact/', 'Start a project', [['hospitality/','Hospitality'],['bespoke/','Bespoke development']])}` : `
<section class="sec">
  <div class="empty-note">
    <span class="lb">Being documented</span>
    <p>Artilier is a new studio. Installed projects are published here only once they are photographed and the designers involved have agreed to what is shown — nothing on this page will be staged or invented.</p>
    <p>Until then, the clearest view of our work is <a href="../collection/">the collection</a> and how we <a href="../bespoke/">develop rugs from a designer’s artwork</a>. If you would like to discuss work relevant to your project, <a href="../contact/">write to us</a>.</p>
  </div>
</section>
${ctaBlock('../', 'contact/', 'Start a project', [['collection/','The collection'],['bespoke/','Bespoke development'],['hospitality/','Hospitality']])}`
});

/* ── /hospitality/ ─────────────────────────────────────────────────── */
const hospitality = shell({
  path:'hospitality/', up:'../',
  title:'Custom Hotel Rugs & Contract Rugs for Hospitality | Artilier',
  desc:'Custom rugs for hotels and boutique hospitality: developed from the designer’s scheme, sampled for approval, made to each room’s size. Trade only, New Delhi.',
  lb:'Hospitality & contract', h1:'Rugs for<br>', h1it:'hospitality.',
  lead:`<p class="bd">For hospitality designers, architects and procurement teams: custom rugs for hotels and boutique hospitality projects — developed from your scheme in our New Delhi studio, approved in sample, and made to the dimensions of each room.</p>
    <div class="wp-meta"><span><b>Made to the schedule</b></span><span>Sampled for approval</span><span>One point of coordination</span></div>`,
  nodes:[ service('hospitality/', 'Custom rugs for hospitality projects', 'Custom rug development and manufacture for hotels and hospitality interiors',
    'Development, sampling, production, quality control and export coordination of custom hand-knotted, hand-tufted and flatweave rugs for hotels and hospitality interiors, made to each room’s dimensions and the designer’s scheme.',
    'Hospitality interior designers, architects and procurement teams') ],
  body:`
${sec('What we make for hospitality', 'Custom rugs,', 'not stock.', `<div class="mats">
    <div>Hand-knotted <span>Finest definition</span></div>
    <div>Hand-tufted <span>Carving · shorter lead time</span></div>
    <div>Flatweave <span>Low profile · graphic</span></div>
    <div>Any dimension <span>Made to each room</span></div>
    <div>Custom colourways <span>Matched to the scheme</span></div>
    <div>Multi-rug schedules <span>One project, many rooms</span></div>
    <div>No minimum <span>Single pieces welcome</span></div>
    <div>Lead time <span>Usually 6–12 weeks from strike-off approval</span></div>
  </div>`, { dark:true, intro:'Every rug is made to order in the construction, material, colourway and dimensions the project needs. Collection designs can be adapted to a scheme, or a rug developed from the designer’s own artwork.' })}
${sec('How a hospitality project runs', 'From schedule', 'to site.', `<div class="proc">
    <div class="pstep"><span class="pn">01</span><span class="pt">Understand</span><span class="pd">The rug schedule — rooms, quantities, sizes — with drawings, scheme and application. We come back with our thoughts, questions and what still needs resolving.</span></div>
    <div class="pstep"><span class="pn">02</span><span class="pt">Develop</span><span class="pd">Construction, yarn, pile and colour worked through for each rug type. Where there is enough information, an initial cost range follows.</span></div>
    <div class="pstep"><span class="pn">03</span><span class="pt">Sample</span><span class="pd">Yarn samples, colour trials and woven strike-offs, approved in the hand before production. A strike-off takes 2–3 weeks once the design is approved, and its cost is credited against the order — plan it against any mock-up room date.</span></div>
    <div class="pstep"><span class="pn">04</span><span class="pt">Make</span><span class="pd">Weaving, tufting or flatweaving to each size, in the workshop suited to the construction, with progress photography at agreed points.</span></div>
    <div class="pstep"><span class="pn">05</span><span class="pt">Check</span><span class="pd">Quality control against the specification and approved sample — dimensions, pile, colour, binding, backing and finishing — reviewed in Delhi.</span></div>
    <div class="pstep"><span class="pn">06</span><span class="pt">Deliver</span><span class="pd">Rugs are usually shipped rolled and wrapped, with export documentation and freight coordinated through our logistics partners. Prices are usually quoted ex-works in USD or EUR; FOB or DDP on request.</span></div>
  </div>`)}
${sec('Specification', 'Tell us what the', 'specification requires.', `<div class="prose">
    <p>Hotel specifications often carry requirements beyond design — fire performance, wear, cleaning or documentation. Include them in the brief. We confirm what can be met, and what can be documented, before costing rather than after, and we say plainly where a material or construction is unsuited to the traffic a room will take.</p>
  </div>`, { dark:true })}
${sec('What to send', 'A useful', 'first brief.', list([
  '<b>Rug schedule</b> — room or area, quantity and size for each rug type',
  '<b>Design intent</b> — artwork, scheme, references, or the collection designs you are considering',
  '<b>Construction preference</b> — or leave it to our recommendation',
  '<b>Specification requirements</b> — any performance, cleaning or documentation standards',
  '<b>Programme</b> — mock-up room date, target delivery date and project location'
]))}
${sec('Contracting', 'One supplier,', 'one point of coordination.', `<div class="prose"><p>Artilier is the trade studio of Art Avenue Pvt. Ltd., our manufacturing company in New Delhi. Orders are contracted, invoiced and exported through that entity, with established export documentation. Costing and lead times are given per project once construction, materials, sizes and sampling are understood.</p></div>`)}
${ctaBlock('../', 'contact/?type=hospitality', 'Send a hospitality brief', [['bespoke/','Bespoke development'],['materials/','Materials'],['process/','The process'],['trade/','Trade']])}`
});

/* ── market pages ──────────────────────────────────────────────────── */
const market = m => shell({
  path:`trade/${m.slug}/`, up:'../../', crumbName:m.crumb,
  title:m.title, desc:m.desc, lb:m.lb, h1:m.h1, h1it:m.h1it,
  lead:`<p class="bd">${m.lead}</p>
    <div class="wp-meta">${m.meta.map((x, i) => i ? `<span>${x}</span>` : `<span><b>${x}</b></span>`).join('')}</div>`,
  nodes:[ service(`trade/${m.slug}/`, m.serviceName, 'Custom rug development and manufacture for design practices',
    m.serviceDesc, 'Interior designers, architects, hospitality designers and design practices', m.area) ],
  body: m.body
});
const UP2 = '../../';
const marketLinks = self => [['trade/uae/','UAE'],['trade/saudi-arabia/','Saudi Arabia'],['trade/uk/','United Kingdom'],['trade/us/','United States']].filter(([h]) => !h.includes(self));
const common = {
  samples: ['Can we approve samples before production?', 'Yes. Yarn samples, colour trials and a woven strike-off are approved in the hand before the full rug is set on the loom; the strike-off takes 2–3 weeks once the design is approved, and its cost is credited against the order.'],
  adapt: ['Can a collection design be adapted?', `Yes. Every design in <a href="${UP2}collection/">the collection</a> can be re-scaled, re-proportioned and re-coloured to your scheme and woven to any size.`],
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
  meta:['UAE projects','Any dimension','Sampled for approval'],
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
    <p>New Delhi (IST, UTC+5:30) is one hour thirty minutes ahead of the UAE (GST, UTC+4), and the UAE working week largely runs Monday to Friday — so most of a Dubai or Abu Dhabi working day overlaps with ours. Briefs, drawings and approvals move by email; samples and strike-offs are approved in the hand before production.</p>
  </div>`)}
${sec('What to send', 'A useful', 'UAE brief.', list([
  '<b>Rug schedule</b> — room, quantity and size, in metres or centimetres',
  '<b>Design intent</b> — artwork, scheme or the collection designs you are considering',
  '<b>Application</b> — where each rug sits (majlis, bedroom, lobby…) so material and construction suit the traffic',
  '<b>Delivery</b> — emirate and city, the site contact or fit-out contractor, and the target handover date'
]), { dark:true })}
${sec('Questions', 'From UAE', 'practices.', qa([
  common.samples,
  common.pricing,
  ['Can you make a rug for a majlis or a very large room?', 'Every rug is made to order, so the size follows the room rather than a standard size. Send the floor plan: proportions are resolved with you before sampling, and any size limit for the chosen construction is confirmed at that stage.'],
  ['Carpet or rug — does the wording matter?', 'No. Brief us in the term your drawings use; we confirm the construction, size and finish in the specification.']]))}
${ctaBlock(UP2, 'contact/?type=residential', 'Start a UAE project', [...marketLinks('uae'), ['hospitality/','Hospitality']])}`
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
    <p>Saudi Arabia (AST, UTC+3) is two hours thirty minutes behind New Delhi (IST, UTC+5:30), and the Saudi working week runs Sunday to Thursday. Briefs, drawings and approvals move by email; samples and strike-offs are approved in the hand before production.</p>
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
${ctaBlock(UP2, 'contact/?type=hospitality', 'Start a Saudi project', [...marketLinks('saudi-arabia'), ['hospitality/','Hospitality']])}`
});

const uk = market({
  slug:'uk', crumb:'United Kingdom',
  title:'Bespoke Rugs for London Interior Designers | Artilier, Trade',
  desc:'Bespoke hand-knotted, hand-tufted and flatweave rugs for UK interior designers — developed from your artwork, sampled, made to any size. Trade only.',
  lb:'Trade · United Kingdom', h1:'Bespoke rugs<br>for ', h1it:'London practices.',
  lead:'For interior designers and architects in London and across the UK: bespoke rugs developed from your artwork or scheme in our New Delhi studio, proved in a strike-off, and made to any size — to the trade only.',
  meta:['To the trade','Any dimension','Strike-off approved'],
  serviceName:'Bespoke rugs for UK interior designers', area:[country('United Kingdom','GB')],
  serviceDesc:'Bespoke hand-knotted, hand-tufted and flatweave rugs for interior designers and architects in London and the UK, developed from the designer’s artwork or scheme and made to order in any dimension.',
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
  common.pricing]))}
${ctaBlock(UP2, 'contact/?type=bespoke', 'Start a UK project', [...marketLinks('uk'), ['bespoke/','Bespoke development']])}`
});

const us = market({
  slug:'us', crumb:'United States',
  title:'Custom Rugs to the Trade — New York & Texas | Artilier',
  desc:'Custom hand-knotted and hand-tufted rugs for interior designers in New York, Dallas, Houston and Austin — developed from your artwork, made to any size.',
  lb:'Trade · United States', h1:'Custom rugs<br>', h1it:'to the trade.',
  lead:'For interior designers and architects in New York, the Hamptons, Dallas, Houston and Austin: custom rugs developed from your artwork or scheme in our New Delhi studio, approved in a strike-off, and made to any size.',
  meta:['To the trade','Feet or metres','Strike-off approved'],
  serviceName:'Custom rugs for US interior designers', area:[country('United States','US')],
  serviceDesc:'Custom hand-knotted, hand-tufted and flatweave rugs for interior designers and architects in New York and Texas, developed from the designer’s artwork or scheme and made to order in any dimension.',
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
  ['Do you work with private clients?', 'No — Artilier works to the trade only, with interior designers, architects and design practices.'],
  ['Can a Hamptons rug be timed to the season?', 'Tell us the date the rug must be on site. Lead times usually run 6–12 weeks from strike-off approval and can extend to six months in some cases, so the earlier the brief, the more options remain open.'],
  common.contract,
  common.pricing]))}
${ctaBlock(UP2, 'contact/?type=residential', 'Start a US project', [...marketLinks('us'), ['collection/','The collection']])}`
});

/* ── /fr/ — French trade page ──────────────────────────────────────── */
const fr = shell({
  path:'fr/', up:'../', lang:'fr', locale:'fr_FR', crumbName:'Français',
  title:'Tapis sur mesure pour architectes d’intérieur | Artilier',
  desc:'Tapis noués main, tuftés main et tissés à plat, réalisés sur mesure d’après vos dessins pour architectes d’intérieur. Studio à New Delhi, professionnels.',
  lb:'Tapis sur mesure · Réservé aux professionnels', h1:'Votre dessin.<br>Notre ', h1it:'savoir-faire.',
  lead:`<p class="bd">Artilier est un studio de création de tapis basé à New Delhi, qui travaille exclusivement avec les architectes d’intérieur, les architectes et les agences de design. Chaque tapis est réalisé sur mesure — technique, matière, coloris et dimensions — d’après une pièce de notre collection ou d’après votre propre dessin.</p>
    <div class="wp-meta"><span><b>Professionnels uniquement</b></span><span>Toutes dimensions</span><span>Coloris sur mesure</span></div>`,
  nodes:[ service('fr/', 'Tapis sur mesure pour architectes d’intérieur', 'Conception et fabrication de tapis sur mesure',
    'Développement de tapis noués main, tuftés main et tissés à plat d’après le dessin, l’œuvre ou la palette de l’architecte d’intérieur, avec échantillonnage avant production.',
    'Architectes d’intérieur, architectes et agences de design') ],
  body:`
${sec('Le tapis sur mesure', 'Un tapis de décoration,', 'pas un tapis de sol standard.', `<div class="prose">
    <p>Nous concevons des tapis d’intérieur haut de gamme pour des projets résidentiels et d’hôtellerie : pièces uniques réalisées aux dimensions exactes de la pièce, d’après un tableau, un dessin, un fichier CAO ou une palette de couleurs. Il s’agit de tapis de décoration intérieure — non de tapis de voiture ou de paillassons.</p>
  </div>`)}
${sec('Ce que vous pouvez nous envoyer', 'Là où en est', 'votre projet.', list([
  '<b>Une œuvre ou un tableau</b> — quel que soit le support',
  '<b>Un dessin ou un fichier CAO</b> — vectoriel ou numérisé',
  '<b>Une image de référence</b> — comme point de départ',
  '<b>Une palette de couleurs</b> — reproduite à la main',
  '<b>Un plan</b> — pour définir les dimensions'
]) + `<p class="bd" style="margin-top:22px">S’il manque des informations, nous vous indiquons ce qui doit être précisé avant de pouvoir chiffrer correctement le projet.</p>`, { dark:true })}
${sec('Trois techniques', 'Le choix de la technique', 'est technique.', `<div class="proc">
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
    <div>Allo / chanvre <span>Texture · naturelle</span></div>
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
${sec('Contractualisation', 'Un seul fournisseur,', 'un seul interlocuteur.', `<div class="prose">
    <p>Artilier est le studio professionnel d’Art Avenue Pvt. Ltd., notre société de fabrication à New Delhi. Les commandes sont contractées, facturées et exportées par cette entité. Prix et délais sont donnés projet par projet, une fois la technique, les matières, les dimensions et l’échantillonnage définis.</p>
    <p>Pour démarrer, écrivez-nous à <a href="mailto:studio@artilier.co">studio@artilier.co</a> ou utilisez notre <a href="../contact/">formulaire de contact</a> (en anglais), en joignant vos dessins et les dimensions.</p>
  </div>`, { dark:true })}
<div class="backhome">
  <a href="mailto:studio@artilier.co" class="cta">Démarrer un projet <span>→</span></a>
  <div class="backhome-l"><a href="../collection/">La collection</a><a href="../bespoke/" hreflang="en">Bespoke (en anglais)</a><a href="../hospitality/" hreflang="en">Hôtellerie (en anglais)</a></div>
</div>`
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

/* ── write ─────────────────────────────────────────────────────────── */
const built = { 'contact/index.html':contact, 'about/index.html':about, 'projects/index.html':projects, 'hospitality/index.html':hospitality,
  'trade/uae/index.html':uae, 'trade/saudi-arabia/index.html':ksa, 'trade/uk/index.html':uk, 'trade/us/index.html':us, 'fr/index.html':fr, '404.html':notFound };
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
  s = s.replace(/slots\.js\?v=4/g, 'slots.js?v=5');
  if (!s.includes('pages.css')) s = s.replace(/(<link rel="stylesheet" href="[^"]*collection-tweaks\.css\?v=2">)/, `$1\n<link rel="stylesheet" href="${up}assets/css/pages.css?v=1">`);
  if (!s.includes('analytics.js')) s = s.replace('</head>', `<script defer src="${up}assets/js/analytics.js?v=1"></script>\n</head>`);
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
const today = new Date().toISOString().slice(0, 10);
const urls = [
  ['', '1.0'], ['collection/', '0.9'], ...CATS.map(c => [`collection/${c.slug}/`, '0.8']),
  ['bespoke/', '0.9'], ['hospitality/', '0.9'], ['trade/', '0.8'], ['collaborations/', '0.8'], ['contact/', '0.8'], ['about/', '0.7'],
  ['trade/uae/', '0.8'], ['trade/saudi-arabia/', '0.8'], ['trade/uk/', '0.7'], ['trade/us/', '0.7'], ['fr/', '0.8'],
  ['materials/', '0.7'], ['process/', '0.7'], ['craft/', '0.7'],
  ...(hasProjects ? [['projects/', '0.7']] : []),
  ...indexable.slice().sort(by).map(d => [`collection/${d.slug}/`, '0.6'])
];
for (const [u] of urls) {           // every listed URL must exist and be indexable
  const f = join(ROOT, u, 'index.html');
  if (!existsSync(f)) throw new Error('sitemap URL has no file: ' + u);
  if (/<meta name="robots" content="noindex/.test(readFileSync(f, 'utf8'))) throw new Error('noindex page in sitemap: ' + u);
}
wr('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(([u, p]) => `  <url><loc>${HOST}/${u}</loc><lastmod>${today}</lastmod><priority>${p}</priority></url>`).join('\n')}
</urlset>
`);
console.log(`sitemap: ${urls.length} URLs`);

/* ── homepage: shared footer + one Organization graph (nav stays anchor-based) ── */
{
  let s = rd('index.html');
  const foot = footer('');
  s = s.replace(/<footer>[\s\S]*?<\/footer>/, foot.slice(foot.indexOf('<footer>'), foot.indexOf('</footer>') + 9));
  const url = `${HOST}/`;
  const g = { '@context':'https://schema.org','@graph':[ORG, WEBSITE,
    { '@type':'WebPage','@id':`${url}#webpage`,'url':url,'name':'Bespoke Rugs for Interior Designers | Artilier, New Delhi',
      'isPartOf':{'@id':`${HOST}/#website`},'about':{'@id':`${HOST}/#organization`},'inLanguage':'en',
      'primaryImageOfPage':{ '@type':'ImageObject','url':`${HOST}/assets/media/hero-main-poster.webp` } } ] };
  s = s.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, `<script type="application/ld+json">${JSON.stringify(g)}</script>`);
  wr('index.html', s);
  console.log('synced homepage footer and schema');
}
