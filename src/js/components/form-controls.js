import { define, h, uid, emit, bool } from '../core.js';

const valueOf = (el, name, fallback = '') => el.getAttribute(name) ?? fallback;
const truth = (el, name) => bool(el, name);
const hiddenInput = (type, name, value) => {
  const input = h('input', { type, id: uid('ui-form-value'), name: name || '', value: value ?? '', tabindex: '-1', 'aria-hidden': 'true' });
  input.hidden = true;
  return input;
};

export class UIInput extends HTMLElement {
  static observedAttributes = ['type', 'value', 'placeholder', 'name', 'disabled', 'readonly', 'required', 'clearable', 'size', 'label', 'autocomplete', 'icon'];
  connectedCallback() {
    if (this.input) return;
    const initial = this.textContent;
    const allowed = ['text', 'email', 'password', 'search', 'url', 'tel', 'number'];
    const type = allowed.includes(valueOf(this, 'type', 'text')) ? valueOf(this, 'type', 'text') : 'text';
    this.input = h('input', {
      class: 'ui-input-control',
      type,
      id: this.id ? this.id + '-control' : uid('ui-input'),
      name: valueOf(this, 'name'),
      placeholder: valueOf(this, 'placeholder'),
      autocomplete: valueOf(this, 'autocomplete'),
      required: truth(this, 'required'),
      disabled: truth(this, 'disabled'),
      readonly: truth(this, 'readonly'),
      'aria-label': valueOf(this, 'label') || valueOf(this, 'placeholder') || 'Text input'
    });
    this.input.value = valueOf(this, 'value', initial);
    this.frame = h('div', { class: 'ui-input-frame' });
    this.iconNode = this.hasAttribute('icon') ? h('ui-icon', { name: this.getAttribute('icon') }) : null;
    if (this.iconNode) this.frame.append(this.iconNode);
    this.frame.append(this.input);
    this.clearButton = h('button', { class: 'ui-input-clear', type: 'button', 'aria-label': 'Clear input', hidden: true }, h('ui-icon', { name: 'x', size: '14' }));
    this.clearButton.addEventListener('click', () => { this.input.value = ''; this.sync(); this.input.focus(); this.emitValue('ui-input'); this.emitValue('ui-change'); });
    this.frame.append(this.clearButton);
    this.replaceChildren(this.frame);
    this.input.addEventListener('input', () => { this.sync(); this.emitValue('ui-input'); });
    this.input.addEventListener('change', () => this.emitValue('ui-change'));
    this.sync();
  }
  attributeChangedCallback(name) {
    if (!this.input) return;
    if (name === 'value') this.input.value = this.getAttribute('value') || '';
    if (name === 'icon') this.syncIcon();
    this.sync();
  }
  syncIcon() {
    const name = this.getAttribute('icon');
    if (name && !this.iconNode) { this.iconNode = h('ui-icon', { name }); this.frame.prepend(this.iconNode); }
    else if (!name && this.iconNode) { this.iconNode.remove(); this.iconNode = null; }
    else if (name && this.iconNode) this.iconNode.setAttribute('name', name);
  }
  sync() {
    const allowed = ['text', 'email', 'password', 'search', 'url', 'tel', 'number'];
    const type = valueOf(this, 'type', 'text');
    if (allowed.includes(type) && this.input.type !== type) this.input.type = type;
    const attrs = ['placeholder', 'name', 'autocomplete', 'disabled', 'readonly', 'required', 'aria-label'];
    for (const key of attrs) {
      const source = key === 'aria-label' ? (this.getAttribute('label') || this.getAttribute('placeholder') || 'Text input') : this.getAttribute(key);
      if (source == null || source === 'false') this.input.removeAttribute(key);
      else this.input.setAttribute(key, source === '' ? '' : source);
    }
    this.classList.toggle('is-disabled', this.input.disabled);
    if (this.clearButton) { this.clearButton.hidden = !this.input.value || !truth(this, 'clearable'); this.clearButton.disabled = this.input.disabled; }
    const size = this.getAttribute('size');
    this.frame.dataset.size = size === 'sm' || size === 'lg' ? size : 'md';
  }
  emitValue(name) { emit(this, name, { value: this.value, input: this.input }); }
  get value() { return this.input?.value ?? valueOf(this, 'value'); }
  set value(value) { if (!this.input) this.setAttribute('value', value ?? ''); else { this.input.value = value ?? ''; this.setAttribute('value', value ?? ''); this.sync(); } }
  get disabled() { return !!this.input?.disabled; }
  set disabled(value) { this.toggleAttribute('disabled', !!value); }
  focus(options) { this.input?.focus(options); }
  select() { this.input?.select(); }
  checkValidity() { return this.input?.checkValidity() ?? true; }
  reportValidity() { return this.input?.reportValidity() ?? true; }
}
define('ui-input', UIInput);

