---
name: vue-design-system-setup
description: Set up a rigid, LLM-safe design system in a Vue 3 + Tailwind v4 project — semantic design tokens, a locked-down base-component tier, and ESLint/type guardrails that make off-system styling a build error. Use when bootstrapping this system in a new Vue project or retrofitting it into an existing one.
---

# Set up an LLM-safe design system (Vue 3 + Tailwind v4)

This is the **executable recipe**: ordered phases, copy-paste assets, a verification gate after
each step. For concepts, judgment calls, maintenance, and porting to other frameworks, use the
companion skill **`llm-safe-design-system`** — this file assumes you already want the system.

Outcome: pages/layouts/components can only be built from typed base components; all visual
decisions live in one token file + one component directory; violations fail lint/build with
messages that tell the author the correct fix.

## Prerequisites

| Requirement | Notes |
|---|---|
| Vue 3, `<script setup>` | Composition API assumed throughout |
| Tailwind **v4** (CSS-first) | v3's JS-config theme doesn't support this token wiring — upgrade first, or adapt the token file to `tailwind.config` and lose the `--color-*: initial` palette kill (v3: use a theme without `colors` instead) |
| ESLint **flat config** | custom-rule wiring is flat-config syntax; migrate from `.eslintrc` first |
| `eslint-plugin-vue` (v10+) with a flat config applied | provides vue-eslint-parser for `.vue` templates |
| TypeScript + `vue-tsc` | the type gate |
| Optional: headless component lib (e.g. Reka UI) | behavior + a11y for dialogs/menus/selects; skinned once in the base tier |

**Fork now:** greenfield → follow the phases below in order. Existing codebase → read
[retrofit.md](retrofit.md) first; it re-sequences the same phases with staged gate-flipping
(palette kill LAST, not first).

## Phase 1 — Freeze the boundary

Copy [assets/config/component-paths.cjs](assets/config/component-paths.cjs) to
`config/component-paths.cjs`. Every gate binds to this one constant; never inline the glob a
second time. Create the `src/components/ui/` directory.

**Done when:** the constant exists and nothing else hardcodes the path.

## Phase 2 — Tokens

Copy [assets/styles/tokens.css](assets/styles/tokens.css) to `src/app/styles/tokens.css` and
import it in the style entry **after** `@import 'tailwindcss'`. Replace the starter palette
values (`--raw-*`) with the project's brand; keep the two-layer structure and the
`--color-*: initial` palette kill.

Read the file's header — it carries the doctrine (purpose names; primitives private; aliasing
expected; new intent → new token) that must survive your edits.

**Done when:** build output shows token vars wired and default palette absent
([verification.md](verification.md) §3).

## Phase 3 — Typed token maps + primitives

Copy to `src/components/ui/`:

- [assets/ui/tokens.ts](assets/ui/tokens.ts) — token → literal-class maps (literal on purpose:
  Tailwind v4 scans statically; see [gotchas.md](gotchas.md))
- layout: [Box](assets/ui/Box.vue), [Stack](assets/ui/Stack.vue), [Inline](assets/ui/Inline.vue),
  [Grid](assets/ui/Grid.vue)
- text: [Heading](assets/ui/Heading.vue), [Text](assets/ui/Text.vue),
  [Paragraph](assets/ui/Paragraph.vue), [Label](assets/ui/Label.vue),
  [Caption](assets/ui/Caption.vue), [Link](assets/ui/Link.vue)
- [Button](assets/ui/Button.vue) — the reference `variant × tone × size` typed-API pattern

API rule for every component you add here: **no `class`/`style` passthrough props, ever** —
variation only through typed props. One passthrough re-opens everything.

**Done when:** `gap="huge"` fails `vue-tsc`; token props visibly style a rendered page
([verification.md](verification.md) §2/§4).

## Phase 4 — Lint gates

1. Copy both rules from [assets/config/eslint-rules/](assets/config/eslint-rules/) to
   `config/eslint-rules/`.
2. Copy [assets/config/text-bearing-components.cjs](assets/config/text-bearing-components.cjs)
   to `config/` — the starter registry matches the Phase 3 components.
3. Merge the config block from [assets/eslint-config-lockdown.md](assets/eslint-config-lockdown.md)
   into `eslint.config.js`.

**Done when:** the probe fires all 9 expected errors and zero false positives
([verification.md](verification.md) §1). Do not skip the probe.

## Phase 5 — Grow the catalog

Build the app's real base components on the foundation (dialogs, menus, inputs, badges, cards,
tables…), skinning a headless lib where possible. For each new component:

- typed token props; no passthrough
- in-file JSDoc on props/emits/slots (agents read source before use)
- if it styles slotted text → add it to the text-bearing registry (verify the template first —
  prop-driven title + plain content slot ≠ text-bearing, see [gotchas.md](gotchas.md))

Strongly recommended: a dev-only gallery page per component (env-gated route tree) that itself
obeys the lockdown — living catalog + exemplar in one.

## Phase 6 — Process scaffolding

Install the agent-facing law: copy [assets/rules/](assets/rules/) (overview, design-tokens,
base-components, composing) to the repo's `.claude/rules/design/`, adjusting the `paths:`
frontmatter and file paths to the repo layout. The lint messages already point at these files —
keep the paths in sync.

Wire CI: `eslint .`, `vue-tsc --noEmit`, tests, build — all fatal.

**Done when:** the full [verification.md](verification.md) done-when checklist passes.

## When something misbehaves

[gotchas.md](gotchas.md) — Tailwind static-scan no-ops, palette-kill ordering, keyword colors,
parserServices quirks, attr-fallthrough smuggling, registry rot, named-size width trap.
