# Review checklist + health audits

## Reviewing a PR that touches the DESIGN SYSTEM itself

Changes to tokens, the base dir, the registry, or the lint config deserve disproportionate
scrutiny — they move the guarantees for everyone downstream.

**Token file changes**
- [ ] New token names a *purpose/role*, not a value or a widget instance
- [ ] Doesn't duplicate an existing *meaning* (ask "which existing decision is this?")
- [ ] References a primitive (or is a scale value) — never another semantic token
- [ ] New raw value went in as a primitive first
- [ ] `--color-*: initial` (palette kill) still first in `@theme`
- [ ] Typed map updated if the token is prop-consumed (literal class string)

**Base component changes**
- [ ] No `class`/`style`/`sx` passthrough introduced — including "temporary" ones
- [ ] Variation added as typed props/variants; prop values are token enums, not free strings
- [ ] Colors via token utilities only
- [ ] Props/emits/slots documented in-file
- [ ] If templates moved slots around: text-bearing registry entries for this component
      re-verified (slot still inside a styled text element?)
- [ ] New component: is it really base-tier (needs raw HTML/skin) or a composition that
      belongs in the composer tier?

**Registry changes**
- [ ] Each new entry verified against the component's actual template
- [ ] Named-slot entries (`['title']`) used where only some slots qualify
- [ ] Prop-driven-text components (toast-likes) NOT registered

**Lint/config changes**
- [ ] Scaffolding allowlist additions justified (structure, not skin — would `div` reasoning
      reject it?)
- [ ] Exempt glob still bound to the single path constant
- [ ] Messages still name the fix and point at the rules docs

## Reviewing ORDINARY feature PRs

The gates already police mechanics; review for what they can't see:

- [ ] No `eslint-disable` on lockdown rules (treat any as a change request)
- [ ] Token/prop choices match *meaning*, not just value (`tone="danger"` for a destructive
      action, not because red looked right)
- [ ] New "almost-duplicate" components that should have been a variant on an existing base
      component
- [ ] Style review time should be ~zero — if you're debating pixels in a page PR, a decision
      is missing from the base tier; file it there

## Periodic health audits

Cheap greps that catch decay early — run occasionally or wire into CI:

- **Palette leak**: bundle grep for default-palette classes
  (`\.bg-(red|blue|gray|zinc|…)-[0-9]`) — expect 0. Nonzero = the kill was reverted or a
  second CSS entry bypasses the token file.
- **Disable creep**: `grep -rn 'eslint-disable.*\(no-raw-\|no-restricted\)' src/` — expect 0.
- **Registry drift**: for each registry entry, open the component template and confirm the
  slot still lands in styled text. (Worth scripting: list entries vs `<slot` context lines.)
- **Escape-hatch scan**: grep base dir for `defineProps` containing `class` / `style` props.
- **Token orphans**: tokens with no usages (candidates for removal) and near-duplicate values
  across primitives (candidates for consolidation) — informational, not violations.
- **Probe re-run**: after ESLint/plugin major upgrades, re-run the verification probe; parser
  API drift can silently neuter custom rules (they return `{}` when parserServices is absent —
  fail-open by design, so an upgrade can turn them off without an error).

That last point is the one genuinely sneaky failure: **the custom rules fail OPEN**. A green
lint run after an ESLint major bump is not evidence the gates still fire — only the probe is.
