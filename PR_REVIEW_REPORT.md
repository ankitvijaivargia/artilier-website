# PR #5 — review report

Reviewed: 10 Oct 2026, commit `18c49a4` (first round) → fixes in the follow-up commit on the same branch.
PR state at review: open, mergeable, no human reviews; **Cloudflare "Workers Builds: artilier-website" check passed** and a branch preview was deployed (`seo-global-visibility-implementation-artilier-website.ankit-vijaivargia.workers.dev`). Production (`main`) unchanged.

How it was reviewed: all three generators re-run (output identical to the committed HTML — the build is reproducible); `tools/check.py`; headless Chromium at 320, 390, 768 and 1440 px across 22 URLs with the site's real fonts (Jost, Cormorant Garamond) loaded locally; form, pre-fill and analytics tests with the form endpoint intercepted. The live site and the preview could not be reached from this workspace (network policy; Chrome extension not connected), so Cloudflare-runtime behaviour is listed as "awaiting live verification".

## Findings

| # | Finding | Severity | Evidence | Status |
| --- | --- | --- | --- | --- |
| 1 | **Contact form broken when reached from Hospitality, market, bespoke or category buttons.** `?type=` pre-fill called `.options` on a radio button, threw, and stopped the script before the submit handler was attached. The browser then submitted the form natively by GET — enquiry not delivered, and name/email/message placed in the URL | **Blocker** | Repro: `/contact/?type=hospitality` → `TypeError: sec.options is not iterable`, sector stayed "residential" | **Fixed**: submit handler attached first; pre-fill wrapped and rewritten for radio groups; both forms now have `method="post"` + Formspree `action`, so even with JavaScript off they POST, never GET. Re-tested: hospitality/bespoke/design pre-fill correct, one POST, success state |
| 2 | Header overflowed on narrow phones (CTA cut off): 50 px at 320 px, 10 px at 360 px, 7 px at 390 px. Pre-existing on `main` | Medium | Measured with real fonts | **Fixed** in `pages.css`: ≤ 440 px the Menu control shows its ≡ mark only (accessible name "Menu" kept), gaps tighten, and the "Start a project" button wraps onto two lines rather than being cut if the phone enlarges text (Samsung/Android text scaling); header CTA hidden ≤ 340 px (menu and sticky bar still carry it). Re-tested at 320/360/384/393/412/440/768/1440 px × text scale 1.0/1.15/1.3: 0 overflow, menu opens; desktop/tablet unchanged |
| 3 | Design-page schema used `artMedium` on `CreativeWork` (not a valid property there) | Low | schema.org definitions | **Fixed**: `VisualArtwork` with `artform: Rug`, `artMedium: <construction>` |
| 4 | Market pages shared an identical FAQ block — 18–27% five-word-phrase overlap between UAE/KSA/UK/US | Medium (doorway risk) | Jaccard on 5-word shingles | **Fixed**: market-specific questions; overlap now 2–10% |
| 5 | Design pages had no design-specific facts beyond one paragraph | Medium | 21 pages, `palette` empty in data | **Improved**: `pattern` and `palette` added to `content/designs.json`, restated strictly from each design's existing studio description, shown as "Pattern" and "Colours shown — re-colourable"; no materials, sizes or ratings added |
| 6 | Talab and Ghata descriptions are near-identical ("ivory and gold medallion") | Low | `content/designs.json` | **Owner input** — distinct descriptions needed (OWNER_INPUT_REQUIRED.md) |
| 7 | Hero films fail on a server without byte-range support and fall back to a blob fetch | Info | Local server only | Not a defect on Cloudflare (supports ranges); check on preview |
| 8 | `sitemap.xml` `lastmod` is the build date for every URL | Info | All pages were regenerated in this release, so currently accurate | Keep; revisit if only some pages change |
| 9 | No hreflang on `/fr/` | Info (by design) | No English page has equivalent content | Correct; add hreflang only if a true FR↔EN pair is created |
| 10 | Analytics: personal data | — | Test enquiry with name, email, message, dimensions, city → `dataLayer` held only `event, page_path, form_id, enquiry_type` | **Pass** |
| 11 | Duplicate lead events | — | Double-click → 1 POST, 1 `generate_lead`; 2 `mailto:` clicks → 1 `contact_click` | **Pass** |
| 12 | Canonicals, noindex, sitemap, internal links | — | `check.py`: 42 pages, 40 indexable, 40 in sitemap, 0 broken / redirecting / `index.html` links, all titles ≤ 65, descriptions ≤ 160 and unique, one H1, one Organization per page, alt on every image, no manufacturing location named | **Pass** |
| 13 | JavaScript errors / horizontal scroll | — | 22 URLs × 4 widths: 0 errors, 0 horizontal scroll | **Pass** |
| 14 | Cloudflare config | — | `_redirects` targets all exist; `not_found_handling: "404-page"` with root `404.html`; `.assetsignore` now also excludes `tools/` and the planning documents | Pass locally; **awaiting live verification** on preview |

## Merge readiness

**Recommendation: safe to merge once (a) you have looked at the preview, and (b) you are ready to send one real test enquiry within 15 minutes of the deploy.** No code blocker remains. Nothing in this PR publishes unverified business claims; missing facts are omitted, not guessed.

Not a merge blocker but should follow soon: Search Console setup, Cloudflare Web Analytics, and the owner facts in `OWNER_INPUT_REQUIRED.md`.

Do not merge if the preview shows: the contact form not reaching studio@artilier.co, `/about` or `/contact` not resolving, or the 404 page not appearing for an unknown URL.
