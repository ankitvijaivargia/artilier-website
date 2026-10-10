# ARTILIER — SEO measurement framework

Date: 10 Oct 2026

## 1. Principle

Organic search is measured by the enquiries it produces, not by traffic. Nothing is reported as improved until there is a recorded baseline for the same metric, and code changes are never reported as search performance.

## 2. Data sources and set-up status

| Source | Measures | Status | Owner action |
|---|---|---|---|
| Google Search Console (Domain property) | Impressions, clicks, queries, average position, pages, countries, devices, index coverage | **Not confirmed** | Verify via DNS TXT in Cloudflare; submit `sitemap.xml`; add studio@artilier.co as a user |
| Bing Webmaster Tools | Same for Bing (and partly Copilot/ChatGPT search surfaces) | Tag live (PR #7); import from GSC | Import once GSC is verified |
| Cloudflare Web Analytics | Page views, referrers, countries, landing pages — cookieless | **Not active** in code (`CF_BEACON_TOKEN` empty) | Enable in Cloudflare dashboard (automatic set-up) |
| GA4 (optional) | Events (`generate_lead`, `contact_click`, `whatsapp_click`) | Code ready, `GA4_ID` empty | Only if event reports are needed; consent banner required before granting storage for UK/EU visitors |
| Formspree | Every enquiry, with sector, landing page, referrer, UTM | Live | Confirm delivery; export monthly |
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
| *(on merge)* | P1 branch: French localisation, UAE/UK terms, briefing guide, related-design links, dark-list fix | `/fr/`, `/trade/uae/`, `/trade/uk/`, `/guides/briefing-a-bespoke-rug/`, 21 designs | No | — |

Add earned mentions here too (date, publication, URL, followed link Y/N).

## 6. Baselines (to record before claiming improvement)

| Metric | Baseline value | Date captured |
|---|---|---|
| Indexed pages | *unknown — capture at GSC verification* | |
| Non-branded impressions (28 days) | *unknown* | |
| Organic clicks (28 days) | *unknown* | |
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
