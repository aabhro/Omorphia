# Omorphia component catalog

> [!CAUTION]
> **STOP BEFORE WRITING UI MARKUP. READ THIS INVENTORY, THEN VERIFY THE MATCHING IMPLEMENTATION IN <code>src/</code>.**
>
> **Do not invent component names, attributes, methods, events, or slots. Do not replace an existing Omorphia component with a hand-built equivalent.** Every custom element listed below is registered by the current source. Anything described as a CSS primitive is a native HTML element styled with a class, not a custom element.

This file answers a concrete question: **what does Omorphia actually provide, and which exact API should an agent use?** It is a discovery map, not permission to guess. The source code and the version installed by the target project remain authoritative.

## 1. Mandatory component-first procedure

For every task that creates or changes interface markup:

1. Read this entire catalog.
2. Read <code>src/js/index.js</code> to confirm which modules are loaded and which JavaScript helpers are exported.
3. Inspect the matching component implementation in <code>src/js/components/</code> or <code>src/js/icons.js</code>. Check the actual <code>define('...')</code>, <code>observedAttributes</code>, methods, property accessors, event emission, and slot handling. Do not rely on names inferred from a demo.
4. Inspect the matching styles in <code>src/css/</code>. A class name does not prove that a custom element exists.
5. Find and read the closest working example in <a href="../index.html">index.html</a>. The showcase is a verified usage reference, not a substitute for source inspection.
6. Make a component map **before coding**. For every requested UI area, write down the exact Omorphia element or CSS pattern that will implement it and link the source file. Mark any gap as <code>NO BUILT-IN COMPONENT</code> instead of inventing an API.
7. Implement with those exact components and patterns. Only add custom UI after proving that no existing component or composition of primitives fits.
8. Review the finished markup and diff. Check every <code>&lt;ui-...&gt;</code> tag, attribute, event, method, and class against source. Remove duplicate controls and custom wrappers that merely recreate Omorphia.

**If an agent cannot inspect the source, it must not bluff.** Re-open the public repository at https://github.com/aabhro/Omorphia, inspect the current default branch, and retry the source file. If a temporary network failure remains, report the exact missing file and ask for the source rather than guessing. Do not silently proceed with a replacement component.

### Source-of-truth order

- When editing this repository: the current <code>main</code> source in <code>src/</code> is authoritative.
- When consuming Omorphia in another project: the exact Omorphia version actually loaded by that project is authoritative. Inspect its pinned CDN URL, package version, or local bundle. Do not assume an API from a newer branch exists in an older installed version.
- <code>index.html</code> demonstrates intended use. <code>README.md</code> explains distribution and installation. Neither overrides implementation.
- The Modernimal component showcase in <code>aabhro/Stylesheets</code> is a separate design reference. It does **not** register Omorphia elements and is not an Omorphia API. Use Modernimal to guide visual decisions only where its patterns fit. Use Omorphia's actual elements and classes for implementation.

## 2. Actual custom elements

The following are the custom elements registered by the current source. Do not add to this list from memory.

| Exact element | Use it for | Implementation |
| --- | --- | --- |
| <code>&lt;ui-icon&gt;</code> | Lucide icon | <a href="../src/js/icons.js">src/js/icons.js</a> |
| <code>&lt;ui-button&gt;</code> | Primary, secondary, subtle, destructive, loading, disabled, and icon buttons | <a href="../src/js/components/button.js">button.js</a> |
| <code>&lt;ui-tooltip&gt;</code> | Hover/focus tooltip for an existing target | <a href="../src/js/components/tooltip.js">tooltip.js</a> |
| <code>&lt;ui-modal&gt;</code> | Dialog with body and optional footer | <a href="../src/js/components/modal.js">modal.js</a> |
| <code>&lt;ui-popover&gt;</code> | Anchored floating content or controls | <a href="../src/js/components/popover.js">popover.js</a> |
| <code>&lt;ui-dropdown&gt;</code> | Keyboard-accessible action/menu list | <a href="../src/js/components/popover.js">popover.js</a> |
| <code>&lt;ui-tabs&gt;</code> + <code>&lt;ui-tab&gt;</code> | Tab navigation and associated panels | <a href="../src/js/components/tabs.js">tabs.js</a> |
| <code>&lt;ui-pagination&gt;</code> | Page navigation | <a href="../src/js/components/pagination.js">pagination.js</a> |
| <code>&lt;ui-command-palette&gt;</code> + <code>&lt;ui-command&gt;</code> | Global command search and actions | <a href="../src/js/components/command-palette.js">command-palette.js</a> |
| <code>&lt;ui-search&gt;</code> | Search input with local or asynchronous suggestions | <a href="../src/js/components/search.js">search.js</a> |
| <code>&lt;ui-sidebar&gt;</code> + <code>&lt;ui-sidebar-item&gt;</code> | Responsive, collapsible navigation | <a href="../src/js/components/sidebar.js">sidebar.js</a> |

