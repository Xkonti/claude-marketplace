# Stream Length Patterns

Three answers to "stream too long", ordered business-first → technical-last. Evaluate in this order `[opinion — house rule, reasoned below]`: business-aligned fixes survive requirement changes + stay explainable to domain experts; technical caches just hide the mismatch.

## Closing the Books

**Problem.** Stream mirrors a capability whose activity never ends (account, register, ledger) → fact count grows unbounded → loads slow, replays heavy. Root cause: stream boundary ignores the business's own period structure.

**Shape.** Borrow accounting's period close: end the stream at a business-meaningful boundary, open a successor. Period-keyed stream ids (`register-{id}-{day}`, `account-{id}-{year}`). Close emits a closing fact carrying the rolled-up state (balance, totals); successor stream opens from that as its starting point.

**When.** Domain has natural periods (trading day, payroll month, fiscal year) or terminal moments (order submitted, case closed). Strong tell: domain experts already SAY "close out", "settle", "end of day" — the business does this on paper; mirror it.

**When NOT.** No natural period or terminus exists and inventing one would be fiction → Summary Facts or Snapshots instead. Also unnecessary for streams already lifecycle-bounded (most: 10–100 facts).

**Trade-offs.**
- History spans multiple streams → "all activity ever" queries must walk stream series or use a projection (usually the right answer anyway).
- Close process = real design work: when exactly, who triggers, what rolls up, corrections after close (accounting answer: corrections = new facts in current period, never edits to closed one — matches fact immutability beautifully).

**Design notes.** Closing fact = audited business fact, not cache: domain experts can read it ("register closed, balance 412.50 €"). Opening state of successor verifiable against predecessor's close. This explainability is THE argument for preferring it over snapshots.

**Related.** Summary Facts (same idea, single stream), Snapshots (technical fallback), es-design write-side.md (stream lifecycle).

## Summary Facts

**Problem.** Same unbounded growth, but splitting into period streams unwanted (consumers expect one continuous stream; period boundaries soft).

**Shape.** Keep one stream; periodically append summary fact carrying rolled-up state. Readers load from latest summary forward, not from origin. Needs cheap "find latest summary" — index of summary positions (side projection or store feature) so readers can start mid-stream.

**When.** One logical stream preferred; periodic consolidation points exist; readers fine starting from consolidated state.

**When NOT.** Readers genuinely need full-history walks constantly (summary doesn't help); store can't read-from-position efficiently.

**Trade-offs.**
- Summary fact must capture EVERYTHING readers need going forward — missed attribute = walk past the summary anyway, pattern defeated. Schema evolution of summaries = same versioning discipline as any fact.
- Stream still grows on disk; pattern bounds read cost, not storage.

**Design notes.** Half-way house between closing-the-books (business) and snapshots (technical) — summary fact should still be business-readable. If it's becoming an opaque state blob → you're building snapshots, admit it and use real snapshot machinery.

**Related.** Closing the Books, Snapshots, es-design read-side.md (replay interaction: replays from origin still see pre-summary facts — projectors must handle).

## Snapshots

**Problem.** Aggregate/model load time hurts; no business period or terminus exists to bound the stream; load cost is purely technical pain.

**Shape.** Periodically persist materialized state of stream position N (trigger: every K facts, or load-time threshold). Load = latest snapshot + facts after N. Pure cache: facts remain source of truth; snapshots derivable, disposable, rebuildable.

**When.** Genuinely unbounded streams w/o business close; hot aggregates loaded constantly; after lifecycle redesign was considered and honestly doesn't fit. Framework support present helps (es-design D1) — hand-rolling snapshot machinery for one slow aggregate = poor trade.

**When NOT.** As day-one default "because ES needs it" — it doesn't; healthy lifecycle-designed streams never need them. As substitute for stream design: snapshotting a stream that SHOULD close books = caching a design bug. `[opinion]` Last resort, least important ES building block; the classic cache warning applies — you had a problem, now you have a stale-cache problem too.

**Trade-offs.**
- Cache invalidation class of bugs: snapshot schema must version w/ aggregate state shape — aggregate refactor invalidates snapshots → rebuild or version them (real maintenance, usually forgotten until it breaks).
- Invisible to business: pure infra, no domain meaning, unexplainable in model terms (correctly absent from event models).
- Adds storage + trigger machinery + monitoring.

**Design notes.**
- Trigger tuning: fact-count threshold simple + predictable; load-time threshold adaptive. Real-world thresholds high (hundreds+), not toy numbers.
- Snapshots are write-side (aggregate load). Read-side equivalents = projections — don't snapshot to serve queries; project instead.
- Replay/upcasting interaction: snapshot bypasses old facts → upcasters won't run on them at load; fact schema changes still need replay-or-version story for snapshots themselves.

**Related.** Closing the Books + Summary Facts (try first), es-design write-side.md (aggregate state minimalism shrinks what snapshots must hold), es-ops (versioning).
