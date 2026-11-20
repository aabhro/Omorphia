<div align="center">
  <img src="assets/readme-cover.svg" alt="Omorphia, quietly considered interface components" width="100%">
  <p>
    <a href="https://aabhro.github.io/Omorphia/"><strong>Live showcase</strong></a>
    &nbsp;·&nbsp;
    <a href="https://github.com/aabhro/Omorphia">Repository</a>
    &nbsp;·&nbsp;
    <a href="LICENSE">MIT license</a>
  </p>
  <p>
    <img src="https://img.shields.io/github/v/tag/aabhro/Omorphia?label=release&style=flat-square&labelColor=0a0a0a&color=262626" alt="Release">
    <img src="https://img.shields.io/github/actions/workflow/status/aabhro/Omorphia/ci.yml?branch=main&label=checks&style=flat-square&labelColor=0a0a0a&color=262626" alt="Checks">
    <img src="https://img.shields.io/github/license/aabhro/Omorphia?style=flat-square&labelColor=0a0a0a&color=262626" alt="MIT">
  </p>
</div>

---

<div align="center">
  <a href="#overview"><img src="assets/icons/info.svg" width="15" height="15" alt=""> Overview</a>
  &nbsp;·&nbsp;
  <a href="#quick-start"><img src="assets/icons/rocket.svg" width="15" height="15" alt=""> Quick start</a>
  &nbsp;·&nbsp;
  <a href="#components"><img src="assets/icons/layers.svg" width="15" height="15" alt=""> Components</a>
  &nbsp;·&nbsp;
  <a href="#illumination"><img src="assets/icons/sun.svg" width="15" height="15" alt=""> Illumination</a>
  &nbsp;·&nbsp;
  <a href="#theming"><img src="assets/icons/palette.svg" width="15" height="15" alt=""> Theming</a>
  &nbsp;·&nbsp;
  <a href="#development"><img src="assets/icons/terminal.svg" width="15" height="15" alt=""> Development</a>
</div>

## Overview

Omorphia is a small, dependency-free UI library for websites. It uses native custom elements, plain CSS, and browser APIs. No framework is required.

- **Simple setup:** one stylesheet and one script from a CDN.
- **Native interaction:** semantic elements, keyboard support, and accessible states.
- **Useful components:** buttons, forms, navigation, feedback, overlays, search, and sidebars.
- **Lucide icons:** common icons are bundled. Other icons load when needed.
- **Scoped themes:** override CSS variables globally or inside a component.
- **Directional illumination:** a restrained light on selected surface edges, not a permanent outline on every component.

## Quick start

<details>
  <summary><strong>CDN installation</strong> · Classic script</summary>

Use a pinned release for production.

~~~html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/aabhro/Omorphia@v1.1.6/dist/omorphia.min.css">
<script src="https://cdn.jsdelivr.net/gh/aabhro/Omorphia@v1.1.6/dist/omorphia.min.js"></script>

<ui-button variant="primary" icon="save">Save changes</ui-button>
<ui-tooltip content="Copy to clipboard">
  <ui-button icon="copy">Copy</ui-button>
</ui-tooltip>
<ui-command-palette></ui-command-palette>
~~~

Custom elements upgrade automatically, including elements inserted later.

</details>

<details>
  <summary><strong>ES module installation</strong> · Import the complete API</summary>

~~~html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/aabhro/Omorphia@v1.1.6/dist/omorphia.min.css">

<script type="module">
  import * as Omorphia from 'https://cdn.jsdelivr.net/gh/aabhro/Omorphia@v1.1.6/dist/omorphia.esm.min.js';

  Omorphia.toast({
    title: 'Ready',
    description: 'Omorphia is loaded.',
    variant: 'success'
  });
</script>
~~~

</details>

<details>
  <summary><strong>Individual CSS modules</strong> · Load only the styles you need</summary>

~~~html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/aabhro/Omorphia@v1.1.6/dist/css/core.min.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/aabhro/Omorphia@v1.1.6/dist/css/button.min.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/aabhro/Omorphia@v1.1.6/dist/css/feedback.min.css">
~~~

The complete stylesheet is <code>dist/omorphia.min.css</code>. Generated integrity hashes are listed in <a href="dist/sri.json"><code>dist/sri.json</code></a>.

</details>

## Components

The stylesheet is split into focused modules.

| Module | Includes |
|---|---|
| <code>core</code> | Tokens, base styles, edge illumination |
| <code>button</code> | Buttons and button groups |
| <code>forms</code> | Inputs, textareas, selects, switches, ranges |
| <code>nav</code> | Breadcrumbs, navigation links, tabs, pagination |
| <code>feedback</code> | Tooltips, alerts, badges, status, progress, toasts |
| <code>containers</code> | Cards, avatars, dialogs, popovers, collapsibles |
| <code>advanced</code> | Command palette, search panels, side navigation |

### Buttons

<details>
  <summary><strong>Example markup</strong></summary>

~~~html
<ui-button variant="primary" icon="save">Save</ui-button>
<ui-button variant="secondary">Cancel</ui-button>
<ui-button variant="subtle" icon="ellipsis" label="More options"></ui-button>
~~~

Variants: <code>primary</code>, <code>secondary</code>, <code>subtle</code>, and <code>destructive</code>. Sizes: <code>sm</code>, <code>md</code>, and <code>lg</code>.