There are 14 registered element names when paired elements are counted individually. <code>ui-command</code> is a declarative child of <code>ui-command-palette</code>. It is registered by the palette module but is not a standalone command control.

### <code>&lt;ui-button&gt;</code>

Use it instead of inventing <code>Button</code>, <code>BaseButton</code>, or another button wrapper.

Verified attributes:
- <code>variant</code>: <code>primary</code>, <code>secondary</code> (default), <code>subtle</code>, <code>destructive</code>
- <code>size</code>: <code>sm</code>, <code>md</code> (default), <code>lg</code>
- <code>icon</code>, <code>icon-end</code>: Lucide icon names
- <code>loading</code>, <code>disabled</code>
- <code>type</code>
- <code>label</code> or <code>aria-label</code> for icon-only buttons

~~~html
<ui-button variant="primary" icon="save">Save changes</ui-button>
<ui-button variant="subtle" icon="ellipsis" label="More options"></ui-button>
<ui-button variant="destructive" icon="trash-2">Delete</ui-button>
<ui-button size="sm" loading>Saving</ui-button>
~~~

The element exposes <code>loading</code> and <code>disabled</code> properties, plus <code>focus()</code> and <code>click()</code> methods. Its inner native button receives the actual disabled, type, and accessibility behavior. An icon-only button must have a label.

A native <code>&lt;button class="ui-btn ..."&gt;</code> is also supported when native form markup or a specific browser behavior requires it. Use <code>ui-btn--primary</code>, <code>ui-btn--secondary</code>, <code>ui-btn--subtle</code>, <code>ui-btn--destructive</code>, <code>ui-btn--sm</code>, <code>ui-btn--lg</code>, <code>ui-btn--icon</code>, and <code>ui-btn-group</code> only as shown in source/showcase.

### <code>&lt;ui-icon&gt;</code>

Use <code>&lt;ui-icon name="search"&gt;&lt;/ui-icon&gt;</code>. Verified attributes: <code>name</code>, <code>size</code>, <code>stroke</code>, <code>label</code>. A <code>label</code> gives it an image role and accessible name; without a label, it is hidden from assistive technology. The <code>Omorphia.icons</code> registry exposes <code>has</code>, <code>register</code>, <code>registerAll</code>, and <code>load</code>. Bundled Lucide names and aliases live in <a href="../src/js/icon-data.js">src/js/icon-data.js</a>; do not claim an icon is bundled without checking that file. Missing icons are attempted from the configured Lucide CDN.

### <code>&lt;ui-tooltip&gt;</code>

Use it to describe an existing control, not as a general popover.

~~~html
<ui-tooltip content="Copy to clipboard" placement="top" delay="250">
  <ui-button icon="copy">Copy</ui-button>
</ui-tooltip>
~~~

Verified attributes: <code>content</code>, <code>placement</code>, <code>delay</code>. It wraps its target as the first element child. <code>show()</code> and <code>hide()</code> are available. It opens on pointer hover and keyboard focus. The tooltip is associated with its target through <code>aria-describedby</code>.

### <code>&lt;ui-modal&gt;</code> and <code>Omorphia.confirm()</code>

Use <code>&lt;ui-modal&gt;</code> for a dialog with custom content. Verified attributes: <code>heading</code>, <code>size</code> (<code>sm</code>, default/medium, <code>lg</code>), <code>open</code>, and <code>persistent</code>. Put footer actions in an element with <code>slot="footer"</code>.

