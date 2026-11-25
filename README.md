<div align="center">
  <img src="assets/omorphia-mark-preview.webp" width="64" height="64" alt="Omorphia mark">

  <h1>Omorphia</h1>
  <p><strong>A framework-free UI component library for the browser.</strong></p>
  <p>Native custom elements. Plain CSS. CDN-first delivery.</p>
  <p>
    <img src="https://img.shields.io/badge/version-1.4.0-111111?style=flat-square" alt="Version 1.4.0">
    <img src="https://img.shields.io/badge/framework-free-111111?style=flat-square" alt="Framework free">
    <img src="https://img.shields.io/badge/license-MIT-111111?style=flat-square" alt="MIT license">
  </p>
  <p><a href="https://aabhro.github.io/Omorphia/"><strong>Open the live demo ↗</strong></a></p>
</div>

<div align="center">
  <p>
    <a href="https://aabhro.github.io/Omorphia/">Live demo</a>
    &nbsp;·&nbsp;
    <a href="#overview"><img src="assets/icons/info.svg" width="14" height="14" alt=""> Overview</a>
    &nbsp;·&nbsp;
    <a href="#install-from-the-cdn"><img src="assets/icons/rocket.svg" width="14" height="14" alt=""> Installation</a>
    &nbsp;·&nbsp;
    <a href="#components"><img src="assets/icons/layers.svg" width="14" height="14" alt=""> Components</a>
    &nbsp;·&nbsp;
    <a href="#theming"><img src="assets/icons/palette.svg" width="14" height="14" alt=""> Theming</a>
    &nbsp;·&nbsp;
    <a href="#repository-map"><img src="assets/icons/terminal.svg" width="14" height="14" alt=""> Repository</a>
    &nbsp;·&nbsp;
    <a href="#quick-copy-ai-prompt">AI prompt</a>
  </p>
</div>


---

<h2 align="center" id="quick-copy-ai-prompt">Quick copy AI prompt</h2>

> [!IMPORTANT]
> **AI agents must read the repository instructions before they start.** This prompt is the quick entry point. The mandatory component inventory is in [`AI/COMPONENT-CATALOG.md`](AI/COMPONENT-CATALOG.md). The full workflow is in [`AGENTS.md`](AGENTS.md) and [`AI/AGENT-PROMPT.md`](AI/AGENT-PROMPT.md).

Copy the prompt below into your AI coding agent. Use the code block copy control. It directs the agent to both Omorphia and the Modernimal design system.

~~~text
You are my product designer and engineering agent. I am building or improving an interface with Omorphia.

Omorphia repository: https://github.com/aabhro/Omorphia
Use this exact repository as the source of truth. Inspect its README, AGENTS.md, AI/AGENT-PROMPT.md, source, tests, and build configuration before making changes.

MANDATORY BEFORE YOU CODE:
0. Read AI/COMPONENT-CATALOG.md in full. It is the verified inventory of Omorphia's real elements, attributes, events, methods, slots, and CSS primitives.
1. Read the complete Omorphia AGENTS.md and AI/AGENT-PROMPT.md. Follow them as required project instructions.
2. Inspect the existing project, its architecture, features, dependencies, source files, and tests before proposing changes.
3. Read the full Modernimal Stylesheet from https://github.com/aabhro/Stylesheets/blob/main/Styles/Modernimal%20Stylesheet.md. Do not rely on summaries.
4. Inspect https://github.com/aabhro/Stylesheets/blob/main/Components/Modernimal.html before creating UI components.
5. Read the Stylesheets motion/README.md, motion/SKILL.md, motion/catalog.md, motion/tokens.css, motion/patterns.css, and motion/motion.js. Use motion/demo.html to verify patterns when needed. These references are mandatory, not optional inspiration.

COMPONENT-FIRST RULE (NON-NEGOTIABLE):
Before writing UI markup, read AI/COMPONENT-CATALOG.md in full and map every interactive requirement to an exact custom Omorphia element. Inspect its source in src/js/ and styles in src/css/, then follow the matching index.html example. **Do not author raw <button>, <input>, <textarea>, <select>, <option>, or <details> controls in new application UI.** Use ui-button, ui-input, ui-textarea, ui-select/ui-option, ui-checkbox, ui-radio, ui-switch, ui-range, ui-date-picker, ui-time-picker, ui-menu-item, ui-drawer, ui-accordion/ui-accordion-item, and the existing overlay/navigation components. Do not guess tag names, attributes, methods, events, or slots. Do not make home-made Button, Modal, Dropdown, Tabs, Search, Toast, Sidebar, Drawer, Select, or DatePicker replacements. CSS classes such as .ui-card and .ui-alert are static content patterns, not interactive control substitutes. If no built-in match exists, mark it NO BUILT-IN COMPONENT and explain the exact gap before proposing custom UI. Before delivery, audit every custom tag and authored control against the catalog and source.

