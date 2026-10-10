"""Per-design social preview images (1200x630 JPEG) from each design's hero
photograph. Run: python3 tools/og.py  — then re-run the page generators so
og:image points at the new files. Only crops real photographs; nothing drawn."""
import json, os
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
man = json.load(open(os.path.join(ROOT, 'assets/media/manifest.json')))
designs = json.load(open(os.path.join(ROOT, 'content/designs.json')))['designs']
out = os.path.join(ROOT, 'assets/og'); os.makedirs(out, exist_ok=True)
W, H = 1200, 630
n = 0
for d in designs:
    if not d.get('detail') or d.get('published') is False: continue
    m = man.get(d.get('hero') or '', {})
    src = (m.get('src') or '').split('?')[0]
    if not src or m.get('type') == 'video': continue
    im = Image.open(os.path.join(ROOT, 'assets/media', src)).convert('RGB')
    r = max(W / im.width, H / im.height)
    im = im.resize((round(im.width * r), round(im.height * r)), Image.LANCZOS)
    l, t = (im.width - W) // 2, (im.height - H) // 2
    im.crop((l, t, l + W, t + H)).save(os.path.join(out, d['slug'] + '.jpg'), 'JPEG', quality=82, optimize=True, progressive=True)
    n += 1
print('og images:', n)