~~~html
<ui-modal id="edit-dialog" heading="Edit project">
  <div class="ui-field">
    <label class="ui-label" for="project-title">Project title</label>
    <div class="ui-input">
      <input id="project-title" name="title">
    </div>
  </div>
  <div slot="footer">
    <ui-button variant="subtle" onclick="this.closest('ui-modal').close()">Cancel</ui-button>
    <ui-button variant="primary" onclick="this.closest('ui-modal').close('saved')">Save</ui-button>
  </div>
</ui-modal>
~~~

Methods: <code>show()</code>, <code>close(returnValue)</code>, <code>toggle()</code>. Property: <code>open</code>. Events: <code>ui-open</code>, cancelable <code>ui-before-close</code>, <code>ui-close</code>. <code>persistent</code> hides the built-in close control and prevents backdrop-click dismissal; do not assume it prevents Escape or programmatic close.

For a standard yes/no confirmation, use the existing <code>Omorphia.confirm({ title, message, confirmLabel, cancelLabel, destructive })</code>, which resolves to <code>Promise&lt;boolean&gt;</code>. Do not hand-build another confirmation dialog.

### <code>&lt;ui-popover&gt;</code> and <code>&lt;ui-dropdown&gt;</code>

Use <code>&lt;ui-popover&gt;</code> for custom anchored content. The trigger is the element with <code>slot="trigger"</code>; remaining children become the panel.

~~~html
<ui-popover placement="bottom-start">
  <ui-button slot="trigger" icon="settings">Display options</ui-button>
  <div class="ui-stack ui-gap-3">
    <p class="ui-h3">Display</p>
    <label class="ui-switch">
      <input class="ui-switch-input" type="checkbox" role="switch">
      <span class="ui-switch-track"></span>
      Compact rows
    </label>
  </div>
</ui-popover>
~~~

Verified attribute: <code>placement</code> (for example <code>bottom-start</code>). Methods: <code>show()</code>, <code>hide()</code>, <code>toggle()</code>. Property: <code>open</code>. Events: <code>ui-open</code>, <code>ui-close</code>.

Use <code>&lt;ui-dropdown&gt;</code> for a menu of actions. It extends the popover behavior and enhances its button/link children as menu items. Use native <code>&lt;button data-value="..."&gt;</code> or <code>&lt;a href="..."&gt;</code> children, and <code>&lt;hr&gt;</code> for separators.

~~~html
<ui-dropdown placement="bottom-start">
  <ui-button slot="trigger" icon-end="chevron-down">Actions</ui-button>
  <div class="ui-menu-label">Project</div>
  <button data-value="rename">Rename</button>
  <button data-value="duplicate">Duplicate</button>
  <hr>
  <button class="ui-menu-item--danger" data-value="delete">Delete</button>
</ui-dropdown>
~~~

Event: <code>ui-select</code>, with <code>{ item, value }</code> in <code>event.detail</code>. The value comes from <code>data-value</code>, or the item's text when no <code>data-value</code> is supplied. Do not invent <code>&lt;ui-menu&gt;</code>, <code>&lt;ui-menu-item&gt;</code>, or a separate dropdown component.

### <code>&lt;ui-tabs&gt;</code> and <code>&lt;ui-tab&gt;</code>

Use <code>&lt;ui-tab&gt;</code> for each tab and its panel content. The <code>ui-tabs</code> container owns selection.

~~~html
<ui-tabs value="overview" label="Project sections">
  <ui-tab label="Overview" value="overview" icon="layers">Overview content</ui-tab>
  <ui-tab label="Activity" value="activity" icon="clock">Activity content</ui-tab>
  <ui-tab label="Billing" value="billing" disabled>Billing content</ui-tab>
</ui-tabs>
~~~

Container: <code>value</code>, optional <code>label</code>. Child: <code>label</code>, <code>value</code>, optional <code>icon</code>, <code>disabled</code>; a child with <code>selected</code> can provide an initial selection when the container has no value. Set/read the container's <code>value</code> property. Event: <code>ui-change</code>, with <code>{ value, tab }</code>. Arrow keys, Home, and End are handled. Do not make another tabs implementation.

### <code>&lt;ui-pagination&gt;</code>

