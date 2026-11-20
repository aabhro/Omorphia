<div align="center">
  <img src="https://cdn.jsdelivr.net/npm/lucide-static@1.77.0/icons/layers-3.svg" width="42" height="42" alt="Omorfia icon">
  <h1>Omorfia</h1>
  <p><strong>Quietly considered interface components.</strong></p>
  <p>A dependency-free UI library with native custom elements, practical components, and restrained directional border illumination.</p>
  <p><a href="https://aabhro.github.io/edgelit/"><strong>Open the live showcase</strong></a> &nbsp;·&nbsp; <a href="https://github.com/aabhro/Edgelit">Source repository</a></p>
  <p>
    <img src="https://img.shields.io/github/v/tag/aabhro/Edgelit?label=release&style=flat" alt="Latest release">
    <img src="https://img.shields.io/github/actions/workflow/status/aabhro/Edgelit/ci.yml?branch=main&label=checks&style=flat" alt="Build status">
    <img src="https://img.shields.io/github/license/aabhro/Edgelit?style=flat" alt="MIT license">
  </p>
</div>

---

<div align="center">
  <a href="#overview"><img src="https://cdn.jsdelivr.net/npm/lucide-static@1.77.0/icons/info.svg" width="15" height="15" alt=""> Overview</a>
  &nbsp;·&nbsp; <a href="#quick-start"><img src="https://cdn.jsdelivr.net/npm/lucide-static@1.77.0/icons/rocket.svg" width="15" height="15" alt=""> Quick start</a>
  &nbsp;·&nbsp; <a href="#components"><img src="https://cdn.jsdelivr.net/npm/lucide-static@1.77.0/icons/layout-grid.svg" width="15" height="15" alt=""> Components</a>
  &nbsp;·&nbsp; <a href="#illumination"><img src="https://cdn.jsdelivr.net/npm/lucide-static@1.77.0/icons/sun.svg" width="15" height="15" alt=""> Illumination</a>
  &nbsp;·&nbsp; <a href="#theming"><img src="https://cdn.jsdelivr.net/npm/lucide-static@1.77.0/icons/palette.svg" width="15" height="15" alt=""> Theming</a>
  &nbsp;·&nbsp; <a href="#development"><img src="https://cdn.jsdelivr.net/npm/lucide-static@1.77.0/icons/code-2.svg" width="15" height="15" alt=""> Development</a>
</div>

## Overview

Omorfia provides reusable interface elements without requiring a framework, runtime dependency, or build step in the consuming project.

- **Small integration surface:** one CSS file and one JavaScript file.
- **Native foundations:** semantic HTML, custom elements, and native browser dialogs.
- **Useful interaction:** keyboard navigation, accessible states, and responsive navigation.
- **Lucide icons:** common icons are bundled. Additional names load on demand.
- **Scoped theming:** CSS variables work globally or inside a component subtree.
- **Progressive enhancement:** CSS-only elements work without JavaScript where possible.

The library keeps its original <code>ui-</code> custom-element and class prefixes for compatibility. Existing integrations using the <code>Edgelit</code> global continue to work as an alias.

## Quick start

<details open>
  <summary><strong><img src="https://cdn.jsdelivr.net/npm/lucide-static@1.77.0/icons/package.svg" width="15" height="15" alt=""> CDN setup</strong> · CSS and classic JavaScript</summary>

Use a pinned release in production. GitHub's code block toolbar provides a copy action.

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/aabhro/Edgelit@v1.1.2/dist/omorfia.min.css">
<script src="https://cdn.jsdelivr.net/gh/aabhro/Edgelit@v1.1.2/dist/omorfia.min.js"></script>

<ui-button variant="primary" icon="save">Save changes</ui-button>
<ui-tooltip content="Copy to clipboard">
  <ui-button icon="copy">Copy</ui-button>
</ui-tooltip>
<ui-command-palette></ui-command-palette>
```

Custom elements upgrade automatically, including elements inserted later. Dark mode is the default.

</details>

<details>
  <summary><strong><img src="https://cdn.jsdelivr.net/npm/lucide-static@1.77.0/icons/pin.svg" width="15" height="15" alt=""> Pin a release</strong> · Stable production assets</summary>

Use an exact version such as <code>v1.1.2</code>. A release tag gives you a stable asset URL.

| Asset | Path |
|---|---|
| CSS | <code>dist/omorfia.min.css</code> |
| Classic JS | <code>dist/omorfia.min.js</code> |
| ES module | <code>dist/omorfia.esm.min.js</code> |

Generated Subresource Integrity hashes are available in <a href="dist/sri.json"><code>dist/sri.json</code></a>.

</details>

<details>
  <summary><strong><img src="https://cdn.jsdelivr.net/npm/lucide-static@1.77.0/icons/blocks.svg" width="15" height="15" alt=""> ES modules</strong> · Import only what you use</summary>

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/aabhro/Edgelit@v1.1.2/dist/css/core.min.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/aabhro/Edgelit@v1.1.2/dist/css/button.min.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/aabhro/Edgelit@v1.1.2/dist/css/feedback.min.css">

<script type="module">
  import * as Omorfia from 'https://cdn.jsdelivr.net/gh/aabhro/Edgelit@v1.1.2/dist/omorfia.esm.min.js';
  Omorfia.toast({ title: 'Ready', variant: 'success' });
</script>
```

