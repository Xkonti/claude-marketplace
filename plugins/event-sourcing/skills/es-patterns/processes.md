# Process + Coordination Patterns

## Processor Todo-List

**Problem.** Background work coordination: expiries, retries, publication, multi-step processes. Naive fact-triggered handlers break three ways: replay re-fires side effects; crash mid-batch loses track of what's done; eventual consistency makes "did I already handle this?" ambiguous. Saga machinery (process state machines, orchestrators) = heavy answer.

**Shape.** Think clerk w/ paper checklist:
1. **Read model = the list.** Projection derives open tasks from system state ("todos past expiry, not yet expired", "carts submitted, not yet published"). Task ENTERS list via triggering fact(s) + conditions; task LEAVES list via completion fact.
2. **Processor works the list.** Periodically (or fact-nudged) queries list, takes each task, issues command.
3. **Completion fact closes the loop.** Command's resulting fact feeds back into the list projection, removing the task. Back-channel — data flow, not process flow.

**When.** Any automation, honestly — default coordination shape `[opinion — house preference]`. Shines for: time-based work (expiry — list query includes time condition), retryable work (failed attempt = task stays listed = retried next cycle, free), restartable work (list derived from state → crash loses nothing, next cycle re-derives), distributed processes (each service keeps own list reacting to others' external facts — compensation = task on someone's list, no orchestrator).

**When NOT.** Hard real-time reactions (polling cycle = latency floor; fact-triggered processor w/ idempotency may fit better — or nudge the todo-list processor w/ the fact and keep the list as safety net). Process genuinely needing centralized visibility/audit of ALL steps in one place → coordinator (es-design write-side.md ladder).

**Trade-offs.**
- Race window: completion fact updates list eventually → next cycle may re-grab task before checkoff lands → double execution. Answers: idempotent task execution (aggregate rejects second "expire" — decide-at-write catches it), or make back-channel synchronous (Partially Synchronous Projection / same-tx), or tolerate documented duplicates.
- Polling cost + latency floor (cycle interval). Tune per business tolerance; "within a minute" usually fine for business processes.
- Process logic distributed across list-definition + command handlers — no single process diagram in code. Mitigation: the event model IS the process documentation.

**Design notes.**
- List condition = the design core. "What puts a task ON the list, what takes it OFF" — both must be fact-derivable. Can't express checkoff as fact condition → missing fact in model → model question.
- Stuck tasks (command fails forever): task stays listed = visible backlog (good!). Pair w/ escalation: attempts counter → after N, emit failure fact → Modeled Failure process takes over.
- vs Sagas: same problems solved (distributed consistency, compensation) w/o process-instance state machines — next action derived from current facts, not from stored process position. Restartability falls out free.

**Related.** Modeled Failure (escalation), Reservation (linearizing prerequisite), Partially Synchronous Projection (race fix), es-design write-side.md (coordination ladder) + read-side.md (replay: list projector = projection, processor = side-effecting, separate them).

## Reservation Pattern

**Problem.** Limited resource contested across stream boundaries: unique email registration, last concert tickets, SKU allocation. Per-stream optimistic locking can't see the contention; cross-stream ACID unavailable (es-fundamentals). Validating against a read model = check-then-act race.

**Shape.** Two phases, linearized through a resource-owning point of contention:
1. **Reserve**: claim the resource in the structure that OWNS it. Owning structure = aggregate whose stream id IS the resource (stream-per-email: existence/`reserved` flag = the lock — store guarantees one stream per id, so first claim wins, second hits the flag and rejects). Alternative: DB unique constraint table when a relational store is already in the loop.
2. **Execute**: on successful reservation, perform the guarded action (create account). Then confirm; on failure, release (or expire) the reservation so the resource frees up.

Whole reserve→execute cycle often fits one request — pattern's about ownership structure, not async ceremony.

**When.** Uniqueness across instances; allocation of countable scarce resources; workflow steps needing linearization ("registration before order") w/o shared transactions.

**When NOT.** Resource owned within ONE existing stream (its aggregate just validates — no pattern needed); store supports DCB (tagged conditional appends solve uniqueness w/o reservation aggregates — es-design write-side.md ladder rung 4); contention so hot that a per-resource stream becomes the bottleneck (rare; then DB-constraint variant or redesign).

**Trade-offs.**
- Extra aggregate type w/ purely-guard semantics — domain model gains a technical-ish citizen (mitigate: name it from business language — "Email Registration", not "EmailLock").
- Abandoned reservations: reserve succeeded, execute died → resource stuck. Needs release/expiry design (timeout fact + todo-list processor sweeping stale reservations — patterns compose).
- Resource-as-stream-id: natural keys in ids (email in stream id) — PII implications → es-ops GDPR before shipping.

**Design notes.**
- Aggregate variant beats DB-constraint variant on consistency-of-paradigm (everything stays facts + aggregates, ~50 lines); DB variant beats it on team familiarity `[opinion — pick per team, record in design doc]`.
- Reservation fact + released/confirmed facts = honest audit trail of contention — bonus CRUD unique-constraints never gave you.

**Related.** DCB (modern alternative, store-gated), Processor Todo-List (stale-reservation sweep), es-fundamentals tradeoffs.md (why cross-stream ACID isn't a thing).

## Modeled Failure

**Problem.** Technical failure handling (exceptions, DLQs, retry logs) invisible + meaningless to business. But many failures ARE business reality needing business response: publication failed → customer service should call; payment failed → offer alternative. Burying these in ops tooling = support flying blind + no audit trail.

**Shape.** Failure = first-class business fact ("Cart Publication Failed", "Payment Refund Failed") + modeled recovery flow: failure fact → state view (failed-items list, often a support UI) → human or automated process resolves → resolution fact closes it. Failure flow modeled in event model like any other flow (alternative flow, event-modeling).

**When.** Failure has business meaning + business response (someone besides ops cares); recovery involves human judgment (support, account manager); audit of failures + resolutions required; error rates = business metric.

**When NOT.** Purely technical transients (DB blip, network timeout) w/ zero business semantics → retry/DLQ machinery fits (es-design read-side.md four-strategy ladder). Don't pollute the domain w/ infrastructure weather.

**Trade-offs.**
- More modeling + implementation: failure facts, recovery slices, support views — real scope. That's the point (failures deserve design), but budget it.
- Boundary discipline: which exceptions convert to failure facts vs propagate? Rule of thumb: business-recoverable → fact; infrastructure-retryable → infra strategy. Ambiguous cases → SME question, not developer guess (es-design hard rule 7).

**Design notes.**
- Tests change shape: scenarios formerly expecting errors now expect failure facts — model first, then GWTs, then code (the chain holds).
- Pairs w/ todo-list: failure facts = tasks on a resolution list; resolution fact checks off. Support UI = state view over that list.
- "In business there are no exceptions, only processes" — the reframe that sells this to stakeholders + makes systems humane to operate.

**Related.** Processor Todo-List (resolution machinery), es-design integration.md (publication failures), event-modeling phases.md (alternative flows).