~~~html
<ui-pagination total="24" page="6" siblings="1" label="Search results"></ui-pagination>
~~~

Verified attributes: <code>total</code>, <code>page</code>, <code>siblings</code>, <code>label</code>. Property: <code>page</code>. Method: <code>go(page)</code>. Event: <code>ui-change</code>, with <code>{ page }</code>. This component handles page controls only. Connect its event to the app's actual data-loading or view-update logic.

### <code>&lt;ui-command-palette&gt;</code> and <code>&lt;ui-command&gt;</code>

Use this for global app actions and navigation. It is distinct from <code>&lt;ui-search&gt;</code>, which is for searching a specific dataset or field.

~~~html
<ui-command-palette hotkey="mod+shift+k" placeholder="Search commands">
  <ui-command label="New document" group="Actions" icon="plus" shortcut="N"></ui-command>
  <ui-command label="Open settings" group="Navigate" icon="settings" href="/settings"></ui-command>
</ui-command-palette>
~~~

The command palette accepts <code>hotkey</code>, <code>placeholder</code>, and <code>disabled</code>. Default shortcut is <code>mod+shift+k</code>; <code>hotkey="none"</code> disables it. <code>&lt;ui-command&gt;</code> supports the declarative fields <code>label</code>, <code>group</code>, <code>description</code>, <code>icon</code>, <code>shortcut</code>, <code>href</code>, <code>target</code>, <code>keywords</code>, and <code>disabled</code>.

For JavaScript commands, use <code>Omorphia.commands.register([...])</code>. A command object supports <code>id</code>, <code>label</code>, optional <code>group</code>, <code>description</code>, <code>icon</code>, <code>keywords</code>, <code>shortcut</code>, <code>href</code>, <code>target</code>, <code>onSelect(command)</code>, and <code>disabled</code>. The registry exposes <code>register</code>, <code>unregister</code>, <code>clear</code>, and <code>list</code>. The palette instance also has <code>register</code>, <code>commands</code>, <code>open</code>, <code>close</code>, <code>toggle</code>, <code>disabled</code>, and <code>isOpen</code>.

Events: <code>ui-open</code>, <code>ui-close</code>, <code>ui-command</code>, with <code>{ command }</code> on <code>ui-command</code>. Do not invent a separate command modal or a <code>ui-command-item</code> tag.

### <code>&lt;ui-search&gt;</code>

Use this for in-context search, local suggestions, and asynchronous autocomplete. Do not use it as a global action palette.

~~~html
<ui-search id="people-search" autocomplete placeholder="Find a teammate"></ui-search>
~~~

Set its JavaScript properties from application code:

~~~js
const search = document.querySelector('#people-search');

search.data = [
  { label: 'Ada Lovelace', value: 'ada', description: 'Engineering' },
  { label: 'Grace Hopper', value: 'grace', description: 'Compiler team' }
];

search.addEventListener('ui-select', (event) => {
  const selectedPerson = event.detail.item;
});
~~~

Supported item shape: a string, or <code>{ label, value?, description?, icon?, keywords? }</code>.

Verified configuration attributes include <code>placeholder</code>, <code>value</code>, <code>loading</code>, <code>name</code>, <code>label</code>, <code>autocomplete</code>, <code>min-chars</code>, <code>debounce</code>, <code>max</code>, <code>empty-text</code>, and <code>loading-text</code>. JavaScript properties: <code>data</code>, <code>suggestions</code>, <code>source</code> (async <code>(query, signal) =&gt; items</code>), and <code>renderItem</code> (<code>(item, { query, highlight }) =&gt; Node|string</code>). Events: <code>ui-input</code> (<code>{ value }</code>), <code>ui-select</code> (<code>{ item, value }</code>), <code>ui-submit</code> (<code>{ value }</code>), and <code>ui-clear</code>. The <code>source</code> receives an <code>AbortSignal</code>; respect it when making requests.

### <code>&lt;ui-sidebar&gt;</code> and <code>&lt;ui-sidebar-item&gt;</code>

Use these for application navigation, not a hand-built sidebar.

