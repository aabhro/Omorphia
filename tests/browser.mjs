import { spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import assert from 'node:assert/strict';

const candidates = [process.env.CHROME_BIN, 'google-chrome', 'chromium', 'chromium-browser'].filter(Boolean);
const browser = candidates.find((candidate) => spawnSync(candidate, ['--version'], { stdio: 'ignore' }).status === 0);
if (!browser) throw new Error('A Chromium or Chrome binary is required. Set CHROME_BIN to its executable path.');

const profile = mkdtempSync(join(tmpdir(), 'omorphia-chrome-'));
const pageUrl = new URL('../tests/browser.html', import.meta.url).href;
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
  for (let i = 0; i < 100; i++) {
    const response = await fetch(`http://127.0.0.1:${debugPort}/json/list`).catch(() => null);
    const targets = response?.ok ? await response.json() : [];
    target = targets.find((entry) => entry.type === 'page' && entry.url.startsWith('file:'));
    if (target?.webSocketDebuggerUrl) break;
    await delay(50);
  }
  assert.ok(target?.webSocketDebuggerUrl, 'Chromium exposes the local fixture page');

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
    if (response.exceptionDetails) throw new Error(response.exceptionDetails.text || 'Browser evaluation failed');
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
    const rect = el.getBoundingClientRect();
    if (!rect.width || !rect.height) throw new Error('Element has no hit area: ' + ${JSON.stringify(selector)});
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  })()`);
  const click = async (selector) => {
    const point = await center(selector);
    const hit = await evaluate(`(() => {
      const el = document.elementFromPoint(${point.x}, ${point.y});
      return el ? { tag: el.localName, id: el.id, className: String(el.className || ''), target: el.closest(${JSON.stringify(selector)}) !== null } : null;
    })()`);
    assert.ok(hit?.target, `Real browser hit-testing reaches ${selector}; got ${JSON.stringify(hit)}`);
    await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: point.x, y: point.y, button: 'left', clickCount: 1 });
    await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: point.x, y: point.y, button: 'left', clickCount: 1 });
    await delay(220);
  };

  await send('Runtime.enable');
  await waitFor(`document.documentElement.dataset.browserReady === 'true'`, 'fixture custom elements and bundle load');

  await click('#region-test .ui-select-trigger');
  await waitFor(`document.querySelector('#region-test').popover.open`, 'region select opens');
  const regionMode = await evaluate(`document.querySelector('#region-test').popover.panel._uiFloatMode`);
  await click('#region-test .ui-select-option[data-ui-option-index="0"]');
  await waitFor(`document.querySelector('#region-test').value === 'fra'`, 'region option selection updates the value');
  assert.equal(await evaluate(`document.querySelector('#region-test').formFields.querySelector('input')?.value`), 'fra');
  console.log(`  ✓ region picker opens and selects by pointer (${regionMode})`);

  await click('#date-test .ui-date-trigger');
  await waitFor(`document.querySelector('#date-test').open`, 'date picker opens');
  const dateMode = await evaluate(`document.querySelector('#date-test').popover.panel._uiFloatMode`);
  await click('#date-test .ui-calendar-day[data-date="2026-11-21"]');
  await waitFor(`document.querySelector('#date-test').value === '2026-11-21'`, 'date cell selection updates the value');
  assert.equal(await evaluate(`document.querySelector('#date-test').hiddenValue.value`), '2026-11-21');
  console.log(`  ✓ date picker opens and selects by pointer (${dateMode})`);

  await click('#time-test .ui-time-trigger');
  await waitFor(`document.querySelector('#time-test').open`, 'time picker opens');
  const timeMode = await evaluate(`document.querySelector('#time-test').popover.panel._uiFloatMode`);
  await click('#time-test .ui-time-option[data-minute="35"]');
  await waitFor(`document.querySelector('#time-test').value === '14:35'`, 'minute selection updates the value');
  assert.equal(await evaluate(`document.querySelector('#time-test').hiddenValue.value`), '14:35');
  assert.equal(await evaluate(`document.querySelector('#time-test').valueLabel.textContent`), '2:35 PM');
  console.log(`  ✓ time picker opens and selects by pointer (${timeMode})`);

  assert.deepEqual(runtimeErrors, [], `No uncaught browser errors: ${runtimeErrors.join('; ')}`);
  console.log('Browser interaction checks passed.');
} finally {
  try { socket?.close(); } catch {}
  child.kill('SIGTERM');
  await delay(150);
  rmSync(profile, { recursive: true, force: true });
}
