import { define, h, uid, emit, fuzzy, highlight, isMac } from '../core.js';
import { icon } from '../icons.js';

const registry = new Map();
const palettes = new Set();
let hotkeyListenerInstalled = false;

/** Global command registry shared by every <ui-command-palette>.
 *  Command: { id, label, group?, description?, icon?, keywords?: string[], shortcut?: 'G H', href?, target?, onSelect?(cmd), disabled? } */
export const commands = {
  register(cmds) {
    const list = [].concat(cmds);
    list.forEach((command) => {
      if (!command.id) command.id = uid('cmd');
      registry.set(command.id, command);
    });
    return () => list.forEach((command) => registry.delete(command.id));
  },
  unregister(id) { registry.delete(id); },
  clear() { registry.clear(); },
  list() { return [...registry.values()]; },
};

const normalizeKey = (value) => {
  const key = String(value ?? '').toLowerCase();
  return ({
    esc: 'escape',
    return: 'enter',
    del: 'delete',
    spacebar: 'space',
    ' ': 'space',
    up: 'arrowup',
    down: 'arrowdown',
    left: 'arrowleft',
    right: 'arrowright',
  })[key] || key;
};

function parseHotkey(value) {
  const parts = String(value ?? '').toLowerCase().split('+').map((part) => part.trim()).filter(Boolean);
  if (!parts.length) return null;
  const key = normalizeKey(parts.pop());
  if (!key || ['none', 'off', 'false'].includes(key)) return null;

  const aliases = {
    ctrl: 'ctrl', control: 'ctrl',
    meta: 'meta', cmd: 'meta', command: 'meta',
    alt: 'alt', option: 'alt',
    shift: 'shift',
    mod: 'mod',
  };
  const modifiers = new Set();
  for (const part of parts) {
    const modifier = aliases[part];
    if (!modifier) return null;
    modifiers.add(modifier);
  }
  return { key, modifiers };
}

/** A single capture listener routes each shortcut to one connected palette.
 *  It runs before focused inputs and controls, and avoids duplicate toggles. */
function handleGlobalHotkey(event) {
  if (event.defaultPrevented || event.repeat || event.isComposing || event.keyCode === 229) return;

  const matching = [...palettes].filter((palette) =>
    palette.isConnected && !palette.disabled && palette.matches_hotkey(event)
  );
  if (!matching.length) return;

  const palette = matching.find((item) => item.isOpen) || matching[matching.length - 1];
  event.preventDefault();
  event.stopPropagation();
  palette.toggle();
}

function connectPalette(palette) {
  palettes.add(palette);
  if (!hotkeyListenerInstalled) {
    window.addEventListener('keydown', handleGlobalHotkey, true);
    hotkeyListenerInstalled = true;
  }
}

function disconnectPalette(palette) {
  palettes.delete(palette);
  if (!palettes.size && hotkeyListenerInstalled) {
    window.removeEventListener('keydown', handleGlobalHotkey, true);
    hotkeyListenerInstalled = false;
  }
}

/** <ui-command-palette hotkey="mod+k" placeholder="Search commands…">
 *  Declarative: <ui-command label="Go home" href="/" group="Navigate" icon="house" shortcut="G H"></ui-command>
 *  JS: palette.register([...]), palette.open(), palette.close(), palette.toggle()
 *  Events: ui-open, ui-close, ui-command { command }
 *
 *  hotkey accepts "mod+k", "ctrl+shift+p", or "meta+k".
 *  Use hotkey="none" to disable the global shortcut while keeping the public API. */
