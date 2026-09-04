/**
 * Artilier — Tweaks panel (vanilla, no framework).
 *
 * The page declares its defaults in an EDITMODE block and a spec:
 *
 *   const TWEAKS = /*EDITMODE-BEGIN*\/{ "rhythm": "even" }/*EDITMODE-END*\/;
 *   ArtilierTweaks.init(TWEAKS, [
 *     { key:'rhythm', label:'Gallery rhythm', options:[['even','Even grid'],…] }
 *   ]);
 *
 * Each key is mirrored onto <html data-tw-{key}="{value}"> so all of the styling
 * lives in CSS. The panel exists only while the host asks for it: nothing renders,
 * and no chrome ships, until __activate_edit_mode arrives.
 */
(() => {
  const S = document.createElement('style');
  S.textContent = `.atw{position:fixed;top:0;right:0;bottom:0;width:290px;z-index:9999;display:flex;flex-direction:column;gap:0;background:#151110;color:#F7F3EB;font:300 14px/1.5 'Jost',system-ui,sans-serif;box-shadow:-1px 0 0 rgba(247,243,235,.14);overflow-y:auto}
.atw[hidden]{display:none}
.atw-hd{display:flex;align-items:baseline;justify-content:space-between;gap:12px;padding:20px 22px 16px;border-bottom:1px solid rgba(247,243,235,.16)}
.atw-hd b{font:400 20px/1 'Cormorant Garamond',Garamond,serif;letter-spacing:.02em}
.atw-x{font:400 10px/1 'Jost',sans-serif;letter-spacing:.2em;text-transform:uppercase;color:rgba(247,243,235,.5);background:none;border:0;cursor:pointer;padding:4px}
.atw-x:hover{color:#C4A667}
.atw-g{padding:18px 22px;border-bottom:1px solid rgba(247,243,235,.1)}
.atw-g:last-child{border-bottom:0}
.atw-l{display:block;font:400 10px/1 'Jost',sans-serif;letter-spacing:.2em;text-transform:uppercase;color:#C4A667;margin-bottom:4px}
.atw-n{display:block;font-size:12.5px;line-height:1.55;color:rgba(247,243,235,.5);margin-bottom:12px}
.atw-o{display:grid;gap:6px}
.atw-o button{display:flex;align-items:baseline;justify-content:space-between;gap:10px;width:100%;text-align:left;padding:10px 12px;background:transparent;border:1px solid rgba(247,243,235,.2);color:rgba(247,243,235,.72);font:300 13.5px/1.3 'Jost',sans-serif;cursor:pointer;transition:border-color .2s,color .2s,background .2s}
.atw-o button:hover{border-color:rgba(247,243,235,.45);color:#F7F3EB}
.atw-o button[aria-pressed="true"]{background:#A04A29;border-color:#A04A29;color:#F7F3EB}
.atw-o button i{font-style:normal;font-size:10px;letter-spacing:.16em;text-transform:uppercase;opacity:.6}`;

  const api = {
    init(defaults, spec) {
      const values = Object.assign({}, defaults);
      const root = document.documentElement;
      const apply = () => { for (const k in values) root.setAttribute('data-tw-' + k, values[k]); };
      apply();

      let panel = null;
      const set = (k, v) => {
        values[k] = v;
        apply();
        if (panel) panel.querySelectorAll('button[data-k="' + k + '"]').forEach(b =>
          b.setAttribute('aria-pressed', String(b.dataset.v === v)));
        window.parent.postMessage({ type: '__edit_mode_set_keys', edits: { [k]: v } }, '*');
      };

      const build = () => {
        document.head.appendChild(S);
        panel = document.createElement('aside');
        panel.className = 'atw';
        panel.setAttribute('aria-label', 'Tweaks');
        const hd = document.createElement('div');
        hd.className = 'atw-hd';
        hd.innerHTML = '<b>Tweaks</b>';
        const x = document.createElement('button');
        x.className = 'atw-x'; x.type = 'button'; x.textContent = 'Close';
        x.onclick = () => { panel.hidden = true; window.parent.postMessage({ type: '__edit_mode_dismissed' }, '*'); };
        hd.appendChild(x);
        panel.appendChild(hd);
        for (const g of spec) {
          const w = document.createElement('div');
          w.className = 'atw-g';
          const l = document.createElement('span');
          l.className = 'atw-l'; l.textContent = g.label;
          w.appendChild(l);
          if (g.note) { const n = document.createElement('span'); n.className = 'atw-n'; n.textContent = g.note; w.appendChild(n); }
          const o = document.createElement('div');
          o.className = 'atw-o';
          for (const [val, name, hint] of g.options) {
            const b = document.createElement('button');
            b.type = 'button'; b.dataset.k = g.key; b.dataset.v = val;
            b.setAttribute('aria-pressed', String(values[g.key] === val));
            b.innerHTML = '<span></span>' + (hint ? '<i></i>' : '');
            b.firstChild.textContent = name;
            if (hint) b.lastChild.textContent = hint;
            b.onclick = () => set(g.key, val);
            o.appendChild(b);
          }
          w.appendChild(o);
          panel.appendChild(w);
        }
        document.body.appendChild(panel);
      };

      addEventListener('message', e => {
        const t = e.data && e.data.type;
        if (t === '__activate_edit_mode') { if (!panel) build(); panel.hidden = false; }
        else if (t === '__deactivate_edit_mode' && panel) panel.hidden = true;
      });
      window.parent.postMessage({ type: '__edit_mode_available' }, '*');
    }
  };
  window.ArtilierTweaks = api;
})();
