# ARTILIER — SEO implementation log

Branch: `seo/global-visibility-implementation` (from `main` @ `12f0d5c`, 7 Sept 2026)
Baseline: *ARTILIER — Global SEO & International Visibility Audit*, 10 Oct 2026
Status: **implemented in code and tested locally. Not deployed.** Nothing here is live until the pull request is merged into `main`.

Evidence labels: **Verified** (checked in code or a test run), **Local lab** (measured on a local server, not production), **Pending** (needs the owner, an account, or Google).

---

## 1. Repository audit (before changes)

| Item | Finding |
| --- | --- |
| Branch / tree | `main`, clean, in sync with `origin/main`; no uncommitted work to preserve |
| Production | Cloudflare Worker with static assets (`wrangler.jsonc`), auto-deploy on push to `main`. README described Cloudflare Pages — corrected |
| Page generation | Design, category and commercial pages are **generated** by `tools/build.mjs` and `tools/build2.mjs`. The generators had drifted from the live HTML (Collaborations links were hand-added later). All changes were made in the generators so a re-run cannot undo them |
| Hand-maintained pages | `index.html`, `collaborations/index.html`, `collection/index.html` (shell) |
| Already fixed since the audit | `www` → apex and `http` → `https` redirects already worked (verified in Chrome on 10 Oct); `/index.html` already 301s to `/` (the problem was the extra hop, not a duplicate) |
| Audit false positive | "Flat weave" / "Hand- knotted" H1s: the markup renders as one word (`Flat<span>weave</span>`); no change needed |
| Exposure found | `tools/` was being deployed publicly — now excluded in `.assetsignore` |

## 2. Audit issue register → implementation

