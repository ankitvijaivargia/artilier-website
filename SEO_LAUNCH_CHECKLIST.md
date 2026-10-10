# Launch checklist — PR #11 (current release candidate)

PR #11 · `seo/growth-engine-p1` → `main` · *SEO growth engine P1: readable pages, French localisation, briefing guide, plans*

Rule: a box is ticked only with evidence (a screenshot, an email received, a dashboard showing data). Nothing on an external account (Cloudflare, Google, Bing, Formspree) has been changed by Claude.

Earlier releases: PR #5 (contact page, analytics code, market and French pages) and PRs #6–#9 (positioning, Bing tag, working and commercial terms) are merged and live. Their history is in `SEO_IMPLEMENTATION_LOG.md` and `PR_REVIEW_REPORT.md`.

## 1. How this site deploys

- Hosting: a **Cloudflare Worker with static assets** (`wrangler.jsonc`: `assets.directory = "."`, `not_found_handling = "404-page"`). Files listed in `.assetsignore` (tools, planning documents) are not published.
- **Every push to `main` deploys production automatically** (Cloudflare Workers Builds). Merging a PR is the deploy.
- Every push to a PR branch builds a **preview** and posts its links on the PR (comment by *cloudflare-workers-and-pages[bot]*). The **Branch Preview URL** always shows the latest commit on the branch: `https://seo-growth-engine-p1-artilier-website.ankit-vijaivargia.workers.dev`
- There is no build step on Cloudflare: the HTML in the repo is what is served. Pages are generated locally from `tools/build*.mjs` and committed (see `README.md`).

## 2. Status of this release candidate

| Item | Status | Evidence |
|---|---|---|
| PR #11 | Open, not merged | GitHub |
| Build | Generators re-run on the branch reproduce the committed HTML | Local, release review |
| `tools/check.py` | OK — **43 pages checked, 41 indexable, 41 in sitemap**; 0 broken links; titles/descriptions unique and within length; one H1; valid JSON-LD; alt text; no manufacturing locations named | Local, release review (counts re-derived from the branch) |
| Contrast audit | No text below 3:1 on 17 key pages (was: 24 invisible lead-ins on 4 pages, 19 invisible grid items on `/trade/`, plus `/about/` and `/craft/`) | Local headless Chromium |
| Responsive | 11 URLs × 360/390/768/1440 px: 0 JS errors, 0 horizontal overflow, header fits, one H1; mobile menu opens and closes (Escape) | Local headless Chromium |
| Enquiry form logic | 31/31 checks passed with the Formspree endpoint **intercepted (mocked)**: validation, one POST on double-click, success only after 200, error on 500 and on network failure, honeypot, attribution, design and CTA-page capture, keyboard submit, no personal data in analytics events | Local, mocked — **not a delivery test** |
| Cloudflare preview build | See PR checks for the latest commit | GitHub |
| **Live enquiry delivery** | **Outstanding** — no real enquiry has been sent | Owner step §4 |
| **Search Console** | **Outstanding** — not verified | Owner step §5 |
| **Cloudflare Web Analytics** | **Outstanding** — not enabled in code; dashboard status unknown | Owner step §5 |
| Production | Unchanged until merge | — |

## 3. Before merging (pre-merge)

Open the **Branch Preview URL** above on a laptop and on a phone, and check:

- [ ] `/trade/uae/`, `/trade/saudi-arabia/`, `/trade/uk/` — the bold opening words in the dark bands ("Villas and private residences —", "Rug schedule —") are readable
- [ ] `/trade/` — the "From specification to site" list is readable
- [ ] `/fr/` — menu, buttons and footer are in French; "Délais et conditions" shows the terms; tap Menu → it reads "Fermer"
- [ ] `/guides/briefing-a-bespoke-rug/` — **read it in full**; every statement must be true of how the studio works. Mark anything to change
- [ ] `/collection/reth/` → "Enquire about Reth" → the contact form opens with "A collection design" selected
- [ ] An unknown address such as `/xyz/` shows the branded "This page is not here" page
- [ ] Do **not** submit the form on the preview unless the preview host is in Formspree's allowed domains — a blocked submission shows the error message, which is expected
- [ ] Optional: answer anything in `OWNER_INPUT_REQUIRED.md` you want live on day one (§B French replies, §I hospitality scope)
- [ ] Tell Claude "approved to merge" (Claude will not merge without it)

## 4. Merge and post-deployment checks

**Merge:** GitHub → PR #11 → *Merge pull request* (merge commit). Cloudflare deploys `main` automatically; wait for the green check on the merge commit (usually 1–5 minutes).

