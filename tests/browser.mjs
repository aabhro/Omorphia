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
  for (let i = 0; i < 100; i++) {
    const response = await fetch(`http://127.0.0.1:${debugPort}/json/list`).catch(() => null);
    const targets = response?.ok ? await response.json() : [];
    target = targets.find((entry) => entry.type === 'page' && entry.url.startsWith(pageUrl));
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
    const rect = el.getBoundingClientRect();
    if (!rect.width || !rect.height) throw new Error('Element has no hit area: ' + ${JSON.stringify(selector)});
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  })()`);
  const click = async (selector) => {
    const point = await center(selector);
    const hit = await evaluate(`(() => {
      const el = document.elementFromPoint(${point.x}, ${point.y});
      return el ? { tag: el.localName, id: el.id, className: String(el.className || ''), target: Boolean(el.matches(${JSON.stringify(selector)}) || el.closest?.(${JSON.stringify(selector)})) } : null;
    })()`);
    assert.ok(hit?.target, `Real browser hit-testing reaches ${selector}; got ${JSON.stringify(hit)}`);
    await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: point.x, y: point.y, button: 'left', clickCount: 1 });
    await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: point.x, y: point.y, button: 'left', clickCount: 1 });
    await delay(220);
  };

  await send('Runtime.enable');
  await waitFor(`document.documentElement.dataset.browserReady === 'true' && document.querySelector('#region-test .ui-select-trigger') && document.querySelector('#date-test .ui-date-trigger') && document.querySelector('#time-test .ui-time-trigger')`, 'fixture custom elements and bundle initialize');

  await click('#region-test .ui-select-trigger');
  await waitFor(`document.querySelector('#region-test').popoverElement.open`, 'region select opens');
  const regionMode = await evaluate(`document.querySelector('#region-test').popoverElement.panel._uiFloatMode`);
  const regionDebug = await evaluate(`(() => {
    const el = document.querySelector('#region-test');
    return {
      value: el.value,
      optionCount: el.options?.length,
      options: el.options?.map(option => ({ value: option.value, label: option.label })),
      panelOpen: el.popoverElement?.open,
      panelConnected: el.popoverElement?.panel?.isConnected,
      panelHtml: el.popoverElement?.panel?.innerHTML,
      listHtml: el.list?.innerHTML,
      listConnected: el.list?.isConnected
    };
  })()`);
  console.log('Region picker DOM after open:', JSON.stringify(regionDebug));
  await click('#region-test .ui-select-option[data-ui-option-index="0"]');
  await waitFor(`document.querySelector('#region-test').value === 'fra'`, 'region option selection updates the value');
  assert.equal(await evaluate(`document.querySelector('#region-test').formFields.querySelector('input')?.value`), 'fra');
  console.log(`  ✓ region picker opens and selects by pointer (${regionMode})`);

  await click('#date-test .ui-date-trigger');
  await waitFor(`document.querySelector('#date-test').open`, 'date picker opens');
  const dateMode = await evaluate(`document.querySelector('#date-test').popoverElement.panel._uiFloatMode`);
  await click('#date-test .ui-calendar-day[data-date="2026-11-21"]');
  await waitFor(`document.querySelector('#date-test').value === '2026-11-21'`, 'date cell selection updates the value');
  assert.equal(await evaluate(`document.querySelector('#date-test').hiddenValue.value`), '2026-11-21');
  console.log(`  ✓ date picker opens and selects by pointer (${dateMode})`);

  await click('#time-test .ui-time-trigger');
  await waitFor(`document.querySelector('#time-test').open`, 'time picker opens');
  const timeMode = await evaluate(`document.querySelector('#time-test').popoverElement.panel._uiFloatMode`);
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
  await new Promise((resolvePromise) => server.close(resolvePromise));
  rmSync(profile, { recursive: true, force: true });
}
