/**
 * Artilier — production media renderer (read-only).
 *
 * Replaces the authoring components used in design. No editor, no drag-drop,
 * no localStorage, no IndexedDB: every slot resolves against
 * /assets/media/manifest.json, keyed by slot id.
 *
 * manifest entry:
 *   "w6": {
 *     "src":  "/assets/media/w6.webp",      // omit → slot renders empty
 *     "type": "image" | "video",            // optional, inferred from extension
 *     "alt":  "Hands tying knots at the loom",
 *     "view": { "s": 1.08, "x": -1.2, "y": 4.4 },   // crop, as authored
 *     "facts":"Hand-knotted · New Zealand wool"     // renders into [data-mf="w6"]
 *   }
 *
 * An `src` attribute in the markup wins over the manifest, so hero media can be
 * pinned in HTML. Empty slots render as a flat material tone — never a caption
 * or a call to action.
 */
(() => {
  const script = document.currentScript || document.querySelector('script[data-manifest]');
  const MANIFEST = new URL((script && script.dataset.manifest) || 'assets/media/manifest.json', document.baseURI).href;
  const VID = /\.(mp4|webm|mov|m4v)(\?.*)?$/i;
  const reduce = matchMedia('(prefers-reduced-motion:reduce)');
  let mp = null;
  const manifest = () => mp || (mp = fetch(MANIFEST).then(r => (r.ok ? r.json() : {})).catch(() => ({})));

  const style = document.createElement('style');
  style.textContent = `:where(media-slot,image-slot){position:absolute;inset:0;display:block;overflow:hidden;background:var(--is-empty-bg,#E4DACA)}
:where(media-slot)>video{display:block;width:100%;height:100%;object-fit:cover}
:where(media-slot,image-slot)>img{position:absolute;max-width:none;transform:translate(-50%,-50%);left:50%;top:50%;width:100%;height:100%;object-fit:cover}
:where(media-slot[data-fit="contain"])>img,:where(media-slot[data-fit="contain"])>video{object-fit:contain}`;
  document.head.appendChild(style);

  class Slot extends HTMLElement {
    connectedCallback() {
      if (this._done) return;
      this._done = true;
      this._id = this.getAttribute('id') || this.dataset.slotId || '';
      manifest().then(m => this._render((this._id && m[this._id]) || {}));
    }
    disconnectedCallback() { if (this._ro) this._ro.disconnect(); }

    _render(entry) {
      const src = this.getAttribute('src') || (entry.src ? new URL(entry.src, MANIFEST).href : '');
      const fit = this.getAttribute('fit') || entry.fit;
      if (fit) this.dataset.fit = fit;
      this._facts(entry);
      if (!src) { this.setAttribute('data-empty', ''); return; }
      this.removeAttribute('data-empty');
      const isVideo = entry.type ? entry.type === 'video' : VID.test(src);
      isVideo ? this._video(src, entry) : this._image(src, entry);
    }

    /* Captions: [data-mt] titles are authored in the HTML; only the facts line
       is data-driven, and an absent value renders nothing. */
    _facts(entry) {
      if (!this._id || !entry.facts) return;
      document.querySelectorAll('[data-mf="' + CSS.escape(this._id) + '"]').forEach(el => { el.textContent = entry.facts; });
    }

    _image(src, entry) {
      const img = document.createElement('img');
      img.src = src;
      img.alt = entry.alt || this.getAttribute('alt') || '';
      img.loading = this.hasAttribute('data-eager') ? 'eager' : 'lazy';
      if (img.loading === 'eager') img.fetchPriority = 'high';
      img.decoding = 'async';
      if (entry.alt || this.getAttribute('alt')) img.setAttribute('role', 'img'); else img.setAttribute('aria-hidden', 'true');
      this.appendChild(img);
      const view = entry.view;
      if (!view) return;
      /* Reproduces the authored crop: cover baseline × view scale, positioned
         by percentage of the frame, so it survives every responsive width. */
      this._img = img;
      const apply = () => {
        const fw = this.clientWidth, fh = this.clientHeight;
        const iw = img.naturalWidth, ih = img.naturalHeight;
        if (!fw || !fh || !iw || !ih) return;
        const base = Math.max(fw / iw, fh / ih) * (view.s || 1);
        img.style.width = (iw * base / fw * 100) + '%';
        img.style.height = (ih * base / fh * 100) + '%';
        img.style.left = (50 + (view.x || 0)) + '%';
        img.style.top = (50 + (view.y || 0)) + '%';
        img.style.objectFit = '';
      };
      /* Neither the load event nor ResizeObserver can be relied on to deliver
         here: a cached image may already be settled, and an observer's first
         callback can be missed entirely. Apply through several independent
         paths — the work is idempotent and cheap. */
      const applySoon = () => { apply(); requestAnimationFrame(apply); };
      img.addEventListener('load', () => applySoon());
      applySoon();
      img.decode().then(applySoon, applySoon);
      addEventListener('resize', apply, { passive: true });
      if ('ResizeObserver' in window) { this._ro = new ResizeObserver(apply); this._ro.observe(this); }
    }

    _video(src, entry) {
      const v = document.createElement('video');
      v.muted = true; v.loop = true; v.playsInline = true;
      v.setAttribute('playsinline', ''); v.setAttribute('muted', '');
      v.preload = 'none';
      v.setAttribute('aria-label', entry.alt || this.getAttribute('alt') || 'Process film');
      const poster = this.getAttribute('poster') || entry.poster;
      if (poster) v.poster = poster;
      this.appendChild(v);
      /* Load and play only once the frame is on screen, and never under
         reduced-motion — the poster or first frame stands in. */
      const play = () => {
        if (reduce.matches) return;
        const go = () => v.play().catch(() => {});
        go();
        v.addEventListener('canplay', go, { once: true });
      };
      /* Some static hosts (and this design preview) serve media without a
         Content-Length or byte-range support, which the media pipeline refuses
         with MEDIA_ERR_SRC_NOT_SUPPORTED even though the file is a valid MP4.
         Fetching the film once and handing over a blob sidesteps the streaming
         negotiation entirely. Only used as a fallback: a normal host streams. */
      const viaBlob = () => {
        if (this._blob) return;
        this._blob = true;
        fetch(src).then(r => (r.ok ? r.blob() : Promise.reject())).then(b => {
          v.src = URL.createObjectURL(b);
          v.load();
          play();
        }).catch(() => {});
      };
      v.addEventListener('error', viaBlob);
      const start = () => {
        if (v.src) return;
        v.src = src;
        v.load();
        play();
      };
      const inView = () => this.getBoundingClientRect().top < innerHeight + 200;
      /* Load once the frame is near the viewport, and never under reduced
         motion. The observer is an optimisation only — a viewport check runs
         immediately so a delayed or suppressed callback cannot strand the
         film, which is exactly what happens to a hero above the fold. */
      if (inView() || this.hasAttribute('data-eager')) { start(); return; }
      if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { start(); io.disconnect(); } }), { rootMargin: '200px' });
        io.observe(this);
        addEventListener('scroll', function once() { if (inView()) { start(); io.disconnect(); removeEventListener('scroll', once); } }, { passive: true });
      } else start();
    }
  }

  if (!customElements.get('media-slot')) customElements.define('media-slot', class extends Slot {});
  if (!customElements.get('image-slot')) customElements.define('image-slot', class extends Slot {});
})();
