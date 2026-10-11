/**
 * Artilier — Phase 2, part 2: commercial pages, pre-rendered collection, sitemap.
 * Every factual statement below is taken from existing homepage copy or
 * repository data. Minimum order, strike-off timing and lead-time range are owner-confirmed (10 Oct 2026). Nothing about certifications, client
 * names, countries served or production locations is asserted.
 */
import { indexable, CATS, HOST, esc, head, nav, footer, crumb, slotImg, graph, breadcrumb, write, collections, designs, manifest, n2, by, home } from './build.mjs';

const up = '../';
const page = ({ slug, title, desc, h1, h1it, lb, lead, body, service, schemaExtra = [], ogImage }) => {
  const url = `${HOST}/${slug}/`;
  const crumbs = [
    { name:'Artilier', href:home(up), abs:`${HOST}/` },
    { name:lb, href:url, abs:url }
  ];
  const nodes = [
    { '@type':'WebPage','@id':`${url}#webpage`,'url':url,'name':title,
      'isPartOf':{'@id':`${HOST}/#website`},'breadcrumb':{'@id':`${url}#breadcrumb`},
      'about':{'@id':`${HOST}/#organization`},'inLanguage':'en' },
    { ...breadcrumb(crumbs), '@id':`${url}#breadcrumb` },
    ...(service ? [{ '@type':'Service','@id':`${url}#service`,'name':service.name,
      'description':service.description,'serviceType':service.serviceType,
      'provider':{'@id':`${HOST}/#organization`},'areaServed':'Worldwide',
      'audience':{'@type':'Audience','audienceType':'Interior designers, architects and design practices'},
      'url':url }] : []),
    ...schemaExtra
  ];
  return head({ title, desc, canonical:url, up, schema:graph(nodes), ogImage })
    + nav(up) + crumb(crumbs.map(c=>({name:c.name,href:c.href}))) + `
<main id="main">
<header class="wp-hd">
  <div>
    <span class="lb">${esc(lb)}</span>
    <h1 class="d1">${h1}${h1it?`<span class="it">${h1it}</span>`:''}</h1>
  </div>
  <div>
    ${lead}
  </div>
</header>
${body}
</main>` + footer(up);
};

const relatedBlock = (links) => `
<div class="backhome">
  <a href="${up}contact/" class="cta">Start a project <span>→</span></a>
  <div class="backhome-l">${links.map(([h,t])=>`<a href="${up}${h}">${esc(t)}</a>`).join('')}</div>
</div>`;

