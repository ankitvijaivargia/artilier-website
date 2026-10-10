# ARTILIER — 90-day SEO execution plan

Start: on approval of the `seo/growth-engine-p1` PR (target week of 12 Oct 2026). Supersedes `SEO_30_DAY_ROADMAP.md` for days 1–30.

Scoring: **Value** (commercial) and **Rank** (ranking opportunity) H/M/L · **Conf** = confidence in the evidence · **Effort** S/M/L · **Who:** C = Claude can do independently · A = needs Ankit (facts, access, approval or relationships).

## Days 1–7 — fix, verify, measure

| Task | Value | Rank | Conf | Effort | Depends on | Who | Measured by |
|---|---|---|---|---|---|---|---|
| Review and merge PR (French localisation, UAE/UK terms, guide, related links, **unreadable dark-list copy fix**) | H | M | High (defects verified) | S | Ankit review of guide wording | A | Live pages match branch; `check.py` OK |
| Post-deploy check: live sitemap 41 URLs, guide 200, French nav, dark lists legible on UAE/KSA/UK/hospitality | H | — | High | S | Merge | C (via WebFetch) / A (phone check) | Checklist in change log |
| Verify Search Console (Domain), submit sitemap, request indexing: `/`, `/trade/uae/`, `/trade/saudi-arabia/`, `/fr/`, `/bespoke/`, `/hospitality/`, `/trade/`, guide | H | H | High | S | Cloudflare DNS access | A | GSC sitemap "Success"; inspection results |
| Import to Bing Webmaster Tools | M | L | High | S | GSC | A | Bing sitemap processed |
| Enable Cloudflare Web Analytics | H | — | High | S | Dashboard | A | Visits recorded |
| Send one live test enquiry; confirm Formspree delivery and spam filter | H | — | High | S | — | A | Email received with landing page + referrer |
| Start the enquiry log (template in measurement framework §4); back-fill since launch | H | — | High | S | Formspree export | A | Log exists |
| Confirm no paid links; check Manual actions | M | M | Medium | S | GSC | A | "No issues detected" |
| Decide Downtown Design Dubai (4–8 Nov) and EquipHotel (2–5 Nov) | H | L | High | S | — | A | Decision |

## Days 8–21 — commercial pages and verified facts

| Task | Value | Rank | Conf | Effort | Depends on | Who | Measured by |
|---|---|---|---|---|---|---|---|
| Answer OWNER_INPUT §B (French replies, reply time), §C (hospitality scope + documentation), §H (guide facts/photos) | H | M | — | S | Ankit | A | Answers recorded |
| Hospitality page: scope statement (feature rugs, not broadloom — if confirmed) + rug-schedule brief template | H | M | Medium | M | §C | C | Page live; hospitality enquiries in log |
| UAE page: villa/majlis scale section; KSA page: Riyadh section | H | M | Medium (thin Riyadh results observed) | S | — | C | GSC impressions AE/SA for market pages |
| Per-design data (yarn, size of photographed rug) + Talab/Ghata descriptions → regenerate design pages | M | M | High | S | §E | A → C | Pages regenerated |
| Pitch identity and COVER (drafts for approval) around the Dubai visit | M | M | Medium | S | Approval, images | C drafts / A sends | Replies; coverage |
| Prepare a print/PDF version of the briefing guide for the sample box and meetings | M | L | Medium | S | Merge | C | Used in meetings |

## Days 22–45 — market depth, first assets, outreach preparation

| Task | Value | Rank | Conf | Effort | Depends on | Who | Measured by |
|---|---|---|---|---|---|---|---|
| Guide 2: the rug strike-off | H | H (thin results observed) | Medium | M | Strike-off photos | A photos → C | Indexed; impressions; enquiries citing it |
| Guide 3: artwork and CAD files | H | H (no informational page observed) | Medium | M | Accepted formats | A → C | Same |
| First case study (`/projects/<slug>/` template) — the moment one project is permissioned | H | H | High (pattern clear in every market) | M | §F | A → C | `/projects/` indexed; hospitality impressions |
| French: if replies in French are possible → French contact form; draft `/fr/hotellerie/` | M | M | Medium | M | §B | C | FR impressions; FR enquiries |
| BIID Industry Partner / SpecifiedBy decision; prepare listing copy | M | M | Medium | S | Budget decision | A decides / C drafts | Listing live |
| Downtown Design Dubai meetings follow-up (log each conversation as a lead) | H | L | — | M | Trip | A | Qualified enquiries |
| First GSC review (28 days): indexation, non-branded queries by country | H | — | — | S | GSC data | C | Review note in repo |

## Days 46–90 — evidence-led expansion

| Task | Value | Rank | Conf | Effort | Depends on | Who | Measured by |
|---|---|---|---|---|---|---|---|
| Monthly GSC + enquiry review; pick the next 2 page improvements from data | H | — | Grows with data | S | GSC | C + A | Decisions recorded |
| Guide 4 (construction by project) or Guide 5 (sizing from plans) — whichever query set shows impressions | M | M | Low until data | M | Photos/drawings | A → C | Impressions → enquiries |
| Hospitality specification guide — only once documentation position is settled | M | M | Medium | M | §C | A → C | Hospitality enquiries |
| Designer-credited collaboration offer to one warm studio | H | M | Medium | M | Relationship | A | Mention + link earned |
| BIID CPD talk outline (UK authority) | M | M | Medium | M | BIID decision | C drafts | Accreditation |
| Conversion review of enquiry form: which fields qualified enquiries skip; simplify if needed | M | — | — | S | ≥10 enquiries | C | Completion rate |
| Quarterly competitor re-check per market; update keyword map; decide on Arabic (only with Arabic queries in GSC) | M | M | — | M | GSC | C | Updated research |

## Claude alone vs needs Ankit

- **Claude independently:** generator changes, page builds, checks, browser tests, drafts of guides/pitches/listings, GSC/analytics reviews once data is shared, competitor re-checks.
- **Needs Ankit:** every business fact and photograph, account access (GSC, Cloudflare, Formspree, Semrush units), approvals to merge and to contact anyone, relationships and trips.

## What success looks like at day 90 (stated as checks, not forecasts)

- Every indexable page indexed or with a known reason.
- Non-branded impressions recorded by country for AE, SA, FR, GB, US — a baseline, whatever its size.
- An enquiry log that attributes every enquiry to a source and landing page.
- At least two specifier guides and, ideally, one real case study live.
- A decision on French service and on the first directory memberships.
No ranking, traffic or lead numbers are forecast.