~~~html
<ui-sidebar heading="Workspace" collapsible width="240px" breakpoint="768">
  <ui-sidebar-item icon="house" href="/" active>Dashboard</ui-sidebar-item>
  <ui-sidebar-item icon="folder" expanded>Projects
    <ui-sidebar-item href="/projects/atlas">Atlas</ui-sidebar-item>
    <ui-sidebar-item href="/projects/meridian">Meridian</ui-sidebar-item>
  </ui-sidebar-item>
  <ui-sidebar-item icon="settings" href="/settings">Settings</ui-sidebar-item>
  <div slot="footer">Workspace footer</div>
</ui-sidebar>
~~~

Container attributes used by the implementation: <code>heading</code>, <code>label</code>, <code>collapsible</code>, <code>collapsed</code>, <code>open</code>, <code>width</code>, <code>breakpoint</code>, <code>fixed</code>, and <code>position="left|right"</code>. Slots: <code>header</code>, <code>footer</code>. Methods: <code>toggle()</code>, <code>collapse()</code>, <code>expand()</code>, <code>openMobile()</code>, <code>closeMobile()</code>. Events: <code>ui-select</code> (<code>{ item, href }</code>, cancelable) and <code>ui-toggle</code> (<code>{ collapsed, open }</code>). An external control can use <code>data-ui-toggle="#sidebar-id"</code>.

Child attributes: <code>icon</code>, <code>href</code>, <code>active</code>, <code>expanded</code>, <code>disabled</code>, <code>label</code>. Nest child <code>&lt;ui-sidebar-item&gt;</code> elements to make groups. Do not invent a second sidebar, tree, or navigation-item API when this structure fits.

## 3. JavaScript helpers that already exist

These are methods and helpers, not standalone UI custom elements.

| API | Use | Verified source |
| --- | --- | --- |
| <code>Omorphia.toast(options)</code> | Notifications. Accepts a string or <code>{ title, description, variant, duration, action, onDismiss }</code>; returns <code>{ dismiss, element }</code>. | <a href="../src/js/components/toast.js">toast.js</a> |
| <code>Omorphia.confirm(options)</code> | Standard confirmation. Returns <code>Promise&lt;boolean&gt;</code>. | <a href="../src/js/components/modal.js">modal.js</a> |
| <code>Omorphia.commands.register(commands)</code> | Register command palette actions. | <a href="../src/js/components/command-palette.js">command-palette.js</a> |
| <code>Omorphia.theme.get/set/toggle()</code> | Read or change <code>data-ui-theme</code> (<code>dark</code>, <code>light</code>, or <code>auto</code>). | <a href="../src/js/index.js">index.js</a> |
| <code>Omorphia.icons</code> | Check/register/load Lucide icons. | <a href="../src/js/icons.js">icons.js</a> |
| <code>Omorphia.version</code> | Read the bundled version. | <a href="../src/js/index.js">index.js</a> |

Toast variants in source: <code>success</code>, <code>danger</code>, <code>error</code>, <code>warning</code>, <code>info</code>, and <code>neutral</code>. Default duration is 5000 ms; <code>duration: 0</code> keeps it open until dismissed. Use this API instead of inventing a notification/toast component.

## 4. CSS primitives: native HTML with Omorphia styling

**These are not custom elements.** Use the native HTML element shown and apply the matching class. Do not write a custom tag because the class begins with <code>ui-</code>.

### Form fields and controls

| Need | Correct markup pattern | Important distinction |
| --- | --- | --- |
| Text, email, number, password, search inputs | <code>&lt;div class="ui-input"&gt;&lt;input ...&gt;&lt;/div&gt;</code> | <code>.ui-input</code> is a wrapper, not <code>&lt;ui-input&gt;</code>. |
| Textarea | <code>&lt;div class="ui-textarea"&gt;&lt;textarea ...&gt;&lt;/textarea&gt;&lt;/div&gt;</code> | <code>.ui-textarea</code> wraps a native textarea. |
| Select | <code>&lt;div class="ui-select"&gt;&lt;select ...&gt;...&lt;/select&gt;&lt;/div&gt;</code> | <code>.ui-select</code> is a wrapper, not <code>&lt;ui-select&gt;</code>. |
| Checkbox | <code>&lt;label class="ui-check"&gt;&lt;input class="ui-check-input" type="checkbox"&gt; ...&lt;/label&gt;</code> | Native checkbox. |
| Radio | <code>&lt;label class="ui-radio"&gt;&lt;input class="ui-radio-input" type="radio"&gt; ...&lt;/label&gt;</code> | Native radio. |
| Switch | <code>&lt;label class="ui-switch"&gt;&lt;input class="ui-switch-input" type="checkbox" role="switch"&gt;&lt;span class="ui-switch-track"&gt;&lt;/span&gt; ...&lt;/label&gt;</code> | Native checkbox with switch styling. |
| Range | <code>&lt;input class="ui-range" type="range"&gt;</code> | Native range input. |

