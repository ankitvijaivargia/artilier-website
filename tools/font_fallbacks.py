"""Generate the metric-matched fallback @font-face rules in assets/css/fonts.css.

While a brand font is still loading, text is set in a local font that has been
resized (size-adjust) and given the brand font's line metrics (ascent / descent
/ line-gap overrides), so headings and paragraphs keep their size and line
breaks when the brand font swaps in. That swap was the remaining source of
layout shift (CLS) after the font preloads of PR #29.

Each brand weight and style gets its own fallback face, because Cormorant
Garamond 300/400/500, its italics and Jost 300/400/500 all differ in width.
Uppercase Jost labels use a separate set ("Jost Caps Fallback", --s-caps)
calibrated on capitals, which Arial and Roboto set wider than Jost.

Width:  size-adjust = brand advance / fallback advance, averaged over the
        characters of the site's own English copy (fontTools), then multiplied by
        CALIBRATION (tools/font_fallback_calibration.txt) — the ratio measured in
        Chromium on every English page's real text by font_fallback_calibrate.mjs.
Height: ascent/descent/line-gap overrides = the brand font's OS/2 typo metrics
        (USE_TYPO_METRICS is set in both brand fonts) divided by size-adjust.

Fallback fonts are measured, never shipped. To regenerate (if the copy, the
brand fonts or the CSS change materially):
  mkdir /tmp/fb && cd /tmp/fb && npm i @fontsource/tinos @fontsource/arimo \\
      @fontsource/roboto @fontsource/noto-serif puppeteer && pip install fonttools brotli
  python3 tools/font_fallbacks.py . /tmp/fb/node_modules     # rewrites the FALLBACKS block in fonts.css
  then install the fallback fonts locally, serve the repo, and run
  node tools/font_fallback_calibrate.mjs http://localhost:8000 --update
  python3 tools/font_fallbacks.py . /tmp/fb/node_modules     # applies the updated calibration
Repeat the last two steps until every ratio printed is within 0.999-1.001.
"""
import sys, re, html, glob, collections
from fontTools.ttLib import TTFont

REPO, NM = sys.argv[1], sys.argv[2]
A, F = f"{REPO}/assets/fonts", f"{NM}/@fontsource"

# Width corrections measured on real page text in Chromium
# (tools/font_fallback_calibration.txt, written by font_fallback_calibrate.mjs --update).
CALIBRATION = {}
CAL = f"{REPO}/tools/font_fallback_calibration.txt"
try:
    for line in open(CAL):
        if line.strip() and not line.startswith("#"):
            k, v = line.rsplit(" ", 1); CALIBRATION[tuple(k.split("|"))] = float(v)
except FileNotFoundError:
    pass

text = []
for f in glob.glob(f"{REPO}/**/index.html", recursive=True):
    if "/fr/" in f: continue
    s = open(f, encoding="utf-8").read()
    s = re.sub(r"(?s)<(script|style|head)\b.*?</\1>", " ", s)
    text.append(html.unescape(re.sub(r"<[^>]+>", " ", s)))
