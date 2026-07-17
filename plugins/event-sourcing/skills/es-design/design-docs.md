# Design Document Format

Lives in `docs/event-model/<context>/design/`. Mirrors model layout: spine + chapter files. References model elements by typed ID (`[fact:x]`, `[slice:y]`) — same resolution rules as model-specs; design docs USE IDs, never redefine elements.

## `_design.md` — design spine

```markdown
---
context: <name>
status: draft | designing | designed | implemented
model-version: <date of model verification report used>
updated: <date>
---

# Technical Design: <Context>

## Stack Survey
| capability | finding | evidence |
|---|---|---|
| language/build | Kotlin / Maven | pom.xml |
| persistence | PostgreSQL 16, Flyway, JPA | docker-compose.yml, pom.xml |
| broker | none | — |
| ES machinery | none (greenfield) | — |
| test infra | JUnit5, Testcontainers | pom.xml |

## Foundational Decisions
- td-1 **Fact store**: PostgreSQL fact table (sequence, stream_id, type, revision, payload jsonb, metadata jsonb). Why: existing DB, small scale, same-transaction option open. Binding: Flyway migration + repository module.
- td-2 **Serialization**: JSON + revision column reserved. Why: …
- td-3 **Consistency default**: same-transaction projections. Why: one store (td-1), simplicity `[opinion]`. Per-view overrides in chapter designs.
- … (td-4 concurrency, td-5 aggregate strategy, td-6 module mapping, td-7 processors, td-8 replay, td-9 test harness)

## Streams + Aggregates
| stream | id source | lifecycle / end | aggregate | invariants enforced |
|---|---|---|---|---|
| cart-session | [cmd:add-item].aggregateId | ends at submission | Cart | max-3-items, no-empty-submit, no-double-submit |

## Cross-Stream Invariants
- <rule> → strategy (accept+compensate / redesign / reservation / DCB) + rationale

## Projection Map
| projection | serves slices | query surface / endpoints | consistency |
|---|---|---|---|
| orders-table | [slice:order-list], [slice:order-detail], [slice:vendor-orders] | GET /orders, GET /orders/:id | eventual |
| publish-todo | [slice:publish-cart] | internal (processor query) | same-tx |

## Open Design Questions
- [ ] dq-1 **BLOCKING**: <question> — blocks [slice:x] design
- [x] dq-2: <q> → <answer> (<source>, <date>)

## Implementation Order
1. td-1/td-6 skeleton (fact store + module layout)
2. [slice:add-item] …

## Audits (D5)
### Error matrix / Replay plan / Idempotency / Contracts
<one table each, see process.md D5>
```

Rules:
- `td-N` = technical decision, own numbering — distinct from model `d-N`. Model decisions never edited from here.
- `dq-N` = design question. Question about BUSINESS behavior → belongs in MODEL ledger (via model-specs ops), not here. dq = purely technical unknowns (capability, infra, stack).
- `model-version` pins which verification the design trusts. Model re-verified later w/ changes → diff chapters, re-design affected slices; Projection Map routes further to affected projections.
- Projection Map = canonical collapse record. Every State View slice → exactly one row; every projection column traces to a serving slice attribute ([read-side.md](read-side.md) grouping invariants). One map row = one implementation unit for reads — its serving slices advance status together. Changes arriving in endpoint/resource language → [change-intake.md](change-intake.md).

## `design/NN-<chapter>.md` — chapter design

Number matches model chapter file. One design block per slice:

```markdown
---
context: <name>
chapter: <Chapter Name>
designs: NN-<chapter>.md          ← model file this implements
status: pending | designing | designed | implemented
updated: <date>
---

# Design: <Chapter Name>

## Slice design: [slice:add-item]  (State Change)
Status: designed
Decisions used: td-1, td-4, td-5

**Components**
| role | responsibility | module |
|---|---|---|
| command handler (on Cart aggregate) | validate max-3, existence; emit facts | cart/additem |
| sourcing handlers | track item ids + prices for validation | cart/domain |

**Facts emitted**: [fact:cart-created] (if new stream), then [fact:item-added] — order matters.
**Creation**: this command creates stream if absent (creation policy: create-if-missing).
**Validation** (from GWTs): max 3 items → reject; …
**Consistency**: n/a (single stream).
**Errors**: command rejection = business error → surfaced to caller. Technical: per td defaults.
**Exposed surface**: none (facts only).

**Test plan**
| scenario (model) | test | harness |
|---|---|---|
| "max 3 items rejected" | AddItem_rejects_fourth_item | write-side GWT fixture (td-9) |
| "add stores fact" | AddItem_stores_fact | write-side GWT fixture |

**Notes / bindings**: <stack-specific mapping — annotations, config keys — ONLY here, never in role tables>
```

Block sections per slice type — State Change as above; variations:
- **State View**: + `Projection type` (live / db / hybrid + WHY vs criteria), `Projection Map row` (which projection serves this slice — dedicated or collapsed, w/ rationale), `Structure` (table/shape w/ index notes), `Query surface` (query object + result, the abstraction other slices call), `Consistency` (accepted window or closure mechanism).
- **Automation**: + `Trigger` (fact / schedule / poll), `Reads` (which query surface), `Issues` (commands), `Idempotency` (mechanism), `Replay stance` (no-replay mark + why), `Error strategy` (one of four, w/ business source).
- **Translation**: + `Inbound adapter` (transport, slice-private), `External payload type` (private), `Command issued`, `ACL note` (what changes when provider changes — should be: this slice only).
- **Publishing** (outbound): + `Contract` (schema + version), `Dual-write strategy` (outbox / synchronized tx / inbox-dedup consumer side), `Failure process` (DLQ vs modeled failure fact).

## Statuses + sync

- Slice design status: `pending → designing → designed → implemented`. Chapter status = lowest. Spine = lowest chapter.
- Marking `implemented` here MAY accompany model slice status `implemented` — that edit goes through model-specs rules (status + stamp).
- Design NEVER edits model content beyond statuses. Gap → model-specs open question; affected design block → `blocked: q-N` note.

## Why this format

- Mirror layout → navigation free: model chapter NN ↔ design chapter NN, agent loads pair, has full slice picture.
- Role tables framework-free + bindings quarantined in one subsection → stack swap = rewrite bindings, keep design.
- Decisions-used line per slice → D6 zombie-decision check greppable.
- Test plan inline per slice → GWT coverage check = count + compare, mechanical.