Use <code>.ui-field</code>, <code>.ui-label</code>, <code>.ui-hint</code>, <code>.ui-error-text</code>, and <code>.ui-success-text</code> to compose a labelled field. Use <code>data-state="error"</code> or <code>data-state="success"</code> on <code>.ui-field</code> when following the documented validation pattern. Keep native <code>id</code>, <code>for</code>, <code>name</code>, <code>required</code>, <code>disabled</code>, and ARIA attributes.

~~~html
<div class="ui-field">
  <label class="ui-label" for="email">Email</label>
  <div class="ui-input">
    <ui-icon name="mail"></ui-icon>
    <input id="email" name="email" type="email" autocomplete="email" required>
  </div>
  <p class="ui-hint">Used for account updates.</p>
  <p class="ui-error-text">Enter a valid email address.</p>
</div>
~~~

### Buttons and button groups

Use <code>&lt;ui-button&gt;</code> by default. Native <code>&lt;button class="ui-btn ..."></code> is supported for cases where the native element itself is required. Related buttons should use a cohesive group (<code>.ui-btn-group</code>) rather than separate unrelated treatments.

### Navigation primitives

- Breadcrumbs: <code>&lt;ol class="ui-crumbs"&gt;&lt;li class="ui-crumb"&gt;...&lt;/li&gt;&lt;/ol&gt;</code>.
- Simple navigation: <code>&lt;nav class="ui-nav"&gt;&lt;a class="ui-nav-link" href="..."&gt;...&lt;/a&gt;&lt;/nav&gt;</code>.
- Dropdown menu row classes such as <code>.ui-menu-item</code>, <code>.ui-menu-label</code>, <code>.ui-menu-shortcut</code>, and <code>.ui-menu-item--danger</code> are used inside <code>&lt;ui-dropdown&gt;</code>; do not create a separate menu web component.

### Feedback primitives

These are class-based patterns, not custom tags:
- Alerts: <code>.ui-alert</code>, <code>.ui-alert--info</code>, <code>.ui-alert--success</code>, <code>.ui-alert--warning</code>, <code>.ui-alert--danger</code>, <code>.ui-alert-title</code>, <code>.ui-alert-desc</code>.
- Badges: <code>.ui-badge</code>, <code>.ui-badge--accent</code>, <code>.ui-badge--success</code>, <code>.ui-badge--warning</code>, <code>.ui-badge--danger</code>, <code>.ui-badge--info</code>.
- Status: <code>.ui-status</code> with <code>.ui-status--online</code>, <code>--away</code>, <code>--busy</code>, <code>--info</code>, or <code>--live</code>.
- Progress: <code>.ui-progress</code> with <code>.ui-progress-bar</code>; set <code>--value</code> and accessible progressbar attributes. <code>.ui-progress--indeterminate</code> is available.
- Loading: <code>.ui-spinner</code>; skeletons: <code>.ui-skeleton</code>, <code>.ui-skeleton--circle</code>, <code>--title</code>, <code>--block</code>.

### Containers and layout primitives

