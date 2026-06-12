# Process Phases

Three loops. A once per context. B per use case until covered. C at session end + final. Phases not sacred waterfall — backtrack freely, but never skip exit gates.

Each phase: goal → procedure → mode deltas → exit gate → artifact output.

---

## Loop A — Bootstrap (once per model context)

### P0 Setup

Goal: scope locked, mode locked, sources gathered.

1. Identify goal type: new system | document existing | new feature on existing model | complex problem discussion. Document-existing → model information flow as-is, NOT implementation structure.
2. Pick ONE model context (system/subdomain under study). Everything else = black box. Multiple contexts wanted → multiple model files, one at a time.
3. Gather sources. Autonomous: requirements docs, code, API specs, tickets, docs — list in frontmatter `sources`. Oversight: ask SME what written material exists, read it BEFORE asking questions humans already answered.
4. Confirm mode + artifact location ([notation.md](notation.md)).
5. Project Paradox warning applies: defer decisions needing knowledge you lack. Modeling = knowledge acquisition, decisions come cheap later.

Exit gate: context named, boundary stated ("modeling X from view of X; Y, Z external"), sources listed.

### P1 Fact Harvest

Goal: raw business fact candidates, breadth > precision.

1. Collect candidate facts: things that could have happened. Past tense, business language. "Subscriber Added" not "AddSubscriber" / "INSERT".
2. No filtering yet. Duplicates, vague names, maybes — all in. Chaos fine here.
3. Capture verbatim domain terms encountered — they seed the ubiquitous language.

Autonomous: mine each source systematically. From requirements: every verb phrase → candidate fact. From code: state mutations, DB writes, emitted messages → candidate facts (translate tech names → business language). From UI: every button/form → what fact results?
Oversight: seed SME: "Walk me through what happens in this business, start to finish. I'll capture facts." Then probe: "what could have happened by the time X occurs?", "what does nobody like to talk about — errors, cancellations, edge cases?" Offer candidates from sources, let SME correct.

Exit gate: candidate list exhausts all sources; no obvious lifecycle holes (things created get used, things started get finished/abandoned).

Output: scratch fact list (not yet in artifact — Story section comes in P2).

### P2 The Plot

Goal: facts ordered on timeline → coherent story.

1. Dedupe + merge candidates. Vague names → sharpen or park w/ open question.
2. Order chronologically along one example run of the process. Concrete instance beats abstract ordering ("Ana subscribes Tuesday…").
3. Write Story section: numbered fact references + one-line gloss each.
4. **Story readback gate**: read story start → finish as prose. Must make sense to domain outsider. Stumbles = misordering, missing fact, or two processes tangled → fix or split into separate flows.

Autonomous: readback = self-check, write prose rendition into Decisions or scratch, verify each step follows from prior. Ordering ambiguity w/ business meaning (refund before/after restock?) → open question, not coin flip.
Oversight: read story TO human, sentence by sentence. Ask: "anything missing between 3 and 4?", "does this order match reality?" Disputes here = gold — capture resolution as decision.

Exit gate: story reads clean. Facts that survived have business-language names.

Output: Swimlanes (initial), Story section.

---

## Loop B — Detail (per use case, repeat until story covered)

Pick next use case = next story step lacking slices. Per use case apply P3→P8. Use [patterns.md](patterns.md) for shapes. First pass after bootstrap: take story step 1.

### P3 Storyboard

Goal: screens showing data + interaction for this use case.

1. Sketch ASCII wireframe per UI step ([notation.md](notation.md)). Background processes: skip screen, note trigger instead.
2. Data fields > layout. Every displayed value + every input field visible in sketch.
3. Mark fields relevant to current slice `<...>`.
4. Show state AFTER action too when it clarifies (empty cart after clear) — modeling = clicking through software that doesn't exist yet.

Autonomous: derive fields from requirements/existing UI. Invented-but-plausible field (e.g. "probably shows price") → only w/ source; else open question.
Oversight: propose sketch, ask SME: "what's missing on this screen? what should NOT be here?" Visual unblocks people — heated abstract debates often dissolve at a sketch.

Exit gate: every use-case interaction has screen or stated trigger.

### P4 Inputs (Commands)

Goal: every state change has command carrying complete data.

1. Per fact in use case, backwards question: "what command must have run for this fact to exist?"
2. Define command + attribute table. Command carries ALL data its fact(s) need.
3. Attribute provenance: each command attribute sourced from screen field, read model, external fact, or generated. No source → red flag → open question.
4. One command MAY yield multiple facts (first action also creates container → "Cart Created" + "Item Added"). Order matters, document in scenario.

Both modes: lifecycle probe — "who/what creates this thing the command targets?" Missing creation fact = classic hole (cart session discovered only when price-change use case needed it — find it NOW).

