# Artilier — content guide

Everything that changes over time lives in **`/content/*.json`** and **`/assets/media/`**.
Nothing in this folder needs a build step, a CMS or a framework. Edit JSON, add a
file, commit.

> **Rule for Claude Design (and anyone else):** *modify these content files.*
> Never rebuild the website to add a rug, a collection, a project or a photograph.
> The HTML pages are presentation shells; they render whatever the content files say.

---

## 1. The architecture

```
/content/
├── site.json          Studio name, email, the two people, default enquiry CTA
├── categories.json    Disciplines. rugs = published. embroidery, straw-marquetry,
│                      furniture, lighting, objects, textiles exist, published:false
├── taxonomy.json      MATERIALS & TECHNIQUES — the studio's whole vocabulary,
│                      one central list, reused everywhere (see §6)
├── collections.json   One published collection = one section on a collection page
├── designs.json       Every design, keyed to a collection + technique
├── projects.json      Installed work — empty until there is real work to show
└── bespoke.json       The bespoke flow, plus optional bespoke examples

/assets/media/
├── manifest.json      media id → file, crop (`view`), alt text, caption `facts`
└── *.webp / *.mp4     the real files (no external hosting, no temporary URLs)

/assets/js/content.js  Renders content into the pages. Read-only.
/assets/js/slots.js    Renders media into <media-slot id="…">. Read-only.
```

**Content vs presentation.** Names, descriptions, specs, order and publication
state are content (JSON). Type, colour, grid, animation and layout are
presentation (CSS + the page shells). Media *files* are content; media *crops*
live in `manifest.json` beside the file, so they survive every content edit.

**Where each surface comes from**

| Surface | Rendered from |
| --- | --- |
| `collection/index.html` sections, filter row, counts | `collections.json` + `designs.json` |
| `collection/design.html` (a single design) | `designs.json` (`detail: true` only) |
| Homepage bespoke flow + examples | `bespoke.json` |
| Homepage projects section | `projects.json` (hidden while empty) |
| Homepage "15 hand-knotted, 12 …" line | derived from `designs.json` |
| Every photograph and film | `assets/media/manifest.json` |

Nothing is hard-coded to a number of designs, collections or categories.

---

## 2. Add a new rug

1. Put the photograph in `assets/media/` (WebP, ~2000px long edge, quality 80).
   Give it a stable id-style name, e.g. `ck16.webp`.
2. Add the media entry to `assets/media/manifest.json`:

```json
"ck16": { "src": "ck16.webp", "alt": "Amber — hand-knotted wool and silk rug", "facts": "" }
```

3. Add the design to `content/designs.json` (`designs` array):

```json
{
  "slug": "amber", "name": "Amber",
  "collection": "knotted", "category": "rugs", "technique": "hand-knotted",
  "label": null, "hero": "ck16", "images": [], "video": null,
  "construction": "Hand-knotted", "material": null, "pileHeight": null,
  "referenceSize": null, "availableSizes": ["Any dimension — made to order"],
  "availableConstructions": [], "availableMaterials": [], "palette": [],
  "description": "", "intent": "", "leadTime": null,
  "featured": false, "order": 16, "published": true, "detail": false, "cta": null,
  "terms": ["hand-knotted"]
}
```

That is all. The card, the numbering, the section count, the filter count and the
homepage summary line all update themselves.

**Three rugs at once:** three records, three media files, three manifest entries.

**Field reference**

| Field | Notes |
| --- | --- |
| `slug` | URL id, lowercase-hyphen, unique across designs |
| `name` | Displayed verbatim |
| `collection` | A `slug` from `collections.json` |
| `category` / `technique` | Slugs from `categories.json` / `taxonomy.json` (primary technique) |
| `terms` | MATERIALS & TECHNIQUES slugs — one or many, see §6 |
| `label` | Small caption line under the name (used by "Other techniques") |
| `hero` / `images` / `video` | Media **ids** from `manifest.json` — never file paths |
| `construction`, `material`, `pileHeight`, `referenceSize`, `leadTime` | Strings; blank fields simply don't render |
| `availableSizes`, `availableConstructions`, `availableMaterials` | Arrays of strings |
| `palette` | `[{ "name": "Ash", "hex": "#B8AFA2" }]` — `hex` optional |
| `description` / `intent` | Design description and design intent, for the detail page |
| `featured` | Marks a design for feature placements |
| `order` | Position inside its collection (ascending) |
| `published` | `false` hides it everywhere, instantly |
| `detail` | `true` publishes `design.html?d=slug` and links the card to it |
| `cta` | `{ "label": "…", "href": "…" }`; omit to use `site.json` → `defaultCta` |

