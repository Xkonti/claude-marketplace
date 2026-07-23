# Read-Side Design

Projection selection, projectors, query abstraction, error handling, replay. Reasoning attached; `[opinion]` marks contested.

## Projection Type Selection

Per State View slice — criteria, not dogma:

| criterion | Live model | DB projection | Hybrid (partial live) |
|---|---|---|---|
| streams involved | one | many | many + hot window |
| stream size | bounded (lifecycle-designed) | any | any |
| consistency | always-current by construction | eventual (or same-tx if configured) | near-current |
| query shape | whole-instance views | arbitrary queries, filters, cross-instance lists | as DB projection |
| infra cost | none (compute per request) | table + projector + position tracking | DB projection + small cache |
| rebuild story | trivial (nothing stored) | replay needed | replay + cache warmup |

**Live model**: per request, read instance's stream, fold facts into fresh in-memory object, return, discard. Why it works: bounded stream = milliseconds; fresh instance per request = zero concurrency handling, zero eventual consistency, zero storage. Constraint: single stream (cross-stream fact ordering not guaranteed → folding multiple streams live = subtle bugs). Don't pre-reject on perf instinct — measure against actual stream sizes (es-fundamentals M2).

**DB projection**: projector consumes facts, maintains query-optimized table(s). When: many streams (all-instances lists), big/unbounded sources, query patterns needing indexes/filters. Table design: per use case, denormalized flat, no joins target, index what the query touches. One fact → many tables fine; one table ← many facts fine. Schema disposable — wrong shape → new projector + replay, no migration archaeology.

**Hybrid (partially synchronous)**: DB projection + small synchronous in-memory window (last N facts) merged at query time — closes the eventual-consistency gap for the hot path while DB catches up async. When: automation/view needs near-current data but full sync coupling unwanted. Detail → es-patterns.

**Same-transaction projection**: projector subscribed synchronously, projection commits w/ fact append. Kills eventual consistency for that view. Costs: write latency grows per projection added; projection bug can roll back business transaction; write/read scaling coupled. Legit w/ single store at moderate scale `[opinion]` — deliberate per-view choice, not house default.

Decision recorded in slice design block: type + WHY against criteria + consistency window stated (accepted or closed).

## Projection Grouping — the collapse step

