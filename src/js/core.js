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

/* Floating surfaces are portalled out of clipped ancestors, then promoted to the native top layer when available. */
const hasPopover = () => typeof HTMLElement !== 'undefined' && 'popover' in HTMLElement.prototype;
let floatLayer = null;
let floatSequence = 0;

function getFloatLayer() {
  if (floatLayer?.isConnected) return floatLayer;
  floatLayer = document.querySelector('[data-ui-floating-layer]');
  if (!floatLayer) {
    floatLayer = document.createElement('div');
    floatLayer.setAttribute('data-ui-floating-layer', '');
    Object.assign(floatLayer.style, {
      position: 'fixed', inset: '0', zIndex: '1800',
      pointerEvents: 'none', isolation: 'isolate', overflow: 'visible'
    });
    (document.body || document.documentElement).append(floatLayer);
  }
  return floatLayer;
}

function portalFloat(el) {
  if (el._uiFloatMode && el.parentNode === floatLayer) {
    el.style.zIndex = String(++floatSequence);
    return;
  }
  const inherited = [];
  if (typeof getComputedStyle === 'function') {
    const computed = getComputedStyle(el);
    for (let i = 0; i < computed.length; i++) {
      const name = computed[i];
      if (!name.startsWith('--')) continue;
      const value = computed.getPropertyValue(name);
      if (value) inherited.push([name, value, el.style.getPropertyValue(name), el.style.getPropertyPriority(name)]);
    }
  }
  if (el.parentNode && !el._uiFloatPlaceholder) {
    el._uiFloatPlaceholder = document.createComment('ui-float-origin');
    el.parentNode.insertBefore(el._uiFloatPlaceholder, el);
  }
  const layer = getFloatLayer();
  if (el.parentNode !== layer) layer.append(el);
  el._uiFloatSavedVars = inherited.map(([name, value, oldValue, priority]) => {
    el.style.setProperty(name, value);
    return [name, oldValue, priority];
  });
  if (el._uiFloatSavedZ == null) el._uiFloatSavedZ = el.style.zIndex;
  el.style.zIndex = String(++floatSequence);
  el._uiFloatMode = 'portal';
}

function restoreFloat(el) {
  const marker = el._uiFloatPlaceholder;
  if (marker?.parentNode) marker.parentNode.insertBefore(el, marker);
  else el.remove();
  marker?.remove();
  el._uiFloatPlaceholder = null;
  for (const [name, value, priority] of el._uiFloatSavedVars || []) {
    if (value) el.style.setProperty(name, value, priority);
    else el.style.removeProperty(name);
  }
  el._uiFloatSavedVars = null;
  if (el._uiFloatSavedZ != null) el.style.zIndex = el._uiFloatSavedZ;
  else el.style.removeProperty('z-index');
  el._uiFloatSavedZ = null;
  el._uiFloatMode = null;
}

export function floatEl(el) {
  el.classList.add('ui-float');
  if (hasPopover()) el.setAttribute('popover', 'manual');
  return el;
}
export function showFloat(el) {
  el.setAttribute('data-open', '');
  portalFloat(el);
  if (hasPopover() && el.hasAttribute('popover')) {
    try {
      if (!el.matches(':popover-open')) el.showPopover();
      el._uiFloatMode = 'native-portal';
    } catch (_) {
      el.removeAttribute('popover');
    }
  }
}
export function hideFloat(el) {
  el.removeAttribute('data-open');
  if (el._uiFloatMode === 'native-portal') {
    try { if (el.matches(':popover-open')) el.hidePopover(); } catch (_) {}
  }
  if (el._uiFloatMode === 'portal' || el._uiFloatMode === 'native-portal') restoreFloat(el);
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

/* Position a floating surface against the viewport, flipping only when the requested side lacks room. */
export function place(anchor, floating, { placement = 'bottom', offset = 8, matchWidth = false } = {}) {
  if (!anchor || !floating) return;
  const a = anchor.getBoundingClientRect();
  const vw = Math.max(1, document.documentElement.clientWidth || window.innerWidth);
  const vh = Math.max(1, document.documentElement.clientHeight || window.innerHeight);
  const pad = 8;
  floating.style.minWidth = matchWidth ? `${a.width}px` : '';
  floating.style.width = matchWidth ? `${a.width}px` : '';
  floating.style.maxWidth = `${Math.max(120, vw - pad * 2)}px`;
  // Native popovers default to inset: 0; clear all four edges before assigning viewport coordinates.
  floating.style.inset = 'auto';
  floating.style.right = 'auto';
  floating.style.bottom = 'auto';
  floating.style.maxHeight = '';
  floating.style.overflowY = '';
  floating.style.left = '0px';
  floating.style.top = '0px';
  const f = floating.getBoundingClientRect();
  const [requestedSide, align = 'center'] = placement.split('-');
  const opposite = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' };
  let side = ['top', 'bottom', 'left', 'right'].includes(requestedSide) ? requestedSide : 'bottom';
  const verticalRoom = (value) => value === 'bottom' ? vh - a.bottom - offset - pad : a.top - offset - pad;
  const horizontalRoom = (value) => value === 'right' ? vw - a.right - offset - pad : a.left - offset - pad;

  if (side === 'top' || side === 'bottom') {
    if (f.height > verticalRoom(side) && verticalRoom(opposite[side]) > verticalRoom(side)) side = opposite[side];
  } else if (f.width > horizontalRoom(side) && horizontalRoom(opposite[side]) > horizontalRoom(side)) {
    side = opposite[side];
  }

  const verticalSide = side === 'top' || side === 'bottom'
    ? side
    : (a.top > vh - a.bottom ? 'top' : 'bottom');
  const availableHeight = Math.max(80, Math.floor(verticalRoom(verticalSide)));
  const maxHeight = Math.min(vh - pad * 2, availableHeight);
  floating.style.maxHeight = `${maxHeight}px`;
  if (f.height > maxHeight) floating.style.overflowY = 'auto';

  let x, y;
  if (side === 'top' || side === 'bottom') {
    y = side === 'top' ? a.top - f.height - offset : a.bottom + offset;
    x = align === 'start' ? a.left : align === 'end' ? a.right - f.width : a.left + (a.width - f.width) / 2;
  } else {
    x = side === 'left' ? a.left - f.width - offset : a.right + offset;
    y = align === 'start' ? a.top : align === 'end' ? a.bottom - f.height : a.top + (a.height - f.height) / 2;
  }
  x = Math.max(pad, Math.min(x, vw - f.width - pad));
  y = Math.max(pad, Math.min(y, vh - Math.min(f.height, maxHeight) - pad));
  floating.style.left = `${Math.round(x)}px`;
  floating.style.top = `${Math.round(y)}px`;
  floating.setAttribute('data-placement', side);
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
