import { define, h, uid, emit, bool } from '../core.js';

const drawers = new Set();
let previousOverflow = '';

export class UIDrawer extends HTMLElement {
  static observedAttributes = ['open', 'heading', 'placement', 'size', 'persistent'];
  connectedCallback() {
    if (this.panel) {
      this.sync();
      if (bool(this, 'open')) this.show();
      else this.hidden = true;
      return;
    }
    const children = [...this.childNodes];
    const headerSlot = children.filter((node) => node.nodeType === 1 && node.getAttribute('slot') === 'header');
    const footerSlot = children.filter((node) => node.nodeType === 1 && node.getAttribute('slot') === 'footer');
    const bodyNodes = children.filter((node) => !headerSlot.includes(node) && !footerSlot.includes(node));
    this.backdrop = h('div', { class: 'ui-drawer-backdrop', 'aria-hidden': 'true' });
    this.panel = h('section', { class: 'ui-drawer-panel', role: 'dialog', 'aria-modal': 'true', tabindex: '-1', 'aria-labelledby': uid('ui-drawer-title') });
    this.header = h('header', { class: 'ui-drawer-header' });
    this.heading = h('h2', { class: 'ui-drawer-title', id: this.panel.getAttribute('aria-labelledby'), text: this.getAttribute('heading') || '' });
    this.closeButton = h('ui-button', { variant: 'subtle', icon: 'x', label: 'Close drawer', size: 'sm' });
    this.closeButton.addEventListener('click', () => this.close('dismiss'));
    this.header.append(...headerSlot, this.heading, this.closeButton);
    this.body = h('div', { class: 'ui-drawer-body' }, bodyNodes);
    this.footer = h('footer', { class: 'ui-drawer-footer' }, footerSlot);
    this.panel.append(this.header, this.body, this.footer);
    this.append(this.backdrop, this.panel);
    this.backdrop.addEventListener('click', () => { if (!bool(this, 'persistent')) this.close('backdrop'); });
    this.addEventListener('keydown', (event) => this.onKey(event));
    this.sync();
    if (bool(this, 'open')) this.show(); else this.hidden = true;
  }
  attributeChangedCallback(name) {
    if (!this.panel) return;
    if (name === 'open') { if (bool(this, 'open')) this.show(); else this.close('attribute'); }
    else this.sync();
  }
  sync() {
    this.heading.textContent = this.getAttribute('heading') || this.heading.textContent;
    this.dataset.placement = ['left', 'right', 'top', 'bottom'].includes(this.getAttribute('placement')) ? this.getAttribute('placement') : 'right';
    this.dataset.size = this.getAttribute('size') || 'md';
    this.closeButton.hidden = bool(this, 'persistent');
  }
  get open() { return this.dataset.state === 'open'; }
  set open(value) { value ? this.show() : this.close(); }
  show() {
    if (this.open || !this.panel) return;
    clearTimeout(this._closeTimer);
    this._previousFocus = this.ownerDocument.activeElement;
    if (!drawers.size) { previousOverflow = document.body.style.overflow; document.body.style.overflow = 'hidden'; }
    drawers.add(this);
    this.hidden = false;
    this.dataset.state = 'open';
    this.setAttribute('open', '');
    requestAnimationFrame(() => {
      if (!this.open) return;
      const target = this.panel.querySelector('[autofocus],ui-button:not([disabled]),ui-input:not([disabled]),ui-textarea:not([disabled]),ui-select:not([disabled]),ui-date-picker:not([disabled]),ui-time-picker:not([disabled]),ui-checkbox:not([disabled]),ui-radio:not([disabled]),ui-switch:not([disabled]),ui-range:not([disabled]),ui-accordion-item:not([disabled]),[href],[tabindex]:not([tabindex="-1"])');
      (target || this.panel).focus?.({ preventScroll: true });
    });
    emit(this, 'ui-open');
  }
  close(reason = '') {
    if (!this.panel || !this.dataset.state || this.dataset.state === 'closing') return;
    this.dataset.state = 'closing';
    this.removeAttribute('open');
    drawers.delete(this);
    if (!drawers.size) document.body.style.overflow = previousOverflow;
    clearTimeout(this._closeTimer);
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    this._closeTimer = setTimeout(() => {
      if (this.dataset.state !== 'closing') return;
      delete this.dataset.state;
      this.hidden = true;
      this._previousFocus?.isConnected && this._previousFocus.focus?.({ preventScroll: true });
      emit(this, 'ui-close', { reason });
    }, reduced ? 0 : 240);
  }
  toggle() { this.open ? this.close() : this.show(); }
  onKey(event) {
    if (event.key === 'Escape' && !bool(this, 'persistent')) { event.preventDefault(); this.close('escape'); return; }
    if (event.key !== 'Tab' || !this.open) return;
    const focusable = [...this.panel.querySelectorAll('ui-button:not([disabled]),ui-input:not([disabled]),ui-textarea:not([disabled]),ui-select:not([disabled]),ui-date-picker:not([disabled]),ui-time-picker:not([disabled]),ui-checkbox:not([disabled]),ui-radio:not([disabled]),ui-switch:not([disabled]),ui-range:not([disabled]),ui-accordion-item:not([disabled]),[href],[tabindex]:not([tabindex="-1"])')]
      .filter((node) => !node.hidden && node.getAttribute('aria-hidden') !== 'true');
    if (!focusable.length) { event.preventDefault(); this.panel.focus(); return; }
    const first = focusable[0], last = focusable[focusable.length - 1];
    if (event.shiftKey && (document.activeElement === first || !this.panel.contains(document.activeElement))) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && (document.activeElement === last || !this.panel.contains(document.activeElement))) { event.preventDefault(); first.focus(); }
  }
  disconnectedCallback() {
    clearTimeout(this._closeTimer);
    if (drawers.delete(this) && !drawers.size) document.body.style.overflow = previousOverflow;
    delete this.dataset.state;
    this.hidden = true;
    this._previousFocus = null;
  }
}
define('ui-drawer', UIDrawer);
