import { ICONS, ALIASES, LUCIDE_VERSION } from './icon-data.js';
import { define } from './core.js';

const registry = new Map(Object.entries(ICONS));
const pending = new Map(); const failed = new Set();
const resolve = (n) => ALIASES[n] || n;
export const config = { cdn: `https://cdn.jsdelivr.net/npm/lucide-static@${LUCIDE_VERSION}/icons/` };

/** Return an <svg> string for a Lucide icon (bundled) or '' if not yet available. */
export function svgFor(name) {
  const inner = registry.get(resolve(name)); if (!inner) return '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${inner}</svg>`;
}
/** Create an icon element: <ui-icon name="x">. */
export function icon(name, size) { const el = document.createElement('ui-icon'); el.setAttribute('name', name); if (size) el.style.setProperty('--ui-icon-size', typeof size === 'number' ? `${size}px` : size); return el; }
export const icons = {
  has: (n) => registry.has(resolve(n)),
  register(name, inner) { registry.set(name, inner.replace(/^<svg[^>]*>|<\/svg>$/g, '')); document.querySelectorAll(`ui-icon[name="${name}"]`).forEach((e) => e.render?.()); },
  registerAll(map) { Object.entries(map).forEach(([k, v]) => icons.register(k, v)); },
  /** Load any Lucide icon not in the bundled set from the CDN (automatic on first use). */
  load(name) {
    const n = resolve(name); if (registry.has(n) || failed.has(n)) return Promise.resolve(registry.has(n));
    if (!pending.has(n)) pending.set(n, fetch(`${config.cdn}${n}.svg`).then((r) => { if (!r.ok) throw new Error(r.status); return r.text(); })
      .then((t) => { icons.register(n, t.replace(/<!--[\s\S]*?-->/g, '').replace(/<svg[^>]*>/, '').replace('</svg>', '').trim()); return true; })
      .catch(() => { failed.add(n); console.warn(`[edgelit] Unknown icon "${name}".`); return false; }).finally(() => pending.delete(n)));
    return pending.get(n);
  },
};

class UIIcon extends HTMLElement {
  static observedAttributes = ['name', 'size', 'stroke', 'label'];
  connectedCallback() { this.render(); }
  attributeChangedCallback() { if (this.isConnected) this.render(); }
  render() {
    const name = this.getAttribute('name'); if (!name) { this.innerHTML = ''; return; }
    const size = this.getAttribute('size'); if (size) this.style.setProperty('--ui-icon-size', /^\d+$/.test(size) ? `${size}px` : size);
    const stroke = this.getAttribute('stroke'); if (stroke) this.style.setProperty('--ui-icon-stroke', stroke);
    const label = this.getAttribute('label');
    if (label) { this.setAttribute('role', 'img'); this.setAttribute('aria-label', label); } else { this.setAttribute('aria-hidden', 'true'); }
    const svg = svgFor(name);
    if (svg) this.innerHTML = svg; else { this.innerHTML = ''; icons.load(name); }
  }
}
define('ui-icon', UIIcon);
export { UIIcon };