| Audit item | Status | What changed | Files | Test |
| --- | --- | --- | --- | --- |
| T-01 Search Console not verified | **Pending (owner)** | Steps in §6 | — | — |
| T-02 No analytics | **Done in code, pending activation** | `analytics.js`: Cloudflare Web Analytics loader (cookieless), optional GA4 with Consent Mode v2 defaulting to denied, `dataLayer` events. IDs empty until the owner supplies them | `assets/js/analytics.js`, every page head | Events verified in browser test (§4) |
| T-03 Enquiries not tracked | **Done** | `generate_lead` fires once per accepted submission; `contact_click` / `whatsapp_click` on link clicks, de-duplicated within 4 s; no names, emails, phone numbers or message text are sent. Each enquiry email now carries landing page, referrer and UTM values (session storage, no cookies) | `assets/js/enquiry.js`, `assets/js/analytics.js` | §4 |
| T-04 Bing not verified | **Pending (owner)** | Steps in §6 | — | — |
| T-05 Google shows 5 of 32 URLs | **Code side done; indexing pending Google** | Sitemap rebuilt (40 canonical, indexable, existing URLs — the build fails if any is missing or noindexed); homepage now links directly to the three category pages, Trade, Hospitality and every market page; every design page links to all categories; 0 redirecting internal links | `tools/build3.mjs`, `sitemap.xml`, `index.html` | `tools/check.py` OK |
| T-06 380 links to `index.html` | **Done** | 0 remaining across 42 pages | all generated pages, `index.html` | `check.py` fails on any `index.html` link |
| T-07 No Contact page | **Done** | `/contact/` with sector choice, validation, honeypot, success/error states; every "Start a project" / "Enquire" CTA points to it; design pages pre-fill the design (`?design=`), hospitality and market CTAs pre-select the sector (`?type=`) | `contact/`, generators | §4 |
| T-08 Homepage title / kicker | **Done** | Title *Bespoke Rugs for Interior Designers \| Artilier, New Delhi*; audit description; kicker "Bespoke rugs for interior designers — New Delhi"; headline unchanged | `index.html` | View source |
| T-09 Inconsistent Organization | **Done** | One shared Organization (`#organization`) on every page incl. homepage, collection hub, collaborations: logo, slogan, `parentOrganization` Art Avenue Pvt. Ltd., `contactPoint`. LinkedIn not added to `sameAs` (no page exists yet) | `tools/build.mjs`, `tools/build3.mjs` | `check.py` asserts exactly one Organization per page |
| T-10 No hospitality page | **Done** | `/hospitality/` — only verified capabilities; no ratings, MOQs or lead times | `hospitality/` | — |
| T-11 No About page | **Done** | `/about/` — studio, people, Artilier / Art Avenue relationship, `AboutPage` + `Person` schema | `about/` | — |
| T-12 Working terms on Bespoke / Trade | **Partly done** | Bespoke: "Sampling and timing" section + inline CTA using confirmed process facts only. Trade: "Who we work with" + "Working internationally" with links to hospitality and markets. **Minimums, lead-time ranges and shipping terms not published — awaiting owner facts (§5)** | `tools/build2.mjs` | — |
| T-13 Long meta descriptions | **Done** | All 42 pages ≤ 160 characters, all unique | generators | `check.py` |
| T-14 Thin design template | **Improved, limited by data** | Complete (never truncated) descriptions; titles *Name — Custom Hand-Tufted Rug, Any Size*; specification block (construction, yarn options for the construction, size, colourway, sampling, lead-time policy); construction section; per-design social image; links to all categories. Unique copy per design is still one paragraph — see §5 for the data needed | `tools/build.mjs`, `tools/og.py`, `assets/og/` | — |
| T-15 Category pages lack H2s | **Done** | "When to specify …" and "Yarn, colour and specification" sections | `tools/build.mjs` | — |
| T-16/T-17 Market pages | **Done** | `/trade/uae/`, `/trade/saudi-arabia/`, `/trade/uk/`, `/trade/us/` — each with market-specific terminology, typical briefs, time-zone and working-week facts, brief checklist, FAQs. No delivery terms, duties or local presence claimed | `tools/build3.mjs` | — |
| T-18 French page | **Done** | `/fr/` in native French, `lang="fr"`, `og:locale fr_FR`; explicitly framed as luxury interior rugs (not car mats or doormats). **No hreflang**: there is no English page with equivalent content, so a pair would be incorrect | `fr/` | — |
| T-19 Hero performance | **Done (local lab)** | Hero poster preloaded; hero films start after the page has loaded; on data-saver, 2G/3G connections or reduced-motion they are not downloaded at all | `index.html`, `assets/js/slots.js` | §4 |
| T-20 Legacy template | **Done** | `/collection/design.html` stays `noindex`, out of the sitemap, unlinked | — | `check.py` |
| T-21 Spam backlinks | **Process documented** | No disavow file created (§7) | — | — |
| 404 page | **Done** | Branded `404.html`, `noindex`, root-absolute links; `wrangler.jsonc` `not_found_handling: "404-page"` | `404.html`, `wrangler.jsonc` | Renders locally; production check after deploy |
| `/about`, `/contact`, `/projects` redirects | **Done** | Now go to the real pages instead of homepage anchors | `_redirects` | — |
| Projects page | **Framework only** | `/projects/` renders `content/projects.json`; while empty it is `noindex,follow` and kept out of the sitemap — it indexes itself automatically once the first real project is added | `tools/build3.mjs` | — |

Not changed, deliberately: Google Fonts loading (moving to `media=print` swaps or self-hosting changes first-paint typography; measure in PageSpeed first). The mobile header "Start a project" button overflows at 390 px — **pre-existing on `main`**, not introduced here; worth a separate design fix.

## 3. Files changed

