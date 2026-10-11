# Stage 9 — QA report (PRs #21–#24)

Date: 11 Oct 2026 · Branch tested: `stage9/pr4-qa`, which contains PR1–PR3.

Status is **Not run** unless evidence is cited. Nothing here is deployed, and nothing here claims anything about the live site after merge.

## Builds and automated checks

| Check | Method | Result |
|---|---|---|
| Builds | `node tools/build.mjs && node tools/build2.mjs && node tools/build3.mjs` | All exit 0 |
| Site checks | `python3 tools/check.py` | OK: 51 pages, 49 indexable, 49 in sitemap |
| Claim rules R-01–R-10 | `python3 tools/claims.py` (also run by check.py) | 0 BLOCK. 2 WARN, both on /fr/broderie/ ("posés bord à bord", universal strike-off), held for the French reviewer (C-07) |
| Claim rule self-test | 20 sentences, one pass and one fail per rule | 20/20 |
| Orphan check (new in PR4) | Every sitemap URL needs at least one internal inbound link | 0 orphans. /embroidery/headboards/ and /embroidery/fabrics/ are each linked from 50 pages (footer plus body links) |

## Stage 5 §12 checklist

| Check | Method | Status |
|---|---|---|
| HTTP 200 per new or changed URL | curl | **Not run.** The sandbox proxy returns 403 for artilier.co. Run after deploy |
| Redirect chains ≤ 1 hop | curl -IL | **Not run** (same reason). _redirects is unchanged |
| Self-referencing canonical | check.py (canonical == URL on every indexable page) | Pass |
| Robots | check.py and source | New pages indexable. /projects/ is `noindex,follow` (0 projects). Threshold simulated with 1 and 2 projects: pass |
| Sitemap | build3 assertion plus check.py | 49 URLs, including /embroidery/headboards/ and /embroidery/fabrics/. Excludes /projects/. `lastmod` and `priority` removed (PR4) |
| Internal links, no 404s | check.py link resolver | Pass (0 broken) |
| Titles ≤ 60, metas ≤ 160, unique | check.py plus script | New and changed pages: embroidery 50/147, headboards 57/150, fabrics 50/145, hospitality 46/152. No duplicates |
| One H1 | check.py | Pass |
| Alt text and server-rendered img | check.py | No img without alt. **Open (D6):** the homepage still relies on media-slot elements, with no noscript fallback |
| Mobile | Headless Chromium at 390 px and 1366 px on /, /contact/, /projects/, /process/, /embroidery/, /embroidery/headboards/, /embroidery/fabrics/, /embroidery/uae/, /hospitality/ | No horizontal overflow and no JS errors. The only failure is external font loading in the sandbox |
| Form submission and delivery | Test enquiry | **Not run.** Not submitted, to avoid sending a test lead from the sandbox. Owner to send one after merge |
| Analytics events | Browser devtools | `cta_click` regex unit-checked. GA4 is not configured, so events reach dataLayer only. **DebugView not run** |
| Search Console | GSC | Domain property accessible (earlier session). Sitemap resubmission and URL Inspection only after deploy |
| Copy: certification, town and client names | claims R-07, R-10 plus read | Pass |
| Copy: supply-only | claims R-01 plus read | Pass (English). French held |
| Copy: 8 ft × 4 ft only with board | claims R-02 | Pass |
| Copy: lead time per product | claims R-04, R-05 plus read | Pass. Rugs 6–12 weeks, panels and headboards 3–4 months, fabric 6–8 weeks (fabric page and /hospitality/ only) |
| Copy: MOQ wording | claims R-09 plus read | Pass |

## Open technical items (not fixed in these PRs)

- **D6** — server-rendered images or a noscript fallback on the homepage.
- **D1** — project schema fields (seoTitle, per-image alt and rights flags, construction). Do this before the first case study.
- **D7** — contact form: dedicated `headboard` and `fabric` sector values, a country select, and an optional panel-construction field. The CTAs use `?type=embroidery` for now.
- **R1** — HSTS. Set it at the Cloudflare zone, not in `_headers`. Owner decision.
- **R6** — hreflang between /fr/broderie/ and /embroidery/ only once the French page matches the English facts.
- Main navigation link to the new pages (owner decision). They are reachable from the footer, /embroidery/ and /hospitality/.

## After merge (owner, with evidence)

1. Confirm that Cloudflare deployed main.
2. Run `curl -I` on the 4 new or changed URLs.
3. Resubmit sitemap.xml in GSC.
4. Use URL Inspection to request indexing for /embroidery/, /embroidery/headboards/, /embroidery/fabrics/ and /hospitality/.
5. Send one test enquiry and confirm it arrives in the Formspree dashboard and the inbox.
6. Record the Pages report at 7 and 28 days.
