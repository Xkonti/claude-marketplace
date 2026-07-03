---
paths:
  - 'src/app/styles/**'
  - 'src/components/ui/tokens.ts'
---

<!-- Template: adjust `paths:` and file paths to the repo layout. -->

## Token Doctrine

Single source: `src/app/styles/tokens.css`. Two layers, one file:

1. **Primitives** (`:root`, `--raw-*`) — raw values (palette). Impl detail, NOT tokens. Zero utilities. NEVER referenced outside tokens.css. Value-named (`--raw-blue-mid`).
2. **Semantic tokens** (`@theme`) — the actual design tokens. Named for PURPOSE/DECISION (`surface-card`, `text-muted`, `tone-danger`), never value (`gray-100`, `17px`). Tailwind v4 emits utility + CSS var per token.

Many tokens → one primitive = correct. `accent`, `info`, `ring` may share blue. Separate decisions, shared value. Keep distinct → one changes later w/o dragging others.

## Adding Token

New visual intent → new semantic token. Even when value equals existing token — if NAME means different thing, new token. Never reuse token because value "looks right".

1. Value new → add `--raw-*` primitive first.
2. Add `@theme` token referencing primitive: `--color-shift-conflict: var(--raw-red-deep);`
3. Consumed via prop? → add entry to typed map in `src/components/ui/tokens.ts` (literal class string — Tailwind scans statically, interpolation invisible → utility never emitted).

## Changing Value

Edit primitive or re-point token → whole app restyles. That's the point. Never "fix" color at usage site.

## Bans

- `--color-*: initial` kills Tailwind default palette. Keep it first line of `@theme`. Off-token color = build error everywhere incl. `components/ui`.
- No raw values in components — token utilities/vars only.

## tokens.ts

Typed bridge: token → literal utility class map, prop types derive from map keys (`gap="huge"` = compile error). Derived surface — tokens.css owns truth. New token → new map entry/union member. Never map to non-token class. Never reference `--raw-*`.
