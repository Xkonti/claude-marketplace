---
name: es-design
description: >
  Turn verified event model spec files into technical event-sourced design docs —
  streams, aggregates, command handling, projection selection, automations, integrations,
  error handling, test plans. Framework-independent designs bound to detected project stack.
  Also owns change intake: routing live-system change requests ("add field to endpoint",
  "new screen") back through model vs design. Pull when designing implementation from a model,
  changing an already-designed system, reviewing ES architecture, or advising on
  aggregates/streams/consistency/sagas/DCB decisions.
---

Bridge skill: event model (WHAT system does) → technical design (HOW to build it, event-sourced). Output = design documents, not code. Also usable standalone as design-knowledge source for ES architecture advice — every guideline carries reasoning per es-fundamentals rules (no naked assertions, steel-man, `[opinion]` marking).

## Terminology

Core unit = **business fact**. Never bare "event" in prose. Composites: business fact stream, fact store, external fact. Framework API names + proper nouns stay exact.

## I/O Contract

- **Input**: model spec files per model-specs skill layout (`docs/event-model/<context>/`). Spine `verified` = preferred; not verified → flag to user, offer verification run first, proceed only on explicit OK.
- **Output**: design docs in `docs/event-model/<context>/design/` — spine `_design.md` (stack survey, foundational decisions) + `NN-<chapter>.md` mirroring chapter files. Format: [design-docs.md](design-docs.md).
- Model files = READ-ONLY here. Design uncovers model gap (missing rule, unsourced attribute, undecided error behavior) → route back via model-specs operations (open question / ripple procedure), never patch silently in design.

## Reference Files — read on demand

| File | When |
|---|---|
| [process.md](process.md) | Running design end-to-end — phases D0–D6 w/ gates |
| [design-docs.md](design-docs.md) | Writing design artifacts — templates, statuses, sync rules |
| [write-side.md](write-side.md) | Aggregates, streams, consistency boundaries, sagas/DCB |
| [read-side.md](read-side.md) | Projection selection, projectors, queries, errors, replays |
| [integration.md](integration.md) | Translations, publishing, dual-write, contracts |
| [change-intake.md](change-intake.md) | Live-system change requests — routing impl-language asks (endpoint / field / screen / contract) to model vs design, contamination guards |

Minimum before designing: process.md + design-docs.md.

## Hard Rules — always on

1. **Model = source of truth.** Design implements the model. Divergence discovered → model question, not design improvisation.
2. **Survey before deciding.** Stack survey (D1) precedes every technical decision. Design to capabilities present; minimal new infrastructure; never prescribe stack swap to fit a pattern — pick pattern fitting stack.
3. **Framework-independent vocabulary.** Design docs speak roles (command handler, projector, fact store), never framework annotations. Per-project binding section translates roles → stack idioms.
4. **Decide at write, evolve via facts.** Command handler validates + emits facts — NEVER mutates state. State changes ONLY in fact-sourcing handlers. Single most-fumbled ES rule; design docs must make it structurally obvious.
5. **Aggregate = validation state only.** Data not needed for a decision doesn't live in the aggregate. Queries never ask aggregates.
6. **Projection type per use case.** Live model vs DB projection vs hybrid = criteria-driven choice ([read-side.md](read-side.md)), recorded w/ rationale. No house default.
7. **Error handling = business decision.** Per automation/projection: skip, halt, DLQ, or modeled failure fact — if model doesn't answer, open question to SME, not developer guess.
8. **Replay-safe by construction.** Side-effecting handlers separated from projection updaters; side effects marked no-replay. Designed now, not retrofitted.
9. **Slice independence survives design.** One slice = one design unit = independently buildable. Cross-slice access only via exposed query interfaces + facts. Trust facts: no re-validation downstream.
10. **Every GWT → test plan entry.** Scenarios from model translate ~mechanically to executable specs; design doc says how, per slice type.
11. **Collapse recorded, changes routed.** State View slices may share one physical projection ONLY via Projection Map entry ([read-side.md](read-side.md) grouping). Change requests in implementation language (endpoint, field, resource) → [change-intake.md](change-intake.md), never direct edits.

## Workflow Summary

D0 preconditions → D1 stack survey → D2 foundational decisions → D3 streams + aggregates (context level) → D4 per-chapter slice design loop → D5 cross-cutting pass (errors, replay, contracts) → D6 verify + handoff. Detail in [process.md](process.md).

## Sibling Pulls — load triggers, not scope disclaimers

When trigger hits, PULL the sibling skill/file into context — don't just cite it:

| Trigger during this skill's work | Pull |
|---|---|
| D2 start — foundational decisions | es-ops metadata.md + gdpr.md (inputs for D2.10 metadata + PII posture) |
| D4 slice where read-side.md criteria don't settle it, or symptom matches triage (slow streams, uniqueness/allocation, consistency gap, multi-step automation, resource-API collapse) | es-patterns |
| UI-facing State Views designed; consistency closure lands on UI pattern | es-ops ui.md |
| User asks WHY, challenges an ES decision, or misconception surfaces | es-fundamentals (misconceptions.md first) |
| Model gap found; spec files need edits; new slices needed | model-specs (operations), event-modeling (Loop B) |

Pure scope boundaries (never duplicated here): versioning/upcaster machinery, replay operations, security enforcement → es-ops; modeling process → event-modeling.
