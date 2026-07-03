# Retrofit path — existing codebase

Greenfield installs everything at `error` from day one. Retrofit is a staged migration —
the goal is *monotonic tightening*: nothing that passes today may regress, and each stage ends
with a gate flipped to `error` permanently.

## Stage 0 — Inventory (read-only)

- Count violations per future gate before changing anything:
  - raw elements outside the future `components/ui`: wire the lockdown block with all rules at
    `warn`, run `eslint -f json`, and tally by rule.
  - dynamic styling: grep `:class`/`:style` usage outside the base dir — often near zero; if
    large, plan extra time for variant props.
- Decide the base dir. If a de-facto "ui kit" folder exists, adopt it as `components/ui` and
  move stragglers in; don't create a parallel second kit.

## Stage 1 — Tokens under the existing UI

- Add `tokens.css` (primitives + semantic tokens). Do NOT delete the default palette yet —
  legacy classes still depend on it.
- Add `ui/tokens.ts` maps + the layout/text primitives (they can coexist with legacy
  components).
- New code rule from this moment: new pages/components compose base components + tokens only.
  Enforce socially/review-level until Stage 3 flips lint.

## Stage 2 — Convert tier by tier

Order that minimizes churn:

1. **Layouts** (few files, high visibility) — replace raw chrome with `Box as="nav"` etc.
2. **Shared/reusable components** — every conversion here auto-fixes many pages.
3. **Pages**, domain by domain.

Per file: replace layout `div`s with `Box`/`Stack`/`Grid`/`Inline`; wrap text in
`Heading`/`Text`/…; push any genuinely new look into a base component variant or token
(expect to add tokens weekly — that's healthy, not scope creep).

The raw-text gate will also surface components that should be REGISTERED text-bearing rather
than call sites to fix — check the component's template: slot inside styled text element →
register; slot in plain div → fix call sites.

## Stage 3 — Flip gates to `error`

Flip per-rule as its violation count hits zero: usually `no-restricted-v-bind` first (often
already clean), then static attrs, then raw elements, then raw text (largest tail). Once a rule
is `error`, it never goes back.

## Stage 4 — Kill the default palette (LAST)

`--color-*: initial` breaks every remaining off-token color at once — do it only after
Stages 2–3, when a grep for default-palette classes
(`(bg|text|border|ring|fill|stroke)-(red|blue|gray|zinc|…)-[0-9]`) is clean. Then verify per
`verification.md` (bundle grep + probe).

## Anti-patterns during retrofit

- Long-lived `eslint-disable` islands — each one is a page that will never get converted.
  Prefer keeping the rule at `warn` repo-wide over `error`+disables.
- Converting pages before the base catalog covers their needs — you'll invent raw-element
  workarounds under deadline. Build the missing primitives first (Stage 1/2 interleave).
- "Temporary" `class` passthrough props to ease migration — they become permanent and defeat
  the whole system. Never add them.
