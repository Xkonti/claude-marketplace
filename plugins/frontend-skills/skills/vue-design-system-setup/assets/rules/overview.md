---
paths:
  - 'src/**'
  - 'config/**'
---

<!-- Template: adjust `paths:` and file paths to the repo layout (e.g. prefix `frontend/`). -->

## Design System Tiers

Rigid LLM-safe design system. Wrong visual choice = compile/lint error, not review comment.

```
design tokens (src/app/styles/tokens.css — semantic, purpose-named)
   ↓ consumed ONLY by
base components (src/components/ui — ONLY tier with raw HTML + Tailwind; typed prop APIs)
   ↓ composed by
everything else: reusable components (src/components), domain components
(src/components/<domain>), pages (src/pages), layouts (src/layouts)
```

## Hard Rules Per Tier

- Tokens: `design-tokens.md`. Single source `src/app/styles/tokens.css`.
- Base components: `base-components.md`.
- Everything above base: `composing.md`. Base components ONLY. No raw HTML. No raw text nodes. No `class`/`:class`/`style`/`:style`. No Tailwind. No CSS.

## Enforcement (all fail CI)

- ESLint gates: `no-raw-html-elements`, `no-raw-text-nodes`, `vue/no-restricted-static-attribute` + `vue/no-restricted-v-bind` (class/style), `vue/no-v-html`. All OFF inside `components/ui`, ON everywhere else (glob frozen in `config/component-paths.cjs`).
- `vue-tsc` — token props = TS unions → bad value no compile.
- Tailwind default palette DELETED (`--color-*: initial` in tokens.css) → `bg-red-500` doesn't exist, even inside `components/ui`.

## Escape Hatches

None. Lint blocks you → missing primitive/token/prop. Fix at the RIGHT tier (add token / add base component / add typed prop), never inline workaround. `eslint-disable` for these rules = design-system bug, never ship.
