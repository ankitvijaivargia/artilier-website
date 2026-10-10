# ARTILIER — editorial roadmap (topical authority)

Date: 10 Oct 2026

## Principle

Fewer, stronger resources that help a designer make a specification decision — written from what the studio actually does, illustrated with the studio's own photographs. The research found that the specifier-intent results are mostly consumer pieces or thin trade articles (observed); one competitor is publishing many near-duplicate ~300-word articles. ARTILIER should do the opposite: one guide every two to three weeks, each one the most useful page on its question.

**Publishing gate for every article** — all four must be true:
1. It answers a question a specifier actually asks before or during a brief.
2. Every factual statement is a published studio fact, an owner-confirmed fact, or general knowledge clearly framed as such.
3. It contains at least one thing competitors' pages do not: a real photograph, a real number the studio stands behind, or a real decision sequence.
4. It links to one commercial page and has one conversion action.

**Never:** invented knot counts, pile heights, size limits, test ratings or prices; rewritten versions of competitor articles; articles published to add URLs.

## Sequence

| # | Article | Status / priority |
|---|---|---|
| 1 | How to brief a bespoke rug | **Built on branch** (cornerstone) |
| 2 | What a rug strike-off is, and how to approve one | P1 — needs photos |
| 3 | Artwork and CAD files for a custom rug | P1 — needs accepted formats |
| 4 | Hand-knotted, hand-tufted or flatweave: choosing by project | P2 |
| 5 | Sizing a rug from the furniture plan | P2 |
| 6 | Specifying rugs for hotels: what to put in the brief | P2 — needs hospitality position |
| 7 | Rug yarns for specifiers | P2 — needs fibre facts |
| 8 | Questions to ask a bespoke rug maker (and our answers) | P3 |
| 9 | Pile height and carving in hand-tufted rugs | P3 — needs measured examples |
| 10 | Coordinating a rug with the interior's material palette | P3 |

## Article briefs

### 1. How to brief a bespoke rug — `/guides/briefing-a-bespoke-rug/` (built)
- **Reader:** designer or architect about to send a first brief
- **Intent:** "how to specify a custom rug", "what to send a rug maker"
- **Evidence used:** published process (bespoke, process, materials, market pages) and owner-confirmed terms of 10 Oct 2026
- **Theme:** briefing / specifying a bespoke rug · **Links:** bespoke, process, materials, categories, trade, hospitality
- **Commercial page:** `/bespoke/` · **Conversion:** "Send a brief" → `/contact/?type=bespoke`
- **To strengthen:** an annotated floor plan (studio drawing) and a strike-off photograph

### 2. The rug strike-off — `/guides/rug-strike-off/`
- **Reader:** specifier or procurement lead who must approve samples
- **Intent:** "what is a rug strike off", "custom rug sampling process" — results diluted by the company-law meaning; rug pages thin (observed)
- **Evidence required:** 3–5 strike-off photographs; how many revision rounds are normal; whether yarn poms/colour trials precede the strike-off; typical strike-off sizes if they can be stated; the published facts (2–3 weeks, credited, size depends on design)
- **Theme:** rug strike-off · **Secondary:** sample approval, colour trial
- **Links:** briefing guide, process, bespoke · **Commercial page:** `/bespoke/` · **Conversion:** brief
- **Priority:** P1 · **Effort:** medium (2–3 hours writing once photos exist)

### 3. Artwork and CAD files — `/guides/artwork-and-cad-files-for-custom-rugs/`
- **Reader:** designer or artist turning a drawing or painting into a rug
- **Intent:** "custom rug from CAD drawing" — no informational page found (observed)
- **Evidence required:** accepted file formats; how scale and colour separation are decided; one permissioned before/after
- **Links:** bespoke, collaborations, briefing guide · **Commercial page:** `/bespoke/` · **Conversion:** brief with attachment by email
- **Priority:** P1 · **Effort:** medium

### 4. Choosing construction by project
- **Reader:** designer choosing between constructions for a scheme
- **Intent:** "hand knotted vs hand tufted rug" — every result observed was a retailer/consumer piece
- **Evidence:** published construction descriptions; photographs of fronts, backs and edges of each construction; owner input on relative lead time and cost (ranges only if the owner states them)
- **Links:** the three category pages · **Commercial page:** categories · **Conversion:** "brief a <construction> rug"
- **Priority:** P2 · **Effort:** medium

### 5. Sizing from the furniture plan
- **Reader:** designer sizing rugs for large rooms (Gulf villas, US custom homes)
- **Intent:** "rug size guide large living room" — consumer-framed results (observed)
- **Evidence:** annotated plans drawn by the studio; the owner's position on maximum widths per construction (only if stated)
- **Links:** UAE, KSA, US market pages; briefing guide · **Conversion:** brief with plan
- **Priority:** P2 · **Effort:** medium (drawings)

### 6. Specifying rugs for hotels
- **Reader:** hospitality designer or procurement lead
- **Intent:** "hotel rug specification", "fire rating rugs hotel" — no area-rug answer found (observed)
- **Evidence required:** the studio's position on fire testing and documentation (OWNER §C). The article must describe what to *ask for* and what the studio can *document today* — never imply certification it does not hold
- **Links:** hospitality, KSA, UAE · **Conversion:** hospitality brief
- **Priority:** P2 (blocked by §C) · **Effort:** medium

### 7. Rug yarns for specifiers
- **Reader:** designer choosing fibre for traffic and sheen
- **Intent:** "rug materials wool silk bamboo silk" — antique/consumer pages with errors (observed)
- **Evidence required:** the owner's description of each yarn as the studio uses it (including what "bamboo silk" is in the studio's supply), care guidance supplied with rugs
- **Links:** materials, categories · **Conversion:** brief
- **Priority:** P2 · **Effort:** medium

### 8–10 (P3)
Questions to ask a bespoke rug maker (answered with the studio's own policies); pile height and carving (needs measured examples); coordinating a rug with the material palette (needs project photographs). Revisit after Search Console shows which informational queries reach the site.

## Production workflow

1. Owner supplies facts and photographs (voice note is fine) → 2. Claude drafts in the generator → 3. `check.py` + browser check → 4. Owner reviews wording → 5. Merge → 6. Request indexing in Search Console → 7. Record the URL and date in `SEO_MEASUREMENT_FRAMEWORK.md` §5.

## Distribution (each article)

- Link it from the relevant commercial pages and the footer only if it becomes a cornerstone.
- Share one image and the core point on Instagram (warm-outreach credential, not discovery).
- Attach it to relevant outreach emails instead of a brochure ("our note on strike-offs").
