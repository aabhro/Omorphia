document.querySelectorAll('[data-ui-shortcut]').forEach((node) => { node.textContent = Omorphia.shortcutLabel(); });

// Showcase wiring. Demos are real library markup: the code panel is generated from the same <template> that renders the preview.
const dedent = (s) => { const lines = s.replace(/^\n+|\s+$/g, '').split('\n'); const pad = Math.min(...lines.filter((l) => l.trim()).map((l) => l.match(/^ */)[0].length)); return lines.map((l) => l.slice(pad)).join('\n'); };
document.querySelectorAll('.demo').forEach((demo) => {
  const tpl = demo.querySelector('template'); if (!tpl) return;
  const preview = document.createElement('div'); preview.className = 'demo-preview' + (demo.dataset.layout === 'stack' ? ' stack' : ''); preview.append(tpl.content.cloneNode(true));
  const code = document.createElement('ui-accordion'); code.className = 'demo-code';
  const item = document.createElement('ui-accordion-item'); item.setAttribute('heading', 'View example code');
  const pre = document.createElement('pre'); const text = dedent(tpl.innerHTML.replace(/&amp;/g, '&')); pre.textContent = text;
  const copy = document.createElement('ui-button'); copy.className = 'copy'; copy.setAttribute('variant', 'subtle'); copy.setAttribute('size', 'sm'); copy.setAttribute('icon', 'copy'); copy.textContent = 'Copy';
  copy.addEventListener('click', async () => { try { await navigator.clipboard.writeText(text); Omorphia.toast({ title: 'Copied to clipboard', variant: 'success', duration: 1800 }); } catch { Omorphia.toast({ title: 'Copy failed', description: 'Select the code and copy it manually.', variant: 'danger' }); } });
  item.append(pre, copy); code.append(item); tpl.replaceWith(preview); demo.append(code);
});

// Command palette commands (global registry + one <ui-command> declared in HTML)
Omorphia.commands.register([
  ...[['Typography', 'type'], ['Buttons', 'buttons'], ['Inputs', 'inputs'], ['Navigation', 'navigation'], ['Feedback', 'feedback'], ['Containers', 'containers'], ['Advanced components', 'advanced'], ['Effects and illumination', 'effects']]
    .map(([label, id]) => ({ id: 'go-' + id, label, group: 'Go to section', icon: 'arrow-right', onSelect: () => document.getElementById(id).scrollIntoView() })),
  { id: 'theme', label: 'Toggle light / dark theme', group: 'Actions', icon: 'sun', keywords: ['appearance', 'mode'], shortcut: 'T', onSelect: () => Omorphia.theme.toggle() },
  { id: 'toast', label: 'Show a notification', group: 'Actions', icon: 'bell', onSelect: () => Omorphia.toast({ title: 'Command ran', description: 'Triggered from the palette.', variant: 'success' }) },
  { id: 'gh', label: 'Open the GitHub repository', group: 'Links', icon: 'external-link', href: 'https://github.com/aabhro/Omorphia', target: '_blank' },
]);

// Dropdown demo: listen for the ui-select event
document.addEventListener('ui-select', (e) => { if (e.target.id === 'actions-menu') Omorphia.toast({ title: `Chose ${e.detail.value}`, variant: 'info', duration: 2000 }); });

