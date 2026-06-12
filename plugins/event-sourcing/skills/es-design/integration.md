# Integration Design

External systems in + out. Transport-agnostic principles; broker named only as example binding.

## Inbound — Translation slices

Shape: external payload → adapter (consumer / endpoint / file poller) → internal command → internal fact. Design rules:

1. **External payload type = slice-private.** Lives inside the translation slice's module, inaccessible elsewhere. Why: the fact that data arrives via broker X in format Y is THIS slice's secret. Provider changes transport/format → one slice rewritten, system untouched. This IS the anti-corruption layer — not a framework, a visibility rule.
2. **Adapter does translation only.** Map payload → command, send. No business logic — logic lives behind the command (decide-at-write). Translation w/ zero invariants → command handler may be pass-through (write-side.md placement notes).
3. **Transport key ≠ stream id.** Broker partition/record keys = load distribution mechanics; stream id = business identity. May coincide; never conflate in design — document both.
4. **Dedup stance.** At-least-once delivery is the realistic default → translation idempotency: natural (fact append w/ same content harmless? version-keyed?) or explicit inbox (below). State which.

## Outbound — Publishing slices

Shape: internal fact triggers processor → builds external fact from read model / fact data → publishes to transport + records publication fact. Two writes, two systems → the dual-write problem:

**Dual-write problem.** Publish-to-broker + append-publication-fact must both happen or neither. No shared transaction across store + broker → naive sequential writes leave: published-but-not-recorded (re-publish on retry → consumers see duplicates) or recorded-but-not-published (consumers never see it, system believes they did). Silent, async, brutal to debug — design answer mandatory for every outbound slice.

Strategies:

1. **Transactional outbox** `[opinion — default recommendation]`. Write outgoing payload to outbox table in SAME transaction as the publication fact. Separate relay (poller, CDC, broker-connector) reads outbox → publishes → marks done. Why default: one ACID transaction does the consistency work; relay failure = delayed delivery, never inconsistency; debuggable (outbox table = visible queue). Outbox row needs monotonic id or timestamp → relay tracks position. Delivery = at-least-once → consumers dedup (their inbox / idempotency).
2. **Synchronized transactions** (broker supports transactions + framework can bind them to DB transaction). Both commit or both roll back — mostly. Honest caveat: still two coordinators; rare windows where one commits alone → design idempotent publication + consumer dedup anyway. Less moving parts than outbox; harder to inspect mid-flight.
3. **Accept + reconcile.** Low-stakes notifications: publish best-effort, periodic reconciler diffs publication facts vs consumer acks. Only w/ SME sign-off.

**Transactional inbox** (consumer side): incoming records land in inbox table first (dedup by message id), processed from there. Buys: exactly-once-effect processing, decoupling from broker availability, replayable intake. Cost: table + processor. Use when consumers must not double-process.

## External Contract Design

Outbound external facts = published API (es-fundamentals boundaries.md owns the why; design implications here):

1. **Separate type.** Never publish internal fact as-is, even when shapes match today. Internal evolves freely only if external is its own artifact. Mapping code = the seam where versions diverge gracefully.
2. **Generous + self-contained.** Everything consumer needs to act — precomputed totals, applied rules, deltas where consumers decide on changes. Consumer rebuilding state from our internals = contract failure.
3. **Schema'd + versioned.** Explicit schema artifact (registry-backed format w/ evolution rules where stack has one `[opinion]` — defaults-on-add/remove soak up most changes w/o breaking; plain JSON + documented version field = acceptable floor). Breaking-change process per es-fundamentals/es-ops.
4. **Contract inventory** (D5.4): every external fact in/out — schema, version, owner team, transport, consumers-if-known. The inventory IS the integration documentation.

## Failure Processes for Integrations

Publication/translation failures — same four-strategy ladder as read-side.md, with integration flavor:
- DLQ on consumer adapters: park + preserve per-stream order; monitor or it's a black hole.
- **Modeled failure beats infrastructure failure** `[opinion]`: "Cart Publication Failed" fact + support process serves business better than a DLQ only ops can see — business resolves w/ customer, not w/ log files. Requires failure flow in model → else model question.
- Retry windows + escalation = business parameters (how long may a publication lag before someone acts?) → SME input, recorded in slice design.

## Testing Integrations

1. **Whole-path tests w/ real transport**: containerized broker/DB in test harness → send external payload to real topic/endpoint → await internal fact in store (inbound), or issue command → await record on topic (outbound). Why real: serialization config, topology, transactions = exactly what mocks fake away.
2. **Contract tests**: outbound payload validates against schema artifact; consumer-driven contracts where consumer teams provide them.
3. **Failure-path tests**: kill transport mid-flow (container stop) → assert chosen strategy behavior (outbox retains, DLQ parks, failure fact lands). The strategies exist for these moments — test them, not just sunny day.
