# ARTILIER — commercial SEO site architecture

Date: 10 Oct 2026 · Basis: `SEO_GROWTH_BASELINE.md`, `SEO_COMPETITOR_AND_KEYWORD_RESEARCH.md`

## 1. Verdict on the current structure

The site already covers the professional buying journey better than most competitors researched: a trade hub, bespoke development, hospitality, three construction categories, 21 design pages, materials, process, craft, about, contact, four market pages and a French page — all generated from one set of templates, all indexable and in the sitemap.

What it lacks is not more commercial pages but three kinds of **evidence**:

1. **Proof** — no projects or case studies (the single biggest gap in every market).
2. **Specifier answers** — almost no informational content (started on the branch with one guide).
3. **Language depth for France** — one French page inside an English site.

The architecture recommendation is therefore: **keep the commercial set, deepen it, add a small guide section and a projects section as evidence arrives, and grow French only when French replies are confirmed.** No city pages, no "for architects" duplicate of the trade page, no keyword-variant landing pages.

## 2. Page decisions

| Page | Decision | Why |
|---|---|---|
| Homepage | Keep | Owns "bespoke rugs for interior designers"; links to every commercial page |
| `/bespoke/` | Improve | Add a link to each guide as published; add a "what we need to quote" block once file formats are confirmed |
| `/trade/` | Improve | Add the trade-programme vocabulary used in UK/US ("trade programme", "to the trade"), sample logistics once confirmed |
| `/collection/` + 3 categories | Keep; deepen categories | Add one specifier paragraph per construction when per-design data arrives (yarn, sizes made, pile) |
| 21 design pages | Keep; improve with data | Per-design materials and sizes are the only honest way to make them less templated (OWNER §E) |
| `/materials/` | Keep | Later: one honest note per fibre (care, traffic) once owner confirms |
| `/process/` · `/craft/` | Keep | Process = our stages; guide = what the specifier prepares (no overlap) |
| `/hospitality/` | Improve (P1 when evidence exists) | Make the feature-rug scope explicit; add a rug-schedule brief; add case studies; publish documentation only once it exists |
| `/about/` · `/contact/` | Keep | — |
| `/collaborations/` | Keep | Supports UK "credited to both names" angle |
| Market pages (UAE, KSA, UK, US) | Keep, strengthen | Already distinct (2–10 % phrase overlap). Add Gulf-specific sections (majlis/villa scale; Riyadh), no city spin-offs |
| `/fr/` | Improved on branch | Next step depends on whether the studio can reply in French |
| `/projects/` | Keep noindex until the first project | Indexes itself automatically when `content/projects.json` has a published project |
| **New:** `/guides/` section | Create one guide at a time | Only where a guide answers a real specifier question better than the current results |
| **Rejected:** "bespoke rugs for architects", "custom rugs for interior designers" as separate pages | Do not create | Same intent as `/trade/` and `/` — would cannibalise |
| **Rejected:** Dubai / Riyadh / Jeddah / London / NY / Dallas / Houston city pages | Do not create | Thin duplicates by city name; US/UK city SERPs reward local presence ARTILIER does not have |
| **Rejected for now:** "custom hotel carpets" page | Fold into `/hospitality/` | Broadloom is not the product; a separate page would promise what isn't offered |
| **Rejected for now:** Arabic pages | Defer | Only if Arabic queries appear in Search Console and Arabic replies are possible |

## 3. Recommended URLs (new or materially changed)

### 3.1 `/guides/briefing-a-bespoke-rug/` — **built on branch**
- **Audience:** interior designers, architects, hospitality designers before a first brief
- **Primary intent:** informational → commercial ("how to specify / brief a custom rug")
- **Primary theme:** how to brief a bespoke rug · **Secondary:** what to send for a custom rug; rug strike-off; custom rug lead time; custom rug from CAD or artwork
- **Title:** How to Brief a Bespoke Rug: Files, Sizes, Sampling | Artilier · **H1:** How to brief a bespoke rug.
- **Purpose:** the cornerstone guide; every later guide links back to it
- **Internal links:** out → bespoke, process, materials, three categories, trade, hospitality, contact `?type=bespoke`; in ← footer (sitewide), `/bespoke/`, all four market pages
- **Evidence:** only published process facts and owner-confirmed terms. Owner review requested before merge. Studio photographs (a strike-off beside its finished rug; an annotated plan) would make it substantially stronger
- **Priority:** P1 · **Effort:** done · **Dependencies:** owner review

### 3.2 `/guides/rug-strike-off/` — what a strike-off is and how to approve one
- **Audience:** specifiers new to bespoke rugs; procurement teams
- **Intent:** informational ("what is a rug strike off") — results are polluted by the company-law meaning and the rug pages are thin (observed)
- **Theme:** rug strike-off · **Secondary:** custom rug sample, strike-off size, colour trials, yarn poms
- **Title:** What Is a Rug Strike-Off? Sampling a Bespoke Rug | Artilier · **H1:** The rug strike-off.
- **Internal links:** ← briefing guide, `/process/`, `/bespoke/`, design pages' "Sampling" fact; → contact `?type=bespoke`
- **Evidence required:** 3–5 photographs of real strike-offs (and, ideally, one beside the finished rug); the studio's revision practice; typical strike-off sizes if they can be stated
- **Priority:** P2 · **Effort:** medium · **Dependencies:** owner photos + facts (OWNER §H)