Exit gate: every fact in use case has producing command; all command attributes sourced.

### P5 Outputs (Read Models)

Goal: every screen + process fed by use-case-specific read model.

1. Per screen, work backwards: which fields → which read model attributes?
2. Define read model + attribute table. Header lists ALL source facts.
3. Per attribute: which fact delivers it? None → information completeness violation → either add to existing fact (then P4 ripples: command must supply too) or new fact needed → new use case discovered.
4. Read models serve use cases, not entities. "What answers THIS question" not "the Subscriber object". Same data, different question → different read model. Cheap by design.
5. Derived values (totals): decide stored-on-fact vs computed-in-read-model. Insufficient info → pick read-model side, log provisional decision.
6. Later facts changing earlier read models (archived item disappears from list) → update source list of earlier read model, note in current slice.

Autonomous: every read model attribute MUST trace to fact. This check catches most invented data.
Oversight: show table w/ example rows — "is this what you'd expect to see?" Concrete rows expose wrong assumptions instantly.

Exit gate: every screen field + processor input traces screen → read model → fact(s).

### P6 Integrations

Goal: every external-system touchpoint modeled as Translation or Automation.

1. Inbound (external notifies us): external fact in external lane → Translation → internal command → internal fact. External fact attributes sourced from provider spec (cite it). Direct read-model variant only for display-only pass-through data.
2. Outbound (we notify external): Automation chain — read model (collects export data) → processor → command → external fact in external lane.
3. External facts ≠ internal facts. Outbound external fact = complete, self-contained, consumer-ready — receiver never rebuilds state from our internals. Internal fact = minimal, ours.
4. How transport works (HTTP/queue/file) = irrelevant here. Data only.

Autonomous: provider contract unknown → BLOCKING open question. Never invent external schemas.
Oversight: ask "who else cares this happened?" per fact, and "what shows up, in what shape?" per inbound integration.

Exit gate: no internal element reads external data w/o translation between; every outbound need has automation chain.

### P7 Scenarios (GWT)

Goal: business rules captured as executable-grade scenarios.

1. Per State Change slice minimum: happy path + each business rule + each invalid-state error. GIVEN = prior facts (empty if none), WHEN = exactly one command, THEN = fact(s) in order OR error.
2. Per State View slice: GT (no WHEN). GIVEN facts → THEN expected read model content, concrete rows.
3. Per Automation slice: GIVEN trigger fact(s) → THEN resulting fact. Plus optional GWT for its State Change part.
4. Concrete example data mandatory — 5.00 € in, 5.00 € total out. Examples ARE the spec.
5. Rule probing: "what must never happen here?", "what limits exist?", "what if twice / zero items / already done?"
6. Don't re-verify upstream rules downstream (fact write-side checked → trust stored facts). Redundant check = smell.
7. Don't save on scenarios. 10+ per complex slice = normal. Scenarios = primary treasure of model — they become tests.

Autonomous: rules only from sources. Plausible-but-unsourced rule ("probably max 3 retries") → open question, NOT scenario.
Oversight: most valuable phase for SME time. Probe per slice until "no more rules". Each answer → immediate scenario, show it back.

Exit gate: every slice ≥1 scenario; every known business rule lives in exactly one scenario.

### P8 Slice + Organize

Goal: model navigable, slices implementation-ready.

1. Name slices verb-first kebab-case (`add-item`, `handle-bounce`). One pattern instance each. Slice = unit of implementation (≈ ticket; sized ≈ ≤1 dev-day).
2. Group slices → chapters / sub-chapters mirroring story.
3. Reused elements → same ID everywhere (no copies w/ drifting definitions).
4. Conditions/loops trying to enter the timeline → extract alternative flow (`## Flow:`), link from branch-point slice. Good case stays main.
5. Update slice statuses.

Exit gate: every story step covered by slices; chapters read as table of contents of the system.

→ More story steps uncovered? Back to P3 w/ next use case. Else Loop C.

---

## Loop C — Verify + Handoff

### P9 Quality Gates

Run full battery in [quality.md](quality.md):

1. Information completeness sweep — every attribute, every element, full trail.
2. Ambiguity audit — vague names, unmodeled SME terms, dangling references.
3. Final story readback against finished model.
4. Open questions triage: blocking ones answered? Autonomous: present batch to user NOW. Provisional decisions: confirm or keep flagged.
5. Handoff summary: slice inventory w/ statuses (→ tickets; chapters → epics), open questions, decisions, suggested implementation order (dependency-light slices first).

Exit gate (= model done): checklist in quality.md passes; status → `verified`.

Session ends mid-process → still run P9 lite: update statuses, flush open questions, one-paragraph "where we stopped" note in artifact. Artifact must always be resumable cold.
