import { define, h, uid, emit, bool } from '../core.js';
import { icon } from '../icons.js';

/** <ui-sidebar-item icon="house" href="#" active expanded label="Text"> label…  [nested <ui-sidebar-item>] </ui-sidebar-item> */
export class UISidebarItem extends HTMLElement {
  static observedAttributes = ['active', 'expanded', 'disabled'];
  connectedCallback() {
    if (this.link) return;
    const nested = [...this.children].filter((c) => c.localName === 'ui-sidebar-item');
    const labelNodes = [...this.childNodes].filter((n) => !nested.includes(n) && !(n.nodeType === 3 && !n.textContent.trim()));
    this.isGroup = nested.length > 0; const href = this.getAttribute('href');
    this.link = h(this.isGroup || !href ? 'button' : 'a', { class: 'ui-side-link', ...(this.isGroup || !href ? { type: 'button' } : { href }) });
    const label = h('span', { class: 'ui-side-label' }, labelNodes.length ? labelNodes : this.getAttribute('label') || '');
    this.text = label.textContent.trim();
    this.link.append(...[this.getAttribute('icon') && icon(this.getAttribute('icon')), label, this.isGroup && icon('chevron-down', 14)].filter(Boolean));
    if (this.isGroup) this.link.lastChild.classList.add('ui-side-chev');
    this.replaceChildren(this.link);
    if (this.isGroup) { this.group = h('div', { class: 'ui-side-group', role: 'group', id: uid('ui-side-grp'), 'aria-label': this.text }, nested); this.link.setAttribute('aria-controls', this.group.id); this.append(this.group); if (nested.some((n) => n.hasAttribute('active') || n.querySelector?.('[active]'))) this.setAttribute('expanded', ''); }
    this.link.addEventListener('click', (e) => this.onClick(e)); this.render();
  }
  attributeChangedCallback() { if (this.link) this.render(); }
  render() {
    this.link.toggleAttribute('disabled', bool(this, 'disabled'));
    if (this.isGroup) { const ex = bool(this, 'expanded'); this.link.setAttribute('aria-expanded', ex); this.group.hidden = !ex; }
    else bool(this, 'active') ? this.link.setAttribute('aria-current', 'page') : this.link.removeAttribute('aria-current');
  }
  onClick(e) {
    const sb = this.closest('ui-sidebar');
    if (this.isGroup) { if (sb?.collapsed && !sb.mobile) { sb.expand(); this.setAttribute('expanded', ''); } else this.toggleAttribute('expanded'); return; }
    sb?.select(this, e);
  }
}
define('ui-sidebar-item', UISidebarItem);

/** <ui-sidebar heading="Acme" collapsible collapsed width="260px" position="left|right" fixed breakpoint="768" open>
 *   <div slot="header">…</div> items… <div slot="footer">…</div></ui-sidebar>
 *  Methods: toggle(), collapse(), expand(), openMobile(), closeMobile(). Events: ui-select {item}, ui-toggle {collapsed, open}
 *  Any element with data-ui-toggle="#sidebar-id" toggles it. */
