# Omorphia component catalog

> [!CAUTION]
> **STOP BEFORE WRITING UI MARKUP. READ THIS INVENTORY, THEN VERIFY THE MATCHING SOURCE.**
>
> **Use Omorphia's custom elements for every interactive control. Do not write raw browser controls for buttons, text fields, selects, dates, times, checkboxes, radios, switches, ranges, menus, accordions, or drawers.**
>
> Do not invent component names, attributes, methods, events, or slots. Do not replace an existing Omorphia component with a hand-built equivalent. This catalog is an inventory, not permission to guess. The exact source and the version installed by the consuming project remain authoritative.

This document answers three questions for an AI agent:

1. What custom elements actually exist?
2. Which exact API and markup does each one support?
3. What is the approved fallback when no component matches?

## 1. Mandatory component-first procedure

For every task that creates or changes interface markup:

1. Read this entire catalog.
2. Read `src/js/index.js` to confirm which modules are loaded and which JavaScript helpers are exported.
3. Inspect the matching implementation in `src/js/components/` or `src/js/icons.js`. Confirm the actual `define('...')`, observed attributes, supported values, methods, properties, events, form behavior, and slots.
4. Inspect the matching styles in `src/css/`. A CSS class is not proof that a custom element exists.
5. Find the closest working example in [`index.html`](../index.html). The showcase is a verified usage reference, not a substitute for source inspection.
6. Make a component map **before coding**: user need → exact Omorphia element → source file → supported API. Mark a real gap as `NO BUILT-IN COMPONENT`.
7. Implement with the exact existing elements. Compose existing elements when a larger pattern is needed.
8. Review the finished markup and diff. Check every custom element, attribute, method, event, and slot against the exact source.

**If an agent cannot inspect the source, it must not bluff.** Re-open the public repository at https://github.com/aabhro/Omorphia, inspect the current default branch, and retry the source file. If a temporary network failure remains, report the exact missing file and ask for the source rather than guessing. Do not silently proceed with a replacement component.

### Source-of-truth order

- When editing this repository: the current `main` source in `src/` is authoritative.
- When consuming Omorphia elsewhere: the exact version actually loaded by that project is authoritative. Inspect the pinned CDN URL, package version, or local bundle. Do not assume an API from a newer branch exists in an older installed version.
- `index.html` demonstrates intended use. `README.md` explains distribution. Neither overrides implementation.
- The Modernimal component showcase in `aabhro/Stylesheets` is a separate visual reference. It does **not** register Omorphia elements and is not an Omorphia API.

## 2. Actual custom elements

**These 28 names are registered by the current source.** Do not add names to this list from memory.