| File | Why |
| --- | --- |
| `tools/build.mjs` | Shared head (lang, locale, OG image, analytics), new nav/footer, Organization schema, design + category templates |
| `tools/build2.mjs` | Bespoke/Trade/Materials/Process/Craft metadata and new sections; contact CTAs; sitemap moved out |
| `tools/build3.mjs` (new) | New pages, shell sync for hand-maintained pages, homepage footer/schema, validated sitemap |
| `tools/og.py` (new) | 1200×630 social images cropped from each design's real photograph |
| `tools/check.py` (new) | Automated checks (links, metadata, schema, sitemap, discretion) |
| `assets/js/analytics.js`, `assets/js/enquiry.js` (new) | Measurement and enquiry handling |
| `assets/js/slots.js` | Film loading deferred / skipped on slow connections |
| `assets/css/pages.css` (new) | Components for new pages; five-column footer |
| `assets/og/*.jpg` (new, 21) | Per-design social previews |
| `index.html` | Metadata, nav to real pages, direct category links, form wiring, preload, shared footer |
| `collaborations/index.html`, `collection/index.html` | Shared shell, schema, descriptions |
| Generated pages (33) | Regenerated |
| `contact/`, `about/`, `projects/`, `hospitality/`, `trade/uae/`, `trade/saudi-arabia/`, `trade/uk/`, `trade/us/`, `fr/`, `404.html` | New |
| `_redirects`, `_headers`, `wrangler.jsonc`, `.assetsignore`, `README.md`, `sitemap.xml` | Routing, caching for `/assets/og/`, 404 handling, deploy exclusions, docs |

## 4. Tests run (10 Oct 2026)

| Test | Result |
| --- | --- |
| `python3 tools/check.py` | **OK** — 42 pages, 40 indexable, 40 in sitemap; 0 broken links, 0 `index.html` links, 0 duplicate titles/descriptions, all descriptions ≤ 160, one H1 per page, valid JSON-LD with one Organization per page, every image has alt text, no manufacturing location named |
| Browser test (Chromium, 390 px and 1440 px, 17 page types) | 0 JavaScript errors; no horizontal scroll on any tested page |
| Contact form | Validation message on empty submit; double-click sends **one** POST; honeypot and attribution fields present in the POST; success message only after a 200; error path shows the email fallback; `?design=reth` pre-fills the form |
| Homepage form | Posts through the shared handler; success state correct |
| Events | One `generate_lead` per submission (`form_id`, `enquiry_type`, `page_path` only); two `mailto:` clicks → one `contact_click` |
| Homepage mobile load, **local lab** (local server, 1.6 Mbps, 150 ms, 4× CPU, 3 runs each) | LCP **2.16–2.20 s on `main` → 1.11–1.12 s on this branch**. Indicative only: no CDN, Google Fonts unreachable in the test environment. Not a Core Web Vitals measurement |
| Form delivery | The endpoint is the one the live homepage already uses; delivery to studio@artilier.co **must be confirmed with one real test submission after deploy** |
| PageSpeed Insights / Rich Results Test | **Not run** — needs the deployed URL |

## 5. Business information needed from the owner

1. **Working terms** for Trade / Bespoke / Hospitality: minimum order (if any), typical lead-time ranges per construction, sample and strike-off cost and timing, Incoterms or delivery basis, currencies quoted.
2. **WhatsApp**: a verified ARTILIER business number. None is published; the click tracking is ready for when one is added.
3. **Language**: can the studio reply in French? If yes, `/fr/` can say so and an `/fr/contact/` page becomes worthwhile.
4. **Market facts** to strengthen the market pages: whether samples ship to the UAE/KSA (and on what terms), any local partners, and confirmation that the UAE/KSA working-week notes suit how you work.
5. **Hospitality specification**: which fire, wear or cleaning standards you can document today. The page asks clients to state requirements; it promises nothing.
6. **Per-design data** (for `content/designs.json`): yarn/material, palette, sizes already made, any reference size. Each field filled adds unique, true content to that design page automatically.
7. **Projects**: photographs + designer permission for any completed work → `content/projects.json`, and `/projects/` becomes indexable.
8. **Profiles**: a LinkedIn company page URL (to add to `sameAs`).
9. **Analytics IDs**: Cloudflare Web Analytics token (optional), GA4 measurement ID if wanted (see §6 on consent).
10. **Backlinks**: confirm no link-building service was ever paid for artilier.co (§7).