export class UISidebar extends HTMLElement {
  static observedAttributes = ['collapsed', 'open', 'width', 'breakpoint'];
  connectedCallback() {
    if (!this.nav) {
      const kids = [...this.childNodes]; const slot = (n) => kids.filter((k) => k.nodeType === 1 && k.getAttribute('slot') === n);
      const head = slot('header'), foot = slot('footer'), items = kids.filter((k) => !head.includes(k) && !foot.includes(k) && !(k.nodeType === 3 && !k.textContent.trim()));
      this.nav = h('nav', { class: 'ui-sidebar-panel', 'aria-label': this.getAttribute('label') || 'Sidebar' });
      const heading = this.getAttribute('heading');
      if (heading || head.length) this.nav.append(h('div', { class: 'ui-side-head' }, head.length ? head : [h('span', { class: 'ui-side-head-text', text: heading })]));
      this.scroll = h('div', { class: 'ui-side-scroll' }, items); this.nav.append(this.scroll);
      this.foot = h('div', { class: 'ui-side-foot' }, foot);
      if (bool(this, 'collapsible')) { this.colBtn = h('button', { class: 'ui-side-link', type: 'button', onclick: () => this.toggle() }); this.foot.append(this.colBtn); }
      if (this.foot.childNodes.length) this.nav.append(this.foot);
      this.replaceChildren(this.nav);
      this.nav.addEventListener('keydown', (e) => this.key(e));
    }
    this._mq = (window.matchMedia && matchMedia(`(max-width: ${(+this.getAttribute('breakpoint') || 768) - 1}px)`)) || { matches: false, addEventListener() {}, removeEventListener() {} };
    this._mqh = () => this.applyMode(); this._mq.addEventListener('change', this._mqh);
    this._esc = (e) => e.key === 'Escape' && this.mobile && this.hasAttribute('open') && this.closeMobile();
    document.addEventListener('keydown', this._esc); this.applyMode(); this.sync();
  }
  disconnectedCallback() { this._mq?.removeEventListener('change', this._mqh); document.removeEventListener('keydown', this._esc); this.scrim?.remove(); }
  attributeChangedCallback(n) { if (!this.nav) return; if (n === 'breakpoint') { this.disconnectedCallback(); this.connectedCallback(); } else this.sync(); }
  get mobile() { return this.hasAttribute('data-mobile'); }
  get collapsed() { return this.hasAttribute('collapsed'); }
  applyMode() { const m = this._mq.matches; this.toggleAttribute('data-mobile', m); if (!m) this.removeAttribute('open'); this.sync(); }
  sync() {
    const w = this.getAttribute('width'); w ? this.style.setProperty('--ui-sidebar-width', w) : this.style.removeProperty('--ui-sidebar-width');
    const c = this.collapsed && !this.mobile;
    if (this.colBtn) { this.colBtn.replaceChildren(icon(c ? 'panel-left-open' : 'panel-left-close'), h('span', { class: 'ui-side-label ui-side-collapse-label', text: 'Collapse' })); this.colBtn.setAttribute('aria-label', c ? 'Expand sidebar' : 'Collapse sidebar'); this.colBtn.setAttribute('aria-expanded', String(!c)); }
    this.querySelectorAll('ui-sidebar-item').forEach((it) => { if (!it.link) return; c ? it.link.setAttribute('title', it.text) : it.link.removeAttribute('title'); });
    if (this.mobile && this.hasAttribute('open')) { if (!this.scrim) { this.scrim = h('div', { class: 'ui-sidebar-scrim', onclick: () => this.closeMobile() }); document.body.append(this.scrim); this._prev = document.activeElement; this.querySelector('.ui-side-link')?.focus(); } }
    else if (this.scrim) { this.scrim.remove(); this.scrim = null; this._prev?.focus?.({ preventScroll: true }); }
  }
  collapse() { this.setAttribute('collapsed', ''); emit(this, 'ui-toggle', { collapsed: true, open: false }); }
  expand() { this.removeAttribute('collapsed'); emit(this, 'ui-toggle', { collapsed: false, open: this.hasAttribute('open') }); }
  openMobile() { if (this.mobile) { this.setAttribute('open', ''); emit(this, 'ui-toggle', { collapsed: false, open: true }); } }
  closeMobile() { this.removeAttribute('open'); emit(this, 'ui-toggle', { collapsed: false, open: false }); }
  toggle() { if (this.mobile) this.hasAttribute('open') ? this.closeMobile() : this.openMobile(); else this.collapsed ? this.expand() : this.collapse(); }
  select(item, e) {
    this.querySelectorAll('ui-sidebar-item[active]').forEach((i) => i !== item && i.removeAttribute('active')); item.setAttribute('active', '');
    const ev = emit(this, 'ui-select', { item, href: item.getAttribute('href') }, true); if (ev.defaultPrevented) e?.preventDefault();
    if (this.mobile) this.closeMobile();
  }
  key(e) {
    const links = [...this.nav.querySelectorAll('.ui-side-link')].filter((l) => !l.closest('.ui-side-group[hidden]') && !(this.collapsed && !this.mobile && l.closest('.ui-side-group'))); const i = links.indexOf(document.activeElement); if (i < 0) return;
    const go = (n) => { e.preventDefault(); links[(n + links.length) % links.length]?.focus(); };
    const item = document.activeElement.closest('ui-sidebar-item');
    if (e.key === 'ArrowDown') go(i + 1); else if (e.key === 'ArrowUp') go(i - 1); else if (e.key === 'Home') go(0); else if (e.key === 'End') go(links.length - 1);
    else if (e.key === 'ArrowRight' && item?.isGroup && !item.hasAttribute('expanded') && !this.collapsed) { e.preventDefault(); item.setAttribute('expanded', ''); }
    else if (e.key === 'ArrowLeft' && item?.isGroup && item.hasAttribute('expanded')) { e.preventDefault(); item.removeAttribute('expanded'); }
  }
}
define('ui-sidebar', UISidebar);

if (typeof document !== 'undefined' && !window.__omorphiaToggle) {
  window.__omorphiaToggle = true;
  document.addEventListener('click', (e) => { const t = e.target.closest?.('[data-ui-toggle]'); if (!t) return; const el = document.querySelector(t.getAttribute('data-ui-toggle')); el?.toggle?.(); });
}
