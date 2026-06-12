# Trade-offs — CQRS, Consistency, Concurrency

## CQS → CQRS

**CQS** (Meyer, code-level principle): every method = command (mutates, returns nothing) XOR query (returns, mutates nothing). Never both.

**CQRS** = same idea promoted to architecture: separate model for writing vs reading. Optionally separate tech per side.

**Why split.** Read/write asymmetry. Most systems read orders of magnitude more than they write. Write side wants integrity + validation; read side wants speed + shape. One normalized model serving both → reads pay JOIN tax forever (failure shape: page view = thousands of queries; "fix" debates about bigger hardware instead of model split). Split → each side optimized independently: writes thorough, reads precomputed.

**Cost.** Two models = sync problem. Somebody must propagate write-side changes to read side. THE central CQRS trade — rest of this file.

**Conflation warning.** CQRS ⊄ ES. CQRS w/o ES: classic table + CDC pipeline filling search index = two models, no facts. ES w/o CQRS: barely exists in practice — facts on write side basically force projection-shaped reads. Direction matters: ES ⇒ (almost always) CQRS; CQRS ⇏ ES.

## Consistency Spectrum

### Option 1 — same transaction, one store

Facts + projections in same DB, updated in one transaction. Fully consistent, dead simple to reason about.

`[opinion]` Legit + underrated. Deviate only w/ concrete reason (scale, separate read tech, org boundaries). Simplicity = feature; resist resume-driven distribution.

### Option 2 — multi-store sync, synchronous

Write facts to store A + update read view in store B "at the same time". This path = failure-mode catalog; recognize before recommending:

- Store B unreachable mid-write → commit A? abort? half-state either way.
- Store B times out, outcome unknown → retry? How long? Primary transaction held open meanwhile…
- …primary transaction times out → rollback A — while B possibly applied the write after network recovered. Now B has data A rolled back. Inverted inconsistency.
- Each additional synced store (cache + search + export + …) multiplies the combinatorics.

Core lesson: sync multi-store consistency w/o coordination protocol = unwinnable; once drifted, no authority says which copy is right — **unless single source of truth exists**. Fact store = that authority: drifted view → rebuild by replay. Recovery story, not just storage choice.

### Option 3 — eventual consistency

Define: all views converge to correct state, just not instantly. Updates propagate async (projector consumes facts, fills view, ms-to-seconds behind).

**Why it dissolves (not solves) Option 2's problems.** No distributed write to coordinate → no partial-failure matrix. Failed projection update = retry later from facts; nothing held open, nothing ambiguous.

**Why it feels wrong.** Decades of write-then-read-in-same-transaction training. Most systems don't NEED immediate consistency — it just feels safer. Real-world analog everywhere: bought ebook appears in library ~30s later; commerce runs on it.

**Where it bites.** Read-your-own-write: user clicks "add to cart", next render reads stale projection → item missing → user double-adds. UX problem, solvable (same-transaction projection for that view, sync-projection pattern, UI acknowledgment patterns → es-patterns + es-ops). Bite = specific + addressable, not "ES has bad UX".

**Decision guide.** Per view, ask: cost of staleness window? Reporting/dashboards/lists → seconds of staleness free. User's-own-action feedback → handle deliberately. Business rules needing current data → write-side problem, not projection problem (aggregate or DCB → es-design).

## Concurrency

**Problem.** Two writers, same entity, no control → last write silently wins → lost update, near-undebuggable.

**Optimistic locking** = standard ES answer. Mental model = git push: push rejected unless local state current; pull (refetch), reapply, retry. No locks held, conflicts detected at write.

Mechanics: append carries expected stream version (= index of last fact read). Store compares w/ actual; mismatch → reject. Append-only makes version trivial — index only grows. Writer on conflict: reload stream (now incl. competing facts), re-validate rules against fresh state, re-append.

**Why per-stream, not per-store.** Locking entire store serializes unrelated work (≈ locking whole DB to edit one row). Stream = natural contention unit: facts of one business instance. Two carts → never conflict. Same cart, two devices → conflict, correctly.

**Why optimistic, not pessimistic.** Pessimistic (lock, work, unlock) blocks everyone + lock-leak horror stories (holder gone, table locked). Optimistic bets conflicts rare — for per-instance business streams, they are. Bet fails (hot stream, constant retries) → design smell: stream too coarse or invariant misplaced → revisit boundary (es-design).

**Cross-stream rules.** Invariant spanning streams ("cart submit needs current inventory") → per-stream locking can't see it. Options: accept staleness + compensate (business processes often exist for this — discount, alternative offer), redesign boundary, or Dynamic Consistency Boundary (tag-scoped conditional appends) → es-design.
