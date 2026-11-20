import { define, h, uid, emit, fuzzy, highlight, isMac } from '../core.js';
import { icon } from '../icons.js';

const registry = new Map();
/** Global command registry shared by every <ui-command-palette>.
 *  Command: { id, label, group?, description?, icon?, keywords?: string[], shortcut?: 'G H', href?, target?, onSelect?(cmd), disabled? } */
export const commands = {
  register(cmds) { const list = [].concat(cmds); list.forEach((c) => { if (!c.id) c.id = uid('cmd'); registry.set(c.id, c); }); return () => list.forEach((c) => registry.delete(c.id)); },
  unregister(id) { registry.delete(id); },
  clear() { registry.clear(); },
  list() { return [...registry.values()]; },
};

/** <ui-command-palette hotkey="mod+k" placeholder="Search commands…">
 *  Declarative: <ui-command label="Go home" href="/" group="Navigate" icon="house" shortcut="G H"></ui-command>
 *  JS: palette.register([...]), palette.open(), palette.close(), palette.toggle()
 *  Events: ui-open, ui-close, ui-command { command } */
export class UICommandPalette extends HTMLElement {
  connectedCallback() {
    if (!this.dialog) {
      this.own = []; this.active = 0; this.view = [];
      const lid = uid('ui-cmd-list');
      this.input = h('input', { class: 'ui-command-input', type: 'text', role: 'combobox', 'aria-expanded': 'true', 'aria-controls': lid, 'aria-autocomplete': 'list', autocomplete: 'off', spellcheck: 'false', 'aria-label': 'Search commands' });
      this.list = h('div', { class: 'ui-command-list', role: 'listbox', id: lid, 'aria-label': 'Commands' });
      const k = (t) => h('span', { class: 'ui-kbd' }, t);
      this.dialog = h('dialog', { class: 'ui-command', 'aria-label': 'Command palette' },
        h('div', { class: 'ui-command-head' }, icon('search'), this.input, k('Esc')), this.list,
        h('div', { class: 'ui-command-foot' }, h('span', {}, k('↑'), k('↓'), 'Navigate'), h('span', {}, k('↵'), 'Run'), h('span', {}, k('Esc'), 'Close')));
      this.dialog.addEventListener('close', () => { this._prev?.focus?.({ preventScroll: true }); emit(this, 'ui-close'); });
      this.dialog.addEventListener('pointerdown', (e) => { if (e.target === this.dialog) { const r = this.dialog.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) this.close(); } });
      this.input.addEventListener('input', () => { this.active = 0; this.render(); });
      this.input.addEventListener('keydown', (e) => this.key(e));
      this.list.addEventListener('pointermove', (e) => { const o = e.target.closest('.ui-option'); if (o && +o.dataset.i !== this.active) this.setActive(+o.dataset.i, false); });
      this.list.addEventListener('click', (e) => { const o = e.target.closest('.ui-option'); if (o) this.run(this.view[+o.dataset.i]); });
      this.append(this.dialog);
    }
    this._hk = (e) => { if (this.matches_hotkey(e)) { e.preventDefault(); this.toggle(); } };
    document.addEventListener('keydown', this._hk);
  }
  disconnectedCallback() { document.removeEventListener('keydown', this._hk); if (this.dialog?.open) this.dialog.close(); }
  matches_hotkey(e) {
    const parts = (this.getAttribute('hotkey') || 'mod+k').toLowerCase().split('+'); const key = parts.pop();
    const mod = parts.includes('mod') ? (e.metaKey || e.ctrlKey) : (e.ctrlKey === parts.includes('ctrl') && e.metaKey === parts.includes('meta'));
    return mod && e.altKey === parts.includes('alt') && e.shiftKey === parts.includes('shift') && e.key.toLowerCase() === key;
  }
  register(cmds) { const list = [].concat(cmds); list.forEach((c) => { if (!c.id) c.id = uid('cmd'); }); this.own.push(...list); return () => (this.own = this.own.filter((c) => !list.includes(c))); }
  get commands() { return this.own; } set commands(v) { this.own = [].concat(v || []); }
  all() {
    const fromDom = [...this.querySelectorAll('ui-command')].map((el) => ({ id: el.id || el.getAttribute('label'), label: el.getAttribute('label') || el.textContent.trim(), group: el.getAttribute('group'), description: el.getAttribute('description'), icon: el.getAttribute('icon'), shortcut: el.getAttribute('shortcut'), href: el.getAttribute('href'), target: el.getAttribute('target'), keywords: (el.getAttribute('keywords') || '').split(',').filter(Boolean), disabled: el.hasAttribute('disabled'), el }));
    return [...registry.values(), ...this.own, ...fromDom];
  }
  get isOpen() { return !!this.dialog?.open; }
  open() {
    if (this.isOpen) return; this._prev = document.activeElement; this.input.value = ''; this.active = 0; this.render();
    typeof this.dialog.showModal === 'function' ? this.dialog.showModal() : this.dialog.setAttribute('open', '');
    this.input.placeholder = this.getAttribute('placeholder') || 'Type a command or search…'; this.input.focus(); emit(this, 'ui-open');
  }
  close() { if (!this.isOpen) return; typeof this.dialog.close === 'function' ? this.dialog.close() : (this.dialog.removeAttribute('open'), this.dialog.dispatchEvent(new Event('close'))); }
  toggle() { this.isOpen ? this.close() : this.open(); }
  filter(q) {
    const cmds = this.all(); if (!q.trim()) return cmds.map((c) => ({ c, ranges: [] }));
    const out = [];
    for (const c of cmds) {
      const m = fuzzy(c.label || '', q);
      if (m) out.push({ c, ranges: m.ranges, score: m.score + 50 });
      else { const hay = [c.description, c.group, ...(c.keywords || [])].filter(Boolean).join(' '); const m2 = fuzzy(hay, q); if (m2) out.push({ c, ranges: [], score: m2.score }); }
    }
    return out.sort((a, b) => b.score - a.score);
  }
  render() {
    const q = this.input.value, res = this.filter(q); this.view = res.map((r) => r.c); this.list.replaceChildren();
    if (!res.length) {
      const none = !this.all().length;
      this.list.append(h('div', { class: 'ui-empty' }, icon(none ? 'command' : 'search'),
        h('p', { class: 'ui-empty-title' }, none ? 'No commands yet' : `No results for “${q.trim()}”`),
        h('p', { class: 'ui-empty-desc' }, none ? 'Add commands with Edgelit.commands.register() or <ui-command> elements.' : 'Check the spelling or try a broader term.')));
      this.input.removeAttribute('aria-activedescendant'); return;
    }
    let group;
    res.forEach(({ c, ranges }, i) => {
      if (!q.trim() && c.group !== group) { group = c.group; if (group) this.list.append(h('div', { class: 'ui-command-group', role: 'presentation' }, group)); }
      const label = h('div', { class: 'ui-option-label' }); label.append(highlight(c.label || '', ranges));
      const keys = c.shortcut ? h('span', { class: 'ui-option-keys' }, String(c.shortcut).split(/\s+/).map((s) => h('span', { class: 'ui-kbd' }, s))) : null;
      this.list.append(h('div', { class: 'ui-option', role: 'option', id: `${this.list.id}-${i}`, 'data-i': i, 'aria-selected': 'false', 'aria-disabled': c.disabled ? 'true' : null },
        c.icon && icon(c.icon), h('div', { class: 'ui-option-main' }, label, c.description && h('div', { class: 'ui-option-desc', text: c.description })), keys));
    });
    this.setActive(Math.min(this.active, this.view.length - 1));
  }
  setActive(i, scroll = true) {
    const opts = [...this.list.querySelectorAll('.ui-option')]; if (!opts.length) return; this.active = i;
    opts.forEach((o, n) => o.setAttribute('aria-selected', n === i)); this.input.setAttribute('aria-activedescendant', opts[i].id); if (scroll) opts[i].scrollIntoView({ block: 'nearest' });
  }
  key(e) {
    const n = this.view.length;
    if (e.key === 'ArrowDown') { e.preventDefault(); n && this.setActive((this.active + 1) % n); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); n && this.setActive((this.active - 1 + n) % n); }
    else if (e.key === 'PageDown') { e.preventDefault(); n && this.setActive(Math.min(n - 1, this.active + 6)); }
    else if (e.key === 'PageUp') { e.preventDefault(); n && this.setActive(Math.max(0, this.active - 6)); }
    else if (e.key === 'Enter' && !e.isComposing) { e.preventDefault(); this.run(this.view[this.active]); }
  }
  run(c) {
    if (!c || c.disabled) return; this.close(); emit(this, 'ui-command', { command: c });
    if (c.el) c.el.dispatchEvent(new CustomEvent('select', { bubbles: true }));
    const fn = c.onSelect || c.run; if (fn) fn(c);
    if (c.href) { c.target === '_blank' ? window.open(c.href, '_blank', 'noopener') : (location.href = c.href); }
  }
}
define('ui-command-palette', UICommandPalette);
define('ui-command', class extends HTMLElement {});
export const shortcutLabel = () => (isMac() ? '⌘K' : 'Ctrl K');
