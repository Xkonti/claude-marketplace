# Elements + Patterns Reference

Whiteboard colors noted for interop w/ human modelers + Miro boards. Artifact uses typed IDs instead ([notation.md](notation.md)).

## Elements

### Business fact (orange)

Something that happened + got persisted. Past tense, business language. Immutable — recorded, never changed. No fact → didn't happen. Facts = what remains after power-off → they define system's actual capabilities.

Persistence-agnostic: "fact" claims data stored, not HOW. Row in table counts. Works for non-event-sourced systems too.

Naming: business meaning, no tech ("Subscriber Added" ✓, "Row Inserted" ✗). One fact = one meaning — different business cases → different fact types, even if attributes match. Resist generic facts w/ nullable attribute soup.

### Command (blue)

Instruction to system: do this. Imperative ("Subscribe"). May be rejected — that's its job. Command describes intent; fact describes outcome. Carries ALL data needed to produce its fact(s). Execution = black box in model — only contract matters.

### Read model (green)

Question the system answers from stored facts. Data + provenance, zero implementation. Feeds screens AND processors. Can only contain what facts deliver — nothing else exists. Use-case-shaped, never entity-shaped. Optional table-with-example-rows rendering aids developers — but beware implying implementation.

### Screen

Rough wireframe. Shows data captured + displayed + actions available. Anchors discussion — abstract disputes dissolve at sketches. Not UX design.

### External fact (different color lane)

Data arriving from / sent to system outside context. API call, queue record, file, manual entry — transport irrelevant. Lives ONLY in external swimlane.

### Processor (gear)

Background actor. Triggered by fact / timer / schedule. Reads read model, issues command. How it runs (poll/push) = implementation, not modeled.

### Swimlane

Horizontal grouping: per context, per audience, internal vs external. Internal/external split mandatory.

## The 4 Patterns

Every slice = exactly one pattern instance. Whole method = these four repeated.

### 1. State Change

```
[screen:*] --user action--> [cmd:*] --validates--> [fact:*] (1..n)
```

ONLY way information enters/changes system. Trigger: user action, processor, or translation. Command validates business rules → facts persisted, or error. Multi-fact output legal (first action creates container: "Cart Created" + "Item Added") — order matters.

### 2. State View

```
[fact:*] (1..n) --projects--> [rm:*] --feeds--> [screen:*] | [proc:*]
```

ONLY way information leaves system. Read model aggregates facts → answers one use case's question. No new information created — projection only.

### 3. Automation

```
[fact:trigger] ~> [rm:todo-data] -> [proc:*] -> [cmd:*] -> [fact:result]
```

State View + State Change glued by processor. Background work: notifications, publishing, reactions. Mental model: pen + paper — what list would human clerk keep ("to-do list"), what would they do per line? That list = the read model.

### 4. Translation

Inbound, full form:
```
[xfact:*] -> [proc:translator] -> [cmd:*] -> [fact:internal]
```
Inbound, display-only shortcut (data matches need exactly, display only):
```
[xfact:*] -> [rm:*]
```
Prefer full form — internal fact decouples context from provider format (anti-corruption layer). Provider changes → only translation slice touched.

Outbound = Automation whose result fact is external:
```
[fact:internal] ~> [rm:export-data] -> [proc:publisher] -> [cmd:publish-*] -> [xfact:published]
```

External fact design: self-contained, consumer-ready, generous — receiver must never reconstruct state from our internal facts. Include deltas where consumers decide on changes. Internal facts stay minimal + private.

## GWT Scenario Rules

Shape per slice type:

| Slice type | GIVEN | WHEN | THEN |
|---|---|---|---|
| State Change | prior facts (may be empty) | exactly one command | fact(s) in order OR error |
| State View | facts | — (omit) | read model content, concrete rows |
| Automation | trigger fact(s) | — (omit; processor fires) | resulting fact |
| Translation | external fact | — or translating command | internal fact |

Rules:
1. GIVEN facts ordered left → right; multi-fact THEN ordered too.
2. Concrete example data ALWAYS. Add item 5.00 € → total 5.00 €; remove → 0.00 €. Examples = spec, become test fixtures.
3. One scenario = one rule. Many small > one mega.
4. Error scenarios first-class: invalid state → expect error. Consider modeling business-meaningful failures as facts instead ("Cart Submission Failed") — failure marketing/ops cares about = information worth keeping.
5. Scenario placement: under owning slice.
6. Trust upstream: rules validated at write → downstream scenarios don't re-check.
7. Context notes: plain line under scenario when example needs explanation.

## Slices → Implementation Bridge

Slice = smallest functional unit = one pattern instance = one ticket (~≤1 dev-day). Chapters → epics. GWTs → tests, near-mechanical translation. Slices implementable in any order — facts define contracts between them. Model marks status per slice → progress tracking lives in model.

Event Modeling + vertical slice architecture = natural fit: State Change slice → write op package, State View slice → read op package, Automation → processor package. Detail → es-design skill.
