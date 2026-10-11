"""Claim rules R-01 to R-10 (Stage 6 §4). Imported by tools/check.py; can also
run on its own:  python3 tools/claims.py
Each rule returns BLOCK (error, check.py exits 1) or WARN (printed, does not
fail the build). Text is checked sentence by sentence — visible text, the
title, meta/OG descriptions and JSON-LD descriptions — so an approved
qualifier only clears the sentence it sits in.

Owner decisions that will tighten these rules (Stage 6 register):
  B1 (is a strike-off always required?) — R-06 stays WARN until answered.
  A1–A4 (headboard installation, hardware, packing, freight) — R-08 stays WARN.
"""
import json, re
from bs4 import BeautifulSoup

I = re.I
# Sentences that carry the supply-only qualifier pass R-01 / R-08.
SUPPLY_OK = re.compile(r"your (appointed )?(installer|contractor|upholsterer|joinery)|installation (on site )?is (carried out )?by|appointed (installer|contractor)|project.s appointed contractor|ready for your installer|we do not install|do you install", I)

R01_BLOCK = [
    re.compile(r"\b(we|artilier|our (team|studio))\b[^.;]{0,40}\b(install|fit|mount|hang)(s|ed|ing)?\b", I),
    re.compile(r"on-site installation|installation (service|included)|turnkey|fitted by (us|artilier)|installed by artilier", I),
    re.compile(r"\bnous (posons|installons|montons)\b|pos[ée]e?s? par nos soins|pose (incluse|comprise)|cl[ée] en main", I),
]
R01_WARN = [
    re.compile(r"\bfitted edge to edge\b|\bposé(e)?s bord à bord\b|available through installation|\binstalled (artilier|work)\b", I),
]
R02_SIZE = re.compile(r"8\s?(ft|feet|')\s?[×x]\s?4|244\s?[×x]\s?122|2[.,]44\s?m", I)
R02_CTX = re.compile(r"board|MDF|timber|wood", I)
R03_JOIN = re.compile(r"(invisible|seamless|imperceptible|undetectable|one surface|sans raccord)", I)
R03_GUAR = re.compile(r"guarantee|always|every|garanti", I)
R04 = re.compile(r"6\s?[–-]\s?12\s?(weeks|semaines)", I)
R04_RUG = re.compile(r"\brugs?\b|\btapis\b|woven|loom", I)
R05 = re.compile(r"6\s?[–-]\s?8\s?(weeks|semaines)", I)
R06 = re.compile(r"strike-off first|sampled first|sampled before production|(every|all|each) (project|order|piece)[^.]{0,60}(strike-off|sample)|the way every rug is|validés? sur échantillon avant production", I)
R07 = re.compile(r"certified|certification|accredited|compliant with|complies with|conforms to|fire[- ]?(rated|retardant|resistant|tested|safe)|flame[- ]retardant|\bFR[- ](rated|treated|grade|fabric)\b|BS ?5867|BS ?7176|BS ?5852|NFPA ?\d+|\bCAL(IFORNIA)? ?(TB)? ?117\b|EN ?13501|EN ?1021|ASTM ?E84|\bB-s1\b|ignifug|classé (M|B)\d", I)
R07_ACRO = re.compile(r"\bIMO\b|\bM1\b")       # case-sensitive acronyms
R07_OK = re.compile(r"do not hold (any )?product certifications|not supplied as tested or certified unless|fire, wear or cleaning requirements in the brief|no certification", I)
R08 = re.compile(r"install|fixing|hardware|bracket|cleat|batten|deliver\w* to site|white[- ]glove|\bcrat(e|ed|es|ing)\b|freight|shipping (included|arranged)|\bDDP\b", I)
R08_SCOPE = re.compile(r"headboard|tête de lit|têtes de lit", I)
R09 = re.compile(r"minimum (order|of)\s*\d+|\d+\s*(pieces|units|metres|meters)\s*minimum|\bMOQ\b", I)
R10 = re.compile(r"\b(bhadohi|mirzapur|jaipur|sitapura|panipat)\b", I)

def sentences(html):
    b = BeautifulSoup(html, 'html.parser')
    for t in b(['script', 'style', 'noscript']):
        if t.name == 'script' and t.get('type') == 'application/ld+json': continue
        t.decompose()
    extra = []
    if b.title: extra.append(b.title.get_text())
    for m in b.find_all('meta'):
        if m.get('name') in ('description',) or m.get('property') in ('og:description', 'og:title'):
            extra.append(m.get('content', ''))
    for sc in b.find_all('script', type='application/ld+json'):
        try:
            def walk(n):
                if isinstance(n, dict):
                    for k, v in n.items():
                        if k in ('description', 'name') and isinstance(v, str): extra.append(v)
                        else: walk(v)
                elif isinstance(n, list):
                    for v in n: walk(v)
            walk(json.loads(sc.string))
        except Exception: pass
        sc.decompose()
    # inline tags must not split a sentence ("<b>Rugs:</b> 6–12 weeks" is one sentence)
    for t in b.find_all(['b', 'strong', 'em', 'i', 'a', 'span', 'abbr', 'small', 'sup']):
        t.insert_before(' '); t.insert_after(' '); t.unwrap()
    b.smooth()
    text = b.get_text('\n')
    out = []
    for chunk in [*text.split('\n'), *extra]:
        chunk = ' '.join(chunk.split())
        if not chunk: continue
        out.extend(s for s in re.split(r'(?<=[.!?;])\s+', chunk) if s)
    return out

