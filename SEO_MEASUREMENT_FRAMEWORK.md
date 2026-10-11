# ARTILIER — SEO measurement framework

Date: 10 Oct 2026 · set-up status re-checked 11 Oct 2026 (Stage 9, PR1)

## 1. Principle

Organic search is measured by the enquiries it produces, not by traffic. Nothing is reported as improved until there is a recorded baseline for the same metric, and code changes are never reported as search performance.

## 2. Data sources and set-up status

| Source | Measures | Status | Owner action |
|---|---|---|---|
| Google Search Console (Domain property) | Impressions, clicks, queries, average position, pages, countries, devices, index coverage | **Verified** — `sc-domain:artilier.co` accessible (confirmed before 11 Oct) | Submit `sitemap.xml` again after each page release; add studio@artilier.co as a user |
| Bing Webmaster Tools | Same for Bing (and partly Copilot/ChatGPT search surfaces) | Tag live (PR #7); import from GSC | Import from GSC |
| Cloudflare Web Analytics | Page views, referrers, countries, landing pages — cookieless | **Active** via dashboard automatic injection (checked 11 Oct 2026 in the Cloudflare dashboard: site tag `05417b7a…`, data flowing). `CF_BEACON_TOKEN` in `analytics.js` deliberately left empty — adding it would double-count | None |
| GA4 (optional) | Events: `form_start`, `generate_lead`, `enquiry_error`, `contact_click`, `whatsapp_click`, `cta_click` (new in PR1: label of the button and nav/body/footer zone) — no personal data | **Not collecting.** Only GA4 property found is "Art Avenue" (266121129, account 192533552) with **no web data stream**; no ARTILIER property exists. `GA4_ID` stays empty | Owner decision: create a separate **ARTILIER** GA4 property + web stream for artilier.co (do not reuse the Art Avenue retail property), then send the `G-` ID. Consent banner needed before granting storage for UK/EU visitors; until then Consent Mode stays denied |
| Formspree | Every enquiry, with sector, landing page, referrer, UTM; from PR #11 also `cta_page` (the page whose button led to the form) and `design_reference` | Form `myklqvgp` exists. **Dashboard not inspected 11 Oct** (browser session closed); delivery to studio@artilier.co not yet evidenced | Owner: send one test enquiry from /contact/ and confirm it arrives with the hidden fields; export submissions since launch |
| Enquiry log (new) | Qualification of every enquiry | **To create** — a simple sheet | Fill within 48 h of each enquiry (template §4) |
| Semrush / Ahrefs | Volumes, rank tracking, backlinks | Semrush out of API units; Ahrefs plan insufficient | Optional: top up Semrush units for a 25-keyword tracking project |

## 3. Metrics

### Search (from GSC, once verified)
- Indexed pages vs 41 in the sitemap (branch) — target: all indexable pages "Indexed" or with an explained reason
- Impressions and clicks, **split branded vs non-branded**
  - Branded filter (regex on query): `artilier|artillier|artilier\.co` — note "artilier" is often treated as a typo of "atelier"; review the "atelier" queries manually and do not count them as branded
- Non-branded impressions by page group: commercial (home, bespoke, trade, hospitality, categories), market pages, French, guides, designs
- Countries: AE, SA, FR, GB, US (+ IN as a control — Indian traffic is mostly not the target buyer)
- Average position for the keyword-to-URL map in `SEO_COMPETITOR_AND_KEYWORD_RESEARCH.md` §5 — as a trend, never as a single number

### Site (from Cloudflare Web Analytics)
- Organic landing pages and their entry counts by country
- Contact-page visits from organic landings (path analysis is limited without GA4 — use Formspree landing-page field instead)

### Enquiries (Formspree + log — the metrics that matter)
- Total enquiries; **qualified trade enquiries** (see definition); hospitality enquiries; bespoke-artwork enquiries
- Source split: organic search / Instagram / direct / referral / outreach reply
- Conversion: qualified enquiries ÷ organic sessions (monthly, once both exist)
- Enquiry → quote → order (the commercial outcome)

**Qualified trade enquiry** = from a design practice, architect, hospitality team, developer or procurement firm; describes a project (rooms, sizes or a design); and is in a priority market or of commercial size. Consumer and supplier-solicitation enquiries are logged but not counted.

**Trade vs consumer traffic:** search data cannot separate them directly. Use (a) query wording (trade, designer, architect, hotel, contract, bespoke, sur mesure, prescripteur = trade signal; price, buy, near me, cheap = consumer signal), (b) the enquiry sector field, and (c) the "Studio or company" field.

## 4. Enquiry log template

| Date | Name / studio | Country | Sector (form) | Qualified? (Y/N + reason) | Landing page | Referrer / UTM | Source (organic, Instagram, outreach, referral, direct) | Project type | Next step | Quote? | Order? |
|---|---|---|---|---|---|---|---|---|---|---|---|

## 5. Change log (to correlate changes with outcomes)

| Date | Change | URLs | Deployed? | Indexing requested? |
|---|---|---|---|---|
| 10 Oct 2026 | PR #5–#9 live (contact page, market pages, French page, working terms) | 40 URLs | Yes | Pending GSC |
| 10 Oct 2026 | PR #11 live (merge `b5814bd`): French localisation, UAE/UK terms, briefing guide, related-design links, contrast fixes, size wording | `/fr/`, `/trade/uae/`, `/trade/uk/`, `/guides/briefing-a-bespoke-rug/`, 21 designs | Yes | Guide: requested and accepted 10 Oct (not yet confirmed indexed) |
| 10 Oct 2026 | PR #12 live (merge `9bae30d`): homepage "Made to size"; size-claim check | `/` | Yes | Not needed (`/` already indexed) |
| 10 Oct 2026 | Sitemap resubmitted in Search Console | `sitemap.xml` (41 URLs) | — | Accepted; 41-URL discovery not yet confirmed |

Add earned mentions here too (date, publication, URL, followed link Y/N).

## 6. Baselines (to record before claiming improvement)

| Metric | Baseline value | Date captured |
|---|---|---|
| Indexed pages | URL Inspection: 11 key pages on Google (`/`, `/bespoke/`, `/trade/`, `/trade/uae/`, `/trade/saudi-arabia/`, `/hospitality/`, `/fr/`, `/collection/` and 3 category pages); guide not yet. Pages report (stale, 4 Oct): 5 indexed / 29 not | 10 Oct 2026 |
| Search Console, last 3 months | 2 clicks · 129 impressions · 1.6% CTR · avg position 7.6 — predominantly brand-misspelling queries; 1 non-branded query (3 impressions); AE and SA not in top 20 countries. Not a usable market baseline | 10 Oct 2026 (data ~42 h old) |
| Cloudflare Web Analytics, last 7 days | 45 visits · 67 page views · India 29, US 9, Taiwan 4, Saudi Arabia 2, Canada 1 · direct 39, chatgpt.com 3, google.com 2, Instagram 1 — **includes testing visits**, not a clean business baseline | 10 Oct 2026 |
| Non-branded impressions (28 days) | *capture at the ~7 Nov review* | |
| Organic clicks (28 days) | *capture at the ~7 Nov review* | |
| Enquiries since launch | *owner to export from Formspree* | |
| Qualified trade enquiries since launch | *owner* | |
| Referring domains (non-spam) | Semrush 10 Oct: 143 domains total, mostly link-farm anchors | 10 Oct 2026 |

## 7. Reporting cadence

| Cadence | What | Who | Output |
|---|---|---|---|
| **Weekly — technical (10 min)** | `check.py` on any change; GSC Page indexing errors; Cloudflare 404s/5xx; Formspree test submission monthly | Claude (with access) / Ankit | One line in the change log |
| **Weekly — indexation (first 8 weeks after GSC)** | Indexed count vs sitemap; "Discovered/Crawled – not indexed" URLs; request indexing for priority pages (daily quota) | Ankit (GSC access) → Claude reviews screenshots or export | Short note: which URLs moved |
| **Monthly — keywords and landing pages** | GSC queries (non-branded), by country and page group; position trends for the keyword map; new queries worth a page section | Claude | 1-page review in this repo |
| **Monthly — enquiry quality** | Enquiry log: count, qualified, source, landing page, country; which pages produce qualified trade enquiries | Ankit + Claude | Decision: which page to strengthen next |
| **Quarterly — content and competitors** | Re-check the opportunity ranking; re-run competitor SERPs per market; retire or merge guides that attract nothing | Claude | Updated research + roadmap |

## 8. What we will not report

Rankings from a single search, traffic without a baseline, impressions as success, or "SEO leads" that were actually outreach replies. If a number cannot be traced to GSC, Cloudflare, Formspree or the enquiry log, it is not reported.

## 9. Stage 9 measurement-first checklist (11 Oct 2026)

| # | Item | Status | Evidence / next step |
|---|---|---|---|
| 1 | Cloudflare Web Analytics page views | Active | Dashboard, 11 Oct |
| 2 | No duplicate beacon | Done | Token left empty in code (PR1) |
| 3 | GA4 events | Code ready, not collecting | Needs ARTILIER property + stream (owner) |
| 4 | `cta_click` event for enquiry buttons | Added (PR1) | Label + zone only; verified no personal data in parameters |
| 5 | Formspree delivery | Unverified | Owner test enquiry |
| 6 | Search Console | Verified property | Resubmit sitemap after PR2/PR3 merge |
| 7 | Enquiry log sheet | Not created | Template §4 |

Nothing in this table is a performance claim; it only records whether each source can produce data.
