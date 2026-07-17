# UI Integration — eventual consistency meets screens

THE first-contact problem: button click → command accepted → screen re-renders → still shows old data → user clicks again. Projections update async; client can't know when they've caught up. Querying too early = stale; waiting blindly = sluggish UX. Reframe: not a bug to engineer away — a property to integrate deliberately. Reverting whole system to immediate consistency to fix one screen = paying architecture-wide costs (es-design read-side.md) for a UI problem w/ cheaper local answers.

## Structural groundwork

1. **Commands return context, not data.** Write op returns acknowledgment + COORDINATES: stream id + resulting sequence/version number. Not the updated view (that's read side's job — CQRS), but enough for the client to know WHAT to wait for. `[opinion — some call any return value CQRS-impure; returning execution context ≠ reading state, and it's the enabler for everything below]`
2. **Projections track their version.** Projector persists, per instance, the last-applied sequence number alongside projected data (or a side version table; multiple projections from one stream → version row each). Now "has this view caught up to MY write?" = comparable numbers. Collapsed resource projections serving several views (es-design Projection Map) → ONE version fences all of them; view needing finer fencing granularity → dedicated projection, weigh at grouping time (es-design read-side.md).
3. **Frontend mirrors slices.** UI components/folders per slice, same names as backend modules (command wrapper per State Change, view component per State View). Same navigability argument as vertical slices; UI change → matching slice obvious. BFF aggregation layer: skeptically `[opinion]` — convenient at first, tends to grow own logic/lifecycle + recouple slices the architecture decoupled; default to per-slice endpoints, BFF only w/ concrete multi-client driver.

## Pattern: Fenced Polling

Polling, but bounded by version knowledge — never blind:

**Client-side variant.** Command returns expected version V → client polls the query, comparing returned projection version vs V → stops at ≥V. Misses = cheap (version check), bounded (gap = ms typically, few rounds). "Fenced" = poll has a defined finish line, not a frequency habit.

**Server-side variant.** Client sends query + `expectedVersion` → SERVER holds the request until projection reaches V (async/reactive wait w/ retry-interval + hard timeout), returns fresh data once. Client code = plain request/response, polling invisible. Needs non-blocking server plumbing (don't park container threads) + timeout → error mapping. `[opinion]` Preferred default: complexity lives once server-side, every client stays dumb, works everywhere HTTP works.

**Background-change variant.** Updates w/o user action (inventory changed by another system) → no command response to learn V from. Lightweight version poll on interval ("current version?" → 304-style cheap response) → version changed → fetch data. Polls stay cheap; data transfers only on real change.

When polling wins: works through every proxy/firewall/browser, zero connection state, trivially debuggable. Eye-rolls about "old school" ≠ engineering argument `[opinion]`.

## Pattern: Push Notifications (Server-Sent Events)

Reverse the direction: client holds open connection, server notifies on change.

**Shape.** Client subscribes (SSE: one-way server→client text protocol — simpler than WebSockets, sufficient: client talks back via normal commands). Server side: projection update triggers notification to subscribers — either version-bump signal (client then fetches: notification + fenced fetch compose) or full updated data (subscription-query style: initial result on subscribe, updates streamed on every projection change).

**When.** Background-driven changes (the polling weak spot), dashboards/live views, high change-frequency screens where poll intervals = visible lag.

**Trade-offs.**
- Connection state at scale: open connection per client per subscription; HTTP/1.1 browser cap ≈ 6 per domain (tabs count!) — HTTP/2 effectively required for real apps.
- Subscription routing in multi-node deployments: the node holding the connection must learn about projection updates happening on other nodes → needs distributed subscription support (capability gate — es-design D1 survey; some stacks only deliver this w/ commercial infrastructure).
- Reconnect/missed-notification handling: client must resync on reconnect (fetch current version) — push = optimization layer over a pull baseline, not a replacement `[opinion]`.

## Selection guide

| situation | answer |
|---|---|
| user-triggered write, read-own-write screen | server-side fenced polling (default) |
| same, server can't hold requests | client-side fenced polling |
| background changes, modest freshness needs | version poll on interval |
| live dashboards, frequent background changes | SSE push (+ pull fallback) |
| one screen genuinely needs zero gap | same-tx / hybrid projection — backend answer, es-design read-side.md |

Universal rule: give the client maximum CONTEXT (which version to expect, what changed) — blind polling and blind pushing both waste the information the system already has.

## Testing

- Fenced flows: integration test = command → immediate query w/ expected version → assert fresh data (server-side variant makes this a plain two-call test, no sleeps).
- Version plumbing: projector tests assert version row advances w/ projection (forgotten version update = silent permanent staleness — the bug class this design must catch).
- Push: subscribe → command → assert notification within timeout; reconnect path tested explicitly (kill connection mid-test).