- Cards: semantic <code>&lt;article class="ui-card"&gt;</code> with <code>.ui-card-header</code>, <code>.ui-card-body</code>, <code>.ui-card-title</code>, <code>.ui-card-desc</code>, and <code>.ui-card-footer</code>.
- Avatars: a native <code>&lt;span class="ui-avatar"&gt;</code> or a wrapper with an image; modifiers include <code>.ui-avatar--sm</code>, <code>--lg</code>, <code>--xl</code>, <code>--square</code>, <code>--circle</code>; groups use <code>.ui-avatar-group</code>. Optional <code>data-status</code> styles a status dot.
- Collapsible content: native <code>&lt;details class="ui-collapsible"&gt;&lt;summary class="ui-summary"&gt;...&lt;/summary&gt;&lt;div class="ui-collapsible-body"&gt;...&lt;/div&gt;&lt;/details&gt;</code>. No JavaScript component is needed.
- Dividers: <code>.ui-divider</code> and <code>.ui-divider--vertical</code>.
- Layout: <code>.ui-stack</code>, <code>.ui-row</code>, <code>.ui-row--nowrap</code>, <code>.ui-grid</code>, <code>.ui-grow</code>, <code>.ui-cluster-between</code>; spacing helpers include <code>.ui-gap-1</code> through <code>.ui-gap-6</code> and <code>.ui-p-3</code> through <code>.ui-p-5</code>.
- Typography: <code>.ui-display</code>, <code>.ui-h1</code>, <code>.ui-h2</code>, <code>.ui-h3</code>, <code>.ui-body</code>, <code>.ui-small</code>, <code>.ui-caption</code>, <code>.ui-muted</code>, <code>.ui-faint</code>, <code>.ui-text</code>, <code>.ui-link</code>, <code>.ui-code</code>, <code>.ui-kbd</code>.

Inspect the linked CSS before depending on a class that is not listed here. Do not assume all utility names from another framework exist.

## 5. Common false assumptions: do not use these as custom elements

The following are **not registered custom elements** in the current library. Some matching class names exist, which is why the distinction matters.

| Incorrect assumption | Correct implementation |
| --- | --- |
| <code>&lt;ui-input&gt;</code> | Native <code>&lt;input&gt;</code> inside <code>.ui-input</code> |
| <code>&lt;ui-textarea&gt;</code> | Native <code>&lt;textarea&gt;</code> inside <code>.ui-textarea</code> |
| <code>&lt;ui-select&gt;</code> | Native <code>&lt;select&gt;</code> inside <code>.ui-select</code> |
| <code>&lt;ui-checkbox&gt;</code> / <code>&lt;ui-radio&gt;</code> / <code>&lt;ui-switch&gt;</code> | Native input with <code>.ui-check</code>, <code>.ui-radio</code>, or <code>.ui-switch</code> pattern |
| <code>&lt;ui-card&gt;</code> | Native <code>&lt;article class="ui-card"&gt;</code> |
| <code>&lt;ui-alert&gt;</code> / <code>&lt;ui-badge&gt;</code> / <code>&lt;ui-avatar&gt;</code> | Native element with the corresponding <code>.ui-*</code> class |
| <code>&lt;ui-progress&gt;</code> / <code>&lt;ui-spinner&gt;</code> / <code>&lt;ui-skeleton&gt;</code> | Native element with the corresponding <code>.ui-*</code> class |
| <code>&lt;ui-collapsible&gt;</code> | Native <code>&lt;details class="ui-collapsible"&gt;</code> |
| <code>&lt;ui-menu&gt;</code> / <code>&lt;ui-menu-item&gt;</code> | <code>&lt;ui-dropdown&gt;</code> with native menu children |
| <code>&lt;ui-dialog&gt;</code> / <code>&lt;ui-confirm&gt;</code> | <code>&lt;ui-modal&gt;</code> or <code>Omorphia.confirm()</code> |
| <code>&lt;ui-table&gt;</code> / <code>&lt;ui-date-picker&gt;</code> / <code>&lt;ui-calendar&gt;</code> / <code>&lt;ui-file-upload&gt;</code> / <code>&lt;ui-chart&gt;</code> | No built-in custom element is registered for these in the current source. Use semantic native HTML and application logic, or explicitly plan a genuinely new feature. |

This is not an exhaustive list of possible invented names. **Any <code>&lt;ui-...&gt;</code> element not present in Section 2 must be verified in the current source before use.** Never assume a CSS class creates a custom element.

## 6. What to do when the library does not have a match

Follow this decision order. Do not jump straight to custom code.

