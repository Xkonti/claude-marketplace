---
name: es-patterns
description: >
  Event Sourcing pattern library w/ selection triage — Database Projected Read Model,
  Live Model, Partially Synchronous Projection, Logic Read Model, Lookup Tables,
  Closing the Books, Snapshots, Processor Todo-List, Reservation, Modeled Failure.
  Each: problem, when, when-not, trade-offs, gotchas. Pull when picking read model
  strategy, fighting eventual consistency, slow stream loads, automation/process
  coordination, uniqueness/allocation, or reviewing pattern choices in ES designs.
---

Pattern catalog supplementing es-design. ES work = small pattern set reapplied constantly — learn shape once, recognize problem, apply. Every entry carries reasoning (es-fundamentals rules: no naked assertions, `[opinion]` marked).

## Terminology

Core unit = **business fact**. Never bare "event" in prose. Composites: business fact stream, fact store, external fact.

## Entry Format

Each pattern: **Problem** (what hurts) → **Shape** (structure) → **When** → **When NOT** → **Trade-offs** (costs introduced — every pattern has them) → **Design notes** (gotchas) → **Related**.

Selection discipline: pick by problem, not by familiarity or coolness. Cheapest pattern solving the actual problem wins. Stack capability gates apply (es-design D1 survey) — pattern requiring infra the project lacks needs justification for the infra, not just the pattern.

## Triage — symptom → candidates

| Symptom | Candidates (in evaluation order) |
|---|---|
| Need to query/display data from one bounded stream | Live Model → DB Projected Read Model |
| Need lists/filters across many streams or instances | DB Projected Read Model |
| Read-your-own-write fails; processor misses fresh data | accept+document → Partially Synchronous Projection → same-tx projection (es-design) |
| Derived values (counts, sums) need a home | Logic Read Model → (only if heavy/reused) Automation w/ stored fact |
| Display needs name/image for an id facts don't carry | Lookup Table |
| Stream grows w/o end; loads slow | Closing the Books → Summary Facts → Snapshots (last resort) |
| Aggregate load time hurts despite sane lifecycle | Snapshots |
| Background process: expiry, retries, multi-step work | Processor Todo-List |
| Cross-service process w/ compensation (saga territory) | Processor Todo-List per service → coordinator only if process MUST live in one place (es-design write-side.md) |
| Uniqueness / limited resource across streams | Reservation → DCB if store supports (es-design) |
| Failures need business-visible handling | Modeled Failure → DLQ (ops-only visibility) |
| Publish to external system atomically | Transactional Outbox (es-design integration.md) |

## Reference Files

| File | Patterns |
|---|---|
| [read-models.md](read-models.md) | DB Projected Read Model, Live Model, Partially Synchronous Projection, Logic Read Model, Lookup Tables |
| [streams.md](streams.md) | Closing the Books, Summary Facts, Snapshots |
| [processes.md](processes.md) | Processor Todo-List, Reservation, Modeled Failure |

## Patterns living in sibling skills (complete-library map)

- **Transactional Outbox / Inbox** — es-design integration.md (dual-write)
- **DCB (Dynamic Consistency Boundary)** — es-design write-side.md (cross-stream invariants)
- **Translation / Automation** (modeling-level) — event-modeling patterns.md
- **Upcasters / fact versioning** — es-ops (schema evolution)
- **Crypto shredding / forgettable payload** — es-ops (GDPR)
- **Optimistic locking per stream** — es-fundamentals tradeoffs.md
