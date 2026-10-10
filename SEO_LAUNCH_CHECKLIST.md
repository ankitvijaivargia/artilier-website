# SEO launch checklist — PR #5

Nothing below has been done on any external account. Ticks are for you (or me, where marked) as each step is completed with evidence.

## 1. Status at hand-over (10 Oct 2026)

| Item | Status | Evidence |
| --- | --- | --- |
| PR #5 | Open, mergeable, not merged | GitHub |
| CI | Cloudflare "Workers Builds: artilier-website" — passed | PR checks |
| Branch preview | Deployed | `https://seo-global-visibility-implementation-artilier-website.ankit-vijaivargia.workers.dev` |
| Build | Reproducible: re-running the three generators produces the committed HTML | Local |
| Automated checks | `tools/check.py` OK — 42 pages, 40 indexable, 40 in sitemap, 0 broken links | Local |
| Browser tests | 22 URLs × 320/390/768/1440 px, real fonts: 0 JS errors, 0 horizontal scroll | Local headless Chromium |
| Form logic | Validation, honeypot, single POST on double-click, success only on 200, error fallback, pre-fill | Local, endpoint intercepted |
| **Form delivery** | **Not yet tested end to end** — needs one real enquiry to your own inbox | Pending (you) |
| Analytics | Code installed, **inactive** (no token / ID). Cloudflare Web Analytics not yet enabled | Pending (you) |
| Search Console / Bing | Not set up on the Google account checked | Pending (you) |
| Production | Unchanged until merge | — |

## 2. Before merging

- [ ] Open the **branch preview** and look at: `/`, `/contact/`, `/hospitality/`, `/trade/uae/`, `/fr/`, `/collection/reth/`, `/about/`, and an unknown URL such as `/xyz/` (should show the branded 404)
- [ ] On a phone, check the header (logo, Menu, Start a project) fits and the menu opens
- [ ] On the preview, check `/about`, `/contact`, `/projects` redirect to the new pages
- [ ] Optional: in Formspree → form `myklqvgp` → Settings → allowed domains, add the preview host to test the form there; otherwise test on production after merge (step 4)
- [ ] Read `OWNER_INPUT_REQUIRED.md` §A–C: anything you want live on day one?
- [ ] Approve the merge (I will not merge without your explicit go-ahead)

## 3. Merge and deploy

1. Merge PR #5 into `main` on GitHub ("Create a merge commit").
2. Cloudflare Workers Builds deploys `main` automatically — wait for the green check on the merge commit (2–5 min).

## 4. Within 15 minutes of deploy (post-deployment verification)

- [ ] `https://artilier.co/` shows the title "Bespoke Rugs for Interior Designers | Artilier, New Delhi"
- [ ] **Live test enquiry** (you send it, to your own inbox): open `https://artilier.co/contact/?type=hospitality&utm_source=launch-test`, enter your own name and studio@artilier.co, message "Launch test — please ignore", submit. Confirm (a) green "Received" message, (b) the email arrives at studio@artilier.co, (c) it includes `sector: hospitality`, `page`, `landing_page`, `referrer`
- [ ] Repeat once from a phone on mobile data, from a design page: `/collection/reth/` → "Enquire about Reth" — the email should include `design_reference: reth`
- [ ] Unknown URL (e.g. `/does-not-exist/`) shows the branded 404 page and returns status 404 (Chrome DevTools → Network)
- [ ] `/about`, `/contact`, `/projects`, `/enquire` resolve to the new pages; `/making` still goes to the homepage section
- [ ] `https://artilier.co/sitemap.xml` lists 40 URLs; `https://artilier.co/tools/build.mjs` returns 404 (no longer published)
- [ ] Social preview: paste `https://artilier.co/collection/parat/` into a WhatsApp chat to yourself — the rug image should appear

## 5. Measurement setup (owner steps)

### Cloudflare Web Analytics (recommended — cookieless, no consent banner)
1. dash.cloudflare.com → your account → **Analytics & Logs → Web Analytics**.
2. **Add a site** → hostname `artilier.co`.
3. Because the domain is on Cloudflare, choose **automatic setup** (Cloudflare injects the beacon). If offered only the JS snippet instead, copy the `token` value and send it to me — it goes into `CF_BEACON_TOKEN` in `assets/js/analytics.js`.
4. Verify after 24 h: the Web Analytics dashboard shows visits and top pages.
Limits: page views, referrers, countries and Core Web Vitals only — **no custom events**. Enquiries are counted from Formspree submissions, which now carry landing page and referrer.

### GA4 (optional — only if you want event reports)
Create a GA4 property and web stream → send me the `G-…` ID. It ships with Consent Mode set to "denied" (cookieless pings). Collecting full analytics from UK/EU visitors requires a consent banner first — decide before enabling.

### Google Search Console
1. search.google.com/search-console → **Add property** → **Domain** → `artilier.co`.
2. Copy the **TXT record** shown.
3. Cloudflare → `artilier.co` → **DNS → Records → Add record**: Type `TXT`, Name `@`, Content = the value, TTL Auto → Save.
4. Back in Search Console → **Verify** (can take a few minutes to an hour).
5. **Sitemaps** → enter `sitemap.xml` → Submit. Expect "Success" and 40 discovered URLs.
6. **URL Inspection** → paste each URL → **Request indexing** (daily quota ~10–12): `/`, `/trade/`, `/bespoke/`, `/hospitality/`, `/collection/`, `/collection/hand-knotted/`, `/collection/hand-tufted/`, `/collection/flatweave/`, `/trade/uae/`, `/trade/saudi-arabia/`, `/fr/`, `/contact/`. Then `/trade/uk/`, `/trade/us/`, `/about/` the next day. Design pages follow via the sitemap.
7. **Security & Manual actions → Manual actions**: expect "No issues detected".
8. Weekly: **Pages** report → check "Not indexed" reasons (Crawled – currently not indexed, Duplicate, etc.).
A request is not an index: count a URL as indexed only when URL Inspection says "URL is on Google".

### Bing Webmaster Tools
1. bing.com/webmasters → sign in → **Import your sites from Google Search Console** (after GSC is verified) → select `artilier.co`.
2. **Sitemaps** → confirm `https://artilier.co/sitemap.xml` is listed (submit if not).
3. **URL Submission** → submit the same priority URLs.
Alternative if not importing: Add site manually → verify with the CNAME or TXT record Bing shows, added in Cloudflare DNS.

## 6. Performance (after deploy)

- [ ] PageSpeed Insights (pagespeed.web.dev), **mobile and desktop**, for `/`, `/contact/`, `/collection/reth/` — record LCP, CLS, INP/TBT and the date. Production before this PR could not be measured on 10 Oct (Google's free quota was exhausted); local lab only: homepage mobile LCP 2.2 s → 1.1 s
- [ ] Repeat a week later for field data (CrUX appears only with enough traffic)

## 7. Rollback

- GitHub → PR #5 → **Revert** → merge the revert PR. Cloudflare redeploys the previous site from `main` in minutes.
- Or Cloudflare dashboard → Workers & Pages → `artilier-website` → **Deployments** → roll back to the previous version (instant, no Git change; follow with a Git revert so `main` matches).
- Nothing in this PR changes DNS, email, or account settings, so a rollback is complete.

## 8. After launch — first 72 hours

- [ ] Formspree: every submission arriving; spam filter on
- [ ] Search Console: sitemap processed; no "Page with redirect" or "Not found (404)" for sitemap URLs
- [ ] Cloudflare Web Analytics receiving data
- [ ] No new 404s for old URLs (Cloudflare → Workers → Observability / logs)