---

## 3. Add a new collection

Append to `content/collections.json`:

```json
{
  "slug": "atlas", "name": "Atlas", "category": "rugs", "technique": "hand-knotted",
  "order": 5, "published": true,
  "eyebrow": "Collection 05", "title": "The ", "titleItalic": "Atlas series",
  "subtitle": "One line under the heading.",
  "intro": "A paragraph for the right-hand column of the section header.",
  "filterLabel": "Atlas",
  "note": "{n} designs shown. Every one is woven to order."
}
```

Then give six designs `"collection": "atlas"`. The section, its filter button, its
count and its anchor (`/collection/#atlas`) appear automatically. Section
backgrounds alternate by position — no styling needed.

`title` + `titleItalic` are the two halves of the heading (roman, then italic).

---

## 4. Add a new project

`content/projects.json` is deliberately empty — no invented work. Add a record:

```json
{
  "slug": "villa-jumeirah", "name": "Villa, Jumeirah",
  "location": "Dubai, UAE", "designer": "Studio name (only with permission)",
  "category": "rugs", "techniques": ["hand-knotted"], "materials": ["Wool-silk"],
  "products": ["raeth", "sutra"],
  "hero": "pj1", "images": ["pj2", "pj3"], "video": null,
  "description": "Two paragraphs at most.",
  "featured": true, "order": 1, "published": true
}
```

The homepage Projects section is `hidden` while the array is empty and publishes
itself as soon as one project is `published: true`. Optional keys on the file
itself — `eyebrow`, `title`, `titleItalic`, `intro` — set the section header.
`products` holds design slugs, so a project can point back at the designs used.

---

## 5. Add new media (images and video)

1. Copy the real file into `assets/media/`. Never link to an external or
   temporary URL, and never rely on browser storage.
2. Add an entry to `assets/media/manifest.json`:

```json
"w22": {
  "src": "w22.webp",
  "type": "image",
  "alt": "Shearing the pile",
  "view": { "s": 1.12, "x": -2, "y": 6 },
  "facts": "Hand-tufted · wool"
}
```

* `type` — `image` or `video`; inferred from the extension if omitted.
* `view` — **the crop**: `s` scale, `x`/`y` offset as a percentage of the frame.
  Reproduced at every breakpoint from one file. **Never delete or "tidy" a
  `view`** — it is authored positioning. To recrop, change the numbers; to
  replace a photograph while keeping the composition, replace the file and leave
  `view` alone.
* `facts` — optional caption line, rendered into `[data-mf="<id>"]`.
* Films: H.264 MP4, muted, under ~5 MB. They autoplay in view and are skipped
  under `prefers-reduced-motion`.

Media ids are referenced by content records (`hero`, `images`, `video`, `media`),
so the same photograph can serve several places without duplication.

---

## 6. Materials & techniques (the taxonomy)

`content/taxonomy.json` is the **single source of truth** for the studio's
material and technique vocabulary. It is deliberately separate from categories:

| Classification | Question it answers | Lives in |
| --- | --- | --- |
| **Category** | what the piece *is* — rugs, objects, lighting | `categories.json` |
| **Material** | what it is *made from* — parchment, bone, raffia | `taxonomy.json`, `kind: "material"` |
| **Technique** | *how* it is made — hand-knotted, straw marquetry, mosaics | `taxonomy.json`, `kind: "technique"` |

`kind` may also be `"both"` (cast brass, silver & gold leaf, paper mache), and a
term's `kind` can be revised later — nothing depends on the classification being
final. Terms may carry `category` as an affinity hint; they are not owned by a
category.

**Tagging work.** Designs, collections and projects each carry a `terms` array of
term slugs — one or many:

```json
{ "name": "…", "category": "rugs",    "terms": ["hand-knotted", "straw-marquetry"] }
{ "name": "…", "category": "objects", "terms": ["cast-brass", "stone-inlay-and-carving"] }
```

