import { h, floatEl, showFloat, hideFloat } from '../core.js';
import { icon } from '../icons.js';
import { config } from '../config.js';

let region;
const ICON = { success: 'circle-check', danger: 'circle-x', error: 'circle-x', warning: 'triangle-alert', info: 'info', neutral: 'bell' };
function getRegion() {
  if (!region || !region.isConnected) {
    region = h('div', { class: 'ui-toast-region', role: 'region', 'aria-label': 'Notifications', 'aria-live': 'polite' });
    region.setAttribute('popover', 'manual'); document.body.append(region);
  }
  region.dataset.position = config.toastPosition;
  // Re-enter the top layer so toasts also appear above open dialogs.
  hideFloat(region); showFloat(region); return region;
}
/** toast({ title, description, variant: 'success'|'danger'|'warning'|'info'|'neutral', duration: 5000, action: { label, onClick } }) → { dismiss } */
export function toast(opts = {}) {
  const o = typeof opts === 'string' ? { title: opts } : opts; const variant = o.variant || 'neutral'; const duration = o.duration ?? 5000;
  const close = h('button', { class: 'ui-btn ui-btn--subtle ui-btn--icon ui-btn--sm', type: 'button', 'aria-label': 'Dismiss notification' }, icon('x'));
  const body = h('div', { class: 'ui-toast-body' }, o.title && h('p', { class: 'ui-toast-title', text: o.title }), o.description && h('p', { class: 'ui-toast-desc', text: o.description }));
  const el = h('div', { class: `ui-toast ui-toast--${variant}`, role: variant === 'danger' || variant === 'error' ? 'alert' : 'status' }, icon(ICON[variant] || 'bell'), body, close);
  let timer;
  const dismiss = () => { clearTimeout(timer); if (!el.isConnected) return; el.classList.add('is-leaving'); setTimeout(() => { el.remove(); if (!region?.children.length) hideFloat(region); }, 170); o.onDismiss?.(); };
  if (o.action) { const a = h('button', { class: 'ui-btn ui-btn--secondary ui-btn--sm', type: 'button', text: o.action.label, onclick: () => { o.action.onClick?.(); dismiss(); } }); body.append(h('div', { class: 'ui-toast-actions' }, a)); }
  close.addEventListener('click', dismiss);
  const r = getRegion(); r.append(el);
  if (duration > 0) {
    el.append(h('span', { class: 'ui-toast-timer', style: `--_dur:${duration}ms` }));
    let left = duration, start = Date.now(); const arm = () => { start = Date.now(); timer = setTimeout(dismiss, left); };
    el.addEventListener('pointerenter', () => { clearTimeout(timer); left -= Date.now() - start; }); el.addEventListener('pointerleave', arm); arm();
  }
  return { dismiss, element: el };
}