OVERLAYS AND MOTION:
Do not add borders or outlines to menus, dropdowns, popovers, command/search panels, tooltips, drawers, or date/time panels. Keep them opaque and theme-aware through `--ui-overlay` and `--ui-overlay-text`. Reuse Omorphia's trigger-to-panel morph and accordion height transition. Respect prefers-reduced-motion.

DESIGN CHOICE:
For a new app, meaningful UI feature, or substantial redesign, first ask which direction to use unless I have already specified it: Modernimal (recommended), another named style from my Stylesheets repository, the existing project style, or a custom direction based on my references. Summarize the proposed design and ask what I want changed. Wait for approval before substantial implementation. For a focused bug fix or documentation-only task, preserve the existing style and do not ask unnecessary questions.

WHEN MODERNIMAL IS SELECTED:
Use its near-black editorial direction, approved neutral palette, restrained surfaces, readable typography, custom controls, accessible interactions, and purposeful motion. Keep floating menu and overlay surfaces opaque and theme-aware through `--ui-overlay` and `--ui-overlay-text`. Preserve the mandatory component and motion references. Ask me to approve an app accent color before building a Modernimal-based app, and make that accent editable later. Do not apply app-level accent settings to Omorphia library defaults unless I explicitly ask.

OMORPHIA RULES:
Preserve the framework-free, CDN-first architecture and native custom-element API. Keep the top-left / bottom-right directional edge illumination. In the Omorphia repository, edit src/ as the source of truth, never hand-edit generated dist/ bundles, and use the existing build script. Preserve the public API, themes, accessibility, keyboard behavior, reduced motion, and responsive layouts. Reuse existing components before inventing new ones.

VERIFY:
Inspect the final diff. Run npm run build and npm test when working in the Omorphia repository, plus relevant checks for the target app. Report exactly what was tested and disclose anything you could not verify. Never claim success without evidence.

