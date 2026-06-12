# Model Artifact Notation

Markdown replaces whiteboard. This file = syntax authority: element blocks, IDs, GWT format.

File organization: tiny model (≲3 chapters, ≲12 slices) → single `docs/event-model/<context>.md`. Anything bigger → multi-file chapter layout per **model-specs skill** (spine `_model.md` + chapter files + element index). Section structure below applies either way — in multi-file, spine sections (Swimlanes/Story/Open Questions/Decisions) live in `_model.md`, slices live in chapter files.

## Why markdown

Human-readable in oversight mode. Diffable. Renders anywhere. Stable element IDs replace sticky-note positions + arrows.

## Element IDs + cross-references

Every element gets stable kebab-case ID, typed prefix:

| Type | Prefix | Example |
|---|---|---|
| Business fact | `fact:` | `[fact:item-added]` |
| External fact | `xfact:` | `[xfact:price-changed]` |
| Command | `cmd:` | `[cmd:add-item]` |
| Read model | `rm:` | `[rm:cart-items]` |
| Screen | `screen:` | `[screen:cart]` |
| Processor | `proc:` | `[proc:cart-publisher]` |
| Slice | `slice:` | `[slice:add-item]` |
| Flow | `flow:` | `[flow:submit-error]` |

Reference anywhere via `[type:id]`. Reuse = same ID (replaces whiteboard practice of linking duplicated elements w/ arrows). Rename → update all references same edit.

## Document structure (top → bottom)

```markdown
---
context: <model context name>
status: draft | modeling | verified
mode: autonomous | oversight
updated: <date>
sources: [<requirement docs, code paths, SME>]
---

# Event Model: <Context>

## Swimlanes
## Story
## Open Questions
## Decisions          ← autonomous mode mandatory; oversight optional
## Chapter: <name>
### Sub-chapter: <name>
#### Slice: <name> [<pattern>]
## Flow: <name>       ← alternative flows, after main chapters
```

## Section specs

### Swimlanes

Lanes group facts by audience/system. Declare once:

```markdown
## Swimlanes
- `subscriptions` — internal, core context
- `email-service` — external system (black box)
```

Internal/external separation mandatory. External facts ONLY in external lanes.

### Story

The plot. Numbered fact sequence = narrative spine. Must read sensibly aloud:

```markdown
## Story
1. [fact:subscriber-added] — visitor subscribed w/ email
2. [fact:confirmation-email-sent] — system sent double-opt-in mail
3. [xfact:email-bounced] — email service reported bounce
4. [fact:subscription-invalidated] — bounced address invalidated
```

### Open Questions

Ledger. Blocking = correct modeling impossible w/o answer. Never delete — resolve in place:

```markdown
## Open Questions
- [ ] q-2 **BLOCKING**: re-subscribe after unsubscribe allowed? — affects [cmd:subscribe] rules
- [ ] q-3: confirmation link expiry? — provisional 24h, see d-1
- [x] q-1: double opt-in required? → YES (SME, 2026-06-12)
```

### Decisions

Provisional + confirmed modeling decisions w/ rationale:

```markdown
## Decisions
- d-1 (provisional): link expiry 24h — industry default, no source. Revisit w/ q-3.
- d-2: totalPrice on read model only, not on fact — derivable, avoids fact churn.
```

### Slice

Smallest functional unit. One pattern instance each ([patterns.md](patterns.md)). Header + status + elements + scenarios:

```markdown
#### Slice: subscribe [State Change]
Status: modeled | gwt-done | verified | implemented
```

Status drives resumability — any session picks up where last stopped.

### Element blocks inside slice

**Screen** — ASCII wireframe, fenced. Data fields > visual polish. Mark slice-relevant fields `<...>`:

```markdown
**Screen** [screen:subscribe-form]
​```
+----------------------------+
| Join newsletter            |
| email: <____________>      |
|        [ Subscribe ]       |
+----------------------------+
​```
```

**Command / Business fact / Read model** — attribute table w/ provenance column. `source` = where attribute value comes from. Empty source = completeness violation:

```markdown
**Command** [cmd:subscribe]
| attribute | type | example | source |
|---|---|---|---|
| subscriptionId | UUID | 7f3a… | generated |
| email | string | ana@example.com | [screen:subscribe-form] |

**Business fact** [fact:subscriber-added] — lane: `subscriptions`
| attribute | type | example | source |
|---|---|---|---|
| subscriptionId | UUID | 7f3a… | [cmd:subscribe] |
| email | string | ana@example.com | [cmd:subscribe] |

**Read model** [rm:pending-confirmations] — sources: [fact:subscriber-added], [fact:subscription-confirmed]
| attribute | type | example | source |
|---|---|---|---|
| email | string | ana@example.com | [fact:subscriber-added] |
```

Read model header lists ALL source facts — incl. later facts that affect it (replaces whiteboard practice of dotted back-arrows). Fact affecting earlier read model → add to that header, note in slice that introduced it.

**Processor** — automation gear. One line: trigger + reads + issues:

```markdown
**Processor** [proc:confirmation-sender]
Trigger: [fact:subscriber-added]. Reads [rm:pending-confirmations]. Issues [cmd:send-confirmation].
```

