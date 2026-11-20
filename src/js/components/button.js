import { define, h, bool } from '../core.js';
import { icon } from '../icons.js';

/** <ui-button variant="primary|secondary|subtle|destructive" size="sm|md|lg" icon="name" icon-end="name" loading disabled type label> */
export class UIButton extends HTMLElement {
  static observedAttributes = ['variant', 'size', 'icon', 'icon-end', 'loading', 'disabled', 'type', 'label', 'aria-label'];
  connectedCallback() {
    if (!this.button) {
      const kids = [...this.childNodes];
      this.button = h('button', { class: 'ui-btn' });
      this.labelEl = h('span', { class: 'ui-btn-label' }); kids.forEach((k) => this.labelEl.append(k));
      this.append(this.button);
    }
    this.render();
  }
  attributeChangedCallback() { if (this.button) this.render(); }
  render() {
    const b = this.button, v = this.getAttribute('variant') || 'secondary', s = this.getAttribute('size');
    const hasText = !!this.labelEl.textContent.trim() || this.labelEl.children.length > 0;
    b.className = ['ui-btn', `ui-btn--${v}`, s && s !== 'md' && `ui-btn--${s}`, !hasText && 'ui-btn--icon', bool(this, 'loading') && 'is-loading'].filter(Boolean).join(' ');
    b.type = this.getAttribute('type') || 'button';
    b.disabled = bool(this, 'disabled') || bool(this, 'loading');
    bool(this, 'loading') ? b.setAttribute('aria-busy', 'true') : b.removeAttribute('aria-busy');
    const label = this.getAttribute('label') || this.getAttribute('aria-label');
    label ? b.setAttribute('aria-label', label) : b.removeAttribute('aria-label');
    if (!hasText && !label) console.warn('[edgelit] Icon-only <ui-button> needs a label attribute for screen readers.', this);
    const start = this.getAttribute('icon'), end = this.getAttribute('icon-end');
    b.replaceChildren(...[start && icon(start), hasText && this.labelEl, end && icon(end)].filter(Boolean));
  }
  focus(o) { this.button?.focus(o); }
  click() { this.button?.click(); }
  get loading() { return bool(this, 'loading'); } set loading(v) { this.toggleAttribute('loading', !!v); }
  get disabled() { return bool(this, 'disabled'); } set disabled(v) { this.toggleAttribute('disabled', !!v); }
}
define('ui-button', UIButton);
