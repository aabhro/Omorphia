import { define, h, uid, emit, bool, fuzzy, highlight, floatEl, showFloat, hideFloat, place, whileOpen, inheritTheme, debounce } from '../core.js';
import { icon } from '../icons.js';

const norm = (x) => (typeof x === 'string' ? { label: x, value: x } : { value: x.label, ...x });

/** <ui-search placeholder="Search…" autocomplete min-chars="1" debounce="150" max="8" loading name label empty-text>
 *  JS: el.data = [...]  el.suggestions = [...]  el.source = async (query, signal) => items  el.renderItem = (item, {query}) => Node|string
 *  Events: ui-input {value}, ui-select {item,value}, ui-submit {value}, ui-clear.   Item: string | { label, value?, description?, icon?, keywords? } */
export class UISearch extends HTMLElement {
  static observedAttributes = ['placeholder', 'value', 'loading', 'name'];
  data = []; suggestions = []; source = null; renderItem = null;
  connectedCallback() {
    if (!this.input) {
      const lid = uid('ui-search-list');
      this.input = h('input', { id: uid('ui-search-input'), name: this.getAttribute('name') || uid('ui-search'), type: 'search', role: 'combobox', 'aria-autocomplete': 'list', 'aria-expanded': 'false', 'aria-controls': lid, autocomplete: 'off', spellcheck: 'false' });
      this.spin = h('span', { class: 'ui-spinner', hidden: true, 'aria-hidden': 'true' });
      this.clearBtn = h('button', { class: 'ui-search-clear', type: 'button', hidden: true, 'aria-label': 'Clear search', onclick: () => { this.clear(); this.input.focus(); } }, icon('x', 14));
      this.field = h('div', { class: 'ui-input ui-search-field' }, icon('search'), this.input, this.spin, this.clearBtn);
      this.listEl = h('div', { class: 'ui-search-list', role: 'listbox', id: lid });
      this.panel = floatEl(h('div', { class: 'ui-search-panel' }, this.listEl));
      this.live = h('div', { class: 'ui-sr-only', 'aria-live': 'polite' });
      this.replaceChildren(this.field, this.panel, this.live);
      this.items = []; this.active = -1; this.state = 'idle';
      this.input.addEventListener('input', () => this.onInput()); this.input.addEventListener('focus', () => bool(this, 'autocomplete') && this.query(this.input.value));
      this.input.addEventListener('keydown', (e) => this.key(e));
      this.panel.addEventListener('pointerdown', (e) => e.preventDefault()); // keep input focus
      this.listEl.addEventListener('click', (e) => { const o = e.target.closest('.ui-option'); if (o) this.pick(this.items[+o.dataset.i]); });
      this.listEl.addEventListener('pointermove', (e) => { const o = e.target.closest('.ui-option'); if (o) this.setActive(+o.dataset.i, false); });
      this._q = debounce((v) => this.query(v), +(this.getAttribute('debounce') ?? 150));
    }
    this.sync();
  }
  disconnectedCallback() {
    this._q?.cancel?.();
    this._abort?.abort();
    this._queryId = (this._queryId || 0) + 1;
    this.closePanel();
  }
  attributeChangedCallback() { if (this.input) this.sync(); }
  sync() {
    this.input.placeholder = this.getAttribute('placeholder') || 'Search…'; this.input.setAttribute('aria-label', this.getAttribute('label') || this.getAttribute('placeholder') || 'Search');
    this.input.name = this.getAttribute('name') || this.input.name || 'ui-search';
    if (this.hasAttribute('value') && this.input.value !== this.getAttribute('value')) this.input.value = this.getAttribute('value');
    this.clearBtn.hidden = !this.input.value; this.spin.hidden = !bool(this, 'loading');
  }
  get value() { return this.input?.value ?? ''; } set value(v) { this.input.value = v ?? ''; this.clearBtn.hidden = !v; }
  clear() {
    this._q?.cancel?.();
    this._abort?.abort();
    this._queryId = (this._queryId || 0) + 1;
    this.value = '';
    this.items = [];
    this.closePanel();
    emit(this, 'ui-clear');
    emit(this, 'ui-input', { value: '' });
    if (bool(this, 'autocomplete')) this.query('');
  }
  onInput() {
    this.clearBtn.hidden = !this.input.value;
    this._abort?.abort();
    this._queryId = (this._queryId || 0) + 1;
    emit(this, 'ui-input', { value: this.input.value });
    if (bool(this, 'autocomplete')) this._q(this.input.value);
  }
  async query(q) {
    const requestId = (this._queryId = (this._queryId || 0) + 1);\n    const min = +(this.getAttribute('min-chars') ?? 1), max = +(this.getAttribute('max') ?? 8); this._abort?.abort();
    if (q.trim().length < min) { this.items = this.suggestions.map(norm).slice(0, max); this.title = 'Suggestions'; this.state = this.items.length ? 'ready' : 'idle'; return this.renderPanel(); }
    this.title = '';
    if (this.source) {
      const ac = (this._abort = new AbortController()); this.state = 'loading'; this.renderPanel();
      try { const r = await this.source(q, ac.signal); if (ac.signal.aborted || requestId !== this._queryId || !this.isConnected) return; this.items = (r || []).map(norm).slice(0, max); this.state = this.items.length ? 'ready' : 'empty'; }
      catch (err) { if (ac.signal.aborted || requestId !== this._queryId || !this.isConnected) return; this.items = []; this.state = 'error'; }
    } else {
      this.items = this.data.map(norm).map((it) => ({ it, m: fuzzy(it.label, q) || fuzzy([it.description, ...(it.keywords || [])].filter(Boolean).join(' '), q) && { score: 0, ranges: [] } })).filter((x) => x.m).sort((a, b) => b.m.score - a.m.score).slice(0, max).map((x) => x.it);
      this.state = this.items.length ? 'ready' : 'empty';
    }
    this.active = this.items.length ? 0 : -1; this.renderPanel();
  }
  renderPanel() {
    const q = this.input.value.trim(); this.listEl.replaceChildren();
    const status = (txt, spin) => h('div', { class: 'ui-search-status' }, spin && h('span', { class: 'ui-spinner' }), txt);
    if (this.state === 'idle') return this.closePanel();
    if (this.state === 'loading') this.listEl.append(status(this.getAttribute('loading-text') || 'Searching…', true));
    else if (this.state === 'error') this.listEl.append(status('Search failed. Try again.'));
    else if (this.state === 'empty') this.listEl.append(status(this.getAttribute('empty-text') || `No matches for “${q}”`));
    else {
      if (this.title) this.listEl.append(h('div', { class: 'ui-command-group' }, this.title));
      this.items.forEach((it, i) => {
        const row = h('div', { class: 'ui-option', role: 'option', id: `${this.listEl.id}-${i}`, 'data-i': i, 'aria-selected': String(i === this.active) });
        const custom = this.renderItem?.(it, { query: q, highlight });
        if (custom != null) row.append(typeof custom === 'string' ? document.createTextNode(custom) : custom);
        else { const label = h('div', { class: 'ui-option-label' }); label.append(highlight(it.label, q && !this.title ? (fuzzy(it.label, q)?.ranges || []) : [])); row.append(it.icon && icon(it.icon), h('div', { class: 'ui-option-main' }, label, it.description && h('div', { class: 'ui-option-desc', text: it.description }))); }
        this.listEl.append(row);
      });
      this.live.textContent = `${this.items.length} suggestion${this.items.length === 1 ? '' : 's'} available`;
    }
    this.openPanel(); this.setActive(this.active, false);
  }
  openPanel() {
    if (!this.panel.hasAttribute('data-open')) {
      inheritTheme(this, this.panel); showFloat(this.panel); this.input.setAttribute('aria-expanded', 'true');
      this._off = whileOpen({ escape: false, anchor: this, floating: this.panel, reposition: () => this.pos(), onClose: (why) => { if (why === 'outside') this.closePanel(); } });
    }
    this.pos();
  }
  pos() { place(this.field, this.panel, { placement: 'bottom-start', offset: 6, matchWidth: true }); }
  closePanel() { if (!this.panel) return; this._off?.(); this._off = null; hideFloat(this.panel); this.input.setAttribute('aria-expanded', 'false'); this.input.removeAttribute('aria-activedescendant'); this.active = -1; }
  setActive(i, scroll = true) {
    this.active = i; const opts = [...this.listEl.querySelectorAll('.ui-option')]; opts.forEach((o, n) => o.setAttribute('aria-selected', String(n === i)));
    if (opts[i]) { this.input.setAttribute('aria-activedescendant', opts[i].id); if (scroll) opts[i].scrollIntoView({ block: 'nearest' }); } else this.input.removeAttribute('aria-activedescendant');
  }
  pick(it) { if (!it) return; this.value = it.label; this.closePanel(); emit(this, 'ui-select', { item: it, value: it.value }); }
  key(e) {
    const open = this.panel.hasAttribute('data-open') && this.state === 'ready', n = this.items.length;
    if (e.key === 'ArrowDown') { e.preventDefault(); if (!open && bool(this, 'autocomplete')) { this.active = 0; this.query(this.input.value); } else if (n) this.setActive((this.active + 1) % n); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); if (open) this.setActive((this.active - 1 + n) % n); }
    else if (e.key === 'Enter') { if (open && this.active >= 0) { e.preventDefault(); this.pick(this.items[this.active]); } else emit(this, 'ui-submit', { value: this.input.value }); }
    else if (e.key === 'Escape') { if (this.panel.hasAttribute('data-open')) { e.preventDefault(); e.stopPropagation(); this.closePanel(); } else if (this.input.value) { e.preventDefault(); this.clear(); } }
    else if (e.key === 'Tab') this.closePanel();
  }
}
define('ui-search', UISearch);
