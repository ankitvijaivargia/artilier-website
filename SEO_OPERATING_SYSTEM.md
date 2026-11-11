# ARTILIER — SEO operating system

_Created 14 Oct 2026 (audit branch `seo/audit-2026-10`). This is the hub: read it first, update it after every review. The other SEO files hold detail and history and are linked from here — nothing here duplicates them._

Evidence labels used below: **Measured** (a tool returned it, with date), **Verified** (checked on the live site or in code), **Owner** (stated by Ankit), **Estimate**, **Unknown**.

---

## 1. Where things are

| Need | File / place |
|---|---|
| This hub: inventory, keyword map, issue tracker, routines | `SEO_OPERATING_SYSTEM.md` |
| Weekly automated report (crawl, Lighthouse, deployed-vs-repo) | GitHub issue **"SEO monitor — weekly live-site reports"** (label `seo-monitor`), written by `.github/workflows/seo-monitor.yml` every Monday 08:00 IST; run it any time from Actions → *SEO monitor* → *Run workflow* |
| Live-site checker (also runs locally) | `tools/seo_monitor.py` |
| Build-time checks (must print OK before any merge) | `tools/check.py`, `tools/release_check.sh` |
| Change history and test evidence | `SEO_IMPLEMENTATION_LOG.md` |
| Metrics, enquiry log template, GA4 set-up | `SEO_MEASUREMENT_FRAMEWORK.md` |
| Keyword evidence (Keyword Planner ranges, autocomplete, SERPs) | claude.ai project docs `ARTILIER_stage3_market_evidence_2026-10-11.csv`, `ARTILIER_keyword_master_2026-10-11.csv`, `ARTILIER_stage8_*` |
| Content backlog | `SEO_EDITORIAL_ROADMAP.md` |
| Backlink / PR opportunities | `SEO_AUTHORITY_BUILDING_PLAN.md` |
| Questions only the owner can answer | `OWNER_INPUT_REQUIRED.md` |

## 2. Data access (what can be checked, by whom)

| Source | Free? | Status 14 Oct 2026 | Checked by |
|---|---|---|---|
| Live crawl: status codes, canonicals, sitemap, robots, titles, descriptions, H1, JSON-LD, hreflang, internal links, orphans | Yes | **Automated** weekly (GitHub Actions, public repo) | Workflow |
| Lighthouse lab (mobile emulation) on 6 key URLs | Yes (open source, runs on the GitHub runner) | **Automated** weekly. Lab numbers vary ±15 points run to run — read trends, not single runs | Workflow |
| Deployed = `main`? | Yes | **Automated** (compares live HTML with the repo, ignoring the edge-injected Cloudflare beacon) | Workflow |
| PageSpeed Insights API | Free, but the keyless quota is shared and was exhausted on 14 Oct | Not used; Lighthouse CLI replaces it. A free API key (owner) would add CrUX field data | — |
| Google Search Console `sc-domain:artilier.co` | Yes | Verified; owned by ankit.vijaivargia@gmail.com. **No API/connector access from Claude** — read in the owner's browser | Manual, monthly |
| GA4 `G-8TXE25YJ86` (property 558437246) | Yes | Live code sends data (consent-gated for UK/EEA/CH). `generate_lead` is a key event (starred 15 Oct); Search Console linked (11 Oct) | Manual, monthly |
| Cloudflare Web Analytics | Yes | Active (auto-injected beacon confirmed on every live page, 14 Oct) | Manual, monthly |
| Bing Webmaster Tools | Yes | Verification tag live; import status Unknown | Manual, monthly |
| Google Keyword Planner | Yes (Art Avenue Ads account, ranges only) | Used 11 Oct; ranges in project CSVs | Manual, quarterly |
| Google Trends | Yes | Used 11 Oct | Manual, quarterly |
| Semrush / Ahrefs connectors | No (no API units / "insufficient plan") | Not used — do not top up without a decision | — |

## 3. Master inventory (verified 14 Oct 2026)