| Exact element | Use it for | Implementation |
| --- | --- | --- |
| <code>&lt;ui-button&gt;</code> | Buttons and button states | [button.js](../src/js/components/button.js) |
| <code>&lt;ui-icon&gt;</code> | Lucide icons | [icons.js](../src/js/icons.js) |
| <code>&lt;ui-tooltip&gt;</code> | Hover/focus tooltip | [tooltip.js](../src/js/components/tooltip.js) |
| <code>&lt;ui-modal&gt;</code> | Dialog with body and footer | [modal.js](../src/js/components/modal.js) |
| <code>&lt;ui-popover&gt;</code> | Anchored floating content | [popover.js](../src/js/components/popover.js) |
| <code>&lt;ui-dropdown&gt;</code> | Keyboard-accessible action menu | [popover.js](../src/js/components/popover.js) |
| <code>&lt;ui-menu-item&gt;</code> | Custom menu row used inside `ui-dropdown` | [menu-item.js](../src/js/components/menu-item.js) |
| <code>&lt;ui-tabs&gt;</code> + <code>&lt;ui-tab&gt;</code> | Tab navigation and panels | [tabs.js](../src/js/components/tabs.js) |
| <code>&lt;ui-pagination&gt;</code> | Page navigation | [pagination.js](../src/js/components/pagination.js) |
| <code>&lt;ui-command-palette&gt;</code> + <code>&lt;ui-command&gt;</code> | Global command search/actions | [command-palette.js](../src/js/components/command-palette.js) |
| <code>&lt;ui-search&gt;</code> | Search with local/async suggestions | [search.js](../src/js/components/search.js) |
| <code>&lt;ui-sidebar&gt;</code> + <code>&lt;ui-sidebar-item&gt;</code> | Responsive navigation | [sidebar.js](../src/js/components/sidebar.js) |
| <code>&lt;ui-input&gt;</code> | Custom text-like field | [form-controls.js](../src/js/components/form-controls.js) |
| <code>&lt;ui-textarea&gt;</code> | Custom multiline text field | [form-controls.js](../src/js/components/form-controls.js) |
| <code>&lt;ui-checkbox&gt;</code> | Checkbox | [form-controls.js](../src/js/components/form-controls.js) |
| <code>&lt;ui-radio&gt;</code> | Radio group choice | [form-controls.js](../src/js/components/form-controls.js) |
| <code>&lt;ui-switch&gt;</code> | Switch/toggle | [form-controls.js](../src/js/components/form-controls.js) |
| <code>&lt;ui-range&gt;</code> | Range slider | [form-controls.js](../src/js/components/form-controls.js) |
| <code>&lt;ui-option&gt;</code> | Option definition used by `ui-select` | [select.js](../src/js/components/select.js) |
| <code>&lt;ui-select&gt;</code> | Custom single/multiple select | [select.js](../src/js/components/select.js) |
| <code>&lt;ui-date-picker&gt;</code> | Custom calendar/date picker | [date-time-picker.js](../src/js/components/date-time-picker.js) |
| <code>&lt;ui-time-picker&gt;</code> | Custom time picker | [date-time-picker.js](../src/js/components/date-time-picker.js) |
| <code>&lt;ui-drawer&gt;</code> | Off-canvas drawer/sheet | [drawer.js](../src/js/components/drawer.js) |
| <code>&lt;ui-accordion&gt;</code> + <code>&lt;ui-accordion-item&gt;</code> | Animated disclosure sections | [accordion.js](../src/js/components/accordion.js) |

There are 28 registered element names when paired elements are counted individually. `ui-command` is a declarative child of `ui-command-palette`; `ui-option` is an option definition consumed by `ui-select`. They are registered custom elements, not standalone controls.

### Buttons and icons

Use <code>&lt;ui-button&gt;</code> instead of inventing `Button`, `BaseButton`, or another button wrapper.

Verified attributes:
- `variant`: `primary`, `secondary` (default), `subtle`, `destructive`
- `size`: `sm`, `md` (default), `lg`
- `icon`, `icon-end`: Lucide icon names
- `loading`, `disabled`, `type`, `label`, `aria-label`

~~~html
<ui-button variant="primary" icon="save">Save changes</ui-button>
<ui-button variant="subtle" icon="ellipsis" label="More options"></ui-button>
<ui-button variant="destructive" icon="trash-2">Delete</ui-button>
<ui-button size="sm" loading>Saving</ui-button>
~~~

The element exposes `loading` and `disabled` properties, plus `focus()` and `click()` methods. An icon-only button must have a label. Use <code>&lt;ui-button&gt;</code> for new UI. Native buttons inside a custom component are implementation details, not markup to reproduce in an app.

Use `<ui-icon name="search"></ui-icon>`. Supported attributes are `name`, `size`, `stroke`, and `label`. A `label` gives it an image role and accessible name; without it, the icon is hidden from assistive technology. The icon registry exposes `has`, `register`, `registerAll`, and `load`. Bundled names and aliases live in [`icon-data.js`](../src/js/icon-data.js). Check that file instead of guessing that an icon is bundled.

### Custom input and textarea

**Use <code>&lt;ui-input&gt;</code> and <code>&lt;ui-textarea&gt;</code>. Do not author raw `<input>` or `<textarea>` controls in application markup.**

~~~html
<div class="ui-field">
  <span class="ui-label">Project name</span>
  <ui-input name="project-name" label="Project name" icon="folder" placeholder="Untitled project" clearable></ui-input>
  <p class="ui-hint">Shown on invoices and in the sidebar.</p>
</div>

<div class="ui-field">
  <span class="ui-label">Notes</span>
  <ui-textarea name="notes" label="Project notes" rows="4" maxlength="500" placeholder="Write a note…"></ui-textarea>
</div>
~~~