/* ── /bespoke/ ─────────────────────────────────────────────────────── */
const bespoke = page({
  slug:'bespoke', lb:'Bespoke rug development',
  title:'Bespoke Rugs from Your Artwork | Artilier Trade Studio',
  desc:'Custom rugs developed from your artwork, CAD file or palette: construction, yarn, colour and scale resolved in sampling before production. Trade only.',
  h1:'Your artwork.<br>Our ', h1it:'development.',
  lead:`<p class="bd">Send artwork, a painting, a CAD file, a colour scheme, a reference image or a floor plan, and we develop it into a finished rug — construction, yarn, colour, scale and finish worked out with you, then proved in a sample before production.</p>
    <div class="wp-meta"><span><b>Made to order</b></span><span>Made to size</span><span>Custom colourways</span></div>`,
  service:{ name:'Bespoke rug development', serviceType:'Custom rug design and manufacture',
    description:'Development of bespoke hand-knotted, hand-tufted and flatweave rugs from a designer’s own artwork, drawing, CAD file, reference image or colour scheme, including construction, yarn and colour development, sampling and production.' },
  body:`
<section class="sec">
  <div class="sec-hd"><div><span class="lb">How it works</span><h2 class="d2">Three stages,<br>one <span class="it">conversation.</span></h2></div>
  <p class="bd">Custom dimensions are not an add-on here — every rug is made to order. Custom colourways are developed against your scheme, and samples are available for approval before production.</p></div>
  <div class="proc">
    <div class="pstep"><span class="pn">01</span><span class="pt">Your artwork</span><span class="pd">Painting, drawing, CAD, scheme or reference. Whatever exists — including a rough idea and a floor plan.</span></div>
    <div class="pstep"><span class="pn">02</span><span class="pt">Our development</span><span class="pd">Construction, yarn, knot count, pile, colour separation and scale. Strike-offs and colour trials until it reads right.</span></div>
    <div class="pstep"><span class="pn">03</span><span class="pt">Your rug</span><span class="pd">Woven to your dimensions, checked against the approved sample, finished and packed in Delhi.</span></div>
  </div>
</section>
<section class="sec dark">
  <div class="sec-hd"><div><span class="lb">What you can send</span><h2 class="d2">Whatever stage<br>you are <span class="it">at.</span></h2></div>
  <p class="bd">If information is missing, we will tell you what needs resolving before anything can be costed properly. That conversation is part of the work, not a delay to it.</p></div>
  <div class="mats">
    <div>Your artwork or painting <span>Any medium</span></div>
    <div>A drawing or CAD file <span>Vector or scan</span></div>
    <div>A reference image <span>Starting point</span></div>
    <div>A colour scheme <span>Matched by hand</span></div>
    <div>A floor plan <span>Sizes resolved</span></div>
    <div>Rug dimensions <span>Sized to the project · confirmed before sampling</span></div>
  </div>
</section>
<section class="sec">
  <div class="sec-hd"><div><span class="lb">Construction</span><h2 class="d2">Which construction<br>a design <span class="it">wants.</span></h2></div>
  <p class="bd">Which construction a design wants is a technical decision, not a style one. We make the recommendation from the artwork, the detail it carries, the traffic it will take and the budget — and prove it in sampling before production. Existing designs in <a href="${up}collection/">the collection</a> can equally be re-scaled and re-coloured to a scheme rather than developed from scratch.</p></div>
</section>
<section class="sec dark">
  <div class="sec-hd"><div><span class="lb">Sampling and timing</span><h2 class="d2">Proved in a sample,<br>then <span class="it">made.</span></h2></div>
  <p class="bd">Development runs in a fixed order, so you always know what is being decided and when.</p></div>
  <div class="mats">
    <div>Yarn samples <span>Approved in hand</span></div>
    <div>Colour trials <span>Against your scheme</span></div>
    <div>Woven strike-off <span>Sized to the design · 2–3 weeks · credited against the order</span></div>
    <div>Initial cost range <span>Once there is enough information</span></div>
    <div>Lead time <span>Usually 6–12 weeks from strike-off approval</span></div>
    <div>Minimum order <span>None — single pieces welcome</span></div>
    <div>Progress photography <span>At agreed points</span></div>
    <div>Pricing <span>USD or EUR · usually ex-works</span></div>
  </div>
  <p class="proc-note" style="color:rgba(247,243,235,.62)">Lead times usually run 6–12 weeks from strike-off approval and can extend to six months in some cases; we confirm the timeline for each project, and costing becomes more precise as the artwork, construction, materials and sampling are resolved. Hand-made production varies with construction, yarn availability and loom capacity — hand-knotting takes longest, hand-tufting is shorter — and we tell you about changes as they arise, not after the fact. Before you write, our <a href="${up}guides/briefing-a-bespoke-rug/" style="color:inherit">guide to briefing a bespoke rug</a> sets out what to send.</p>
</section>
<section class="sec">
  <div class="sec-hd"><div><span class="lb">Start here</span><h2 class="d2">Send the artwork<br>and the <span class="it">room.</span></h2></div>
  <p class="bd">Attach what you have — artwork, CAD, a scheme or a floor plan — with rug sizes and a target date if you know them. We reply individually with how we would make it and what still needs deciding.</p></div>
  <div class="brief-a">
    <a href="${up}contact/?type=bespoke" class="cta">Brief a bespoke rug <span>→</span></a>
    <a href="mailto:studio@artilier.co" class="cta ol">studio@artilier.co</a>
  </div>
</section>
${relatedBlock([['process/','The full process'],['materials/','Material selection'],['hospitality/','Hospitality & contract'],['collection/','The collection'],['trade/','Working with us']])}`
});