The [Stylesheets repository](https://github.com/aabhro/Stylesheets) is public. Agents can inspect every linked reference directly. For complete local access, run `git clone --depth 1 https://github.com/aabhro/Stylesheets.git /tmp/aabhro-Stylesheets`. No special permissions or prior checkout are required.
~~~

For the component inventory and agent setup, see [`AI/COMPONENT-CATALOG.md`](AI/COMPONENT-CATALOG.md), [`AGENTS.md`](AGENTS.md), and [`AI/AGENT-PROMPT.md`](AI/AGENT-PROMPT.md). Modernimal lives in the separate [Stylesheets repository](https://github.com/aabhro/Stylesheets).

<h2 align="center" id="overview"><img src="assets/icons/info.svg" width="18" height="18" alt="">&nbsp; Overview</h2>

Omorphia is a small UI system for websites and web applications. It combines native custom elements, browser APIs, and plain CSS without requiring a framework or runtime package manager.

Load the stylesheet and script, then use the components directly in your markup. The elements register when the script loads, including elements added later.

| Foundation | What it provides |
|:--|:--|
| **Custom elements** | Buttons, forms, navigation, overlays, search, sidebars, and more |
| **Browser-native behavior** | Semantic controls, keyboard interaction, and accessible states |
| **Design tokens** | Shared CSS variables with global and scoped theme overrides |
| **Built-in icons** | A bundled Lucide icon set |
| **Modular CSS** | A complete stylesheet or focused modules |
| **Directional illumination** | A subtle top-left highlight and dimmer bottom-right reflection on selected edges |

<div align="center">

[**Open the live demo**](https://aabhro.github.io/Omorphia/) · [Showcase source](index.html) · [Source styles](src/css/) · [Component logic](src/js/)

</div>

<h2 align="center" id="install-from-the-cdn"><img src="assets/icons/rocket.svg" width="18" height="18" alt="">&nbsp; Install from the CDN</h2>

Omorphia is published through jsDelivr. The browser loads the library directly from this repository. No copied library files or build step are required in the consuming project.

### Classic script

<details>
  <summary><strong>HTML installation</strong></summary>

Use the classic bundle when you want the global <code>Omorphia</code> API.

~~~html
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/gh/aabhro/Omorphia@v1.4.0/dist/omorphia.min.css"
>

<script src="https://cdn.jsdelivr.net/gh/aabhro/Omorphia@v1.4.0/dist/omorphia.min.js"></script>

<ui-button variant="primary" icon="save">Save changes</ui-button>
<ui-command-palette></ui-command-palette>

<script>
  Omorphia.toast({
    title: 'Ready',
    description: 'Omorphia is loaded.',
    variant: 'success'
  });
</script>
~~~

</details>

### ES module

<details>
  <summary><strong>Import the complete API</strong></summary>

Load the stylesheet separately, then import the module in the browser.

~~~html
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/gh/aabhro/Omorphia@v1.4.0/dist/omorphia.min.css"
>

<script type="module">
  import * as Omorphia from 'https://cdn.jsdelivr.net/gh/aabhro/Omorphia@v1.4.0/dist/omorphia.esm.min.js';

  Omorphia.toast({
    title: 'Ready',
    description: 'Omorphia is loaded.',
    variant: 'success'
  });
</script>
~~~

</details>

### Individual CSS modules

<details>
  <summary><strong>Load only the styles you need</strong></summary>

Load <code>core.min.css</code> first. It contains the design tokens, base styles, and edge effect. Add the modules required by your interface.

~~~html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/aabhro/Omorphia@v1.4.0/dist/css/core.min.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/aabhro/Omorphia@v1.4.0/dist/css/button.min.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/aabhro/Omorphia@v1.4.0/dist/css/forms.min.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/aabhro/Omorphia@v1.4.0/dist/css/feedback.min.css">
~~~

Available modules: <code>button</code>, <code>forms</code>, <code>nav</code>, <code>feedback</code>, <code>containers</code>, <code>advanced</code>, and <code>overlays</code>.

The complete stylesheet is <a href="dist/omorphia.min.css"><code>dist/omorphia.min.css</code></a>. Integrity hashes for the published bundles are in <a href="dist/sri.json"><code>dist/sri.json</code></a>.

</details>

### Versioning and network requirements

- **Development:** use the <code>@main</code> URLs to follow the current default branch.
- **Production:** pin an exact release tag, such as <code>@v1.4.0</code>, so deployed projects use a known revision.
- **Online requirement:** the browser must be able to reach <code>cdn.jsdelivr.net</code>. CDN imports do not work offline unless the project deliberately hosts the files locally.
- **Content Security Policy:** allow <code>https://cdn.jsdelivr.net</code> in the relevant <code>style-src</code> and <code>script-src</code> directives.
- **ES modules:** load the module in the browser runtime. Keep browser-only imports out of server-side rendering entry points.

<h2 align="center" id="components"><img src="assets/icons/layers.svg" width="18" height="18" alt=""> Components</h2>

The stylesheet is split into focused modules. The JavaScript bundle registers the corresponding custom elements and exposes the public API.

| Module | Includes |
|:--|:--|
| <code>core</code> | Design tokens, base styles, and directional illumination |
| <code>button</code> | Buttons and button groups |
| <code>forms</code> | Custom input, textarea, select, checkbox, radio, switch, and range elements |
| <code>nav</code> | Breadcrumbs, navigation links, tabs, and pagination |
| <code>feedback</code> | Tooltips, alerts, badges, status, progress, and toasts |
| <code>containers</code> | Cards, avatars, dialogs, popovers, dropdowns, drawers, and animated accordions |
| <code>advanced</code> | Command palette, search, date/time pickers, and side navigation |
| <code>advanced-components</code> | File upload, color picker, combobox, multi-select, number and OTP inputs, rich text, data table, tree, split panel, stepper, timeline, rating, skeleton, empty state, and tour |

### Advanced components

These elements are registered in the main JavaScript bundle and styled by the full CSS bundle. A focused <code>advanced-components</code> CSS module is available for modular installs.

<details><summary><strong>Files, colors, and selection</strong></summary>

```html
<ui-file-upload name="attachments" accept=".pdf,image/*" multiple max-files="5" max-size="5242880"></ui-file-upload>
<ui-color-picker name="brand-color" value="#b58bbf" alpha></ui-color-picker>
<ui-combobox name="environment" placeholder="Search environments" allow-create></ui-combobox>
<ui-multi-select name="members"><ui-option value="ada" group="Engineering">Ada Lovelace</ui-option></ui-multi-select>
<ui-number-input name="quantity" value="2" min="0" max="25" step="0.25" precision="2"></ui-number-input>
<ui-otp-input name="verification-code" length="6" autocomplete="one-time-code"></ui-otp-input>
```

<code>ui-file-upload</code> exposes selected File objects through <code>.files</code> and validates type, byte size, and count. It selects local files only. It does not send them to a server. Your application handles the actual upload.

<code>ui-color-picker</code> supports hue, saturation/lightness, alpha, presets, and hex input. Read <code>.value</code> as hex and <code>.color</code> as CSS color text.

<code>ui-combobox</code> accepts local <code>.data</code> or an async <code>.source(query, signal)</code> function. It supports value creation and abortable requests.

<code>ui-multi-select</code> extends <code>ui-select</code> with array values, grouped options, and removable tags. The existing <code>ui-select multiple</code> API remains supported.

<code>ui-number-input</code> supports bounds, step, and decimal precision. <code>ui-otp-input</code> supports segmented entry, paste, masking, and keyboard navigation.

</details>

<details><summary><strong>Data, layout, and workflows</strong></summary>

```html
<ui-data-table id="projects" page-size="10" sortable selectable></ui-data-table>
<ui-tree-view id="files" selectable multiple drag-drop></ui-tree-view>
<ui-split-panel direction="horizontal" sizes="40,60" storage-key="workspace"><aside slot="start">Navigation</aside><main slot="end">Content</main></ui-split-panel>
<ui-stepper linear><ui-step label="Details" value="details">Details</ui-step><ui-step label="Review" value="review">Review</ui-step></ui-stepper>
<ui-timeline><ui-timeline-item title="Created" time="09:30" status="complete">Workspace created.</ui-timeline-item></ui-timeline>
```

Set table rows and columns with <code>.data</code> and <code>.columns</code>. The table supports filtering, sorting, pagination, column visibility, and row selection. Tree nodes are nested objects with <code>id</code>, <code>label</code>, and optional <code>children</code>. The tree supports expansion, keyboard navigation, selection, and drag/drop reparenting.

The split panel supports pointer and keyboard resizing. A <code>storage-key</code> persists its ratio locally. The stepper supports linear progression and cancellable <code>ui-before-next</code> validation. Timeline items accept title, time, status, icon, and descriptive child content.

</details>

<details><summary><strong>Feedback, editing, and onboarding</strong></summary>

```html
<ui-rating value="3.5" max="5" allow-half show-value></ui-rating>
<ui-skeleton variant="text" lines="3"></ui-skeleton>
<ui-empty-state icon="folder" title="No projects yet" description="Create a project to get started."><ui-button>Create project</ui-button></ui-empty-state>
<ui-rich-text-editor name="description" placeholder="Write a description"></ui-rich-text-editor>
<ui-tour id="onboarding"></ui-tour>
```

<code>ui-rating</code> supports numeric, star, and half-star values. <code>ui-skeleton</code> supports text, avatar, and image placeholders. <code>ui-empty-state</code> provides a reusable description and action region.

<code>ui-rich-text-editor</code> provides formatting, headings, lists, links, and Ctrl/⌘ B/I/U shortcuts. Its HTML value is sanitized to an allowlist of semantic tags and safe link protocols. Sanitize again on the server before storing or publishing user content.

Set <code>tour.steps</code> to selector/title/description objects, then call <code>.start()</code>. Use <code>.nextStep()</code>, <code>.previous()</code>, and <code>.end()</code> to control the guided walkthrough.

</details>
### Buttons

<details>
  <summary><strong>Markup and variants</strong></summary>

~~~html
<ui-button variant="primary" icon="save">Save</ui-button>
<ui-button variant="secondary">Cancel</ui-button>
<ui-button variant="subtle" icon="ellipsis" label="More options"></ui-button>
~~~

Variants: <code>primary</code>, <code>secondary</code>, <code>subtle</code>, and <code>destructive</code>. Sizes: <code>sm</code>, <code>md</code>, and <code>lg</code>.

</details>

### Forms

<details>
  <summary><strong>Custom field and choice examples</strong></summary>

~~~html
<div class="ui-field">
  <span class="ui-label">Project name</span>
  <ui-input name="project-name" label="Project name" icon="folder" placeholder="Untitled project"></ui-input>
  <p class="ui-hint">Choose a name for this workspace.</p>
</div>

<ui-textarea name="notes" label="Notes" rows="4" placeholder="Write a note…"></ui-textarea>
<ui-checkbox name="updates" value="deploys" label="Email me about deploys" checked></ui-checkbox>
<ui-radio name="plan" value="starter" label="Starter" checked></ui-radio>
<ui-radio name="plan" value="team" label="Team"></ui-radio>
<ui-switch name="auto-deploy" value="yes" label="Auto-deploy" checked></ui-switch>
<ui-range name="volume" label="Volume" min="0" max="100" step="5" value="40"></ui-range>
~~~

Use `value`, `disabled`, `required`, and the documented attributes on the custom element. Listen for `ui-input` while changing and `ui-change` when committed. Do not author raw native form controls in new interface markup.

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
  <ui-button slot="trigger" icon-end="chevron-down">Actions</ui-button>
  <ui-menu-item value="rename" label="Rename" icon="pencil"></ui-menu-item>
  <ui-menu-item value="duplicate" label="Duplicate" icon="copy"></ui-menu-item>
</ui-dropdown>
~~~

Dropdowns support arrow keys, Home, End, type-ahead, and custom menu rows. Use `ui-menu-item` rather than raw native menu buttons.

</details>

### Feedback and dialogs

<details>
  <summary><strong>Toast and confirmation</strong></summary>

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

Also available: <code>&lt;ui-tooltip&gt;</code>, <code>&lt;ui-modal&gt;</code>, <code>&lt;ui-popover&gt;</code>, and <code>&lt;ui-dropdown&gt;</code>.

</details>

### Date and time pickers

<details>
<summary>Example</summary>

~~~html
<ui-date-picker name="release-date" label="Release date" value="2026-11-20"></ui-date-picker>
<ui-time-picker name="maintenance-time" label="Maintenance time" value="14:30" format="12h" step="5"></ui-time-picker>
~~~

</details>

Both pickers render custom interactive panels and store predictable values. Dates use `YYYY-MM-DD`. Times use 24-hour `HH:MM` values even when displayed in 12-hour format.

### Drawer and accordion

<details>
<summary>Example</summary>

~~~html
<ui-drawer id="settings" heading="Settings" placement="right" size="md">
  <ui-input name="project" label="Project name"></ui-input>
  <div slot="footer">
    <ui-button variant="subtle" onclick="document.getElementById('settings').close()">Cancel</ui-button>
    <ui-button variant="primary">Save</ui-button>
  </div>
</ui-drawer>

<ui-accordion>
  <ui-accordion-item heading="Overview" value="overview" open>Overview details.</ui-accordion-item>
  <ui-accordion-item heading="Advanced" value="advanced">Advanced details.</ui-accordion-item>
</ui-accordion>
~~~

</details>

The drawer handles focus, Escape, backdrop dismissal, scroll locking, and focus restoration. Accordions use smooth height morphing and support single or multiple open panels.

### Command palette

The default shortcut is <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>K</kbd> on Windows and Linux, or <kbd>⌘</kbd> + <kbd>Shift</kbd> + <kbd>K</kbd> on macOS. The palette can open while a form field has focus.

Use the arrow keys to move through results, Enter to run a command, and Escape to close.

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

Commands can be registered globally or on an individual palette. Declarative <code>&lt;ui-command&gt;</code> elements are supported too.

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

Search also supports asynchronous sources, loading states, keyboard selection, and custom item rendering.

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

<h2 align="center" id="illumination"><img src="assets/icons/sun.svg" width="18" height="18" alt=""> Directional illumination</h2>

Omorphia keeps its signature edge treatment. A soft highlight begins near the top-left. A dimmer reflection sits near the bottom-right. Both are masked into the border ring, following the component radius.

The effect is available on supported components and can be added to a custom surface with <code>.ui-edge</code>.

<details>
  <summary><strong>Apply illumination to a surface</strong></summary>

~~~html
<div class="ui-edge" style="border-radius: 8px">
  An illuminated surface
</div>
~~~

</details>

| Variable | Default | Purpose |
|:--|:--:|:--|
| <code>--ui-edge-tl-alpha</code> | <code>.5</code> | Top-left strength |
| <code>--ui-edge-br-alpha</code> | <code>.14</code> | Bottom-right strength |
| <code>--ui-edge-tl-reach</code> | <code>52%</code> | Top-left reach |
| <code>--ui-edge-br-reach</code> | <code>42%</code> | Bottom-right reach |
| <code>--ui-edge-base-alpha</code> | <code>.05</code> | Resting edge strength |
| <code>--ui-edge-width</code> | <code>1px</code> | Ring thickness |
| <code>--ui-edge-intensity</code> | <code>1</code> | Overall intensity |
| <code>--ui-edge-hover-boost</code> | <code>1.45</code> | Interactive hover multiplier |

Modifiers: <code>ui-edge--soft</code>, <code>ui-edge--strong</code>, <code>ui-edge--accent</code>, <code>ui-edge--none</code>, and <code>ui-edge--animated</code>. Animated edges respect <code>prefers-reduced-motion</code>.

<h2 align="center" id="theming"><img src="assets/icons/palette.svg" width="18" height="18" alt=""> Theming</h2>

Dark is the default. Override the <code>--ui-*</code> variables on <code>:root</code> or scope them to a component or section.

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

Set <code>data-ui-theme="light"</code> on any section for a scoped light theme. Floating panels use opaque theme-aware surfaces. Open portalled panels also update when their theme changes.

</details>

<h2 align="center" id="overlay-effects">Page bottom fade</h2>

Use one fixed gradient overlay to fade the entire page at the bottom of the viewport. It is not a text mask. It stays above page content, uses the active theme background, and never blocks clicks.

<details>
  <summary><strong>Viewport fade element</strong></summary>

~~~html
<div class="ui-page-fade" aria-hidden="true"></div>
~~~

</details>

Place it once inside the content region it should cover. For layouts with a fixed sidebar, keep it inside the main content region and set <code>--ui-page-fade-left</code> to the sidebar width. Adjust its height with <code>--ui-page-fade-height</code> (default <code>144px</code>). Load <code>overlays.min.css</code> after <code>core.min.css</code> when using individual CSS modules.

<h2 align="center" id="repository-map"><img src="assets/icons/terminal.svg" width="18" height="18" alt=""> Repository map</h2>

| Path | Purpose |
|:--|:--|
| [index.html](index.html) | Component showcase · [Live demo](https://aabhro.github.io/Omorphia/) |
| [assets/omorphia-mark-preview.webp](assets/omorphia-mark-preview.webp) | Generated white logo preview |
| [src/css/](src/css/) | Source tokens, base styles, modules, and illumination |
| [src/js/](src/js/) | Custom elements, icon system, and public API |
| [dist/](dist/) | CDN-ready CSS and JavaScript bundles |
| [dist/css/](dist/css/) | Individual minified CSS modules |
| [dist/esm/](dist/esm/) | Individual ES module components |
| [showcase/](showcase/) | Showcase-specific styles and behavior |
| [tests/](tests/) | Smoke tests and showcase checks |
| [scripts/](scripts/) | Build and icon generation scripts |
| [assets/](assets/) | Logo and README icons |
| [LICENSE](LICENSE) | MIT license |

<h2 align="center" id="browser-support"><img src="assets/icons/info.svg" width="18" height="18" alt=""> Browser support</h2>

Targets current Chrome, Edge, Safari 16.4+, and Firefox. Omorphia uses custom elements, <code>color-mix()</code>, CSS masks, <code>:has()</code>, and native dialogs. Floating panels use the Popover API where available, with a fixed-position fallback.

<h2 align="center" id="development"><img src="assets/icons/terminal.svg" width="18" height="18" alt=""> Development</h2>

<details>
  <summary><strong>Build and test locally</strong></summary>

~~~bash
git clone https://github.com/aabhro/Omorphia.git
cd Omorphia
npm install
npm run build
npm test
~~~

The build regenerates the committed CDN bundles and integrity manifest. Source CSS is in <code>src/css/</code>, component logic is in <code>src/js/</code>, and showcase-specific wiring is in <code>showcase/</code>.

</details>

<h2 align="center" id="license">License</h2>

MIT. See <a href="LICENSE">LICENSE</a>.

---

<div align="center">
  <img src="assets/logo.svg" width="22" height="22" alt="Omorphia mark"><br>
  <strong>Omorphia</strong><br>
  <sub>A small, considered foundation for browser interfaces.</sub>
</div>


## TypeScript

The package includes declarations at `types/index.d.ts`, including tag mappings for the registered custom elements.

## Visual regression checks

The Playwright suite captures the main showcase, advanced components, picker surfaces, nested popovers, and mobile layout. It checks floating-surface geometry, stacking, theme rendering, guided tours, and page overflow. CI uploads screenshots as an artifact.

Run locally with:

```sh
npm install --no-save --package-lock=false playwright@1.56.1 typescript@5.9.3
npx playwright install chromium
npm run test:types
npm run test:visual
```