1. **Use the exact existing component.** Prefer the matching Omorphia custom element for supported behavior.
2. **Compose existing elements.** For example, use <code>ui-popover</code> with switch primitives for a display-settings panel; do not create a new settings-popover component.
3. **Use native HTML with Omorphia CSS primitives.** This is the correct answer for inputs, checkboxes, cards, alerts, breadcrumbs, progress, and other class-based patterns.
4. **Use plain semantic HTML with existing tokens and CSS conventions** when no matching primitive exists. Do not pretend it is a built-in component.
5. **Create a project-local custom component only when the requested behavior genuinely requires reusable logic that cannot be composed from the library.** Name it as an application-specific extension, keep its API small, document why Omorphia did not fit, and avoid duplicating a supported control.
6. **Modify Omorphia itself only when the user asks for a library-level feature or approves that change.** A new public component requires source implementation, registration/export where appropriate, styles, accessibility and theme support, tests, a showcase example, README/API documentation, a component-catalog update, and a build-generated <code>dist/</code> update.

A missing feature is not permission to silently replace all existing controls with a homemade component system. Do not add another component library or framework to avoid learning Omorphia. If the gap materially changes product scope or architecture, explain the exact missing capability and ask before proceeding.

## 7. Anti-hallucination and instruction-following rules

> [!CAUTION]
> **THE EXISTING LIBRARY TAKES PRIORITY OVER AN AI-GENERATED REPLACEMENT.**
>
> - Do not invent <code>ui-*</code> tags.
> - Do not guess attribute names, valid values, property setters, slots, event names, or methods.
> - Do not infer a JavaScript component from a CSS selector.
> - Do not treat a screenshot, visual resemblance, or a component in the separate Modernimal showcase as proof that Omorphia implements it.
> - Do not create <code>Button</code>, <code>Input</code>, <code>Select</code>, <code>Modal</code>, <code>Dropdown</code>, <code>Tabs</code>, <code>Toast</code>, or <code>Sidebar</code> wrappers when the matching Omorphia component already exists.
> - Do not install a second UI library or write parallel button/form/menu/dialog systems without explicit approval.
> - Do not ignore the inventory and claim that a homemade element is "equivalent" when the existing Omorphia component fits.

If an instruction conflicts with a real implementation detail, inspect the current source and explain the discrepancy. Never modify the API in your imagination to make an example work. Keep the exact version in view, especially when the consuming app pins a CDN release.

## 8. Required component audit before delivery

Before calling UI work complete, run this audit:

- Search the changed markup for every <code>&lt;ui-</code> tag. Verify each tag against Section 2 and the exact-version source.
- Search for every custom-looking handler, event listener, attribute, method, and slot. Verify it against component source.
- Confirm class-based patterns use native HTML. In particular, confirm <code>.ui-input</code>, <code>.ui-textarea</code>, <code>.ui-select</code>, <code>.ui-card</code>, <code>.ui-alert</code>, and <code>.ui-badge</code> have not been turned into custom tags.
- Confirm an existing Omorphia control was not recreated in app-local CSS/JS.
- Confirm CSS is loaded from the matching Omorphia version and component behavior is actually registered. A missing stylesheet or failed bundle load is an integration bug to diagnose, not a reason to replace the component.
- Test real interactions: disabled/loading states, keyboard/focus, open/close, selection, responsive behavior, theme consistency, and reduced motion as relevant.
- If a custom piece remains, document the exact library gap and why composing existing primitives was not sufficient.

Include a brief **Component reuse audit** in the delivery report: name the Omorphia components/classes reused and identify any custom UI with a clear reason. A statement such as "used Omorphia" is not enough.

## 9. Source map

- Registration and public JS exports: <a href="../src/js/index.js">src/js/index.js</a>
- Shared custom-element helpers: <a href="../src/js/core.js">src/js/core.js</a>
- Actual working component examples: <a href="../index.html">index.html</a>
- Component styles: <a href="../src/css/">src/css/</a>
- Public API and installation: <a href="../README.md">README.md</a>
- Build generation: <a href="../scripts/build.mjs">scripts/build.mjs</a>
- Runtime and showcase verification: <a href="../tests/smoke.mjs">tests/smoke.mjs</a>, <a href="../tests/showcase.mjs">tests/showcase.mjs</a>

**When uncertain, inspect source. Do not guess. Reuse first. Extend only when the gap is real.**
