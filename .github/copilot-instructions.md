# GitHub Copilot instructions

Repository: https://github.com/aabhro/Omorphia

Treat this repository's current default branch as the source of truth for Omorphia.

Before making changes, read the root `AGENTS.md` and the complete `AI/AGENT-PROMPT.md`.

For every UI task, read [AI/COMPONENT-CATALOG.md](../AI/COMPONENT-CATALOG.md) before writing markup. Map each requirement to an exact existing Omorphia element or CSS primitive, then inspect its implementation in `src/js/` and styles in `src/css/`. Follow the verified examples in `index.html`.

**Do not invent `<ui-*>` tags or guess attributes, methods, events, or slots. Do not create parallel Button, Modal, Dropdown, Tabs, Search, Toast, or Sidebar components when Omorphia already provides them.** Distinguish custom elements from CSS classes on native HTML. Mark missing coverage explicitly and use native HTML/classes before proposing custom UI. Audit every custom tag before delivery.

For UI, component, styling, or showcase work, inspect the complete Modernimal stylesheet, `Components/Modernimal.html`, and the required `motion/` references in the public `aabhro/Stylesheets` repository. Read them directly from GitHub or clone with `git clone --depth 1 https://github.com/aabhro/Stylesheets.git /tmp/aabhro-Stylesheets`. No special access is required. If a temporary fetch fails, retry through the public raw URLs or clone before reporting a limitation. Do not claim to have read references you did not inspect.

Preserve Omorphia's framework-free native custom-element architecture, public API, theme tokens, generated `dist/` workflow, and directional top-left / bottom-right edge illumination. `src/` is the source of truth. Use `npm run build` and `npm test` to verify changes.

Follow the style-selection and approval checkpoint in `AI/AGENT-PROMPT.md` for new apps, meaningful UI features, and substantial redesigns. Avoid unnecessary preference questions for focused bug fixes and documentation-only changes.