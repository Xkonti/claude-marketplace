---
name: llm-safe-design-system
description: The judgment layer for a rigid LLM-safe design system — deciding where fixes go (token vs prop vs component vs registry), naming tokens, reviewing and auditing the system, evolving it (theming, rebrand), and porting it to any framework. Use when maintaining, reviewing, explaining, or adapting such a system; for step-by-step Vue setup use vue-design-system-setup instead.
---

# The LLM-safe design system — concepts, judgment, maintenance

This is the **decision guide**: what the system is, why each constraint exists, and how to make
the recurring judgment calls once it's running. For the **executable Vue + Tailwind v4 recipe**
(copy-paste rules, token file, primitives, verification), use the companion skill
**`vue-design-system-setup`** — don't re-derive mechanics from this file.

## The problem and the idea

LLMs write CSS fluently but without awareness of a project's prior decisions. Across many
parallel sessions each one re-invents heading sizes, paddings, and "that grey" — the UI
fragments into unre-skinnable near-duplicates. Documentation can't fix it: **prose is a
probability, not a guarantee**; over thousands of generations, off-system choices accumulate
regardless of instructions.

The fix: make compliant decisions **the only expressible ones**. Closed vocabularies (typed
props whose values are design tokens) replace open ones (any class string, any hex, any
element); deterministic tooling — types, lint, build — enforces the boundary in CI. The model
isn't trusted to know the palette; it's handed a vocabulary where most sayable words are
correct.

## The architecture in one diagram

```
1. DESIGN TOKENS   one file; PRIMITIVES (--raw-*, private values)
                   ← referenced by SEMANTIC TOKENS (purpose-named decisions;
                     aliasing expected; the only place values exist)
2. BASE COMPONENTS the only dir with raw HTML + styling; typed token-enum
                   props (variant/tone/size/gap/p); NO class/style passthrough;
                   includes layout (Box/Stack/Grid) + text (Heading/Text/…)
                   primitives so composers never need raw elements or bare text
3. COMPOSERS       pages, layouts, reusable + domain components — base
                   components ONLY; no raw elements, no raw text nodes,
                   no class/style in any form
4. GUARDRAILS      types first (bad token = compile error), fail-safe-allowlist
                   lint second (unknown things fail by default), build third
                   (default palette deleted) — all CI-fatal, every message
                   names the correct fix
```

Why each choice holds: semantic names carry intent (`dashboard-card-positive` says *when*,
`green-700` invites misuse); the primitive/semantic split makes aliasing safe (N decisions,
one value, independent futures); allowlists make vocabulary growth a reviewed act; zero escape
hatches because one passthrough prop re-opens everything; teaching messages because the lint
error is the only doc an agent reliably reads at the moment of violation.

## Route to the right reference

| You're doing… | Read |
|---|---|
| Fixing a blocked composer / deciding token vs prop vs component vs registry | [decision-guide.md](decision-guide.md) — the decision tree + worked examples |
| Naming or restructuring tokens; alias-vs-reuse; when to split a token | [token-naming.md](token-naming.md) |
| Recognizing/refusing shortcuts (passthrough props, denylists, disables, registry rot…) | [anti-patterns.md](anti-patterns.md) — each with its failure mode |
| Reviewing PRs (system-touching or ordinary) / periodic health audits | [review-and-audit.md](review-and-audit.md) |
| Adding theming/dark mode/rebrand; porting to React/Svelte/other; judging fit | [evolution-and-porting.md](evolution-and-porting.md) |
| Installing the system in a Vue project | companion skill `vue-design-system-setup` |

## The three reflexes (if you retain nothing else)

1. **A blocked composer is a missing capability, not an obstacle.** Fix at the lowest
   sufficient tier — token, prop/variant, base component, registry entry — never the call
   site. `eslint-disable` is a bug report filed in the wrong place.
2. **Names are the unit of change.** Reuse a token when the *meaning* matches; mint a new one
   (aliasing the same primitive) when only the *value* matches. "If that token's value changed
   next month, should this follow?" — no → new token.
3. **Prove the gates, don't trust green.** Custom lint rules fail open (parser absent → rule
   silently off). After setup and after every toolchain upgrade, run a deliberately-violating
   probe and count the errors.
