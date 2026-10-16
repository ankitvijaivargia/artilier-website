"""Responsive image variants for the photographs in assets/media/manifest.json.

For every still photograph (type "image", not a film poster) this writes
smaller WebP copies to assets/media/r/<stem>-<width>.webp for each width in
WIDTHS that is narrower than the original, and records in the manifest:

  "w", "h"      natural size of the original (for width/height attributes)
  "variants"    the widths that exist, ascending

tools/build.mjs and assets/js/slots.js read "variants" to emit srcset/sizes, so
a phone downloads a 480 or 800 px copy instead of a 1,300-2,000 px original
(T-06 in SEO_OPERATING_SYSTEM.md). Originals are never modified or renamed;
the image sitemap keeps pointing at them.

Run after adding or replacing a photograph, before the builds:
  python3 tools/images.py            # writes missing variants, updates manifest
  python3 tools/images.py --check    # exit 1 if a variant is missing or stale
Idempotent: an existing variant is rewritten only if the original is newer.
"""
import json, os, sys
from PIL import Image

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
MEDIA = os.path.join(ROOT, "assets", "media")
OUT = os.path.join(MEDIA, "r")
MANIFEST = os.path.join(MEDIA, "manifest.json")
WIDTHS = (480, 800, 1200)
QUALITY = 78
check = "--check" in sys.argv

with open(MANIFEST, encoding="utf-8") as f:
    raw = f.read()
manifest = json.loads(raw)
os.makedirs(OUT, exist_ok=True)
problems, written = [], 0

for key, entry in manifest.items():
    if entry.get("type", "image") != "image" or not entry.get("src"):
        continue
    name = entry["src"].split("?")[0]
    if name.endswith("-poster.webp"):
        continue
    src = os.path.join(MEDIA, name)
    if not os.path.exists(src):
        problems.append(f"{key}: missing original {name}"); continue
    stem = os.path.splitext(name)[0]
    with Image.open(src) as im:
        w, h = im.size
        variants = [x for x in WIDTHS if x < w]
        for x in variants:
            out = os.path.join(OUT, f"{stem}-{x}.webp")
            stale = not os.path.exists(out) or os.path.getmtime(out) < os.path.getmtime(src)
            if stale:
                if check:
                    problems.append(f"{key}: variant {x} missing or stale"); continue
                im.convert("RGB").resize((x, round(h * x / w)), Image.LANCZOS).save(out, "WEBP", quality=QUALITY, method=6)
                written += 1
    want = {"w": w, "h": h, "variants": variants}
    if any(entry.get(k) != v for k, v in want.items()):
        if check:
            problems.append(f"{key}: manifest w/h/variants out of date")
        else:
            entry.update(want)

if check:
    for p in problems: print("ERROR", p)
    print("images: OK" if not problems else f"images: {len(problems)} problems")
    sys.exit(1 if problems else 0)

new = json.dumps(manifest, indent=2, ensure_ascii=False) + "\n"
if new != raw:
    with open(MANIFEST, "w", encoding="utf-8") as f:
        f.write(new)
for p in problems: print("ERROR", p)
print(f"images: {written} variants written; manifest {'updated' if new != raw else 'unchanged'}")
sys.exit(1 if problems else 0)