export class UITextarea extends HTMLElement {
  static observedAttributes = ['value', 'placeholder', 'name', 'disabled', 'readonly', 'required', 'rows', 'maxlength', 'resize', 'label', 'auto-grow'];
  connectedCallback() {
    if (this.textarea) return;
    const initial = this.textContent;
    this.textarea = h('textarea', {
      class: 'ui-textarea-control',
      name: valueOf(this, 'name'),
      placeholder: valueOf(this, 'placeholder'),
      rows: valueOf(this, 'rows', '3'),
      maxlength: valueOf(this, 'maxlength'),
      disabled: truth(this, 'disabled'),
      readonly: truth(this, 'readonly'),
      required: truth(this, 'required'),
      'aria-label': valueOf(this, 'label') || valueOf(this, 'placeholder') || 'Text area'
    });
    this.textarea.value = valueOf(this, 'value', initial);
    this.frame = h('div', { class: 'ui-textarea-frame' }, this.textarea);
    this.count = h('span', { class: 'ui-textarea-count', 'aria-live': 'polite' });
    this.append(this.frame, this.count);
    this.textarea.addEventListener('input', () => { this.sync(); emit(this, 'ui-input', { value: this.value }); });
    this.textarea.addEventListener('change', () => emit(this, 'ui-change', { value: this.value }));
    this.sync();
  }
  attributeChangedCallback(name) {
    if (!this.textarea) return;
    if (name === 'value') this.textarea.value = this.getAttribute('value') || '';
    this.sync();
  }
  sync() {
    for (const key of ['placeholder', 'name', 'rows', 'maxlength', 'disabled', 'readonly', 'required']) {
      const v = this.getAttribute(key);
      if (v == null || v === 'false') this.textarea.removeAttribute(key); else this.textarea.setAttribute(key, v);
    }
    this.textarea.setAttribute('aria-label', this.getAttribute('label') || this.getAttribute('placeholder') || 'Text area');
    this.dataset.resize = valueOf(this, 'resize', 'vertical');
    if (truth(this, 'auto-grow')) {
      this.textarea.style.height = 'auto';
      this.textarea.style.height = Math.min(this.textarea.scrollHeight, 420) + 'px';
    }
    const max = +(this.getAttribute('maxlength') || 0);
    this.count.textContent = max ? this.textarea.value.length + ' / ' + max : '';
    this.count.hidden = !max;
  }
  get value() { return this.textarea?.value ?? valueOf(this, 'value'); }
  set value(value) { if (!this.textarea) this.setAttribute('value', value ?? ''); else { this.textarea.value = value ?? ''; this.setAttribute('value', value ?? ''); this.sync(); } }
  get disabled() { return !!this.textarea?.disabled; }
  set disabled(value) { this.toggleAttribute('disabled', !!value); }
  focus(options) { this.textarea?.focus(options); }
  checkValidity() { return this.textarea?.checkValidity() ?? true; }
  reportValidity() { return this.textarea?.reportValidity() ?? true; }
}
define('ui-textarea', UITextarea);

