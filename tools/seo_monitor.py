#!/usr/bin/env python3
"""ARTILIER public-site SEO monitor (stdlib only, free, read-only).

Crawls the LIVE site starting from the sitemap and the homepage and reports
problems that can be detected from the outside:

  * sitemap: fetchable, valid XML, every URL 200 / indexable / self-canonical
  * every crawled HTML page: status, <title>, meta description, one <h1>,
    canonical (absolute, https, same host, 200, not redirecting), robots meta,
    lang attribute, JSON-LD parses, hreflang targets resolve and reciprocate
  * internal links: broken (4xx/5xx), redirecting (3xx), links to index.html
  * images in the static HTML: missing alt, missing width/height, oversized files
  * orphan pages: in the sitemap but no internal link from a crawled page
  * robots.txt reachable and does not block the site; 404 page returns 404
  * duplicate titles / descriptions across indexable pages

Usage:
    python3 tools/seo_monitor.py                      # https://artilier.co
    python3 tools/seo_monitor.py --base https://x.workers.dev --json out.json

Exit code 1 if any ERROR is found (WARN does not fail). Polite: one request at
a time, small delay, custom User-Agent; HEAD/GET only.
"""
import argparse, json, re, sys, time, urllib.request, urllib.error, urllib.parse
from html.parser import HTMLParser
from xml.etree import ElementTree as ET

UA = "ArtilierSEOMonitor/1.0 (+https://artilier.co; studio@artilier.co)"
IMG_WARN_BYTES = 400_000


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *a, **k):
        return None


OPENER = urllib.request.build_opener(NoRedirect)


def fetch(url, method="GET"):
    req = urllib.request.Request(url, method=method, headers={"User-Agent": UA})
    try:
        r = OPENER.open(req, timeout=30)
        body = r.read() if method == "GET" else b""
        return r.status, {k.lower(): v for k, v in r.headers.items()}, body
    except urllib.error.HTTPError as e:
        return e.code, {k.lower(): v for k, v in (e.headers or {}).items()}, (e.read() if method == "GET" else b"")
    except Exception as e:  # network error
        return 0, {}, str(e).encode()