/* ── /trade/ ───────────────────────────────────────────────────────── */
const trade = page({
  slug:'trade', lb:'Trade',
  title:'Trade Rugs for Interior Designers & Architects | Artilier',
  desc:'Custom rugs for designers and architects on high-end residential and villa projects. One studio from drawing to export, contracted by Art Avenue Pvt. Ltd.',
  h1:'A design-led studio,<br>working ', h1it:'trade only.',
  lead:`<p class="bd">Artilier is built around the relationship between art, material and making. We begin with rugs: developed and made for interior designers, architects and design practices working on high-end residential, villa and boutique hospitality projects.</p>
    <div class="wp-meta"><span><b>Trade only</b></span><span>Designers · architects</span><span>Made to order</span></div>`,
  service:{ name:'Trade rug programme', serviceType:'Trade rug supply and development for design practices',
    description:'Rug development, specification, sampling, production, quality control and export coordination for interior designers, architects and design practices. Every rug is made to order in the construction, material, colourway and dimensions the project needs.' },
  body:`
<section class="sec">
  <div class="sec-hd"><div><span class="lb">Where we help</span><h2 class="d2">From specification<br>to <span class="it">site.</span></h2></div>
  <p class="bd">Every rug is made to order, in the construction, material, colourway and dimensions the project needs. The pieces shown across this site are references, not stock.</p></div>
  <div class="mats">
    <div>Artwork development <span>From your drawing</span></div>
    <div>Material selection <span>To the application</span></div>
    <div>Construction &amp; specification <span>Technical</span></div>
    <div>Colour matching &amp; sampling <span>Approved in hand</span></div>
    <div>Production <span>Made to order</span></div>
    <div>Quality control &amp; finishing <span>Reviewed in Delhi</span></div>
    <div>Export coordination <span>Documentation</span></div>
  </div>
</section>
<section class="sec dark">
  <div class="sec-hd"><div><span class="lb">Contracting</span><h2 class="d2">One supplier,<br>one point of <span class="it">coordination.</span></h2></div>
  <p class="bd">Artilier is the trade studio of Art Avenue Pvt. Ltd., our manufacturing company in New Delhi. Orders are contracted, invoiced and exported through that entity — one supplier, one point of coordination, established export documentation.</p></div>
  <div class="facts">
    <div><b>Clients</b><span>Trade only — designers · architects · design studios</span></div>
    <div><b>Sectors</b><span>High-end residential · villas · boutique hospitality</span></div>
    <div><b>Studio</b><span>New Delhi, India</span></div>
    <div><b>Contracting</b><span>Invoiced &amp; exported by Art Avenue Pvt. Ltd., New Delhi</span></div>
    <div><b>Response</b><span>Every enquiry reviewed individually</span></div>
  </div>
</section>
<section class="sec">
  <div class="sec-hd"><div><span class="lb">Costing</span><h2 class="d2">What we can say,<br>and <span class="it">when.</span></h2></div>
  <p class="bd">There is no minimum order — we make single pieces as readily as multi-rug schedules. A woven strike-off takes 2–3 weeks once the design or sketch is approved, and its cost is credited against the order. Lead times usually run 6–12 weeks from strike-off approval, extending to six months in some cases. Costing follows once construction, materials, dimensions and sampling requirements are understood, and becomes more precise as the artwork is resolved. Prices are quoted in USD or EUR, usually ex-works; FOB or DDP can be quoted separately on request. Payment terms are set out in the quote, and rugs are usually shipped rolled. Hand-made production can vary with construction, yarn availability and loom capacity, and we communicate changes as they arise. See <a href="${up}process/">the process</a> for where each of those decisions is taken.</p></div>
</section>
<section class="sec dark">
  <div class="sec-hd"><div><span class="lb">Who we work with</span><h2 class="d2">Practices, not<br><span class="it">shoppers.</span></h2></div>
  <p class="bd">Interior designers, architects and design studios — and the procurement and hospitality teams who specify with them. There is no retail, no cart and no consumer pricing; every enquiry is read and answered individually.</p></div>
  <div class="mats">
    <div>Residential interiors <span>Villas · apartments · private homes</span></div>
    <div>Boutique hospitality <span><a href="${up}hospitality/" style="color:inherit">Hotels &amp; contract</a></span></div>
    <div>Artists &amp; designers <span><a href="${up}collaborations/" style="color:inherit">Collaborations</a></span></div>
    <div>One rug or a schedule <span>Single pieces to multi-room projects</span></div>
  </div>
</section>
<section class="sec">
  <div class="sec-hd"><div><span class="lb">Working internationally</span><h2 class="d2">Briefed from<br>anywhere, made in <span class="it">Delhi.</span></h2></div>
  <p class="bd">We work with trade clients in Europe, the Gulf and the United States. Market notes cover time zones, terminology and what to include in a brief: <a href="${up}trade/uae/">UAE</a> · <a href="${up}trade/saudi-arabia/">Saudi Arabia</a> · <a href="${up}trade/uk/">United Kingdom</a> · <a href="${up}trade/us/">United States</a> · <a href="${up}fr/" hreflang="fr" lang="fr">en français</a>.</p></div>
</section>
${relatedBlock([['bespoke/','Bespoke development'],['hospitality/','Hospitality & contract'],['process/','The process'],['materials/','Materials'],['collection/','The collection']])}`
});

