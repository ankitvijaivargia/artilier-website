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
| GA4 | Page views; events `form_start`, `generate_lead`, `enquiry_error`, `contact_click`, `whatsapp_click`, `cta_click` — no personal data | **Property created 11 Oct 2026; code wired in PR #21; collection NOT yet verified (needs deploy).** Account "ARTILIER" (411559802) → property "ARTILIER" (558437246, India time, INR) → web stream "ARTILIER — artilier.co" (16107045376), Measurement ID `G-8TXE25YJ86`. Created by ankit@artavenue.com; separate from Art Avenue's account 179279522 / property 340656225, which was not changed | After deploy: check Realtime; mark `generate_lead` as key event once it first appears; link Search Console (§10) |
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

## 10. GA4 configuration (11 Oct 2026)

| Item | Setting |
|---|---|
| Google account | ankit@artavenue.com (Google Workspace). The account and property were created by this user, who is Administrator. |
| Account / property / stream | ARTILIER 411559802 / ARTILIER 558437246 / "ARTILIER — artilier.co" 16107045376 |
| Measurement ID | `G-8TXE25YJ86`, set as `GA4_ID` in `assets/js/analytics.js`. It is public by design and is not a secret. |
| Hosts that report | artilier.co and www.artilier.co only. Local builds and previews send nothing. Add `?ga_debug=1` to a production URL for DebugView. |
| Page views | One `config` call per page. Cloudflare Web Analytics continues independently (auto-injected; no beacon in code). |
| Enhanced measurement | Page views, scrolls, outbound clicks, site search, video engagement and file downloads are ON. **Form interactions are OFF**, to avoid a second automatic `form_start` alongside the site's own. "Redact data → Email" is active. |
| Consent Mode v2 | UK, EEA (EU27, IS, LI, NO) and CH: `analytics_storage` denied by default, so cookieless pings only, because there is no consent banner. Other regions: analytics granted. Ads storage, user data and personalisation are denied everywhere. Google signals and ad personalisation are off. **This needs owner or legal confirmation.** |
| Data sharing (account) | "Google products and services" off. Modelling contributions, technical support and recommendations on (as Google presented them at creation). |
| Key events | Google added `close_convert_lead`, `purchase` and `qualify_lead` by default; the site sends none of them. **`generate_lead` must be starred** (Admin → Events → star) once it first appears, which requires the deploy and one real or test enquiry. GA4 offers no way to add a key event by name before the event arrives. `whatsapp_click` and `contact_click` stay ordinary events, as secondary signals. `cta_click` is navigation only. |
| Search Console | `sc-domain:artilier.co` is owned only by ankit.vijaivargia@gmail.com, and ankit@artavenue.com has no access. To link: either add ankit@artavenue.com as an Owner in Search Console (Settings → Users and permissions → Add user), or add ankit.vijaivargia@gmail.com as Editor on GA property 558437246. Then go to GA Admin → Product links → Search Console links → Link. Not done: it changes permissions. |

### Events (dataLayer → GA4)

| Event | Fires when | Parameters (never names, emails, phones or message text) |
|---|---|---|
| page_view | Each page load (gtag config) | GA4 defaults |
| form_start | First edit of an enquiry form | form_id, enquiry_type, design_reference, cta_page |
| generate_lead | **Only after Formspree accepts the post** | form_id, enquiry_type, design_reference, cta_page |
| enquiry_error | Formspree refuses or the network fails | form_id, enquiry_type, error_type |
| contact_click | mailto: or tel: link | link_type (email / phone) |
| whatsapp_click | wa.me / api.whatsapp.com link | link_type |
| cta_click | Internal link to /contact/ or #enquire | cta_label (≤40-char slug), cta_zone (nav/body/footer) |

All events are pushed through `artilierTrack`. It drops repeats within 4 seconds and discards any value that looks like an email address or phone number.
