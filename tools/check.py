"""Site checks — run from the repo root:  python3 tools/check.py
Fails (exit 1) on: broken internal links, links to index.html, missing or
duplicate titles/descriptions, titles > 65 or descriptions > 160 characters,
pages without exactly one H1, invalid JSON-LD, sitemap entries that are missing
or noindexed, indexable pages missing from the sitemap, images without alt,
and any named manufacturing location. Also runs the claim rules R-01..R-10
(tools/claims.py): BLOCK findings are errors, WARN findings are printed."""
import glob, json, os, re, sys, posixpath
from bs4 import BeautifulSoup
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import claims

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
HOST = 'https://artilier.co'
BANNED = re.compile(r'\b(bhadohi|mirzapur|jaipur|sitapura|panipat)\b', re.I)
# Absolute size promises. Rugs are made to order and sized to the project, within what the
# design and construction allow; 'any size limit ... is confirmed' is a caveat and allowed.
SIZE_CLAIM = re.compile(r'\bany\s+(sizes?|dimensions?|shapes?)\b(?!\s+limits?)|\btoutes?\s+(les\s+)?dimensions?\b|\btout dessin\b', re.I)
SKIP = {'collection/design.html'}
errs, warns = [], []

redirects = {}
for line in open('_redirects'):
    p = line.split()
    if len(p) >= 2 and not line.startswith('#'): redirects[p[0]] = p[1]

def url_of(f):
    return '/' if f == 'index.html' else '/' + (f[:-10] if f.endswith('/index.html') else f)

def resolves(path):
    path = path.split('#')[0].split('?')[0]
    if path in redirects: return 'redirect'
    if path.endswith('/'): return os.path.exists('.' + path + 'index.html')
    return os.path.exists('.' + path)

pages = sorted(f for f in glob.glob('**/*.html', recursive=True) if f not in SKIP)
titles, descs, indexable = {}, {}, set()
inbound = {}   # url -> set of pages linking to it (orphan check)
for f in pages:
    s = open(f, encoding='utf-8').read()
    b = BeautifulSoup(s, 'html.parser')
    u = url_of(f)
    robots = (b.find('meta', attrs={'name': 'robots'}) or {}).get('content', '')
    t = b.title.get_text() if b.title else ''
    d = (b.find('meta', attrs={'name': 'description'}) or {}).get('content', '')
    if not t: errs.append(f'{f}: no title')
    if len(t) > 65: warns.append(f'{f}: title {len(t)} chars')
    if not d: errs.append(f'{f}: no meta description')
    if len(d) > 160: errs.append(f'{f}: description {len(d)} chars')
    if 'noindex' not in robots:
        indexable.add(u)
        titles.setdefault(t, []).append(f); descs.setdefault(d, []).append(f)
        can = b.find('link', rel='canonical')
        if not can or can.get('href') != HOST + u: errs.append(f'{f}: canonical {can and can.get("href")} != {HOST + u}')
    h1 = b.find_all('h1')
    if len(h1) != 1: errs.append(f'{f}: {len(h1)} h1')
    if not (b.html and b.html.get('lang')): errs.append(f'{f}: no lang')
    for sc in b.find_all('script', type='application/ld+json'):
        try:
            data = json.loads(sc.string)
            orgs = [n for n in data.get('@graph', [data]) if n.get('@type') == 'Organization']
            if len(orgs) != 1: errs.append(f'{f}: {len(orgs)} Organization nodes')
        except Exception as e: errs.append(f'{f}: bad JSON-LD {e}')
    for img in b.find_all('img'):
        if img.get('alt') is None: errs.append(f'{f}: img without alt {img.get("src")}')
    text = b.get_text(' ')
    if BANNED.search(text) or BANNED.search(s): errs.append(f'{f}: names a manufacturing location')
    metas = ' '.join(m.get('content', '') for m in b.find_all('meta') if m.get('content'))
    jsonld = ' '.join(x.string or '' for x in b.find_all('script', type='application/ld+json'))
    for m in SIZE_CLAIM.finditer(text + ' ' + metas + ' ' + t + ' ' + jsonld):
        errs.append(f'{f}: absolute size claim "{m.group(0)}"')
    if re.search(r'\[(Owner to|date of publication)', b.get_text(' ')): errs.append(f'{f}: unresolved owner placeholder — fill before release')
    cb, cw = claims.check(u, s)
    errs.extend(f'{f}: {x}' for x in cb); warns.extend(f'{f}: {x}' for x in cw)
    base = posixpath.dirname('/' + f) + '/'
    for a in b.find_all('a', href=True):
        h = a['href']
        if h.startswith(('mailto:', 'tel:', 'https://', 'http://', '#')): continue
        if 'index.html' in h: errs.append(f'{f}: link to index.html ({h})')
        if f == '404.html': target = h
        else: target = posixpath.normpath(posixpath.join(base, h.split('#')[0].split('?')[0] or '.'))
        if (h.split('#')[0].split('?')[0].endswith('/') or h in ('', './')) and not target.endswith('/'): target += '/'
        if f != '404.html' and target != url_of(f): inbound.setdefault(target, set()).add(url_of(f))
        r = resolves(target)
        if r == 'redirect': warns.append(f'{f}: link through redirect {h}')
        elif not r: errs.append(f'{f}: broken link {h} -> {target}')

for t, fs in titles.items():
    if len(fs) > 1: errs.append(f'duplicate title on {fs}')
for d, fs in descs.items():
    if len(fs) > 1: errs.append(f'duplicate description on {fs}')

sm = re.findall(r'<loc>([^<]+)</loc>', open('sitemap.xml').read())
smu = {x.replace(HOST, '') for x in sm}
for u in smu:
    if u not in indexable: errs.append(f'sitemap lists non-indexable or missing {u}')
for u in indexable - smu:
    if u not in ('/404.html',): errs.append(f'indexable page not in sitemap: {u}')

for u in sorted(smu):
    if u != '/' and not inbound.get(u): errs.append(f'orphan: no internal link points to {u}')
errs.extend('claims selftest: ' + x for x in claims.selftest())
print(f'pages checked: {len(pages)}  indexable: {len(indexable)}  sitemap: {len(sm)}')
for w in warns: print('WARN', w)
for e in errs: print('ERROR', e)
print('OK' if not errs else f'{len(errs)} errors')
sys.exit(1 if errs else 0)