For individual component modules, see the component list below.

</details>

## Components

The CSS is split into focused modules. The complete stylesheet includes every module.

| Module | Includes |
|---|---|
| <code>core</code> | Tokens, base styles, and border illumination |
| <code>button</code> | Buttons and button groups |
| <code>forms</code> | Inputs, selects, checkboxes, switches, and search |
| <code>nav</code> | Breadcrumbs, navigation links, tabs, and pagination |
| <code>feedback</code> | Tooltips, alerts, badges, status, progress, and toast styles |
| <code>containers</code> | Cards, avatars, dialogs, popovers, and collapsibles |
| <code>advanced</code> | Command palette, search panels, and side navigation |

### Buttons

<details>
  <summary><strong>View implementation</strong></summary>

```html
<ui-button variant="primary" icon="save">Save</ui-button>
<ui-button variant="secondary">Cancel</ui-button>
<ui-button variant="subtle" icon="ellipsis" label="More options"></ui-button>
```

Variants: <code>primary</code>, <code>secondary</code>, <code>subtle</code>, and <code>destructive</code>. Sizes: <code>sm</code>, <code>md</code>, and <code>lg</code>.

</details>

### Forms

<details>
  <summary><strong>View implementation</strong></summary>

```html
<div class="ui-field">
  <label class="ui-label" for="project-name">Project name</label>
  <div class="ui-input">
    <ui-icon name="folder"></ui-icon>
    <input id="project-name" name="project-name" placeholder="Untitled project">
  </div>
  <p class="ui-hint">Choose a name for this workspace.</p>
</div>
```

Also available: <code>.ui-textarea</code>, <code>.ui-select</code>, <code>.ui-check</code>, <code>.ui-radio</code>, <code>.ui-switch</code>, and <code>.ui-range</code>.

</details>

### Navigation

<details>
  <summary><strong>View implementation</strong></summary>

```html
<ui-tabs value="overview">
  <ui-tab label="Overview" value="overview">Overview panel</ui-tab>
  <ui-tab label="Activity" value="activity">Activity panel</ui-tab>
</ui-tabs>

<ui-pagination total="24" page="1"></ui-pagination>

<ui-dropdown>
  <button slot="trigger">Actions</button>
  <button data-value="rename">Rename</button>
  <button data-value="duplicate">Duplicate</button>
</ui-dropdown>
```

Tabs support arrow keys, Home, and End. Dropdown menus support arrow-key navigation, Home, End, and type-ahead.

</details>

### Feedback and overlays

<details>
  <summary><strong>View implementation</strong></summary>

```js
Omorfia.toast({
  title: 'Changes saved',
  description: 'Your work is up to date.',
  variant: 'success'
});

const confirmed = await Omorfia.confirm({
  title: 'Delete project?',
  message: 'This action cannot be undone.',
  confirmLabel: 'Delete',
  destructive: true
});
```

Available elements include <code>&lt;ui-tooltip&gt;</code>, <code>&lt;ui-modal&gt;</code>, <code>&lt;ui-popover&gt;</code>, and <code>&lt;ui-dropdown&gt;</code>.

</details>

### Command palette

Press <kbd>Ctrl</kbd> + <kbd>K</kbd> on Windows and Linux, or <kbd>⌘</kbd> + <kbd>K</kbd> on macOS. Use the arrow keys to move, Enter to run, and Escape to close.

<details>
  <summary><strong>Register commands</strong></summary>

```js
Omorfia.commands.register([
  {
    id: 'new-project',
    label: 'New project',
    group: 'Actions',
    icon: 'plus',
    shortcut: 'N',
    onSelect: () => createProject()
  },
  {
    id: 'docs',
    label: 'Open documentation',
    group: 'Links',
    icon: 'book-open',
    href: '/docs'
  }
]);
```

