/**
 * Artilier — enquiry forms. Used by the homepage brief and /contact/.
 *
 * Any <form data-enquiry data-endpoint="…"> is handled here:
 *  - client-side validation with an accessible status message;
 *  - honeypot spam trap (field "_gotcha", which Formspree discards);
 *  - one submission in flight at a time (no double sends);
 *  - success is reported ONLY when the endpoint accepts the post;
 *  - events (no personal data): `form_start` on the first edit, `generate_lead`
 *    on an accepted submission, `enquiry_error` when the service refuses it or
 *    the network fails — each with form id, enquiry type, design reference and
 *    the internal page the visitor came from (`cta_page`);
 *  - hidden attribution fields (page, landing page, referrer, utm_*) so each
 *    enquiry email shows where the visitor came from;
 *  - ?design=<slug> and ?type=<sector|headboard|fabric> pre-fill the form from CTAs.
 * Without an endpoint the form falls back to composing an email — and says so.
 */
(() => {
  const EMAIL = 'studio@artilier.co';
  const forms = document.querySelectorAll('form[data-enquiry]');
  if (!forms.length) return;

  const qs = new URLSearchParams(location.search);
  const titleCase = s => s.replace(/(^|[-\s])([a-z])/g, (m, a, b) => (a === '-' ? ' ' : a) + b.toUpperCase());


  /* Post-submission view for forms marked data-confirm: replaces the form with a designed confirmation.
     The guide link matches the discipline the visitor chose.
     TODO: the receipt email to the visitor is a Formspree auto-response setting (dashboard), not code in this repo.
     Suggested subject "We've received your brief — here's what happens next"; body = receipt, reply timing,
     discipline-matched guide, /process/, WhatsApp. Add it there, then keep the timing line below in step. */
  const GUIDE_BY_SECTOR = { embroidery: ['briefing-an-embroidery-commission', 'How to brief an embroidery commission'], leather: ['briefing-a-leather-commission', 'How to brief a leather commission'], stone: ['briefing-a-stone-commission', 'How to brief a stone commission'], inlay: ['briefing-an-inlay-commission', 'How to brief an inlay commission'], 'wall-works': ['briefing-a-wall-works-commission', 'How to brief a wall works commission'] };
  const RUG_GUIDE = ['briefing-a-bespoke-rug', 'How to brief a bespoke rug'];
  function showConfirmation(form, sector) {
    const key = String(sector).toLowerCase();
    const guide = GUIDE_BY_SECTOR[key] || RUG_GUIDE;
    const link = (href, text, ext) => `<li><a href="${href}"${ext ? ' target="_blank" rel="noopener"' : ''}>${text} <span aria-hidden="true">→</span></a></li>`;
    const box = document.createElement('div');
    box.className = 'f-done';
    box.tabIndex = -1;
    box.innerHTML =
      '<span class="lb">Enquiry received</span>' +
      '<h2>Thank you — <span class="it">we have your brief.</span></h2>' +
      '<p>We read every enquiry ourselves and reply individually, usually within a few working days. The reply covers our thoughts on construction and material, any questions we need answered, and where there is enough information, an initial cost range.</p>' +
      '<span class="lb">While you wait</span>' +
      '<ul>' + (guide ? link('/guides/' + guide[0] + '/', guide[1]) : '') +
        link('/process/', 'Our process') + link('/collection/designs/', 'Browse all designs') +
        link('https://www.instagram.com/artilier.co/', 'Instagram @artilier.co', true) + '</ul>' +
      '<p>Need a faster answer? <a href="https://wa.me/919828030095" target="_blank" rel="noopener">Message the studio on WhatsApp</a>.</p>';
    [...form.children].forEach(c => { if (!c.matches('.f-status') && !c.querySelector('[name="_gotcha"]')) c.hidden = true; });
    const st = form.querySelector('.f-status'); if (st) st.hidden = true;   /* the focused confirmation carries the message for screen readers */
    form.insertBefore(box, form.firstChild);
    box.scrollIntoView({ block: 'start', behavior: 'smooth' });
    box.focus({ preventScroll: true });
  }

  forms.forEach(form => {
    const status = form.querySelector('.f-status');
    const btn = form.querySelector('button[type=submit]');
    const endpoint = form.getAttribute('data-endpoint') || '';
    let sending = false, sentAt = 0, started = false;

    /* The internal page whose CTA brought the visitor here (e.g. /trade/uae/,
       /collection/reth/). Same-origin referrers only; external sites are
       already captured as `referrer` in the attribution fields. */
    let ctaPage = '';
    try { const r = document.referrer ? new URL(document.referrer) : null; if (r && r.host === location.host && r.pathname !== location.pathname) ctaPage = r.pathname.slice(0, 100); } catch (e) {}
    const designRef = () => (form.querySelector('input[type=hidden][name="design_reference"]') || {}).value || '';
    const sectorOf = () => { const r = form.querySelector('input[name=sector]:checked'); return (r && r.value) || (form.querySelector('[name=sector]') || {}).value || 'general'; };
    const evt = extra => Object.assign({ form_id: form.id || 'enquiry', enquiry_type: sectorOf(), design_reference: designRef() || undefined, cta_page: ctaPage || undefined }, extra);

    form.addEventListener('input', () => {
      if (started) return; started = true;
      if (window.artilierTrack) window.artilierTrack('form_start', evt(), 'start|' + (form.id || 'enquiry'));
    });

    /* hidden fields */
    const hidden = (name, value) => {
      let el = form.querySelector(`input[type=hidden][name="${name}"]`);
      if (!el) { el = document.createElement('input'); el.type = 'hidden'; el.name = name; form.appendChild(el); }
      el.value = value;
    };
    if (!form.querySelector('[name="_gotcha"]')) {
      const trap = document.createElement('div');
      trap.setAttribute('aria-hidden', 'true');
      trap.style.cssText = 'position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden';
      trap.innerHTML = '<label>Leave this empty<input type="text" name="_gotcha" tabindex="-1" autocomplete="off"></label>';
      form.appendChild(trap);
    }

    form.addEventListener('submit', async e => {
      e.preventDefault();
      if (sending || Date.now() - sentAt < 4000) return;   // in flight, or a double-click just after success
      status.className = 'f-status';
      if (!form.checkValidity()) {
        status.classList.add('err');
        status.textContent = 'Please add your name, a valid email and a short description of the project.';
        const bad = form.querySelector(':invalid'); if (bad) bad.focus();
        return;
      }
      const touch = (window.artilierTouch && window.artilierTouch()) || {};
      hidden('page', location.pathname);
      if (ctaPage) hidden('cta_page', ctaPage);
      hidden('landing_page', touch.landing || '');
      hidden('referrer', touch.referrer || '');
      ['utm_source', 'utm_medium', 'utm_campaign'].forEach(k => touch[k] && hidden(k, touch[k]));
      const fd = new FormData(form);
      const sector = fd.get('sector') || fd.get('enquiry') || 'General';
      fd.set('_subject', `ARTILIER enquiry — ${sector} — ${fd.get('name') || ''}`.slice(0, 120));
      fd.set('_replyto', fd.get('email') || '');

      if (!endpoint) {                       // honest fallback: compose an email
        const lines = [...fd.entries()].filter(([k]) => !k.startsWith('_')).map(([k, v]) => `${k}: ${v}`);
        location.href = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent(fd.get('_subject')) + '&body=' + encodeURIComponent(lines.join('\n'));
        status.classList.add('warn');
        status.textContent = 'Your email app is opening with the enquiry filled in. It is not sent until you press send.';
        return;
      }

      sending = true;
      const label = btn ? btn.innerHTML : '';
      if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }
      try {
        let r;
        try { r = await fetch(endpoint, { method: 'POST', body: fd, headers: { Accept: 'application/json' } }); }
        catch (netErr) { throw new Error('network'); }
        if (!r.ok) throw new Error('http_' + r.status);
        form.reset(); sentAt = Date.now();
        status.classList.add('ok');
        status.textContent = 'Received. We read every enquiry ourselves and reply individually — usually within a few working days.';
        if (form.hasAttribute('data-confirm')) showConfirmation(form, String(sector));
        if (window.artilierTrack) window.artilierTrack('generate_lead', evt({ enquiry_type: String(sector) }), 'lead|' + Date.now());
      } catch (err) {
        if (window.artilierTrack) window.artilierTrack('enquiry_error', evt({ error_type: String(err && err.message || 'unknown').slice(0, 20) }), 'err|' + Date.now());
        status.classList.add('err');
        status.innerHTML = `That did not send. Please email it to <a href="mailto:${EMAIL}">${EMAIL}</a> and we will pick it up.`;
      } finally {
        sending = false;
        if (btn) { btn.disabled = false; btn.innerHTML = label; }
      }
    });

    /* Pre-fill from the CTA that brought the visitor here. Runs after the
       submit handler is attached and can never stop the form from working. */
    try {
      const design = (qs.get('design') || '').replace(/[^a-z0-9-]/gi, '').slice(0, 40);
      const type = (qs.get('type') || '').replace(/[^a-z0-9-]/gi, '').slice(0, 40).toLowerCase();
      if (design) {
        hidden('design_reference', design);
        const sel = form.querySelector('select[name=enquiry]');
        if (sel) [...sel.options].forEach(o => { if (/collection, re-sized/i.test(o.text)) sel.value = o.value || o.text; });
        const coll = form.querySelector('input[name=sector][value=collection]');
        if (coll) coll.checked = true;
        const ta = form.querySelector('[name=brief]');
        if (ta && !ta.value) ta.value = `About ${titleCase(design)} from the collection — `;
      }
      if (type) {
        /* Product CTAs: ?type=headboard and ?type=fabric map to the embroidery
           sector; the "What do you need?" select follows the product so the
           enquiry does not arrive labelled as a rug. cta_type keeps the exact
           CTA for attribution (no personal data). */
        const PRODUCT = { embroidery: /^Embroidery — wall panels/i, headboard: /^Embroidered headboards/i, fabric: /^Embroidered fabric/i };
        const sectorType = PRODUCT[type] ? 'embroidery' : type;
        if (type === 'hospitality') {
          const need = form.querySelector('select[name=enquiry]');
          if (need) [...need.options].forEach(o => { if (/^Several rugs/i.test(o.text)) need.value = o.value || o.text; });
        }
        if (PRODUCT[type]) {
          hidden('cta_type', type);
          const need = form.querySelector('select[name=enquiry]');
          if (need) [...need.options].forEach(o => { if (PRODUCT[type].test(o.text)) need.value = o.value || o.text; });
          const cons = form.querySelector('select[name=construction]');
          if (cons) [...cons.options].forEach(o => { if (/^Hand embroidery$/i.test(o.text)) cons.value = o.value || o.text; });
        }
        if (type === 'stone') {
          hidden('cta_type', type);
          const need = form.querySelector('select[name=enquiry]');
          if (need) [...need.options].forEach(o => { if (/^Stone — /i.test(o.text)) need.value = o.value || o.text; });
          const cons = form.querySelector('select[name=construction]');
          if (cons) [...cons.options].forEach(o => { if (/^Stone or shell inlay$/i.test(o.text)) cons.value = o.value || o.text; });
        }
        if (type === 'inlay') {
          hidden('cta_type', type);
          const need = form.querySelector('select[name=enquiry]');
          if (need) [...need.options].forEach(o => { if (/^Inlay furniture — /i.test(o.text)) need.value = o.value || o.text; });
          const cons = form.querySelector('select[name=construction]');
          if (cons) [...cons.options].forEach(o => { if (/^Mother-of-pearl or bone inlay$/i.test(o.text)) cons.value = o.value || o.text; });
        }
        if (type === 'wall-works') {
          hidden('cta_type', type);
          const need = form.querySelector('select[name=enquiry]');
          if (need) [...need.options].forEach(o => { if (/^Wall works — /i.test(o.text)) need.value = o.value || o.text; });
          const cons = form.querySelector('select[name=construction]');
          if (cons) [...cons.options].forEach(o => { if (/^Ceramic, metal, plaster/i.test(o.text)) cons.value = o.value || o.text; });
        }
        if (type === 'leather') {
          hidden('cta_type', type);
          const need = form.querySelector('select[name=enquiry]');
          if (need) [...need.options].forEach(o => { if (/^Leather — /i.test(o.text)) need.value = o.value || o.text; });
          const cons = form.querySelector('select[name=construction]');
          if (cons) [...cons.options].forEach(o => { if (/^Leather or hide$/i.test(o.text)) cons.value = o.value || o.text; });
        }
        const radio = [...form.querySelectorAll('input[type=radio][name=sector]')].find(r => r.value.toLowerCase() === sectorType);
        if (radio) radio.checked = true;
        const sel = form.querySelector('select[name=sector]');
        if (sel) [...sel.options].forEach(o => { if ((o.value || o.text).toLowerCase() === sectorType) sel.value = o.value || o.text; });
      }
    } catch (err) { /* pre-fill is a convenience only */ }
  });

  /* /contact/ "Before you brief us": the guide list follows the discipline chosen
     under "What is the project?". All six guides show by default, and whenever the
     choice is not a single discipline (residential, hospitality, collaboration…). */
  const guides = document.querySelector('[data-guides]');
  if (guides) {
    const RUG_SECTORS = ['bespoke', 'collection'];
    const items = [...guides.querySelectorAll('[data-guide]')];
    const sync = () => {
      const r = document.querySelector('input[type=radio][name=sector]:checked');
      const v = r ? r.value.toLowerCase() : '';
      const key = RUG_SECTORS.includes(v) ? 'rug' : v;
      const one = items.some(a => a.dataset.guide === key);
      items.forEach(a => { a.style.display = one && a.dataset.guide !== key ? 'none' : ''; });
    };
    document.addEventListener('change', e => { if (e.target.matches('input[type=radio][name=sector]')) sync(); });
    sync();
  }
})();
