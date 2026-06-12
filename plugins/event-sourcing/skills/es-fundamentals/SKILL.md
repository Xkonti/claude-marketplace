---
name: es-fundamentals
description: >
  Event Sourcing mental model + argumentation — business facts, fact streams, projections,
  fact store, CQRS, eventual consistency, concurrency, internal vs external facts,
  streaming-vs-sourcing, misconception rebuttals. Pull as background when designing/reviewing
  anything event-sourced. Pull when user asks ES questions or wants advice/opinion —
  every claim here ships w/ its reasoning, not just "how it's done".
---

Event Sourcing = persistence approach: store **business facts** that happened, in order, instead of flattened current state. Sum of facts = state. Not an architecture style, not a niche weapon — a way to handle data.

This skill: understanding + argumentation. Two consumption modes:
1. **Inform decisions** — agent working on ES-adjacent task → load relevant ref, apply trade-offs correctly.
2. **Advise human** — user asks ES question → answer w/ full reasoning chain, honest caveats, marked opinions.

## Terminology

Core unit = **business fact**. Never bare "event" in prose.
- business → process + rules, not tech
- fact → set in stone, purely informative, never transient

Composites: business fact stream, fact store, external fact. Proper nouns (Event Sourcing, CQRS, Event Streaming) + framework/API names stay exact. Industry says "event" — when quoting/citing external material, keep theirs; in your voice, business fact.

## Content rules — how to use this knowledge

1. **No naked assertions.** Every concept in refs carries its why. Repeating claim w/o reasoning = misuse. User asks "why X?" → reasoning chain exists, use it.
2. **Steel-man first.** Misconceptions believed for real reasons. Acknowledge the legit kernel before countering — else advice reads as dogma.
3. **Opinion marking.** Refs tag contested positions `[opinion]` w/ rationale + counterposition. Relaying to user → keep distinction visible: "field consensus" ≠ "one practitioner school argues". Never launder opinion into fact.
4. **Honest trade-offs.** ES costs exist: mindset shift, weaker tooling familiarity, eventual consistency UX work, versioning discipline. Hiding costs = bad advice.

## Argument Toolbox

Six reusable reasoning moves. Compose for novel questions:

1. **Time dimension lost** — CRUD flattens history into current state. Questions about "when/how often/in what order" become unanswerable retroactively. Facts keep the story → answer tomorrow's questions w/ yesterday's data.
2. **Decide at write, trust at read** — business rules enforced once, where facts get stored. Downstream consumers trust stored facts. Re-validating on read = redundant logic, drift risk.
3. **Stream mirrors business lifecycle** — stream boundary = lifecycle of business capability (order, contract, register-day). Perf, clarity, design all follow from this one principle. Stream too big → lifecycle missed, not "ES slow".
4. **Internal facts = private DB** — letting outsiders consume internal facts ≡ letting them query your tables. Same coupling, same velocity death. API rule applies: publish stable external contracts.
5. **Project paradox** — biggest decisions land when knowledge is lowest. Defer what you can; prefer approaches that keep options open. Facts keep ALL options open — that's their core economic argument.
6. **Business language test** — would domain expert understand the term? "Customer Blocked" yes; "blocked flag set" no. Applies to fact naming, stream design, pattern choice (summary fact "Register Closed" beats technical "snapshot" talk).

## Reference Files — read on demand

| File | Question family |
|---|---|
| [concepts.md](concepts.md) | What is X? — facts, streams, projections, fact store, app anatomy |
| [tradeoffs.md](tradeoffs.md) | What does it cost? — CQRS, consistency spectrum, eventual consistency, concurrency |
| [boundaries.md](boundaries.md) | How do systems talk? — internal/external facts, coupling, versioning basics, streaming vs sourcing |
| [misconceptions.md](misconceptions.md) | "Isn't ES …?" — rebuttal playbook + opinionated FAQ. First stop for advice mode |

## Scope Handoffs

Here = understanding + why. Elsewhere:
- Modeling process → event-modeling skill
- Stream/aggregate boundary design detail, DDD, sagas, DCB → es-design skill
- Read model / projection pattern selection → es-patterns skill
- Versioning implementation (upcasters, replays), GDPR, metadata, UI integration → es-ops skill