`ui-input` attributes: `type` (`text`, `email`, `password`, `search`, `url`, `tel`, `number`), `value`, `placeholder`, `name`, `disabled`, `readonly`, `required`, `clearable`, `size` (`sm`, `md`, `lg`), `label`, `autocomplete`, and `icon`. Properties: `value`, `disabled`; methods: `focus()`, `select()`, `checkValidity()`, `reportValidity()`. Events: `ui-input` and `ui-change`, each with `{ value, input }` in `event.detail`.

`ui-textarea` attributes: `value`, `placeholder`, `name`, `disabled`, `readonly`, `required`, `rows`, `maxlength`, `resize` (`vertical`, `both`, or `none`), `label`, and `auto-grow`. Properties: `value`, `disabled`; methods: `focus()`, `checkValidity()`, `reportValidity()`. Events: `ui-input` and `ui-change` with `{ value }`.

Both controls provide their own accessible internal editing surface. Do not place a raw input or textarea beside the custom element as a duplicate field.

### Checkbox, radio, switch, and range

Use custom controls for every choice and range interaction. **Do not author `<input type="checkbox">`, `<input type="radio">`, `<input type="range">`, or a switch made from a raw checkbox.**

~~~html
<ui-checkbox name="updates" value="deploys" label="Email me about deploys" checked></ui-checkbox>

<ui-radio name="plan" value="starter" label="Starter" checked></ui-radio>
<ui-radio name="plan" value="team" label="Team"></ui-radio>

<ui-switch name="auto-deploy" value="yes" label="Auto-deploy main" checked></ui-switch>

<ui-range name="volume" label="Volume" min="0" max="100" step="5" value="40"></ui-range>
~~~

`ui-checkbox`, `ui-radio`, and `ui-switch` accept `checked`, `disabled`, `name`, `value`, `label`, and `required`. They expose `checked` and `disabled` properties and a `focus()` method. Events: `ui-input` and `ui-change`, with `{ checked, value }`.

Radios with the same `name` form a group. Arrow keys move through the enabled options. A switch uses `role="switch"` and exposes `aria-checked`.

`ui-range` accepts `min`, `max`, `step`, `value`, `disabled`, `name`, and `label`. Property: `value`; method: `focus()`. Events: `ui-input` while changing and `ui-change` when committed. Keyboard controls include arrow keys, Page Up/Down, Home, and End.

These components submit their values through internal hidden form fields. Do not add a second native input to submit the same value.

### Select and options

**Use <code>&lt;ui-select&gt;</code> with <code>&lt;ui-option&gt;</code>. Do not author a native `<select>` or `<option>`.** The options are rendered in a borderless floating menu, not a browser select popup.

~~~html
<ui-select name="region" label="Region" placeholder="Choose a region" searchable>
  <ui-option value="fra" description="Europe" icon="globe">Europe (Frankfurt)</ui-option>
  <ui-option value="iad" description="North America">US East (Virginia)</ui-option>
  <ui-option value="sin" description="Asia Pacific">Asia Pacific (Singapore)</ui-option>
</ui-select>

<ui-select name="topics" label="Topics" multiple placeholder="Select topics">
  <ui-option value="design">Design</ui-option>
  <ui-option value="engineering">Engineering</ui-option>
  <ui-option value="research">Research</ui-option>
</ui-select>
~~~

`ui-select` attributes: `value`, `placeholder`, `disabled`, `multiple`, `searchable`, `name`, `label`, `placement`, and `required`. Property: `value` (string for single choice, array for multiple); property `selectedOptions`; method `focus()`. Events: `ui-input` and `ui-change` with `{ value, option }` or `{ value, option, selectedOptions }`.

`ui-option` attributes: `value`, `label`, `description`, `disabled`, `selected`, and `icon`. Its `value`, `label`, and `disabled` properties are readable. Keep options as direct children in markup. Do not build a second dropdown for select values.

### Date and time pickers

**Use the custom calendar and time picker. Never use native `<input type="date">`, `<input type="time">`, or browser date/time picker popups.**

~~~html
<ui-date-picker
  name="release-date"
  label="Release date"
  value="2026-11-20"
  min="2026-01-01"
  max="2027-12-31"
  locale="en-GB">
</ui-date-picker>

<ui-time-picker
  name="maintenance-time"
  label="Maintenance time"
  value="14:30"
  format="12h"
  step="5">
</ui-time-picker>
~~~

