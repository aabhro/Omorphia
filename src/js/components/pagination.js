import { define, h, emit } from '../core.js';
import { icon } from '../icons.js';

/** <ui-pagination total="20" page="3" siblings="1">   Event: ui-change { page } */
export class UIPagination extends HTMLElement {
  static observedAttributes = ['total', 'page', 'siblings'];
  connectedCallback() { this.render(); }
  attributeChangedCallback() { if (this.isConnected) this.render(); }
  get total() { return Math.max(1, +this.getAttribute('total') || 1); }
  get page() { return Math.min(this.total, Math.max(1, +this.getAttribute('page') || 1)); }
  set page(v) { this.go(v); }
  go(p) { p = Math.min(this.total, Math.max(1, +p)); if (p === this.page) return; this.setAttribute('page', p); emit(this, 'ui-change', { page: p }); this.querySelector('[aria-current="page"]')?.focus(); }
  range() {
    const t = this.total, p = this.page, s = Math.max(0, +(this.getAttribute('siblings') ?? 1)); const keep = new Set([1, t]);
    for (let i = p - s; i <= p + s; i++) if (i > 0 && i <= t) keep.add(i);
    const out = []; let prev = 0; [...keep].sort((a, b) => a - b).forEach((n) => { if (n - prev === 2) out.push(n - 1); else if (n - prev > 2) out.push('…'); out.push(n); prev = n; }); return out;
  }
  render() {
    const p = this.page, t = this.total;
    const btn = (label, aria, go, extra = {}) => h('button', { class: 'ui-page-btn', type: 'button', 'aria-label': aria, onclick: () => this.go(go), ...extra }, label);
    this.replaceChildren(h('nav', { class: 'ui-pagination', 'aria-label': this.getAttribute('label') || 'Pagination' },
      btn(icon('chevron-left'), 'Previous page', p - 1, { disabled: p === 1 }),
      ...this.range().map((n) => n === '…' ? h('span', { class: 'ui-page-gap', 'aria-hidden': 'true' }, '…') : btn(String(n), `Page ${n}`, n, n === p ? { 'aria-current': 'page' } : {})),
      btn(icon('chevron-right'), 'Next page', p + 1, { disabled: p === t })));
  }
}
define('ui-pagination', UIPagination);
