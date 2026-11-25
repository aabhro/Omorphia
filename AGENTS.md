# Omorphia agent instructions

> [!IMPORTANT]
> **AI AGENTS MUST READ THIS FILE AND `AI/AGENT-PROMPT.md` BEFORE TAKING ACTION IN THIS REPOSITORY.**
> For any task that changes the interface, components, styling, showcase, or user experience, the complete Modernimal guide and its required component and motion references are mandatory reading too. Do not skip them, summarize them from memory, or treat the links as decorative references.

These instructions apply to coding agents, autonomous agents, pair-programming assistants, and AI tools editing this repository.

**Canonical repository:** https://github.com/aabhro/Omorphia. Treat this repository and its current default branch as the source of truth.

## Mandatory reading

1. Read this file and the complete `AI/AGENT-PROMPT.md` before planning or editing.
2. For every UI, component, styling, or showcase task, read the complete [verified Omorphia component catalog](AI/COMPONENT-CATALOG.md) before writing markup. Use it to identify the exact existing element or CSS primitive.
3. For UI, component, styling, or showcase work, read the full [Modernimal Stylesheet](https://github.com/aabhro/Stylesheets/blob/main/Styles/Modernimal%20Stylesheet.md). Do not rely on the README excerpt or the reusable prompt alone.
4. Inspect the canonical [Modernimal component reference](https://github.com/aabhro/Stylesheets/blob/main/Components/Modernimal.html).
5. Inspect the complete [motion reference](https://github.com/aabhro/Stylesheets/tree/main/motion): read `README.md`, `SKILL.md`, and `catalog.md`; inspect `tokens.css`, `patterns.css`, and `motion.js`; use `demo.html` to verify behavior when relevant.
6. Inspect the actual Omorphia files involved in the task, their imports, tests, build scripts, and existing behavior before changing them.

**Public reference access:** `aabhro/Stylesheets` is public. Read the linked files directly from GitHub or clone the repository with `git clone --depth 1 https://github.com/aabhro/Stylesheets.git /tmp/aabhro-Stylesheets` for complete local inspection. No authentication or prior checkout is needed. If a temporary network or tooling issue blocks a file, retry through the public raw file URL or clone before reporting the exact limitation. Do not silently skip mandatory references or claim to have read files you did not inspect.


## Mandatory component-first gate

> [!CAUTION]
> **DO NOT WRITE OR GENERATE A REPLACEMENT COMPONENT BEFORE CHECKING THE OMORPHIA INVENTORY.**
>
> Omorphia now provides 46 registered custom elements, including custom text fields, textareas, selects, checkboxes, radios, switches, ranges, date/time pickers, menu items, drawers, and animated accordions. The complete verified list is in the catalog. Do not guess from CSS names or screenshots.

Before implementing any interface:
1. Read [AI/COMPONENT-CATALOG.md](AI/COMPONENT-CATALOG.md) in full.
2. Read the exact relevant implementation under `src/js/` and styles under `src/css/`. Confirm names, attributes, values, methods, events, properties, and slots from source.
3. Inspect the matching working example in `index.html`.
4. Write a compact component map: user need → exact Omorphia element or CSS primitive → source file. Mark unsupported needs as `NO BUILT-IN COMPONENT`.
5. Reuse or compose the existing API. Do not replace it with app-local `Button`, `Modal`, `Dropdown`, `Tabs`, `Toast`, `Sidebar`, or similar wrappers.
6. If a fit is missing, mark it `NO BUILT-IN COMPONENT`, document the exact behavior gap, and stop before adding a native interactive control or replacement. Ask for approval before introducing a new app-local or library-level custom component.

**Never invent a `ui-*` tag or guess an API.** The registered `<ui-input>`, `<ui-textarea>`, `<ui-select>`, `<ui-date-picker>`, `<ui-time-picker>`, `<ui-checkbox>`, `<ui-radio>`, `<ui-switch>`, `<ui-range>`, `<ui-menu-item>`, `<ui-drawer>`, and `<ui-accordion>` elements are real controls. Static classes such as `.ui-card` and `.ui-alert` are not custom elements. The Modernimal component showcase is a separate visual reference, not proof of an Omorphia API.

Before delivery, search all changed markup for `<ui-` tags and verify every tag and API against the catalog and source. Include a short Component reuse audit in the completion report. For a new public component inside Omorphia, update source, registration/exports, tests, showcase, README, this catalog, and generated distribution files.

## Custom-controls-only rule

> [!CAUTION]
> **DO NOT AUTHOR RAW NATIVE INTERACTIVE CONTROLS IN NEW UI. USE OMORPHIA CUSTOM ELEMENTS.**

Do not write raw `<button>`, `<input>`, `<textarea>`, `<select>`, `<option>`, or `<details>` as application controls. Use the matching custom element: `ui-button`, `ui-input`, `ui-textarea`, `ui-select`/`ui-option`, `ui-checkbox`, `ui-radio`, `ui-switch`, `ui-range`, `ui-date-picker`, `ui-time-picker`, `ui-menu-item`, `ui-accordion`/`ui-accordion-item`, and the existing modal, popover, drawer, navigation, and search components.

Native primitives are permitted only inside Omorphia's own custom-element implementation where needed for browser text editing, keyboard access, or form submission. Do not copy those internal primitives into app markup. Static semantic structure and documented layout classes remain acceptable for non-interactive content.

Floating surfaces have **no visible borders**. Do not add borders or outlines to menus, dropdowns, popovers, command panels, search panels, tooltips, drawers, or date/time panels. Use spacing, contrast, layering, and restrained shadow for separation. Buttons and input controls may use their established border tokens. Reuse the shared trigger-to-surface morph for popovers/dropdowns/select/date/time pickers. Keep accordion exit behavior and reduced-motion handling intact.

## Design-style choice

For a new app, new feature with meaningful UI, or substantial redesign, have a short preference conversation before implementation. Unless the user already specified the direction, offer these choices conversationally:

- **Modernimal (recommended):** the near-black editorial system in the Stylesheets repository. Read and apply its full stylesheet, components, and motion references.
- **Another Stylesheets direction:** ask which named stylesheet the user wants, then inspect that stylesheet and its related component and motion references in full.
- **Keep the existing project's style:** preserve the current visual system and use Modernimal only for decisions the user asks to change.
- **Custom direction:** use the user's written brief, references, or approved examples as the design authority.

Do not silently choose a different style. Do not ask again when the user has already made the choice. Summarize the proposed direction and ask what they would like changed. Wait for approval before implementing a new app or substantial UI direction. For a specific bug fix, test fix, documentation-only change, or small maintenance task, do not create an unnecessary design interview; preserve the existing direction and proceed.

For Modernimal-based apps, ask the user to choose or approve an accent color before implementation and provide a real way to change it later. This app-level accent requirement does **not** authorize changing Omorphia's public default tokens, theming contract, or component API without an explicit request.

## Repository-specific engineering rules

- Omorphia is a framework-free, CDN-first UI library built with native custom elements and plain CSS. Preserve that architecture. Do not introduce a UI framework or a runtime dependency without an explicit user request and a clear technical reason.
- `src/css/` and `src/js/` are the source of truth. `scripts/build.mjs` generates the distribution files in `dist/`. Never hand-edit generated `dist/` files. Regenerate them with the build command when source changes require distribution updates.
- `index.html` is the component showcase. Showcase-only styles and behavior belong in `showcase/`, not in the library source unless they are part of the public component implementation.
- Keep the public custom-element names, attributes, events, slots, methods, theming tokens, and documented behavior stable. Treat changes to them as API changes and update documentation and tests.
- Preserve Omorphia's signature directional edge illumination: a brighter top-left light and a dimmer bottom-right reflection, masked to the edge. Do not replace it with a generic full outline, permanent glow, or unrelated border effect.
- Keep the library's framework-free browser usage and CDN bundles working. Consider both the classic global API and ES module entry points when changing public JavaScript.
- Update focused tests and relevant showcase examples when behavior changes. Avoid unrelated refactors, speculative features, and generated documentation filler.
- Keep accessibility, keyboard behavior, focus management, reduced motion, responsive layouts, and light/dark theme consistency intact.

## Required verification

Use the repository's own scripts and CI expectations:

1. `npm ci` when dependencies need installing.
2. `npm run build` to regenerate generated distribution files.
3. `npm test` to run the smoke and showcase checks.
4. Inspect the final diff. Confirm generated files are build output, examples match the public API, and no unrelated files changed.

Report which commands actually ran and any remaining gaps. Never claim a test, browser check, or visual inspection passed unless it was performed.

## Source of truth

The detailed execution workflow, style-selection checkpoint, Modernimal rules, and verification checklist live in [`AI/AGENT-PROMPT.md`](AI/AGENT-PROMPT.md). Read it in full.