---
name: model-specs
description: >
  Manage event model as multi-file spec set — chapter-per-file layout, central index,
  cross-file references via typed IDs, update/split/rename procedures, mechanical
  completeness verification. Supplement to event-modeling skill: that one teaches the
  process, this one keeps the artifact organized + 100% complete as it grows. Pull when
  creating/updating/reorganizing/verifying model spec files.
---

Event model grows past one file fast. This skill = file management layer: layout, lifecycle, integrity. Element syntax (IDs, attribute tables, GWT format) lives in event-modeling/notation.md — THE syntax authority. This skill never redefines syntax, only organizes files. Drift between the two = bug; notation.md wins.

## Terminology

Core unit = **business fact**. Never bare "event" in prose. Composites: business fact stream, external fact.

## When single-file vs multi-file

- Tiny model (≲3 chapters, ≲12 slices): single `docs/event-model/<context>.md` per notation.md — fine.
- Anything bigger or expected to grow: multi-file layout below. Migrating up: [operations.md](operations.md) § Migrate.

## Layout

```
docs/event-model/                ← root (follow project convention if one exists)
└── <context>/                   ← one dir per model context
    ├── _model.md                ← context spine: story, swimlanes, ledgers, chapter list, element index
    ├── 10-<chapter>.md          ← chapter file: slices + GWTs
    ├── 20-<chapter>.md
    └── 30-<chapter>.md
```

- Chapter filenames: `NN-<kebab-name>.md`, numbers spaced by 10 → insert between w/o renumbering.
- `_model.md` underscore prefix → sorts first, marks meta file.
- Alternative flows: section inside chapter owning the branch point. Extract to own `NN-flow-<name>.md` only when it outgrows the chapter file.

## Core rules

1. **Chapter = file unit.** Chapter groups slices of one workflow (≈ epic). One chapter file = one bounded read for downstream agents (es-design consumes per-chapter). Keep chapter files ≲400 lines — bigger → split ([operations.md](operations.md)).
2. **Definition-once.** Every element fully defined (attribute table) exactly once — in the slice introducing it. Everywhere else: reference by typed ID only. Two definitions of one ID = corruption.
3. **Typed IDs = canonical references.** `[fact:item-added]` resolves via element index, NOT file paths. Files can move/split/merge — references never break. Never use relative md links for element refs.
4. **`_model.md` = single spine.** Story, swimlanes, open questions ledger, decision log, chapter list, element index — central, never duplicated into chapters. Chapters reference `q-N` / `d-N` by ID.
5. **Cross-chapter ripple is explicit.** Later chapter's fact affects earlier chapter's read model → update the read model's DEFINITION (source list) where it lives + note at the new fact. Procedure: [operations.md](operations.md) § Shared-element update.
6. **Every edit ends w/ integrity check.** Cheap grep pass after each editing session; full verification before declaring model complete. [verification.md](verification.md).

## Reference files

| File | When to read |
|---|---|
| [structure.md](structure.md) | Creating files — templates for `_model.md` + chapter files |
| [operations.md](operations.md) | Changing things — add/update/split/rename/move/migrate procedures |
| [verification.md](verification.md) | Proving completeness — grep recipes + 100%-complete checklist |

## Relationship to siblings

- event-modeling — the process producing this content; its phases.md says WHEN to write, this skill says WHERE + HOW to keep organized. quality.md gates still apply, verification.md here extends them cross-file.
- es-design — consumes these spec files chapter by chapter for implementation design; its change-intake.md routes implementation-language change requests back into these files via the ripple procedures here. Stable heading patterns + statuses = its contract; don't invent custom heading styles.
