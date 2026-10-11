/**
 * Artilier — measurement layer. Privacy-first, no personal data.
 *
 * What it does
 *  1. Page views: Cloudflare Web Analytics (cookieless, no consent banner
 *     needed). Verified 11 Oct 2026: it is ACTIVE for artilier.co through the
 *     Cloudflare dashboard's automatic injection. Leave CF_BEACON_TOKEN empty —
 *     adding the token here as well would load a second beacon and double-count.
 *  2. Events: `form_start`, `generate_lead`, `enquiry_error` (from enquiry.js),
 *     `contact_click`, `whatsapp_click` and `cta_click` (an internal button or
 *     link that leads to the enquiry form) are pushed to `window.dataLayer`
 *     and, only if a GA4 measurement ID is set below, sent to GA4. Event
 *     parameters are page path, form id, enquiry type, design reference, the
 *     internal CTA page, link type and error type — never names, emails,
 *     phone numbers or message text.
 *  3. Lead attribution without cookies: the first landing page, the referring
 *     host and any utm_* values are kept in sessionStorage for the visit and
 *     added to enquiry forms as hidden fields (see enquiry.js), so every
 *     enquiry email says where the visitor came from.
 *
 * Owner configuration (empty = disabled, nothing loads):
 */
(() => {
  const CF_BEACON_TOKEN = '';   // keep empty: Cloudflare auto-injection is already active (see above)
  const GA4_ID = '';            // owner to supply after creating an ARTILIER GA4 web stream — see SEO_MEASUREMENT_FRAMEWORK.md §2

  const w = window, d = document;
  w.dataLayer = w.dataLayer || [];

  /* ── first-touch attribution (session only, no cookies) ─────────────── */
  const KEY = 'artilier_touch';
  try {
    if (!sessionStorage.getItem(KEY)) {
      const u = new URL(location.href);
      let ref = '';
      try { ref = d.referrer ? new URL(d.referrer).hostname : ''; } catch (e) {}
      if (ref === location.hostname) ref = '';
      const touch = { landing: u.pathname, referrer: ref || '(direct)' };
      ['utm_source', 'utm_medium', 'utm_campaign'].forEach(k => { const v = u.searchParams.get(k); if (v) touch[k] = v.slice(0, 80); });
      sessionStorage.setItem(KEY, JSON.stringify(touch));
    }
  } catch (e) { /* storage blocked: attribution simply omitted */ }
  w.artilierTouch = () => { try { return JSON.parse(sessionStorage.getItem(KEY)) || {}; } catch (e) { return {}; } };

  /* ── loaders ───────────────────────────────────────────────────────── */
  if (CF_BEACON_TOKEN) {
    const s = d.createElement('script');
    s.defer = true; s.src = 'https://static.cloudflareinsights.com/beacon.min.js';
    s.setAttribute('data-cf-beacon', JSON.stringify({ token: CF_BEACON_TOKEN }));
    d.head.appendChild(s);
  }
  if (GA4_ID) {
    w.gtag = function () { w.dataLayer.push(arguments); };
    /* Consent Mode v2 defaults: no analytics or ad cookies until a consent
       mechanism grants them. GA4 then sends cookieless pings only. */
    w.gtag('consent', 'default', { analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
    w.gtag('js', new Date());
    w.gtag('config', GA4_ID, { anonymize_ip: true });
    const s = d.createElement('script');
    s.async = true; s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA4_ID);
    d.head.appendChild(s);
  }

  /* ── event API with duplicate protection ───────────────────────────── */
  const recent = new Map();
  w.artilierTrack = (name, params = {}, dedupeKey) => {
    const key = dedupeKey || name + '|' + (params.link_type || '') + '|' + location.pathname;
    const now = Date.now();
    if (recent.has(key) && now - recent.get(key) < 4000) return false;   // repeated clicks
    recent.set(key, now);
    const clean = { page_path: location.pathname };
    for (const [k, v] of Object.entries(params)) {
      if (v == null) continue;
      const s = String(v);
      if (/@|\+?\d[\d\s-]{6,}/.test(s)) continue;                       // never send emails or phone numbers
      clean[k] = s.slice(0, 100);
    }
    w.dataLayer.push({ event: name, ...clean });
    if (typeof w.gtag === 'function' && GA4_ID) w.gtag('event', name, clean);
    return true;
  };

  /* ── contact clicks (mailto: and WhatsApp) ─────────────────────────── */
  d.addEventListener('click', e => {
    const a = e.target.closest && e.target.closest('a[href]');
    if (!a) return;
    const h = a.getAttribute('href') || '';
    if (h.startsWith('mailto:')) w.artilierTrack('contact_click', { link_type: 'email' });
    else if (/^https:\/\/(wa\.me|api\.whatsapp\.com)\//.test(h)) w.artilierTrack('whatsapp_click', { link_type: 'whatsapp' });
    else if (/(^|\/)contact\/?(\?|#|$)|#enquire$/.test(h)) {
      /* internal enquiry CTA: record which page and which button, never form content */
      const label = (a.getAttribute('data-cta') || a.textContent || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '').slice(0, 40);
      const zone = a.closest('nav') ? 'nav' : a.closest('footer') ? 'footer' : 'body';
      w.artilierTrack('cta_click', { link_type: 'enquiry_cta', cta_label: label, cta_zone: zone }, 'cta|' + label + '|' + location.pathname);
    }
  }, { capture: true });
})();
