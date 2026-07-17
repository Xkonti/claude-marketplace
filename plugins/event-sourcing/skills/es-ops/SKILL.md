---
name: es-ops
description: >
  Operating event-sourced systems long-term — business fact versioning + upcasters,
  replays, metadata/correlation, authorization, GDPR (crypto shredding, forgettable
  payload, data minimalism), UI integration (fenced polling, version tracking, SSE push).
  Pull for schema evolution, compliance, security enforcement, stale-UI problems, or any
  "system is live, now what" concern.
---

Lifecycle skill: system designed (es-design) + built — now it must survive years of change, regulation, users. Every guideline w/ reasoning (es-fundamentals rules: no naked assertions, steel-man, `[opinion]` marked).

## Terminology

Core unit = **business fact**. Never bare "event" in prose. Composites: business fact stream, fact store, external fact. Framework API names + proper nouns stay exact.

## Reference Files

| File | Question family |
|---|---|
| [evolution.md](evolution.md) | Schema changed — versioning strategy, upcasters, replays, testing migrations |
| [metadata.md](metadata.md) | Who/when/why per fact — correlation, causation, propagation, traceability |
| [security.md](security.md) | Who may do what — roles, modeling auth, enforcement points, testing |
| [gdpr.md](gdpr.md) | PII in immutable facts — minimalism, crypto shredding, forgettable payload, purges |
| [ui.md](ui.md) | Stale screens — fenced polling, projection versions, push notifications |

## Cross-cutting principles

1. **Day-one decisions, day-N payoffs.** Metadata strategy, revision field, PII handling = cheap at design time, brutal retrofits. When advising greenfield projects: flag these three even if unasked.
2. **Business language survives operations too.** Failure processes, data purges, period closes — model + name them as business facts/processes where business cares; infra mechanics where only ops cares. Same boundary rule as es-design.
3. **The model is the ops map.** Where is this attribute used? Which projections touch PII? What breaks if this fact changes? — event model + element index (model-specs) answers; keep it current or lose the map.
4. **Immutability is the constraint AND the tool.** Can't edit facts → corrections = new facts, deletions = key destruction or external payload removal, schema changes = read-time translation. Every ops technique here = working WITH immutability, never around it.

## Scope Handoffs

- Versioning fundamentals (compatible vs breaking taxonomy) → es-fundamentals boundaries.md; HERE = strategy + machinery + ops.
- Outbox/inbox/DLQ design → es-design integration.md + read-side.md; HERE = nothing duplicated.
- Replay-safety design rules (side-effect separation) → es-design read-side.md; HERE = running replays operationally.
- Modeling failure/auth flows → event-modeling; HERE = enforcement + machinery.
- Feature/data change requests on live system ("add field to endpoint", new screen) → es-design change-intake.md routes them model vs design; HERE = only runtime consequences (replays, versions).