Model = information-need-shaped views (one need reused across screens = ONE read model already — model consolidated it; completeness stays checkable). Implementation MAY back several DISTINCT State View slices w/ ONE physical projection when they fold the same fact family. Collapse is PHYSICAL ONLY: each slice keeps own query + own per-query endpoint (1:1 — never merge queries into a resource endpoint; that's forbidden composition, es-ops ui.md). Expect FEWER collapses than a naive entity model — model already merged reuse; what remains = genuine N-needs-1-fact-family case. Full pattern + trade-offs → es-patterns Resource Projection.

Rules:

1. **Collapse = recorded decision, never silent.** Every grouping lands in Projection Map (`_design.md`, [design-docs.md](design-docs.md)): projection ↔ serving slices ↔ per-slice endpoints ↔ code anchors.
2. **Two invariants, grep-checkable** (D5 audit):
   - every State View slice appears in exactly one Projection Map row
   - every projection column traces to ≥1 serving slice's read-model attribute. Column w/o slice attribute = untraceable data — same red flag as model completeness check, one layer down.
3. **Dedicated projection still earns keep** for: derived/logic-heavy views, consistency-critical views (same-tx, hybrid), processor-feeding lists (todo-lists), views needing own fenced-polling version granularity (es-ops ui.md — shared projection = one version fencing ALL its views), server-owned consolidation promoted from client composition (es-ops ui.md).
4. **Query surface unchanged by collapse.** WITHIN a real fact-family group: start collapsed, split later (new projectors + replay, clients untouched — cheap). But collapse ONLY genuine same-fact-family groups — the model already merged cross-screen reuse, so most read models stand alone. Don't manufacture a shared table to look tidy.
5. **Later changes in endpoint/resource language** → [change-intake.md](change-intake.md), NOT direct column edits. Field addition finds its owning use case in the model first; Projection Map then carries it down.
6. **Endpoints stay 1:1 per query — always.** Collapse never merges endpoints. Shared projection still exposes one endpoint per serving query (filters/pagination = that query's params). One endpoint serving 2+ queries = composition = forbidden (es-ops ui.md). Projection Map endpoint column lists one per serving slice.

## Projector Design

1. **Idempotent handlers.** Upsert beats insert; delete-if-exists beats delete. Why: redelivery + replay both re-run handlers; idempotency makes both boring.
2. **Position tracking.** Processor must know what it processed (resume after restart, no double-apply, no gaps). Framework feature or own offsets table — D2.7 named it; every projector design states its mechanism.
3. **Processing groups / isolation.** Each projection independently configurable (error strategy, sync/async mode) + independently resettable. One projector = one concern; mixing concerns in one handler class couples their failure + replay behavior.
4. **Trust facts.** No business validation in projectors — write side guaranteed validity. Projector errors = technical (DB down, mapping bug), handled by error strategy, never by re-checking rules.

## Query Abstraction

Other slices + UI query via query surface (query object → result object), never via projection internals (tables, repositories). Why: implementation swap (live → DB → cache) invisible to consumers; slice independence survives; the ONE abstraction worth its cost here `[opinion]` — it's the slice's public API. Projection internals live module-private (D2.6 enforcement).

## Error Handling — four strategies

Per projector/processor, chosen w/ business input (hard rule 7):

1. **Log + skip.** View tolerates a missed fact temporarily (stale display data; downstream process catches discrepancies). Cheapest; data self-heals on next fact or replay. State WHY staleness is acceptable, source it (SME).
2. **Halt + retry (backoff).** View must not silently diverge → processor stops, retries until fixed. Honest about needing ops attention; everything behind it waits.
3. **DLQ.** Park failing fact + ALL subsequent facts of same stream (ordering preserved per stream — replaying out of order corrupts projections), rest of world continues. Buying time, not absolution: parked sequence needs resolution process + monitoring. Unmonitored DLQ = strategy 1 w/ extra steps.
4. **Modeled failure fact.** Failure = business reality → emit "X Failed" fact, business process handles (support UI, customer contact). Business people understand processes, not exceptions. Requires failure flow in MODEL → if absent, model question, not design improvisation.

Matrix audit in D5 forces explicit choice everywhere.

## Replay Design

Replay = reset projection position → reprocess history. THE superpower (new fields, bug fixes, new projections over old facts) — IF designed for:

1. **Rebuildable**: projection clearable + derivable from facts alone. Reset hook clears state pre-replay (truncate table). Projection w/ non-fact inputs = not rebuildable → document loudly.
2. **Side effects ≠ projections.** Handler updating tables NEVER also sends commands/mail/records; side-effecting handlers live separately + marked no-replay. Why: replay re-runs handlers — projection re-write harmless (idempotent), re-archived carts / re-sent mails = incidents. Design-time separation (hard rule 8); retrofit = auditing every handler under pressure.
3. **Multi-instance**: reset requires all processor instances of that group stopped — else surviving instance keeps position claim. Ops note in replay plan.
4. Upcasters make old facts current-shaped during replay → versioning concerns stay out of projectors (→ es-ops).

## Eventual Consistency Closure Options

Async gap user/rule observes (D5.5 list) → per gap:
- **Accept + document** (most gaps; staleness invisible) — w/ SME source.
- **Same-transaction** that one view (costs above).
- **Hybrid window** (partial live model).
- **UI patterns** (optimistic ack, poll-until-version, push) → es-ops.
Undecided gap = unresolved design, not a footnote.

## Testing the Read Side

- **Projection tests**: drive system w/ commands (or applied facts), await + assert on QUERY SURFACE — not on tables. Why: implementation-agnostic; live→DB swap keeps tests green. Async projections → await-until-asserted w/ timeout.
- **GT scenarios** map directly: GIVEN facts → THEN query result rows (concrete data from model).
- **Processor tests**: GIVEN trigger facts → THEN expected resulting fact in store (the automation's output, not its mechanics). Containerized real deps (DB, broker) for integration honesty → harness per D2.9.
