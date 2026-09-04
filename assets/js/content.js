/**
 * Artilier — content renderer (read-only, no framework, no build step).
 *
 * Content lives as JSON under /content/ and is the single source of truth:
 *   categories.json  → disciplines (rugs today; embroidery, straw marquetry … later)
 *   taxonomy.json    → MATERIALS & TECHNIQUES: the studio's whole vocabulary.
 *                      Terms are not categories: a CATEGORY is what a piece is,
 *                      a MATERIAL what it is made from, a TECHNIQUE how it is
 *                      made (kind: "material" | "technique" | "both"). Designs,
 *                      collections and projects reference term slugs in `terms`.
 *                      A term is shown publicly only when it is published AND
 *                      attached to published work — never as a bare list.
 *   collections.json → one published collection = one section on a collection page
 *   designs.json     → every design, keyed to a collection + technique
 *   projects.json    → installed work (empty until there is real work to show)
 *   bespoke.json     → the bespoke flow and any bespoke examples
 *
 * Media ids (hero / images / video) resolve through assets/media/manifest.json,
 * so crops, alt text and caption facts survive any content edit.
 *
 * Nothing here touches localStorage, IndexedDB or any browser-only state.
 */
(() => {
  const script = document.currentScript || document.querySelector('script[data-content]');
  const BASE = new URL((script && script.dataset.content) || 'content/', document.baseURI).href;
  const HOME = (script && script.dataset.home) || '';
  const get = f => fetch(BASE + f).then(r => (r.ok ? r.json() : Promise.reject(new Error(f))));
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const n2 = n => String(n).padStart(2, '0');
  const by = (a, b) => (a.order || 0) - (b.order || 0);
  const live = a => (a || []).filter(x => x.published !== false);
  const el = s => document.querySelector(s);

  const slot = (id, ph, cls) =>
    `<div class="ph${cls ? ' ' + cls : ''}"><media-slot id="${esc(id)}" shape="rect" placeholder="${esc(ph)}"></media-slot></div>`;

  /* ── collection page ─────────────────────────────────────────────── */

  const card = (d, i) => {
    const name = d.detail
      ? `<a href="design.html?d=${encodeURIComponent(d.slug)}">${esc(d.name)}</a>`
      : esc(d.name);
    return `<figure class="cgi" data-design="${esc(d.slug)}">${slot(d.hero, d.name + ' — full rug or in-room photograph')}` +
      `<figcaption><b data-mt="${esc(d.hero)}">${name}</b><span data-mf="${esc(d.hero)}">${esc(d.label || '')}</span>` +
      `<span class="cgn">${n2(i + 1)}</span></figcaption></figure>`;
  };

  const section = (c, ds, i) =>
    `<section class="cgs${i % 2 ? ' alt' : ''}" id="${esc(c.slug)}" data-category="${esc(c.category)}" data-subcategory="${esc(c.slug)}">
  <div class="cgs-hd">
    <div><span class="lb">${esc(c.eyebrow || 'Collection ' + n2(i + 1))}</span><h2 class="area-t">${esc(c.title)}<span class="it">${esc(c.titleItalic)}</span></h2><p class="area-s">${esc(c.subtitle)}</p></div>
    <p class="area-t2">${esc(c.intro)}</p>
  </div>
  <div class="cg">${ds.map(card).join('')}</div>
  <p class="cg-note">${esc(String(c.note || '').replace('{n}', ds.length))}</p>
</section>`;

  function renderCollection(root, data) {
    const cat = root.dataset.category || 'rugs';
    const colls = live(data.collections.collections).filter(c => c.category === cat).sort(by);
    const all = live(data.designs.designs).filter(d => d.category === cat);
    root.innerHTML = colls.map((c, i) =>
      section(c, all.filter(d => d.collection === c.slug).sort(by), i)).join('\n');

    const filt = el('#filt-in');
    if (filt) {
      filt.innerHTML = `<button data-f="all" aria-pressed="true">All designs</button>` +
        colls.map(c => `<button data-f="${esc(c.slug)}" aria-pressed="false">${esc(c.filterLabel || c.name)}</button>`).join('') +
        `<span class="fc" id="fc" role="status" aria-live="polite"></span>`;
    }
    document.querySelectorAll('[data-cg-count]').forEach(n => { n.textContent = all.length + ' designs'; });
  }

  /* ── design detail ───────────────────────────────────────────────── */

  /* Terms in use: published terms attached to at least one published record.
     The vocabulary can therefore grow freely without ever surfacing publicly. */
  function termsInUse(data, recs) {
    const pool = recs || live(data.designs.designs).concat(live(data.projects.projects));
    const used = new Set();
    pool.forEach(r => (r.terms || []).forEach(t => used.add(t)));
    return live(data.taxonomy.terms).filter(t => used.has(t.slug)).sort(by);
  }
  const termNames = (data, slugs) => (slugs || [])
    .map(s => live(data.taxonomy.terms).find(t => t.slug === s))
    .filter(Boolean).map(t => t.name);

  const row = (k, v) => (v && v.length ? `<div><b>${esc(k)}</b><span>${esc(Array.isArray(v) ? v.join(' · ') : v)}</span></div>` : '');

  function renderDesign(root, data) {
    const q = new URLSearchParams(location.search).get('d');
    const ds = live(data.designs.designs);
    const d = ds.find(x => x.slug === q && x.detail);
    if (!d) { location.replace('index.html'); return; }
    const coll = (data.collections.collections.find(c => c.slug === d.collection) || {});
    const tech = (live(data.taxonomy.terms).find(t => t.slug === d.technique) || {});
    const terms = termNames(data, d.terms);
    const cta = d.cta || data.site.defaultCta || { label: 'Start a project', href: '../index.html#brief' };
    document.title = d.name + ' — Artilier';
    const media = [d.hero].concat(d.images || []).filter(Boolean)
      .map(id => slot(id, d.name)).join('') + (d.video ? slot(d.video, d.name + ' — film') : '');
    const pal = (d.palette || []).map(p =>
      `<span class="dtl-sw"${p.hex ? ` style="--sw:${esc(p.hex)}"` : ''}>${esc(p.name || p)}</span>`).join('');
    root.innerHTML = `<header class="wp-hd">
  <div>
    <span class="lb">${esc(coll.name || '')}${tech.name ? ' · ' + esc(tech.name) : ''}</span>
    <h1 class="d1">${esc(d.name)}</h1>
  </div>
  <div>
    ${d.description ? `<p class="bd">${esc(d.description)}</p>` : ''}
    ${d.intent ? `<p class="bd" style="margin-top:16px">${esc(d.intent)}</p>` : ''}
    <div class="wp-meta"><span><b>${esc(d.construction || '')}</b></span><span>Any dimension</span><span>Custom colourways</span></div>
  </div>
</header>
<section class="sec dtl">
  <div class="dtl-in">
    <div class="dtl-media">${media}</div>
    <div>
      <div class="facts">
        ${row('Construction', d.construction)}
        ${row('Materials & techniques', terms)}
        ${row('Material', d.material)}
        ${row('Pile height', d.pileHeight)}
        ${row('Reference size', d.referenceSize)}
        ${row('Sizes', d.availableSizes)}
        ${row('Also made in', d.availableConstructions)}
        ${row('Material options', d.availableMaterials)}
        ${row('Lead time', d.leadTime)}
      </div>
      ${pal ? `<div class="dtl-pal">${pal}</div>` : ''}
      <div class="brief-a" style="margin-top:clamp(24px,3vw,34px)">
        <a href="${esc(cta.href)}" class="cta">${esc(cta.label)} <span>→</span></a>
        <a href="index.html" class="cta ol">Back to the collection</a>
      </div>
    </div>
  </div>
</section>`;
  }

  /* ── homepage: bespoke, projects, derived counts ──────────────────── */

  function renderHome(data) {
    const flow = el('#bespoke-flow');
    if (flow && data.bespoke.steps) {
      flow.innerHTML = data.bespoke.steps.map(s =>
        `<div class="bs"><span class="bn">${esc(s.n)}</span><span class="bt">${esc(s.title)}</span><p>${esc(s.text)}</p>${slot(s.media, s.title)}</div>`).join('');
    }
    const ex = el('#bespoke-examples');
    const exs = live(data.bespoke.examples).sort(by);
    if (ex) {
      if (exs.length) {
        ex.innerHTML = `<div class="cg">${exs.map((e, i) =>
          `<figure class="cgi">${slot(e.hero, e.name || 'Bespoke example')}<figcaption><b data-mt="${esc(e.hero)}">${esc(e.name || '')}</b><span data-mf="${esc(e.hero)}">${esc(e.label || '')}</span><span class="cgn">${n2(i + 1)}</span></figcaption></figure>`).join('')}</div>`;
        ex.hidden = false;
      } else { ex.innerHTML = ''; ex.hidden = true; }
    }

    const pr = el('#projects');
    const prs = live(data.projects.projects).sort(by);
    if (pr) {
      if (prs.length) {
        pr.innerHTML = `<div class="sec-hd rv">
    <div><span class="lb">${esc(data.projects.eyebrow || 'Projects')}</span><h2 class="d2">${esc(data.projects.title || 'Work,')}<br><span class="it">${esc(data.projects.titleItalic || 'installed.')}</span></h2></div>
    <p class="bd">${esc(data.projects.intro || '')}</p>
  </div>
  <div class="cg rv">${prs.map((p, i) =>
          `<figure class="cgi">${slot(p.hero, p.name)}<figcaption><b data-mt="${esc(p.hero)}">${esc(p.name)}</b><span data-mf="${esc(p.hero)}">${esc([p.location, p.designer].filter(Boolean).join(' · ') || termNames(data, p.terms).join(' · '))}</span><span class="cgn">${n2(i + 1)}</span></figcaption></figure>`).join('')}</div>`;
        pr.hidden = false;
      } else { pr.innerHTML = ''; pr.hidden = true; }
    }

    const sum = el('[data-cg-summary]');
    if (sum) {
      const colls = live(data.collections.collections).filter(c => c.category === 'rugs').sort(by);
      const ds = live(data.designs.designs);
      const parts = colls.map(c => {
        const n = ds.filter(d => d.collection === c.slug).length;
        return n + ' ' + (c.filterLabel || c.name).toLowerCase();
      }).filter(p => !p.startsWith('0 '));
      sum.textContent = parts.length > 1
        ? parts.slice(0, -1).join(', ') + ' and ' + parts[parts.length - 1]
        : (parts[0] || '');
    }
  }

  /* ── boot ─────────────────────────────────────────────────────────── */

  const need = ['collections.json', 'designs.json', 'categories.json', 'taxonomy.json', 'site.json', 'projects.json', 'bespoke.json'];
  const start = () => Promise.all(need.map(get)).then(r => {
    const data = {
      collections: r[0], designs: r[1], categories: r[2],
      taxonomy: r[3], site: r[4], projects: r[5], bespoke: r[6]
    };
    data.termsInUse = recs => termsInUse(data, recs);
    data.termNames = slugs => termNames(data, slugs);
    window.ArtilierContent = data;
    const cg = el('#collection-root');
    const dt = el('#design-root');
    if (cg) renderCollection(cg, data);
    if (dt) renderDesign(dt, data);
    if (!cg && !dt) renderHome(data);
    else if (cg) renderHome(data);
    if (typeof window.initCollectionUI === 'function') window.initCollectionUI();
    document.dispatchEvent(new CustomEvent('artilier:content', { detail: data }));
  }).catch(e => { console.error('[artilier] content failed to load:', e.message); });

  if (document.readyState === 'loading') addEventListener('DOMContentLoaded', start, { once: true });
  else start();
  void HOME;
})();
