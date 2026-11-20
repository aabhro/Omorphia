# Edgelit

Dependency-free UI components and a stylesheet for any website, served from a CDN. One CSS file, one JS file, native custom elements, Lucide icons built in — and a signature **border illumination**: light that catches the top-left edge of every surface and fades away, with a dimmer reflection at the bottom-right.

- **No build step for users.** Two tags, no npm, no cloning.
- **Vanilla everything.** Semantic HTML, modern CSS, native Web Components, about 15 kB gzipped JS (76 icons included) and 9 kB gzipped CSS.
- **Accessible.** Real `<button>`, `<dialog>`, `<details>`; ARIA roles, roving focus, keyboard support, `prefers-reduced-motion`.
- **Themeable.** Dark by default, light and auto modes, every colour/radius/duration is a CSS variable.
- **Safe to drop in.** Every class is `ui-` prefixed, no bare-element selectors, no global resets.

**Live showcase:** `https://aabhro.github.io/edgelit/`

## Quick start

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/aabhro/edgelit@v1.0.0/dist/edgelit.min.css">
<script src="https://cdn.jsdelivr.net/gh/aabhro/edgelit@v1.0.0/dist/edgelit.min.js"></script>

<ui-button variant="primary" icon="save">Save changes</ui-button>
<ui-tooltip content="Copy to clipboard"><ui-button icon="copy">Copy</ui-button></ui-tooltip>
<ui-command-palette></ui-command-palette>   <!-- Ctrl K / ⌘K -->
```

Custom elements upgrade automatically, including ones inserted later with `innerHTML` or `appendChild`. Add `data-ui-theme="dark | light | auto"` to `<html>` (or any container). Dark is the default.

### Pin a version

Always use an exact version in production. It maps to a Git tag (`v1.0.0`), and jsDelivr caches it permanently.

| Style | URL |
|---|---|
| Exact (recommended) | `https://cdn.jsdelivr.net/gh/aabhro/edgelit@v1.0.0/dist/edgelit.min.css` |
| Latest 1.x patch | `…/edgelit@v1.0/dist/…` or `…@v1/dist/…` (convenient, not immutable) |
| Branch (development only) | `…/edgelit@main/dist/…` (cached up to 12 h) |

Subresource Integrity hashes for each release are in [`dist/sri.json`](dist/sri.json):

```html
<script src="…/edgelit@v1.0.0/dist/edgelit.min.js" integrity="sha384-…" crossorigin="anonymous"></script>
```

Other GitHub-backed CDNs serve the same files:

```
https://raw.githack.com/aabhro/edgelit/v1.0.0/dist/edgelit.min.js
https://cdn.statically.io/gh/aabhro/edgelit/v1.0.0/dist/edgelit.min.js
https://aabhro.github.io/edgelit/dist/edgelit.min.js      (GitHub Pages)
```

If you publish to npm, `https://cdn.jsdelivr.net/npm/edgelit@1.0.0/dist/edgelit.min.js` also works.

### Files

| File | Use |
|---|---|
| `dist/edgelit.min.css` / `edgelit.css` | Complete stylesheet (minified / readable) |
| `dist/edgelit.min.js` / `edgelit.js` | Classic script, defines the global `Edgelit` |
| `dist/edgelit.esm.min.js` / `edgelit.esm.js` | ES module bundle |
| `dist/css/core.min.css` + `dist/css/<module>.min.css` | Modular CSS: `core` (tokens, base, illumination) plus `button`, `forms`, `nav`, `feedback`, `containers`, `advanced` |
| `dist/esm/components/<name>.js` | One ES module per component, with shared chunks |

### ES modules and individual components

```html
<link rel="stylesheet" href="…/dist/css/core.min.css">
<link rel="stylesheet" href="…/dist/css/button.min.css">
<link rel="stylesheet" href="…/dist/css/feedback.min.css">
<script type="module">
  import { toast } from 'https://cdn.jsdelivr.net/gh/aabhro/edgelit@v1.0.0/dist/esm/components/toast.js';
  import 'https://cdn.jsdelivr.net/gh/aabhro/edgelit@v1.0.0/dist/esm/components/button.js'; // registers <ui-button>
  toast({ title: 'Loaded only what I need', variant: 'success' });
</script>
```

