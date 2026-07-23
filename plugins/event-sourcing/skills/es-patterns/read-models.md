# Read Model Patterns

## Database Projected Read Model

**Problem.** Queries need shapes facts don't provide directly: cross-instance lists, filters, sorting, joins-worth-of-combination — and computing that per request from many/large streams = wasteful or impossible (cross-stream ordering).

**Shape.** Projector consumes facts → maintains query-optimized table(s). Query handler reads table, returns read model. One fact → many tables fine; one table ← many facts fine.

**When.** Multi-stream sources; cross-instance queries ("all carts containing product X"); large/unbounded source streams; query patterns needing indexes; data combined from several aggregates.

**When NOT.** Single bounded stream + whole-instance view → Live Model cheaper (no table, no projector, no consistency gap). Don't pay projection infrastructure for problems you don't have.

**Trade-offs.**
- Eventual consistency by default (async projector) → every consumer inherits the staleness window.
- Infrastructure: table + migration + projector + position tracking + replay story per read model.
- Maintenance: fact schema changes ripple into projector + table → replay needed.

**Design notes.**
- Denormalize aggressively, per use case. Target: the query = one indexed select, no joins. Normalizing projections = reimporting the problem CQRS solved.
- Idempotent handlers (upsert), trust facts (no validation), processing-group isolation, reset hook for replay — full discipline in es-design read-side.md.
- Multiple source streams → ordering only guaranteed per stream; design projector so cross-stream interleaving can't corrupt (last-write-wins per key, or version columns).
- Table = disposable. Wrong shape → new projector + replay, not migration surgery. This disposability = the pattern's hidden superpower.

**Related.** Live Model (alternative), Partially Synchronous Projection (consistency fix), Lookup Tables (specialized form), es-design read-side.md (selection criteria + projector rules).

## Live Model

**Problem.** Need current view of one business instance; projection infrastructure (table, projector, eventual consistency) = overkill + introduces staleness for no gain.

**Shape.** Per request: read instance's stream from fact store → fold facts into fresh in-memory object (match on fact type, apply each) → return → discard. Nothing persisted, ever.

**When.** Single stream, bounded by lifecycle design (typ. 10–100 facts); whole-instance views (this cart's items, this todo list); consistency matters (always-current by construction — reads what's in the store NOW).

**When NOT.** Multiple streams (interleaving order not guaranteed → folding lies); unbounded streams (per-request cost grows forever — fix lifecycle first, see streams.md); cross-instance queries (would mean scanning all streams).

**Trade-offs.**
- CPU per request instead of storage + projector. Usually milliseconds — measure before rejecting (es-fundamentals M2), but it IS recurring cost.
- No query flexibility: you get the fold you wrote, no indexes, no filters across instances.

**Design notes.**
- Fresh instance per request = zero concurrency handling, zero shared state, mutable fields fine (single-threaded, discarded).
- Fold logic = same shape as projector handlers — migrating Live Model → DB projection later = moving the fold, tests on query surface stay green (why query abstraction pays).
- Derived values (totals) computed in fold = fine — see Logic Read Model rule.

**Related.** DB Projected Read Model (alternative), Logic Read Model (logic placement rule), Snapshots (if stream length forces caching), es-design read-side.md.

## Partially Synchronous Projection

