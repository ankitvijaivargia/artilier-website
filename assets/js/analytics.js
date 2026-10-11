/**
 * Artilier — measurement layer. Privacy-first, no personal data.
 *
 * What it does
 *  1. Page views: Cloudflare Web Analytics (cookieless). It is ACTIVE for
 *     artilier.co through the Cloudflare dashboard's automatic injection, so
 *     CF_BEACON_TOKEN stays empty — a second beacon would double-count.
 *  2. Google Analytics 4 — ARTILIER's own property only (account 411559802 →
 *     property 558437246 → stream 16107045376, G-8TXE25YJ86). Never Art Avenue's.
 *  3. Events (`form_start`, `generate_lead`, `enquiry_error` from enquiry.js;
 *     `contact_click`, `whatsapp_click`, `cta_click` here) go to `window.dataLayer`
 *     and, when GA4 is running, to GA4. Parameters never include names, emails,
 *     phone numbers or message text.
 *  4. Lead attribution: landing page, referring host and utm_* values, added to
 *     enquiry forms as hidden fields (see enquiry.js).
 *
 * CONSENT (Stage 10C, PR "consent" — owner decision required before merge)
 *  - The visitor's country comes from Cloudflare's own edge (`/cdn-cgi/trace`,
 *    same origin, no third party).
 *  - UK, EEA (EU27 + IS, LI, NO) and Switzerland — or an unknown country — are
 *    "consent regions". There, NOTHING is sent to Google, no GA cookie is set
 *    and nothing is written to sessionStorage until the visitor clicks
 *    "Allow analytics" in the banner (Consent Mode "basic" behaviour). "Decline" is
 *    stored and respected. "Cookie settings" in the footer reopens the choice.
 *  - Elsewhere GA4 loads with analytics_storage granted. Advertising storage,
 *    ad user data and ad personalisation are denied everywhere; Google signals off.
 *  - The only thing stored for the consent itself is localStorage
 *    `artilier_consent` = "granted" | "denied" (needed to remember the choice).
 */