export class UICommandPalette extends HTMLElement {
  connectedCallback() {
    if (!this.dialog) {
      this.own = [];
      this.active = 0;
      this.view = [];

      const lid = uid('ui-cmd-list');
      this.input = h('input', {
        class: 'ui-command-input',
        type: 'text',
        role: 'combobox',
        'aria-expanded': 'true',
        'aria-controls': lid,
        'aria-autocomplete': 'list',
        autocomplete: 'off',
        spellcheck: 'false',
        'aria-label': 'Search commands',
      });
      this.list = h('div', { class: 'ui-command-list', role: 'listbox', id: lid, 'aria-label': 'Commands' });
      const k = (label) => h('span', { class: 'ui-kbd' }, label);

      this.dialog = h('dialog', { class: 'ui-command', 'aria-label': 'Command palette' },
        h('div', { class: 'ui-command-head' }, icon('search'), this.input, k('Esc')),
        this.list,
        h('div', { class: 'ui-command-foot' },
          h('span', {}, k('↑'), k('↓'), 'Navigate'),
          h('span', {}, k('↵'), 'Run'),
          h('span', {}, k('Esc'), 'Close')
        )
      );

      this.dialog.addEventListener('close', () => {
        const previous = this._prev;
        this._prev = null;
        if (previous?.isConnected && typeof previous.focus === 'function') {
          try { previous.focus({ preventScroll: true }); } catch (_) {}
        }
        emit(this, 'ui-close');
      });
      this.dialog.addEventListener('pointerdown', (event) => {
        if (event.target !== this.dialog) return;
        const rect = this.dialog.getBoundingClientRect();
        if (event.clientX < rect.left || event.clientX > rect.right ||
            event.clientY < rect.top || event.clientY > rect.bottom) this.close();
      });
      this.input.addEventListener('input', () => { this.active = 0; this.render(); });
      this.input.addEventListener('keydown', (event) => this.key(event));
      this.list.addEventListener('pointermove', (event) => {
        const option = event.target.closest('.ui-option');
        if (option && Number(option.dataset.i) !== this.active) this.setActive(Number(option.dataset.i), false);
      });
      this.list.addEventListener('click', (event) => {
        const option = event.target.closest('.ui-option');
        if (option) this.run(this.view[Number(option.dataset.i)]);
      });
      this.append(this.dialog);
    }

    connectPalette(this);
  }

  disconnectedCallback() {
    disconnectPalette(this);
    if (this.dialog?.open) {
      this._prev = null;
      this.close();
    }
  }

  get disabled() { return this.hasAttribute('disabled'); }
  set disabled(value) { this.toggleAttribute('disabled', Boolean(value)); }

  matches_hotkey(event) {
    const raw = this.getAttribute('hotkey');
    const parsed = parseHotkey(raw == null ? 'mod+k' : raw);
    if (!parsed || !event) return false;

    const { key, modifiers } = parsed;
    const wantsMod = modifiers.has('mod');
    const wantsCtrl = modifiers.has('ctrl') || (wantsMod && !isMac());
    const wantsMeta = modifiers.has('meta') || (wantsMod && isMac());
    const wantsAlt = modifiers.has('alt');
    const wantsShift = modifiers.has('shift');

    const eventKey = normalizeKey(event.key);
    const eventCode = String(event.code || '').toLowerCase();
    const codeMatches = eventCode === key || (key.length === 1 && eventCode === 'key' + key);
    const legacyMatches = key.length === 1 && event.keyCode === key.toUpperCase().charCodeAt(0);

    return (eventKey === key || codeMatches || legacyMatches) &&
      event.ctrlKey === wantsCtrl &&
      event.metaKey === wantsMeta &&
      event.altKey === wantsAlt &&
      event.shiftKey === wantsShift;
  }

  register(cmds) {
    const list = [].concat(cmds);
    list.forEach((command) => { if (!command.id) command.id = uid('cmd'); });
    this.own.push(...list);
    return () => { this.own = this.own.filter((command) => !list.includes(command)); };
  }

  get commands() { return this.own; }
  set commands(value) { this.own = [].concat(value || []); }

  all() {
    const fromDom = [...this.querySelectorAll('ui-command')].map((element) => ({
      id: element.id || element.getAttribute('label'),
      label: element.getAttribute('label') || element.textContent.trim(),
      group: element.getAttribute('group'),
      description: element.getAttribute('description'),
      icon: element.getAttribute('icon'),
      shortcut: element.getAttribute('shortcut'),
      href: element.getAttribute('href'),
      target: element.getAttribute('target'),
      keywords: (element.getAttribute('keywords') || '').split(',').filter(Boolean),
      disabled: element.hasAttribute('disabled'),
      el: element,
    }));
    return [...registry.values(), ...this.own, ...fromDom];
  }

  get isOpen() { return Boolean(this.dialog?.open); }

  open() {
    if (this.isOpen || this.disabled) return;
    this._prev = this.ownerDocument?.activeElement || document.activeElement;
    this.input.value = '';
    this.active = 0;
    this.render();

    if (typeof this.dialog.showModal === 'function') {
      try { this.dialog.showModal(); }
      catch (_) { this.dialog.setAttribute('open', ''); }
    } else {
      this.dialog.setAttribute('open', '');
    }
    if (!this.isOpen) return;

    this.input.placeholder = this.getAttribute('placeholder') || 'Type a command or search…';
    try { this.input.focus({ preventScroll: true }); } catch (_) { this.input.focus(); }
    emit(this, 'ui-open');
  }