`ui-date-picker` stores an ISO `YYYY-MM-DD` string. Attributes: `value`, `min`, `max`, `disabled`, `placeholder`, `locale`, `week-start` (0–6), `placement`, `name`, and `label`. Properties: `value`, `date` (a JavaScript Date or null), `disabled`; method: `focus()`. Events: `ui-input` and `ui-change` with `{ value, date }`. Arrow keys move one day/week; Home/End move to the week edges; Page Up/Down changes month/year. `min` and `max` dates are disabled.

`ui-time-picker` stores an `HH:MM` 24-hour string. Its text field accepts typed `HH:MM`, `h:mm AM`, or `h:mm PM` values, while the adjacent clock trigger opens the selectable hour/minute panel. Attributes: `value`, `disabled`, `placeholder`, `format` (`12h` or default 24-hour), `step` (minute interval), `placement`, `label`, and `name`. Property: `value`; method: `focus()` focuses the editable text field. Events: `ui-input` while a valid time is typed and `ui-change` when committed. The submitted value remains 24-hour `HH:MM` in either display format.

Both controls render their own calendar/selection surface inside `ui-popover`, so they share the same motion and theme behavior. Both include hidden form values. Do not create a parallel calendar or native fallback widget.

### Tooltips, modal, and popover

<code>&lt;ui-tooltip&gt;</code> wraps an existing target. Attributes: `content`, `placement`, and `delay`. Methods: `show()`, `hide()`.

~~~html
<ui-tooltip content="Copy to clipboard" placement="top">
  <ui-button icon="copy">Copy</ui-button>
</ui-tooltip>
~~~

Use <code>&lt;ui-modal&gt;</code> for a dialog with custom content. Attributes: `heading`, `size` (`sm`, default/medium, `lg`), `open`, and `persistent`. Place footer actions inside an element with `slot="footer"`.

~~~html
<ui-modal id="edit-dialog" heading="Edit project">
  <div class="ui-field">
    <span class="ui-label">Project title</span>
    <ui-input name="title" label="Project title"></ui-input>
  </div>
  <div slot="footer">
    <ui-button variant="subtle" onclick="this.closest('ui-modal').close()">Cancel</ui-button>
    <ui-button variant="primary" onclick="this.closest('ui-modal').close('saved')">Save</ui-button>
  </div>
</ui-modal>
~~~

Methods: `show()`, `close(returnValue)`, `toggle()`. Property: `open`. Events: `ui-open`, cancelable `ui-before-close`, and `ui-close`. For a standard yes/no confirmation, use `Omorphia.confirm({ title, message, confirmLabel, cancelLabel, destructive })`, which resolves to `Promise<boolean>`.

Use <code>&lt;ui-popover&gt;</code> for anchored custom content. Its trigger is the child with `slot="trigger"`; its remaining children become the floating panel. Methods: `show()`, `hide()`, `toggle()`; property: `open`; events: `ui-open` and `ui-close`.

~~~html
<ui-popover placement="bottom-start">
  <ui-button slot="trigger" icon="settings">Display options</ui-button>
  <div class="ui-stack ui-gap-3">
    <ui-switch label="Compact rows" checked></ui-switch>
    <ui-switch label="Show IDs"></ui-switch>
  </div>
</ui-popover>
~~~

Popover, dropdown, select, date picker, and time picker share a trigger-to-surface morph transition. Do not add competing CSS or JavaScript entrance effects. Reduced-motion users receive immediate, non-animated state changes.

### Dropdown and custom menu items

**Do not put raw `<button>` or `<a>` menu rows into new dropdowns. Use <code>&lt;ui-menu-item&gt;</code>.** The dropdown handles keyboard focus, arrow navigation, Home/End, type-ahead, selection, and dismissal.

~~~html
<ui-dropdown placement="bottom-start">
  <ui-button slot="trigger" icon-end="chevron-down">Actions</ui-button>
  <div class="ui-menu-label">Project</div>
  <ui-menu-item value="rename" label="Rename" icon="pencil" shortcut="R"></ui-menu-item>
  <ui-menu-item value="duplicate" label="Duplicate" icon="copy"></ui-menu-item>
  <ui-menu-item value="delete" label="Delete" icon="trash-2" destructive></ui-menu-item>
</ui-dropdown>
~~~

