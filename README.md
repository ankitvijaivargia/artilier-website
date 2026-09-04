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

There is no build. What is in the repository is what is deployed.

## Deployment — Cloudflare Pages

| Setting | Value |
| --- | --- |
| Framework preset | None |
| Build command | *(leave empty)* |
| Build output directory | `/` (repository root) |
| Root directory | `/` |
| Node version | Not required |
| Environment variables | None |

Connect the repository, select branch `main`, deploy. `_headers` and
`_redirects` are picked up automatically. Every push to `main` publishes;
pull requests get preview deployments.

The canonical host is `https://www.artilier.co`. Do not treat the
`*.pages.dev` preview URL as canonical — it is for QA only.

## Images

Photographs and films are ordinary files under `assets/media/`, described by
`assets/media/manifest.json`:

```json
{
  "w6": {
    "src": "/assets/media/w6.webp",
    "type": "image",
    "alt": "Hands tying knots at the loom",
    "view": { "s": 1.08, "x": -1.2, "y": 4.4 },
    "facts": "Hand-knotted · New Zealand wool"
  }
}
```

* `src` — omit and the slot renders as a flat material tone (no placeholder text).
* `view` — the crop: `s` scale, `x`/`y` offset as a percentage of the frame.
  Reproduced at every breakpoint, so one file serves all screen widths.
* `alt` — used verbatim; omit only for genuinely decorative frames.
* `facts` — optional caption line rendered into `[data-mf="<id>"]`.

Slot ids are in the HTML (`<media-slot id="w6" …>`). To change a photograph,
replace the file and, if needed, adjust `view`.

**Recommended:** export at roughly 2000px on the long edge, WebP, quality 80.
Films: H.264 MP4, muted, under ~5 MB — they autoplay in-view and are skipped
under `prefers-reduced-motion`.

## Enquiry form

`index.html` carries the studio enquiry form. It is **not connected to a
backend yet**. The behaviour is deliberate and honest:

* `BRIEF_ENDPOINT` (top of the inline script in `index.html`) is an empty string.
* With no endpoint, the form validates, then opens the visitor's mail client
  with the brief composed and addressed to `studio@artilier.co`, and says so.
  It never reports a false success.
* Set `BRIEF_ENDPOINT` to a form endpoint (Formspree, Basin, Netlify Forms, a
  Cloudflare Pages Function, your own handler) and the same form posts there
  as `multipart/form-data`, attachments included, reporting success only when
  the endpoint accepts it.

File attachments cannot travel through a `mailto:` draft — until an endpoint is
connected, the visitor is told to attach them in their mail client.

## Updating the website

**Content — read `CONTENT.md`.** Designs, collections, projects, bespoke items
and media are data: edit `content/*.json` and `assets/media/`. Nothing about
adding a rug, a collection, a project or a photograph requires touching HTML.

1. Content change → `content/*.json` (+ the media file and its `manifest.json` entry).
2. Design change → `assets/css/*`; page-level copy → the HTML shells.
3. Commit to `main`; Cloudflare Pages publishes within a minute or so.

### Room to grow

Categories beyond rugs already exist in `content/categories.json` with
`published: false`, and materials/techniques live in a separate central
taxonomy (`content/taxonomy.json`) that any design, collection or project can be
tagged with. Category = what a piece is; material = what it is made from;
technique = how it is made. Terms appear publicly only when published *and*
attached to published work. Publishing a discipline is
a content change plus one copy of the collection shell with a different
`data-category` — no restructuring, no renderer change. Nothing on the site
announces categories that do not yet exist.

## Browser support

Evergreen Chrome, Safari, Firefox and Edge; iOS 15.4+ and Android Chrome.
Uses custom elements, `ResizeObserver`, `IntersectionObserver` and CSS
`aspect-ratio` / `clamp()`.
