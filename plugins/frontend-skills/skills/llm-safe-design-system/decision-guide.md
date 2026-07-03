# Decision guide — where does the fix go?

The single most common maintenance event: **a composer is blocked** (lint or type error while
building a page/component). The error is a feature — it means the system is missing a
capability. The whole game is fixing it at the *lowest sufficient tier* and never at the call
site.

## The blocked-composer tree

```
Composer blocked. What's actually missing?
│
├─ A color/spacing/size ROLE that doesn't exist yet
│  ("I need a background for overdue rows")
│  → NEW SEMANTIC TOKEN. Alias an existing primitive if the value already
│    exists; add a primitive only for a genuinely new raw value.
│    Then (if consumed via a prop) a new entry in the typed token maps.
│
├─ A new LOOK of an EXISTING component
│  ("I need a smaller Button" / "a borderless Card")
│  → NEW TYPED PROP or VARIANT on that base component (size="xs",
│    variant="plain"). Never a wrapper that injects classes.
│
├─ A kind of WIDGET that doesn't exist
│  ("I need a popover" / "a stepper input")
│  → NEW BASE COMPONENT. Skin a headless primitive if the ecosystem has
│    one; compose existing primitives otherwise. Docs + gallery + (maybe)
│    registry entry are part of "done".
│
├─ Raw TEXT is being rejected
│  ├─ The text should simply be typographic content
│  │  → wrap in <Text>/<Heading>/<Label>/… (most common; not a system gap)
│  └─ The surrounding component DOES style its slotted text
│     (slot lands inside a styled text element in ITS template)
│     → REGISTER it text-bearing. Verify the template first —
│       prop-driven title + plain content slot does NOT qualify.
│
└─ The need is genuinely one-off page structure
   ("two-column area with a sticky side")
   → still the layout primitives (Box/Stack/Grid props). If they can't
     express it, extend THEIR typed props (e.g. a `sticky` or `span`
     token prop) — that's a base-tier change, not a page-tier hack.
```

**Never-list** (each re-opens the open vocabulary): `eslint-disable`, a raw element "just
here", a `class`/`style` passthrough prop, smuggling classes through attr fallthrough, reusing
a wrong-named token because the value matches.

## Worked examples

**"Manager dashboard needs green/red pay-status cards."**
Not a Button/Badge tone reuse — it's a new intent. Add tokens
`dashboard-card-positive` / `dashboard-card-negative` (likely aliasing the existing
success/danger *primitives*), then a `tone` prop on the Card (or a `StatusCard` base component
if layout differs too). The page then writes `<StatusCard tone="positive">` — zero styling
decisions left to it.

**"Text inside `<RadioGroupItem>` label gets flagged."**
Check the component's template: the default slot renders inside a styled `<label class="…">`
element it owns → genuinely text-bearing → register `RadioGroupItem: true`. (Real case: the
fix was one registry line, not call-site wrapping.)

**"Toast needs a custom body with a link."**
Toast's default slot is a plain content container (title/description are props) → NOT
text-bearing. The composer writes `<Toast …><Text size="sm">See <Link …>details</Link></Text></Toast>`.
No system change at all.

**"Designer wants 14px padding here, tokens only have 12/16."**
Don't add `--spacing-smd: 0.875rem` reflexively. First ask which existing role this *is* —
most "in-between" requests are a misapplied role, not a missing one. If the role is real
(recurs, has a name), add it; if it's one screen's taste, use the nearest token and move on.
A scale that grows a step per request stops being a scale.

## Choosing the tier when two could work

- Token vs prop: if the *value role* is reusable beyond this component → token. If it's one
  component's appearance knob → prop mapping to existing tokens.
- Prop vs new component: same element + same behavior, different skin → prop/variant.
  Different structure or behavior → new component.
- Base component vs composed reusable component: needs raw HTML/new skin → base tier. Pure
  arrangement of existing base components → reusable component in the composer tier (subject
  to the lockdown itself).
