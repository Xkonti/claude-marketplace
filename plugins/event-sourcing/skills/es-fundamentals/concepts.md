# Core Concepts — what + why

Every entry: what → why it exists → trade-offs / breaking points.

## The Core Idea

Store what happened (business facts, ordered), not what currently is (flattened state).

**Why.** Current state = lossy compression of history. CRUD keeps the result, discards the path. Path carries answers: was customer premium before or after the move? how often did the address change? what happened in the two weeks after? State can't answer retroactively — facts can. You're adding the time dimension to data.

**Second why — flexibility.** Requirements arrive after data. Facts let you build the view you didn't know you'd need: new projection over old facts. State-first schema = bet placed at minimum knowledge (project paradox); fact-first = bet deferred.

**Cost.** Mindset shift (unlearning state-first thinking = hardest part), versioning discipline, eventual consistency handling where projections are async. Honest framing: ES trades upfront familiarity for long-term option value.

**Corollary.** No fact → didn't happen. Anything the system does worth remembering must produce a fact. Full fact sequence = story of the system, readable by business + dev.

## Business Fact

Record of something that happened. Past tense ("Item Added"), business language, immutable.

**Why immutable.** Can't change the past — deleting an order row doesn't undo the order having been placed. Modeling honesty. Practical payoff: append-only data = trivially cacheable, replicable, auditable; consumers never re-check old facts for silent edits. Fighting immutability (edit/delete facts) destroys every guarantee built on it — corrections happen via NEW facts (compensation), like accounting: wrong booking → counter-booking, never eraser.

**Why business language.** Facts double as shared vocabulary w/ domain experts. "Customer Blocked" discussable in business meeting; "blocked flag set" isn't. Tech-named facts = symptom of modeling the implementation.

**Granularity.** One fact type = one business meaning. Resist generic fact + nullable attribute soup — same trap as the one-table-fits-all-person-types schema, just relocated.

## Business Fact Stream

Ordered fact sequence for one business entity/process instance. Stream-id ≈ primary key analog. Replay stream → rebuild entity state.

**Why streams, not one global log.** Locality. You almost never need "everything that ever happened" — you need "what happened to THIS order". Streams give bounded, fast reads (typical: 10–100 facts/stream → millisecond replay) + per-stream concurrency control ([tradeoffs.md](tradeoffs.md)).

**Why small streams = design principle, not perf hack.** Stream should mirror business capability lifecycle. Insurance contract: a handful of changes/year. Cash register: one day, then books close. Stream growing unboundedly → lifecycle boundary missed in design, fix the boundary ("closing the books": new stream per period; summary fact carrying closing balance) before reaching for technical fixes (snapshots = cache, last resort `[opinion]` — works, but business-blind).

**Validation tricks.** Read one stream's facts aloud in isolation → must form coherent story. Walk facts right-to-left → every fact's attributes derivable from predecessors or explicitly external; gap = missing data source.

## Projection

View computed from facts. Table, report, in-memory model, CSV export, PDF — medium irrelevant.

**Why.** Facts optimize writing truth; queries want shaped data. Projection = the translation, per use case. Many projections per same facts, each answering one question — no universal model trying to serve everyone badly.

**Key property: derived + disposable.** Projection corrupt/stale/wrong → rebuild from facts. Fact store = single source of truth, projections = caches w/ business shape. This is the recovery argument: multi-view system w/o source of truth drifts apart w/ no way back ([tradeoffs.md](tradeoffs.md) sync-hell); w/ fact store, resync = replay.

**Trade-off.** Async projections → eventual consistency. Same-transaction projections → consistency, less decoupling. Both legit ([tradeoffs.md](tradeoffs.md)).

## Fact Store

Storage for facts. Two operations: append to stream, read stream (all / from position). No update, no delete API.

**Why so narrow.** Narrow API = the guarantee. Immutability enforced structurally, not by convention. Append-only also = mechanically fast (sequential writes, no in-place mutation, facts clustered per stream — often beats JOIN-heavy relational reads).

**Demystification.** Minimal relational schema suffices: `id` (global sequence — order matters), `stream_id`, `type`, `version` (schema evolution), `payload` (JSON/etc), `metadata` (who/when/correlation). A few tables, not exotic infra. Dedicated stores (Axon Server, EventStoreDB/KurrentDB) add scaling, multi-tenancy, tooling — adoption decision, not entry requirement. `[opinion]` Start simple, migrate later; analysis-paralysis over store choice kills more ES projects than wrong store choice.

## Application Anatomy — roles + why each exists

Flow: command → command handler → aggregate → fact(s) appended → projectors → read models ← query handlers ← queries.

- **Command** — intent. "Do this." May be rejected; rejection = the point.
- **Command handler** — single place that knows how to process given command. Structural validation, then delegate.
- **Aggregate** — consistency boundary; the bouncer. Holds business invariants ("max 3 addresses"), decides accept/reject, emits facts. State rebuilt from own stream on load. Why needed: SOMETHING must own each rule + enforce it transactionally; aggregate = that something, w/ explicit boundary. (Boundary design + DCB alternative → es-design.)
- **Projector** — reacts to new facts, updates one projection. Translation layer fact-world → query-world.
- **Query handler** — read abstraction. Client asks question, never knows storage. Why: swap projection medium (table → document → cache) w/o touching consumers.

**Why embrace async.** Distributed calls pretending to be local = leaky abstraction w/ long failure history (EJB's location transparency: remote exceptions + latency leaked everywhere, abstraction collapsed). ES backend inherently async around projections → expose that honestly to clients rather than faking sync; faking it = stale-read bugs moved into UX where they're least debuggable. (Patterns to make honest-async pleasant → es-ops UI.)
