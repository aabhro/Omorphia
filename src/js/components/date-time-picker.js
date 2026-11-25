import { define, h, emit, uid } from '../core.js';

const pad = (value) => String(value).padStart(2, '0');
const isoDate = (date) => date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate());
const parseDate = (value) => {
  if (!value) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const date = new Date(0);
  date.setHours(0, 0, 0, 0);
  date.setFullYear(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return date.getFullYear() === Number(match[1]) && date.getMonth() === Number(match[2]) - 1 && date.getDate() === Number(match[3]) ? date : null;
};
const dateLabel = (date, locale) => new Intl.DateTimeFormat(locale || undefined, { year: 'numeric', month: 'short', day: 'numeric' }).format(date);
const yearMonth = (date) => date.getFullYear() * 12 + date.getMonth();
const weekStartOf = (value) => {
  const parsed = Number.parseInt(value ?? '0', 10);
  return Number.isFinite(parsed) ? Math.min(6, Math.max(0, parsed)) : 0;
};
const shiftMonth = (date, amount) => {
  const target = new Date(date.getFullYear(), date.getMonth() + amount, 1);
  target.setDate(Math.min(date.getDate(), new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate()));
  return target;
};

export class UIDatePicker extends HTMLElement {
  static observedAttributes = ['value', 'min', 'max', 'disabled', 'placeholder', 'locale', 'week-start', 'placement', 'name', 'label'];
  connectedCallback() {
    if (this.popoverElement) return;
    this._value = parseDate(this.getAttribute('value')) ? this.getAttribute('value') : '';
    const initial = parseDate(this._value) || new Date();
    this.view = new Date(initial.getFullYear(), initial.getMonth(), 1);
    this.trigger = h('button', { class: 'ui-date-trigger', type: 'button', slot: 'trigger', 'aria-haspopup': 'dialog', 'aria-label': this.getAttribute('label') || 'Choose date' });
    this.valueLabel = h('span', { class: 'ui-date-value' });
    this.trigger.append(h('ui-icon', { name: 'calendar' }), this.valueLabel, h('ui-icon', { name: 'chevron-down', class: 'ui-date-chevron' }));
    this.popoverElement = h('ui-popover', { placement: this.getAttribute('placement') || 'bottom-start' }, this.trigger);
    this.calendar = h('div', { class: 'ui-calendar', role: 'dialog', 'aria-label': 'Choose a date' });
    this.header = h('div', { class: 'ui-calendar-head' });
    this.prev = h('button', { class: 'ui-calendar-nav', type: 'button', 'aria-label': 'Previous month' }, h('ui-icon', { name: 'chevron-left' }));
    this.monthLabel = h('strong', { class: 'ui-calendar-month' });
    this.next = h('button', { class: 'ui-calendar-nav', type: 'button', 'aria-label': 'Next month' }, h('ui-icon', { name: 'chevron-right' }));
    this.header.append(this.prev, this.monthLabel, this.next);
    this.weekdays = h('div', { class: 'ui-calendar-weekdays', role: 'row' });
    this.days = h('div', { class: 'ui-calendar-days', role: 'grid', 'aria-label': 'Calendar days' });
    this.footer = h('div', { class: 'ui-calendar-footer' });
    this.clearButton = h('button', { class: 'ui-calendar-text-action', type: 'button', text: 'Clear' });
    this.todayButton = h('button', { class: 'ui-calendar-text-action', type: 'button', text: 'Today' });
    this.footer.append(this.clearButton, this.todayButton);
    this.calendar.append(this.header, this.weekdays, this.days, this.footer);
    this.prev.addEventListener('click', () => this.changeMonth(-1));
    this.next.addEventListener('click', () => this.changeMonth(1));
    this.days.addEventListener('click', (event) => {
      const button = event.target.closest('[data-date]');
      if (button && !button.disabled) this.select(button.dataset.date);
    });
    this.days.addEventListener('keydown', (event) => this.onDayKey(event));
    this.clearButton.addEventListener('click', () => this.select(''));
    this.todayButton.addEventListener('click', () => this.select(isoDate(new Date())));
    this.popoverElement.addEventListener('ui-open', () => this.focusCurrentDay());
    this.popoverElement.append(this.calendar);
    this.hiddenValue = h('input', { type: 'hidden', id: uid('ui-date-value'), name: this.getAttribute('name') || '', value: this._value });
    this.hiddenValue.hidden = true;
    this.replaceChildren(this.popoverElement, this.hiddenValue);
    this.sync();
  }
  attributeChangedCallback(name, _oldValue, newValue) {
    if (!this.popoverElement) return;
    if (name === 'value') {
      const date = parseDate(newValue);
      this._value = date ? isoDate(date) : '';
      if (date) this.view = new Date(date.getFullYear(), date.getMonth(), 1);
    } else if (name === 'min' || name === 'max') {
      const min = parseDate(this.getAttribute('min')), max = parseDate(this.getAttribute('max'));
      if (min && yearMonth(this.view) < yearMonth(min)) this.view = new Date(min.getFullYear(), min.getMonth(), 1);
      if (max && yearMonth(this.view) > yearMonth(max)) this.view = new Date(max.getFullYear(), max.getMonth(), 1);
    }
    this.sync();
  }
  get value() { return this._value || ''; }
  set value(value) {
    const valid = parseDate(String(value || ''));
    this._value = valid ? isoDate(valid) : '';
    if (valid) this.view = new Date(valid.getFullYear(), valid.getMonth(), 1);
    this.setAttribute('value', this._value);
    if (this.calendar) this.sync();
  }
  get date() { return parseDate(this.value); }
  focus(options) { this.trigger?.focus(options); }
  get open() { return !!this.popoverElement?.open; }
  show() { this.popoverElement?.show(); }
  hide() { this.popoverElement?.hide(); }
  toggle() { this.popoverElement?.toggle(); }
  get disabled() { return this.hasAttribute('disabled'); }
  set disabled(value) { this.toggleAttribute('disabled', !!value); }
  isDisabled(date) {
    const iso = isoDate(date);
    const min = parseDate(this.getAttribute('min')), max = parseDate(this.getAttribute('max'));
    return (min && iso < isoDate(min)) || (max && iso > isoDate(max)) || this.disabled;
  }
  sync() {
    const parsed = parseDate(this.getAttribute('value'));
    if (this.hasAttribute('value')) this._value = parsed ? isoDate(parsed) : '';
    this.trigger.disabled = this.disabled;
    this.trigger.setAttribute('aria-disabled', String(this.disabled));
    this.valueLabel.textContent = this.date ? dateLabel(this.date, this.getAttribute('locale')) : (this.getAttribute('placeholder') || 'Choose date');
    this.trigger.classList.toggle('is-placeholder', !this.value);
    this.trigger.setAttribute('aria-expanded', String(this.popoverElement.open));
    const min = parseDate(this.getAttribute('min')), max = parseDate(this.getAttribute('max'));
    const monthValue = yearMonth(this.view);
    this.prev.disabled = this.disabled || !!(min && monthValue <= yearMonth(min));
    this.next.disabled = this.disabled || !!(max && monthValue >= yearMonth(max));
    this.clearButton.disabled = this.disabled || !this.value;
    this.todayButton.disabled = this.disabled || this.isDisabled(new Date());
    this.hiddenValue.name = this.disabled || this._invalidValue ? '' : (this.getAttribute('name') || '');
    this.hiddenValue.value = this.value;
    this.renderCalendar();
  }
  renderCalendar() {
    const year = this.view.getFullYear(), month = this.view.getMonth();
    this.monthLabel.textContent = new Intl.DateTimeFormat(this.getAttribute('locale') || undefined, { month: 'long', year: 'numeric' }).format(this.view);
    const weekStart = weekStartOf(this.getAttribute('week-start'));
    const base = new Date(year, month, 1);
    const offset = (base.getDay() - weekStart + 7) % 7;
    const start = new Date(year, month, 1 - offset);
    const formatter = new Intl.DateTimeFormat(this.getAttribute('locale') || undefined, { weekday: 'short' });
    this.weekdays.replaceChildren(...Array.from({ length: 7 }, (_, i) => {
      const day = new Date(2024, 0, 7 + ((weekStart + i) % 7));
      return h('span', { role: 'columnheader', text: formatter.format(day) });
    }));
    const items = [];
    for (let i = 0; i < 42; i++) {
      const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
      const iso = isoDate(date), outside = date.getMonth() !== month, selected = iso === this.value;
      const button = h('button', {
        class: 'ui-calendar-day' + (outside ? ' is-outside' : '') + (selected ? ' is-selected' : ''),
        type: 'button', role: 'gridcell', 'data-date': iso,
        'aria-label': dateLabel(date, this.getAttribute('locale')),
        'aria-selected': String(selected),
        'aria-current': iso === isoDate(new Date()) ? 'date' : null,
        disabled: this.isDisabled(date),
        tabindex: selected ? '0' : '-1'
      }, String(date.getDate()));
      items.push(button);
    }
    this.days.replaceChildren(...items);
  }
  changeMonth(amount) {
    if (this.disabled) return;
    const target = new Date(this.view.getFullYear(), this.view.getMonth() + amount, 1);
    const min = parseDate(this.getAttribute('min')), max = parseDate(this.getAttribute('max'));
    if (min && yearMonth(target) < yearMonth(min)) return;
    if (max && yearMonth(target) > yearMonth(max)) return;
    this.view = target;
    this.renderCalendar();
    this.syncNavigation();
  }
  syncNavigation() {
    if (!this.prev || !this.next) return;
    const min = parseDate(this.getAttribute('min')), max = parseDate(this.getAttribute('max'));
    const month = yearMonth(this.view);
    this.prev.disabled = this.disabled || !!(min && month <= yearMonth(min));
    this.next.disabled = this.disabled || !!(max && month >= yearMonth(max));
  }
  focusCurrentDay() {
    const target = this.days.querySelector('[data-date="' + (this.value || isoDate(new Date())) + '"]:not(:disabled)') || this.days.querySelector('button:not(:disabled)');
    target?.focus({ preventScroll: true });
  }
  onDayKey(event) {
    const current = parseDate(event.target.dataset.date);
    if (!current || this.disabled) return;
    let next = null;
    if (event.key === 'ArrowLeft') next = new Date(current.getFullYear(), current.getMonth(), current.getDate() - 1);
    else if (event.key === 'ArrowRight') next = new Date(current.getFullYear(), current.getMonth(), current.getDate() + 1);
    else if (event.key === 'ArrowUp') next = new Date(current.getFullYear(), current.getMonth(), current.getDate() - 7);
    else if (event.key === 'ArrowDown') next = new Date(current.getFullYear(), current.getMonth(), current.getDate() + 7);
    else if (event.key === 'Home') next = new Date(current.getFullYear(), current.getMonth(), current.getDate() - ((current.getDay() - weekStartOf(this.getAttribute('week-start')) + 7) % 7));
    else if (event.key === 'End') next = new Date(current.getFullYear(), current.getMonth(), current.getDate() + (6 - ((current.getDay() - weekStartOf(this.getAttribute('week-start')) + 7) % 7)));
    else if (event.key === 'PageUp') next = shiftMonth(current, event.shiftKey ? -12 : -1);
    else if (event.key === 'PageDown') next = shiftMonth(current, event.shiftKey ? 12 : 1);
    else if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); this.select(event.target.dataset.date); return; }
    else return;
    event.preventDefault();
    if (this.isDisabled(next)) return;
    if (next.getMonth() !== this.view.getMonth() || next.getFullYear() !== this.view.getFullYear()) this.view = new Date(next.getFullYear(), next.getMonth(), 1);
    this.renderCalendar();
    this.syncNavigation();
    this.days.querySelector('[data-date="' + isoDate(next) + '"]:not(:disabled)')?.focus({ preventScroll: true });
  }
  select(value) {
    if (this.disabled) return;
    const date = parseDate(value);
    if (date && this.isDisabled(date)) return;
    this._value = date ? isoDate(date) : '';
    this.setAttribute('value', this._value);
    if (date) this.view = new Date(date.getFullYear(), date.getMonth(), 1);
    this.sync();
    emit(this, 'ui-input', { value: this.value, date: this.date });
    emit(this, 'ui-change', { value: this.value, date: this.date });
    if (date || !value) { this.popoverElement.hide(); this.trigger.focus(); }
  }
}
define('ui-date-picker', UIDatePicker);