class UIChoice extends HTMLElement {
  static observedAttributes = ['checked', 'disabled', 'name', 'value', 'label', 'required'];
  role = 'checkbox';
  connectedCallback() {
    if (this.control) return;
    const label = this.getAttribute('label') || this.textContent.trim();
    this.control = h('button', { class: 'ui-choice-control', type: 'button', role: this.role, 'aria-checked': 'false', 'aria-label': label || this.role, disabled: truth(this, 'disabled') });
    this.indicator = h('span', { class: 'ui-choice-indicator', 'aria-hidden': 'true' });
    this.text = h('span', { class: 'ui-choice-label', text: label });
    this.formValue = hiddenInput('hidden', '', valueOf(this, 'value', 'on'));
    this.replaceChildren(this.control, this.text, this.formValue);
    this.control.addEventListener('click', () => this.toggle());
    this.text.addEventListener('click', () => { if (this.disabled) return; this.toggle(); this.control.focus({ preventScroll: true }); });
    this.control.addEventListener('keydown', (event) => this.onKey(event));
    this.control.prepend(this.indicator);
    this.sync();
  }
  attributeChangedCallback() { if (this.control) this.sync(); }
  get checked() { return this.hasAttribute('checked'); }
  set checked(value) { this.toggleAttribute('checked', !!value); }
  get disabled() { return this.hasAttribute('disabled'); }
  set disabled(value) { this.toggleAttribute('disabled', !!value); }
  toggle() { if (this.disabled) return; this.checked = !this.checked; this.sync(); this.changed(); }
  onKey(event) {
    if (this.role === 'radio' && ['ArrowLeft', 'ArrowUp', 'ArrowRight', 'ArrowDown'].includes(event.key)) {
      event.preventDefault();
      const name = this.getAttribute('name');
      if (!name) return;
      const scope = this.closest('form') || this.ownerDocument;
      const group = [...scope.querySelectorAll('ui-radio')].filter((item) => item.getAttribute('name') === name && !item.disabled);
      const at = group.indexOf(this);
      const next = group[(at + (event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 1) + group.length) % group.length];
      if (next) { next.toggle(); next.control.focus(); }
    }
  }
  sync() {
    if (this.role === 'radio' && this.checked) {
      const name = this.getAttribute('name');
      if (name) {
        const scope = this.closest('form') || this.ownerDocument;
        [...scope.querySelectorAll('ui-radio')]
          .filter((item) => item !== this && item.getAttribute('name') === name && item.checked)
          .forEach((item) => { item.checked = false; item.sync(); });
      }
    }
    this.control.setAttribute('aria-checked', String(this.checked));
    this.control.setAttribute('aria-disabled', String(this.disabled));
    this.control.setAttribute('aria-required', String(bool(this, 'required')));
    this.control.disabled = this.disabled;
    this.control.tabIndex = this.disabled ? -1 : 0;
    this.classList.toggle('is-checked', this.checked);
    this.classList.toggle('is-disabled', this.disabled);
    const label = this.getAttribute('label') || this.text.textContent || this.role;
    this.control.setAttribute('aria-label', label);
    this.formValue.name = this.checked ? (this.getAttribute('name') || '') : '';
    this.formValue.value = valueOf(this, 'value', 'on');
    this.formValue.disabled = this.disabled;
    if (this.text.textContent !== (this.getAttribute('label') || this.text.textContent)) this.text.textContent = this.getAttribute('label');
  }
  changed() { emit(this, 'ui-input', { checked: this.checked, value: valueOf(this, 'value', 'on') }); emit(this, 'ui-change', { checked: this.checked, value: valueOf(this, 'value', 'on') }); }
  focus(options) { this.control?.focus(options); }
}

export class UICheckbox extends UIChoice { role = 'checkbox'; }
define('ui-checkbox', UICheckbox);

export class UIRadio extends UIChoice {
  role = 'radio';
  toggle() {
    if (this.disabled || this.checked) return;
    this.checked = true;
    this.sync();
    this.changed();
  }
}
define('ui-radio', UIRadio);

export class UISwitch extends UIChoice { role = 'switch'; }
define('ui-switch', UISwitch);

