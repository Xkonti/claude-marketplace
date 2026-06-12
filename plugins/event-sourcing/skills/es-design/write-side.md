# Write-Side Design

Aggregates, command handling, streams, consistency boundaries. Every guideline w/ reasoning; `[opinion]` marks contested positions.

## Aggregate Anatomy — decide vs evolve

Two handler kinds, strictly split:

- **Command handler** — DECIDES. Validates command against current aggregate state, then emits fact(s) or rejects. Touches NO state fields.
- **Fact-sourcing handler** — EVOLVES. Applies one fact to aggregate state. No validation, no decisions, no rejections.

Why the split is non-negotiable: aggregate state is rebuilt by replaying its stream through sourcing handlers on every load. If command handlers mutated state directly, rebuild and live execution would diverge — state becomes whatever code path ran, not what facts say. With the split, state ≡ fold(facts) always. Bonus: sourcing handlers run on trusted facts → validation there = dead code by definition (decide-at-write rule).

Practical test for a design block: delete every command handler → can current state still be rebuilt? Must be yes.

Common shape: handler emits fact carrying command data; if stream doesn't exist yet and command may birth it, emit creation fact first (one command → multiple facts, ordered). Creation policy per command: always-create (duplicate id = error), create-if-missing, must-exist. Record in slice design.

## Aggregate State Minimalism

Aggregate holds ONLY data needed to validate commands. Item count if max-N rule exists; product→item map if archive-by-product exists; `submitted` flag if no-double-submit exists. NOT descriptions, images, display data — that's projection territory.

Why: aggregate loads on every write → fat state = slow writes + tempts query misuse. Queries never ask aggregates; read side exists for that (CQRS). Each new invariant earns its state field, traceable to a GWT. Field w/o invariant = delete it.

## Command Handler Placement

- **On aggregate** (default): handler sees aggregate state directly; framework/infra loads stream, hydrates, routes. Simplest.
- **External handler** (standalone component): when handling needs infra dependencies (broker client, external API) or coordinates aggregate + side effect in one transaction. Loads aggregate via repository, calls aggregate's decision method, performs infra action — transaction boundary explicit. `[opinion]` Keep aggregates infra-free; inject nothing into them.
- Translation slices often need zero validation → handler degenerates to pass-through; skipping aggregate entirely acceptable when no invariants exist on that stream (note it — future invariants reintroduce one).

## Stream Design

Stream = lifecycle of one business capability instance. Design rules:

1. **Id from the model.** Identifying attribute commands target = stream id (cart-session id, product-id). Natural business keys fine.
2. **Lifecycle bounded.** Every stream: born (creation fact) + ends (terminal fact, period close, or natural dormancy). Typical healthy stream: 10–100 facts.
3. **Unbounded stream → fix the boundary**, not the loading. "Closing the books": period-keyed streams (`register-{id}-{day}`) or summary fact carrying closing state, readers start from last summary (needs index of summary positions). Business-language fix — domain experts understand "books closed", not "snapshot". Snapshots = technical cache, last resort `[opinion]` — valid, but reach for it after lifecycle design fails, not before.
4. **Right-to-left check** (from model verification, re-run technically): every fact's attributes derivable from predecessors or explicit external input. Gap = data path missing.
5. Ordering guaranteed within stream only. Design needing cross-stream ordering = design smell → restructure or accept explicitly.

## Concurrency

Optimistic locking per stream: append carries expected version (last index read); store rejects on mismatch; writer reloads, re-validates, retries. Why per-stream + why optimistic → es-fundamentals tradeoffs.md.

Design hooks: retry policy on conflict (immediate reload-retry default; bounded attempts; surface as busy-error after). Hot-stream conflicts frequent → boundary too coarse or invariant misplaced — redesign signal, not retry-tuning signal.

## Cross-Stream Invariants — strategy ladder

Rule spans streams ("submit only if all products in stock") — per-stream locking can't see it. Pick LOWEST sufficient rung, record rationale:

1. **Accept staleness + compensate.** Validate against (possibly stale) read model; handle violations downstream via business process (notify, discount, alternative). Why first: real businesses run this way — overselling has a refund process; tech-perfect consistency often solves non-problem. Requires SME sign-off that compensation process exists → model question.
2. **Redesign boundary.** Invariant inside one stream = problem dissolved. Works when concepts genuinely cohere; merging unrelated lifecycles into mega-aggregate to host one rule = worse than the disease (hot stream, coupling).
3. **Reservation pattern.** Two-phase: reserve resource (uniqueness, allocation) in owning stream, then execute, confirm/release. Handles uniqueness-across-instances (emails, SKU allocation) w/ classic aggregates. Detail → es-patterns.
4. **DCB (Dynamic Consistency Boundary).** Per-command consistency scope: query facts by tags across the sequence, build transient decision model, conditional append (reject if tagged facts arrived meanwhile). Eliminates many saga/reservation cases. REQUIRES capable store (tagged queries + conditional append) — D1 survey gates this rung. Caveats honest: young pattern, less field experience, mental-model shift; mixed aggregate+DCB systems = current realistic expectation.

## Multi-Step Processes — coordination styles

Process spans services/contexts (order → payment → fulfillment):

- **Process coordinator (orchestration)**: central component owns process, commands each participant, handles compensation ("payment failed → release inventory"). Pro: process readable in one place, debuggable. Con: coordinator couples to every participant's API; ownership ambiguity; every participant change touches it.
- **Autonomy (choreography)**: each context reacts to external facts, owns its part + its compensations. Pro: zero central coupling, team-aligned. Con: process exists nowhere as artifact — debugging = archaeology across services.
- **Processor todo-list** `[opinion — house preference]`: state-driven, not flow-driven: read model = work list derived from facts ("carts needing publication"), processor repeatedly takes next item, acts, resulting fact removes item from list. Restartable, idempotent-by-construction, no process state machine. Often replaces saga entirely. Detail → es-patterns.

Selection: fewest moving parts that supports the failure paths the MODEL defines (failure flows are modeled, right? else → model question). Compensation = business facts + processes, not transaction rollback theater.

## Testing the Write Side

GWT from model → executable spec, near-mechanical:
- GIVEN: facts applied to aggregate (its stream history)
- WHEN: one command
- THEN: expected fact(s) in order, OR expected rejection

Harness needs: apply-facts / execute-command / assert-facts-or-error. ES frameworks ship fixtures; hand-rolled = small (~screenful: fold GIVEN through sourcing handlers, run handler, diff emitted). Properties: implementation-agnostic (tests survive aggregate rewrite), business-readable, generated-or-handwritten from model scenarios. Random data for irrelevant fields → tests pin only what scenario pins, accidental coupling avoided.

Test-first flow `[opinion]`: translate slice's GWTs before implementing; red → implement → green = slice done. Model = spec = test = done-criteria, one artifact chain.
