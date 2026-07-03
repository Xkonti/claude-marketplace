# Token naming — the judgment calls

Tokens are the system's vocabulary; naming is the design work. Mechanics (file structure,
Tailwind wiring) live in the setup skill — this is how to *decide*.

## The three abstraction levels

| Level | Example | Use for |
|---|---|---|
| **Scale role** | `space-md`, `text-lg`, `radius-sm` | dimensions that form ordered ramps; the NAME is a rung, not a measurement |
| **UI role** | `surface-card`, `text-muted`, `border-strong`, `ring` | recurring visual roles that many components share |
| **Purpose** | `dashboard-card-positive`, `shift-conflict`, `nav-active` | domain-specific intents where the role name would under-specify *when to use it* |

Default to **UI role** — it's the level that generalizes. Reach *up* to purpose level when the
consumer is domain-specific and misuse is likely ("which green is for paid?"). Reach *down* to
scale level only for true ramps. A system of only purpose tokens explodes combinatorially; a
system of only scale tokens carries no meaning — the mix is deliberate.

## Primitives vs tokens

- Primitive (`--raw-blue-mid: #2563eb`) = a raw value. Value-named, private to the token file,
  generates nothing. NOT part of the vocabulary.
- Token (`--color-accent: var(--raw-blue-mid)`) = a decision. Purpose/role-named, public,
  generates a utility + var.

The split is what makes aliasing safe: primitives may be shared freely; tokens never reference
other *tokens* (chains hide coupling — see anti-patterns).

## Alias vs reuse — the core discipline

Question: "the value I need already exists as token X — do I use X or mint a new token?"

- Same **meaning** as X → use X. (`ring` on a new input = the existing `ring`.)
- Same **value**, different meaning → NEW token aliasing the same primitive.
  `info` and `accent` may both be the same blue today; a rebrand that moves `accent` must not
  drag `info` along. The name is the unit of change, not the value.

Test: *"If a designer changed X next month, should this usage change with it?"* No → new token.

## When to SPLIT a token

The payoff moment for the whole architecture: two consumers of one token want to diverge
("cards on the dashboard need a warmer background than cards in settings"). That's not a
special-case override — it's the signal that one token was secretly two decisions. Split it
(`surface-card` + `surface-card-dashboard`), point the new one at the right primitive, update
the divergent consumers. Cost: minutes. The forbidden alternative — a local override at the
usage site — is where drift restarts.

## Naming rules of thumb

- Name the *decision*, not the value, and not the widget instance:
  `surface-sunken` ✓ · `grey-4` ✗ · `sidebar-background-2` ✗ (instance-numbered names rot).
- Keep one axis per token family: `surface-*` (backgrounds), `text-*` (foregrounds),
  `border-*`, `tone-*`/status. Don't mint `card-border-text-…` hybrids.
- Status families come in pairs: `danger` (foreground) + `danger-surface` (tinted background).
  Keep the pairing convention uniform so compost-tier props (`tone="danger"`) can map
  mechanically.
- One value per token. Theming multiplies *values* (per theme), never token names.

## Growth budget

Adding tokens weekly is healthy; adding a token per PR that duplicates an existing *meaning*
is vocabulary rot. In review, challenge the meaning, not the count: "which existing decision
is this, if any?" is the only question.