### 3.3 `/guides/artwork-and-cad-files-for-custom-rugs/`
- **Audience:** designers and artists sending files
- **Intent:** "custom rug from CAD drawing" — no informational page found in results (observed)
- **Theme:** preparing artwork and CAD files for a custom rug · **Secondary:** colour separation, scale, vector vs scan
- **Title:** Artwork and CAD Files for a Custom Rug | Artilier · **H1:** From drawing to rug.
- **Links:** ← briefing guide, `/bespoke/`, `/collaborations/`; → contact
- **Evidence required:** accepted file formats; how colour separation is handled; one before/after (artwork → rug) with permission
- **Priority:** P2 · **Effort:** medium · **Dependencies:** owner facts (OWNER §H)

### 3.4 `/hospitality/` — restructure (existing URL)
- **Audience:** hospitality interior designers; hotel group design/procurement
- **Intent:** commercial ("custom hotel rugs", "bespoke rugs for hotels", "contract rugs")
- **Recommended title (unchanged):** Custom Hotel Rugs & Contract Rugs for Hospitality | Artilier
- **Add:** (a) a plain scope statement — hand-made area and feature rugs for lobbies, suites, restaurants, ballrooms, majlis and branded residences, specified alongside the project's broadloom *(owner to confirm that broadloom is out of scope)*; (b) a downloadable rug-schedule template; (c) case studies when they exist; (d) documentation that can be supplied today (OWNER §C)
- **Priority:** P1 for (a)+(b) once confirmed; (c)/(d) as evidence arrives · **Effort:** low–medium

### 3.5 `/projects/<slug>/` — case-study template
- **Audience:** every buyer type; hospitality most of all
- **Intent:** proof; also ranks for "<hotel/project> rugs" and supports hospitality queries (observed pattern: Brintons, Ulster, Tai Ping)
- **Template fields:** project, location (city level), designer credited (with permission), rooms, construction, sizes, yarn, photographs, the brief in one paragraph, what was sampled
- **Title pattern:** `<Project> — Bespoke <Construction> Rugs | Artilier` · **H1:** `<Project>`
- **Links:** ← `/projects/`, `/hospitality/`, the market page for its country, each design used; → contact
- **Priority:** P1 the moment one project is permissioned · **Effort:** low (generator exists for `/projects/`; detail template ~half a day) · **Dependencies:** OWNER §F

### 3.6 `/fr/hotellerie/` — French hospitality page
- **Audience:** French hospitality interior architects (prescripteurs)
- **Intent:** "tapis pour hôtel de luxe", "tapis sur mesure hôtellerie" (fragmented results, observed)
- **Title:** Tapis sur mesure pour l'hôtellerie de luxe | Artilier · **H1:** Des tapis pour l'hôtellerie.
- **Hreflang:** add an `en`↔`fr` pair with `/hospitality/` only if the French page is a genuine equivalent
- **Priority:** P2 · **Dependencies:** confirmation that enquiries can be answered in French (OWNER §B)

### 3.7 Market-page sections (existing URLs)
- `/trade/uae/`: add a "Villas and majlis" section about large-room scale (no size claims until the owner confirms maximum widths), and a short hospitality feature-rug paragraph
- `/trade/saudi-arabia/`: add a "Riyadh" section (residences, palaces, hospitality pipeline described in general terms); no Vision 2030 claims about ARTILIER involvement
- `/trade/uk/`: sample logistics paragraph once confirmed (how strike-offs reach London)
- `/trade/us/`: one paragraph on contract hospitality briefs; US import note only if the owner confirms how DDP is handled
- **Priority:** P2 · **Effort:** low each

## 4. Internal linking model

```
Home ─┬─ Trade hub ── Market pages (UAE · KSA · UK · US · FR)
      ├─ Bespoke ──── Guides (briefing → strike-off → files)
      ├─ Hospitality ─ Projects (case studies)
      └─ Collection ── Categories ── Designs (rotating related links)
Footer (sitewide): categories, studio pages, trade + markets, briefing guide
```

Rules: every guide links to one commercial page as its conversion target; every case study links to the designs and construction it used; market pages link to each other, to hospitality and to the briefing guide; no page links to a URL that redirects (enforced by `tools/check.py`).

## 5. Technical guard-rails for new pages

- Build every new page in the generators (`tools/build3.mjs` pattern `shell({...})`), never by hand-editing output.
- Add the URL to the sitemap list in `build3.mjs`; the build refuses a sitemap URL that is missing or noindexed.
- Run `python3 tools/check.py` — it fails on broken links, duplicate titles/descriptions, missing alt text, invalid JSON-LD or any named manufacturing location.
- Dark-section content: lists and `.mats` grids are styled for dark grounds; `.proc` steps for light grounds.