def check(url, html):
    """Return (blocks, warns) as lists of 'R-xx: sentence' strings."""
    B, W = [], []
    emb = url.startswith('/embroidery/') or url.startswith('/fr/broderie/')
    emb_core = url in ('/embroidery/', '/embroidery/headboards/') or (emb and url.count('/') == 3 and not url.startswith('/embroidery/fabrics/') and not url.startswith('/fr/'))
    home_contact = url in ('/', '/contact/')
    hb_page = url.startswith('/embroidery/headboards/')
    for s in sentences(html):
        short = s[:160]
        ok_supply = bool(SUPPLY_OK.search(s))
        # R-01
        if not ok_supply and any(p.search(s) for p in R01_BLOCK): B.append('R-01 installs/fits: ' + short)
        elif not ok_supply and any(p.search(s) for p in R01_WARN): W.append('R-01 installation ambiguity: ' + short)
        # R-02
        if R02_SIZE.search(s) and not R02_CTX.search(s): B.append('R-02 size limit without board context: ' + short)
        # R-03
        if R03_JOIN.search(s):
            (B if R03_GUAR.search(s) and re.search(r'join|joint|seam|raccord', s, I) else W).append('R-03 seamless/one surface: ' + short)
        # R-04
        if R04.search(s):
            if emb: B.append('R-04 rug lead time on embroidery page: ' + short)
            elif home_contact and not R04_RUG.search(s): W.append('R-04 unlabelled 6–12 weeks: ' + short)
        # R-05
        if R05.search(s) and emb_core: B.append('R-05 fabric lead time on panel/headboard page: ' + short)
        # R-06
        if R06.search(s): W.append('R-06 universal strike-off: ' + short)
        # R-07
        if (R07.search(s) or R07_ACRO.search(s)) and not R07_OK.search(s): B.append('R-07 certification/fire claim: ' + short)
        # R-08
        if (hb_page or R08_SCOPE.search(s)) and R08.search(s) and not ok_supply:
            if re.search(r'\bwe install', s, I): B.append('R-08 headboard install: ' + short)
            else: W.append('R-08 unconfirmed headboard promise: ' + short)
        # R-09
        if R09.search(s): B.append('R-09 minimum-order figure: ' + short)
        # R-10
        if R10.search(s): B.append('R-10 manufacturing town: ' + short)
    return B, W

# One failing and one passing sentence per rule (Stage 6 §4), taken from the
# C-01..C-08 'existing' and 'replacement' strings. Run by check.py on every build.
CASES = [
  ('/embroidery/', 'Embroidered wallcoverings are made as panels laid out to your elevations and we fit them on site.', 'R-01', True),
  ('/embroidery/', 'No. We make and supply the panels; installation is carried out by your appointed installer or contractor.', 'R-01', False),
  ('/embroidery/', 'Panels can be made up to 8 ft × 4 ft.', 'R-02', True),
  ('/embroidery/', 'For panels mounted on MDF or timber board, the standard maximum is 8 ft × 4 ft.', 'R-02', False),
  ('/embroidery/', 'Invisible joins are guaranteed on every wall.', 'R-03', True),
  ('/embroidery/', 'Panels are supplied in sections planned for discreet joins.', 'R-03', False),
  ('/embroidery/', 'Lead times usually run 6–12 weeks from approval.', 'R-04', True),
  ('/embroidery/', 'Production typically takes 3–4 months.', 'R-04', False),
  ('/embroidery/headboards/', 'Typical lead time is 6–8 weeks.', 'R-05', True),
  ('/embroidery/fabrics/', 'Typical lead time is 6–8 weeks.', 'R-05', False),
  ('/embroidery/', 'From your artwork, strike-off first, no minimum.', 'R-06', True),
  ('/embroidery/', 'From your artwork, sampled where the project requires it, no fixed minimum.', 'R-06', False),
  ('/hospitality/', 'All panels are fire-rated and certified to BS 5867.', 'R-07', True),
  ('/hospitality/', 'We do not hold product certifications.', 'R-07', False),
  ('/embroidery/headboards/', 'Headboards are crated and delivered to site with fixing hardware.', 'R-08', True),
  ('/embroidery/headboards/', 'Custom dimensions available, subject to design and technical feasibility.', 'R-08', False),
  ('/embroidery/', 'Minimum order 10 pieces.', 'R-09', True),
  ('/embroidery/', 'No fixed minimum order quantity.', 'R-09', False),
  ('/craft/', 'Woven in Bhadohi.', 'R-10', True),
  ('/craft/', 'Woven in established workshops across India.', 'R-10', False),
]
def selftest():
    bad = []
    for url, sent, rule, should in CASES:
        b, w = check(url, f'<html><body><p>{sent}</p></body></html>')
        hit = any(x.startswith(rule) for x in b + w)
        if hit != should: bad.append(f'{rule} {"missed" if should else "false positive"}: {sent}')
    return bad

if __name__ == '__main__':
    import glob, os, sys
    os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    for x in selftest(): print('SELFTEST FAIL', x)
    nb = len(selftest())
    for f in sorted(glob.glob('**/*.html', recursive=True)):
        if f == 'collection/design.html': continue
        u = '/' if f == 'index.html' else '/' + (f[:-10] if f.endswith('/index.html') else f)
        b, w = check(u, open(f, encoding='utf-8').read())
        for x in b: print('BLOCK', u, x)
        for x in w: print('WARN ', u, x)
        nb += len(b)
    print('claims:', 'OK' if not nb else f'{nb} blocking')
    sys.exit(1 if nb else 0)
