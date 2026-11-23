// Smoke tests: load the *built* production bundle in jsdom and exercise every component.
import { JSDOM } from 'jsdom';
import { readFileSync, readdirSync } from 'node:fs';
import assert from 'node:assert/strict';

const dom = new JSDOM('<!doctype html><html data-ui-theme="dark"><body></body></html>', { runScripts: 'outside-only', pretendToBeVisual: true, url: 'http://localhost/' });
const w = dom.window; const errors = [];
w.console.error = (...a) => errors.push(a.join(' ')); w.console.warn = (...a) => errors.push(a.join(' '));
w.Element.prototype.scrollIntoView = () => {}; // jsdom lacks it
w.fetch = async () => ({ ok: false });
w.eval(readFileSync('dist/omorphia.min.js', 'utf8'));
const E = w.Omorphia, d = w.document; const tick = (ms = 0) => new Promise((r) => setTimeout(r, ms));
let passed = 0; const t = async (name, fn) => { await fn(); passed++; console.log('  ✓', name); };
const mount = (html) => { const c = d.createElement('div'); c.innerHTML = html; d.body.append(c); return c; };

await t('exports Omorphia API', () => { assert.ok(E.version); for (const k of ['toast', 'confirm', 'commands', 'icons', 'theme', 'config', 'UIInput', 'UITextarea', 'UICheckbox', 'UIRadio', 'UISwitch', 'UIRange', 'UIOption', 'UISelect', 'UIDatePicker', 'UITimePicker', 'UIDrawer', 'UIAccordion', 'UIAccordionItem', 'UIMenuItem']) assert.ok(E[k], k); });
await t('registers every custom element once', () => { for (const n of ['ui-button', 'ui-icon', 'ui-tooltip', 'ui-modal', 'ui-popover', 'ui-dropdown', 'ui-tabs', 'ui-tab', 'ui-pagination', 'ui-command-palette', 'ui-command', 'ui-search', 'ui-sidebar', 'ui-sidebar-item', 'ui-input', 'ui-textarea', 'ui-checkbox', 'ui-radio', 'ui-switch', 'ui-range', 'ui-option', 'ui-select', 'ui-date-picker', 'ui-time-picker', 'ui-drawer', 'ui-accordion', 'ui-accordion-item', 'ui-menu-item']) assert.ok(w.customElements.get(n), n); });
await t('Modernimal neutral theme and opaque overlay defaults', () => {
  const css = readFileSync('dist/omorphia.css', 'utf8');
  assert.match(css, /--ui-bg:\s*#0a0a0a/);
  assert.match(css, /--ui-text:\s*#f5f5f5/);
  assert.match(css, /--ui-overlay:\s*#0a0a0a/);
  assert.match(css, /background:\s*#0a0a0a/);
  assert.doesNotMatch(css, /#6ee7c8|#0f8f74/);
});
await t('picker showcase is transparent and control edges are restrained', () => {
  const advanced = readFileSync('src/css/advanced.css', 'utf8');
  const forms = readFileSync('src/css/forms.css', 'utf8');
  const showcase = readFileSync('showcase/showcase.css', 'utf8');
  const tokens = readFileSync('src/css/tokens.css', 'utf8');
  assert.match(forms, /\.ui-time-input-frame/);
  assert.match(advanced, /ui-time-picker\{display:inline-flex/);
  assert.match(showcase, /\.picker-demo-frame\s*\{[^}]*background:\s*transparent/);
  assert.match(tokens, /--ui-control-border:rgb\(245 245 245 \/ \.12\)/);
  assert.match(tokens, /--ui-edge-tl-alpha:\.36/);
});
await t('command palette has no exterior border', () => {
  const advanced = readFileSync('src/css/advanced.css', 'utf8');
  const start = advanced.indexOf('.ui-command{');
  const rule = advanced.slice(start, advanced.indexOf('}', start));
  assert.ok(start >= 0 && rule.includes('border:0'), 'command palette has no outer border');
});
await t('showcase code blocks follow the active theme', () => {
  const css = readFileSync('showcase/showcase.css', 'utf8');
  for (const selector of ['.demo-code pre {', '.fx-code {']) {
    const start = css.indexOf(selector);
    const rule = css.slice(start, css.indexOf('}', start));
    assert.ok(start >= 0 && rule.includes('background: var(--ui-bg-inset)'), selector + ' uses the active theme surface');
    assert.ok(rule.includes('color: var(--ui-text)'), selector + ' uses the active theme text');
  }
});
await t('decorative perimeter outlines are omitted', () => {
  const edge = readFileSync('src/css/edge.css', 'utf8');
  for (const selector of ['.ui-alert', '.ui-badge', '.ui-card', '.ui-avatar', '.ui-sidebar-panel', '.ui-tabs-list', '.ui-page-btn', '.ui-collapsible', '.ui-progress']) {
    assert.equal(edge.includes(selector), false, selector);
  }
  const containers = readFileSync('src/css/containers.css', 'utf8');
  assert.match(containers, /\.ui-card\{[^}]*border:0;border-radius:0/);
  assert.match(containers, /\.ui-avatar\{[^}]*border-radius:4px/);
  const sidebar = readFileSync('src/js/components/sidebar.js', 'utf8');
  assert.match(sidebar, /class: 'ui-sidebar-panel'/);
  assert.doesNotMatch(sidebar, /ui-sidebar-panel ui-edge/);
  const advanced = readFileSync('src/css/advanced.css', 'utf8');
  assert.match(advanced, /\.ui-sidebar-panel\{[^}]*border:0/);
  assert.doesNotMatch(advanced, /ui-sidebar-panel::before/);
  const forms = readFileSync('src/css/forms.css', 'utf8');
  assert.match(forms, /\.ui-textarea\s*\{\s*border-radius:\s*0/);
  assert.match(forms, /\.ui-textarea-frame\{[^}]*border-radius:0/);
  assert.match(forms, /ui-switch \.ui-choice-control\{[^}]*width:38px;min-width:38px/);
  assert.match(forms, /\.ui-choice-label\{[^}]*min-width:0/);
  const floatingRules = readFileSync('src/css/containers.css', 'utf8');
  assert.match(floatingRules, /\.ui-float\{position:fixed;margin:0\}/);
  assert.match(floatingRules, /\.ui-float\[data-open\]\{display:block;pointer-events:auto\}/);
  const base = readFileSync('src/css/base.css', 'utf8');
  const buttons = readFileSync('src/css/button.css', 'utf8');
  assert.match(base, /\.ui-summary:focus-visible\s*\{[^}]*outline:\s*none/);
  assert.match(buttons, /\.ui-btn:focus-visible\{outline:none/);
  assert.doesNotMatch(base, /\.ui-summary\):focus-visible/);
});
await t('README surfaces the quick AI prompt and keeps its structure valid', () => {
  const readme = readFileSync('README.md', 'utf8');
  const promptStart = readme.indexOf('id="quick-copy-ai-prompt"');
  const overviewStart = readme.indexOf('id="overview"');
  assert.ok(readme.startsWith('<div align="center">'), 'README keeps its current centered masthead');
  assert.ok(promptStart > 0 && promptStart < overviewStart, 'quick-copy prompt appears before the overview');
  const prompt = readme.slice(promptStart, overviewStart);
  assert.ok(prompt.includes('AGENTS.md'), 'quick prompt links to mandatory repository instructions');
  assert.ok(prompt.includes('https://github.com/aabhro/Omorphia'), 'quick prompt links directly to the Omorphia repository');
  assert.ok(prompt.includes('AI/AGENT-PROMPT.md'), 'quick prompt links to the full agent prompt');
  assert.ok(prompt.includes('Modernimal Stylesheet'), 'quick prompt references the selected design system');
  assert.ok(prompt.includes('Components/Modernimal.html'), 'quick prompt references the component library');
  assert.ok(prompt.includes('motion/SKILL.md') && prompt.includes('motion/catalog.md'), 'quick prompt references the motion system');
  assert.ok(prompt.includes('~~~text') && prompt.includes('~~~'), 'quick prompt has a copyable text block');
  assert.doesNotMatch(readme, /<details\s+open/i);
  let depth = 0;
  for (const line of readme.split(String.fromCharCode(10))) {
    if (line.trim() === '<details>') depth++;
    if (line.startsWith('~~~')) {
      const inQuickPrompt = readme.indexOf(line) >= promptStart && readme.indexOf(line) < overviewStart;
      assert.ok(depth > 0 || inQuickPrompt, 'fenced examples are inside a collapsed detail or the quick-copy prompt');
    }
    if (line.trim() === '</details>') {
      depth--;
      assert.ok(depth >= 0, 'details sections close in order');
    }
  }
  assert.equal(depth, 0, 'all collapsible README sections are closed');
});
await t('AI component catalog matches registered elements and every agent entry point', () => {
  const catalog = readFileSync('AI/COMPONENT-CATALOG.md', 'utf8');
  const componentFiles = readdirSync('src/js/components')
    .filter((file) => file.endsWith('.js'))
    .map((file) => 'src/js/components/' + file)
    .concat('src/js/icons.js');
  const registered = new Set();
  for (const file of componentFiles) {
    const source = readFileSync(file, 'utf8');
    for (const match of source.matchAll(/define\(['"]([^'"]+)['"]/g)) registered.add(match[1]);
  }
  const inventoryStart = catalog.indexOf('## 2. Actual custom elements');
  const inventoryEnd = catalog.indexOf('### ', inventoryStart + 10);
  assert.ok(inventoryStart >= 0 && inventoryEnd > inventoryStart, 'catalog has a bounded custom-element inventory');
  const inventory = catalog.slice(inventoryStart, inventoryEnd);
  const documented = new Set([...inventory.matchAll(/&lt;(ui-[a-z-]+)&gt;/g)].map((match) => match[1]));
  assert.deepEqual([...documented].sort(), [...registered].sort(), 'catalog lists exactly the elements registered by source');
  assert.equal(registered.size, 28, 'expected current Omorphia custom-element count');
  for (const falseTag of ['ui-card', 'ui-alert', 'ui-badge', 'ui-avatar', 'ui-progress', 'ui-skeleton', 'ui-collapsible']) {
    assert.ok(catalog.includes('<code>&lt;' + falseTag + '&gt;</code>'), falseTag + ' is explicitly identified as a non-element');
  }
  for (const file of [
    'AGENTS.md',
    'AI/AGENT-PROMPT.md',
    'README.md',
    'CLAUDE.md',
    '.github/copilot-instructions.md',
    '.cursor/rules/omorphia.mdc'
  ]) {
    const instructions = readFileSync(file, 'utf8');
    assert.ok(instructions.includes('AI/COMPONENT-CATALOG.md') || instructions.includes('COMPONENT-CATALOG.md'), file + ' links the component catalog');
  }
  const readme = readFileSync('README.md', 'utf8');
  const promptStart = readme.indexOf('~~~text');
  const promptEnd = readme.indexOf('~~~', promptStart + 7);
  const quickPrompt = readme.slice(promptStart, promptEnd);
  assert.ok(quickPrompt.includes('AI/COMPONENT-CATALOG.md'), 'copyable prompt requires the component catalog');
  assert.match(quickPrompt, /COMPONENT-FIRST RULE/);
  assert.match(quickPrompt, /Do not guess/);
  assert.match(catalog, /Component reuse audit/);
});
await t('custom text fields preserve typed input and programmatic values', () => {
  const c = mount('<ui-input id="field-title" name="title" value="Atlas" label="Project title"></ui-input><ui-textarea id="field-notes" name="notes" value="First draft" label="Notes" maxlength="30"></ui-textarea>');
  const input = c.querySelector('ui-input');
  const textarea = c.querySelector('ui-textarea');
  assert.equal(input.value, 'Atlas');
  assert.equal(input.input.getAttribute('aria-label'), 'Project title');
  let typed;
  input.addEventListener('ui-input', (event) => { typed = event.detail.value; });
  input.input.value = 'Atlas v2';
  input.input.dispatchEvent(new w.Event('input', { bubbles: true }));
  assert.equal(input.value, 'Atlas v2', 'typing must not be reset to the initial value attribute');
  assert.equal(typed, 'Atlas v2');
  input.value = 'Updated in code';
  assert.equal(input.value, 'Updated in code');
  textarea.textarea.value = 'Notes updated';
  textarea.textarea.dispatchEvent(new w.Event('input', { bubbles: true }));
  assert.equal(textarea.value, 'Notes updated', 'textarea typing must not be reset');
  textarea.value = 'Programmatic note';
  assert.equal(textarea.value, 'Programmatic note');
  assert.equal(textarea.count.hidden, false);
});
await t('custom checkbox, radio, and switch controls keep accessible and form state', () => {
  const c = mount('<form><ui-checkbox name="updates" value="deploys" label="Deploy updates" checked></ui-checkbox><ui-radio name="plan" value="starter" label="Starter" checked></ui-radio><ui-radio name="plan" value="team" label="Team"></ui-radio><ui-switch name="auto" value="yes" label="Auto deploy"></ui-switch></form>');
  const checkbox = c.querySelector('ui-checkbox');
  const radios = c.querySelectorAll('ui-radio');
  const toggle = c.querySelector('ui-switch');
  assert.equal(checkbox.control.getAttribute('role'), 'checkbox');
  assert.equal(checkbox.formValue.name, 'updates');
  checkbox.control.click();
  assert.equal(checkbox.checked, false);
  assert.equal(checkbox.formValue.name, '');
  radios[1].toggle();
  assert.equal(radios[0].checked, false);
  assert.equal(radios[1].checked, true);
  assert.equal(radios[1].formValue.name, 'plan');
  radios[0].control.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true }));
  assert.equal(radios[1].checked, true);
  toggle.control.click();
  assert.equal(toggle.checked, true);
  toggle.querySelector('.ui-choice-label').click();
  assert.equal(toggle.checked, false, 'the visible switch label activates the control');
  toggle.checked = true;
  assert.equal(toggle.control.getAttribute('aria-checked'), 'true');
  assert.equal(toggle.formValue.name, 'auto');
  assert.equal(toggle.control.getAttribute('role'), 'switch');
  radios[0].checked = true;
  assert.equal(radios[0].checked, true, 'programmatic radio selection is reflected');
  assert.equal(radios[1].checked, false, 'radio groups remain exclusive when checked is set directly');
});
await t('custom range supports keyboard input, bounds, and form values', () => {
  const c = mount('<ui-range name="volume" min="0" max="10" step="2" value="4" label="Volume"></ui-range>');
  const range = c.firstChild;
  assert.equal(range.value, 4);
  assert.equal(range.hiddenValue.name, 'volume');
  range.track.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true }));
  assert.equal(range.value, 6);
  range.track.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'End', bubbles: true, cancelable: true }));
  assert.equal(range.value, 10);
  range.track.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true, cancelable: true }));
  assert.equal(range.value, 10, 'range value is clamped to its maximum');
});
await t('custom select supports single, searchable, and multiple selection', () => {
  const c = mount('<ui-select id="region" name="region" value="sin" searchable placeholder="Choose region"><ui-option value="fra" description="Europe">Frankfurt</ui-option><ui-option value="iad">Virginia</ui-option><ui-option value="sin">Singapore</ui-option></ui-select><ui-select id="topics" name="topics" multiple value="a,b"><ui-option value="a">Alpha</ui-option><ui-option value="b">Beta</ui-option><ui-option value="c">Gamma</ui-option></ui-select>');
  const single = c.querySelector('#region'), multi = c.querySelector('#topics');
  assert.equal(single.value, 'sin');
  assert.equal(single.selectedOptions[0].label, 'Singapore');
  assert.equal(single.formFields.querySelector('input').name, 'region');
  let selected;
  single.addEventListener('ui-change', (event) => { selected = event.detail.value; });
  single.choose(single.options[0]);
  assert.equal(single.value, 'fra');
  assert.equal(selected, 'fra');
  multi.choose(multi.options[2]);
  assert.deepEqual(Array.from(multi.value), ['a', 'b', 'c']);
  assert.equal(multi.formFields.querySelectorAll('input').length, 3);
  single.popoverElement.show();
  assert.equal(single.popoverElement.open, true);
  single.popoverElement.hide();
});
await t('custom date picker handles calendar selection, limits, and hidden form value', () => {
  const c = mount('<ui-date-picker id="date" name="release" value="2026-11-20" min="2026-11-10" max="2026-11-30"></ui-date-picker>');
  const picker = c.firstChild;
  assert.equal(picker.value, '2026-11-20');
  assert.equal(picker.hiddenValue.name, 'release');
  assert.equal(picker.days.querySelector('[data-date="2026-11-05"]').disabled, true);
  assert.equal(picker.days.querySelector('[data-date="2026-12-01"]').disabled, true);
  let changed;
  picker.addEventListener('ui-change', (event) => { changed = event.detail.value; });
  picker.days.querySelector('[data-date="2026-11-21"]').click();
  assert.equal(picker.value, '2026-11-21');
  assert.equal(changed, '2026-11-21');
  assert.equal(picker.hiddenValue.value, '2026-11-21');
  picker.show();
  assert.equal(picker.open, true, 'date picker opens through its shared popover');
  assert.equal(picker.popoverElement.panel.hasAttribute('data-open'), true);
  picker.hide();
  assert.equal(picker.open, false);
});
await t('floating surfaces share a clipped-layer escape hatch and stack by open order', () => {
  const c = mount('<ui-popover id="first"><button slot="trigger">First</button><p>First panel</p></ui-popover><ui-popover id="second"><button slot="trigger">Second</button><p>Second panel</p></ui-popover>');
  const first = c.querySelector('#first'), second = c.querySelector('#second');
  first.show();
  second.show();
  assert.equal(first.open, true);
  assert.equal(second.open, true);
  assert.ok(first.panel.isConnected && second.panel.isConnected);
  for (const panel of [first.panel, second.panel]) {
    assert.equal(panel.style.right, 'auto', 'the right inset is cleared');
    assert.equal(panel.style.bottom, 'auto', 'the bottom inset is cleared');
    assert.ok(panel.style.left.endsWith('px') && panel.style.top.endsWith('px'), 'panel is placed with explicit viewport coordinates');
  }
  if (first._uiFloatMode === 'portal' && second._uiFloatMode === 'portal') {
    assert.equal(first.panel.parentElement, d.querySelector('[data-ui-floating-layer]'));
    assert.equal(second.panel.parentElement, d.querySelector('[data-ui-floating-layer]'));
    assert.ok(Number(second.panel.style.zIndex) > Number(first.panel.style.zIndex), 'the newest fallback surface is stacked above older surfaces');
  }
  second.hide();
  first.hide();
});

