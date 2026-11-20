import { define, h, uid, emit, bool } from '../core.js';
import { icon } from '../icons.js';

export class UIAccordionItem extends HTMLElement {
  static observedAttributes = ['open', 'heading', 'disabled', 'value'];
  connectedCallback() {
    if (this.trigger) return;
    const content = [...this.childNodes];
    this.trigger = h('button', { class: 'ui-accordion-trigger', type: 'button', 'aria-expanded': 'false', 'aria-controls': uid('ui-accordion-panel') });
    this.heading = h('span', { class: 'ui-accordion-heading', text: this.getAttribute('heading') || '' });
    this.chevron = icon('chevron-down');
    this.trigger.append(this.heading, this.chevron);
    this.panel = h('div', { class: 'ui-accordion-panel', id: this.trigger.getAttribute('aria-controls'), role: 'region', 'aria-label': this.getAttribute('heading') || 'Accordion content' });
    this.inner = h('div', { class: 'ui-accordion-inner' }, content);
    this.panel.append(this.inner);
    this.replaceChildren(this.trigger, this.panel);
    this.trigger.addEventListener('click', () => this.toggle());
    this.trigger.addEventListener('keydown', (event) => this.onKey(event));
    this.sync();
    queueMicrotask(() => this.closest('ui-accordion')?.sync());
  }
  attributeChangedCallback() {
    if (this.trigger) this.sync();
    queueMicrotask(() => this.closest('ui-accordion')?.sync());
  }
  get open() { return bool(this, 'open'); }
  set open(value) { this.toggleAttribute('open', !!value); }
  get disabled() { return bool(this, 'disabled'); }
  set disabled(value) { this.toggleAttribute('disabled', !!value); }
  get value() { return this.getAttribute('value') || this.getAttribute('heading') || ''; }
  sync() {
    const heading = this.getAttribute('heading');
    if (heading != null) this.heading.textContent = heading;
    this.trigger.disabled = this.disabled;
    this.trigger.setAttribute('aria-expanded', String(this.open));
    this.trigger.setAttribute('aria-disabled', String(this.disabled));
    this.panel.setAttribute('aria-hidden', String(!this.open));
    this.inner.inert = !this.open;
    this.dataset.state = this.open ? 'open' : 'closed';
    this.panel.dataset.state = this.open ? 'open' : 'closed';
  }
  toggle() {
    if (this.disabled) return;
    if (!this.open) this.closest('ui-accordion')?._beforeOpen(this);
    this.open = !this.open;
    this.sync();
    emit(this, 'ui-change', { value: this.value, open: this.open, item: this });
    this.closest('ui-accordion')?._itemChanged(this);
  }
  onKey(event) {
    const root = this.closest('ui-accordion');
    const items = root ? root.items.filter((item) => !item.disabled) : [this];
    const at = items.indexOf(this);
    let target = null;
    if (event.key === 'ArrowDown') target = items[(at + 1) % items.length];
    else if (event.key === 'ArrowUp') target = items[(at - 1 + items.length) % items.length];
    else if (event.key === 'Home') target = items[0];
    else if (event.key === 'End') target = items.at(-1);
    if (target) { event.preventDefault(); target.trigger.focus(); }
  }
  focus(options) { this.trigger?.focus(options); }
  show() { if (!this.open && !this.disabled) this.toggle(); }
  hide() { if (this.open) this.toggle(); }
}
define('ui-accordion-item', UIAccordionItem);

export class UIAccordion extends HTMLElement {
  static observedAttributes = ['multiple', 'value'];
  connectedCallback() {
    if (!this._observer) {
      this._observer = new MutationObserver(() => this.sync());
      this._observer.observe(this, { childList: true });
    }
    this.sync();
  }
  disconnectedCallback() { this._observer?.disconnect(); }
  attributeChangedCallback() { if (this.isConnected) this.sync(); }
  get items() { return [...this.children].filter((child) => child.localName === 'ui-accordion-item'); }
  get multiple() { return bool(this, 'multiple'); }
  _beforeOpen(item) {
    if (!this.multiple) this.items.forEach((other) => { if (other !== item && other.open) { other.open = false; other.sync(); } });
  }
  _itemChanged(item) {
    if (!this.multiple) {
      if (item.open) this.setAttribute('value', item.value);
      else if (this.getAttribute('value') === item.value) this.removeAttribute('value');
    }
    emit(this, 'ui-change', { value: this.multiple ? this.items.filter((entry) => entry.open).map((entry) => entry.value) : (item.open ? item.value : ''), item, open: item.open });
  }
  sync() {
    const items = this.items;
    if (this.multiple) return;
    const wanted = this.getAttribute('value');
    let kept = false;
    items.forEach((item) => {
      if (wanted != null && item.value === wanted) { item.open = true; kept = true; }
      else if (item.open && kept) item.open = false;
      else if (item.open && wanted != null && item.value !== wanted) item.open = false;
      if (item.trigger) item.sync();
    });
    if (wanted == null) {
      const first = items.find((item) => item.open);
      if (first) { first.open = true; items.filter((item) => item !== first).forEach((item) => { item.open = false; if (item.trigger) item.sync(); }); }
    }
  }
}
define('ui-accordion', UIAccordion);
