// Loads the real showcase page (index.html + dist + showcase.js) and checks that every demo renders and nothing throws.
import { JSDOM, VirtualConsole } from 'jsdom';
import assert from 'node:assert/strict';
const errs = []; const vc = new VirtualConsole(); vc.on('jsdomError', (e) => { if (!/stylesheet|fonts\.g|Could not load link/i.test(e.message)) errs.push(e.message); }); vc.on('error', (e) => errs.push(String(e))); vc.on('warn', (e) => errs.push(String(e)));
const dom = await JSDOM.fromFile('index.html', { runScripts: 'dangerously', resources: 'usable', pretendToBeVisual: true, virtualConsole: vc, beforeParse(w) { w.Element.prototype.scrollIntoView = () => {}; w.fetch = async () => ({ ok: false }); w.navigator.clipboard = { writeText: async () => {} }; } });
await new Promise((r) => dom.window.addEventListener('load', r)); await new Promise((r) => setTimeout(r, 300));
const d = dom.window.document;
const demos = [...d.querySelectorAll('.demo')];
assert.ok(demos.length >= 25, `demos: ${demos.length}`);
assert.equal(d.querySelectorAll('.demo template').length, 0, 'every demo template was rendered');
assert.ok([...d.querySelectorAll('.demo-code pre')].every((p) => p.textContent.trim().length > 10), 'code panels populated');
for (const s of ['type', 'buttons', 'inputs', 'navigation', 'feedback', 'containers', 'advanced', 'effects']) assert.ok(d.getElementById(s), s);
const missing = [...d.querySelectorAll('ui-icon')].filter((i) => !i.querySelector('svg')).map((i) => i.getAttribute('name'));
assert.deepEqual(missing, [], 'all icons render from the bundle: ' + missing);
assert.ok(d.querySelector('#search-local').data.length > 10); assert.ok(d.getElementById('actions-menu').panel);
d.querySelector('ui-command-palette').open(); assert.ok(d.querySelectorAll('.ui-command .ui-option').length >= 11, 'palette lists commands');
assert.deepEqual(errs, [], 'console clean');
console.log(`showcase OK — ${demos.length} demos, ${d.querySelectorAll('ui-icon svg').length} icons rendered`);
process.exit(0);
