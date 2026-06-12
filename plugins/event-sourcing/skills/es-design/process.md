# Design Process — D0–D6

Each phase: goal → procedure → exit gate → artifact output. Backtrack freely; never skip gates.

## D0 — Preconditions

1. Locate model: `docs/event-model/<context>/`. Multi-context → one design run per context.
2. Check spine status. `verified` → proceed. Else → tell user, offer model-specs full verification first. Proceed on unverified model only w/ explicit user OK + note in `_design.md`.
3. Read spine: story, swimlanes, chapters table, open questions (BLOCKING ones unresolved → design blocked for affected slices), decisions.
4. Confirm design dir + mode w/ user if ambiguous (greenfield vs existing system extension).

Gate: model located, status known, spine internalized.

## D1 — Stack Survey

Goal: capability table grounding every later decision. NEVER skip — even greenfield ("nothing yet" = capability fact).

1. Detect via manifests + tree: language(s), build system, web framework, DI conventions, persistence (DB engines, ORMs, migration tooling), message broker(s), existing ES/CQRS framework or hand-rolled fact store, test infra (unit, integration, containerized deps), deployment shape (monolith / services), CI.
2. Existing ES machinery present → inventory its capabilities: fact store ops, processor/subscription types, replay support, upcaster support, DLQ support, snapshot support, DCB-capable store?
3. Existing non-ES system (CRUD extension scenario) → note integration surface: where do facts meet legacy tables?
4. Record capability table in `_design.md` w/ evidence (file paths). Unknowns → ask user, don't assume versions/capabilities.

Gate: capability table complete; no decision-relevant unknowns.

## D2 — Foundational Decisions (once per context)

Each: decision + rationale + stack binding + `td-N` entry. Defaults marked `[opinion]` — overridable by stack/user.

1. **Fact store**: existing DB w/ fact table(s) = default at small/medium scale (simplicity, same-transaction option). Dedicated store only w/ concrete driver. Define: table shape (global sequence, stream-id, type, version/revision, payload, metadata), append + read-by-stream ops.
2. **Serialization**: payload format (JSON default; schema'd format if contracts demand). Revision field reserved from day one — versioning hooks cheap now, painful later.
3. **Consistency posture**: per-view decision later (D4), but set default: same-transaction projections (one store) vs eventual (separate processors). Record what the stack makes cheap.
4. **Concurrency**: optimistic locking per stream via expected-version append. Name the mechanism in stack terms.
5. **Aggregate strategy**: classic aggregates default; DCB only if store supports tagged queries + conditional appends (D1 says). Mixed allowed.
6. **Module mapping**: slice → package/module per vertical-slice architecture. Rules: slice internals private, top-level = exposed surface, controlled common deps (shared fact types, aggregates). Name enforcement tool if stack has one; else convention + review.
7. **Processor infrastructure**: how automations run — framework processors w/ position tracking, broker consumers, polling workers. Must answer: position tracking? restart resume? parallelism? replay?
8. **Replay machinery**: how a projection rebuild is triggered + what clears state. Even if "manual script" — name it.
9. **Test harness**: GWT → test translation approach per slice type (write-side fixture, projection await-assert, containerized integration). Bind to detected test infra.

Gate: all nine decided + bound; `_design.md` foundational section complete.

## D3 — Streams + Aggregates (context level)

1. Map swimlanes → streams. Default: one swimlane = one stream type; instance streams keyed by identifier from model (e.g. cart-session id, product-id). Identifying attributes in model (marked or implied by GWTs) = stream-id candidates.
2. Per stream: lifecycle check — where born, where ends? Unbounded growth risk → closing-the-books design (period streams or summary facts) NOW, not as perf patch later. Snapshots = last resort, note only if lifecycle fix impossible `[opinion]`.
3. Aggregate discovery: fact clusters per stream w/ business names (model chapters/swimlanes usually said it). Nameless cluster = model smell → question back.
4. Invariant placement map: every GWT error scenario → which aggregate enforces it. One rule = one home.
5. Cross-stream invariants (rule needs facts from 2+ streams): pick strategy per [write-side.md](write-side.md) ladder — accept-stale + compensate / boundary redesign / reservation / DCB. Record per invariant w/ rationale.

Gate: every fact assigned to stream; every invariant has enforcement home; lifecycle per stream stated.

## D4 — Per-Chapter Slice Design Loop

Per chapter file (story order), per slice — design block into `design/NN-<chapter>.md` ([design-docs.md](design-docs.md)). By pattern:

- **State Change** → command handler placement (on aggregate default; external handler when infra deps needed), validation list from GWTs, facts emitted (+ ordering), sourcing handlers updating aggregate state, creation policy (which command births the stream). [write-side.md](write-side.md).
- **State View** → projection type via selection criteria (single bounded stream → live model candidate; multi-stream / large / query-shaped → DB projection; consistency-critical → same-transaction or hybrid), table/structure shape (denormalized, per-use-case, no joins), query abstraction surface. [read-side.md](read-side.md).
- **Automation** → trigger mechanism, processor design, idempotency answer, replay stance (almost always no-replay for side effects), error strategy (from model or → open question), todo-list consideration for multi-step/restartable work. [read-side.md](read-side.md) + es-patterns.
- **Translation** → inbound adapter (consumer/endpoint) in slice-private module, external payload type private, command issued, ACL note. [integration.md](integration.md).
- Outbound external facts → publishing chain + dual-write strategy. [integration.md](integration.md).

Per slice also: test plan (each GWT → named test w/ harness from D2.9), exposed surface (what other slices may use), model gaps found → model-specs open question + design block marked `blocked`.

Gate per chapter: every slice has design block w/ all sections; chapter design status set.

## D5 — Cross-Cutting Pass

1. **Error matrix**: all projectors + processors × chosen strategy (log-skip / halt-retry / DLQ / failure fact). Gaps → D4 redo or open question. DLQ note: per-stream ordering must survive parking.
2. **Replay plan**: per projection — rebuildable? reset/clear hook? side-effect handlers separated + marked no-replay? One audit table.
3. **Idempotency audit**: every processor — safe to re-deliver trigger? If not, what dedups (inbox, todo-list state, aggregate flag)?
4. **Contract inventory**: all external facts in/out — schema, version, owner, transport. Generous-payload check on outbound.
5. **Eventual-consistency windows**: list every async gap a user/rule can observe; each = accepted (documented) or closed (mechanism named). Unaccepted + unclosed = unresolved design.

Gate: four audits clean or ledgered.

## D6 — Verify + Handoff

1. Coverage: every slice in model ↔ design block. Grep slice IDs both dirs, diff.
2. Every GWT ↔ test plan entry (count per slice, compare).
3. All `td-N` decisions referenced by at least one slice (zombie decisions = smell).
4. Model gaps found during design → confirmed present in model spine ledger, not just design notes.
5. Implementation order: dependency-light slices first (State Changes before dependent State Views before Automations needing both); foundational `td` items (fact store, module skeleton) = step zero. Record ordered list.
6. `_design.md` status → `designed`. Handoff summary: counts, open questions, suggested first slice.

Session ends mid-design → D6-lite: statuses current, gaps ledgered, "where stopped" note. Design dir resumable cold, same discipline as model-specs.
