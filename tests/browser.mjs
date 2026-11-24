import { spawn, spawnSync } from 'node:child_process';
import { createServer } from 'node:http';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { extname, join, resolve, sep } from 'node:path';
import assert from 'node:assert/strict';

const candidates = [process.env.CHROME_BIN, 'google-chrome', 'chromium', 'chromium-browser'].filter(Boolean);
const browser = candidates.find((candidate) => spawnSync(candidate, ['--version'], { stdio: 'ignore' }).status === 0);
if (!browser) throw new Error('A Chromium or Chrome binary is required. Set CHROME_BIN to its executable path.');

const profile = mkdtempSync(join(tmpdir(), 'omorphia-chrome-'));
const root = resolve(process.cwd());
const server = createServer((request, response) => {
  let pathname;
  try { pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname); }
  catch { response.writeHead(400).end('Bad request'); return; }
  const file = resolve(root, '.' + pathname);
  if (file !== root && !file.startsWith(root + sep)) { response.writeHead(403).end('Forbidden'); return; }
  if (!existsSync(file)) { response.writeHead(404).end('Not found'); return; }
  const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml' }[extname(file)] || 'application/octet-stream';
  response.writeHead(200, { 'content-type': mime, 'cache-control': 'no-store' });
  response.end(readFileSync(file));
});
await new Promise((resolvePromise) => server.listen(0, '127.0.0.1', resolvePromise));
const serverPort = server.address().port;
const pageUrl = `http://127.0.0.1:${serverPort}/tests/browser.html`;
const debugPort = 15000 + (process.pid % 10000);
const child = spawn(browser, [
  '--headless=new', '--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage',
  '--no-first-run', '--no-default-browser-check', `--remote-debugging-port=${debugPort}`, '--remote-debugging-address=127.0.0.1',
  '--remote-allow-origins=*', `--user-data-dir=${profile}`, pageUrl
], { stdio: 'ignore' });

let socket;
let sequence = 0;
const pending = new Map();
const runtimeErrors = [];
const delay = (ms) => new Promise((resolvePromise) => setTimeout(resolvePromise, ms));