**Nothing is shown just because it exists.** A term surfaces publicly only when it
is `published: true` **and** attached to at least one published design or project.
The 27 terms seeded for the studio's future vocabulary (straw marquetry, bamboo
marquetry, parchment, cast brass, cast glass, bone, stingray, mosaics, stone inlay
& carving, eggshell, mother of pearl, semi-precious stone, burnt wood, carved
wood, selenite, paper mache, embroidery, raffia, horn, feathers, metal cladding,
silver & gold leaf, resin casting, ceramic, dye-stone, terracotta, tobacco leaf)
are all `published: false` and invisible until there is work behind them. The rug
techniques in use are published.

**Add a term:** append one record — nothing else changes.

```json
{ "slug": "shagreen", "name": "Shagreen", "kind": "material",
  "category": null, "published": false, "order": 128, "short": "" }
```

Publish it when the first piece using it goes live, and tag that piece with
`"terms": ["shagreen"]`. On a design's detail page the tagged terms render as a
"Materials & techniques" row; `ArtilierContent.termsInUse()` returns exactly the
terms that have work behind them, ready for any future index or filter.

Never paste this vocabulary into a page — read it from `taxonomy.json`.

---

## 7. Add a future category (Embroidery, Straw Marquetry, Furniture …)

The categories already exist in `categories.json` with `published: false`, so
nothing about them shows publicly. To launch one — say Embroidery:

1. `categories.json` → set Embroidery `"published": true` and write its `intro`.
2. `taxonomy.json` → publish the terms it needs (e.g. `embroidery`), or append
   new ones.
3. `collections.json` → add one or more collections with `"category": "embroidery"`.
4. `designs.json` → add the pieces with `"category": "embroidery"` and the
   matching `collection` / `technique`.
5. Duplicate `collection/index.html` to `embroidery/index.html` (or
   `collection/embroidery.html`), change `<main id="collection-root"
   data-category="embroidery">`, and adjust the page's own headline, meta and
   breadcrumb copy.
6. Add the navigation link when it should become public.

Straw Marquetry is identical: publish the category, add
`"category": "straw-marquetry"` collections and pieces, mount a page with
`data-category="straw-marquetry"`.

No renderer, CSS or JS change is required — `content.js` filters everything by
`data-category`. Until step 5 and 6, new content is invisible to visitors.

---

## 8. Featured items and display order

* `order` — ascending, within a collection (designs) or within its page
  (collections, projects, bespoke examples). Renumber freely; gaps are fine.
* `featured` — a flag for feature placements. It never hides anything.
* `published` — the only switch that adds or removes something publicly. Prefer
  `"published": false` over deleting: the record and its crop survive.

---

## 9. Preserving crops

Crops live in `assets/media/manifest.json` as `view: { s, x, y }`, never in the
content files and never in the HTML. Consequences:

* Renaming, reordering or re-describing a design cannot lose a crop.
* Replacing a photograph keeps the crop unless you change `view`.
* A media id used in two places keeps one crop, in one place.

---

## 10. Working with Claude Design

Ask in plain language, e.g.

* "Add three new rugs to the hand-tufted collection" → three records in
  `designs.json`, three files in `assets/media/`, three manifest entries.
* "Create a new collection called Atlas and add six designs" → one record in
  `collections.json`, six in `designs.json`.
* "Add this project" → one record in `projects.json` (+ media).
* "Add this embroidery work" → publish the category per §6, then add records.
* "Add these photographs" → files + manifest entries; wire the ids into the
  relevant records.
* "Add a new material called shagreen" → one record in `taxonomy.json`.

What should **not** happen: a new website, a duplicated page set, a second copy
of a design list, content pasted into HTML, or a crop rewritten "for
consistency". If a request seems to need a new page (a new category page, for
example), the new page is a copy of the existing shell with a different
`data-category` — the design system, CSS and renderer stay as they are.

## Rendering notes

* Pages render content client-side from JSON on load, so use a local server
  (`python3 -m http.server 8080`) rather than `file://`.
* `collection/index.html` renders into `<main id="collection-root">`, then calls
  `window.initCollectionUI()` to wire the filter row.
* `collection/design.html` renders one design and redirects to the collection if
  the slug is missing or `detail` is not `true`.
* `document.addEventListener('artilier:content', …)` fires once with all data
  under `event.detail` (also on `window.ArtilierContent`).
