# File Templates

Element syntax inside slices → event-modeling/notation.md. Templates here = file skeletons only.

## `_model.md` — context spine

```markdown
---
context: <name>
status: draft | modeling | verified
mode: autonomous | oversight
updated: <date>
sources: [<docs, code paths, SME>]
---

# Event Model: <Context>

## Swimlanes
- `<lane>` — internal | external (<system>)

## Story
1. [fact:<id>] — <one-line gloss>          ← chapter: 10-<name>
2. ...

## Chapters
| file | chapter | covers story steps | status |
|---|---|---|---|
| 10-signup.md | Signup | 1–3 | gwt-done |
| 20-hygiene.md | Hygiene | 4–5 | modeled |

## Open Questions
- [ ] q-2 **BLOCKING**: <question> — affects [cmd:<id>]
- [x] q-1: <question> → <answer> (<source>, <date>)

## Decisions
- d-1 (provisional): <decision> — <rationale>. Revisit w/ q-3.

## Element Index
| id | defined in |
|---|---|
| [fact:subscriber-added] | 10-signup.md › slice:subscribe |
| [rm:confirmed-subscribers] | 10-signup.md › slice:confirmed-list |
```

Index rules:
- Every defined element gets a row, same edit that defines it.
- "defined in" = `<file> › slice:<id>` — exact landing spot.
- References NOT tracked in index — computed via grep when needed ([verification.md](verification.md)). Less maintenance surface, less drift.
- Chapter status = lowest slice status in file (modeled < gwt-done < verified < implemented).

## Chapter file — `NN-<name>.md`

```markdown
---
context: <name>
chapter: <Chapter Name>
status: modeled | gwt-done | verified | implemented
updated: <date>
---

# Chapter: <Name>

<2-3 line summary: what workflow this covers, where it sits in story>

Story steps: 1–3. Preceding: — | NN-<file>. Following: NN-<file>.

#### Slice: <name> [<pattern>]
Status: modeled
<elements + scenarios per notation.md>

#### Slice: ...

## Flow: <name>                      ← alternative flows of THIS chapter's slices
Branches from: [slice:<id>]
<slices per notation.md>

## Chapter Notes                     ← optional: ripple notes, cross-chapter remarks
- [fact:item-archived] (this chapter) added to sources of [rm:cart-items] (10-items.md) — d-4
```

Rules:
- Frontmatter `context` ties file to spine — orphan files detectable.
- Summary + story-step range + neighbor links = navigation w/o opening `_model.md`. Downstream agent loads one chapter, knows its place.
- Cross-chapter element use: plain typed ID reference. NO redefinition, NO copied attribute table. Need attribute details while reading → follow index. Tempted to copy table for convenience = exactly how drift starts.
- Ripple notes in Chapter Notes: when this chapter modified another file's element definition, note it here + at the definition (see operations.md). Trail beats memory.

## Flow extraction file — `NN-flow-<name>.md`

Same skeleton as chapter file; frontmatter gains `flow-of: <slice-id>`. Use only when flow outgrew its chapter ([operations.md](operations.md) § Split).

## Naming

- Context dir, chapter files, element IDs: kebab-case.
- Chapter numbers: spaced by 10 (10, 20, 30) → insertions land between (15-...) w/o renumber.
- Chapter name in filename = chapter heading kebab'd. Rename chapter → rename file ([operations.md](operations.md) § Rename).