(() => {
  const CF_BEACON_TOKEN = '';   // keep empty: Cloudflare auto-injection is already active
  const GA4_ID = 'G-8TXE25YJ86';   // public by design (visible in every page that loads gtag) — not a secret
  /* Only production hosts report to GA4. Add ?ga_debug=1 to a production URL for DebugView. */
  const GA4_HOSTS = ['artilier.co', 'www.artilier.co'];
  const CONSENT_REGIONS = ['AT','BE','BG','HR','CY','CZ','DK','EE','FI','FR','DE','GR','HU','IE','IT','LV','LT','LU','MT','NL','PL','PT','RO','SK','SI','ES','SE','IS','LI','NO','GB','CH'];
  const CHOICE_KEY = 'artilier_consent';
  const TOUCH_KEY = 'artilier_touch';

  const w = window, d = document;
  w.dataLayer = w.dataLayer || [];
  const prodHost = GA4_HOSTS.includes(location.hostname);

  /* ── attribution: computed for this page; stored for the visit only once allowed ── */
  const pageTouch = (() => {
    const u = new URL(location.href);
    let ref = '';
    try { ref = d.referrer ? new URL(d.referrer).hostname : ''; } catch (e) {}
    if (ref === location.hostname) ref = '';
    const t = { landing: u.pathname, referrer: ref || '(direct)' };
    ['utm_source', 'utm_medium', 'utm_campaign'].forEach(k => { const v = u.searchParams.get(k); if (v) t[k] = v.slice(0, 80); });
    return t;
  })();
  let storageAllowed = false;
  const persistTouch = () => {
    storageAllowed = true;
    try { if (!sessionStorage.getItem(TOUCH_KEY)) sessionStorage.setItem(TOUCH_KEY, JSON.stringify(pageTouch)); } catch (e) {}
  };
  w.artilierTouch = () => {
    if (storageAllowed) { try { const s = JSON.parse(sessionStorage.getItem(TOUCH_KEY)); if (s) return s; } catch (e) {} }
    return pageTouch;   // without stored attribution, the current page's own landing/referrer/utm is used
  };

  /* ── consent choice (localStorage holds only "granted"/"denied") ─────── */
  const getChoice = () => { try { return localStorage.getItem(CHOICE_KEY); } catch (e) { return null; } };
  const setChoice = v => { try { localStorage.setItem(CHOICE_KEY, v); } catch (e) {} };

  /* ── loaders ─────────────────────────────────────────────────────────── */
  if (CF_BEACON_TOKEN) {
    const s = d.createElement('script');
    s.defer = true; s.src = 'https://static.cloudflareinsights.com/beacon.min.js';
    s.setAttribute('data-cf-beacon', JSON.stringify({ token: CF_BEACON_TOKEN }));
    d.head.appendChild(s);
  }
  let gaOn = false;
  const queue = [];   // events raised on this page before GA4 started (sent once it starts)
  const startGA = () => {
    if (gaOn || !GA4_ID || !prodHost) return;
    gaOn = true;
    w.gtag = function () { w.dataLayer.push(arguments); };
    w.gtag('consent', 'default', { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'granted' });
    w.gtag('set', 'ads_data_redaction', true);
    w.gtag('js', new Date());
    /* One config call per page = one page_view. GA4 does not store IP addresses. */
    const cfg = { allow_google_signals: false, allow_ad_personalization_signals: false };
    if (/[?&]ga_debug=1\b/.test(location.search)) cfg.debug_mode = true;
    w.gtag('config', GA4_ID, cfg);
    const s = d.createElement('script');
    s.async = true; s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA4_ID);
    d.head.appendChild(s);
    queue.splice(0).forEach(([n, p]) => w.gtag('event', n, p));
  };
  const stopGA = () => {
    if (typeof w.gtag === 'function') w.gtag('consent', 'update', { analytics_storage: 'denied' });
    w['ga-disable-' + GA4_ID] = true;
    /* remove GA's first-party cookies (_ga, _ga_<id>) on this host and its parent domain */
    d.cookie.split(';').map(c => c.trim().split('=')[0]).filter(n => /^_ga(_|$)/.test(n)).forEach(n => {
      ['', '; domain=' + location.hostname, '; domain=.' + location.hostname.replace(/^www\./, '')].forEach(dm => {
        d.cookie = n + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/' + dm;
      });
    });
    try { sessionStorage.removeItem(TOUCH_KEY); } catch (e) {}
    storageAllowed = false;
  };

  /* ── consent banner (consent regions only) ──────────────────────────── */
  const up = (() => { const a = d.querySelector('script[src*="assets/js/analytics.js"]'); return a ? a.getAttribute('src').split('assets/js/')[0] : '/'; })();
  let banner = null;
  const showBanner = () => {
    if (banner) { banner.hidden = false; return; }
    const st = d.createElement('style');
    st.textContent = '.ck{position:fixed;left:16px;right:16px;bottom:16px;z-index:9999;max-width:560px;background:#151110;color:#F7F3EB;padding:20px 22px;font:14px/1.55 Jost,system-ui,sans-serif;box-shadow:0 8px 30px rgba(0,0,0,.25)}'
      + '.ck p{margin:0 0 14px}.ck a{color:#C9AE73}.ck .ck-b{display:flex;gap:10px;flex-wrap:wrap}'
      + '.ck button{flex:1 1 140px;font:inherit;letter-spacing:.06em;text-transform:uppercase;font-size:12px;padding:11px 14px;cursor:pointer;border:1px solid #A98B4E;background:transparent;color:#F7F3EB}'
      + '.ck button:focus-visible{outline:2px solid #C9AE73;outline-offset:2px}.ck button[data-ck=yes]{background:#A98B4E;color:#151110}'
      + '@media(min-width:700px){.ck{left:24px;bottom:24px}}';
    d.head.appendChild(st);
    banner = d.createElement('div');
    banner.className = 'ck'; banner.setAttribute('role', 'region'); banner.setAttribute('aria-label', 'Analytics cookies');
    banner.innerHTML = '<p>We use Google Analytics to understand which pages are useful. It sets cookies only if you allow it; declining changes nothing on the site. <a href="' + up + 'privacy/">Privacy notice</a></p>'
      + '<div class="ck-b"><button type="button" data-ck="yes">Allow analytics</button><button type="button" data-ck="no">Decline</button></div>';
    banner.addEventListener('click', e => {
      const b = e.target.closest('button[data-ck]'); if (!b) return;
      if (b.dataset.ck === 'yes') { setChoice('granted'); persistTouch(); startGA(); if (typeof w.gtag === 'function') w.gtag('consent', 'update', { analytics_storage: 'granted' }); delete w['ga-disable-' + GA4_ID]; }
      else { setChoice('denied'); stopGA(); }
      banner.hidden = true;
    });
    (d.body || d.documentElement).appendChild(banner);
  };
  d.addEventListener('click', e => {
    const a = e.target.closest && e.target.closest('[data-consent-open]');
    if (a) { e.preventDefault(); showBanner(); }
  });

  /* ── decide: country from Cloudflare's edge; unknown = treat as consent region ── */
  const decide = loc => {
    const needsConsent = !loc || CONSENT_REGIONS.includes(loc);
    w.artilierRegion = { country: loc || 'unknown', consentRequired: needsConsent };
    if (!needsConsent) { persistTouch(); startGA(); return; }
    const c = getChoice();
    if (c === 'granted') { persistTouch(); startGA(); }
    else if (c !== 'denied') { if (d.body) showBanner(); else d.addEventListener('DOMContentLoaded', showBanner); }
  };
  if (prodHost) {
    const ctl = 'AbortController' in w ? new AbortController() : null;
    const timer = setTimeout(() => ctl && ctl.abort(), 2000);
    fetch('/cdn-cgi/trace', { cache: 'no-store', signal: ctl && ctl.signal })
      .then(r => r.ok ? r.text() : '')
      .then(t => { clearTimeout(timer); const m = /^loc=([A-Z]{2})$/m.exec(t || ''); decide(m ? m[1] : null); })
      .catch(() => { clearTimeout(timer); decide(null); });
  } else {
    persistTouch();   // local builds and previews: attribution only, never GA
  }

  /* ── event API with duplicate protection ─────────────────────────────── */
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
    else if (queue.length < 20) queue.push([name, clean]);
    return true;
  };

  /* ── contact clicks (mailto:, tel:, WhatsApp) and enquiry CTAs ───────── */
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