</details>

### Forms

<details>
  <summary><strong>Example markup</strong></summary>

~~~html
<div class="ui-field">
  <label class="ui-label" for="project-name">Project name</label>
  <div class="ui-input">
    <ui-icon name="folder"></ui-icon>
    <input id="project-name" placeholder="Untitled project">
  </div>
  <p class="ui-hint">Choose a name for this workspace.</p>
</div>
~~~

Textareas use <code>.ui-textarea</code>. Selects, checkboxes, radios, switches, and range inputs are also included.

</details>

### Navigation

<details>
  <summary><strong>Tabs, pagination, and dropdowns</strong></summary>

~~~html
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
~~~

Tabs support arrow keys, Home, and End. Dropdowns support arrow keys, Home, End, and type-ahead.

</details>

### Feedback and overlays

<details>
  <summary><strong>Toast and confirmation dialogs</strong></summary>

~~~js
Omorphia.toast({
  title: 'Changes saved',
  description: 'Your work is up to date.',
  variant: 'success'
});

const confirmed = await Omorphia.confirm({
  title: 'Delete project?',
  message: 'This action cannot be undone.',
  confirmLabel: 'Delete',
  destructive: true
});
~~~

Also included: <code>&lt;ui-tooltip&gt;</code>, <code>&lt;ui-modal&gt;</code>, <code>&lt;ui-popover&gt;</code>, and <code>&lt;ui-dropdown&gt;</code>.

</details>

### Command palette

Press <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>K</kbd> on Windows and Linux, or <kbd>⌘</kbd> + <kbd>Shift</kbd> + <kbd>K</kbd> on macOS. Chrome reserves <kbd>Ctrl</kbd> + <kbd>K</kbd> for its own search command, so a webpage cannot reliably capture it. The palette opens even when a form field has focus. Use the arrow keys to move, Enter to run, and Escape to close.

<details>
  <summary><strong>Register commands</strong></summary>

~~~js
Omorphia.commands.register([
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
~~~

Commands can be registered globally or on one palette. Declarative <code>&lt;ui-command&gt;</code> elements are supported too.

</details>

### Search and side navigation

<details>
  <summary><strong>Local search data</strong></summary>

~~~js
const search = document.querySelector('ui-search');

search.data = [
  { label: 'Apple', description: 'Fruit', icon: 'apple' },
  { label: 'Mango', description: 'Fruit', icon: 'leaf' }
];

search.addEventListener('ui-select', (event) => {
  console.log(event.detail.item);
});
~~~

Search supports local data, asynchronous sources, loading states, keyboard selection, and custom item rendering.

</details>

<details>
  <summary><strong>Responsive sidebar</strong></summary>

~~~html
<ui-sidebar heading="Workspace" collapsible breakpoint="768">
  <ui-sidebar-item icon="house" href="/" active>Home</ui-sidebar-item>
  <ui-sidebar-item icon="folder">Projects
    <ui-sidebar-item href="/atlas">Atlas</ui-sidebar-item>
    <ui-sidebar-item href="/meridian">Meridian</ui-sidebar-item>
  </ui-sidebar-item>
</ui-sidebar>
~~~

On narrow screens the sidebar becomes an off-canvas drawer. Nested groups, collapse, active states, and keyboard navigation are included.

</details>

## Illumination

Omorphia keeps its directional edge effect. A primary highlight begins near the top-left. A dimmer reflection sits near the bottom-right. The effect is masked into the border ring and is opt-in on generic surfaces.

<details>
  <summary><strong>Apply the effect</strong></summary>

~~~html
<div class="ui-edge" style="border-radius: 8px">
  A softly illuminated surface
</div>
~~~

</details>

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

## Theming

Dark is the default. Override variables on <code>:root</code> or scope them to any container.

<details>
  <summary><strong>Theme tokens</strong></summary>

~~~css
:root {
  --ui-bg: #0a0a0a;
  --ui-surface: #0a0a0a;
  --ui-overlay: #0a0a0a;
  --ui-text: #f5f5f5;
  --ui-accent: #f5f5f5;
  --ui-radius: 6px;
  --ui-font: "Geist", system-ui, sans-serif;
}
~~~

</details>

<details>
  <summary><strong>Switch themes</strong></summary>

~~~js
Omorphia.theme.set('dark');  // dark, light, or auto
Omorphia.theme.toggle();
~~~

Set <code>data-ui-theme="light"</code> on any section for a scoped light theme. Floating panels keep an opaque near-black surface.

</details>

## Browser support

Targets current Chrome, Edge, Safari 16.4+, and Firefox. Omorphia uses custom elements, <code>color-mix()</code>, CSS masks, <code>:has()</code>, and native dialogs. Floating panels use the Popover API where available and a fixed-position fallback elsewhere.

## Development

<details>
  <summary><strong><img src="assets/icons/terminal.svg" width="15" height="15" alt=""> Build and test locally</strong></summary>

~~~bash
git clone https://github.com/aabhro/Omorphia.git
cd Omorphia
npm install
npm run build
npm test
~~~

The showcase is <code>index.html</code>. Source styles are in <code>src/css/</code>, component logic is in <code>src/js/</code>, and showcase-specific wiring is in <code>showcase/</code>. The build regenerates the committed CDN bundles and integrity manifest.

</details>

## License

MIT. See <a href="LICENSE">LICENSE</a>.