`ui-menu-item` attributes: `value`, `label`, `icon`, `shortcut`, `disabled`, and `destructive`. It must be a child of `ui-dropdown`. The dropdown emits `ui-select` with `{ item, value }`. The value is read from the custom item's `value` attribute. Do not invent `ui-menu`, `ui-menu-row`, or another menu component.

### Tabs and pagination

`<ui-tabs value="overview">` contains one `<ui-tab label="..." value="...">` per panel. Child attributes include `label`, `value`, `icon`, and `disabled`. The container exposes a `value` property and emits `ui-change` with `{ value, tab }`. Arrow keys, Home, and End are supported.

`<ui-pagination total="24" page="6" siblings="1">` renders page navigation. Attributes: `total`, `page`, `siblings`, and `label`. Property: `page`; method: `go(page)`; event: `ui-change` with `{ page }`.

### Drawer

**Use <code>&lt;ui-drawer&gt;</code> for an off-canvas panel or mobile sheet. Do not build a second drawer with a fixed div and custom backdrop.**

~~~html
<ui-drawer id="settings-drawer" heading="Project settings" placement="right" size="md">
  <p>Update workspace preferences.</p>
  <div class="ui-field">
    <span class="ui-label">Project name</span>
    <ui-input name="project-name" label="Project name"></ui-input>
  </div>
  <div slot="footer">
    <ui-button variant="subtle" onclick="document.getElementById('settings-drawer').close()">Cancel</ui-button>
    <ui-button variant="primary">Save changes</ui-button>
  </div>
</ui-drawer>

<ui-button onclick="document.getElementById('settings-drawer').show()">Open settings</ui-button>
~~~

Attributes: `open`, `heading`, `placement` (`left`, `right`, `top`, `bottom`), `size` (`sm`, `md`, `lg`), and `persistent`. Slots: `header`, `footer`. Methods: `show()`, `close(reason)`, `toggle()`; property: `open`; events: `ui-open` and `ui-close` with `{ reason }`. It manages focus, Escape/backdrop dismissal, focus restoration, body scroll lock, and reduced motion. The drawer panel itself has no border.

### Accordion

**Use <code>&lt;ui-accordion&gt;</code> and <code>&lt;ui-accordion-item&gt;</code>. Do not author native `<details>` disclosures for new component UI.**

~~~html
<ui-accordion>
  <ui-accordion-item heading="Overview" value="overview" open>
    Overview content.
  </ui-accordion-item>
  <ui-accordion-item heading="Advanced settings" value="advanced">
    Advanced content.
  </ui-accordion-item>
</ui-accordion>

<ui-accordion multiple>
  <ui-accordion-item heading="First">First panel</ui-accordion-item>
  <ui-accordion-item heading="Second">Second panel</ui-accordion-item>
</ui-accordion>
~~~

The root accepts `multiple` and `value`. Each item accepts `heading`, `value`, `open`, and `disabled`. An accordion without `multiple` keeps one panel open at a time; with `multiple`, panels can stay open together. Item methods: `show()`, `hide()`, `toggle()`; item/root emit `ui-change`. Arrow keys, Home, and End move between enabled headers. The panel uses a grid-based height transition and respects `prefers-reduced-motion`.

### Command palette, search, and sidebar

Use <code>&lt;ui-command-palette&gt;</code> for global app actions and <code>&lt;ui-search&gt;</code> for searching a specific dataset. Do not substitute one for the other.

The command palette accepts `hotkey`, `placeholder`, and `disabled`. Default shortcut is `mod+shift+k`; `hotkey="none"` disables it. Declarative <code>&lt;ui-command&gt;</code> fields: `label`, `group`, `description`, `icon`, `shortcut`, `href`, `target`, `keywords`, and `disabled`. JavaScript commands register through `Omorphia.commands.register([...])`; each supports `id`, `label`, optional `group`, `description`, `icon`, `keywords`, `shortcut`, `href`, `target`, `onSelect(command)`, and `disabled`. Events: `ui-open`, `ui-close`, `ui-command` with `{ command }`.

`ui-search` accepts local `data`, `suggestions`, async `source(query, signal)`, and `renderItem(item, context)` properties. It emits `ui-input`, `ui-select`, `ui-submit`, and `ui-clear`. Use it for local or remote suggestions, not for dropdown option lists or a global command menu.