**Problem.** Eventually consistent read model occasionally too stale at exactly the wrong moment: user misses own write; processor queries before projection caught up → misses items. Full synchronous projection (everything in caller's transaction) = unwanted coupling + latency.

**Shape.** Keep the async DB projection. ADD small synchronous in-memory buffer (bounded queue/deque, last N entries) filled by handler running in caller's thread. Query handler merges: DB results ∪ buffer. Buffer covers exactly the staleness window; DB catches up behind it.

**When.** Specific consumer needs near-immediate consistency on a hot path; making whole projection synchronous too costly; gap is short (buffer of 20–1000 entries covers it).

**When NOT.** Staleness actually acceptable (most cases — accept + document instead); gap unbounded (slow projector, huge backlog) — buffer can't cover it, fix the projector or go synchronous; multi-instance deployments where the write and the read land on different nodes (in-memory buffer is node-local — gap reopens; needs sticky routing or shared cache, at which point reconsider).

**Trade-offs.**
- Two data paths for one read model → merge logic + dedup (same entry in buffer AND DB).
- Replay discipline doubles: reset must clear table AND buffer together — forget one → ghost data.
- Honest framing: a hack `[opinion — widely used, attributed around the community to Greg Young]`. Effective, small, but extra moving part to explain to every maintainer.

**Design notes.**
- Buffer write must be genuinely synchronous (same thread/transaction as fact append) — async buffer = same problem, smaller window, harder to see.
- Size buffer from real gap measurements, not vibes; overflow = silently reopened gap.

**Related.** DB Projected Read Model (base), es-design read-side.md (consistency closure options ladder), es-fundamentals tradeoffs.md (why eventual consistency exists).

## Logic Read Model

**Problem.** Derived values — counts, sums, classifications — need a home. Storing in facts = fact churn when derivation rules change; dedicated automation computing them = machinery for a multiplication.

**Shape.** Read model carries computed attributes alongside projected ones. Computation runs in fold (live model) or query handler (DB projection) — sometimes persisted by projector, sometimes computed at read time.

**When.** Value derivable purely from facts already in the system; computation cheap enough for read path; rule may evolve (computing at read = rule change needs no replay, no fact versioning). ALSO: a client-side-composed multi-view screen outgrew composition (needs server-owned consolidation + one fenceable version) and the consolidation is DERIVATION → Logic Read Model is the promotion target (pure gather, no derivation → ordinary consolidating projection instead). See es-ops ui.md § No composition layer.

**When NOT.** Computation needs external calls or non-fact state — hard rule: **read model logic must be side-effect-free + derived from stored facts only**. External data needed → that's an integration (translate it in as facts first). Expensive computation on hot read path → precompute via projector or automation w/ stored fact.

**Trade-offs.**
- Logic placement debates `[opinion — this rule is one school; some teams ban read-model logic entirely]`. The side-effect-free constraint is what makes it safe: deterministic, replayable, testable.
- Computed-at-read values invisible to SQL/filters; need them queryable → persist via projector instead.

**Design notes.** Decide stored-vs-computed per attribute, record in design doc (es-design slice block). GT scenarios w/ concrete numbers pin the derivation rules ("add 5.00 € item → total 5.00 €"). The slice's `[rm:]` code anchor ties the computed read model back to the model; the drift gate keeps the derivation rule's home honest (es-design).

**Related.** Live Model, DB Projected Read Model, event-modeling (totalPrice modeling decision shape).

## Lookup Tables

**Problem.** Facts carry ids; UI needs names/images/labels. Owning data lives elsewhere (product catalog context) and changes independently — baking it into every fact = stale copies + bloat.

**Shape.** Tiny projection: id → descriptive attributes, fed by the owning context's facts (often external facts via translation: "Product Added/Updated"). Consumers join at read time: their read model delivers ids, lookup supplies display data.

**When.** Id-to-label mapping needed by views; source data mutable independently of the facts referencing it; same mapping needed in several slices.

**When NOT.** Data is genuinely point-in-time (price AT order time belongs IN the fact — looking up current price would falsify history). Decide per attribute: snapshot-semantics → in fact; current-state-semantics → lookup.

**Trade-offs.**
- Per-slice copies `[opinion]`: keep lookup tables slice-local even when identical — sharing one global lookup = coupling every slice to it (the chapter-10 disease in miniature). Cost: duplicate tiny tables + duplicate projectors. Cheap by design; the rule's value = killing the recurring "can we share it?" debate.
- Lookup contents eventually consistent w/ owning context → display may briefly lag renames. Almost always fine; document.

**Design notes.** Model explicitly (own State View slice) or treat as implementation detail — explicit preferred `[opinion]`: model ↔ implementation alignment stays checkable — concretely via the `[rm:]` code anchor + model-specs drift gate (es-design). Information completeness check forces the question "where does the name come from?" — lookup table IS the answer, sourced from owning context's facts.

**Related.** DB Projected Read Model (it's one, specialized), Translation (feeding it from external contexts), event-modeling quality.md (completeness check).

## Resource Projection

**Problem.** Several DISTINCT modeled State View read models fold the SAME fact family. One physical table + projector + replay each = duplicated projectors over the same facts, N replays where 1 does. Want one physical projection backing several modeled views — WITHOUT merging the views or their endpoints (merging kills the completeness check + the per-query version fence).

**Shape.** One physical DB projection (one denormalized table + one projector) serves SEVERAL modeled State View slices. Each slice keeps its OWN query + its OWN endpoint — 1:1, per-query; collapse is PHYSICAL only, never at the endpoint. Filters/sorting/pagination = per-query params, not a merge. Mapping = first-class artifact: Projection Map in `_design.md` (es-design design-docs.md) — projection ↔ serving slices ↔ per-slice endpoints ↔ code anchors. Model stays use-case-shaped; collapse happens ONLY at design time, ONLY on the physical layer. ("Resource" here = the shared physical resource table, not an HTTP resource endpoint.)

**When.** Several modeled views over the same fact family, none w/ special needs (below); sharing the physical table saves real projector/replay duplication. Expect this LESS than a naive entity model would — the model already consolidates by information need (one need reused across screens = ONE read model already), so many would-be collapses never arise. What's left = genuine N-distinct-needs-over-1-fact-family remainder.

**When NOT.**
- At modeling time — never merge distinct information needs into one physical-shaped read model to "match a table"; completeness check dies. One information need = one `[rm:]` (consolidation of reuse = the MODEL's job — event-modeling — not a design-time collapse).
- Served view has derived logic, same-tx/hybrid consistency, a processor consumer, or needs own version-fencing granularity → dedicated projection (es-design read-side.md grouping).
- Views only "feel" related but fold different fact families → separate projections; forced sharing = coupling.

**Trade-offs.**
- Shared-projection coupling: N views on one table → field additions renegotiate one shared shape, "who owns this column" ambiguity. Universal-model disease in miniature — bounded by invariant: every column traces to a serving slice's read-model attribute.
- Coarser staleness reasoning: one projection version for many views → fenced polling (es-ops ui.md) fences all-or-nothing.
- Contamination risk: the shared table tempts collapsing past the physical layer — one endpoint for two queries, one read model "to match the table". Antidote = endpoints stay per-query (es-ops ui.md) + change intake (es-design change-intake.md): every field addition finds its owning use case first.

**Design notes.**
- Projection Map = the artifact. Collapse w/o map entry = silent drift — the failure mode this pattern's discipline exists to kill.
- Endpoints unchanged by collapse — one per serving query, always.
- Projection code carries a `[slice:]` anchor per serving slice; the model-specs drift gate checks them.
- WITHIN a real fact-family group: start collapsed, split later when a view develops special needs — query surface abstraction keeps clients untouched, replay makes the split cheap.
- GWTs unaffected: GT scenarios still assert per-slice query results against the shared projection.

**Related.** DB Projected Read Model (base), es-design read-side.md (grouping rules + invariants), es-design change-intake.md (reverse routing), es-ops ui.md (version granularity).