## 6. External setup (owner steps)

**Google Search Console**
1. search.google.com/search-console → Add property → **Domain** → `artilier.co`.
2. Copy the TXT record; in Cloudflare → DNS → add TXT on `@` → Verify.
3. Sitemaps → submit `https://artilier.co/sitemap.xml`.
4. URL Inspection → Request indexing for, in order: `/`, `/trade/`, `/bespoke/`, `/hospitality/`, `/collection/`, the three category pages, `/trade/uae/`, `/trade/saudi-arabia/`, `/fr/`, `/contact/` (daily quota applies; the rest follow via the sitemap).
5. Check Security & Manual actions → Manual actions = "No issues detected".

**Bing Webmaster Tools** — bing.com/webmasters → Import from Google Search Console → confirm sitemap.

**Cloudflare Web Analytics** (recommended, cookieless) — Cloudflare dashboard → Analytics & Logs → Web Analytics → add site `artilier.co` → enable automatic setup. Alternatively paste the token into `CF_BEACON_TOKEN` in `assets/js/analytics.js`. Note: Cloudflare Web Analytics counts page views and referrers but **does not record custom events**; enquiries are counted from the Formspree log, where each submission now includes landing page and referrer.

**GA4 (optional)** — only if event reporting is needed. Set `GA4_ID`. GA4 starts in Consent Mode with storage denied (cookieless pings). Before granting analytics storage to UK/EU visitors, a consent banner is required (UK PECR / EU ePrivacy, French CNIL guidance). Without one, leave storage denied.

**Formspree** — confirm the form `myklqvgp` delivers to studio@artilier.co, enable its spam filtering, and send one live test after deploy.

**After deploy** — PageSpeed Insights (mobile + desktop) on `/`, `/contact/`, `/collection/reth/`; Rich Results Test on `/`, `/hospitality/`, `/collection/reth/`; `curl -I https://artilier.co/does-not-exist` should return 404 with the branded page.

## 7. Backlink review (no automatic disavow)

Semrush (10 Oct 2026): 232 backlinks from 143 domains; 206 use link-farm anchors ("high quality dofollow backlinks DA 50…"); Authority Score 2.
1. Confirm nothing was purchased. If not, take no action — Google states its systems ignore spammy links.
2. Check Search Console → Manual actions monthly.
3. Only if a manual action appears: export the linking domains, review each, disavow at domain level, document the file in this repo, and file a reconsideration request.
4. Build genuine authority instead: COVER magazine pitch, BIID Industry Partner, SpecifiedBy listing, Downtown Design Dubai visit (4–8 Nov 2026), designer-client supplier credits. **None of these listings exist yet.**

## 8. URL indexation checklist

Tick after deploy: Inspected in GSC · Indexed · Shows in `site:`

