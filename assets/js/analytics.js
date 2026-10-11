/**
 * Artilier — measurement layer. Privacy-first, no personal data.
 *
 * What it does
 *  1. Page views: Cloudflare Web Analytics (cookieless, no consent banner
 *     needed). Verified 11 Oct 2026: it is ACTIVE for artilier.co through the
 *     Cloudflare dashboard's automatic injection. Leave CF_BEACON_TOKEN empty —
 *     adding the token here as well would load a second beacon and double-count.
 *  2. Events (GA4 property 558437246 when on artilier.co): `form_start`, `generate_lead`, `enquiry_error` (from enquiry.js),
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
  /* ARTILIER's own GA4 web stream (account "ARTILIER" 411559802 → property 558437246 →
     stream 16107045376, created 11 Oct 2026). Never Art Avenue's property. A measurement
     ID is public by design (it is visible in every page that loads gtag) — not a secret. */
  const GA4_ID = 'G-8TXE25YJ86';
  /* Only production hosts report to GA4, so local builds and previews never send data.
     Add ?ga_debug=1 to a production URL to see hits in GA4 DebugView. */
  const GA4_HOSTS = ['artilier.co', 'www.artilier.co'];
  /* Consent Mode v2. There is no consent banner, so visitors in the UK, EEA and
     Switzerland get analytics_storage DENIED (GA4 receives cookieless pings only, no
     cookies). Elsewhere analytics cookies are allowed. Advertising storage, user data and
     personalisation are denied everywhere — ARTILIER runs no ads through this tag.
     Owner/legal decision: confirm this split, or add a consent banner and switch the
     UK/EEA default to granted-on-consent. */
  const CONSENT_REGIONS = ['AT','BE','BG','HR','CY','CZ','DK','EE','FI','FR','DE','GR','HU','IE','IT','LV','LT','LU','MT','NL','PL','PT','RO','SK','SI','ES','SE','IS','LI','NO','GB','CH'];

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
  const gaOn = !!GA4_ID && GA4_HOSTS.includes(location.hostname);
  if (gaOn) {
    w.gtag = function () { w.dataLayer.push(arguments); };
    const NO_ADS = { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' };
    w.gtag('consent', 'default', { ...NO_ADS, analytics_storage: 'denied', region: CONSENT_REGIONS });
    w.gtag('consent', 'default', { ...NO_ADS, analytics_storage: 'granted' });
    w.gtag('set', 'ads_data_redaction', true);
    w.gtag('js', new Date());
    /* One config call per page = one page_view. GA4 does not store IP addresses. */
    const cfg = { allow_google_signals: false, allow_ad_personalization_signals: false };
    if (/[?&]ga_debug=1\b/.test(location.search)) cfg.debug_mode = true;
    w.gtag('config', GA4_ID, cfg);
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
    if (gaOn && typeof w.gtag === 'function') w.gtag('event', name, clean);
    return true;
  };

  /* ── contact clicks (mailto: and WhatsApp) ─────────────────────────── */
  d.addEventListener('click', e => {
    const a = e.target.closest && e.target.closest('a[href]');
    if (!a) return;
    const h = a.getAttribute('href') || '';
    if (h.startsWith('mailto:')) w.artilierTrack('contact_click', { link_type: 'email' });
    else if (h.startsWith('tel:')) w.artilierTrack('contact_click', { link_type: 'phone' });
    else if (/^https:\/\/(wa\.me|api\.whatsapp\.com)\//.test(h)) w.artilierTrack('whatsapp_click', { link_type: 'whatsapp' });
    else if (/(^|\/)contact\/?(\?|#|$)|#enquire$/.test(h)) {
      /* internal enquiry CTA: record which page and which button, never form content */
      const label = (a.getAttribute('data-cta') || a.textContent || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '').slice(0, 40);
      const zone = a.closest('nav') ? 'nav' : a.closest('footer') ? 'footer' : 'body';
      w.artilierTrack('cta_click', { link_type: 'enquiry_cta', cta_label: label, cta_zone: zone }, 'cta|' + label + '|' + location.pathname);
    }
  }, { capture: true });
})();
