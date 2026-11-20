import { define, h, uid, floatEl, showFloat, hideFloat, place, inheritTheme } from '../core.js';

/** <ui-tooltip content="Text" placement="top" delay="250">…target…</ui-tooltip> */
export class UITooltip extends HTMLElement {
  static observedAttributes = ['content'];
  connectedCallback() {
    this.target = this.firstElementChild || this;
    if (!this.bubble) {
      this.bubble = floatEl(h('div', { class: 'ui-tooltip-bubble', role: 'tooltip', id: uid('ui-tip') }));
      this._show = () => { clearTimeout(this._t); this._t = setTimeout(() => this.show(), +(this.getAttribute('delay') ?? 250)); };
      this._hide = () => { clearTimeout(this._t); this.hide(); };
      this._key = (e) => e.key === 'Escape' && this._hide();
    }
    this.sync();
    for (const [ev, fn] of [['pointerenter', this._show], ['pointerleave', this._hide], ['focusin', () => this.show()], ['focusout', this._hide], ['keydown', this._key], ['pointerdown', this._hide]]) this.addEventListener(ev, fn);
  }
  disconnectedCallback() { clearTimeout(this._t); this.hide(); this.bubble?.remove(); for (const [ev, fn] of [['pointerenter', this._show], ['pointerleave', this._hide], ['focusout', this._hide], ['keydown', this._key], ['pointerdown', this._hide]]) this.removeEventListener(ev, fn); }
  attributeChangedCallback() { if (this.bubble) this.sync(); }
  describedTarget() { const f = this.firstElementChild || this; return (f.localName === 'ui-button' && f.querySelector('button')) || f; }
  sync() { this.bubble.textContent = this.getAttribute('content') || ''; const el = this.describedTarget(); const ex = el.getAttribute('aria-describedby'); if (!ex?.includes(this.bubble.id)) el.setAttribute('aria-describedby', [ex, this.bubble.id].filter(Boolean).join(' ')); }
  show() {
    if (!this.getAttribute('content')) return; this.sync();
    document.body.append(this.bubble); inheritTheme(this, this.bubble); showFloat(this.bubble);
    place(this.firstElementChild || this, this.bubble, { placement: this.getAttribute('placement') || 'top', offset: 8 });
  }
  hide() { if (this.bubble) { hideFloat(this.bubble); this.bubble.remove(); } }
}
define('ui-tooltip', UITooltip);