export class UIRange extends HTMLElement {
  static observedAttributes = ['min', 'max', 'step', 'value', 'disabled', 'name', 'label'];
  connectedCallback() {
    if (this.track) return;
    this.min = Number(valueOf(this, 'min', '0'));
    if (!Number.isFinite(this.min)) this.min = 0;
    this.max = Number(valueOf(this, 'max', '100'));
    if (!Number.isFinite(this.max) || !(this.max > this.min)) this.max = this.min + 1;
    this.step = Math.max(0.000001, Number(valueOf(this, 'step', '1')) || 1);
    this._value = this.clamp(Number(valueOf(this, 'value', String(this.min))) || this.min);
    this.track = h('div', { class: 'ui-range-track', role: 'slider', tabindex: truth(this, 'disabled') ? -1 : 0, 'aria-label': valueOf(this, 'label', 'Range'), 'aria-valuemin': this.min, 'aria-valuemax': this.max });
    this.fill = h('span', { class: 'ui-range-fill' });
    this.thumb = h('span', { class: 'ui-range-thumb', 'aria-hidden': 'true' });
    this.hiddenValue = hiddenInput('hidden', valueOf(this, 'name'), this._value);
    this.track.append(this.fill, this.thumb);
    this.replaceChildren(this.track, this.hiddenValue);
    this.track.addEventListener('pointerdown', (e) => this.startDrag(e));
    this.track.addEventListener('keydown', (e) => this.onKey(e));
    this.sync();
  }
  attributeChangedCallback() { if (this.track) this.sync(); }
  clamp(value) {
    const stepped = this.min + Math.round((value - this.min) / this.step) * this.step;
    const decimals = Math.min(6, Math.max(0, (String(this.step).split('.')[1] || '').length));
    const rounded = Number(stepped.toFixed(decimals));
    return Math.min(this.max, Math.max(this.min, rounded));
  }
  setFromPointer(event) {
    const rect = this.track.getBoundingClientRect();
    if (!rect.width) return;
    const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    this.value = this.min + ratio * (this.max - this.min);
    emit(this, 'ui-input', { value: this.value });
  }
  startDrag(event) {
    if (this.hasAttribute('disabled') || event.button !== 0) return;
    this.track.focus(); this.setFromPointer(event);
    const move = (e) => this.setFromPointer(e);
    const end = () => { document.removeEventListener('pointermove', move); document.removeEventListener('pointerup', end); document.removeEventListener('pointercancel', end); emit(this, 'ui-change', { value: this.value }); };
    document.addEventListener('pointermove', move); document.addEventListener('pointerup', end, { once: true }); document.addEventListener('pointercancel', end, { once: true });
  }
  onKey(event) {
    let next = this.value;
    if (event.key === 'ArrowRight' || event.key === 'ArrowUp') next += this.step;
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') next -= this.step;
    else if (event.key === 'PageUp') next += this.step * 10;
    else if (event.key === 'PageDown') next -= this.step * 10;
    else if (event.key === 'Home') next = this.min;
    else if (event.key === 'End') next = this.max;
    else return;
    event.preventDefault(); this.value = next; emit(this, 'ui-input', { value: this.value }); emit(this, 'ui-change', { value: this.value });
  }
  sync() {
    this.min = Number(valueOf(this, 'min', '0')); if (!Number.isFinite(this.min)) this.min = 0;
    this.max = Number(valueOf(this, 'max', '100')); if (!Number.isFinite(this.max) || !(this.max > this.min)) this.max = this.min + 1;
    this.step = Math.max(0.000001, Number(valueOf(this, 'step', '1')) || 1);
    if (this.hasAttribute('value')) { const raw = Number(this.getAttribute('value')); this._value = this.clamp(Number.isFinite(raw) ? raw : this.min); }
    else this._value = this.clamp(this._value);
    const ratio = (this._value - this.min) / (this.max - this.min);
    this.style.setProperty('--ui-range-ratio', String(ratio));
    this.track.setAttribute('aria-valuenow', String(this._value));
    this.track.setAttribute('aria-disabled', String(this.hasAttribute('disabled')));
    this.track.tabIndex = this.hasAttribute('disabled') ? -1 : 0;
    this.hiddenValue.name = this.hasAttribute('disabled') ? '' : valueOf(this, 'name');
    this.hiddenValue.value = String(this._value);
  }
  get value() { return this._value; }
  set value(value) { this._value = this.clamp(Number(value) || 0); this.setAttribute('value', String(this._value)); if (this.track) this.sync(); }
  get disabled() { return this.hasAttribute('disabled'); }
  set disabled(value) { this.toggleAttribute('disabled', !!value); }
  focus(options) { this.track?.focus(options); }
}
define('ui-range', UIRange);
