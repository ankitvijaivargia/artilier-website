/* Navigation behaviour. The crafts panel already opens on hover and keyboard
   focus with CSS; this adds click/tap toggling, aria-expanded, Escape and
   click-outside, and marks the current section. Fails safe: without it the
   menu still works. */
(() => {
  const dd = document.querySelector('nav .dd');
  if (dd) {
    const btn = dd.querySelector('.dd-t');
    const set = open => {
      dd.classList.toggle('on', open);
      dd.classList.remove('off');
      btn.setAttribute('aria-expanded', String(open));
    };
    btn.addEventListener('click', e => { e.stopPropagation(); set(!dd.classList.contains('on')); });
    dd.addEventListener('mouseenter', () => { dd.classList.remove('off'); btn.setAttribute('aria-expanded', 'true'); });
    dd.addEventListener('mouseleave', () => { if (!dd.classList.contains('on')) btn.setAttribute('aria-expanded', 'false'); });
    dd.addEventListener('focusin', () => btn.setAttribute('aria-expanded', 'true'));
    dd.addEventListener('focusout', e => { if (!dd.contains(e.relatedTarget)) { set(false); dd.classList.remove('off'); } });
    document.addEventListener('click', e => { if (!dd.contains(e.target)) set(false); });
    document.addEventListener('keydown', e => {
      if (e.key !== 'Escape' || !(dd.classList.contains('on') || dd.matches(':hover, :focus-within'))) return;
      set(false);
      dd.classList.add('off');          // hide even while hovered or focused
      btn.focus();
    });
  }
  /* current section: the longest nav href that prefixes this path */
  const path = location.pathname.replace(/index\.html$/, '');
  const links = [...document.querySelectorAll('nav .nl a, nav .dd-l a, .mnav .mn-g a')];
  let best = 0;
  const score = a => {
    const p = new URL(a.href, location.href).pathname;
    return p !== '/' && path.startsWith(p) ? p.length : 0;
  };
  links.forEach(a => { best = Math.max(best, score(a)); });
  if (best) links.forEach(a => { if (score(a) === best) a.setAttribute('aria-current', 'page'); });
  if (dd && dd.querySelector('.dd-l a[aria-current]')) dd.querySelector('.dd-t').classList.add('cur');
})();
