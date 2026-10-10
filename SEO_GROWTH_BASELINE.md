# ARTILIER — SEO growth baseline

Date: 10 Oct 2026 · Repo `main` @ `bc49aec` · Work branch `seo/growth-engine-p1`

Labels used throughout: **Verified** (checked in code, a build run or the live site) · **Observed** (seen in search results or third-party pages, not measured) · **Unknown** (no data source available) · **Owner** (needs Ankit).

This baseline builds on the 10 Oct audit and PRs #5–#9, which are merged and live. It does not repeat that work; see `SEO_IMPLEMENTATION_LOG.md` for what was already done.

---

## 1. Data availability

| Source | Status | Consequence |
|---|---|---|
| Google Search Console | **Not connected to this workspace; verification status unknown.** Bing Webmaster verification tag is live (PR #7) | No indexation, impressions, clicks, queries or positions are known. Every indexation statement below is *observed*, not *verified* |
| Analytics | **Not active.** `assets/js/analytics.js` has `CF_BEACON_TOKEN = ''` and `GA4_ID = ''` (Verified). Unless Cloudflare Web Analytics was switched on in the dashboard (auto-inject), no traffic is being recorded | No baseline traffic, landing-page or country data exists |
| Enquiry records | Formspree `myklqvgp`; each submission carries landing page, referrer and UTM (Verified in code). Delivery to studio@artilier.co confirmed? **Owner** | Enquiries are the only conversion record available today |
| Semrush | Connected but **no API units** remaining | No measured volumes, difficulty, rankings or backlink data this session |
| Ahrefs | Connected but **"Insufficient plan"** for every endpoint tried (incl. free DR) | Same |
| Live-site HTTP from workspace | Blocked by network allowlist; live pages read via WebFetch | Status codes inferred from content, not headers |
| Earlier measured data | Semrush, 10 Oct: 232 backlinks / 143 domains, 206 with link-farm anchors, Authority Score 2. Google showed 5 of 32 URLs at audit time | Only historical figures on record |

**Branded search reality (learnings file):** "artilier" alone is read by Google as a typo of "atelier"; branded search is not a discovery channel yet.

## 2. Production state (Verified via WebFetch of artilier.co, 10 Oct)

- Live sitemap lists **40 URLs**, all `lastmod 2026-10-10`, matching `main`.
- `/hospitality/` live with owner-confirmed terms ("Usually 6–12 weeks from strike-off approval", "No minimum"), canonical correct, no WhatsApp.
- PR #10 (WhatsApp link) is **open, not merged** — consistent with the decision to publish the ARTILIER number only after its WhatsApp Business profile is set up.

## 3. Repository and build (Verified)

| Check | Result |
|---|---|
| Generators | `tools/build.mjs` (design + category pages, shared head/nav/footer), `build2.mjs` (bespoke, trade, materials, process, craft), `build3.mjs` (contact, about, projects, hospitality, markets, fr, 404, sitemap, shell sync). Build is reproducible: re-running on `main` produced no diff |
| `python3 tools/check.py` on `main` | **OK** — 42 pages, 40 indexable, 40 in sitemap; 0 broken or redirecting internal links; titles ≤ 65 and descriptions ≤ 160, unique; one H1; valid JSON-LD with one Organization; alt on every image; no manufacturing location named |
| Robots | `robots.txt` allows all, points to sitemap. Noindex only on `/404.html`, `/collection/design.html`, `/projects/` (empty) — all intentional |
| Canonicals | Self-referencing, absolute, trailing slash, on every indexable page |
| Redirects | `_redirects` normalises no-slash forms and legacy filenames; www→apex and http→https were verified live in the earlier audit |
| Structured data | Organization (with `parentOrganization` Art Avenue Pvt. Ltd.), WebSite, WebPage, BreadcrumbList, Service (market/hospitality pages), VisualArtwork (designs), AboutPage/Person |
| Open Graph | Per-page titles/descriptions; per-design 1200×630 images in `assets/og/` |
| Forms | Contact form POSTs to Formspree with honeypot and attribution fields; `?type=` and `?design=` pre-fill fixed in PR #5 |
| Analytics events | `generate_lead`, `contact_click`, `whatsapp_click` in `dataLayer`, no personal data — but no collector is configured. PR #11 adds `form_start`, `enquiry_error` and CTA-page/design context |
| Old branches | `feat/collaborations-page` (3 ahead) and `seo/phase-2-architecture` (4 ahead) are stale pre-merge branches; their content is on `main`. `content/whatsapp-link` = open PR #10 |

## 4. Defects found in this baseline

| # | Defect | Severity | Evidence | Status |
|---|---|---|---|---|
| D1 | **Bold lead-ins in dark-section lists are invisible on live pages.** `.prose li b{color:var(--tx)}` = ink `#151110` on the dark ground. Affects 24 bullet lead-ins ("Villas and private residences —", "Rug schedule —", etc.): 8 on `/trade/uae/`, 4 on `/trade/saudi-arabia/`, 7 on `/trade/uk/`, 5 on `/fr/`. (`/hospitality/` has no dark-section lists and was not affected — corrected in the release review) | **High** (conversion copy unreadable) | Computed style in headless Chromium; fixed value now `rgb(247,243,235)` | **Fixed on branch** |
| D2 | `/fr/` is a French page inside an English shell: nav, header CTA, menu and footer in English; French copy says "prix et délais sont donnés projet par projet" while every English page publishes the confirmed terms | Medium | Page source; French research | **Fixed on branch** |
| D3 | `/trade/uae/` and `/trade/uk/` do not state lead time or "no minimum" (KSA and US do) | Medium | `grep "6–12 weeks"` | **Fixed on branch** |
| D4 | Related-design links always point to the first three designs of a collection: Chhaya, Girah, Parat get 13 internal links each; 11 designs get only 2 | Medium (internal link equity, crawl depth) | Inventory script | **Fixed on branch** — every design now receives links from three siblings |
| D5 | UK page title lacks the UK trade vocabulary "to the trade" | Low | Title tag; UK research | **Fixed on branch** |
| D6 | No specifier guidance content anywhere on the site | Medium (topical authority) | Page inventory | **First guide added on branch** |
| D7 | H1s with `<br>` and no whitespace produce text such as "Made to yourdrawing,or ours." in raw text extraction | Low (Google renders `<br>` as a break) | Inventory | Not changed — cosmetic in source only |
| D8 | Talab and Ghata descriptions near-identical | Low | `content/designs.json` | **Owner** (already listed) |
| D9 | Same class of defect found in the release review: `/trade/` "From specification to site" grid was paper-coloured text on paper (19 elements); `/about/` founders' names ink on dark; `/craft/` "Where it is made" facts near-ink on dark | High (`/trade/`), Medium (others) | Contrast audit (<3:1) across 17 pages | **Fixed on branch** in shared CSS |
| — | Subagent flag "US CTA `?type=residential` contradicts trade-only" | — | `residential` is the form's *project type* ("Residential interior"), not a consumer flag | **Not a defect** |

## 5. Page inventory (generated pages, `main` + branch)

| URL | Template | Words* | Internal inlinks† | Primary target (current title) |
|---|---|---|---|---|
| `/` | hand-maintained | 2,244 | all pages | Bespoke Rugs & Interior Craft for Designers |
| `/bespoke/` | build2 | 557 | sitewide | Bespoke Rugs from Your Artwork |
| `/trade/` | build2 | 509 | sitewide | Trade Rugs for Interior Designers & Architects |
| `/hospitality/` | build3 | 547 | sitewide | Custom Hotel Rugs & Contract Rugs for Hospitality |
| `/collection/` | hand + pre-render | 547 | sitewide | Rug Collection: Hand-Knotted, Hand-Tufted & Flatweave |
| `/collection/hand-knotted/` · `hand-tufted/` · `flatweave/` | build | 290–335 | sitewide | "<Construction> Rugs — Custom Designs, Any Size" |
| 21 × `/collection/<design>/` | build | 280–318 | 2–13 before, 3–5 after the D4 fix (more even) | "<Name> — Custom <Construction> Rug, Any Size" |
| `/materials/` · `/process/` · `/craft/` | build2 | 293–386 | sitewide | Rug materials · six-stage process · handmade rugs |
| `/collaborations/` | hand | 728 | sitewide | Rug collaborations for designers, architects & artists |
| `/about/` · `/contact/` | build3 | 538 · 566 | sitewide | About · Start a Rug Project |
| `/trade/uae/` · `/saudi-arabia/` · `/uk/` · `/us/` | build3 | 423–560 | sitewide (footer) | Market trade pages |
| `/fr/` | build3 | 656 → ~790 | sitewide (footer) | Tapis sur mesure pour architectes d'intérieur |
| `/guides/briefing-a-bespoke-rug/` | build3 (new) | ~1,220 | sitewide (footer) + bespoke + markets | How to Brief a Bespoke Rug |
| `/projects/` | build3 | 152 | 0 | noindex until a real project exists |

\*Body words excluding nav/footer. †Static `href` count across the site.

## 6. Existing keyword targeting (from titles/H1s)

- Head trade terms: *bespoke rugs for interior designers* (home), *trade rugs for interior designers* (trade), *bespoke rugs from your artwork* (bespoke).
- Hospitality: *custom hotel rugs*, *contract rugs for hospitality*.
- Construction: *hand-knotted / hand-tufted / flatweave rugs, custom, any size*.
- Market: *bespoke rugs & carpets UAE interior designers*, *custom rugs & carpets Saudi Arabia*, *bespoke rugs to the trade London* (branch), *custom rugs to the trade New York & Texas*, *tapis sur mesure architectes d'intérieur*.
- No page targets informational/specifier intent except the new guide.
- No cannibalisation found: each market page carries its own market modifier; the trade hub carries none.

## 7. Known ranking data

**None.** No Search Console, rank tracker or third-party ranking data was available. The only ranking-adjacent evidence is observational (see `SEO_COMPETITOR_AND_KEYWORD_RESEARCH.md`), gathered with a US-based search engine that does not reproduce Google UAE/KSA/FR/UK/US results.

## 8. Missing information

- Search Console property and its index coverage, queries and countries (**Owner: access**)
- Any analytics (**Owner: switch on Cloudflare Web Analytics**)
- Enquiry log since launch: count, sector, landing page, referrer (**Owner: Formspree export**)
- Keyword volumes (**Semrush API units**)
- Business facts listed in `OWNER_INPUT_REQUIRED.md` (projects, per-design data, hospitality documentation, sample logistics)

## 9. Priority recommendations

1. Merge the P1 branch after review (fixes D1–D6) — the invisible list copy is a live conversion defect.
2. Connect Search Console (Domain property), submit the sitemap and request indexing for the priority URLs — without it nothing in this plan can be measured.
3. Turn on Cloudflare Web Analytics (cookieless) the same day.
4. Supply the first permissioned project (even one) — case studies are the single largest gap against every competitor set researched.
5. Decide the Downtown Design Dubai (4–8 Nov) and EquipHotel Paris (2–5 Nov) visits now; both are within four weeks.
