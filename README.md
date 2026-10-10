# Artilier — website

Production source for **www.artilier.co**.

Artilier is a design-led studio in New Delhi working through art, material and
making. The current collection is rugs: hand-knotted, hand-tufted and flatweave,
made to order in any dimension.

---

## Technology

Plain static HTML, CSS and vanilla JavaScript. No framework, no bundler, no
package manager, no build step, no runtime dependencies. Two Google Fonts
(Cormorant Garamond, Jost) load from `fonts.googleapis.com`; everything else is
served from this repository.

```
/
├── index.html               Homepage (all sections; anchors drive /bespoke, /trade, /about …)
├── collection/
│   ├── index.html           The collection — sections, designs and filters rendered from /content
│   └── design.html          Single-design page (?d=slug), for designs marked detail:true
├── content/                 CONTENT SOURCE OF TRUTH — see CONTENT.md
│   ├── site.json            Studio, contact, the two people, default CTA
│   ├── categories.json      Rugs (published) + future disciplines (unpublished)
│   ├── taxonomy.json        MATERIALS & TECHNIQUES — one central vocabulary
│   ├── collections.json     One published collection = one section
│   ├── designs.json         Every design
│   ├── projects.json        Installed work (empty until real work exists)
│   └── bespoke.json         Bespoke flow + bespoke examples
├── assets/
│   ├── css/
│   │   ├── base.css         Palette, type scale, section shells, desktop layout
│   │   ├── layout.css       Page-specific blocks (collection grids, bespoke flow, process)
│   │   └── responsive.css   Tablet / phone / touch / reduced-motion layer (desktop untouched)
│   ├── js/
│   │   ├── slots.js         Read-only media renderer for <media-slot> / <image-slot>
│   │   └── content.js       Read-only renderer for /content JSON
│   ├── media/
│   │   ├── manifest.json    Slot id → file, crop, alt text, caption facts
│   │   └── …                Photographs and films
│   └── og-artilier.png      Social card
├── favicon.svg
├── apple-touch-icon.png
├── robots.txt
├── sitemap.xml
├── _headers                 Cloudflare Pages — caching and security headers
└── _redirects               Cloudflare Pages — section and legacy URLs
```

## Running locally

Any static server; the pages use root-relative paths (`/assets/…`), so opening
the files directly with `file://` will not resolve them.

```bash
python3 -m http.server 8080     # then open http://localhost:8080
# or
npx serve .
```

## Building

Pages under `collection/`, `bespoke/`, `trade/`, `materials/`, `process/`,
`craft/`, `contact/`, `about/`, `projects/`, `hospitality/`, `fr/` and
`404.html` are **generated** from `/content` by the scripts in `tools/`. Edit the
generator (or the content), never the generated HTML, then run:

```bash
python3 tools/og.py          # social preview images for design pages (needs Pillow)
node tools/build.mjs         # design and category pages
node tools/build2.mjs        # bespoke, trade, materials, process, craft; collection hub
node tools/build3.mjs        # contact, about, projects, hospitality, market pages, /fr/, 404,
                             # shared shell for collaborations + collection hub, homepage footer, sitemap
python3 tools/check.py       # links, metadata, schema, sitemap, discretion checks — must print OK
```

`index.html` and `collaborations/index.html` are hand-maintained; `build3.mjs`
keeps their navigation, footer and Organization schema in sync. `tools/` is
excluded from deployment by `.assetsignore`.

## Deployment — Cloudflare Workers (static assets)

The site is served by a Cloudflare Worker with static assets (`wrangler.jsonc`:
`assets.directory = "."`, `not_found_handling = "404-page"`). Pushes to `main`
deploy automatically; work on a branch and merge through a pull request.
`_headers` and `_redirects` are applied by the assets runtime.