class Page(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.title, self.in_title = "", False
        self.h1 = 0
        self.meta = {}
        self.canon = None
        self.hreflang = {}
        self.links, self.imgs, self.jsonld = [], [], []
        self.lang = None
        self._script = None
        self._slot = 0

    def handle_starttag(self, tag, a):
        a = dict(a)
        if tag == "html":
            self.lang = a.get("lang")
        elif tag == "title":
            self.in_title = True
        elif tag == "h1":
            self.h1 += 1
        elif tag == "meta" and a.get("name"):
            self.meta[a["name"].lower()] = a.get("content", "")
        elif tag == "link":
            rel = (a.get("rel") or "").lower()
            if rel == "canonical":
                self.canon = a.get("href")
            elif rel == "alternate" and a.get("hreflang"):
                self.hreflang[a["hreflang"]] = a.get("href")
        elif tag == "a" and a.get("href"):
            self.links.append(a["href"])
        elif tag in ("media-slot", "image-slot"):
            self._slot += 1
        elif tag == "img":
            a["_in_slot"] = self._slot > 0   # slot containers reserve space via CSS aspect-ratio
            self.imgs.append(a)
        elif tag == "script" and a.get("type") == "application/ld+json":
            self._script = []

    def handle_endtag(self, tag):
        if tag in ("media-slot", "image-slot"):
            self._slot = max(0, self._slot - 1)
        if tag == "title":
            self.in_title = False
        elif tag == "script" and self._script is not None:
            self.jsonld.append("".join(self._script))
            self._script = None

    def handle_data(self, d):
        if self.in_title:
            self.title += d
        if self._script is not None:
            self._script.append(d)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--base", default="https://artilier.co")
    ap.add_argument("--canonical-host", default="https://artilier.co",
                    help="host canonicals and sitemap URLs must use (differs from --base when checking a preview)")
    ap.add_argument("--json")
    ap.add_argument("--delay", type=float, default=0.25)
    ap.add_argument("--dump", help="directory to save each page's raw HTML (for offline review)")
    args = ap.parse_args()
    base = args.base.rstrip("/")
    chost = args.canonical_host.rstrip("/")
    to_base = (lambda u: base + u[len(chost):] if u.startswith(chost) else u)
    host = urllib.parse.urlparse(base).netloc
    issues = []

    def add(level, url, msg):
        issues.append({"level": level, "url": url, "msg": msg})

    status_cache = {}
    img_sizes = {}

    def status(url):
        if url not in status_cache:
            s, h, _ = fetch(url, "HEAD")
            if s in (0, 405):
                s, h, _ = fetch(url)
            status_cache[url] = (s, h.get("location"))
            time.sleep(args.delay)
        return status_cache[url]

    # robots
    s, _, body = fetch(base + "/robots.txt")
    if s != 200:
        add("ERROR", "/robots.txt", f"status {s}")
    elif re.search(r"(?im)^disallow:\s*/\s*$", body.decode("utf-8", "ignore")):
        add("ERROR", "/robots.txt", "Disallow: / blocks the whole site")
    # 404 handling
    s, _, _ = fetch(base + "/seo-monitor-should-not-exist-404")
    if s != 404:
        add("ERROR", "/seo-monitor-should-not-exist-404", f"unknown URL returns {s}, expected 404")

    # sitemap
    s, _, body = fetch(base + "/sitemap.xml")
    sitemap = []
    if s != 200:
        add("ERROR", "/sitemap.xml", f"status {s}")
    else:
        try:
            root = ET.fromstring(body)
            ns = {"s": "http://www.sitemaps.org/schemas/sitemap/0.9"}
            sitemap = [to_base(l.text.strip()) for l in root.findall(".//s:loc", ns)]
        except ET.ParseError as e:
            add("ERROR", "/sitemap.xml", f"invalid XML: {e}")
    sitemap_set = set(sitemap)

    queue = list(dict.fromkeys([base + "/"] + sitemap))
    seen, pages, inlinks = set(), {}, {}
    while queue:
        url = queue.pop(0)
        if url in seen:
            continue
        seen.add(url)
        s, h, body = fetch(url)
        time.sleep(args.delay)
        status_cache[url] = (s, h.get("location"))
        if s != 200:
            add("ERROR", url, f"status {s}" + (f" → {status_cache[url][1]}" if 300 <= s < 400 else ""))
            continue
        if "text/html" not in h.get("content-type", ""):
            continue
        p = Page()
        p.feed(body.decode("utf-8", "ignore"))
        if args.dump:
            import os
            fn = os.path.join(args.dump, (urllib.parse.urlparse(url).path.strip("/") or "home").replace("/", "__") + ".html")
            os.makedirs(args.dump, exist_ok=True)
            open(fn, "wb").write(body)
        robots = (p.meta.get("robots") or "").lower()
        xrobots = h.get("x-robots-tag", "").lower()
        noindex = "noindex" in robots or "noindex" in xrobots
        info = {"title": p.title.strip(), "desc": p.meta.get("description", ""),
                "canonical": p.canon, "noindex": noindex, "lang": p.lang,
                "hreflang": p.hreflang, "h1": p.h1, "imgs": len(p.imgs), "bytes": len(body)}
        pages[url] = info
        if url in sitemap_set and noindex:
            add("ERROR", url, "in sitemap but noindex")
        if not info["title"]:
            add("ERROR", url, "missing <title>")
        elif len(info["title"]) > 65:
            add("WARN", url, f"title {len(info['title'])} chars (may truncate)")
        if not info["desc"]:
            add("ERROR", url, "missing meta description")
        elif len(info["desc"]) > 160:
            add("WARN", url, f"description {len(info['desc'])} chars")
        if p.h1 != 1:
            add("WARN", url, f"{p.h1} <h1> elements")
        if not p.lang:
            add("WARN", url, "no <html lang>")
        if not p.canon:
            add("ERROR" if not noindex else "WARN", url, "no canonical")
        else:
            c = to_base(urllib.parse.urljoin(url, p.canon))
            if not c.startswith(base):
                add("ERROR", url, f"canonical off-host or not https: {c}")
            elif not noindex and c != url:
                add("WARN" if url not in sitemap_set else "ERROR", url, f"canonical points elsewhere: {c}")
            else:
                cs, _ = status(c)
                if cs != 200:
                    add("ERROR", url, f"canonical {c} returns {cs}")
        for blob in p.jsonld:
            try:
                json.loads(blob)
            except Exception as e:
                add("ERROR", url, f"JSON-LD does not parse: {e}")
        for lang, href in p.hreflang.items():
            t = to_base(urllib.parse.urljoin(url, href))
            ts, _ = status(t)
            if ts != 200:
                add("ERROR", url, f"hreflang {lang} → {t} returns {ts}")
        for im in p.imgs:
            src = urllib.parse.urljoin(url, im.get("src") or "")
            if "alt" not in im:
                add("ERROR", url, f"<img> without alt: {src}")
            if not im.get("_in_slot") and not (im.get("width") and im.get("height")):
                add("WARN", url, f"<img> without width/height (CLS risk): {src}")
            if src not in img_sizes and urllib.parse.urlparse(src).netloc == host:
                _, ih, _ = fetch(src, "HEAD")
                img_sizes[src] = int(ih.get("content-length") or 0)
                if img_sizes[src] > IMG_WARN_BYTES:
                    add("WARN", url, f"image {img_sizes[src]//1024} KB: {src}")
        for href in p.links:
            if href.startswith(("mailto:", "tel:", "#", "javascript:")) or "wa.me" in href:
                continue
            t = urllib.parse.urljoin(url, href).split("#")[0]
            pu = urllib.parse.urlparse(t)
            if pu.netloc != host:
                continue
            t = pu._replace(query="").geturl() if not pu.query else t
            if t.endswith("/index.html"):
                add("WARN", url, f"link to index.html: {href}")
            inlinks.setdefault(t, set()).add(url)
            ts, loc = status(t)
            if ts >= 400 or ts == 0:
                add("ERROR", url, f"broken internal link {href} ({ts})")
            elif 300 <= ts < 400:
                add("WARN", url, f"internal link redirects {href} → {loc}")
            elif ts == 200 and t not in seen and t not in queue and not pu.query:
                queue.append(t)

    # site-wide checks
    idx = {u: i for u, i in pages.items() if not i["noindex"]}
    for field in ("title", "desc"):
        seen_vals = {}
        for u, i in idx.items():
            seen_vals.setdefault(i[field], []).append(u)
        for v, us in seen_vals.items():
            if v and len(us) > 1:
                add("ERROR", us[0], f"duplicate {field} on {len(us)} pages: {', '.join(us)}")
    for u in sitemap:
        if u != base + "/" and not inlinks.get(u):
            add("WARN", u, "orphan: in sitemap but no internal link found")
    for u, i in idx.items():
        if u not in sitemap_set and i["canonical"] and to_base(urllib.parse.urljoin(u, i["canonical"])) == u:
            add("WARN", u, "indexable, self-canonical page missing from sitemap")
    # hreflang reciprocity
    for u, i in pages.items():
        for lang, href in i["hreflang"].items():
            t = urllib.parse.urljoin(u, href)
            if t in pages and t != u and u not in [urllib.parse.urljoin(t, x) for x in pages[t]["hreflang"].values()]:
                add("ERROR", u, f"hreflang {lang} → {t} is not reciprocated")

    errs = [i for i in issues if i["level"] == "ERROR"]
    warns = [i for i in issues if i["level"] == "WARN"]
    for i in sorted(issues, key=lambda x: (x["level"], x["url"])):
        print(f"{i['level']:5} {i['url'].replace(base, '') or '/'}: {i['msg']}")
    print(f"\npages crawled: {len(pages)}  indexable: {len(idx)}  sitemap: {len(sitemap)}  "
          f"links checked: {len(status_cache)}  errors: {len(errs)}  warnings: {len(warns)}")
    if args.json:
        with open(args.json, "w") as f:
            json.dump({"base": base, "checked": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                       "pages": pages, "issues": issues}, f, indent=1, default=list)
    sys.exit(1 if errs else 0)


if __name__ == "__main__":
    main()
