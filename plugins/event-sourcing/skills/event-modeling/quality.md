# Quality Gates

Verification battery. Run P9 full; individual checks anytime mid-process.

## Information Completeness Check

THE core verification. Mechanizes "no assumptions about data".

Procedure — walk every element, every attribute:

1. **Read model attribute** → which source fact delivers it? Listed in header? Fact actually carries the attribute?
2. **Fact attribute** → which command (or translation) supplies it? Command carries it or generates it?
3. **Command attribute** → which screen field, read model, external fact, or generator provides it? Trail ends at: user input, external system (spec cited), generated value, or prior fact. Nothing else.
4. **Screen displayed field** → which read model attribute backs it?

Any attribute w/ broken trail → red flag:
- Fixable by extending existing element → extend (ripples upstream: read model needs attr → fact needs it → command needs it → screen/source needs it — follow whole chain in one edit).
- Source genuinely unknown → open question. NEVER invent the value's origin.

Derived values (sums, counts): mark `derived: <from what>` in source column — derivation inputs must themselves pass check.

## Ambiguity Audit

Hunt vagueness before it becomes code:

1. **Unmodeled domain terms.** SME/sources use term repeatedly ("cart session", "default set", "active subscriber") w/ no model element → missing concept. Strongest signal in the method. → investigate, model it, or open question.
2. **Vague element names.** "Data Updated", "Process Item", "Handle Change" → name hides meaning. Sharpen w/ business language.
3. **Generic facts.** One fact type + nullable attributes serving multiple business cases → split per case.
4. **Dangling references.** `[type:id]` pointing nowhere; read model header listing fact that never affects it; reused concepts under different IDs.
5. **Lifecycle holes.** Things created never used; started never finished/abandoned/expired. Every long-lived concept: where born, where dies?
6. **Redundant rule checks.** Same rule validated in 2+ slices → keep at write side, drop rest.
7. **Tech leakage.** DB/REST/Kafka/framework names inside model elements → restate as information flow. (Citing external provider spec for xfact attributes = fine.)

## Story Readback

Cheap, powerful, run often:

1. Render story / chapter as prose, fact by fact.
2. Read for: order sense, gaps between steps, tangled parallel processes.
3. Oversight: read TO human, pause per step — "matches reality? anything between these two?"
4. Autonomous: write rendition out (forces serialization → exposes gaps thinking glosses over).

## Open Questions Ledger Discipline

- Every unknown → entry, immediately, in artifact. Memory ≠ persistence.
- Classify: **BLOCKING** (correct modeling impossible w/o answer: business rules, process order, data ownership, external contracts) vs non-blocking (provisional decision viable).
- Non-blocking → decide provisionally, log decision + rationale + back-reference to question.
- Resolve in place (`[x]`, answer, source, date). Never delete — resolution trail = documentation.
- Autonomous mode: batch blockers, present at natural stop (chapter end / loop end), not one-at-a-time drip.

## Decision Log Discipline

- Provisional decision = open question wearing default. Both recorded, cross-referenced.
- Every "we chose A over B" w/ business impact → log entry w/ one-line rationale.
- Oversight: SME confirms → mark confirmed. Autonomous: stays provisional until human reviews.

## Anti-Patterns

| Anti-pattern | Smell | Fix |
|---|---|---|
| Noun-first modeling | Started w/ entities + attributes, facts retrofitted | Restart from facts: what HAPPENS? |
| General-purpose read model | One model serving N use cases "efficiently" | Split per use case — models cheap |
| Implementation modeling | Model mirrors current code/tables instead of information flow | Model what business does, not what code does |
| Branching timeline | if/else, loops drawn into flow | One flow per path; good case main, rest `## Flow:` |
| Validate-on-read | Read model re-checks write rules | Trust stored facts; rules at command |
| Sparse external facts | Consumer must call back / rebuild state | Self-contained, generous external facts |
| Invented attributes | "Probably has email" w/o source | Completeness check; open question |
| Tech-first discussion | Session/agent drifts to DB schemas, endpoints | Redirect: "what information, where from?" |
| Skipped screens | "UI obvious, skip sketching" | Sketch anyway — sketches expose data gaps + dissolve misunderstandings |
| Premature precision | Perfect naming/typing debates in P1/P2 | Park; precision belongs to Loop B |

## Definition of Done

Model `verified` when ALL:

- [ ] Every story step covered by ≥1 slice
- [ ] Every slice = exactly one pattern instance, named, statused
- [ ] Information completeness: full sweep, zero broken trails
- [ ] Every slice ≥1 scenario; every known rule in exactly one scenario; concrete example data throughout
- [ ] Ambiguity audit clean (or findings → open questions)
- [ ] Internal/external lanes separated; every integration via Translation/Automation
- [ ] Alternative flows extracted, branch points linked
- [ ] Story readback passes on final model
- [ ] Zero unanswered BLOCKING questions (autonomous: presented + answered)
- [ ] Provisional decisions reviewed by human (or explicitly accepted as provisional)
- [ ] Handoff summary present: slice inventory, suggested order, questions, decisions

Mid-process session end → P9 lite instead: statuses current, questions flushed to ledger, "where we stopped" note. Artifact resumable cold, always.
