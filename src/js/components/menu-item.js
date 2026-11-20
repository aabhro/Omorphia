import { define, h } from '../core.js';
import { icon } from '../icons.js';

export class UIMenuItem extends HTMLElement {
  static observedAttributes = ['value', 'label', 'icon', 'shortcut', 'disabled', 'destructive'];
  connectedCallback() {
    if (this.labelNode) return;
    const label = this.getAttribute('label') || this.textContent.trim();
    this.classList.add('ui-menu-item');
    this.setAttribute('role', 'menuitem');
    this.tabIndex = -1;
    this.labelNode = h('span', { class: 'ui-menu-item-label', text: label });
    this.replaceChildren(
      this.hasAttribute('icon') ? icon(this.getAttribute('icon')) : null,
      this.labelNode,
      this.hasAttribute('shortcut') ? h('span', { class: 'ui-menu-shortcut', text: this.getAttribute('shortcut') }) : null
    );
    this.addEventListener('keydown', (event) => {
      if (this.hasAttribute('disabled')) return;
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); this.click(); }
    });
    this.sync();
  }
  attributeChangedCallback() { if (this.labelNode) this.sync(); }
  sync() {
    const disabled = this.hasAttribute('disabled');
    this.setAttribute('aria-disabled', String(disabled));
    this.tabIndex = -1;
    this.classList.toggle('ui-menu-item--danger', this.hasAttribute('destructive'));
    if (this.labelNode && this.hasAttribute('label')) this.labelNode.textContent = this.getAttribute('label');
  }
  get value() { return this.getAttribute('value') ?? this.getAttribute('label') ?? this.textContent.trim(); }
  get disabled() { return this.hasAttribute('disabled'); }
}
define('ui-menu-item', UIMenuItem);