  close() {
    if (!this.isOpen) return;
    if (typeof this.dialog.close === 'function') {
      try { this.dialog.close(); }
      catch (_) {
        this.dialog.removeAttribute('open');
        this.dialog.dispatchEvent(new Event('close'));
      }
    } else {
      this.dialog.removeAttribute('open');
      this.dialog.dispatchEvent(new Event('close'));
    }
  }

  toggle() { this.isOpen ? this.close() : this.open(); }

  filter(query) {
    const cmds = this.all();
    if (!query.trim()) return cmds.map((command) => ({ c: command, ranges: [] }));

    const out = [];
    for (const command of cmds) {
      const match = fuzzy(command.label || '', query);
      if (match) out.push({ c: command, ranges: match.ranges, score: match.score + 50 });
      else {
        const haystack = [command.description, command.group, ...(command.keywords || [])].filter(Boolean).join(' ');
        const alternate = fuzzy(haystack, query);
        if (alternate) out.push({ c: command, ranges: [], score: alternate.score });
      }
    }
    return out.sort((a, b) => b.score - a.score);
  }

  render() {
    const query = this.input.value;
    const results = this.filter(query);
    this.view = results.map((result) => result.c);
    this.list.replaceChildren();

    if (!results.length) {
      const none = !this.all().length;
      this.list.append(h('div', { class: 'ui-empty' },
        icon(none ? 'command' : 'search'),
        h('p', { class: 'ui-empty-title' }, none ? 'No commands yet' : 'No results for “' + query.trim() + '”'),
        h('p', { class: 'ui-empty-desc' }, none
          ? 'Add commands with Omorphia.commands.register() or <ui-command> elements.'
          : 'Check the spelling or try a broader term.')
      ));
      this.input.removeAttribute('aria-activedescendant');
      return;
    }

    let group;
    results.forEach(({ c, ranges }, index) => {
      if (!query.trim() && c.group !== group) {
        group = c.group;
        if (group) this.list.append(h('div', { class: 'ui-command-group', role: 'presentation' }, group));
      }
      const label = h('div', { class: 'ui-option-label' });
      label.append(highlight(c.label || '', ranges));
      const keys = c.shortcut
        ? h('span', { class: 'ui-option-keys' }, String(c.shortcut).split(/\s+/).map((part) => h('span', { class: 'ui-kbd' }, part)))
        : null;
      this.list.append(h('div', {
        class: 'ui-option',
        role: 'option',
        id: this.list.id + '-' + index,
        'data-i': index,
        'aria-selected': 'false',
        'aria-disabled': c.disabled ? 'true' : null,
      },
      c.icon && icon(c.icon),
      h('div', { class: 'ui-option-main' }, label, c.description && h('div', { class: 'ui-option-desc', text: c.description })),
      keys));
    });
    this.setActive(Math.min(this.active, this.view.length - 1));
  }

  setActive(index, scroll = true) {
    const options = [...this.list.querySelectorAll('.ui-option')];
    if (!options.length) return;
    this.active = Math.max(0, Math.min(index, options.length - 1));
    options.forEach((option, i) => option.setAttribute('aria-selected', String(i === this.active)));
    this.input.setAttribute('aria-activedescendant', options[this.active].id);
    if (scroll) options[this.active].scrollIntoView({ block: 'nearest' });
  }

  key(event) {
    const count = this.view.length;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (count) this.setActive((this.active + 1) % count);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (count) this.setActive((this.active - 1 + count) % count);
    } else if (event.key === 'PageDown') {
      event.preventDefault();
      if (count) this.setActive(Math.min(count - 1, this.active + 6));
    } else if (event.key === 'PageUp') {
      event.preventDefault();
      if (count) this.setActive(Math.max(0, this.active - 6));
    } else if (event.key === 'Enter' && !event.isComposing) {
      event.preventDefault();
      this.run(this.view[this.active]);
    }
  }

  run(command) {
    if (!command || command.disabled) return;
    this.close();
    emit(this, 'ui-command', { command });
    if (command.el) command.el.dispatchEvent(new CustomEvent('select', { bubbles: true }));
    const callback = command.onSelect || command.run;
    if (callback) callback(command);
    if (command.href) {
      command.target === '_blank'
        ? window.open(command.href, '_blank', 'noopener')
        : (location.href = command.href);
    }
  }
}

define('ui-command-palette', UICommandPalette);
define('ui-command', class extends HTMLElement {});
export const shortcutLabel = () => (isMac() ? '⌘K' : 'Ctrl K');