/* ── /materials/ ───────────────────────────────────────────────────── */
const materials = page({
  slug:'materials', lb:'Rug materials',
  title:'Rug materials — wool, silk blends, cotton, jute & hemp | Artilier',
  desc:'New Zealand wool, wool-silk, bamboo silk, cotton, jute and hemp: how Artilier selects yarn for each rug design and application, approved before weaving.',
  h1:'Material selection is<br>part of the ', h1it:'design.',
  lead:`<p class="bd">Yarn decides how a rug reads long before the colour does — how light moves across the pile, how the surface wears, how sharply a detail holds. We select and blend for the design and the application, not from a standard menu.</p>
    <p class="bd" style="margin-top:16px">Yarn, spin and dye lot are approved in the hand against your scheme before a loom is set. Where a material is unsuitable for the traffic a room will take, we say so.</p>`,
  service:{ name:'Material selection and development', serviceType:'Rug material specification',
    description:'Selection and blending of rug yarns — including New Zealand wool, hand-spun wool, wool-silk blends, bamboo silk, cotton, allo/hemp and jute — against the design, the scheme and the application, with yarn, spin and dye lot approved before production.' },
  body:`
<section class="sec dark">
  <div class="sec-hd"><div><span class="lb">The palette</span><h2 class="d2">Yarns we work<br><span class="it">with.</span></h2></div>
  <p class="bd">Each is chosen for what it does underfoot and in light, not for what it is called on a specification. Blends are developed to the design where no single yarn does the job.</p></div>
  <div class="mats">
    <div>New Zealand wool <span>Pile · durable</span></div>
    <div>Hand-spun wool <span>Pile · character</span></div>
    <div>Wool-silk blend <span>Pile · sheen</span></div>
    <div>Bamboo silk <span>Pile · lustre</span></div>
    <div>Cotton <span>Warp &amp; flatweave</span></div>
    <div>Allo / hemp <span>Texture · natural</span></div>
    <div>Jute <span>Flatweave · natural</span></div>
    <div>Developed blends <span>To the design</span></div>
  </div>
</section>
<section class="sec">
  <div class="sec-hd"><div><span class="lb">Material and construction</span><h2 class="d2">The two decisions<br>are <span class="it">one.</span></h2></div>
  <p class="bd">A yarn behaves differently in each construction. Hand-knotting holds the finest definition and carries painterly artwork best; <a href="${up}collection/hand-tufted/">hand-tufting</a> allows carving, mixed pile heights and loop-and-cut surfaces; <a href="${up}collection/flatweave/">flatweave</a> sits low and reads graphically. Material is specified against the construction, the detail the artwork carries and the traffic the room will take — and proved in <a href="${up}process/">sampling</a> before a full rug is set on the loom.</p></div>
</section>
${relatedBlock([['collection/hand-knotted/','Hand-knotted designs'],['collection/hand-tufted/','Hand-tufted designs'],['collection/flatweave/','Flatweave designs'],['bespoke/','Bespoke development']])}`
});

