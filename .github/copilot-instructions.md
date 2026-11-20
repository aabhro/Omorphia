# GitHub Copilot instructions

Repository: https://github.com/aabhro/Omorphia

Treat this repository's current default branch as the source of truth for Omorphia.

Before making changes, read the root `AGENTS.md` and the complete `AI/AGENT-PROMPT.md`.

For every UI task, read [AI/COMPONENT-CATALOG.md](../AI/COMPONENT-CATALOG.md) before writing markup. Map each requirement to an exact existing Omorphia custom element, then inspect its implementation in `src/js/`, styles in `src/css/`, and verified example in `index.html`.

**Do not invent `<ui-*>` tags or guess APIs. Do not author raw `<button>`, `<input>`, `<textarea>`, `<select>`, `<option>`, or `<details>` as new UI controls.** Use the custom elements for text fields, textarea, select/options, checkboxes, radios, switches, ranges, date/time pickers, menu items, drawers, and accordions. Native controls may exist only inside Omorphia's own implementations. Use static classes for non-interactive content only. Mark missing coverage explicitly and never build a duplicate control. Audit every custom tag and authored control before delivery.

For UI, component, styling, or showcase work, inspect the complete Modernimal stylesheet, `Components/Modernimal.html`, and the required `motion/` references in the public `aabhro/Stylesheets` repository. Read them directly from GitHub or clone with `git clone --depth 1 https://github.com/aabhro/Stylesheets.git /tmp/aabhro-Stylesheets`. No special access is required. If a temporary fetch fails, retry through the public raw URLs or clone before reporting a limitation. Do not claim to have read references you did not inspect.

Preserve Omorphia's framework-free native custom-element architecture, public API, theme tokens, generated `dist/` workflow, and directional top-left / bottom-right edge illumination. `src/` is the source of truth. Use `npm run build` and `npm test` to verify changes.

Follow the style-selection and approval checkpoint in `AI/AGENT-PROMPT.md` for new apps, meaningful UI features, and substantial redesigns. Avoid unnecessary preference questions for focused bug fixes and documentation-only changes.

Floating menus, popovers, command/search panels, date/time panels, tooltips, and drawers must remain borderless and opaque. Reuse Omorphia's shared trigger-to-panel morph and accordion motion. Respect reduced motion.