freq = collections.Counter(c for c in " ".join(text) if c.isascii() and (c.isalnum() or c in " .,-'"))
freq[" "] = min(freq[" "], sum(v for k, v in freq.items() if k != " ") // 5)

def unicode_range(path):
    """The brand file's own character coverage, as a CSS unicode-range. Limits each
    fallback face to the characters the brand font draws, so symbols the brand font
    lacks (the ≡ menu icon, → arrows) keep rendering exactly as they did before."""
    cps = sorted(TTFont(path).getBestCmap()); out = []; start = prev = cps[0]
    for c in cps[1:] + [None]:
        if c is not None and c == prev + 1: prev = c; continue
        out.append(f"U+{start:04X}" if start == prev else f"U+{start:04X}-{prev:04X}")
        if c is not None: start = prev = c
    return ",".join(out)

def metrics(path, brand=True):
    f = TTFont(path); upm = f["head"].unitsPerEm; cmap = f.getBestCmap(); hm = f["hmtx"]
    tot = n = 0
    for ch, w in freq.items():
        g = cmap.get(ord(ch))
        if g: tot += hm[g][0] * w; n += w
    os2 = f["OS/2"]
    assert not brand or os2.fsSelection & (1 << 7), f"{path}: expected USE_TYPO_METRICS"
    return tot / n / upm, os2.sTypoAscender / upm, abs(os2.sTypoDescender) / upm, os2.sTypoLineGap / upm

SETS = {  # fallback family name -> {style: (measured file, local() names)}
    "Cormorant Garamond Fallback": {
        "normal": ("tinos/files/tinos-latin-400-normal.woff2",
                   ["Times New Roman", "TimesNewRomanPSMT", "Liberation Serif", "LiberationSerif", "Tinos Regular", "Tinos-Regular"]),
        "italic": ("tinos/files/tinos-latin-400-italic.woff2",
                   ["Times New Roman Italic", "TimesNewRomanPS-ItalicMT", "Liberation Serif Italic", "LiberationSerif-Italic", "Tinos Italic", "Tinos-Italic"])},
    "Cormorant Garamond Fallback Noto": {
        "normal": ("noto-serif/files/noto-serif-latin-400-normal.woff2", ["Noto Serif", "Noto Serif Regular", "NotoSerif-Regular", "NotoSerif"]),
        "italic": ("noto-serif/files/noto-serif-latin-400-italic.woff2", ["Noto Serif Italic", "NotoSerif-Italic"])},
    "Jost Fallback": {
        "normal": ("arimo/files/arimo-latin-400-normal.woff2",
                   ["Arial", "ArialMT", "Liberation Sans", "LiberationSans", "Arimo Regular", "Arimo-Regular"])},
    "Jost Fallback Roboto": {
        "normal": ("roboto/files/roboto-latin-400-normal.woff2", ["Roboto", "Roboto Regular", "Roboto-Regular"])},
    # Same local fonts, calibrated on capitals only: used by every uppercase Jost
    # label (--s-caps), where Arial and Roboto capitals run wider than Jost's.
    "Jost Caps Fallback": {
        "normal": ("arimo/files/arimo-latin-400-normal.woff2",
                   ["Arial", "ArialMT", "Liberation Sans", "LiberationSans", "Arimo Regular", "Arimo-Regular"])},
    "Jost Caps Fallback Roboto": {
        "normal": ("roboto/files/roboto-latin-400-normal.woff2", ["Roboto", "Roboto Regular", "Roboto-Regular"])},
}
BRAND = {  # fallback family -> [(weight, style, brand file)]
    "Cormorant Garamond": [(300, "normal", "cormorant-garamond-latin-300-normal"), (400, "normal", "cormorant-garamond-latin-400-normal"),
                           (500, "normal", "cormorant-garamond-latin-500-normal"), (300, "italic", "cormorant-garamond-latin-300-italic"),
                           (400, "italic", "cormorant-garamond-latin-400-italic")],
    "Jost": [(300, "normal", "jost-latin-300-normal"), (400, "normal", "jost-latin-400-normal"), (500, "normal", "jost-latin-500-normal")],
}
pct = lambda x: f"{x * 100:.2f}%"
rules = []
for fam, faces in SETS.items():
    brand = "Cormorant Garamond" if fam.startswith("Cormorant") else "Jost"
    for weight, style, bfile in BRAND[brand]:
        ffile, names = faces[style]
        bw, asc, desc, gap = metrics(f"{A}/{bfile}.woff2")
        fw = metrics(f"{F}/{ffile}", brand=False)[0]
        sa = bw / fw * CALIBRATION.get((fam, str(weight), style), 1.0)
        src = ",".join(f"local('{n}')" for n in names)
        rules.append(f"@font-face{{font-family:'{fam}';font-style:{style};font-weight:{weight};src:{src};"
                     f"unicode-range:{unicode_range(f'{A}/{bfile}.woff2')};"
                     f"size-adjust:{pct(sa)};ascent-override:{pct(asc / sa)};descent-override:{pct(desc / sa)};line-gap-override:{pct(gap / sa)}}}")
css = f"{REPO}/assets/css/fonts.css"
s = open(css, encoding="utf-8").read()
new = re.sub(r"/\* FALLBACKS:START \*/.*?/\* FALLBACKS:END \*/",
             lambda m: "/* FALLBACKS:START */\n" + "\n".join(rules) + "\n/* FALLBACKS:END */", s, flags=re.S)
assert new != s or "\n".join(rules) in s, "FALLBACKS markers not found in fonts.css"
open(css, "w", encoding="utf-8").write(new)
print(f"{len(rules)} fallback faces written to assets/css/fonts.css")
