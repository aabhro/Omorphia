import { define, h, uid, emit, bool } from '../core.js';
import { icon } from '../icons.js';

/** <ui-modal heading="Title" size="sm|md|lg" persistent> body… <div slot="footer">buttons</div></ui-modal>
 *  Methods: show(), close(returnValue), toggle(). Events: ui-open, ui-before-close (cancelable), ui-close. */
export class UIModal extends HTMLElement {
  static observedAttributes = ['open', 'heading', 'size'];
  connectedCallback() {
    if (!this.dialog) {
      const footerKids = [...this.children].filter((c) => c.getAttribute('slot') === 'footer');
      const bodyKids = [...this.childNodes].filter((n) => !footerKids.includes(n));
      const tid = uid('ui-modal-title');
      this.titleEl = h('h2', { class: 'ui-modal-title', id: tid });
      this.closeBtn = h('button', { class: 'ui-btn ui-btn--subtle ui-btn--icon ui-btn--sm', type: 'button', 'aria-label': 'Close dialog', onclick: () => this.close('dismiss') }, icon('x'));
      this.body = h('div', { class: 'ui-modal-body' }, bodyKids);
      this.footer = h('div', { class: 'ui-modal-footer' }, footerKids);
      this.dialog = h('dialog', { class: 'ui-modal-panel', 'aria-labelledby': tid }, h('div', { class: 'ui-modal-header' }, this.titleEl, this.closeBtn), this.body, this.footer);
      this.dialog.addEventListener('cancel', (e) => { e.preventDefault(); this.close('escape'); });
      this.dialog.addEventListener('pointerdown', (e) => { if (e.target !== this.dialog || bool(this, 'persistent')) return; const r = this.dialog.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) this.close('backdrop'); });
      this.dialog.addEventListener('close', () => this._finish());
      this.replaceChildren(this.dialog);
    }
    this.sync(); if (this.hasAttribute('open') && !this.dialog.open) this.show();
  }
  disconnectedCallback() { if (this.dialog?.open) this.dialog.close(); }
  attributeChangedCallback(n) { if (!this.dialog) return; if (n === 'open') (this.hasAttribute('open') ? this.show() : this.close()); else this.sync(); }
  sync() {
    this.titleEl.textContent = this.getAttribute('heading') || '';
    this.dialog.classList.remove('ui-modal--sm', 'ui-modal--lg'); const s = this.getAttribute('size'); if (s === 'sm' || s === 'lg') this.dialog.classList.add(`ui-modal--${s}`);
    this.closeBtn.hidden = bool(this, 'persistent');
  }
  get open() { return !!this.dialog?.open; }
  set open(v) { v ? this.show() : this.close(); }
  show() {
    if (this.dialog.open) return;
    this._prev = document.activeElement; this.dialog.returnValue = '';
    typeof this.dialog.showModal === 'function' ? this.dialog.showModal() : this.dialog.setAttribute('open', '');
    if (!this.hasAttribute('open')) this.setAttribute('open', '');
    (this.dialog.querySelector('[autofocus]') || this.body.querySelector('input,select,textarea,button,a[href]') || this.footer.querySelector('button') || this.dialog).focus?.();
    emit(this, 'ui-open');
  }
  close(returnValue = '') {
    if (!this.dialog?.open) { this.removeAttribute('open'); return; }
    if (emit(this, 'ui-before-close', { reason: returnValue }, true).defaultPrevented) return;
    this.dialog.returnValue = returnValue;
    typeof this.dialog.close === 'function' ? this.dialog.close(returnValue) : (this.dialog.removeAttribute('open'), this._finish());
  }
  _finish() { this.removeAttribute('open'); this._prev?.focus?.({ preventScroll: true }); emit(this, 'ui-close', { returnValue: this.dialog.returnValue }); }
  toggle() { this.open ? this.close() : this.show(); }
}
define('ui-modal', UIModal);

/** confirm({ title, message, confirmLabel, cancelLabel, destructive }) → Promise<boolean> */
export function confirm({ title = 'Are you sure?', message = '', confirmLabel = 'Confirm', cancelLabel = 'Cancel', destructive = false } = {}) {
  return new Promise((resolve) => {
    const ok = h('ui-button', { variant: destructive ? 'destructive' : 'primary', slot: 'footer-ok', text: confirmLabel });
    const no = h('ui-button', { variant: 'subtle', text: cancelLabel });
    const footer = h('div', { slot: 'footer', style: 'display:contents' }, no, ok);
    const m = h('ui-modal', { heading: title, size: 'sm' }, message, footer);
    let result = false;
    ok.addEventListener('click', () => { result = true; m.close('confirm'); }); no.addEventListener('click', () => m.close('cancel'));
    m.addEventListener('ui-close', () => { m.remove(); resolve(result); });
    document.body.append(m); requestAnimationFrame(() => m.show());
  });
}
