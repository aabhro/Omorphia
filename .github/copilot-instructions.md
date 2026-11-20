# GitHub Copilot instructions

Repository: https://github.com/aabhro/Omorphia

Treat this repository's current default branch as the source of truth for Omorphia.

Before making changes, read the root `AGENTS.md` and the complete `AI/AGENT-PROMPT.md`.

For UI, component, styling, or showcase work, inspect the complete Modernimal stylesheet, `Components/Modernimal.html`, and the required `motion/` references in the public `aabhro/Stylesheets` repository. Read them directly from GitHub or clone with `git clone --depth 1 https://github.com/aabhro/Stylesheets.git /tmp/aabhro-Stylesheets`. No special access is required. If a temporary fetch fails, retry through the public raw URLs or clone before reporting a limitation. Do not claim to have read references you did not inspect.

Preserve Omorphia's framework-free native custom-element architecture, public API, theme tokens, generated `dist/` workflow, and directional top-left / bottom-right edge illumination. `src/` is the source of truth. Use `npm run build` and `npm test` to verify changes.

Follow the style-selection and approval checkpoint in `AI/AGENT-PROMPT.md` for new apps, meaningful UI features, and substantial redesigns. Avoid unnecessary preference questions for focused bug fixes and documentation-only changes.