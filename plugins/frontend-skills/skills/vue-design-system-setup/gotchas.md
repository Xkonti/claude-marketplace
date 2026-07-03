# Gotcha ledger — learned from a real production implementation

Read before debugging; most "the system doesn't work" reports are one of these.

## Tailwind v4

- **Literal class maps are mandatory.** Tailwind v4 emits utilities by statically scanning
  source for class strings. `` `p-${size}` `` is invisible → the utility is never generated →
  the prop silently does nothing. Every class a primitive can produce must exist as a literal
  (that's what `ui/tokens.ts` maps are for). Symptom: token prop "works" for values used
  elsewhere, no-ops for the rest.
- **`--color-*: initial` must precede the token definitions** inside `@theme`. Order matters:
  reset first, then define. Done right, off-palette classes (`bg-red-500`) simply don't exist
  in the build output.
- **`transparent` / `current` / `inherit` survive the palette kill** — they're CSS keywords,
  not theme entries. `bg-transparent`, `border-current` keep working. (Defining
  `--color-transparent: transparent` is harmless belt-and-braces.)
- **`@theme` tokens may reference `:root` primitives via `var()`** — the generated utility
  emits `var(--color-x)` and the browser resolves the chain at runtime. Define primitives in a
  plain `:root` block *outside* `@theme` so they generate no utilities.
- **Named-size width trap.** If the theme defines only a `--spacing-*` scale and no container
  scale, utilities like `max-w-sm` can resolve against spacing (e.g. 8px) and silently collapse
  layouts. Inside `components/ui`, prefer explicit arbitrary widths for overlay surfaces
  (`w-[min(24rem,calc(100vw-2rem))]`) or define a container scale deliberately.
- **Keyframes vs individual transform properties.** Tailwind's `-translate-x/y-1/2` compiles to
  the individual `translate:` property. A keyframe that animates the `transform:` shorthand
  STACKS on top of it (element jumps during animation). Animate individual properties
  (`scale:`, `translate:`) in component keyframes.

## ESLint / vue-eslint-parser

- **Don't import eslint-plugin-vue internals.** v10+ ships bundled — there is no `lib/utils` to
  require. Custom rules reach the template AST via
  `parserServices.defineTemplateBodyVisitor` (present when vue-eslint-parser parsed the file;
  guard for its absence and return `{}`).
- **`sourceCode.parserServices` vs `context.parserServices`** — location moved across ESLint
  versions; check both (`sourceCode.parserServices || context.parserServices`).
- **Mustaches and directive expressions are both `VExpressionContainer`.** Only report ones
  whose `parent.type === 'VElement'` (rendered children); attribute/directive values have a
  `VAttribute` parent.
- **Relax `vue/multi-word-component-names`** for `components/ui/**` (single-word base names are
  the convention), `pages/**` and `layouts/**` (file-based route names). Keep the lockdown
  rules ON there — only naming is relaxed.
- **Keep the exempt glob in one constant** (`config/component-paths.cjs`) imported by every
  config that needs it. Two hand-copied globs WILL drift.

## Vue

- **Attr fallthrough can smuggle `class`.** Vue forwards a caller's `class` to a single-root
  component even without a passthrough prop. The lint bans `class=`/`:class` at every composer
  call site, which closes the practical hole — but never *add* an explicit class/style prop,
  and be deliberate if you disable `inheritAttrs`.
- **Slot content is evaluated in the PARENT's scope.** That's why the text-node rule attributes
  slot text to the host component (`<template #title>` climbs to the enclosing component) —
  and why registering a component text-bearing must be verified against the component's own
  template, not assumed from its name.

## Process

- **Probe the gates after wiring them** (see `verification.md`). A green run on already-clean
  code proves nothing.
- **Registry entries rot.** A component refactor can move a slot out of its styled text element
  while the registry still says `true` — silent hole. Re-verify entries when editing base
  component templates.
- **Prop-driven text ≠ text-bearing.** Components whose title/description are props and whose
  default slot is a plain content `<div>` (toasts, alert dialogs) must NOT be registered;
  composers compose `<Text>` inside them instead.
