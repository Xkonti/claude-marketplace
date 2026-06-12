# Misconception Rebuttals + FAQ

Format per entry: claim → why believed (steel-man — always a real kernel) → truth → counter-argument → caveats. Use whole structure when advising; skipping steel-man → advice reads as dogma.

## M1 — "Event Sourcing is complex"

**Believed because:** CRUD genuinely IS simpler to start. Decades of state-first education, mature tooling, bootstrap-an-app-in-an-hour tutorials. Fair kernel — for a toy app, CRUD wins day one.

**Truth:** complexity comparison flips as systems grow. CRUD's day-one simplicity = borrowed against schema rigidity. Classic shape: entity table designed for known requirements → new variant arrives (legal persons next to natural persons) → squeezed into existing table via nullable columns → code model + DB model diverge → every later use case pays null-check tax. Decisions were forced at minimum knowledge (project paradox) and they compound.

**Counter:** ES adds capability by adding fact types — existing facts untouched, no schema renegotiation, no ripple. Complexity grows linearly w/ domain, not combinatorially w/ schema history. Also: core ES mechanics (append facts, fold into state) = small; the hard part = unlearning state-first habits, which is one-time cost.

**Caveats:** real mindset shift, real learning curve; team unfamiliarity = legit project risk. Eventual consistency + versioning need discipline CRUD doesn't demand on day one.

## M2 — "ES is not performant / replays millions of facts"

**Believed because:** people picture one global log, replayed start-to-finish per request. That WOULD be slow.

**Truth:** nobody sane builds that. Streams are per business instance — rebuilding one cart/order/contract = reading its own 10–100 facts. Milliseconds. Facts stored adjacently often beat JOIN-heavy CRUD reads on IO.

