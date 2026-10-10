# Launch checklist — PR #11 (released 10 Oct 2026)

PR #11 · `seo/growth-engine-p1` → `main` · merged by the owner on 10 Oct 2026, 22:50 IST (merge commit `b5814bd`, head `ae27880`). Follow-up: PR #12 removed the last homepage size claim (see §2 B).

Rule: a box is ticked only with evidence (a screenshot, an email received, a dashboard showing data). Nothing on an external account (Cloudflare, Google, Bing, Formspree) has been changed by Claude.

Earlier releases: PR #5 (contact page, analytics code, market and French pages) and PRs #6–#9 (positioning, Bing tag, working and commercial terms). Their history is in `SEO_IMPLEMENTATION_LOG.md` and `PR_REVIEW_REPORT.md`.

## 1. How this site deploys

- Hosting: a **Cloudflare Worker with static assets** (`wrangler.jsonc`: `assets.directory = "."`, `not_found_handling = "404-page"`). Files listed in `.assetsignore` (tools, planning documents) are not published.
- **Every push to `main` deploys production automatically** (Cloudflare Workers Builds). Merging a PR is the deploy.
- Every push to a PR branch builds a **preview** and posts its links on the PR (comment by *cloudflare-workers-and-pages[bot]*). The **Branch Preview URL** always shows the latest commit on the branch: `https://seo-growth-engine-p1-artilier-website.ankit-vijaivargia.workers.dev`
- There is no build step on Cloudflare: the HTML in the repo is what is served. Pages are generated locally from `tools/build*.mjs` and committed (see `README.md`).

## 2. Release status

### A. Completed and verified
- [x] PR #11 merged into `main` by the owner (merge commit `b5814bd`; tree identical to reviewed head `ae27880`). `main` has no branch protection; no review was required
- [x] Cloudflare production build for `b5814bd` — *Workers Builds: artilier-website* **success** (build `8044164b`, 17:21 UTC)
- [x] Pre-merge checks at `ae27880`: build reproducible; `check.py` 43 pages / 41 indexable / 41 in sitemap; 1,343 internal links, 0 broken; 11 URLs × 360/390/768/1440 px with 0 JS errors and 0 overflow (local headless Chromium)
- [x] Live content read back from artilier.co after deploy (web fetch): sitemap lists **41** URLs including `/guides/briefing-a-bespoke-rug/`; `robots.txt` allows all and references the sitemap; `pages.css?v=3` serves the new rules; canonical and `og:url` correct on `/`, `/contact/`, `/about/`, `/trade/`, `/hospitality/`, `/craft/`, `/collection/`, `/fr/`, the guide; `/fr/` shows French navigation, footer and terms with `og:locale fr_FR`; `/404.html` shows the branded page with `noindex,follow`; `/about` (no slash) resolves to the About page; header "Start a project" links directly to `/contact/`; no town names, certifications, clients or projects found on the pages checked

### B. Completed but not independently verified
- [ ] **PR #12 on production** — the homepage "Values" strip said "Any *dimension*" (split by markup, missed by earlier scans). PR #12 replaces it with "Made to *size*" (sized to the project, within what the design and construction allow) and adds a `check.py` guard covering visible text, meta tags, titles and JSON-LD, including phrases split by markup. Verified in the repository; production read-back recorded in the PR #12 release report
- [ ] **HTTP status codes and console errors on production.** The workspace cannot reach artilier.co directly and no browser was available, so pages were read by a fetch tool that does not report status codes, redirect hops or console output. A nonexistent URL returned a client error (consistent with 404, code not visible)
- [ ] **Stylesheet reference on live pages.** `pages.css?v=3` itself is served; that every live page references `v=3` was verified in the repository, not in production HTML
- [ ] **Enquiry form on production.** Logic tested 31/31 against a mocked endpoint; no real submission was made

### C. Pending owner action
- [ ] **Live enquiry test** — §4 below (only you can confirm the email arrives at studio@artilier.co)
- [ ] **Status-code check** in a browser — Chrome DevTools → Network: an unknown URL returns 404; `/about` returns one 301 to `/about/`
- [ ] **Search Console** and **Cloudflare Web Analytics** — §5 below; neither is configured
- [ ] Guide items still open in `OWNER_INPUT_REQUIRED.md` (revision practice, file formats, maximum widths)

### D. Future improvements (separate PRs)
- WCAG AA contrast — pre-existing failures: muted grey text `--tx-3` (3.3–3.7:1), footer bottom line (3.3:1), the rust "Start a project" band on `/collection/` (3.5–4.2:1), form-field underlines (1.7:1), focus outline on the rust band. The site is **not** AA-compliant overall
- The 21 design pages are templated and thin (14–24% unique phrasing) — need a short design note per piece
- `og:locale` missing on `/collaborations/` and `/collection/` (still absent in production)
- Legacy `/collection/design.html` (noindex, unlinked) links to `index.html`, which redirects


## 3. Before merging (done for PR #11)

Kept for the next release: open the Branch Preview URL, check the changed pages on a laptop and a phone, read new copy in full, then tell Claude "approved to merge".

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