**Within 15 minutes of the deploy:**

- [ ] `https://artilier.co/guides/briefing-a-bespoke-rug/` opens; `https://artilier.co/sitemap.xml` lists **41** URLs
- [ ] The dark bands on `/trade/uae/` are readable on the live site (hard refresh; the stylesheet is versioned `pages.css?v=3`)
- [ ] **Live enquiry test (you send it, to your own inbox):** open `https://artilier.co/trade/uae/`, press "Start a UAE project", fill in your own name, `studio@artilier.co`, message "Launch test — please ignore", submit. Pass = (a) green "Received" message, (b) email arrives at studio@artilier.co, (c) it shows `sector`, `page`, `landing_page`, `referrer` and `cta_page: /trade/uae/`
- [ ] Repeat once on a phone from `/collection/reth/` → "Enquire about Reth" — the email should include `design_reference: reth`
- [ ] Unknown URL (e.g. `/does-not-exist/`) shows the branded 404 and returns status 404 (Chrome DevTools → Network)
- [ ] `/about`, `/contact`, `/enquire` resolve to the real pages; `https://artilier.co/tools/build.mjs` and `https://artilier.co/SEO_LAUNCH_CHECKLIST.md` return 404

Mark the live enquiry test **passed** in §2 only after the email has arrived.

## 5. Measurement setup (owner, any time — independent of the merge)

### Cloudflare Web Analytics (cookieless; no consent banner needed)
1. dash.cloudflare.com → **Analytics & Logs → Web Analytics → Add a site** → `artilier.co`.
2. Choose **automatic setup** (Cloudflare injects the beacon for the proxied domain). No code change is needed.
3. If Cloudflare offers only a JS snippet, copy its `token` value and send it to Claude — it goes into `CF_BEACON_TOKEN` in `assets/js/analytics.js` (one-line change, new PR). Do not enable both.
4. Evidence: after 24 hours the dashboard shows visits and top pages.
Limit: page views, referrers and countries only — no custom events. Enquiries are counted from Formspree (each email carries landing page, referrer and CTA page).

### Google Search Console (Domain property)
1. search.google.com/search-console → **Add property → Domain** → `artilier.co`.
2. Copy the **TXT record** Google shows.
3. Cloudflare → `artilier.co` → **DNS → Records → Add record**: Type `TXT`, Name `@`, Content = the value, TTL Auto → Save. Change no other record.
4. Search Console → **Verify** (minutes to an hour).
5. **Sitemaps** → `sitemap.xml` → Submit. Evidence: status "Success" with 41 discovered URLs once this PR is live (40 before).
6. **URL Inspection → Request indexing**, in this order (daily quota is limited): `/`, `/trade/uae/`, `/trade/saudi-arabia/`, `/guides/briefing-a-bespoke-rug/`, `/bespoke/`, `/hospitality/`, `/trade/`, `/fr/`, `/collection/`; next day `/trade/uk/`, `/trade/us/` and the three category pages.
7. **Security & Manual actions → Manual actions**: expect "No issues detected".
8. Settings → Users: add whoever will review reports.
A request is not an index: count a URL as indexed only when URL Inspection says "URL is on Google".

### Bing Webmaster Tools
The verification tag is already live (PR #7). bing.com/webmasters → **Import from Google Search Console** after step 4 → confirm the sitemap is listed.

### GA4 (optional)
Only if you want event reports (`form_start`, `generate_lead`, `enquiry_error`, `contact_click`, `whatsapp_click`). Send Claude the `G-…` ID. It starts with consent denied (cookieless pings); a consent banner is needed before collecting full analytics from UK/EU visitors.

## 6. Rollback

- **Fastest:** Cloudflare dashboard → **Workers & Pages → artilier-website → Deployments** → choose the deployment before the merge → **Rollback**. Instant; no Git change.
- **Then (or instead):** GitHub → PR #11 → **Revert** → merge the revert PR, so `main` matches what is live. Cloudflare redeploys automatically.
- This PR changes no DNS, email, form or account settings, so either route is a complete rollback.

## 7. First 72 hours after deploy

- [ ] Formspree: submissions arriving; spam filtering on
- [ ] Search Console (once verified): sitemap processed; no "Not found (404)" or "Page with redirect" for sitemap URLs
- [ ] Cloudflare Web Analytics receiving data (once enabled)
- [ ] Start the enquiry log (`SEO_MEASUREMENT_FRAMEWORK.md` §4)
