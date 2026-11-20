import { define, h, uid, emit } from '../core.js';
import { icon } from '../icons.js';

/** <ui-tab label="Overview" value="overview" icon="layers" disabled> panel content </ui-tab> */
export class UITab extends HTMLElement {}
define('ui-tab', UITab);

/** <ui-tabs value="overview"> <ui-tab …/> … </ui-tabs>   Event: ui-change { value, tab } */
export class UITabs extends HTMLElement {
  static observedAttributes = ['value'];
  connectedCallback() {
    this.list ||= h('div', { class: 'ui-tabs-list', role: 'tablist' });
    this.list.setAttribute('aria-label', this.getAttribute('label') || 'Tabs');
    this.list.onkeydown = (e) => this.key(e);
    this.build();
    this.mo = new MutationObserver((m) => { if (m.some((r) => [...r.addedNodes, ...r.removedNodes].some((n) => n.localName === 'ui-tab'))) this.build(); });
    this.mo.observe(this, { childList: true });
  }
  disconnectedCallback() { this.mo?.disconnect(); }
  attributeChangedCallback(n, o, v) { if (n === 'value' && this.list?.isConnected && v !== this._value) this.select(v, false); }
  get tabs() { return [...this.children].filter((c) => c.localName === 'ui-tab'); }
  build() {
    const tabs = this.tabs; if (!tabs.length) return;
    const want = this.getAttribute('value') ?? this._value ?? tabs.find((t) => t.hasAttribute('selected'))?.getAttribute('value');
    this.btns = tabs.map((t, i) => {
      t.dataset.value ||= t.getAttribute('value') ?? String(i); const val = t.dataset.value;
      const id = t.id || (t.id = uid('ui-tab')); const bid = `${id}-btn`;
      t.setAttribute('role', 'tabpanel'); t.setAttribute('aria-labelledby', bid); t.tabIndex = 0;
      const b = h('button', { class: 'ui-tab-btn', role: 'tab', id: bid, type: 'button', 'aria-controls': id, 'data-value': val, disabled: t.hasAttribute('disabled') }, t.getAttribute('icon') && icon(t.getAttribute('icon')), t.getAttribute('label') || `Tab ${i + 1}`);
      b.addEventListener('click', () => this.select(val)); return b;
    });
    this.list.replaceChildren(...this.btns); if (this.list.parentNode !== this) this.prepend(this.list);
    this.select(tabs.some((t) => t.dataset.value === want) ? want : (tabs.find((t) => !t.hasAttribute('disabled')) || tabs[0]).dataset.value, false);
  }
  select(value, fire = true) {
    value = String(value); this._value = value; let sel;
    this.tabs.forEach((t, i) => { const on = t.dataset.value === value; t.hidden = !on; const b = this.btns[i]; b.setAttribute('aria-selected', on); b.tabIndex = on ? 0 : -1; if (on) sel = t; });
    if (this.getAttribute('value') !== value) this.setAttribute('value', value);
    if (fire && sel) emit(this, 'ui-change', { value, tab: sel });
  }
  get value() { return this._value; } set value(v) { this.select(v); }
  key(e) {
    const en = this.btns.filter((b) => !b.disabled); const i = en.indexOf(document.activeElement); if (i < 0) return;
    const to = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: en.length - 1 }[e.key]; if (to == null) return;
    e.preventDefault(); const b = en[(to + en.length) % en.length]; b.focus(); this.select(b.dataset.value);
  }
}
define('ui-tabs', UITabs);
