import { define, h, uid, emit, floatEl, showFloat, hideFloat, place, whileOpen, inheritTheme } from '../core.js';

/** <ui-popover placement="bottom-start"><ui-button slot="trigger">Open</ui-button> …content… </ui-popover>
 *  Methods: show(), hide(), toggle(). Property: open. Events: ui-open, ui-close. */
export class UIPopover extends HTMLElement {
  static panelClass = 'ui-popover-panel'; static panelRole = 'dialog'; static haspopup = 'dialog';
  connectedCallback() {
    if (!this.panel) {
      const kids = [...this.childNodes];
      this.trigger = kids.find((n) => n.nodeType === 1 && n.getAttribute('slot') === 'trigger') || kids.find((n) => n.nodeType === 1);
      this.panel = floatEl(h('div', { class: this.constructor.panelClass, id: uid('ui-pop'), role: this.constructor.panelRole }));
      this.panel.append(...kids.filter((n) => n !== this.trigger)); this.append(this.panel);
      this.trigger?.addEventListener('click', (e) => { e.preventDefault(); this.toggle(); });
      this.trigger?.addEventListener('keydown', (e) => this.triggerKey(e));
      this.panel.addEventListener('keydown', (e) => this.panelKey(e));
      const t = this.trigger?.querySelector?.('button') || this.trigger; this.focusTarget = t;
      t?.setAttribute('aria-haspopup', this.constructor.haspopup); t?.setAttribute('aria-controls', this.panel.id); t?.setAttribute('aria-expanded', 'false');
    }
  }
  disconnectedCallback() { this.hide(); }
  get open() { return this.panel?.hasAttribute('data-open') || false; }
  set open(v) { v ? this.show() : this.hide(); }
  reposition = () => place(this.trigger, this.panel, { placement: this.getAttribute('placement') || 'bottom-start', offset: 6 });
  show() {
    if (this.open || !this.panel) return;
    inheritTheme(this, this.panel); this.enhance?.(); showFloat(this.panel); this.reposition();
    this.focusTarget?.setAttribute('aria-expanded', 'true');
    this._off = whileOpen({ anchor: this, floating: this.panel, reposition: this.reposition, onClose: (why) => { this.hide(); if (why === 'escape') this.focusTarget?.focus(); } });
    this.afterShow?.(); emit(this, 'ui-open');
  }
  hide() {
    if (!this.open) return;
    this._off?.(); hideFloat(this.panel); this.focusTarget?.setAttribute('aria-expanded', 'false'); emit(this, 'ui-close');
  }
  toggle() { this.open ? this.hide() : this.show(); }
  triggerKey() {} panelKey(e) { if (e.key === 'Tab') this.hide(); }
}
define('ui-popover', UIPopover);

/** <ui-dropdown><ui-button slot="trigger">Menu</ui-button><button data-value="a">Item</button><hr><button class="ui-menu-item--danger">Delete</button></ui-dropdown>
 *  Event: ui-select { item, value } */
export class UIDropdown extends UIPopover {
  static panelClass = 'ui-menu'; static panelRole = 'menu'; static haspopup = 'menu';
  get items() { return [...this.panel.querySelectorAll('.ui-menu-item')].filter((i) => !i.disabled && i.getAttribute('aria-disabled') !== 'true'); }
  enhance() {
    this.panel.querySelectorAll('button, a[href], [role="menuitem"]').forEach((el) => { el.classList.add('ui-menu-item'); el.setAttribute('role', 'menuitem'); el.setAttribute('tabindex', '-1'); if (el.localName === 'button') el.type = 'button'; });
    this.panel.querySelectorAll('hr').forEach((el) => { el.classList.add('ui-menu-sep'); el.setAttribute('role', 'separator'); });
    if (!this._wired) { this._wired = true; this.panel.addEventListener('click', (e) => { const it = e.target.closest('.ui-menu-item'); if (!it || it.disabled || it.getAttribute('aria-disabled') === 'true') return; emit(this, 'ui-select', { item: it, value: it.dataset.value ?? it.textContent.trim() }); this.hide(); this.focusTarget?.focus(); }); }
  }
  afterShow() { this.items[0]?.focus(); }
  triggerKey(e) { if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); this.show(); const it = this.items; (e.key === 'ArrowUp' ? it.at(-1) : it[0])?.focus(); } }
  panelKey(e) {
    const it = this.items; const i = it.indexOf(document.activeElement);
    const go = (n) => { e.preventDefault(); it[(n + it.length) % it.length]?.focus(); };
    if (e.key === 'ArrowDown') go(i + 1); else if (e.key === 'ArrowUp') go(i - 1); else if (e.key === 'Home') go(0); else if (e.key === 'End') go(it.length - 1);
    else if (e.key === 'Tab') this.hide();
    else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) { clearTimeout(this._tt); this._buf = (this._buf || '') + e.key.toLowerCase(); this._tt = setTimeout(() => (this._buf = ''), 600); const m = it.find((x) => x.textContent.trim().toLowerCase().startsWith(this._buf)); m?.focus(); }
  }
}
define('ui-dropdown', UIDropdown);
