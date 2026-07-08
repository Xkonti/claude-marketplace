# Ticket Templates

Pick type FIRST → template follows. Fill every section or write "none"/"unknown" — never omit silently. Title: imperative, ≤70 chars, no type prefix (label carries type).

## Type Labels — pick EXACTLY one

| type | when | not when |
|------|------|----------|
| `bug` | current behavior violates stated/expected behavior | "could be better" → improvement |
| `feature` | new capability, doesn't exist yet | tweak to existing thing → improvement |
| `improvement` | existing thing works, make it better (UX, perf, robustness) | invisible-to-user cleanup → chore |
| `idea` | unvalidated spark, parking lot — not actionable yet | ready-to-build spec → feature |
| `research` | question to answer; deliverable = knowledge, not code | building the thing → feature |
| `docs` | write/fix documentation, README, guide | code comments in a code change → part of that ticket |
| `chore` | maintenance, zero user-visible change: deps, CI, tooling | user notices result → improvement |

Tie-breaker bug vs improvement: does current behavior break an expectation someone stated? Yes → bug.

`idea` NEVER gets `ai-ready`. Validated idea → rewrite as feature/improvement, relabel.

## Larger Efforts — NOT a Label

Epic label rots. Linear native hierarchy instead: parent issue (template below) + sub-issues, each own type + tier. Very large → project milestone groups parents.

## bug

```markdown
## Problem
What breaks. Error text verbatim.

## Expected
What should happen instead.

## Repro
1. step
2. step

## Notes
Code pointers (`path/file.ts` — why relevant), environment, suspicions marked "suspicion:".

## Acceptance
- [ ] testable check
```

## feature

```markdown
## Goal
What new capability, for whom, why now.

## Scope
What's included. Bullets.

## Acceptance
- [ ] user-visible testable check

## Out of Scope
Explicitly not doing. Prevents creep.

## Notes
Code pointers, design constraints, links.
```

## improvement

```markdown
## Current
How it works today.

## Desired
How it should work.

## Why
Value of the change — perf number, friction removed.

## Acceptance
- [ ] testable check

## Notes
Code pointers, links.
```

## idea

```markdown
## Spark
The thought, raw.

## Value
Why it might matter.

## Open Questions
- what must be true for this to be worth doing?
```

## research

```markdown
## Question
The ONE question to answer.

## Why
What decision this unblocks.

## Deliverable
Doc / comment / recommendation — where it lands.

## Timebox
Max effort before reporting back regardless.
```

## docs

```markdown
## What
Which docs, what content.

## Audience
Who reads this.

## Where
File/site/section it lands.

## Acceptance
- [ ] reader can do/know X
```

## chore

```markdown
## Task
What to do.

## Why
What rots/breaks if skipped.

## Acceptance
- [ ] done-check
```

## parent (larger effort)

```markdown
## Goal
End state in 1-3 lines.

## Outcomes
- [ ] observable result 1
- [ ] observable result 2

## Breakdown
Sub-issues (each own typed ticket), linked as children.

## Notes
Sequencing, risks.
```

Parent keeps type label (usually feature), NO tier, NO ai-ready — children carry those.