// Search demo data / async source
const fruit = ['Apple', 'Apricot', 'Avocado', 'Banana', 'Blackberry', 'Blueberry', 'Cherry', 'Coconut', 'Fig', 'Grape', 'Kiwi', 'Lemon', 'Mango', 'Orange', 'Papaya', 'Peach', 'Pear', 'Pineapple', 'Plum', 'Raspberry'];
document.addEventListener('DOMContentLoaded', () => {
  const s1 = document.getElementById('search-local'); if (s1) { s1.data = fruit.map((f) => ({ label: f, description: 'Fruit', icon: 'star' })); s1.suggestions = ['Mango', 'Kiwi', 'Papaya']; s1.addEventListener('ui-select', (e) => Omorphia.toast({ title: `Selected ${e.detail.value}`, variant: 'info', duration: 2200 })); }
  const s2 = document.getElementById('search-async'); if (s2) { s2.source = (q, signal) => new Promise((res, rej) => { const t = setTimeout(() => res(fruit.filter((f) => f.toLowerCase().includes(q.toLowerCase())).map((f) => ({ label: f, description: 'Fruit' }))), 700); signal.addEventListener('abort', () => { clearTimeout(t); rej(); }); }); }
  const s3 = document.getElementById('search-custom'); if (s3) { const people = [['Ada Lovelace', 'AL', 'online'], ['Grace Hopper', 'GH', 'away'], ['Alan Turing', 'AT', 'busy'], ['Margaret Hamilton', 'MH', 'online']]; s3.data = people.map(([label, initials, status]) => ({ label, initials, status })); s3.renderItem = (it) => { const row = document.createElement('div'); row.className = 'ui-row ui-row--nowrap'; const av = document.createElement('span'); av.className = 'ui-avatar ui-avatar--sm'; av.dataset.status = it.status; av.textContent = it.initials; const name = document.createElement('span'); name.textContent = it.label; row.append(av, name); return row; }; }
  const range = document.getElementById('range-demo'); if (range) { const set = () => { document.getElementById('range-out').textContent = range.value; }; range.addEventListener('ui-input', set); set(); }
  const pg = document.getElementById('pg'); pg?.addEventListener('ui-change', (e) => (document.getElementById('pg-out').textContent = `Page ${e.detail.page}`));
  const datePicker = document.getElementById('date-demo');
  const dateOutput = document.getElementById('date-demo-output');
  datePicker?.addEventListener('ui-change', (event) => { if (dateOutput) dateOutput.textContent = event.detail.value || 'No date selected'; });
  const timePicker = document.getElementById('time-demo');
  const timeOutput = document.getElementById('time-demo-output');
  timePicker?.addEventListener('ui-change', () => { if (timeOutput) timeOutput.textContent = timePicker.input.value; });
  // Advanced component fixtures
  const colorPicker = document.getElementById('color-picker-demo');
  const colorOutput = document.getElementById('color-picker-output');
  colorPicker?.addEventListener('ui-input', (event) => {
    if (colorOutput) colorOutput.textContent = 'Selected ' + event.detail.value + ' · ' + event.detail.color;
  });
  const combo = document.getElementById('combobox-demo');
  if (combo) combo.data = [
    { value: 'production', label: 'Production', description: 'Live customer environment' },
    { value: 'staging', label: 'Staging', description: 'Pre-release testing' },
    { value: 'development', label: 'Development', description: 'Local development environment' },
    { value: 'preview', label: 'Preview', description: 'Temporary review deployment' }
  ];
  const table = document.getElementById('data-table-demo');
  if (table) {
    table.columns = [
      { key: 'project', label: 'Project' },
      { key: 'type', label: 'Type' },
      { key: 'status', label: 'Status' },
      { key: 'updated', label: 'Updated' }
    ];
    table.data = [
      { project: 'Atlas', type: 'Web', status: 'Active', updated: '2026-11-24' },
      { project: 'Meridian', type: 'Library', status: 'Review', updated: '2026-11-22' },
      { project: 'Northstar', type: 'Mobile', status: 'Active', updated: '2026-11-20' },
      { project: 'Orbit', type: 'API', status: 'Paused', updated: '2026-11-18' },
      { project: 'Fieldnotes', type: 'Web', status: 'Draft', updated: '2026-11-16' },
      { project: 'Still', type: 'Desktop', status: 'Active', updated: '2026-11-12' }
    ];
  }
  const tree = document.getElementById('tree-view-demo');
  if (tree) {
    tree.data = [
      { id: 'workspace', label: 'Workspace', icon: 'folder', children: [
        { id: 'components', label: 'Components', icon: 'folder', children: [
          { id: 'buttons', label: 'Buttons', icon: 'file-text' },
          { id: 'inputs', label: 'Inputs', icon: 'file-text' },
          { id: 'navigation', label: 'Navigation', icon: 'file-text' }
        ] },
        { id: 'documentation', label: 'Documentation', icon: 'folder', children: [
          { id: 'readme', label: 'README.md', icon: 'file-text' },
          { id: 'changelog', label: 'CHANGELOG.md', icon: 'file-text' }
        ] }
      ] }
    ];
    tree.expanded = ['workspace', 'components'];
  }
  const tour = document.getElementById('tour-demo');
  if (tour) tour.steps = [
    { selector: '#color-picker-demo', title: 'Choose a color', description: 'Adjust the color, opacity, and exact hex value.' },
    { selector: '#data-table-demo', title: 'Explore your data', description: 'Filter records, sort columns, and control which columns remain visible.' },
    { selector: '#tree-view-demo', title: 'Navigate a hierarchy', description: 'Expand folders, select items, and move nodes by dragging them.' }
  ];
  document.getElementById('file-upload-demo')?.addEventListener('ui-error', (event) => {
    Omorphia.toast({ title: 'Some files were not added', description: event.detail.errors.join(' '), variant: 'warning' });
  });
  document.getElementById('stepper-demo')?.addEventListener('ui-invalid', () => {
    Omorphia.toast({ title: 'Review this step', description: 'Complete the required fields before continuing.', variant: 'warning' });
  });
  document.getElementById('rating-demo')?.addEventListener('ui-change', (event) => {
    Omorphia.toast({ title: 'Rating updated', description: event.detail.value + ' out of 5', duration: 1600 });
  });

  // Directional illumination controls
  const stage = document.getElementById('fx-stage');
  const fxInputs = [...document.querySelectorAll('[data-fx]')];
  const fxOutput = document.getElementById('fx-css-output');
  const fxStatus = document.getElementById('fx-status');
  const fxCopy = document.getElementById('fx-copy');
  const fxDefaults = Object.fromEntries(fxInputs.map((input) => [input.dataset.fx, input.value]));
  const fxPresets = {
    quiet: { '--ui-edge-tl-alpha': '0.3', '--ui-edge-br-alpha': '0.07', '--ui-edge-tl-reach': '35', '--ui-edge-br-reach': '28', '--ui-edge-base-alpha': '0.02', '--ui-edge-width': '1', '--ui-edge-intensity': '0.8', '--ui-edge-hover-boost': '1.2', '--fx-radius': '4' },
    balanced: { ...fxDefaults },
    bright: { '--ui-edge-tl-alpha': '0.8', '--ui-edge-br-alpha': '0.22', '--ui-edge-tl-reach': '76', '--ui-edge-br-reach': '58', '--ui-edge-base-alpha': '0.1', '--ui-edge-width': '1.5', '--ui-edge-intensity': '1.25', '--ui-edge-hover-boost': '1.8', '--fx-radius': '16' }
  };
  const formatFx = (input) => {
    const value = Number(input.value);
    const text = Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
    return text + (input.dataset.unit || '');
  };
  const updateFx = (message = 'Custom settings applied.') => {
    if (!stage || !fxInputs.length) return;
    fxInputs.forEach((input) => {
      const value = formatFx(input);
      stage.style.setProperty(input.dataset.fx, value);
      const output = input.parentElement.querySelector('output');
      if (output) output.textContent = value;
    });
    const declarations = fxInputs.filter((input) => input.dataset.fx !== '--fx-radius')
      .map((input) => '  ' + input.dataset.fx + ': ' + formatFx(input) + ';');
    const radius = fxInputs.find((input) => input.dataset.fx === '--fx-radius');
    if (radius) declarations.push('  border-radius: ' + formatFx(radius) + ';');
    if (fxOutput) fxOutput.textContent = '.your-surface {\n' + declarations.join('\n') + '\n}';
    if (fxStatus) fxStatus.textContent = message;
  };
  const applyPreset = (name) => {
    const preset = fxPresets[name];
    if (!preset) return;
    fxInputs.forEach((input) => { if (preset[input.dataset.fx] != null) input.value = preset[input.dataset.fx]; });
    document.querySelectorAll('[data-fx-preset]').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.fxPreset === name)));
    updateFx(name[0].toUpperCase() + name.slice(1) + ' preset · ready to customize.');
  };
  fxInputs.forEach((input) => input.addEventListener('ui-input', () => {
    document.querySelectorAll('[data-fx-preset]').forEach((button) => button.setAttribute('aria-pressed', 'false'));
    updateFx();
  }));
  document.querySelectorAll('[data-fx-preset]').forEach((button) => button.addEventListener('click', () => applyPreset(button.dataset.fxPreset)));
  document.querySelector('[data-fx-reset]')?.addEventListener('click', () => {
    fxInputs.forEach((input) => { input.value = fxDefaults[input.dataset.fx]; });
    document.querySelectorAll('[data-fx-preset]').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.fxPreset === 'balanced')));
    updateFx('Settings reset to the library defaults.');
  });
  const copyFx = async () => {
    const value = fxOutput?.textContent || '';
    try {
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(value);
      else {
        const helper = document.createElement('textarea');
        helper.value = value; helper.setAttribute('readonly', ''); helper.style.position = 'fixed'; helper.style.opacity = '0';
        document.body.append(helper); helper.select();
        const copied = document.execCommand('copy'); helper.remove();
        if (!copied) throw new Error('Clipboard unavailable');
      }
      fxStatus.textContent = 'CSS copied to clipboard.';
      Omorphia.toast({ title: 'CSS copied', variant: 'success', duration: 1800 });
    } catch {
      fxStatus.textContent = 'Clipboard access is unavailable. Select the CSS above to copy it.';
      Omorphia.toast({ title: 'Copy unavailable', description: 'Select the CSS block and copy it manually.', variant: 'warning' });
    }
  };
  fxCopy?.addEventListener('click', copyFx);
  updateFx('Balanced preset · ready to customize.');
  // Mobile sidebar: close after choosing a section
  document.getElementById('nav')?.addEventListener('ui-select', () => {});
  document.querySelectorAll('.fx-validate').forEach((f) => f.addEventListener('submit', (e) => { e.preventDefault(); const field = f.querySelector('.ui-field'), input = f.querySelector('input'); const ok = /^\S+@\S+\.\S+$/.test(input.value); field.dataset.state = ok ? 'success' : 'error'; input.setAttribute('aria-invalid', String(!ok)); }));
});