Deployment: the live site at artilier.co is byte-identical to `main` @ `72d14d1` on all 51 crawlable pages, apart from Cloudflare's injected analytics beacon (**Verified**, monitor run on 14 Oct). So everything below marked "in code" on `main` is also live.

### A. Completed and verified on the live site
| Item | Evidence |
|---|---|
| 51 HTML pages return 200; 49 indexable; sitemap lists exactly those 49; no broken internal links; no redirecting internal links; all canonicals self-referencing, absolute, https, 200 | Monitor run 14 Oct (issue #28) |
| robots.txt allows all and points to the sitemap; unknown URLs return 404 with the branded page | Monitor run 14 Oct |
| Unique titles and meta descriptions on every indexable page; titles ≤ 65 characters; descriptions ≤ 160 | Monitor + `check.py` |
| One H1 per page; valid JSON-LD on every page (Organization on all; Service, VisualArtwork, CollectionPage, Article, ContactPage, AboutPage, BreadcrumbList as appropriate) | `check.py`, monitor |
| `/fr/` and `/fr/broderie/` in French (`lang="fr"`); no hreflang by design (no English page is a translation of either) | Code, `SEO_IMPLEMENTATION_LOG.md` T-18 |
| Every image has alt text (manifest: 86/86 entries) | Manifest check 14 Oct |
| Contact page and enquiry form; test enquiry delivered to studio@artilier.co | Owner, 10 Oct |
| GA4 with regional consent, Cloudflare Web Analytics, Bing tag | Live code; Cloudflare beacon seen on every page |
| No manufacturing location named anywhere | `check.py` discretion rule |
| Search Console Domain property verified; Manual actions "No issues detected" | Owner's browser, 10 Oct |

### B. Implemented in code, not yet verifiable without an account or time
| Item | What would verify it |
|---|---|
| ~~`generate_lead` starred as a key event~~ — done 15 Oct (event had fired in the previous 28 days) | — |
| ~~Sitemap re-read by Google (49 URLs)~~ — confirmed 15 Oct: Success, 49 discovered, last read 11 Oct | — |
| `/guides/briefing-a-bespoke-rug/` indexed (requested 10 Oct) | URL Inspection |
| Embroidery, headboards, fabrics, hospitality pages indexed (released 11 Oct) | URL Inspection |

### C. Partially complete
| Item | Gap |
|---|---|
| Design pages (21) | ~450 words, mostly shared template; yarn, size and pile data missing; Talab and Ghata descriptions near-identical (owner data, `OWNER_INPUT_REQUIRED.md` §E) |
| Image discoverability | Design and category pages ship real `<img>`; homepage and embroidery photographs render client-side. Image sitemap added on this branch (187 images) |
| Measurement | Sources exist; no enquiry log yet; no Search Console–GA4 link |
| Performance | See issue tracker T-01…T-03 |

### D. Planned, not implemented
Strike-off guide, CAD/artwork guide and the rest of `SEO_EDITORIAL_ROADMAP.md`; directory listings and PR in `SEO_AUTHORITY_BUILDING_PLAN.md` (none exist yet); LinkedIn company page in `sameAs`; French enquiry form (depends on French replies); project case studies (`/projects/` stays noindex until real projects exist).

### E. Implemented but ineffective so far
| Item | Evidence |
|---|---|
| Organic search as an enquiry channel | 3 months to 10 Oct: 2 clicks, 129 impressions, avg position 7.6, mostly brand misspellings; one non-brand query (3 impressions) (**Measured**, GSC). Not enough to judge pages released 10–11 Oct |
| Brand search | "artilier" is read as a misspelling of "atelier"; a general web search for "artilier rugs" on 14 Oct did not return artilier.co (**Measured**, non-Google engine — indicative only) |
| Mobile speed on the homepage | Lighthouse 60–65, LCP ≈ 6 s, 8.7 MB transferred (**Measured**, lab, 14 Oct) |

### F. Blocked
See `OWNER_INPUT_REQUIRED.md` §M (short list) and §E, §H.

## 4. Keyword-to-page map

Volumes are Google Keyword Planner **ranges** (Sept 2025–Aug 2026, read 11 Oct 2026) by country. India excluded by policy. "—" = no data returned (not zero).

| Cluster | Main terms (AE · SA · GB · US) | Page that owns it | Intent / value | Action |
|---|---|---|---|---|
| Bespoke rugs | bespoke rugs (10–100 · 10–100 · 100–1k · 100–1k); custom made rugs (10–100 · 10–100 · 100–1k · 100–1k) | `/bespoke/` | Mixed consumer/trade; high value when trade | Keep. Add photographs and a worked example (owner material) — the page has no images today |
| Custom rugs (head term) | custom rugs (100–1k · 10–100 · 1k–10k · 10k–100k); custom size rugs (US 1k–10k) | `/bespoke/`, category pages | Mostly consumer/retail; SERP owned by retailers | Do not chase head term; win long-tail trade variants |
| Trade / for designers & architects | custom rugs for interior designers, …for architects, bespoke rug supplier | `/trade/`, `/collaborations/` | Highest intent | No Keyword Planner data (too low) — target anyway; this is the enquiry query class |
| Construction | hand knotted rugs (10–100 · 10–100 · 100–1k · 10k–100k) | `/collection/hand-knotted/` etc. | Mostly consumer shopping | Supporting only |
| Gulf rugs | custom carpet dubai (AE 100–1k); custom rugs dubai (AE 10–100); rugs/carpets dubai (AE 1k–10k, retail) | `/trade/uae/` (title already "Bespoke Rugs & Carpets…") | "carpet" is the Gulf word | Keep "carpets" in UAE/Saudi copy; no new city pages |
| Hospitality | hotel rugs, luxury hotel carpets (10–100 everywhere) | `/hospitality/` | Contract; needs documentation the studio does not hold | Keep cautious; no compliance claims |
| Embroidered wall panels | embroidered wall panels (10–100 all four) | `/embroidery/` | Low volume, few specialists ranking | Own it — realistic page-one candidate |
| Embroidered headboards | embroidered headboards (10–100 · 10–100 · 10–100 · 100–1k) | `/embroidery/headboards/` | Commercial; US is the real demand | Internal links raised from 6 on 3 pages to 12 on 8 pages (PR `seo/week2-images-links`) |
| Embroidery for interiors (trade) | bespoke embroidery studio (10–100 all four) | `/embroidery/` + market pages | Fashion-dominated SERP | Supporting |
| Embroidered wall art / wallpaper | wall art US 1k–10k; wallpaper GB/US 100–1k | — | Consumer / different product | Do not target |
| French | tapis sur mesure (FR 1k–10k), tapis personnalisés (FR 1k–10k), broderie sur mesure (FR 100–1k), brodeur d'art (FR 100–1k) | `/fr/`, `/fr/broderie/` | Consumer-leaning head terms | Keep; French copy changes only with a French reviewer |
| Arabic | سجاد فاخر, تفصيل سجاد (SA 100–1k) | — | Real Saudi demand | Blocked: no Arabic reviewer (owner) |

New pages are not needed for any cluster above. The gaps are proof (photographs, projects), depth on existing pages and authority.

## 5. Technical issue tracker

| ID | Issue | Evidence | Severity | Status |
|---|---|---|---|---|
| T-01 | Text LCP delayed by late web-font load on every page (render delay 1.3–5.4 s; LCP element is body copy) | Lighthouse 14 Oct: `/bespoke/` 1.8–5.4 s, `/trade/uae/` 3.1–5.0 s | P1 | **Fixed** (#29, merged 15 Oct). Production 15 Oct: text pages LCP 1.9–2.3 s |
| T-02 | Layout shift 0.14–0.24 on `/contact/`, `/embroidery/`, `/trade/uae/`, design pages (font swap) | Lighthouse 14 Oct | P1 | **Fixed**: preloads (#29) + metric-matched fallback fonts (#30). Production 15 Oct: CLS 0 on all six monitored pages |
| T-03 | Homepage: 8.7 MB transferred, TBT 420–600 ms, LCP ≈ 6 s (lab) | Lighthouse 14 Oct | P1 | **Needs decision**: films on mobile (see owner list). Not changed — the films are part of the brand |
| T-04 | Six render-blocking stylesheets per page | Lighthouse | P3 | Leave; combining CSS changes the build and gains little after T-01 |
| T-05 | Homepage and embroidery photographs exist only after JavaScript runs | Static HTML: homepage 36 media slots, 0 `<img>` | P2 | Image sitemap live (#29). Pre-rendering `<img>` on the hand-maintained homepage is the remaining step |
| T-06 | Images up to 680 KB, no responsive `srcset` | Image audit 14 Oct (25 of 64 photos > 300 KB) | P2 | **Fix in PR** `seo/week2-images-links`: 480/800/1200 variants + `srcset`/`sizes`; category pages 3.7 MB → 1.0 MB (lab) |
| T-07 | Media filenames are codes (`ct12.webp`) | Manifest | P3 | Leave: renaming breaks caches and links; alt text and image sitemap carry the meaning |
| T-08 | Last three commits on `main` (13 Oct) went in without a PR or `release_check.sh` (privacy date "12 October 2026") | Git history | P2 process | Keep using PRs; run the gate before each release |

## 6. Indexing and sitemap checklist (monthly, Search Console)
1. Sitemaps → `sitemap.xml` status Success; discovered URLs = 49 (and images listed).
2. Pages → indexed count, and reasons for "Crawled – not indexed" / "Discovered – not indexed". Record both numbers in §8.
3. URL Inspection, in order, for any of these not yet indexed: `/embroidery/`, `/embroidery/headboards/`, `/embroidery/fabrics/`, `/hospitality/`, `/guides/briefing-a-bespoke-rug/`, `/trade/uk/`, `/trade/us/`, `/embroidery/uae/`.
4. Manual actions and Security issues: none.
5. Bing: Sitemaps and Site Explorer counts.

## 7. Priority pages (report these every month)
`/`, `/bespoke/`, `/trade/`, `/embroidery/`, `/embroidery/headboards/`, `/hospitality/`, `/trade/uae/`, `/fr/`. For each: impressions, clicks, CTR, average position (GSC, last 28 days, excluding India), top 5 queries, organic landings and enquiries (GA4 `generate_lead` by landing page; Formspree `landing_page`).

## 8. Monthly baseline record (fill from Search Console; never estimate)

| Month | Clicks | Impressions | Non-brand clicks | Indexed pages | Organic enquiries | Qualified | Notes |
|---|---|---|---|---|---|---|---|
| to 10 Oct 2026 (3 mo) | 2 | 129 | 0 | 5 (report dated 4 Oct) | Unknown | Unknown | Pre-launch of most pages |
| 15 Oct 2026 (indexing only) | — | — | — | 5 indexed; 35 not (21 discovered-not-indexed, 12 crawled-not-indexed, 2 redirects — report dated 9 Oct) | — | — | Read in owner's browser; pre-dates the 10–11 Oct releases |
| Nov 2026 | | | | | | | first 28-day review after the 10–11 Oct releases |

## 9. Routines

**Weekly (automated, Monday 08:00 IST):** the workflow posts a report to the SEO monitor issue. Read the first lines only: errors must be 0, "identical … 51/51" (or the new page count), Lighthouse trend. Any ERROR → fix in a PR that week.

**Monthly (≈30 min, first Monday):** §6 checklist; §7 priority pages; §8 row; Formspree export → enquiry log; move items between §3 categories; pick next month's three tasks.

**Quarterly:** refresh Keyword Planner ranges for the clusters in §4; review `SEO_AUTHORITY_BUILDING_PLAN.md` statuses; decide whether any market has earned more investment (evidence: impressions and enquiries from that country).

**Every release:** `node tools/build.mjs && node tools/build2.mjs && node tools/build3.mjs && python3 tools/check.py` → OK; `bash tools/release_check.sh`; merge via PR; then run the monitor workflow and confirm "identical" and 0 errors.

## 10. Rules that do not change
No location pages for more cities; no invented projects, clients, testimonials, certificates or capacities; no manufacturing towns; no strike-off fee or payment terms on the site; French and Arabic copy only with a human reviewer; India excluded from targeting.
