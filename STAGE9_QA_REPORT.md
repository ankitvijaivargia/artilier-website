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

---

# Stage 10 re-verification (11 Oct 2026, evening)

The tests were re-run on the current branch heads. Nothing above is assumed to still hold.

## State found before changes
- main is still at de67881. No commits landed after Stage 9.
- PRs #21–#24 are open drafts. Each local branch matched its remote.
- All three builds and check.py passed on every branch.
- **Defect:** PR #23 had committed `tools/__pycache__/claims.cpython-313.pyc`. It changed on every check run, leaving the working tree dirty. It is now untracked and ignored.

## Live-site evidence (read from the owner's browser session)

| Check | Result |
|---|---|
| Cloudflare beacon | Exactly 1 on the live homepage, auto-injected. No Google tag. analytics.js?v=2 (live version) |
| Cloudflare, last 7 days (bots excluded) | 58 visits. India 44, US 9, Taiwan 4, Canada 1. Direct 53, google.com 3, Instagram 1, chatgpt.com 1. Paths: / 51, /embroidery/ 3. **Mostly owner and testing traffic; not a demand baseline** |
| Search Console, 3 months (data 67.5 h old) | 2 clicks · 134 impressions · CTR 1.5% · average position 7.4. Queries are almost all brand spellings (artilier, artilie, artelier, artileir). One non-brand query: "can i create a custom rug from cad drawings?" (3 impressions, position 2.3) |
| GA4 | ankit.vijaivargia@gmail.com sees only "Art Avenue" (192533552 / 266121129). studio@artilier.co has no Analytics account (lands on "Start measuring"). **Nothing created** |
| Formspree delivery | **Verified.** One labelled test enquiry was sent from live /contact/?type=embroidery&utm_*=… using studio@artilier.co as sender. It arrived in the studio@artilier.co inbox at 19:47 IST with every field: page, landing_page, referrer, utm_source/medium/campaign. Dashboard not inspected (signed out) |
| dataLayer on that submission | `form_start` ×1, `generate_lead` ×1. Parameters: page_path, form_id, enquiry_type. No name, email or brief text |
| HTTP (live) | 200 on /, /embroidery/, /hospitality/, /contact/, /process/, /fr/broderie/, /trade/uae/, sitemap.xml, robots.txt. Slashless URLs and /index.html redirect to the canonical URL. /projects/ 200 + noindex,follow. Unknown URL 404 + noindex. /embroidery/headboards/ and /fabrics/ 404 (not deployed yet, as expected) |
| www host | www.artilier.co **serves the page directly** (canonical → https://artilier.co/) instead of redirecting. Owner action: add a Cloudflare redirect rule from www to the apex (301). It cannot be done in `_redirects` (path-only) |

## Defects found and fixed in Stage 10
1. **Form pre-fill (found by the live test):** an embroidery enquiry arrived as "Bespoke rug from my own artwork". Now `?type=embroidery|headboard|fabric` sets the sector, the product option, "Hand embroidery" and `cta_type`, and `?type=hospitality` sets "Several rugs for one project". Verified in headless Chromium for 5 types, with Formspree requests blocked during the test (PR #22).
2. Headboard and fabric CTAs now use `?type=headboard` and `?type=fabric` (PR #22).
3. Keyword ownership: the missing phrases were added in natural sentences — bespoke/hotel headboards, embroidered headboard panels, embroidered upholstery/curtain fabric, custom embroidered fabric, hotel rugs (PR #22).
4. New "How visible are the joins?" FAQ: joins are discreet, with no guarantee (PR #22).
5. Python cache file untracked; projects override key renamed to `projectsIndexVisibility` (PR #23).

## Re-run results on stage9/pr4-qa (contains PR #21 to #23)
- Builds: 3/3 exit 0. check.py: OK — 51 pages, 49 sitemap URLs, 0 orphans, 0 claim blocks, 2 claim warnings (both /fr/broderie/, held for review). Claim self-test 20/20.
- /projects/ rule:
  - 1 project → noindex
  - 2 projects → indexable
  - 2 projects + "noindex" override → noindex
  - 1 project + "index" override → indexable
  - 0 projects + "index" override → still noindex
- Headless Chromium at 390 px and 1366 px on 9 pages: no horizontal overflow, no JS errors.
- The `cta_click` event on the headboard CTA carries only the label and zone.
- Shared 5-word phrases: 3–11% between the four core pages; 25–31% between embroidery market pages (common FAQ block); 12–22% between rug market pages.
- Images: no `<img>` without alt. The homepage still renders 36 media slots by JavaScript with no server-rendered `<img>` (D6, outstanding).