/* ── /process/ ─────────────────────────────────────────────────────── */
const PROC = [
  ['01','Understand','Artwork, dimensions, colour scheme and application. We read it properly, then come back with our thoughts, our questions and what still needs resolving.'],
  ['02','Develop','Construction, yarn, knot count, pile height, colour separation and scale worked through with the weaving workshop. Where there is enough information, an initial cost range follows.'],
  ['03','Sample','Yarn samples, colour trials and a woven strike-off — approved in the hand before the full rug is set on the loom.'],
  ['04','Make','Weaving, tufting or flatweaving to your dimensions, in the workshop suited to the construction. Progress photography at agreed points.'],
  ['05','Check','Quality control against the specification and approved sample — dimensions, pile, colour, binding, backing and finishing, reviewed in Delhi.'],
  ['06','Deliver','Rolling, wrapping, export documentation and freight coordinated through our logistics partners — and we stay available through installation.']
];
const process = page({
  slug:'process', lb:'Process',
  title:'How a custom rug is made — our six-stage process | Artilier',
  desc:'How a custom rug is made in six stages, from artwork to floor: understand, develop, sample, make, check, deliver. For interior designers and architects.',
  h1:'From artwork<br>to ', h1it:'floor.',
  lead:`<p class="bd">Six stages, adapted to the rug. Some commissions move quickly; others need more development. We keep the process transparent, with approvals and progress updates at the stages that matter.</p>
    <div class="wp-meta"><span><b>Six stages</b></span><span>Approvals throughout</span><span>Reviewed in Delhi</span></div>`,
  service:{ name:'Custom rug development and production', serviceType:'Rug development, sampling, manufacture and export coordination',
    description:'A six-stage process from artwork through development, sampling, manufacture, quality control and delivery, with approvals at each stage.' },
  body:`
<section class="sec">
  <div class="proc">
    ${PROC.map(([n,t,d])=>`<div class="pstep"><span class="pn">${n}</span><span class="pt">${esc(t)}</span><span class="pd">${esc(d)}</span></div>`).join('\n    ')}
  </div>
</section>
<section class="sec dark">
  <div class="sec-hd"><div><span class="lb">Costing and timing</span><h2 class="d2">Precise when<br>it can <span class="it">be.</span></h2></div>
  <p class="bd">A woven strike-off takes 2–3 weeks once the design or sketch is approved, and its cost is credited against the order. Lead times usually run 6–12 weeks from strike-off approval and can extend to six months in some cases; we confirm the timeline for each project. There is no minimum order. Costing becomes more precise as the artwork, construction, materials and sampling requirements are understood. Hand-made production can vary with construction, yarn availability and loom capacity — we communicate changes as they arise rather than after the fact.</p></div>
</section>
<section class="sec">
  <div class="sec-hd"><div><span class="lb">Where the work sits</span><h2 class="d2">Studio in Delhi,<br>looms across <span class="it">India.</span></h2></div>
  <p class="bd">Studio, artwork development, sampling, finishing and quality control sit in New Delhi. Weaving runs through established rug workshops across India, selected for the construction each rug needs — more on that in <a href="${up}craft/">the craft</a>.</p></div>
</section>
${relatedBlock([['bespoke/','Start from your artwork'],['materials/','Material selection'],['craft/','The craft'],['trade/','Trade']])}`
});

/* ── /craft/ ───────────────────────────────────────────────────────── */
const craft = page({
  slug:'craft', lb:'The craft',
  title:'Handmade rugs and embroidery from India — the craft | Artilier',
  desc:'Hand-knotting, hand-tufting, flatweaving and hand embroidery as Artilier practises them: developed and checked in New Delhi, made in workshops across India.',
  h1:'Made by hand,<br>and it ', h1it:'shows.',
  lead:`<p class="bd">Artilier is a design-led studio in New Delhi bringing together interior design thinking, material understanding and hands-on manufacturing experience. We work in two disciplines — rugs and embroidery — and everything we make is made by hand.</p>
    <div class="wp-meta"><span><b>New Delhi</b></span><span>Made across India</span><span>Made to order</span></div>`,
  body:`
<section class="sec">
  <div class="sec-hd"><div><span class="lb">Three constructions</span><h2 class="d2">Three constructions.<br>One <span class="it">specialism.</span></h2></div>
  <p class="bd">Which construction a design wants is a technical decision, not a style one. We make the recommendation from the artwork, the detail it carries, the traffic it will take and the budget — and prove it in sampling before production.</p></div>
  <div class="proc">
    <div class="pstep"><span class="pn">01</span><span class="pt">Hand-knotted</span><span class="pd">Knot by knot on the loom. Traditional hand-knotting for high-detail, high-density rugs: the finest definition, the longest lead time, and the construction that carries painterly artwork best. <a href="${up}collection/hand-knotted/">See the designs</a>.</span></div>
    <div class="pstep"><span class="pn">02</span><span class="pt">Hand-tufted</span><span class="pd">Tufted to the drawing. A more flexible construction for certain designs, textures and project requirements — carving, mixed pile heights and loop-and-cut surfaces, at a shorter lead time. <a href="${up}collection/hand-tufted/">See the designs</a>.</span></div>
    <div class="pstep"><span class="pn">03</span><span class="pt">Flatweave</span><span class="pd">Low profile, woven flat. Suited to specific applications and design requirements — lighter, reversible in some constructions, and a different surface underfoot. <a href="${up}collection/flatweave/">See the designs</a>.</span></div>
  </div>
</section>
<section class="sec dark">
  <div class="sec-hd"><div><span class="lb">Where it is made</span><h2 class="d2">A studio in Delhi,<br>looms across <span class="it">India.</span></h2></div>
  <p class="bd">Studio, artwork development, sampling, finishing and quality control sit in New Delhi. Weaving runs through established rug workshops across India, selected for the construction each rug needs rather than for convenience. That separation is deliberate: the workshop is chosen to suit the rug, and the specification is held and checked in one place.</p></div>
  <div class="facts">
    <div><b>Studio</b><span>New Delhi, India</span></div>
    <div><b>Weaving</b><span>Established rug workshops across India</span></div>
    <div><b>Finishing &amp; QC</b><span>Reviewed in Delhi against the approved sample</span></div>
    <div><b>People</b><span>Ankit Vijaivargia · Payal Samal</span></div>
  </div>
</section>
<section class="sec">
  <div class="sec-hd"><div><span class="lb">The second discipline</span><h2 class="d2">Embroidery,<br>worked by <span class="it">hand.</span></h2></div>
  <p class="bd">The same model applied to thread: hand embroidery for wall panels, framed art, cushions, headboards, upholstery panels and drapery, from our designs or developed from your artwork, and sampled before production. <a href="${up}embroidery/">Embroidery at Artilier</a>.</p></div>
</section>
<section class="sec">
  <div class="sec-hd"><div><span class="lb">Beyond</span><h2 class="d2">Built around making,<br>not one <span class="it">product.</span></h2></div>
  <p class="bd">Artilier is built around art, material and making rather than around a single product. Rugs and embroidery are where the studio works today; design objects follow. The constant is the model: made to order by hand, developed from Delhi, sold trade only. <a href="${up}trade/">How we work with practices</a>.</p></div>
</section>
${relatedBlock([['collection/','The collection'],['embroidery/','Embroidery'],['process/','The process'],['materials/','Materials'],['bespoke/','Bespoke development']])}`
});

