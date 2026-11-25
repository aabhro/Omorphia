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