### Scenarios (GWT)

Under owning slice. Concrete example data mandatory. GIVEN facts ordered left → right:

```markdown
##### Scenario: duplicate email rejected
- GIVEN: [fact:subscriber-added] {email: "ana@example.com"}
- WHEN: [cmd:subscribe] {email: "ana@example.com"}
- THEN: error — already subscribed

##### Scenario: confirmed list shows subscriber   ← GT, read models: no WHEN
- GIVEN: [fact:subscriber-added] {email: "ana@example.com"}
- GIVEN: [fact:subscription-confirmed] {email: "ana@example.com"}
- THEN: [rm:confirmed-subscribers] shows [{email: "ana@example.com"}]
```

Context note needed → plain line under scenario.

### Alternative flows

Main flow = good case. Error/alternative paths → own `## Flow:` section, same structure. Mark branch point in main slice:

```markdown
#### Slice: confirm-subscription [State Change]
Alternative flows: [flow:expired-confirmation]
...
## Flow: expired-confirmation
Branches from: [slice:confirm-subscription]
```

## Worked example (compact, all 4 patterns)

```markdown
---
context: newsletter
status: modeling
mode: oversight
updated: 2026-06-12
sources: [marketing-brief.md, SME: Ana]
---

# Event Model: Newsletter

## Swimlanes
- `subscriptions` — internal
- `email-service` — external (black box)

## Story
1. [fact:subscriber-added]
2. [fact:confirmation-email-sent]
3. [fact:subscription-confirmed]
4. [xfact:email-bounced]
5. [fact:subscription-invalidated]

## Open Questions
- [x] q-1: double opt-in? → YES (SME)

## Decisions
- d-1: bounce handling via translation, not direct rm — protects context from provider format.

## Chapter: Signup

#### Slice: subscribe [State Change]
Status: gwt-done

**Screen** [screen:subscribe-form]
​```
| email: <____________>  [ Subscribe ] |
​```

**Command** [cmd:subscribe]
| attribute | type | example | source |
|---|---|---|---|
| subscriptionId | UUID | 7f3a… | generated |
| email | string | ana@example.com | [screen:subscribe-form] |

**Business fact** [fact:subscriber-added] — lane: `subscriptions`
| attribute | type | example | source |
|---|---|---|---|
| subscriptionId | UUID | 7f3a… | [cmd:subscribe] |
| email | string | ana@example.com | [cmd:subscribe] |

##### Scenario: subscribe stores fact
- WHEN: [cmd:subscribe] {email: "ana@example.com"}
- THEN: [fact:subscriber-added] {email: "ana@example.com"}

##### Scenario: duplicate rejected
- GIVEN: [fact:subscriber-added] {email: "ana@example.com"}
- WHEN: [cmd:subscribe] {email: "ana@example.com"}
- THEN: error — already subscribed

#### Slice: send-confirmation [Automation]
Status: modeled

**Read model** [rm:pending-confirmations] — sources: [fact:subscriber-added], [fact:subscription-confirmed]
| attribute | type | example | source |
|---|---|---|---|
| subscriptionId | UUID | 7f3a… | [fact:subscriber-added] |
| email | string | ana@example.com | [fact:subscriber-added] |

**Processor** [proc:confirmation-sender]
Trigger: [fact:subscriber-added]. Reads [rm:pending-confirmations]. Issues [cmd:send-confirmation].

**Command** [cmd:send-confirmation]
| attribute | type | example | source |
|---|---|---|---|
| subscriptionId | UUID | 7f3a… | [rm:pending-confirmations] |
| email | string | ana@example.com | [rm:pending-confirmations] |

**Business fact** [fact:confirmation-email-sent] — lane: `subscriptions`
| attribute | type | example | source |
|---|---|---|---|
| subscriptionId | UUID | 7f3a… | [cmd:send-confirmation] |

##### Scenario: pending subscriber triggers mail
- GIVEN: [fact:subscriber-added] {email: "ana@example.com"}
- THEN: [fact:confirmation-email-sent] {subscriptionId: "7f3a…"}

#### Slice: confirmed-list [State View]
Status: modeled

**Read model** [rm:confirmed-subscribers] — sources: [fact:subscription-confirmed], [fact:subscription-invalidated]
| attribute | type | example | source |
|---|---|---|---|
| email | string | ana@example.com | [fact:subscription-confirmed] |

## Chapter: Hygiene

#### Slice: handle-bounce [Translation]
Status: modeled

**External fact** [xfact:email-bounced] — lane: `email-service`
| attribute | type | example | source |
|---|---|---|---|
| recipient | string | ana@example.com | provider webhook spec |

**Processor** [proc:bounce-translator]
Trigger: [xfact:email-bounced]. Issues [cmd:invalidate-subscription].

**Command** [cmd:invalidate-subscription]
| attribute | type | example | source |
|---|---|---|---|
| email | string | ana@example.com | [xfact:email-bounced].recipient |

**Business fact** [fact:subscription-invalidated] — lane: `subscriptions`
| attribute | type | example | source |
|---|---|---|---|
| email | string | ana@example.com | [cmd:invalidate-subscription] |
```

(Strip zero-width chars from nested fences when copying.)