/* ── /embroidery/ ──────────────────────────────────────────────────── */
/* Owner-confirmed (11 Oct 2026): all hand-embroidery techniques; applied to
   wall panels, framed art, cushions, headboards, upholstery panels and drapery;
   developed from a designer's own artwork; sampling as for rugs (strike-off
   2–3 weeks from approval, credited against the order); no minimum.
   Lead time is NOT stated as a range — confirmed per piece in the quote.
   Media slots e1–e8 render nothing until files are added to the manifest. */
const EMB_SLOTS = [
  ['e1','Embroidery — chain stitch','w'], ['e2','Embroidery — zardozi panel on the frame',''],
  ['e3','Embroidery — raffia on the frame',''], ['e4','Embroidery — cord stitching','w'],
  ['e5','Embroidery — metal thread','q'], ['e6','Embroidery — large panel','q'],
  ['e7','Embroidery — zari detail','q'], ['e8','Embroidery — finished panel','q']
];
const gallery = (slots, lb, h2, h2it, intro) => `
<section class="sec gal-sec">
  <div class="sec-hd"><div><span class="lb">${esc(lb)}</span><h2 class="d2">${h2}<span class="it">${h2it}</span></h2></div>${intro ? `
  <p class="bd">${intro}</p>` : ''}</div>
  <div class="gal">${slots.map(([id, ph, w]) => `<figure${w ? ` class="${w}"` : ''}>${slotImg(id, ph, up)}<figcaption data-mf="${esc(id)}"></figcaption></figure>`).join('')}</div>
</section>`;
const embroidery = page({
  slug:'embroidery', lb:'Embroidery',
  title:'Hand Embroidery for Interiors — Panels & Upholstery | Artilier',
  desc:'Hand embroidery for wall panels, framed art, headboards, upholstery, cushions and drapery — from our designs or your artwork, sampled first. Trade only.',
  h1:'Drawn in<br>', h1it:'thread.',
  lead:`<p class="bd">Hand embroidery for interiors: wall panels, framed art, headboards, upholstery panels, cushions and drapery. Worked from our designs or developed from your own artwork, sampled for approval, and made to the piece the room needs.</p>
    <div class="wp-meta"><span><b>Made by hand</b></span><span>From your artwork</span><span>Sampled first</span></div>`,
  service:{ name:'Bespoke hand embroidery for interiors', serviceType:'Custom hand embroidery design and manufacture',
    description:'Development and hand embroidery of wall panels, framed art, headboards, upholstery panels, cushions and drapery for interior designers, from the studio’s designs or a designer’s own artwork, with a strike-off approved before production.' },
  body:`
<section class="sec">
  <div class="sec-hd"><div><span class="lb">Techniques</span><h2 class="d2">The stitch the<br>design <span class="it">asks for.</span></h2></div>
  <p class="bd">These are the techniques our embroiderers work in most, often combined in one piece. Which a design wants is decided from the artwork, the ground fabric and where the piece will live — and proved in the strike-off. Other techniques on request.</p></div>
  <div class="proc">
    <div class="pstep"><span class="pn">01</span><span class="pt">Zardozi</span><span class="pd">Metal threads, wires and coiled purls laid and couched by hand. Raised, reflective relief for panels and framed pieces.</span></div>
    <div class="pstep"><span class="pn">02</span><span class="pt">Zari</span><span class="pd">Fine metallic thread worked flat for line, outline and fill — on its own, or with silk and zardozi for contrast between flat and raised.</span></div>
    <div class="pstep"><span class="pn">03</span><span class="pt">Aari</span><span class="pd">Chain stitch drawn with a hooked needle on the frame, and on hand-guided chain-stitch machines for larger fields and looped, chenille-like texture.</span></div>
    <div class="pstep"><span class="pn">04</span><span class="pt">Raffia</span><span class="pd">Raffia and natural cord coiled, couched and stitched onto the ground. Heavy, graphic texture for wall panels and headboards.</span></div>
    <div class="pstep"><span class="pn">05</span><span class="pt">Hand embroidery</span><span class="pd">Satin, long-and-short, couching and knot stitches in silk, cotton or wool, for shading, fine detail and large worked grounds.</span></div>
    <div class="pstep"><span class="pn">06</span><span class="pt">Appliqué and loop work</span><span class="pd">Cut fabric laid onto the ground and stitched down, combined with raised loops and couched line — sculptural, tonal surfaces for wall panels.</span></div>
  </div>
</section>
${gallery(EMB_SLOTS, 'On the frame', 'Stitch by ', 'stitch.', 'Work in progress from our embroidery tables.')}
<section class="sec">
  <div class="sec-hd"><div><span class="lb">Experience</span><h2 class="d2">Made for studios<br>we do not <span class="it">name.</span></h2></div>
  <p class="bd">Our embroiderers have produced panels and soft furnishings for international interior design studios. That work was made under confidentiality, so it is not named or published as projects here — what this page shows is the making.</p></div>
</section>
<section class="sec dark">
  <div class="sec-hd"><div><span class="lb">Where it is used</span><h2 class="d2">Made for the wall,<br>the bed and the <span class="it">window.</span></h2></div>
  <p class="bd">Tell us what the piece is and where it goes. Size, ground fabric, how it will be mounted or upholstered and how much handling it will take all shape the technique and density we recommend.</p></div>
  <div class="facts">
    <div><b>Wall panels</b><span>Single panels or runs across a wall, sized to the elevation</span></div>
    <div><b>Framed art</b><span>Embroidered pieces made to be framed or mounted</span></div>
    <div><b>Headboards</b><span>Embroidered panels for upholstered headboards</span></div>
    <div><b>Upholstery panels</b><span>Seat, back and side panels for upholstered furniture</span></div>
    <div><b>Cushions</b><span>Embroidered fronts, made to size</span></div>
    <div><b>Drapery</b><span>Embroidered curtains, leading edges and borders</span></div>
  </div>
</section>
<section class="sec">
  <div class="sec-hd"><div><span class="lb">From your artwork</span><h2 class="d2">Your drawing,<br>in <span class="it">thread.</span></h2></div>
  <p class="bd">Embroidery is commissioned the way our rugs are. Send artwork, a painting, a CAD file or a reference with the sizes; we resolve technique, thread, colour and ground fabric with you, then prove it in a strike-off before production.</p></div>
  <div class="proc">
    <div class="pstep"><span class="pn">01</span><span class="pt">Brief</span><span class="pd">The artwork or reference, the piece and its size, the fabric if one is already specified, and the date it is needed on site.</span></div>
    <div class="pstep"><span class="pn">02</span><span class="pt">Development</span><span class="pd">Technique, stitch density, thread and colour are worked out against the artwork in our New Delhi studio.</span></div>
    <div class="pstep"><span class="pn">03</span><span class="pt">Strike-off</span><span class="pd">A worked sample for approval in the hand, usually 2–3 weeks after the design is approved. Its cost is credited against the order.</span></div>
    <div class="pstep"><span class="pn">04</span><span class="pt">Production</span><span class="pd">Embroidered by hand in established workshops across India, then checked in Delhi against the approved strike-off before it leaves.</span></div>
  </div>
</section>
${(() => { const r = [
  ['Is there a minimum order?', 'No. A single cushion or panel is made as readily as a full scheme.'],
  ['How long does it take?', 'The strike-off usually takes 2–3 weeks once the design is approved. Production time depends on technique, density and area, and is confirmed for each piece in the quote.'],
  ['Can embroidery be paired with a rug?', 'Yes. Rugs and embroidery are developed in the same studio, so colour and motif can be carried across both for one room.'],
  ['Who contracts and invoices?', 'Art Avenue Pvt. Ltd., New Delhi — the same company that contracts our rugs.']
]; return `<section class="sec">
  <div class="sec-hd"><div><span class="lb">Practicalities</span><h2 class="d2">Before you<br><span class="it">brief us.</span></h2></div></div>
  <dl class="qa">${r.map(([q, a]) => `<div><dt>${q}</dt><dd>${a}</dd></div>`).join('')}</dl>
</section>`; })()}
${relatedBlock([['craft/','The craft'],['bespoke/','Bespoke development'],['collection/','The rug collection'],['projects/','Projects'],['trade/','Trade']])}`
});