Commands can be registered globally or on one palette. The component also supports declarative <code>&lt;ui-command&gt;</code> elements.

</details>

### Search and side navigation

<details>
  <summary><strong>Search suggestions</strong></summary>

```js
const search = document.querySelector('ui-search');

search.data = [
  { label: 'Apple', description: 'Fruit', icon: 'apple' },
  { label: 'Mango', description: 'Fruit', icon: 'leaf' }
];

search.addEventListener('ui-select', (event) => {
  console.log(event.detail.item);
});
```

The search component supports local data, asynchronous sources, loading states, keyboard selection, and custom item rendering.

</details>

<details>
  <summary><strong>Responsive side navigation</strong></summary>

```html
<ui-sidebar heading="Workspace" collapsible breakpoint="768">
  <ui-sidebar-item icon="house" href="/" active>Home</ui-sidebar-item>
  <ui-sidebar-item icon="folder">Projects
    <ui-sidebar-item href="/atlas">Atlas</ui-sidebar-item>
    <ui-sidebar-item href="/meridian">Meridian</ui-sidebar-item>
  </ui-sidebar-item>
</ui-sidebar>
```

On narrow viewports the sidebar becomes an off-canvas drawer. It supports nested groups, collapse, keyboard navigation, and active states.

</details>

## Illumination

Omorfia keeps its signature directional light. The primary highlight starts near the top-left edge. A dimmer reflection sits near the bottom-right. The effect is masked into the border ring instead of drawing a bright outline around every element.

Apply it to a surface with <code>ui-edge</code>:

```html
<div class="ui-edge" style="border-radius: 8px">
  A softly illuminated surface
</div>
```

| Variable | Default | Purpose |
|---|---:|---|
| <code>--ui-edge-tl-alpha</code> | <code>.5</code> | Top-left strength |
| <code>--ui-edge-br-alpha</code> | <code>.14</code> | Bottom-right strength |
| <code>--ui-edge-tl-reach</code> | <code>52%</code> | Top-left reach |
| <code>--ui-edge-br-reach</code> | <code>42%</code> | Bottom-right reach |
| <code>--ui-edge-base-alpha</code> | <code>.05</code> | Resting edge strength |
| <code>--ui-edge-width</code> | <code>1px</code> | Ring thickness |
| <code>--ui-edge-intensity</code> | <code>1</code> | Overall intensity |
| <code>--ui-edge-hover-boost</code> | <code>1.45</code> | Interactive hover multiplier |

Modifiers: <code>ui-edge--soft</code>, <code>ui-edge--strong</code>, <code>ui-edge--accent</code>, <code>ui-edge--none</code>, and <code>ui-edge--animated</code>. Animation respects <code>prefers-reduced-motion</code>.

The showcase includes a live configuration panel with presets and copyable CSS.

## Theming

Override tokens on <code>:root</code> or scope them to any container.

```css
:root {
  --ui-bg: #0a0a0a;
  --ui-surface: #0a0a0a;
  --ui-overlay: #0a0a0a;
  --ui-text: #f5f5f5;
  --ui-accent: #f5f5f5;
  --ui-radius: 6px;
  --ui-font: "Geist", system-ui, sans-serif;
}
```

Set a theme through the attribute:

```html
<html data-ui-theme="dark">
<section data-ui-theme="light">A separately themed section</section>
```

Or use the JavaScript helper:

```js
Omorfia.theme.set('dark');  // dark, light, or auto
Omorfia.theme.toggle();
```

Menus, dialogs, toasts, and other floating panels keep an opaque near-black surface for consistent contrast.

## Browser support

Targets current Chrome, Edge, Safari 16.4+, and Firefox. The library uses modern browser features including custom elements, <code>color-mix()</code>, CSS masks, <code>:has()</code>, and native dialogs. Floating panels use the Popover API where available and a fixed-position fallback elsewhere.

## Development

<details>
  <summary><strong><img src="https://cdn.jsdelivr.net/npm/lucide-static@1.77.0/icons/terminal.svg" width="15" height="15" alt=""> Build and test locally</strong></summary>

```bash
git clone https://github.com/aabhro/Edgelit.git
cd Edgelit
npm install
npm run build
npm test
```

The showcase is <code>index.html</code>. Source styles live in <code>src/css/</code>, component logic lives in <code>src/js/</code>, and showcase-only wiring lives in <code>showcase/</code>.

The build regenerates the complete and modular CSS, classic and ESM bundles, component modules, compatibility filenames, and the SRI manifest. The generated <code>dist/</code> directory is committed because it is served directly from the repository.

</details>

## License

MIT. See <a href="LICENSE">LICENSE</a>.