**Counter:** and most reads never touch streams — they hit projections (plain tables/caches shaped per query). Client-side, projected-read ES ≡ CRUD read perf. Stream growing huge → lifecycle boundary missed (toolbox #3) → fix design ("closing the books", summary facts), then snapshots as technical last resort.

**Caveats:** bad stream design WILL be slow — perf argument valid against bad design, invalid against ES. Projection rebuild time on huge fact volumes = real ops concern (→ es-ops replays).

## M3 — "ES couples services / becomes painful after initial phase"

**Believed because:** real projects DID rot this way. Cause: consumers reading producers' internal facts — sold as ES's flexibility benefit by people who never maintained the aftermath.

**Truth:** coupling source = architecture choice, not ES. Internal facts consumed externally ≡ shared database integration — same disease, fact-flavored ([boundaries.md](boundaries.md) full chain: refactor sign-offs, velocity collapse, duplicated domain logic drifting).

**Counter:** discipline kills it: internal facts private; external facts = versioned, precomputed, stable contracts. Then internal model evolves freely while consumers stand on stable ground — exactly the API-vs-shared-DB rule every architect already accepts.

**Caveats:** discipline must be held; ES makes violating it FEEL natural ("facts are right there"). Red-flag heuristic: anyone pitching read-everyone's-facts as the killer feature.

## M4 — "Streaming = sourcing / we have Kafka so we have ES"

**Believed because:** identical vocabulary (event, stream), and Kafka demos look like fact logs.

**Truth:** motion vs memory. Streaming transports records; sourcing remembers business facts. Full table + composition story → [boundaries.md](boundaries.md).

**Counter (Kafka-as-fact-store, short form):** sourcing needs read-stream-X-in-order as primary op; Kafka offers topic/partition consumption — per-entity reads mean filtering everything or topic-per-entity sprawl. Wrong tool for the read pattern, excellent tool for transport.

**Caveats:** records can BECOME facts via translation at context edge; Kafka-based ES projects exist (typically Kafka Streams-centric) — exceptions, w/ real operational pain.

## M5 — "ES needs special tools / infra"

**Believed because:** vendor marketing + conference talks center dedicated stores + frameworks.

**Truth:** minimal fact store = few relational tables (ordered append + read-by-stream). PostgreSQL fine. Files technically work (demos exist). Append-only access pattern = relational sweet spot.

**Counter:** entry cost ≈ zero infra-wise; dedicated stores/frameworks = scaling + convenience adoptions, made later w/ actual knowledge (project paradox again).

**Caveats / framework question:** `[opinion]` team >3–5 on commercial build → evaluate framework (Axon etc.): prebuilt answers for known traps (concurrency, replays, testing). Counterweight (Greg Young): framework lock-in on abandoned framework = strategic trap; frameworks-considered-harmful school exists. Both positions honest → team-size + risk-appetite decision. Switching later = costly, not impossible (fact migrations carry far).

## M6 — "ES only for audit/banking/insurance"

**Believed because:** audit trail = most visible, easiest-sold benefit; regulated industries showcase it.

**Truth:** audit = by-product, not purpose. Purpose = not destroying information + keeping models flexible — valuable wherever requirements evolve (≈ everywhere).

**Counter:** "which systems deserve ES?" presumes ES = special weapon, CRUD = default. `[opinion — author school]` Inverted view: information-preserving persistence should BE the default; deviate w/ reason. Majority of field still treats CRUD as default — present both, don't launder.

**Caveats:** genuinely poor fits exist — see FAQ Q1.

## M7 — "CQRS requires ES / separate databases"

**Believed because:** tutorials bundle them; "CQRS+ES" reads like one acronym.

**Truth:** CQRS = separate read/write models. Achievable w/ tables + CDC, no facts anywhere. Separate tech per side OPTIONAL — same DB, two models = still CQRS. Direction: ES ⇒ nearly always CQRS; CQRS ⇏ ES ([tradeoffs.md](tradeoffs.md)).

## M8 — "Eventual consistency = broken UX, always"

**Believed because:** read-your-own-write staleness is real + jarring when first hit (click "add", render misses item).

**Truth:** staleness window matters only where user/rule observes it. Most views (lists, dashboards, reports) tolerate seconds invisibly; commerce giants run on it (purchase appears in library ~30s later — nobody cancels their account over it).

**Counter:** observed-staleness cases get engineered deliberately: same-transaction projection (one store), partially-synchronous projection, UI acknowledgment patterns (→ es-patterns, es-ops). Write-side rules needing current state = aggregate/DCB territory, not projection territory (→ es-design).

**Caveats:** "accept staleness" must be per-view DECISION, not default shrug. Undesigned eventual consistency = the bad UX everyone fears.

## FAQ — opinionated answers, marked

**Q1: When does ES fit / not fit?**
Fits: domains w/ evolving requirements, processes worth remembering, multi-view data needs, integration-heavy contexts. Poor fit: pure pass-through/stateless transforms; ultra-high-volume technical telemetry (store aggregates, stream the rest — sourcing IoT firehoses = anti-pattern); throwaway prototypes w/ certain death dates. `[opinion]` Author school: default-yes, justify deviation; field median: justify adoption. Give user both + reasoning, let them place themselves.

**Q2: One PostgreSQL for facts + projections?**
Yes. `[opinion — widely shared among practitioners]` Same-transaction projections kill eventual consistency concerns at small-medium scale; simplicity compounds. Split stores when concrete pressure arrives (scale, read-tech needs), not preemptively.

**Q3: Migrate existing CRUD system to ES?**
Don't "event-source the data model" — wrapping current tables in Created/Updated/Deleted facts = CRUD w/ extra steps, worst of both. Remodel BEHAVIOR (what happens, business language — event-modeling skill), then implement persistence for that. Migration = remodeling project w/ data backfill, not storage swap.

**Q4: Do I need DDD to do ES?**
Concepts help (aggregate = consistency boundary; context boundaries map to internal/external split) — full ceremony not required. Business-language facts + sane stream lifecycles get you most value. Depth → es-design.

**Q5: How do I convince my team / answer skeptics?**
Steel-man their objection first (it maps to M1–M8 almost always), concede the kernel, show where the claim's model of ES diverges from actual practice. Skeptics' objections = usually correct attacks on bad ES they've seen.
