# Evolution scenarios + porting to other frameworks

## What the layering buys later

The primitive/semantic split and the no-raw-values rule look like ceremony until the first
system-wide change. These are the payoffs:

**Dark mode / theming** — composers reference decisions (`surface-card`), never values, so a
theme is *a different set of primitive values* (or re-pointed token references) behind the same
token names. Mechanically: swap the `:root` primitive block per theme (class or media query),
or use dual-value syntax (`light-dark(…)`) at the token layer. Zero composer files change.
Note the inverse: if you committed to a single theme, that's a *simplification decision*, and
un-deciding it costs only the token file — that's the point.

**Rebrand / re-skin** — new palette = new primitive values; adjusted decisions = re-pointed
tokens. Because aliased tokens stayed distinct (`info` ≠ `accent` even when equal), moving the
brand color doesn't drag status colors along.

**Density / comfort modes** — the spacing scale is a token family; a "compact" mode is an
alternative value set for `--spacing-*`. Only possible because no composer ever wrote a pixel.

**Component redesign** — a base component's skin is private; restyle it and every usage
follows. If a redesign requires touching composers, that's a leak in the API (a look that was
expressed at call sites) — find and close it.

**Design-tool sync** — purpose-named tokens map 1:1 to design-tool variables; the token file
can become generated output. The *names* are the contract with design; values flow through.

## Porting: the invariants vs the mechanisms

The system is a set of framework-free invariants. Port those; the mechanisms are whatever the
target stack offers.

| Invariant | Vue + Tailwind v4 (see `vue-design-system-setup`) | React | Svelte |
|---|---|---|---|
| One token source, primitive/semantic split | `tokens.css`: `:root` `--raw-*` + `@theme` | same CSS-var approach, or StyleX `defineVars` / vanilla-extract themes | same CSS-var approach |
| Off-token values inexpressible | `--color-*: initial` kills default palette; token maps are the only class source | StyleX: styles are typed objects, arbitrary values banned by lint; or Tailwind approach identically | Tailwind approach identically; or typed style props |
| One dir may style; typed props elsewhere | `components/ui` + lint scope | same dir convention; enforce with ESLint `files`/`ignores` scoping | same |
| No raw elements outside base | custom rule on template AST (`VElement`, fail-safe allowlist) | ESLint `no-restricted-syntax` on `JSXOpeningElement` with lowercase name not in allowlist | svelte-eslint-parser template AST, same shape |
| No raw text outside registered slots | custom rule on `VText`/mustache + registry | rule on `JSXText`/`JSXExpressionContainer` whose parent element isn't registered | rule on `SvelteText` equivalents |
| No class/style at call sites | `vue/no-restricted-static-attribute` + `no-restricted-v-bind` | ban `className`/`style` props outside base dir (`no-restricted-syntax` on JSXAttribute) | ban `class`/`style:` outside base dir |
| No passthrough escape hatch | API convention + review | stricter: also lint `...rest` spreads onto DOM elements in base components | API convention + review |
| Typed token props | TS unions from literal map keys | same (TS), or StyleX typed vars | same (TS) |
| CI-fatal, fail-safe allowlists, teaching messages | identical everywhere — this row is the system | ← | ← |

Porting order (any framework): tokens → layout+text primitives → element/text/attr lint →
probe → registry → palette kill → rules docs. Same as the Vue recipe; only the AST node names
change.

## Porting the *social* system

The tooling transfers in a day; these transfer slower and matter as much:

- **The "fix at the lowest tier" reflex** — encode it in the lint messages and the rules docs
  from day one, or every blocked composer becomes a workaround.
- **Registry discipline** — someone must own "is this really text-bearing?"; default to no.
- **The probe habit** — every port must prove its gates fire (fail-open custom rules look
  green when dead).
- **Token review culture** — challenge meaning-duplicates, not token count.

## When NOT to use this system

Honest boundaries — recommending it everywhere weakens the case where it fits:

- Marketing/one-off sites where visual novelty per page is the product — the lockdown fights
  the goal.
- Tiny projects with a single author and no AI generation — cost without the drift problem.
- Teams unwilling to make CI failures blocking — advisory gates decay into noise; don't build
  the system without the contract.

Fit is highest where the original problem lives: many parallel authors (human or AI), long
lifetime, data-dense product UI, one visual language.
