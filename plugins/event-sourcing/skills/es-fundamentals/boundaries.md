# Boundaries — internal vs external, versioning basics, streaming vs sourcing

## Internal vs External Facts

Two fact categories, different contracts:

- **Internal facts** (domain facts) — private to one context. Living documents of its behavior. Change freely as understanding evolves — frequent change here = healthy system.
- **External facts** (integration facts) — published API of the context. Versioned, schema-agreed, stable. Change rarely + deliberately.

### Why the split — coupling argument

Consuming another context's internal facts ≡ querying their private tables. Toolbox move #4, full chain:

1. Consumer depends on internal structure → every refactor needs consumer sign-off.
2. N consumers → N coordination conversations per change → velocity collapses; some consumers simply refuse → you're frozen.
3. Field rename you've wanted for years stays undone — 10 consumers depend on it.

Immutability softens nothing here long-term: old facts stay valid, but every structure change still ripples into all consumers' processing of future facts. Accepted services rule "API only, never the DB" applies identically — just less obvious because facts feel like "data anyone may read". `[opinion — but widely shared]` Consultants selling "everyone can read all facts, build any model!" as THE ES benefit signal inexperience; treat as red flag.

### Why the split — leaking-logic argument

Internal facts are meaningful only through context's rules. Consumer projecting "Item Added"/"Voucher Applied" must know: duplicate products merge or not? voucher per-item or per-cart? tax handling? — domain knowledge, duplicated into every consumer, drifting on every rule change. Inevitable end state: same business rule implemented N times, N−1 of them stale.

Fix: publish precomputed result. External "Cart Submitted" carries the finished cart — totals done, rules applied. Consumer processes, never recomputes.

### External fact design

- **Self-contained + generous**: everything consumer needs to act — no callbacks, no rebuilding state from our internals. Include deltas where consumers decide on changes.
- **Schema = contract**: agreed, versioned, documented.
- **Transport irrelevant**: queue, topic, file drop, HTTP — architecturally identical. Contract is the architecture; transport is plumbing.

## Versioning Fundamentals

Published data = contract; change is certain → strategy required upfront, not at crisis.

**Backwards-compatible** (consumers unaffected, ship freely):
- add optional attribute (ignorable)
- add mandatory attribute w/ default (transparently fillable)

**Breaking** (consumers must know):
- remove attribute (consumer still reads it)
- rename (remove + add in trench coat)
- semantic change, same shape — worst kind: nothing fails loudly, meaning silently wrong

**Strategies, fundamentals-level:**
1. Stay backwards-compatible while possible. Works until it doesn't.
2. Version the fact type: `Customer Registered` → `Customer Registered V2`. Consumers/projectors handle both (old facts don't disappear — immutability) → match on version, map old shape to current meaning, defaults for missing data.
3. Stream migration: rewrite stream, all facts converted to new schema, deprecate old. Internal cleanup tool mostly — forcing external consumers to re-consume rarely flies.

Handling-both-versions forever = real maintenance tax. Upcasters centralize the translation (old fact upgraded on read → rest of code sees only latest) → es-ops. Fundamental point: versioning discipline = real, manageable, mandatory cost of ES. Advice omitting it = incomplete.

## Event Streaming vs Event Sourcing

Same words ("event", "stream"), unrelated concepts. Highest-frequency confusion in the field.

|  | Streaming (Kafka et al.) | Sourcing |
|---|---|---|
| Purpose | motion — data A → B, fast, reliable | memory — durable truth of what happened |
| Unit | record (often technical: positions, sensor readings, notifications) | business fact (domain meaning, carefully modeled) |
| Stream | infinite highway, consumed as it flows | bounded business lifecycle, replayed to rebuild state |
| Volume | millions/sec normal | 10–100 facts per stream typical |
| Replay | impractical at volume, rarely the point | core operation |

**Why Kafka ≠ fact store.** Sourcing's essential read = "all facts for stream X, in order, now". Kafka reads topics/partitions, not arbitrary fine-grained streams — filtering millions of records per entity-read doesn't fly; topic-per-entity explodes operationally (management + schema overhead per topic). Possible-with-enough-effort ≠ built-for-it. Kafka shines at its actual job: transporting external facts between systems.

**They compose.** Canonical shape: streaming delivers technical records (user position lat/long) → translation at context edge converts to business facts ("Customer Entered Store") → fact store persists → projections/automations consume. Streaming = nervous system, sourcing = memory. Also outbound: external facts published VIA streaming platform. "Streaming OR sourcing" = wrong question; they answer different ones.

**Terminology hygiene helps.** "Records" for streaming payloads, "business facts" for sourcing — much confusion evaporates w/ naming alone. Streaming records often = "event-carried state transfer" (Fowler): state moving between systems, not facts being remembered.
