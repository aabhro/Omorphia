// Smoke tests: load the *built* production bundle in jsdom and exercise every component.
import { JSDOM } from 'jsdom';
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const dom = new JSDOM('<!doctype html><html data-ui-theme="dark"><body></body></html>', { runScripts: 'outside-only', pretendToBeVisual: true, url: 'http://localhost/' });
const w = dom.window; const errors = [];
w.console.error = (...a) => errors.push(a.join(' ')); w.console.warn = (...a) => errors.push(a.join(' '));
w.Element.prototype.scrollIntoView = () => {}; // jsdom lacks it
w.fetch = async () => ({ ok: false });
w.eval(readFileSync('dist/edgelit.min.js', 'utf8'));
const E = w.Edgelit, d = w.document; const tick = (ms = 0) => new Promise((r) => setTimeout(r, ms));
let passed = 0; const t = async (name, fn) => { await fn(); passed++; console.log('  ✓', name); };
const mount = (html) => { const c = d.createElement('div'); c.innerHTML = html; d.body.append(c); return c; };

await t('exports global API', () => { assert.ok(E.version); for (const k of ['toast', 'confirm', 'commands', 'icons', 'theme', 'config']) assert.ok(E[k], k); });
await t('registers every custom element once', () => { for (const n of ['ui-button', 'ui-icon', 'ui-tooltip', 'ui-modal', 'ui-popover', 'ui-dropdown', 'ui-tabs', 'ui-tab', 'ui-pagination', 'ui-command-palette', 'ui-search', 'ui-sidebar', 'ui-sidebar-item']) assert.ok(w.customElements.get(n), n); });
await t('ui-icon renders bundled Lucide svg', () => { const c = mount('<ui-icon name="search"></ui-icon><ui-icon name="home"></ui-icon>'); assert.equal(c.querySelectorAll('svg path, svg circle').length > 1, true); assert.ok(c.querySelectorAll('svg').length === 2); });
await t('ui-button variants, loading, disabled, icon-only', async () => {
  const c = mount('<ui-button variant="primary" icon="save">Save</ui-button><ui-button icon="copy" label="Copy"></ui-button>'); const [a, b] = c.children;
  assert.ok(a.querySelector('button.ui-btn.ui-btn--primary')); assert.ok(a.querySelector('svg')); assert.ok(b.querySelector('.ui-btn--icon'));
  a.loading = true; assert.ok(a.querySelector('.is-loading') && a.querySelector('button').disabled); a.loading = false; a.disabled = true; assert.ok(a.querySelector('button').disabled);
});
await t('ui-button inside form submits', () => { const c = mount('<form><ui-button type="submit">Go</ui-button></form>'); let sub = 0; c.firstChild.addEventListener('submit', (e) => { e.preventDefault(); sub++; }); c.querySelector('button').click(); assert.equal(sub, 1); });
await t('dynamic insertion works', () => { const el = d.createElement('ui-button'); el.textContent = 'Later'; d.body.append(el); assert.ok(el.querySelector('button')); });
await t('ui-tooltip wires aria + shows', async () => { const c = mount('<ui-tooltip content="Hi" delay="0"><button>x</button></ui-tooltip>'); const tip = c.firstChild; const btn = tip.querySelector('button'); assert.ok(btn.getAttribute('aria-describedby')); tip.show(); assert.equal(d.querySelector('[role=tooltip]').textContent, 'Hi'); tip.hide(); assert.equal(d.querySelector('[role=tooltip]'), null); });
await t('ui-tabs builds ARIA tabs and switches with keyboard', () => {
  const c = mount('<ui-tabs><ui-tab label="A" value="a">One</ui-tab><ui-tab label="B" value="b">Two</ui-tab></ui-tabs>'); const tabs = c.firstChild; const btns = tabs.querySelectorAll('[role=tab]');
  assert.equal(btns.length, 2); assert.equal(btns[0].getAttribute('aria-selected'), 'true'); assert.ok(tabs.querySelectorAll('ui-tab')[1].hidden);
  let ev; tabs.addEventListener('ui-change', (e) => (ev = e.detail)); btns[0].focus(); btns[0].dispatchEvent(new w.KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
  assert.equal(ev.value, 'b'); assert.equal(btns[1].getAttribute('aria-selected'), 'true'); assert.ok(!tabs.querySelectorAll('ui-tab')[1].hidden);
});
await t('ui-pagination ranges, events, bounds', () => {
  const c = mount('<ui-pagination total="20" page="10"></ui-pagination>'); const p = c.firstChild; const txt = () => [...p.querySelectorAll('.ui-page-btn, .ui-page-gap')].map((e) => e.textContent).join(',');
  assert.equal(txt(), ',1,…,9,10,11,…,20,'); let got; p.addEventListener('ui-change', (e) => (got = e.detail.page)); p.querySelector('[aria-label="Next page"]').click(); assert.equal(got, 11);
  p.setAttribute('page', '1'); assert.ok(p.querySelector('[aria-label="Previous page"]').disabled);
});
await t('ui-modal opens, closes, cancelable close, events', async () => {
  const c = mount('<ui-modal heading="Hello"><p>Body</p><div slot="footer"><button id="f">OK</button></div></ui-modal>'); const m = c.firstChild; let o = 0, cl = 0; m.addEventListener('ui-open', () => o++); m.addEventListener('ui-close', () => cl++);
  assert.equal(m.querySelector('.ui-modal-title').textContent, 'Hello'); m.show(); assert.ok(m.open && o === 1);
  m.addEventListener('ui-before-close', (e) => e.preventDefault(), { once: true }); m.close(); assert.ok(m.open); m.close('x'); assert.ok(!m.open); assert.equal(cl, 1);
});
await t('confirm() resolves true/false', async () => { const p = E.confirm({ title: 'Delete?', destructive: true }); await tick(30); d.querySelector('ui-modal [slot=footer] ui-button:last-child button').click(); assert.equal(await p, true); const q = E.confirm({}); await tick(30); d.querySelector('ui-modal [slot=footer] ui-button:first-child button').click(); assert.equal(await q, false); });
await t('ui-popover toggles + aria-expanded', () => { const c = mount('<ui-popover><button>Open</button><p>Hi</p></ui-popover>'); const p = c.firstChild; const b = p.querySelector('button'); b.click(); assert.ok(p.open); assert.equal(b.getAttribute('aria-expanded'), 'true'); b.click(); assert.ok(!p.open); });
await t('ui-dropdown menu: roles, keyboard, select event', () => {
  const c = mount('<ui-dropdown><button slot="trigger">Menu</button><button data-value="a">Alpha</button><hr><button data-value="b">Beta</button></ui-dropdown>'); const dd = c.firstChild; const trig = dd.querySelector('[slot=trigger]');
  trig.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true })); assert.ok(dd.open); const items = dd.panel.querySelectorAll('[role=menuitem]'); assert.equal(items.length, 2); assert.equal(d.activeElement, items[0]);
  dd.panel.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true })); assert.equal(d.activeElement, items[1]);
  let v; dd.addEventListener('ui-select', (e) => (v = e.detail.value)); items[1].click(); assert.equal(v, 'b'); assert.ok(!dd.open);
});
await t('toast appears, stacks, dismisses', async () => { const a = E.toast({ title: 'Saved', variant: 'success', duration: 0 }); E.toast('Second'); assert.equal(d.querySelectorAll('.ui-toast').length, 2); a.dismiss(); await tick(220); assert.equal(d.querySelectorAll('.ui-toast').length, 1); });
await t('command palette: open, filter+highlight, keyboard, callback, empty/no-results', async () => {
  const c = mount('<ui-command-palette></ui-command-palette>'); const p = c.firstChild; assert.ok(p.dialog);
  p.open(); assert.ok(d.querySelector('.ui-empty-title').textContent.includes('No commands yet')); p.close();
  let ran = 0; const off = E.commands.register([{ id: 'a', label: 'Create project', group: 'Actions', onSelect: () => ran++ }, { id: 'b', label: 'Open settings', group: 'Go to', icon: 'settings', href: '#x' }]);
  d.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true })); assert.ok(p.isOpen); assert.equal(p.list.querySelectorAll('.ui-option').length, 2);
  p.input.value = 'proj'; p.input.dispatchEvent(new w.Event('input')); assert.equal(p.list.querySelectorAll('.ui-option').length, 1); assert.equal(p.list.querySelector('mark').textContent, 'proj');
  p.input.value = 'zzzz'; p.input.dispatchEvent(new w.Event('input')); assert.ok(p.list.textContent.includes('No results for “zzzz”'));
  p.input.value = 'cr'; p.input.dispatchEvent(new w.Event('input')); p.input.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Enter', bubbles: true })); assert.equal(ran, 1); assert.ok(!p.isOpen);
  d.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true })); assert.ok(p.isOpen); p.input.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true })); assert.equal(p.active, 1); p.close(); off();
});
await t('ui-search: local data, keyboard select, clear, async source states', async () => {
  const c = mount('<ui-search autocomplete debounce="0" placeholder="Find"></ui-search>'); const s = c.firstChild; s.data = ['Apple', 'Apricot', 'Banana', { label: 'Blueberry', description: 'fruit' }];
  let sel, cleared = 0; s.addEventListener('ui-select', (e) => (sel = e.detail.value)); s.addEventListener('ui-clear', () => cleared++);
  s.input.value = 'ap'; s.input.dispatchEvent(new w.Event('input')); await tick(10); assert.equal(s.listEl.querySelectorAll('.ui-option').length, 2); assert.equal(s.input.getAttribute('aria-expanded'), 'true');
  s.input.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true })); s.input.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Enter', bubbles: true })); assert.equal(sel, 'Apricot');
  s.clearBtn.click(); assert.equal(s.value, ''); assert.equal(cleared, 1);
  s.input.value = 'zz'; s.input.dispatchEvent(new w.Event('input')); await tick(10); assert.ok(s.listEl.textContent.includes('No matches'));
  s.source = (q) => new Promise((r) => setTimeout(() => r([{ label: 'Remote ' + q }]), 20)); s.renderItem = (it) => { const n = d.createElement('b'); n.textContent = '★ ' + it.label; return n; };
  s.input.value = 'r'; s.input.dispatchEvent(new w.Event('input')); await tick(5); assert.ok(s.listEl.querySelector('.ui-spinner')); await tick(40); assert.equal(s.listEl.querySelector('.ui-option b').textContent, '★ Remote r');
  s.input.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); assert.equal(s.input.getAttribute('aria-expanded'), 'false');
});
await t('ui-sidebar: nested items, collapse, active, keyboard', () => {
  const c = mount('<ui-sidebar id="sb" heading="App" collapsible><ui-sidebar-item icon="home" href="#h" active>Home</ui-sidebar-item><ui-sidebar-item icon="folder">Projects<ui-sidebar-item href="#a">Alpha</ui-sidebar-item><ui-sidebar-item href="#b">Beta</ui-sidebar-item></ui-sidebar-item></ui-sidebar>');
  const sb = c.firstChild; const grp = sb.querySelector('button.ui-side-link'); assert.equal(grp.getAttribute('aria-expanded'), 'false'); grp.click(); assert.equal(grp.getAttribute('aria-expanded'), 'true');
  let sel; sb.addEventListener('ui-select', (e) => { sel = e.detail.href; e.preventDefault(); }); sb.querySelector('a[href="#b"]').click(); assert.equal(sel, '#b'); assert.ok(sb.querySelector('ui-sidebar-item[href="#b"]').hasAttribute('active')); assert.ok(!sb.querySelector('ui-sidebar-item[href="#h"]').hasAttribute('active'));
  sb.toggle(); assert.ok(sb.collapsed); assert.equal(sb.querySelector('a.ui-side-link').getAttribute('title'), 'Home'); sb.toggle(); assert.ok(!sb.collapsed);
  const link = sb.querySelector('a[href="#h"]'); link.focus(); sb.nav.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true })); assert.equal(d.activeElement, grp);
  d.body.insertAdjacentHTML('beforeend', '<button data-ui-toggle="#sb" id="tg">t</button>'); d.getElementById('tg').click(); assert.ok(sb.collapsed);
});
await t('theme helper', () => { E.theme.set('light'); assert.equal(d.documentElement.getAttribute('data-ui-theme'), 'light'); E.theme.toggle(); assert.equal(E.theme.get(), 'dark'); });
await t('no console errors or warnings during run', () => assert.deepEqual(errors, []));
console.log(`\n${passed} passed`);