await t('custom time picker supports 12-hour mode and hidden form value', () => {
  const c = mount('<ui-time-picker id="time" name="time" value="14:30" format="12h" step="5"></ui-time-picker>');
  const picker = c.firstChild;
  assert.equal(picker.value, '14:30');
  assert.equal(picker.input.value, '2:30 PM');
  assert.equal(picker.hiddenValue.name, 'time');
  picker.minuteList.querySelector('[data-minute="35"]').click();
  assert.equal(picker.value, '14:35');
  picker.period.click();
  assert.equal(picker.value, '02:35');
  assert.equal(picker.input.value, '2:35 AM');
  assert.equal(picker.hiddenValue.value, '02:35');
  picker.value = '09:10';
  assert.equal(picker.value, '09:10', 'programmatic time updates sync the display and submitted value');
  assert.equal(picker.input.value, '9:10 AM');
  picker.input.value = '3:45 PM';
  picker.input.dispatchEvent(new w.Event('input', { bubbles: true }));
  assert.equal(picker.value, '15:45', 'typing updates the normalized value without replacing the in-progress text');
  assert.equal(picker.input.value, '3:45 PM', 'the editable text remains intact while typing');
  picker.input.dispatchEvent(new w.Event('change', { bubbles: true }));
  assert.equal(picker.value, '15:45');
  assert.equal(picker.hiddenValue.value, '15:45');
  picker.input.value = '25:90';
  picker.input.dispatchEvent(new w.Event('input', { bubbles: true }));
  assert.equal(picker.input.getAttribute('aria-invalid'), 'true');
  picker.input.dispatchEvent(new w.Event('change', { bubbles: true }));
  assert.equal(picker.input.value, '3:45 PM', 'invalid text restores the last valid time on commit');
  picker.show();
  assert.equal(picker.open, true, 'time picker opens through its shared popover');
  assert.equal(picker.popoverElement.panel.hasAttribute('data-open'), true);
  picker.hide();
  assert.equal(picker.open, false);
});
await t('custom accordion supports exclusive and multiple panels with keyboard navigation', () => {
  const c = mount('<ui-accordion><ui-accordion-item heading="One" value="one" open>First panel</ui-accordion-item><ui-accordion-item heading="Two" value="two">Second panel</ui-accordion-item></ui-accordion><ui-accordion multiple><ui-accordion-item heading="Alpha">A</ui-accordion-item><ui-accordion-item heading="Beta">B</ui-accordion-item></ui-accordion>');
  const exclusive = c.querySelector('ui-accordion');
  const [one, two] = exclusive.items;
  assert.equal(one.open, true);
  two.trigger.click();
  assert.equal(one.open, false);
  assert.equal(two.open, true);
  assert.equal(two.panel.getAttribute('aria-hidden'), 'false');
  one.trigger.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'End', bubbles: true, cancelable: true }));
  assert.equal(d.activeElement, two.trigger);
  const multiple = c.querySelector('ui-accordion[multiple]');
  multiple.items[0].show();
  multiple.items[1].show();
  assert.equal(multiple.items.filter((item) => item.open).length, 2);
});
await t('custom drawer opens, traps focus, and closes after its exit motion', async () => {
  const c = mount('<button id="drawer-origin">Open</button><ui-drawer heading="Settings"><ui-input name="title" label="Title"></ui-input><div slot="footer"><ui-button>Save</ui-button></div></ui-drawer>');
  const drawer = c.querySelector('ui-drawer');
  assert.equal(drawer.hidden, true);
  drawer.show();
  assert.equal(drawer.open, true);
  assert.equal(d.body.style.overflow, 'hidden');
  drawer.close('test');
  assert.equal(drawer.dataset.state, 'closing');
  await tick(260);
  assert.equal(drawer.hidden, true);
  assert.equal(d.body.style.overflow, '');
});
await t('dropdown uses custom menu items and preserves the selected value', () => {
  const c = mount('<ui-dropdown><ui-button slot="trigger">Actions</ui-button><ui-menu-item value="archive" label="Archive" icon="folder"></ui-menu-item><ui-menu-item value="delete" label="Delete" destructive></ui-menu-item></ui-dropdown>');
  const dropdown = c.firstChild;
  assert.equal(dropdown.items.length, 2);
  let selected;
  dropdown.addEventListener('ui-select', (event) => { selected = event.detail.value; });
  dropdown.show();
  assert.equal(dropdown.open, true);
  dropdown.items[0].click();
  assert.equal(selected, 'archive');
  assert.equal(dropdown.open, false);
});
await t('floating morph and overlay surfaces avoid visible borders', () => {
  const advanced = readFileSync('src/css/advanced.css', 'utf8');
  const nav = readFileSync('src/css/nav.css', 'utf8');
  const containers = readFileSync('src/css/containers.css', 'utf8');
  const feedback = readFileSync('src/css/feedback.css', 'utf8');
  assert.match(advanced, /\.ui-search-panel\{[^}]*border:0/);
  assert.match(nav, /\.ui-menu\{[^}]*border:0/);
  assert.match(containers, /\.ui-modal-panel\{[^}]*border:0/);
  assert.match(containers, /\.ui-popover-panel\{[^}]*border:0/);
  assert.match(feedback, /\.ui-tooltip-bubble\{[^}]*border:0/);
  assert.match(feedback, /\.ui-toast\{[^}]*border:0/);
  assert.match(containers, /grid-template-rows:0fr/);
  assert.match(containers, /prefers-reduced-motion:reduce/);
  assert.match(readFileSync('src/js/core.js', 'utf8'), /function morphSurface/);
  assert.match(readFileSync('src/js/components/popover.js', 'utf8'), /morphSurface\(this\.trigger/);
});

await t('directional border illumination remains part of the build', () => {
  const css = readFileSync('src/css/edge.css', 'utf8');
  assert.match(css, /--ui-edge-tl-alpha/);
  assert.match(css, /--ui-edge-br-alpha/);
  assert.match(css, /max-resolution:\s*1\.25dppx/);
  assert.match(css, /radial-gradient\(115% 145% at 0% 0%/, 'primary spotlight stays at the top-left corner');
  assert.match(css, /radial-gradient\(120% 150% at 100% 100%/, 'secondary spotlight stays dimmer at the bottom-right corner');
  assert.match(css, /-webkit-mask-composite:\s*xor/);
  assert.match(css, /radial-gradient\(115% 145% at 0% 0%/, 'spotlight illumination stays concentrated at the leading corner');
  const tokens = readFileSync('src/css/tokens.css', 'utf8');
  assert.match(tokens, /--ui-edge-base-alpha:0;/, 'the uniform outline wash stays disabled');
});
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
  assert.equal(p.dialog.parentElement, d.body, 'native dialog is portalled outside the hidden custom-element host');
  assert.equal(p.contains(p.dialog), false, 'the hidden host does not contain the visible dialog');
  p.open(); assert.ok(p.isOpen); assert.ok(d.querySelector('.ui-empty-title').textContent.includes('No commands yet')); p.close();
  const focused = d.createElement('input'); d.body.append(focused);
  focused.addEventListener('keydown', (e) => e.stopPropagation());
  const reserved = new w.KeyboardEvent('keydown', { key: 'k', code: 'KeyK', ctrlKey: true, bubbles: true, cancelable: true });
  focused.dispatchEvent(reserved);
  assert.ok(!p.isOpen, 'Chrome-reserved Ctrl+K is not used as the default');
  assert.equal(reserved.defaultPrevented, false, 'the library leaves browser-reserved Ctrl+K alone');
  const shortcut = new w.KeyboardEvent('keydown', { key: 'k', code: 'KeyK', ctrlKey: true, shiftKey: true, bubbles: true, cancelable: true });
  focused.dispatchEvent(shortcut);
  assert.ok(p.isOpen, 'Ctrl+Shift+K works while focus is inside a control');
  assert.ok(shortcut.defaultPrevented, 'the library prevents the matched shortcut default');
  p.close(); focused.remove();
  let ran = 0; const off = E.commands.register([{ id: 'a', label: 'Create project', group: 'Actions', onSelect: () => ran++ }, { id: 'b', label: 'Open settings', group: 'Go to', icon: 'settings', href: '#x' }]);
  d.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'k', code: 'KeyK', ctrlKey: true, shiftKey: true, bubbles: true })); assert.ok(p.isOpen); assert.equal(p.list.querySelectorAll('.ui-option').length, 2);
  p.input.value = 'proj'; p.input.dispatchEvent(new w.Event('input')); assert.equal(p.list.querySelectorAll('.ui-option').length, 1); assert.equal(p.list.querySelector('mark').textContent, 'proj');
  p.input.value = 'zzzz'; p.input.dispatchEvent(new w.Event('input')); assert.ok(p.list.textContent.includes('No results for “zzzz”'));
  p.input.value = 'cr'; p.input.dispatchEvent(new w.Event('input')); p.input.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Enter', bubbles: true })); assert.equal(ran, 1); assert.ok(!p.isOpen);
  p.setAttribute('hotkey', 'meta+k'); d.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true })); assert.ok(p.isOpen); p.removeAttribute('hotkey'); p.input.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true })); assert.equal(p.active, 1); p.close(); off();
});
await t('command palette shortcut parsing, routing, and lifecycle', () => {
  const host = mount('<ui-command-palette id="first" hotkey="mod+shift+k"></ui-command-palette><ui-command-palette id="second" hotkey="ctrl+shift+p"></ui-command-palette><ui-command-palette id="disabled" hotkey="none"></ui-command-palette>');
  const [first, second, disabled] = host.children;
  const press = (target, init) => {
    const event = new w.KeyboardEvent('keydown', { bubbles: true, cancelable: true, ...init });
    target.dispatchEvent(event);
    return event;
  };

  const reserved = press(d, { key: 'k', code: 'KeyK', ctrlKey: true });
  assert.ok(!first.isOpen && !second.isOpen && !disabled.isOpen, 'Chrome-reserved Ctrl+K is not bound by default');
  assert.equal(reserved.defaultPrevented, false, 'reserved browser shortcut is left untouched');
  const ctrlK = press(d, { key: 'k', code: 'KeyK', ctrlKey: true, shiftKey: true });
  assert.ok(first.isOpen, 'mod+k opens the first matching palette');
  assert.ok(!second.isOpen && !disabled.isOpen, 'one shortcut press opens only one palette');
  assert.ok(ctrlK.defaultPrevented, 'matched shortcuts prevent browser defaults');

  const repeat = press(d, { key: 'k', code: 'KeyK', ctrlKey: true, repeat: true });
  assert.ok(first.isOpen, 'auto-repeat does not toggle the palette closed');
  assert.equal(repeat.defaultPrevented, false, 'auto-repeat is left untouched');

  first.close();
  press(d, { key: 'p', code: 'KeyP', ctrlKey: true, shiftKey: true });
  assert.ok(second.isOpen, 'custom ctrl+shift+p combinations are supported');
  second.close();

  const composing = press(d, { key: 'k', code: 'KeyK', ctrlKey: true, shiftKey: true, isComposing: true });
  assert.ok(!first.isOpen && !second.isOpen, 'IME composition is not treated as a shortcut');
  assert.equal(composing.defaultPrevented, false, 'composition events are left untouched');

  const legacy = new w.KeyboardEvent('keydown', { key: 'Unidentified', keyCode: 75, ctrlKey: true, shiftKey: true });
  assert.equal(first.matches_hotkey(legacy), true, 'legacy keyCode fallback works when key/code are unavailable');

  host.remove();
  const after = mount('<ui-command-palette></ui-command-palette>').firstChild;
  press(d, { key: 'k', code: 'KeyK', ctrlKey: true, shiftKey: true });
  assert.ok(after.isOpen, 'shortcut listener is restored after all palettes disconnect');
  after.remove();
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
await t('checkbox and radio choices respond to pointer activation and maintain group state', () => {
  const c = mount('<ui-checkbox id="choice-email" name="updates" value="deploys" label="Email me about deploys"></ui-checkbox><ui-checkbox id="choice-weekly" name="updates" value="weekly" label="Weekly summary"></ui-checkbox><ui-radio id="choice-starter" name="plan" value="starter" label="Starter" checked></ui-radio><ui-radio id="choice-team" name="plan" value="team" label="Team"></ui-radio>');
  const email = c.querySelector('#choice-email'), weekly = c.querySelector('#choice-weekly');
  const starter = c.querySelector('#choice-starter'), team = c.querySelector('#choice-team');
  email.control.click(); assert.equal(email.checked, true); assert.equal(email.formValue.name, 'updates');
  weekly.text.click(); assert.equal(weekly.checked, true); assert.equal(email.checked, true);
  team.control.click(); assert.equal(team.checked, true); assert.equal(starter.checked, false);
  assert.equal(team.formValue.name, 'plan'); assert.equal(starter.formValue.name, '');
  starter.text.click(); assert.equal(starter.checked, true); assert.equal(team.checked, false);
});
await t('theme helper', () => { E.theme.set('light'); assert.equal(d.documentElement.getAttribute('data-ui-theme'), 'light'); E.theme.toggle(); assert.equal(E.theme.get(), 'dark'); });
await t('native popovers are portalled before entering the top layer', () => {
  const proto = w.HTMLElement.prototype;
  const originalPopover = Object.getOwnPropertyDescriptor(proto, 'popover');
  const originalShow = proto.showPopover;
  const originalHide = proto.hidePopover;
  const originalMatches = w.Element.prototype.matches;
  try {
    Object.defineProperty(proto, 'popover', { configurable: true, get() { return this.getAttribute('popover'); }, set(value) { this.setAttribute('popover', value); } });
    proto.showPopover = function () { this.setAttribute('data-native-popover-open', ''); };
    proto.hidePopover = function () { this.removeAttribute('data-native-popover-open'); };
    w.Element.prototype.matches = function (selector) {
      if (selector === ':popover-open') return this.hasAttribute('data-native-popover-open');
      return originalMatches.call(this, selector);
    };
    const controls = mount('<ui-select id="native-region" name="region" value="fra"><ui-option value="fra">Frankfurt</ui-option></ui-select><ui-date-picker id="native-date" name="date" value="2026-11-20"></ui-date-picker><ui-time-picker id="native-time" name="time" value="14:30"></ui-time-picker>');
    const region = controls.querySelector('#native-region'), date = controls.querySelector('#native-date'), time = controls.querySelector('#native-time');
    for (const [host, selector] of [[region, '.ui-select-trigger'], [date, '.ui-date-trigger'], [time, '.ui-time-trigger']]) {
      assert.ok(host.querySelector(selector), selector + ' renders when HTMLElement.popover is native');
      assert.equal(host.getAttribute('popover'), null, 'the host native popover attribute is not overwritten');
      assert.equal(host.popoverElement.localName, 'ui-popover', 'the nested surface is stored in a separate field');
    }
    region.popoverElement.show();
    assert.equal(region.popoverElement.open, true);
    region.choose(region.options[0]);
    date.show();
    assert.equal(date.open, true);
    date.hide();
    time.show();
    assert.equal(time.open, true);
    time.hide();
    const c = mount('<ui-popover><button slot="trigger">Native top layer</button><p>Panel</p></ui-popover>');
    const popover = c.firstChild;
    popover.show();
    assert.equal(popover.panel._uiFloatMode, 'native-portal');
    assert.equal(popover.panel.parentElement, d.querySelector('[data-ui-floating-layer]'));
    assert.equal(popover.panel.hasAttribute('data-native-popover-open'), true);
    popover.hide();
    assert.equal(popover.panel.parentNode, popover, 'closed native surfaces return to their original DOM location');
    assert.equal(popover.panel.hasAttribute('data-native-popover-open'), false);
  } finally {
    if (originalPopover) Object.defineProperty(proto, 'popover', originalPopover);
    else delete proto.popover;
    if (originalShow) proto.showPopover = originalShow;
    else delete proto.showPopover;
    if (originalHide) proto.hidePopover = originalHide;
    else delete proto.hidePopover;
    w.Element.prototype.matches = originalMatches;
  }
});

await t('no console errors or warnings during run', () => assert.deepEqual(errors, []));
console.log(`\n${passed} passed`);