Or everything as a module: `import { toast, theme } from '…/dist/edgelit.esm.min.js'`.

Component modules: `button`, `tooltip`, `toast`, `modal`, `popover` (popover + dropdown), `tabs`, `pagination`, `command-palette`, `search`, `sidebar`, plus `icons`. Pair each with the CSS modules listed in its section below.

## Components

CSS-only components work with just the stylesheet. Custom elements need the script.

### Buttons — `<ui-button>` or `.ui-btn`
CSS: `button`. Attributes: `variant` (`primary` `secondary` `subtle` `destructive`), `size` (`sm` `md` `lg`), `icon`, `icon-end` (Lucide name), `loading`, `disabled`, `type`, `label` (required when there's no text), `block`. Properties: `loading`, `disabled`. Methods: `focus()`, `click()`. Native forms work: a `type="submit"` button submits its form.
Classes: `ui-btn ui-btn--primary|secondary|subtle|destructive`, `ui-btn--sm|lg|icon`, `is-loading`, `ui-btn-group`.

### Inputs
CSS: `forms`. Text controls are wrappers so the illumination follows their shape:

```html
<div class="ui-field" data-state="error">  <!-- error | success -->
  <label class="ui-label" for="e">Email</label>
  <div class="ui-input"><ui-icon name="mail"></ui-icon><input id="e" aria-invalid="true"></div>
  <p class="ui-hint">Used for receipts.</p><p class="ui-error-text">Enter a valid email.</p>
</div>
```
Also `.ui-textarea`, `.ui-select`, `.ui-check` / `.ui-radio` (`.ui-check-input`, `.ui-radio-input`), `.ui-switch` (`.ui-switch-input` + `.ui-switch-track`), `.ui-range` (set `--_pct` for the filled track), sizes `.ui-input--sm|lg`. `.ui-search` is below.

### Navigation
CSS: `nav`. `.ui-crumbs` / `.ui-crumb` breadcrumbs, `.ui-nav` / `.ui-nav-link`, side navigation (see Sidebar).

| Element | Attributes | Events / API |
|---|---|---|
| `<ui-tabs>` containing `<ui-tab label value icon disabled>` | `value` | `ui-change {value, tab}`, `.value`, `.select(v)`; ←/→/Home/End |
| `<ui-pagination>` | `total`, `page`, `siblings`, `label` | `ui-change {page}`, `.page` |
| `<ui-dropdown>` (first child or `slot="trigger"` is the trigger; `<button>`, `<a>`, `<hr>` become items) | `placement` | `ui-select {item, value}` (`data-value` or text), `ui-open`, `ui-close`, `.show()` `.hide()` `.toggle()`; ↑/↓/Home/End/type-ahead |

### Feedback and information
CSS: `feedback`.
- `<ui-tooltip content placement delay>` wraps its target; shows on hover and focus, `Esc` dismisses, wires `aria-describedby`.
- `Edgelit.toast({ title, description, variant, duration, action })` → `{ dismiss }`. Variants: `success` `danger` `warning` `info` `neutral`. `duration: 0` keeps it open. Pauses on hover. Position: `Edgelit.config.toastPosition = 'top-right'` (`top|bottom-left|center|right`).
- `.ui-alert ui-alert--info|success|warning|danger`, `.ui-badge ui-badge--accent|success|warning|danger|info`, `.ui-status ui-status--online|away|busy|live`, `.ui-progress` (set `--value: 0–100`; `ui-progress--indeterminate`), `.ui-spinner`, `.ui-skeleton` (`--circle`, `--title`, `--block`).

### Containers and layout
CSS: `containers`, `base`. `.ui-card` (+ `-header`, `-body`, `-footer`, `ui-card--interactive`), `.ui-divider` (optionally labelled, `--vertical`), `.ui-avatar` (`--sm|lg|xl|square`, `data-status`), `.ui-avatar-group`, `details.ui-collapsible > summary.ui-summary`, layout utilities `.ui-stack`, `.ui-row`, `.ui-grid`, `.ui-container`, `.ui-gap-1…6`.

- `<ui-modal heading size="sm|lg" persistent open>` — body is the content; `<div slot="footer">` holds actions. Built on `<dialog>` (focus trap, `Esc`, inert background). API: `.show()` `.close(value)` `.toggle()`, `.open`. Events: `ui-open`, `ui-before-close` (cancelable), `ui-close {returnValue}`.
- `Edgelit.confirm({ title, message, confirmLabel, cancelLabel, destructive })` → `Promise<boolean>`.
- `<ui-popover placement>` — same trigger convention as the dropdown; arbitrary content; `.show()` `.hide()`, `ui-open`, `ui-close`.

### Command palette — `<ui-command-palette>`
CSS: `advanced`. Opens with **Ctrl+K** and **⌘K**, closes with `Esc`, ↑/↓ navigate, `Enter` runs. Fuzzy search with highlighted matches, a no-commands state and a no-results state. Attributes: `hotkey` (default `mod+k`), `placeholder`.

```js
Edgelit.commands.register([        // global — every palette sees these
  { id: 'new', label: 'New project', group: 'Actions', icon: 'plus', shortcut: 'N', onSelect: (cmd) => createProject() },
  { id: 'docs', label: 'Documentation', group: 'Links', icon: 'book-open', href: '/docs', keywords: ['help'] },
]);
document.querySelector('ui-command-palette').register({ label: 'Only on this palette', onSelect() {} });
```
Declarative: `<ui-command label="Go home" href="/" group="Navigate" icon="house" shortcut="G H" onselect="…">` inside the palette. A command is `{ id, label, group?, description?, icon?, keywords?, shortcut?, href?, target?, onSelect?, disabled? }`. Methods: `open()` `close()` `toggle()`. Events: `ui-open`, `ui-close`, `ui-command {command}`. `Edgelit.commands.unregister(id)`, `.list()`, `.clear()`.

### Search — `<ui-search>`
CSS: `forms` + `advanced`. Attributes: `placeholder`, `value`, `name`, `label`, `autocomplete` (enable suggestions), `min-chars` (1), `debounce` (150), `max` (8), `loading`, `empty-text`, `loading-text`.

```js
const s = document.querySelector('ui-search');
s.data = ['Apple', { label: 'Mango', description: 'Fruit', icon: 'star', keywords: ['tropical'] }]; // local filtering
s.suggestions = ['Mango'];                                          // shown when the field is empty and focused
s.source = async (query, signal) => (await fetch(`/api?q=${query}`, { signal })).json(); // async; stale requests aborted
s.renderItem = (item, { query }) => { const b = document.createElement('b'); b.textContent = item.label; return b; };
s.addEventListener('ui-select', (e) => console.log(e.detail.item));
```
Events: `ui-input {value}`, `ui-select {item, value}`, `ui-submit {value}`, `ui-clear`. Keys: ↑/↓, `Enter`, `Esc` closes then clears, `Tab`. Has a clear button, loading spinner, empty and error states. `renderItem` must return a Node or plain text (never HTML strings).

### Side menu — `<ui-sidebar>`
CSS: `advanced`.

```html
<ui-sidebar id="nav" heading="Acme" collapsible width="260px" breakpoint="768">
  <ui-sidebar-item icon="house" href="/" active>Home</ui-sidebar-item>
  <ui-sidebar-item icon="folder" expanded>Projects
    <ui-sidebar-item href="/a">Atlas</ui-sidebar-item>
  </ui-sidebar-item>
  <div slot="footer">…</div>
</ui-sidebar>
<ui-button data-ui-toggle="#nav" icon="menu" label="Menu"></ui-button>
```
Attributes: `collapsed`, `collapsible` (adds a collapse button), `width` (or `--ui-sidebar-width`), `position="left|right"`, `fixed` (pin to the viewport edge), `breakpoint` (px, default 768; below it the sidebar is an off-canvas drawer with scrim, `open` attribute), `heading`, `label`. Items: `icon`, `href`, `active`, `expanded`, `disabled`, nested items make a group. Methods: `toggle()` `collapse()` `expand()` `openMobile()` `closeMobile()`. Events: `ui-select {item, href}` (cancelable), `ui-toggle {collapsed, open}`. Keys: ↑/↓/Home/End, →/← expand or collapse groups. Collapsed mode shows icons with `title` tooltips. Tune with `--ui-sidebar-width`, `--ui-sidebar-collapsed-width`, `--ui-sidebar-radius`.

### Icons
Lucide icons are bundled (76 common ones) so they render with no extra request: `<ui-icon name="search" size="20" stroke="1.5" label="Search">`. Any other Lucide icon name loads automatically from jsDelivr on first use. Use `Edgelit.icons.register('brand', '<path d="…"/>')` for your own, `Edgelit.icons.has(name)`, and `Edgelit.icon(name, size)` to create elements. Icons inherit `currentColor`; size with `--ui-icon-size`.

## Border illumination

Add `ui-edge` to any element, or use any built-in component. The effect is a masked gradient painted only in the border ring (a 1px `::before`), so it follows `border-radius` and never creates a full outline or glow.

```html
<div class="ui-edge" style="border-radius:16px; --ui-edge-tl-alpha:.6; --ui-edge-tl-reach:60%">…</div>
```

| Variable | Default (dark) | Meaning |
|---|---|---|
| `--ui-edge-color` | `#fff` | Light colour (dark ink in light theme) |
| `--ui-edge-tl-alpha` | `0.5` | Top-left light strength |
| `--ui-edge-br-alpha` | `0.14` | Bottom-right light strength (keep dimmer) |
| `--ui-edge-tl-reach` / `--ui-edge-br-reach` | `52%` / `42%` | How far each light travels along the edges |
| `--ui-edge-base-alpha` | `0.05` | Faint resting edge; `0` removes it |
| `--ui-edge-width` | `1px` | Ring thickness |
| `--ui-edge-intensity` | `1` | Multiplier for both lights |
| `--ui-edge-hover-boost` | `1.5` | Intensity multiplier on interactive hover |

Modifiers: `ui-edge--soft`, `ui-edge--strong`, `ui-edge--accent`, `ui-edge--none`, `ui-edge--animated` (slow sweep of the light, disabled under `prefers-reduced-motion`). Inputs, textareas and selects use wrapper elements because `<input>` cannot have pseudo-elements; checkboxes, radios, switches and range thumbs paint the same gradient as a border-box background.

## Theming

```css
:root {                       /* or any container */
  --ui-accent: #ffb454;  --ui-accent-hover: #ffc47a;  --ui-accent-contrast: #2a1800;
  --ui-bg: #101114;  --ui-surface: #17191e;  --ui-text: #f1f1f3;
  --ui-radius: 6px;  --ui-radius-lg: 10px;
  --ui-font: "Geist", system-ui, sans-serif;
  --ui-duration: 120ms;
}
```
Token groups: surfaces (`--ui-bg`, `-inset`, `-surface`, `-surface-2/3`, `-overlay`), text (`--ui-text`, `-muted`, `-faint`), accent and status (`--ui-accent|danger|success|warning|info` with `-soft`), shape (`--ui-radius-sm|radius|radius-lg`), depth (`--ui-shadow-sm|md|lg`), motion (`--ui-duration-fast|duration|ease`), type scale (`--ui-text-xs…3xl`), spacing (`--ui-space-1…8`), controls (`--ui-h-sm|md|lg`, `--ui-icon-*`). Switch themes with `Edgelit.theme.set('light' | 'dark' | 'auto')` or the attribute. Scoped themes work too: `<section data-ui-theme="light">`.

## Browser support
Current Chrome, Edge, Safari 16.4+ and Firefox (needs `color-mix()`, `:has()`, `<dialog>`, CSS masks). The Popover API is used for top-layer overlays where available, with a fixed-position fallback.

## Develop and contribute

```bash
git clone https://github.com/aabhro/edgelit && cd edgelit
npm install
npm run build      # regenerates dist/ (icons, CSS, IIFE, ESM, per-component modules, SRI)
npm test           # jsdom smoke tests against the built bundle + the showcase page
open index.html    # the showcase consumes ./dist, the same files the CDN serves
```
Source lives in `src/css/*.css` (one file per area) and `src/js/components/*.js` (one file per component). Guidelines: keep the `ui-` prefix; no element selectors outside component scope; use tokens, never hard-coded colours; proportional fonts only for UI text and nothing under 12px; every interactive component needs keyboard support and ARIA; add a test and a showcase demo for anything new; **commit the rebuilt `dist/`** (the CDN serves it from git and CI checks it is current).

Releasing: bump `version` in `package.json`, `npm run build && npm test`, commit, then `git tag v1.0.1 && git push --tags`. jsDelivr serves the new tag immediately.

## License
MIT
