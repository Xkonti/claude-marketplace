# Anti-pattern catalog — each with its failure mode

Every entry here has the same shape: it looks like a pragmatic shortcut, and it structurally
re-opens what the system closed. Recognize them in review; refuse them in your own work.

## The escape-hatch prop (`class` / `style` / `sx` passthrough)

*"Just this once, let callers tweak it."* One passthrough prop on one base component re-opens
the **entire** open vocabulary — any composer can now inject `class="text-[#f00] p-[3px]"`
through a "compliant" component, and every guarantee downstream of it is gone. The failure is
silent: lint stays green (the class lives in a prop value), and drift returns exactly where
it's hardest to grep. There is no acceptable version of this. Missing variation → typed
prop/variant.

## The denylist

*"Ban divs, h1–h6, spans… that should cover it."* A denylist permits everything nobody thought
of — `figure`, `dialog`, `details`, the next HTML element to ship. New things must **fail by
default** (allowlist) so growing the vocabulary is a deliberate, reviewed act. Same for the
text-bearing registry: unlisted component + raw text = error, not benefit-of-the-doubt.

## The doc-only rule

*"CLAUDE.md says never use raw Tailwind."* Anything expressed only in prose is a probability,
not a guarantee — over thousands of generations, some percentage ignores it, and violations
compound silently. Every rule that matters must be a compile/lint/CI failure. Docs explain the
*why* and the *fix*; they never carry the enforcement.

## `eslint-disable` as a fix

A disable comment on a lockdown rule is a bug report filed in the wrong place: it records
"the system was missing a capability here" and then hides it. Treat each one as a defect —
find the missing token/prop/component, add it, remove the disable. Ship-with-disable is how
retrofits die.

## The stale registry `true`

A component was text-bearing; a refactor moved its slot out of the styled text element; the
registry still says `true`. Now raw text flows into a plain div, lint-clean — a silent hole
that no failing test marks. Registry entries are claims about *another file's template*;
re-verify them whenever base component templates change.

## Token-to-token reference chains

`--color-button-bg: var(--color-accent)` (semantic → semantic) feels DRY but hides coupling:
re-pointing `accent` now silently restyles things that were never decided to follow it, and
the dependency is invisible at both call sites. Keep the graph two-level: primitives ← tokens,
nothing else. Shared value → both tokens alias the same *primitive*.

## Value-named "semantic" tokens

`--color-grey-4`, `--color-blue-light` in the token layer — names that describe the value
carry no intent, invite by-appearance selection, and become lies the moment the value changes
(`blue-light: #someGreen`). Value names belong to primitives only, where nobody chooses by
them.

## The wrapper-component laundering trick

A composer can't write classes… so someone creates `components/FancyBox.vue` in a composer
tier whose whole job is to be a thin wrapper — except wrappers in composer tiers are also
lockdown-policed, so instead they put it *in the base dir* to get the exemption, with a
`class` prop. That's the escape-hatch prop wearing a costume. Base-dir membership is a
responsibility (typed API, tokens only), not an exemption to hand out. Review anything added
to the base dir for exactly this.

## Migration half-measures that never end

- Long-lived `warn` + per-file disables → pages that will never convert.
- "Temporary" passthrough props "until migration finishes" → permanent.
- Killing the default palette *first* for shock value → hundreds of simultaneous breakages,
  team revolts, system rolled back. Palette kill goes LAST.

## Instance-named tokens

`--color-sidebar-bg-2`, `--spacing-header-gap-final` — tokens minted for one widget instance,
numbered when the first name was taken. They're not decisions, they're screenshots. The fix at
review time: identify which *role* the instance actually wants; rename or merge.