Use <code>&lt;ui-sidebar&gt;</code> with nested <code>&lt;ui-sidebar-item&gt;</code> elements for responsive navigation. The container supports `heading`, `label`, `collapsible`, `collapsed`, `open`, `width`, `breakpoint`, `fixed`, and `position`. Slots: `header` and `footer`. Methods: `toggle()`, `collapse()`, `expand()`, `openMobile()`, and `closeMobile()`. Items support `icon`, `href`, `active`, `expanded`, `disabled`, and `label`.

## 3. JavaScript helpers that already exist

These are APIs, not standalone UI custom elements.

| API | Use | Verified source |
| --- | --- | --- |
| `Omorphia.toast(options)` | Notifications; returns `{ dismiss, element }`. | [toast.js](../src/js/components/toast.js) |
| `Omorphia.confirm(options)` | Confirmation dialog; returns `Promise<boolean>`. | [modal.js](../src/js/components/modal.js) |
| `Omorphia.commands.register(commands)` | Register command palette actions. | [command-palette.js](../src/js/components/command-palette.js) |
| `Omorphia.theme.get/set/toggle()` | Read/change dark, light, and auto theme. | [index.js](../src/js/index.js) |
| `Omorphia.icons` | Check/register/load Lucide icons. | [icons.js](../src/js/icons.js) |
| `Omorphia.version` | Read the bundled version. | [index.js](../src/js/index.js) |

Toast variants: `success`, `danger`, `error`, `warning`, `info`, and `neutral`. Default duration is 5000 ms; `duration: 0` keeps it open until dismissed.

## 4. CSS primitives: static content and layout

The library retains CSS patterns for static content and layout. They are useful for cards, alerts, badges, typography, status, progress, and spacing. They are **not a reason to replace a custom interactive element**.

- Fields/layout: `.ui-field`, `.ui-label`, `.ui-hint`, `.ui-error-text`, `.ui-success-text`, `.ui-stack`, `.ui-row`, `.ui-grid`, `.ui-grow`.
- Cards: semantic `<article class="ui-card">` with `.ui-card-header`, `.ui-card-body`, `.ui-card-title`, `.ui-card-desc`, and `.ui-card-footer`.
- Alerts: `.ui-alert` with `.ui-alert--info`, `--success`, `--warning`, or `--danger`.
- Badges and status: `.ui-badge`, `.ui-status` and their documented modifiers.
- Progress/loading: `.ui-progress`, `.ui-progress-bar`, `.ui-spinner`, `.ui-skeleton`.
- Avatar: `.ui-avatar` and `.ui-avatar-group`.
- Static navigation: `.ui-crumbs`, `.ui-crumb`, `.ui-nav`, and `.ui-nav-link`.
- Typography: `.ui-display`, `.ui-h1`, `.ui-h2`, `.ui-h3`, `.ui-body`, `.ui-small`, `.ui-caption`, `.ui-muted`, `.ui-faint`, `.ui-link`, `.ui-code`, and `.ui-kbd`.

Legacy class-based form patterns remain for backwards compatibility. **For new interface work, use the custom form elements in Section 2 instead.** Do not write raw input/select/textarea/button/details controls as replacements.

## 5. Common false assumptions

The following are **not** registered custom elements. Keep them as static semantic content with their class-based styles; do not invent tags for them.

| Incorrect assumption | Correct implementation |
| --- | --- |
| <code>&lt;ui-card&gt;</code> | `<article class="ui-card">` |
| <code>&lt;ui-alert&gt;</code> / <code>&lt;ui-badge&gt;</code> / <code>&lt;ui-avatar&gt;</code> | Native semantic element with the corresponding static `.ui-*` class |
| <code>&lt;ui-progress&gt;</code> / <code>&lt;ui-spinner&gt;</code> / <code>&lt;ui-skeleton&gt;</code> | Static element with the corresponding `.ui-*` class |
| <code>&lt;ui-collapsible&gt;</code> | No custom element is registered. Use <code>&lt;ui-accordion&gt;</code> and <code>&lt;ui-accordion-item&gt;</code> instead. Do not use native <code>&lt;details&gt;</code> for new UI. |
| <code>&lt;ui-table&gt;</code> / <code>&lt;ui-calendar&gt;</code> / <code>&lt;ui-file-upload&gt;</code> / <code>&lt;ui-chart&gt;</code> | No built-in custom element is registered for these in the current source. Use semantic content and application logic, or plan an explicitly approved library feature. |