const pages = { bespoke, trade, materials, process, craft, embroidery };
for (const [slug, html] of Object.entries(pages)) write(`${slug}/index.html`, html);
console.log(`built ${Object.keys(pages).length} commercial pages`);

/* ── pre-rendered collection ───────────────────────────────────────── */
/* Mirrors content.js card()/section() exactly, so the visual output is
   byte-identical in structure — only now it exists before JavaScript runs. */
const cUp = '../';
const card = (d, i, eagerRow) => {
  const link = d.detail ? `<a href="${esc(d.slug)}/">${esc(d.name)}</a>` : esc(d.name);
  return `<figure class="cgi" data-design="${esc(d.slug)}">${slotImg(d.hero, d.name + ' — full rug or in-room photograph', cUp, eagerRow && i < 3)}` +
    `<figcaption><b data-mt="${esc(d.hero)}">${link}</b><span data-mf="${esc(d.hero)}">${esc(d.label || '')}</span>` +
    `<span class="cgn">${n2(i + 1)}</span></figcaption></figure>`;
};
const live = designs.filter(d => d.published !== false && d.category === 'rugs');
const sections = collections.filter(c => c.category === 'rugs').sort(by).map((c, i) => {
  const ds = live.filter(d => d.collection === c.slug).sort(by);
  return `<section class="cgs${i % 2 ? ' alt' : ''}" id="${esc(c.slug)}" data-category="${esc(c.category)}" data-subcategory="${esc(c.slug)}">
  <div class="cgs-hd">
    <div><span class="lb">${esc(c.eyebrow || 'Collection ' + n2(i + 1))}</span><h2 class="area-t">${esc(c.title)}<span class="it">${esc(c.titleItalic)}</span></h2><p class="area-s">${esc(c.subtitle)}</p></div>
    <p class="area-t2">${esc(c.intro)}</p>
  </div>
  <div class="cg">${ds.map((d, k) => card(d, k, i === 0)).join('')}</div>
  <p class="cg-note">${esc(String(c.note || '').replace('{n}', ds.length))}</p>
</section>`;
}).join('\n');