const parseTime = (value) => {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(String(value || ''));
  return match ? { hour: Number(match[1]), minute: Number(match[2]) } : null;
};

const defaultTime = () => ({ hour: 9, minute: 0 });

export class UITimePicker extends HTMLElement {
  static observedAttributes = ['value', 'disabled', 'placeholder', 'format', 'step', 'placement', 'label', 'name'];
  connectedCallback() {
    if (this.popoverElement) return;
    this._time = parseTime(this.getAttribute('value')) || defaultTime();
    this._invalidValue = this.hasAttribute('value') && !parseTime(this.getAttribute('value'));
    this.input = h('input', { class: 'ui-time-input', id: uid('ui-time-input'), type: 'text', inputmode: 'text', autocomplete: 'off', spellcheck: 'false', 'aria-label': this.getAttribute('label') || 'Time', placeholder: this.getAttribute('placeholder') || (this.is12Hour ? 'h:mm AM' : 'HH:mm') });
    this.trigger = h('button', { class: 'ui-time-trigger', type: 'button', 'aria-haspopup': 'dialog', 'aria-label': 'Open time options' }, h('ui-icon', { name: 'clock' }));
    this.field = h('div', { class: 'ui-time-field', slot: 'trigger' }, this.input, this.trigger);
    this.popoverElement = h('ui-popover', { placement: this.getAttribute('placement') || 'bottom-start' }, this.field);
    this.panel = h('div', { class: 'ui-time-panel', role: 'dialog', 'aria-label': 'Choose time' });
    this.columns = h('div', { class: 'ui-time-columns' });
    this.hourList = h('div', { class: 'ui-time-list', role: 'listbox', 'aria-label': 'Hours' });
    this.minuteList = h('div', { class: 'ui-time-list', role: 'listbox', 'aria-label': 'Minutes' });
    this.period = h('button', { class: 'ui-time-period', type: 'button', hidden: true });
    this.columns.append(this.hourList, h('span', { class: 'ui-time-separator', text: ':' }), this.minuteList, this.period);
    this.panel.append(h('div', { class: 'ui-time-title', text: 'Select a time' }), this.columns);
    this.popoverElement.append(this.panel);
    this.hourList.addEventListener('click', (event) => { const item = event.target.closest('[data-hour]'); if (item) this.setPart('hour', Number(item.dataset.hour)); });
    this.minuteList.addEventListener('click', (event) => { const item = event.target.closest('[data-minute]'); if (item) this.setPart('minute', Number(item.dataset.minute)); });
    this.hourList.addEventListener('keydown', (event) => this.onListKey(event));
    this.minuteList.addEventListener('keydown', (event) => this.onListKey(event));
    this.period.addEventListener('click', () => { this._time.hour = (this._time.hour + 12) % 24; this.commit('period'); });
    this.input.addEventListener('click', (event) => { event.stopPropagation(); this.popoverElement.show(); });
    this.input.addEventListener('input', () => this.handleTypedInput());
    this.input.addEventListener('change', () => this.commitTypedInput());
    this.input.addEventListener('keydown', (event) => { if (event.key === 'Enter') { event.preventDefault(); this.commitTypedInput(); this.popoverElement.hide(); } else if (event.key === 'ArrowDown') { event.preventDefault(); this.popoverElement.show(); this.focusTime(); } });
    this.popoverElement.addEventListener('ui-open', () => { if (this.ownerDocument.activeElement !== this.input) this.focusTime(); });
    this.hiddenValue = h('input', { type: 'hidden', id: uid('ui-time-value'), name: this.getAttribute('name') || '', value: this.value });
    this.hiddenValue.hidden = true;
    this.replaceChildren(this.popoverElement, this.hiddenValue);
    this.sync();
  }
  attributeChangedCallback() {
    if (!this.popoverElement) return;
    const parsed = parseTime(this.getAttribute('value'));
    this._invalidValue = this.hasAttribute('value') && !parsed;
    if (parsed) this._time = parsed;
    else if (!this._invalidValue) this._time = defaultTime();
    this.sync();
  }
  get value() {
    if (this._invalidValue) return '';
    const time = this._time || defaultTime();
    return pad(time.hour) + ':' + pad(time.minute);
  }
  set value(value) {
    const raw = String(value ?? '');
    const parsed = parseTime(raw);
    this._invalidValue = raw.trim() !== '' && !parsed;
    this._time = parsed || defaultTime();
    this.setAttribute('value', this._invalidValue ? raw : this.value);
    if (this.popoverElement) this.sync();
  }
  get disabled() { return this.hasAttribute('disabled'); }
  set disabled(value) { this.toggleAttribute('disabled', !!value); }
  focus(options) { this.input?.focus(options); }
  get open() { return !!this.popoverElement?.open; }
  show() { this.popoverElement?.show(); }
  hide() { this.popoverElement?.hide(); }
  toggle() { this.popoverElement?.toggle(); }
  get is12Hour() { return this.getAttribute('format') === '12h'; }
  sync() {
    if (this.hasAttribute('value')) {
      const parsed = parseTime(this.getAttribute('value'));
      this._invalidValue = !parsed;
      if (parsed) this._time = parsed;
    }
    this.trigger.disabled = this.disabled;
    this.trigger.setAttribute('aria-disabled', String(this.disabled));
    this.trigger.setAttribute('aria-expanded', String(this.popoverElement.open));
    this.input.disabled = this.disabled;
    this.input.setAttribute('aria-invalid', String(!!this._invalidValue));
    const hour = this._time.hour, displayHour = this.is12Hour ? ((hour + 11) % 12) + 1 : hour;
    this.input.value = this._invalidValue
      ? (this.getAttribute('value') || '')
      : (this.is12Hour ? String(displayHour) : pad(displayHour)) + ':' + pad(this._time.minute) + (this.is12Hour ? (hour < 12 ? ' AM' : ' PM') : '');
    this.period.hidden = !this.is12Hour;
    this.period.textContent = hour < 12 ? 'AM' : 'PM';
    this.hiddenValue.name = this.disabled ? '' : (this.getAttribute('name') || '');
    this.hiddenValue.value = this.value;
    this.renderOptions();
  }
  renderOptions() {
    const hour = this._time.hour, displayHour = this.is12Hour ? ((hour + 11) % 12) + 1 : hour;
    const requestedStep = Number(this.getAttribute('step') || 5);
    const step = Number.isInteger(requestedStep) && requestedStep >= 1 && requestedStep <= 30
      ? requestedStep
      : 5;
    const hours = this.is12Hour ? Array.from({ length: 12 }, (_, i) => i + 1) : Array.from({ length: 24 }, (_, i) => i);
    this.hourList.replaceChildren(...hours.map((n) => h('button', { class: 'ui-time-option', type: 'button', role: 'option', 'data-hour': String(this.is12Hour ? n % 12 : n), 'aria-selected': String(displayHour === n), tabindex: displayHour === n ? '0' : '-1' }, this.is12Hour ? String(n) : pad(n))));
    const minutes = [];
    for (let n = 0; n < 60; n += step) minutes.push(n);
    if (!minutes.includes(this._time.minute)) minutes.push(this._time.minute);
    minutes.sort((a, b) => a - b);
    this.minuteList.replaceChildren(...minutes.map((n) => h('button', { class: 'ui-time-option', type: 'button', role: 'option', 'data-minute': String(n), 'aria-selected': String(this._time.minute === n), tabindex: this._time.minute === n ? '0' : '-1' }, pad(n))));
  }
  parseTypedTime(raw) {
    const value = String(raw || '').trim();
    let match = /^([01]?\d|2[0-3]):([0-5]\d)$/.exec(value);
    if (match) return { hour: Number(match[1]), minute: Number(match[2]) };
    match = /^(0?[1-9]|1[0-2]):([0-5]\d)\s*(AM|PM)$/i.exec(value);
    if (match) return { hour: (Number(match[1]) % 12) + (match[3].toUpperCase() === 'PM' ? 12 : 0), minute: Number(match[2]) };
    return null;
  }
  handleTypedInput() {
    const parsed = this.parseTypedTime(this.input.value);
    this.input.setAttribute('aria-invalid', String(!parsed));
    if (!parsed) {
      this._invalidValue = true;
      this.hiddenValue.value = '';
      this.hiddenValue.name = '';
      return;
    }
    this._invalidValue = false;
    this._time = parsed;
    this.hiddenValue.value = this.value;
    this.renderOptions();
    emit(this, 'ui-input', { value: this.value });
  }
  commitTypedInput() {
    const parsed = this.parseTypedTime(this.input.value);
    if (!parsed) { this._invalidValue = true; this.input.setAttribute('aria-invalid', 'true'); return; }
    this._invalidValue = false;
    this._time = parsed;
    this.setAttribute('value', this.value);
    this.sync();
    emit(this, 'ui-input', { value: this.value });
    emit(this, 'ui-change', { value: this.value });
  }
  scrollOptionIntoView(list, item) {
    if (!list || !item) return;
    const listRect = list.getBoundingClientRect(), itemRect = item.getBoundingClientRect();
    if (itemRect.top < listRect.top) list.scrollTop -= listRect.top - itemRect.top;
    else if (itemRect.bottom > listRect.bottom) list.scrollTop += itemRect.bottom - listRect.bottom;
  }
  onListKey(event) {
    const rows = [...event.currentTarget.querySelectorAll('button')];
    const at = rows.indexOf(event.target);
    let next = null;
    if (event.key === 'ArrowDown') next = rows[(at + 1) % rows.length];
    else if (event.key === 'ArrowUp') next = rows[(at - 1 + rows.length) % rows.length];
    else if (event.key === 'Home') next = rows[0];
    else if (event.key === 'End') next = rows.at(-1);
    if (next) { event.preventDefault(); next.focus({ preventScroll: true }); this.scrollOptionIntoView(event.currentTarget, next); }
    else if ((event.key === 'Enter' || event.key === ' ') && rows[at]) {
      event.preventDefault();
      rows[at].click();
    }
  }
  setPart(part, value) {
    if (part === 'hour') {
      if (this.is12Hour) {
        const pm = this._time.hour >= 12;
        this._time.hour = (value % 12) + (pm ? 12 : 0);
      } else this._time.hour = value;
    } else this._time.minute = value;
    this.commit(part);
  }
  commit(focusPart = 'hour') {
    this._invalidValue = false;
    this.setAttribute('value', this.value);
    this.sync();
    this.focusTime(focusPart);
    emit(this, 'ui-input', { value: this.value });
    emit(this, 'ui-change', { value: this.value });
  }
  focusTime(part = 'hour') {
    const hour = this.hourList.querySelector('[aria-selected="true"]');
    const minute = this.minuteList.querySelector('[aria-selected="true"]');
    const target = part === 'minute' ? minute : hour;
    target?.focus?.({ preventScroll: true });
    this.scrollOptionIntoView(this.hourList, hour);
    this.scrollOptionIntoView(this.minuteList, minute);
  }
}
define('ui-time-picker', UITimePicker);
