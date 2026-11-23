import { define, h, emit, uid, bool } from '../core.js';

export class UIOption extends HTMLElement {
  static observedAttributes = ['value', 'label', 'description', 'disabled', 'selected', 'icon'];
  get value() { return this.getAttribute('value') ?? this.textContent.trim(); }
  get label() { return this.getAttribute('label') || this.textContent.trim(); }
  get disabled() { return bool(this, 'disabled'); }
}
define('ui-option', UIOption);

export class UISelect extends HTMLElement {
  static observedAttributes = ['value', 'placeholder', 'disabled', 'multiple', 'searchable', 'name', 'label', 'placement', 'required'];
  connectedCallback() {
    if (this.popoverElement) return;
    const children = [...this.children];
    this.options = children.filter((child) => child.localName === 'ui-option');
    const selected = this.options.filter((option) => option.hasAttribute('selected')).map((option) => option.value);
    this._value = this.hasAttribute('value') ? (bool(this, 'multiple') ? this.getAttribute('value').split(',').filter(Boolean) : this.getAttribute('value')) : (bool(this, 'multiple') ? selected : (selected[0] || ''));
    const trigger = h('button', { class: 'ui-select-trigger', type: 'button', slot: 'trigger', 'aria-label': this.getAttribute('label') || this.getAttribute('placeholder') || 'Choose an option' });
    this.trigger = trigger;
    this.valueLabel = h('span', { class: 'ui-select-value' });
    trigger.append(this.valueLabel, h('ui-icon', { class: 'ui-select-chevron', name: 'chevron-down' }));
    this.popoverElement = h('ui-popover', { placement: this.getAttribute('placement') || 'bottom-start' }, trigger);
    this.panelContent = h('div', { class: 'ui-select-panel', role: 'presentation' });
    if (bool(this, 'searchable')) {
      this.search = h('ui-input', { class: 'ui-select-search', placeholder: 'Search options…', label: 'Filter options', 'aria-label': 'Filter options' });
      this.search.addEventListener('ui-input', () => this.filter(this.search.value));
      this.panelContent.append(this.search);
    }
    this.list = h('div', { class: 'ui-select-list', role: 'listbox', 'aria-label': this.getAttribute('label') || 'Options' });
    this.formFields = h('span', { class: 'ui-sr-only', 'aria-hidden': 'true' });
    this.list.addEventListener('click', (event) => {
      const item = event.target.closest('[data-ui-option-index]');
      if (item) this.choose(this.options[Number(item.dataset.uiOptionIndex)]);
    });
    this.list.addEventListener('keydown', (event) => this.onListKey(event));
    this.panelContent.append(this.list, ...this.options);
    this.popoverElement.append(this.panelContent);
    this.popoverElement.addEventListener('ui-open', () => { this.renderOptions(); if (this.search) { this.search.value = ''; this.filter(''); this.search.focus(); } else this.focusSelected(); });
    this.popoverElement.addEventListener('ui-close', () => { if (this.search) this.search.value = ''; });
    trigger.addEventListener('keydown', (event) => {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
        event.preventDefault();
        this.popoverElement.show();
        if (!this.search) this.focusSelected(event.key === 'ArrowUp' ? -1 : 1);
      }
    });
    this.replaceChildren(this.popoverElement, this.formFields);
    this.sync();
  }
  attributeChangedCallback(name) {
    if (!this.popoverElement) return;
    if (name === 'value' || name === 'multiple') this._value = this.multiple ? (this.getAttribute('value') || '').split(',').filter(Boolean) : (this.getAttribute('value') || '');
    this.sync();
  }
  get multiple() { return bool(this, 'multiple'); }
  get disabled() { return bool(this, 'disabled'); }
  set disabled(value) { this.toggleAttribute('disabled', !!value); }
  get value() { return this._value ?? (this.multiple ? [] : ''); }
  set value(value) {
    this._value = this.multiple ? (Array.isArray(value) ? value.map(String) : (value ? [String(value)] : [])) : String(value ?? '');
    this.setAttribute('value', this.multiple ? this._value.join(',') : this._value);
    if (this.popoverElement) this.sync();
  }
  get selectedOptions() { return this.options.filter((option) => this.multiple ? this.value.includes(option.value) : this.value === option.value); }
  sync() {
    if (!this.multiple && Array.isArray(this._value)) this._value = this._value[0] || '';
    if (this.multiple && !Array.isArray(this._value)) this._value = this._value ? [String(this._value)] : [];
    this.trigger.disabled = this.disabled;
    this.trigger.setAttribute('aria-disabled', String(this.disabled));
    this.trigger.setAttribute('aria-required', String(bool(this, 'required')));
    this.trigger.setAttribute('aria-haspopup', 'listbox');
    this.trigger.setAttribute('aria-expanded', String(this.popoverElement.open));
    this.list.setAttribute('aria-multiselectable', String(this.multiple));
    this.renderLabel();
    this.updateFormFields();
    this.renderOptions();
  }
  renderLabel() {
    const selected = this.selectedOptions;
    this.valueLabel.replaceChildren();
    if (!selected.length) this.valueLabel.textContent = this.getAttribute('placeholder') || 'Select an option';
    else if (this.multiple) {
      selected.forEach((option) => this.valueLabel.append(h('span', { class: 'ui-select-chip', text: option.label })));
    } else this.valueLabel.textContent = selected[0].label;
    this.trigger.classList.toggle('is-placeholder', !selected.length);
  }
  updateFormFields() {
    const name = this.disabled ? '' : (this.getAttribute('name') || '');
    const values = this.multiple ? this.value : (this.value ? [this.value] : []);
    this.formFields.replaceChildren(...values.map((value) => h('input', { type: 'hidden', id: uid('ui-select-value'), name, value })));
  }
  renderOptions() {
    if (!this.list) return;
    this.list.replaceChildren();
    this.options.forEach((option, index) => {
      const selected = this.multiple ? this.value.includes(option.value) : this.value === option.value;
      const row = h('button', {
        class: 'ui-select-option',
        type: 'button',
        role: 'option',
        'data-ui-option-index': String(index),
        'aria-selected': String(selected),
        'aria-disabled': String(option.disabled),
        disabled: option.disabled
      });
      if (option.hasAttribute('icon')) row.append(h('ui-icon', { name: option.getAttribute('icon') }));
      const content = h('span', { class: 'ui-select-option-copy' }, h('span', { class: 'ui-select-option-label', text: option.label }));
      if (option.hasAttribute('description')) content.append(h('span', { class: 'ui-select-option-desc', text: option.getAttribute('description') }));
      row.append(content, h('ui-icon', { class: 'ui-select-option-check', name: 'check' }));
      this.list.append(row);
    });
  }
  filter(query) {
    const q = String(query || '').trim().toLowerCase();
    this.list.querySelectorAll('[data-ui-option-index]').forEach((row) => {
      const option = this.options[Number(row.dataset.uiOptionIndex)];
      row.hidden = !!q && !(option.label + ' ' + (option.getAttribute('description') || '')).toLowerCase().includes(q);
    });
  }
  focusSelected(direction = 1) {
    const rows = [...this.list.querySelectorAll('[data-ui-option-index]:not([hidden]):not(:disabled)')];
    const selected = rows.find((row) => row.getAttribute('aria-selected') === 'true');
    (selected || (direction < 0 ? rows.at(-1) : rows[0]))?.focus();
  }
  onListKey(event) {
    const rows = [...this.list.querySelectorAll('[data-ui-option-index]:not([hidden]):not(:disabled)')];
    const at = rows.indexOf(this.ownerDocument.activeElement);
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault(); rows[(at + (event.key === 'ArrowDown' ? 1 : -1) + rows.length) % rows.length]?.focus();
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault(); (event.key === 'Home' ? rows[0] : rows.at(-1))?.focus();
    } else if (event.key === 'Escape') { event.preventDefault(); this.popoverElement.hide(); this.trigger.focus(); }
    else if (event.key === 'Tab') this.popoverElement.hide();
  }
  choose(option) {
    if (!option || option.disabled || this.disabled) return;
    let value;
    if (this.multiple) {
      const values = new Set(this.value);
      values.has(option.value) ? values.delete(option.value) : values.add(option.value);
      value = [...values];
    } else value = option.value;
    this.value = value;
    emit(this, 'ui-input', { value: this.value, option });
    emit(this, 'ui-change', { value: this.value, option, selectedOptions: this.selectedOptions });
    if (!this.multiple) { this.popoverElement.hide(); this.trigger.focus(); }
  }
  focus(options) { this.trigger?.focus(options); }
  formResetCallback() { this.value = this.getAttribute('value') || ''; }
}
define('ui-select', UISelect);
