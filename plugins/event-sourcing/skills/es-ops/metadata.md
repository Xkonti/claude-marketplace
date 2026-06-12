# Metadata — context per fact

## Payload vs metadata boundary

- **Payload** = business-relevant data: what the fact means. Modeled in event model, validated by completeness check.
- **Metadata** = context about the recording: who triggered, when, from where, as part of which process. Key-value map alongside payload, persisted with it.

Boundary test: does business logic READ it? → payload. Only tracing/audit/infra reads it? → metadata. Misplacements hurt both ways: business data hidden in metadata escapes the model's completeness check; tracing data in payload bloats contracts + pollutes domain (device fingerprints, session ids, IPs = usual metadata suspects — also usually PII → gdpr.md applies to metadata too, commonly forgotten).

## Standard fields

Per fact, minimum viable set:
- **fact id** — unique per fact
- **timestamp** — recording time
- **causation id** — id of the message that DIRECTLY caused this fact (usually the command id). Answers "what triggered this exact step?"
- **correlation id** — id propagated UNCHANGED across the whole process from its first trigger. Answers "what else belongs to this flow?"
- **user/actor id** + **session id** where applicable

Causation = parent pointer (one step up); correlation = family name (whole tree). Both, not either: causation reconstructs the chain link-by-link, correlation fetches the whole story in one query. Debugging distributed flows w/o them = archaeology; with them = `grep correlation-id` across stores + logs.

## Propagation design

Metadata attached EARLIEST possible (command creation, at the edge: HTTP layer, consumer adapter) then propagated automatically command → fact(s) → triggered commands → their facts. Manual propagation = guaranteed gaps — humans forget; this must be plumbing:

1. **Provider components** (pluggable per concern): given current execution context, contribute metadata entries. One for correlation/causation, one for auth context (security.md), one per custom need (cart-session id from request cookie).
2. **Execution-context capture at the edge**: request-scoped storage (thread-local or equivalent — careful w/ async/virtual-thread runtimes: context must flow across thread hops or metadata silently drops) set per request, read by providers, cleared after.
3. **Automation hop rule**: processor issuing commands from a fact must copy correlation forward + set causation = triggering fact's id. Edge-capture doesn't cover background hops — explicit plumbing in processor infrastructure (es-design D2.7 component), easiest forgotten link.

Framework support (e.g. correlation providers auto-copying configured keys message-to-message) = use it; hand-rolled = same shape, small code.

## Consuming metadata

- **Handler injection**: handlers receive metadata values on demand (annotation/parameter) — projections recording "who did it", auth checks (security.md).
- **Logging bridge**: push correlation/causation/user into log context (MDC-style) at handling start → every log line self-locating. Logging matters LESS in ES (fact store = built-in data trail) but cross-team debugging still runs on logs — one shared correlation id linking logs ↔ facts = the payoff.
- **Audit queries**: "everything user X did Tuesday" = metadata query across streams. If audit = business requirement, design store indexes for it; if business reads audits routinely → promote to proper read model (projection over metadata).

## Day-one warning

Metadata = classic "later" trap: retrofitting correlation onto a live system = touching every edge + processor, and history already recorded w/o it stays dark forever (can't upcast context that was never captured). Wire providers + propagation in the skeleton, even if first entries = timestamp + correlation only `[opinion — cheap insurance, universally regretted when skipped]`.