const filtBtns = `<button data-f="all" aria-pressed="true">All designs</button>` +
  collections.filter(c=>c.category==='rugs').sort(by).map(c=>`<button data-f="${esc(c.slug)}" aria-pressed="false">${esc(c.filterLabel||c.name)}</button>`).join('') +
  `<span class="fc" id="fc" role="status" aria-live="polite"></span>`;

import { readFileSync, writeFileSync } from 'node:fs';
let ci = readFileSync('collection/index.html','utf8');
/* Idempotent: matches the empty placeholder AND an already pre-rendered
   block, so re-running the build refreshes the markup instead of silently
   doing nothing. */
ci = ci.replace(/<main id="collection-root"[\s\S]*?<\/main>/,
  `<main id="collection-root" data-category="rugs" data-prerendered="1">\n${sections}\n</main>`);
ci = ci.replace(/<div class="filt-in" id="filt-in" role="group" aria-label="Filter the collection">[\s\S]*?<\/div>/,
  `<div class="filt-in" id="filt-in" role="group" aria-label="Filter the collection">${filtBtns}</div>`);
ci = ci.replace('slots.js?v=3','slots.js?v=4').replace('content.js?v=2','content.js?v=3');
writeFileSync('collection/index.html', ci);
console.log('pre-rendered collection/index.html');

/* Sitemap generation moved to tools/build3.mjs (it must list the new pages too). */
