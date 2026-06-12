# Schema Evolution — versioning, upcasters, replays

Change taxonomy (compatible vs breaking) → es-fundamentals boundaries.md. Here: strategy + machinery + operations.

## Strategy ladder

1. **Stay compatible while possible.** Add optional attributes; add mandatory w/ defaults. Zero consumer impact, zero machinery. Works until it doesn't.
2. **Version the fact type** on breaking change. New revision of "Customer Registered" → revision marker (store's revision column / type suffix). Old facts don't disappear — immutability — so SOMETHING must handle both shapes forever. Two options:
   - **Handle-both in consumers**: every projector/fold matches old + new shapes, maps old → current meaning w/ defaults. Explicit, zero machinery; code grows a dead-shape branch per revision per consumer. Fine for 1–2 revisions, rots beyond `[opinion]`.
   - **Upcasters** (below): translate once, centrally — consumers see only latest shape.
3. **Stream migration** — rewrite stream, facts converted to new schema, old stream deprecated. Internal-cleanup tool: own context's streams when revision chains got long. Forcing external consumers onto new streams rarely flies (their migration cost, your negotiation). Heavyweight: full copy + cutover + consumer repointing — budget as small project.

## Upcasters

**Problem.** Revision chains spread version-handling into every consumer. **Solution.** Translation layer at fact-loading: old shape upgraded step-by-step to current before any handler sees it. Rest of codebase lives in present tense.

Design rules:
1. **One upcaster per revision step** (v1→v2, v2→v3). Chain composes; loading v1 runs whole chain in order. Ordering = explicit config — define it, don't trust discovery luck.
2. **Operate on raw representation** (JSON/serialized form), not typed classes. Why: old shape's class may be deleted; raw form always exists. Upcast = data migration in flight: add field w/ default, rename key, restructure.
3. **Keep deprecated shapes referencable**: type name + revision needed for matching ("can this upcast?"). Quarantine in `versioned` package, deprecation-marked `[opinion]` — also enables migration tests.
4. **Pure function discipline**: deterministic, no lookups, no IO. Upcaster doing DB queries = replay performance grave + nondeterministic history.
5. **Defaults need business sign-off.** Backfilling mandatory field = inventing history ("which fingerprint for pre-feature facts?" = business question, modeled answer: well-known default the downstream system recognizes).

**Testing upcasters** — test the BEHAVIOR, not the JSON: apply old-revision fact (from versioned package) into the system → assert current-shape consumers produce expected outcome (read model shows default value). Passes only if chain ran. Implementation-agnostic; survives refactors.

Snapshot interaction: snapshots bypass old facts at aggregate load → upcasters never see them; snapshot payloads need own versioning or invalidate-on-change policy (es-patterns streams.md).

## Replays — operations

Design preconditions (es-design read-side.md): rebuildable projections, reset-hooks clearing state, side effects separated + no-replay marked. Operational procedure:

1. **Scope**: which processing groups? Per-projection replays (one group) >> global replays. Event model + element index = impact map: changed fact → which read models consume it (grep fact ID across model + design docs).
2. **Pre-flight**: side-effect audit current? (handler added since last audit = risk of re-fired commands/mails). Clear-hook present? Fact volume → rebuild duration estimate → stale-view window communicated to stakeholders.
3. **Execute**: stop ALL instances of the processor group (multi-node: survivor instance re-claims segments → reset silently no-ops), reset position, clear projection state (hook), restart → reprocesses from origin (upcasters making old facts current-shaped in flight).
4. **During**: projection visibly stale/empty while rebuilding. Options: maintenance notice, rebuild into shadow table + swap (zero visible downtime, double storage), off-hours run. Pick per view criticality.
5. **Verify**: row counts / spot checks vs expectations; version/position marker caught up to head.

Replay duration grows w/ total fact volume → periodically rehearse on production-sized data; a replay that takes 3 days is a design finding, not an ops finding (projection scoping, parallel segments, archived periods).

## Operational hygiene

- **Revision field from day one** even at v1 — adding versioning machinery later touches every consumer; reserving the field costs a column.
- **Contract changes = communication events**: outgoing breaking change → deprecation window, announce, dual-publish old+new where feasible (schema'd formats w/ defaults absorb most — es-design integration.md). Incoming → your translation slice absorbs (ACL doing its job).
- **Semantic changes (same shape, new meaning) = worst class**: nothing fails loudly. Catch in review: fact meaning documented in model; meaning change → new fact type, not silent reinterpretation `[opinion — strongly held in field]`.
