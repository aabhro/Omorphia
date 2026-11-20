// Shared helpers. No DOM side effects on import.
let _n = 0;
export const uid = (p = 'ui') => `${p}-${++_n}`;
export const define = (name, ctor) => { if (!customElements.get(name)) customElements.define(name, ctor); };
export const emit = (el, name, detail = {}, cancelable = false) => {
  const ev = new CustomEvent(name, { detail, bubbles: true, composed: true, cancelable });
  el.dispatchEvent(ev); return ev;
};
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const bool = (el, name) => el.hasAttribute(name) && el.getAttribute(name) !== 'false';
export const isMac = () => /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);

export function h(tag, attrs = {}, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'text') el.textContent = v;
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const kid of kids.flat()) if (kid != null && kid !== false) el.append(kid.nodeType ? kid : document.createTextNode(kid));
  return el;
}

/* Fuzzy match: returns { score, ranges } or null. Substring beats subsequence. */
export function fuzzy(text, query) {
  const t = text.toLowerCase(), q = query.toLowerCase().trim();
  if (!q) return { score: 0, ranges: [] };
  const i = t.indexOf(q);
  if (i >= 0) return { score: 100 - i - (t.length - q.length) * 0.1 + (i === 0 ? 20 : 0), ranges: [[i, i + q.length]] };
  let ti = 0, score = 0, last = -2; const ranges = [];
  for (const ch of q.replace(/\s+/g, '')) {
    const f = t.indexOf(ch, ti); if (f < 0) return null;
    if (f === last + 1) { score += 3; ranges[ranges.length - 1][1] = f + 1; } else { score += 1; ranges.push([f, f + 1]); }
    last = f; ti = f + 1;
  }
  return { score, ranges };
}
export function highlight(text, ranges = []) {
  const frag = document.createDocumentFragment(); let pos = 0;
  for (const [a, b] of ranges) {
    if (a > pos) frag.append(text.slice(pos, a));
    frag.append(h('mark', { class: 'ui-mark', text: text.slice(a, b) })); pos = b;
  }
  if (pos < text.length) frag.append(text.slice(pos));
  return frag;
}

/* Floating layer: top layer via the Popover API when available, class-based fallback otherwise. */
const hasPopover = () => typeof HTMLElement !== 'undefined' && 'popover' in HTMLElement.prototype;
export function floatEl(el) {
  el.classList.add('ui-float');
  if (hasPopover()) el.setAttribute('popover', 'manual');
  return el;
}
export function showFloat(el) {
  el.setAttribute('data-open', '');
  if (hasPopover()) { try { if (!el.matches(':popover-open')) el.showPopover(); } catch (_) {} }
}
export function hideFloat(el) {
  el.removeAttribute('data-open');
  if (hasPopover()) { try { if (el.matches(':popover-open')) el.hidePopover(); } catch (_) {} }
}
/* Morph a floating surface from the control that opened it. Uses geometry, not a generic fade. */
export function morphSurface(anchor, surface, opening = true) {
  if (!anchor || !surface || typeof surface.animate !== 'function') return null;
  if (globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return null;
  const a = anchor.getBoundingClientRect();
  const b = surface.getBoundingClientRect();
  if (!a.width || !a.height || !b.width || !b.height) return null;
  const originX = ((a.left + a.width / 2 - b.left) / b.width) * 100;
  const originY = ((a.top + a.height / 2 - b.top) / b.height) * 100;
  const scaleX = Math.max(0.12, Math.min(1, a.width / b.width));
  const scaleY = Math.max(0.12, Math.min(1, a.height / b.height));
  surface.style.transformOrigin = originX + '% ' + originY + '%';
  const from = { opacity: 0, transform: 'scale(' + scaleX + ',' + scaleY + ')' };
  const to = { opacity: 1, transform: 'scale(1,1)' };
  return surface.animate(opening ? [from, to] : [to, from], {
    duration: opening ? 190 : 145,
    easing: opening ? 'cubic-bezier(.16,1,.3,1)' : 'cubic-bezier(.4,0,1,1)',
    fill: 'both'
  });
}

export function inheritTheme(from, to) {
  const t = from.closest('[data-ui-theme]')?.getAttribute('data-ui-theme');
  if (t) to.setAttribute('data-ui-theme', t); else to.removeAttribute('data-ui-theme');
}

/* Position `floating` next to `anchor`. placement: top|bottom|left|right + -start|-end. Flips and clamps to viewport. */
export function place(anchor, floating, { placement = 'bottom', offset = 8, matchWidth = false } = {}) {
  const a = anchor.getBoundingClientRect(); const vw = document.documentElement.clientWidth, vh = document.documentElement.clientHeight;
  floating.style.minWidth = matchWidth ? `${a.width}px` : ''; if (matchWidth) floating.style.width = `${a.width}px`;
  floating.style.left = '0px'; floating.style.top = '0px';
  const f = floating.getBoundingClientRect(); const [side, align = 'center'] = placement.split('-');
  const pos = (s) => {
    let x, y;
    if (s === 'top' || s === 'bottom') { y = s === 'top' ? a.top - f.height - offset : a.bottom + offset; x = align === 'start' ? a.left : align === 'end' ? a.right - f.width : a.left + (a.width - f.width) / 2; }
    else { x = s === 'left' ? a.left - f.width - offset : a.right + offset; y = align === 'start' ? a.top : align === 'end' ? a.bottom - f.height : a.top + (a.height - f.height) / 2; }
    return { x, y, s };
  };
  const over = (p) => p.y < 4 || p.y + f.height > vh - 4 || p.x < 4 || p.x + f.width > vw - 4;
  const opposite = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' };
  let p = pos(side); if (over(p)) { const q = pos(opposite[side]); if (!over(q) || (side === 'top' || side === 'bottom' ? (q.y >= 4 && q.y + f.height <= vh - 4) : true)) p = q; }
  p.x = Math.max(4, Math.min(p.x, vw - f.width - 4)); p.y = Math.max(4, Math.min(p.y, vh - f.height - 4));
  floating.style.left = `${Math.round(p.x)}px`; floating.style.top = `${Math.round(p.y)}px`; floating.setAttribute('data-placement', p.s);
}

/* Close handlers while open: outside pointerdown, Escape, reposition on scroll/resize. */
export function whileOpen({ anchor, floating, onClose, reposition, escape = true }) {
  const down = (e) => { if (!floating.contains(e.target) && !anchor.contains(e.target)) onClose('outside'); };
  const key = (e) => { if (e.key === 'Escape') { e.stopPropagation(); onClose('escape'); } };
  const move = () => reposition();
  document.addEventListener('pointerdown', down, true); if (escape) document.addEventListener('keydown', key, true);
  window.addEventListener('resize', move); window.addEventListener('scroll', move, true);
  return () => { document.removeEventListener('pointerdown', down, true); document.removeEventListener('keydown', key, true); window.removeEventListener('resize', move); window.removeEventListener('scroll', move, true); };
}
export const debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };
