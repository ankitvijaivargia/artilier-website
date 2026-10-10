/**
 * Artilier — enquiry forms. Used by the homepage brief and /contact/.
 *
 * Any <form data-enquiry data-endpoint="…"> is handled here:
 *  - client-side validation with an accessible status message;
 *  - honeypot spam trap (field "_gotcha", which Formspree discards);
 *  - one submission in flight at a time (no double sends);
 *  - success is reported ONLY when the endpoint accepts the post;
 *  - on success a `generate_lead` event is recorded (no personal data);
 *  - hidden attribution fields (page, landing page, referrer, utm_*) so each
 *    enquiry email shows where the visitor came from;
 *  - ?design=<slug> and ?type=<sector> pre-fill the form from CTAs.
 * Without an endpoint the form falls back to composing an email — and says so.
 */
(() => {
  const EMAIL = 'studio@artilier.co';
  const forms = document.querySelectorAll('form[data-enquiry]');
  if (!forms.length) return;

  const qs = new URLSearchParams(location.search);
  const titleCase = s => s.replace(/(^|[-\s])([a-z])/g, (m, a, b) => (a === '-' ? ' ' : a) + b.toUpperCase());

  forms.forEach(form => {
    const status = form.querySelector('.f-status');
    const btn = form.querySelector('button[type=submit]');
    const endpoint = form.getAttribute('data-endpoint') || '';
    let sending = false, sentAt = 0;

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

    /* pre-fill from the CTA that brought the visitor here */
    const design = (qs.get('design') || '').replace(/[^a-z0-9-]/gi, '').slice(0, 40);
    const type = (qs.get('type') || '').replace(/[^a-z0-9-]/gi, '').slice(0, 40);
    if (design) {
      hidden('design_reference', design);
      const sel = form.querySelector('[name=enquiry]');
      if (sel) [...sel.options].forEach(o => { if (/collection, re-sized/i.test(o.text)) sel.value = o.value || o.text; });
      const ta = form.querySelector('[name=brief]');
      if (ta && !ta.value) ta.value = `About ${titleCase(design)} from the collection — `;
    }
    if (type) {
      const sec = form.querySelector('[name=sector]');
      if (sec) [...sec.options].forEach(o => { if ((o.value || '').toLowerCase() === type.toLowerCase()) sec.value = o.value; });
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
      hidden('landing_page', touch.landing || '');
      hidden('referrer', touch.referrer || '');
      ['utm_source', 'utm_medium', 'utm_campaign'].forEach(k => touch[k] && hidden(k, touch[k]));
      const fd = new FormData(form);
      const sector = fd.get('sector') || fd.get('enquiry') || 'General';
      fd.set('_subject', `Artilier enquiry — ${sector} — ${fd.get('name') || ''}`.slice(0, 120));
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
        const r = await fetch(endpoint, { method: 'POST', body: fd, headers: { Accept: 'application/json' } });
        if (!r.ok) throw new Error(String(r.status));
        form.reset(); sentAt = Date.now();
        status.classList.add('ok');
        status.textContent = 'Received. We read every enquiry ourselves and reply individually — usually within a few working days.';
        if (window.artilierTrack) window.artilierTrack('generate_lead', { form_id: form.id || 'enquiry', enquiry_type: sector }, 'lead|' + Date.now());
      } catch (err) {
        status.classList.add('err');
        status.innerHTML = `That did not send. Please email it to <a href="mailto:${EMAIL}">${EMAIL}</a> and we will pick it up.`;
      } finally {
        sending = false;
        if (btn) { btn.disabled = false; btn.innerHTML = label; }
        status.focus && status.setAttribute('tabindex', '-1');
      }
    });
  });
})();
