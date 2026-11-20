// Showcase wiring. Demos are real library markup: the code panel is generated from the same <template> that renders the preview.
const dedent = (s) => { const lines = s.replace(/^\n+|\s+$/g, '').split('\n'); const pad = Math.min(...lines.filter((l) => l.trim()).map((l) => l.match(/^ */)[0].length)); return lines.map((l) => l.slice(pad)).join('\n'); };
document.querySelectorAll('.demo').forEach((demo) => {
  const tpl = demo.querySelector('template'); if (!tpl) return;
  const preview = document.createElement('div'); preview.className = 'demo-preview' + (demo.dataset.layout === 'stack' ? ' stack' : ''); preview.append(tpl.content.cloneNode(true));
  const code = document.createElement('details'); code.className = 'demo-code';
  const summary = document.createElement('summary'); summary.textContent = 'View example code';
  const pre = document.createElement('pre'); const text = dedent(tpl.innerHTML.replace(/&amp;/g, '&')); pre.textContent = text;
  const copy = document.createElement('ui-button'); copy.className = 'copy'; copy.setAttribute('variant', 'subtle'); copy.setAttribute('size', 'sm'); copy.setAttribute('icon', 'copy'); copy.textContent = 'Copy';
  copy.addEventListener('click', async () => { try { await navigator.clipboard.writeText(text); Edgelit.toast({ title: 'Copied to clipboard', variant: 'success', duration: 1800 }); } catch { Edgelit.toast({ title: 'Copy failed', description: 'Select the code and copy it manually.', variant: 'danger' }); } });
  code.append(summary, pre, copy); tpl.replaceWith(preview); demo.append(code);
});

// Command palette commands (global registry + one <ui-command> declared in HTML)
Edgelit.commands.register([
  ...[['Typography', 'type'], ['Buttons', 'buttons'], ['Inputs', 'inputs'], ['Navigation', 'navigation'], ['Feedback', 'feedback'], ['Containers', 'containers'], ['Advanced components', 'advanced'], ['Effects and illumination', 'effects']]
    .map(([label, id]) => ({ id: 'go-' + id, label, group: 'Go to section', icon: 'arrow-right', onSelect: () => document.getElementById(id).scrollIntoView() })),
  { id: 'theme', label: 'Toggle light / dark theme', group: 'Actions', icon: 'sun', keywords: ['appearance', 'mode'], shortcut: 'T', onSelect: () => Edgelit.theme.toggle() },
  { id: 'toast', label: 'Show a notification', group: 'Actions', icon: 'bell', onSelect: () => Edgelit.toast({ title: 'Command ran', description: 'Triggered from the palette.', variant: 'success' }) },
  { id: 'gh', label: 'Open the GitHub repository', group: 'Links', icon: 'external-link', href: 'https://github.com/aabhro/edgelit', target: '_blank' },
]);

// Dropdown demo: listen for the ui-select event
document.addEventListener('ui-select', (e) => { if (e.target.id === 'actions-menu') Edgelit.toast({ title: `Chose ${e.detail.value}`, variant: 'info', duration: 2000 }); });

// Search demo data / async source
const fruit = ['Apple', 'Apricot', 'Avocado', 'Banana', 'Blackberry', 'Blueberry', 'Cherry', 'Coconut', 'Fig', 'Grape', 'Kiwi', 'Lemon', 'Mango', 'Orange', 'Papaya', 'Peach', 'Pear', 'Pineapple', 'Plum', 'Raspberry'];
document.addEventListener('DOMContentLoaded', () => {
  const s1 = document.getElementById('search-local'); if (s1) { s1.data = fruit.map((f) => ({ label: f, description: 'Fruit', icon: 'star' })); s1.suggestions = ['Mango', 'Kiwi', 'Papaya']; s1.addEventListener('ui-select', (e) => Edgelit.toast({ title: `Selected ${e.detail.value}`, variant: 'info', duration: 2200 })); }
  const s2 = document.getElementById('search-async'); if (s2) { s2.source = (q, signal) => new Promise((res, rej) => { const t = setTimeout(() => res(fruit.filter((f) => f.toLowerCase().includes(q.toLowerCase())).map((f) => ({ label: f, description: 'Fruit' }))), 700); signal.addEventListener('abort', () => { clearTimeout(t); rej(); }); }); }
  const s3 = document.getElementById('search-custom'); if (s3) { const people = [['Ada Lovelace', 'AL', 'online'], ['Grace Hopper', 'GH', 'away'], ['Alan Turing', 'AT', 'busy'], ['Margaret Hamilton', 'MH', 'online']]; s3.data = people.map(([label, initials, status]) => ({ label, initials, status })); s3.renderItem = (it) => { const row = document.createElement('div'); row.className = 'ui-row ui-row--nowrap'; const av = document.createElement('span'); av.className = 'ui-avatar ui-avatar--sm'; av.dataset.status = it.status; av.textContent = it.initials; const name = document.createElement('span'); name.textContent = it.label; row.append(av, name); return row; }; }
  const range = document.getElementById('range-demo'); if (range) { const set = () => { range.style.setProperty('--_pct', ((range.value - range.min) / (range.max - range.min)) * 100 + '%'); document.getElementById('range-out').textContent = range.value; }; range.addEventListener('input', set); set(); }
  const pg = document.getElementById('pg'); pg?.addEventListener('ui-change', (e) => (document.getElementById('pg-out').textContent = `Page ${e.detail.page}`));
  // Effects playground
  const stage = document.getElementById('fx-stage'); document.querySelectorAll('[data-fx]').forEach((inp) => { const apply = () => { stage.style.setProperty(inp.dataset.fx, inp.dataset.unit ? inp.value + inp.dataset.unit : inp.value); inp.parentElement.querySelector('output').textContent = inp.value + (inp.dataset.unit || ''); }; inp.addEventListener('input', apply); apply(); });
  // Mobile sidebar: close after choosing a section
  document.getElementById('nav')?.addEventListener('ui-select', () => {});
  document.querySelectorAll('.fx-validate').forEach((f) => f.addEventListener('submit', (e) => { e.preventDefault(); const field = f.querySelector('.ui-field'), input = f.querySelector('input'); const ok = /^\S+@\S+\.\S+$/.test(input.value); field.dataset.state = ok ? 'success' : 'error'; input.setAttribute('aria-invalid', String(!ok)); }));
});