**Never assume a class name creates a custom element.** Any `<ui-...>` element not present in Section 2 must be verified in the current source before use.

## 6. What to do when the library does not have a match

1. **Use the exact existing component.**
2. **Compose existing elements.** For example, use `ui-popover` with `ui-switch` elements for a display-settings panel.
3. **Use documented CSS primitives for static content/layout.**
4. **If a genuinely new interactive behavior is required, identify the exact gap** as `NO BUILT-IN COMPONENT` before coding.
5. Only build an app-local custom element when no existing component or composition can satisfy the behavior. Keep it clearly app-specific and document why the existing API does not fit.
6. Only add a public component to Omorphia when the user asks for a library feature or approves the scope. Update source, registration/exports, styles, tests, showcase, README, this catalog, and generated `dist/` output.

A missing feature is not permission to replace the entire control system with homemade components or add another UI framework.

## 7. Anti-hallucination and instruction-following rules

> [!CAUTION]
> **THE EXISTING LIBRARY TAKES PRIORITY OVER AN AI-GENERATED REPLACEMENT.**
>
> - Do not invent `ui-*` tags.
> - Do not guess attribute names, valid values, properties, methods, slots, or event names.
> - Do not infer a JavaScript component from a CSS selector.
> - Do not treat a screenshot, visual resemblance, framework example, or Modernimal showcase component as proof that Omorphia implements it.
> - Do not create parallel Button, Input, Textarea, Select, DatePicker, TimePicker, Checkbox, Radio, Switch, Range, Modal, Dropdown, Menu, Tabs, Toast, Sidebar, Drawer, or Accordion systems.
> - Do not use raw native controls for new UI: no `<button>`, `<input>`, `<textarea>`, `<select>`, `<option>`, or `<details>` as application controls. Use the matching Omorphia custom element.
> - Internal native editing/form primitives inside an Omorphia custom element are implementation details. Do not copy them into application markup.
> - Do not install a second UI library to avoid learning Omorphia.

If an instruction conflicts with implementation, inspect current source and explain the discrepancy. Never modify the API in your imagination. Keep the exact installed version in view, especially when a consuming app pins a CDN release.

## 8. Visual and motion rules for floating surfaces

- Menus, dropdowns, popovers, command panels, search panels, date/time panels, tooltips, and drawer surfaces use opaque `#0a0a0a` backgrounds.
- **Do not add borders or outlines to overlays, popups, menus, popovers, or drawer panels.** Use spacing, contrast, layering, and restrained shadow for separation.
- Borders remain appropriate on input controls and buttons, consistent with the existing tokens.
- Dropdown/select/date/time surfaces reuse the shared trigger-to-panel morph. Do not add competing entrance animations.
- Accordions use the existing grid-based height transition. Preserve its exit behavior and reduced-motion handling.
- Respect `prefers-reduced-motion`; no animation should block opening, closing, selection, or keyboard behavior.

## 9. Required component audit before delivery

- Search changed markup for every `<ui-` tag and verify it against Section 2 and exact-version source.
- Search changed markup for raw interactive elements: `button`, `input`, `textarea`, `select`, `option`, and `details`. Replace authored controls with custom elements.
- Verify every custom attribute, property, method, event, and slot against source.
- Confirm existing controls were not recreated in app-local CSS/JS.
- Test typing, form values, selection, keyboard navigation, opening/closing, interrupted transitions, responsive behavior, themes, and reduced motion as relevant.
- If custom UI remains, document the exact library gap and why composing existing elements was not sufficient.

Include a brief **Component reuse audit** in the delivery report: name the Omorphia elements reused and identify any app-specific custom UI with a clear reason.

## 10. Source map

- Registration and public JS exports: [`src/js/index.js`](../src/js/index.js)
- Shared custom-element helpers and morph transitions: [`src/js/core.js`](../src/js/core.js)
- Verified component examples: [`index.html`](../index.html)
- Component styles: [`src/css/`](../src/css/)
- API and installation: [`README.md`](../README.md)
- Build generation: [`scripts/build.mjs`](../scripts/build.mjs)
- Runtime and showcase tests: [`tests/smoke.mjs`](../tests/smoke.mjs), [`tests/showcase.mjs`](../tests/showcase.mjs)

**When uncertain, inspect source. Do not guess. Reuse first. Extend only when the gap is real.**