try {
  let target;
  for (let i = 0; i < 200; i++) {
    const response = await fetch(`http://127.0.0.1:${debugPort}/json/list`).catch(() => null);
    const targets = response?.ok ? await response.json() : [];
    target = targets.find((entry) => entry.type === 'page');
    if (target?.webSocketDebuggerUrl) break;
    await delay(50);
  }
  assert.ok(target?.webSocketDebuggerUrl, 'Chromium exposes a DevTools page target');

  socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolvePromise, reject) => {
    socket.addEventListener('open', resolvePromise, { once: true });
    socket.addEventListener('error', reject, { once: true });
  });
  socket.addEventListener('message', (event) => {
    const message = JSON.parse(event.data);
    if (message.method === 'Runtime.exceptionThrown') runtimeErrors.push(message.params.exceptionDetails.text || 'Uncaught browser exception');
    if (message.id && pending.has(message.id)) {
      const { resolve: resolvePending, reject: rejectPending } = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) rejectPending(new Error(message.error.message));
      else resolvePending(message.result);
    }
  });

  const send = (method, params = {}) => new Promise((resolvePromise, reject) => {
    const id = ++sequence;
    pending.set(id, { resolve: resolvePromise, reject });
    socket.send(JSON.stringify({ id, method, params }));
  });
  const evaluate = async (expression) => {
    const response = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (response.exceptionDetails) {
      const details = response.exceptionDetails;
      const description = details.exception?.description || details.exception?.value || details.text || 'Browser evaluation failed';
      throw new Error(String(description));
    }
    return response.result?.value;
  };
  const waitFor = async (expression, description) => {
    for (let i = 0; i < 100; i++) {
      const value = await evaluate(expression);
      if (value) return value;
      await delay(50);
    }
    throw new Error(`Timed out: ${description}`);
  };
  const center = async (selector) => evaluate(`(() => {
    const el = document.querySelector(${JSON.stringify(selector)});
    if (!el) throw new Error('Missing element: ' + ${JSON.stringify(selector)});
    const list = el.closest?.('.ui-time-list');
    if (list) {
      const listRect = list.getBoundingClientRect(), itemRect = el.getBoundingClientRect();
      if (itemRect.top < listRect.top) list.scrollTop -= listRect.top - itemRect.top;
      else if (itemRect.bottom > listRect.bottom) list.scrollTop += itemRect.bottom - listRect.bottom;
    } else el.scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
    const rect = el.getBoundingClientRect();
    if (!rect.width || !rect.height) throw new Error('Element has no hit area: ' + ${JSON.stringify(selector)});
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  })()`);
  const click = async (selector) => {
    const point = await center(selector);
    const hit = await evaluate(`(() => {
      const el = document.elementFromPoint(${point.x}, ${point.y});
      const target = document.querySelector(${JSON.stringify(selector)});
      const rect = target?.getBoundingClientRect();
      const list = target?.closest?.('.ui-time-list'), panel = target?.closest?.('.ui-time-panel');
      const listRect = list?.getBoundingClientRect(), panelRect = panel?.getBoundingClientRect();
      return { hit: el ? { tag: el.localName, id: el.id, className: String(el.className || ''), target: Boolean(el.matches(${JSON.stringify(selector)}) || el.closest?.(${JSON.stringify(selector)})) } : null,
        point: { x: ${point.x}, y: ${point.y} }, viewport: { width: innerWidth, height: innerHeight },
        rect: rect ? { left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom, width: rect.width, height: rect.height } : null,
        list: listRect ? { left: listRect.left, top: listRect.top, right: listRect.right, bottom: listRect.bottom, height: listRect.height, scrollTop: list.scrollTop, clientHeight: list.clientHeight } : null,
        panel: panelRect ? { left: panelRect.left, top: panelRect.top, right: panelRect.right, bottom: panelRect.bottom, height: panelRect.height } : null };
    })()`);
    assert.ok(hit?.hit?.target, `Real browser hit-testing reaches ${selector}; got ${JSON.stringify(hit)}`);
    await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: point.x, y: point.y, button: 'left', clickCount: 1 });
    await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: point.x, y: point.y, button: 'left', clickCount: 1 });
    await delay(220);
  };

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Page.navigate', { url: pageUrl });
  await waitFor(`document.documentElement.dataset.browserReady === 'true' && document.querySelector('#region-test .ui-select-trigger') && document.querySelector('#date-test .ui-date-trigger') && document.querySelector('#time-test .ui-time-trigger')`, 'fixture custom elements and bundle initialize');

  await click('#choice-email .ui-choice-control');
  assert.equal(await evaluate(`document.querySelector('#choice-email').checked`), true, 'checkbox responds to pointer activation');
  assert.notEqual(await evaluate(`getComputedStyle(document.querySelector('#choice-email').indicator).backgroundColor`), 'rgba(0, 0, 0, 0)', 'checked checkbox indicator has a visible fill');
  await click('#choice-weekly .ui-choice-label');
  assert.equal(await evaluate(`document.querySelector('#choice-weekly').checked && document.querySelector('#choice-email').checked`), true, 'checkbox choices remain independent');
  await click('#choice-team .ui-choice-control');
  assert.equal(await evaluate(`document.querySelector('#choice-team').checked && !document.querySelector('#choice-starter').checked`), true, 'radio choices update their group');
  assert.notEqual(await evaluate(`getComputedStyle(document.querySelector('#choice-team').indicator).backgroundColor`), 'rgba(0, 0, 0, 0)', 'checked radio indicator has a visible fill');
  console.log('  ✓ checkbox and radio choices respond to pointer input');

  await click('#region-test .ui-select-trigger');
  await waitFor(`document.querySelector('#region-test').popoverElement.open`, 'region select opens');
  await waitFor(`document.querySelector('.ui-select-option[data-ui-option-index="0"]')`, 'region options render in the portalled panel');
  const regionOptionColor = 'getComputedStyle(document.querySelector(".ui-select-option")).color';
  await evaluate("Omorphia.theme.set('light')");
  assert.equal(await evaluate(regionOptionColor), 'rgb(10, 10, 10)', 'an open select option follows the light theme');
  await evaluate("Omorphia.theme.set('dark')");
  assert.equal(await evaluate(regionOptionColor), 'rgb(245, 245, 245)', 'an open select option switches back to dark');
  console.log('  ✓ open floating surfaces switch light and dark themes');

  const regionMode = await evaluate(`document.querySelector('#region-test').popoverElement.panel._uiFloatMode`);
  await click('.ui-select-option[data-ui-option-index="0"]');
  await waitFor(`document.querySelector('#region-test').value === 'fra'`, 'region option selection updates the value');
  assert.equal(await evaluate(`document.querySelector('#region-test').formFields.querySelector('input')?.value`), 'fra');
  console.log(`  ✓ region picker opens and selects by pointer (${regionMode})`);

  await click('#date-test .ui-date-trigger');
  await waitFor(`document.querySelector('#date-test').open`, 'date picker opens');
  await waitFor(`document.querySelector('.ui-calendar-day[data-date="2026-11-21"]')`, 'calendar days render in the portalled panel');
  const dateMode = await evaluate(`document.querySelector('#date-test').popoverElement.panel._uiFloatMode`);
  await click('.ui-calendar-day[data-date="2026-11-21"]');
  await waitFor(`document.querySelector('#date-test').value === '2026-11-21'`, 'date cell selection updates the value');
  assert.equal(await evaluate(`document.querySelector('#date-test').hiddenValue.value`), '2026-11-21');
  console.log(`  ✓ date picker opens and selects by pointer (${dateMode})`);

  await click('#time-test .ui-time-trigger');
  await waitFor(`document.querySelector('#time-test').open`, 'time picker opens');
  await waitFor(`document.querySelector('.ui-time-option[data-minute="25"]')`, 'time options render in the portalled panel');
  const timeGeometry = await evaluate(`(() => {
    const panel = document.querySelector('#time-test').popoverElement.panel.getBoundingClientRect();
    const list = document.querySelector('#time-test').minuteList.getBoundingClientRect();
    return { panelBottom: panel.bottom, listBottom: list.bottom, listHeight: list.height };
  })()`);
  assert.ok(timeGeometry.listBottom <= timeGeometry.panelBottom - 5, 'time lists stay inside the available floating panel height: ' + JSON.stringify(timeGeometry));
  const timeMode = await evaluate(`document.querySelector('#time-test').popoverElement.panel._uiFloatMode`);
  await click('.ui-time-option[data-minute="25"]');
  await waitFor(`document.querySelector('#time-test').value === '14:25'`, 'minute selection updates the value');
  assert.equal(await evaluate(`document.querySelector('#time-test').hiddenValue.value`), '14:25');
  assert.equal(await evaluate(`document.querySelector('#time-test').input.value`), '2:25 PM');
  console.log(`  ✓ time picker opens and selects by pointer (${timeMode})`);

  await evaluate(`(() => {
    const input = document.querySelector('#time-test').input;
    input.value = '3:45 PM';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  })()`);
  await waitFor(`document.querySelector('#time-test').value === '15:45'`, 'typed time updates the value');
  assert.equal(await evaluate(`document.querySelector('#time-test').hiddenValue.value`), '15:45');
  console.log('  ✓ time picker accepts typed 12-hour values');

  assert.deepEqual(runtimeErrors, [], `No uncaught browser errors: ${runtimeErrors.join('; ')}`);
  console.log('Browser interaction checks passed.');
} finally {
  try { socket?.close(); } catch {}
  child.kill('SIGTERM');
  await delay(150);
  await new Promise((resolvePromise) => server.close(resolvePromise));
  rmSync(profile, { recursive: true, force: true });
}