| URL | Inspected | Indexed | In `site:` |
| --- | --- | --- | --- |
| `/` | [ ] | [ ] | [ ] |
| `/collection/` | [ ] | [ ] | [ ] |
| `/collection/hand-knotted/` | [ ] | [ ] | [ ] |
| `/collection/hand-tufted/` | [ ] | [ ] | [ ] |
| `/collection/flatweave/` | [ ] | [ ] | [ ] |
| `/bespoke/` | [ ] | [ ] | [ ] |
| `/hospitality/` | [ ] | [ ] | [ ] |
| `/trade/` | [ ] | [ ] | [ ] |
| `/collaborations/` | [ ] | [ ] | [ ] |
| `/contact/` | [ ] | [ ] | [ ] |
| `/about/` | [ ] | [ ] | [ ] |
| `/trade/uae/` | [ ] | [ ] | [ ] |
| `/trade/saudi-arabia/` | [ ] | [ ] | [ ] |
| `/trade/uk/` | [ ] | [ ] | [ ] |
| `/trade/us/` | [ ] | [ ] | [ ] |
| `/fr/` | [ ] | [ ] | [ ] |
| `/materials/` | [ ] | [ ] | [ ] |
| `/process/` | [ ] | [ ] | [ ] |
| `/craft/` | [ ] | [ ] | [ ] |
| `/collection/chhaya/` | [ ] | [ ] | [ ] |
| `/collection/shakti/` | [ ] | [ ] | [ ] |
| `/collection/girah/` | [ ] | [ ] | [ ] |
| `/collection/dua/` | [ ] | [ ] | [ ] |
| `/collection/parat/` | [ ] | [ ] | [ ] |
| `/collection/anhad/` | [ ] | [ ] | [ ] |
| `/collection/silai/` | [ ] | [ ] | [ ] |
| `/collection/nazm/` | [ ] | [ ] | [ ] |
| `/collection/uchaan/` | [ ] | [ ] | [ ] |
| `/collection/talab/` | [ ] | [ ] | [ ] |
| `/collection/rooh/` | [ ] | [ ] | [ ] |
| `/collection/bhanwar/` | [ ] | [ ] | [ ] |
| `/collection/zameen/` | [ ] | [ ] | [ ] |
| `/collection/ojas/` | [ ] | [ ] | [ ] |
| `/collection/mehr/` | [ ] | [ ] | [ ] |
| `/collection/ghata/` | [ ] | [ ] | [ ] |
| `/collection/seedha/` | [ ] | [ ] | [ ] |
| `/collection/vartul/` | [ ] | [ ] | [ ] |
| `/collection/rekha/` | [ ] | [ ] | [ ] |
| `/collection/kalp/` | [ ] | [ ] | [ ] |
| `/collection/reth/` | [ ] | [ ] | [ ] |

## 9. Safe deployment checklist

1. Review the pull request diff and preview the new pages.
2. Supply or confirm items in §5 that you want live on day one (the pages are honest without them).
3. Merge into `main` (this triggers the Cloudflare deploy).
4. Within 15 minutes: open `/`, `/contact/`, `/hospitality/`, `/fr/`, a design page and a nonsense URL; send one real enquiry and confirm it arrives at studio@artilier.co.
5. Confirm `/about`, `/contact`, `/projects` resolve to the new pages and old anchors still work.
6. Run the §6 Search Console and Bing steps; submit the sitemap.
7. Rollback if needed: revert the merge commit on `main` — the previous site redeploys.

## 10. 30-day roadmap

| Days | Action | Owner |
| --- | --- | --- |
| 1–3 | Merge, verify deploy, live test enquiry; GSC + Bing verification, sitemap, priority URL inspections | Ankit |
| 1–3 | Enable Cloudflare Web Analytics | Ankit |
| 3–7 | PageSpeed + Rich Results on live pages; fix anything measured | Claude |
| 4–10 | Supply working terms, per-design data, LinkedIn URL → regenerate pages | Ankit → Claude |
| 7–14 | BIID Industry Partner application; SpecifiedBy listing; COVER magazine pitch | Ankit |
| 14 | First GSC check: indexed count vs 40, countries, queries | Claude |
| 20–30 | Downtown Design Dubai (4–8 Nov) visit with samples; first project photography → `/projects/` | Ankit |
| 30 | Review: indexation, impressions by country, enquiries with attribution; decide next market page depth and first journal guide | Both |

## 11. Code changes vs outcomes that need the outside world

| Done in code (verifiable now) | Needs Google, accounts or time |
| --- | --- |
| New pages, metadata, schema, internal links, sitemap, redirects, 404 | Indexation of the 27 missing URLs |
| Event and attribution logic | Analytics data (needs activation + traffic) |
| Form with honeypot and states | Confirmed delivery from production |
| Faster first paint (local lab) | Core Web Vitals from real users |
| Market and French pages | Rankings, impressions, enquiries from those markets |
| Organization entity | Brand recognition for "artilier"; external listings and links |
