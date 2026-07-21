# Operations — change procedures

Every operation ends w/ quick integrity pass ([verification.md](verification.md) § Quick). Procedures assume layout from [structure.md](structure.md).

Change request arriving in IMPLEMENTATION language (endpoint, API field, table, resource) → route via es-design change-intake.md FIRST — it decides whether a ripple here is needed + which slice owns the change. Never translate impl asks into model edits directly.

## Add slice to existing chapter

1. Write slice in chapter file (notation per event-modeling/notation.md).
2. New elements → rows in `_model.md` Element Index, same edit.
3. New facts in main flow → insert into `_model.md` Story + adjust chapter's "covers story steps".
4. Slice status set; chapter status recomputed (lowest slice wins); `updated` stamped both files.

## Add chapter

1. Pick number: midpoint gap between neighbors (between 10 and 20 → 15). No gap left → renumber (below).
2. Create file from structure.md template.
3. Register in `_model.md`: Chapters table + Story steps + `updated`.
4. Set neighbor links (Preceding/Following) in new file AND both neighbors.

## Update shared element (the ripple procedure)

Trigger: new fact affects earlier read model; attribute added to existing element; source list changes.

1. Locate definition via Element Index.
2. Update definition (attribute table / source list) at its home slice.
3. Ripple upstream per completeness rules: attribute added to read model → source fact must carry it → command must supply → screen/source must provide. Follow whole chain in ONE editing session — half-done chains = broken model.
4. Grep element ID across context dir → inspect every referencing slice + GWT: still correct w/ new shape? Scenarios w/ example data esp. — new attribute may need example values.
5. Note ripple twice: Chapter Notes of the chapter that CAUSED change + one-liner at definition ("sources extended by [fact:item-archived], see 30-pricing.md").
6. Decision-worthy change → `d-N` entry in `_model.md`.

## Rename element

ID change = global operation:

1. `grep -rn "<old-id>" docs/event-model/<context>/` → full hit list.
2. Replace ALL occurrences (definition, references, GWTs, Story, Element Index, ledger mentions) — one session, no partial renames.
3. Re-grep old ID → must return zero.
4. Log `d-N` if rename reflects domain insight (usually does — name changes = learning).

## Move slice between chapters

1. Cut slice block (incl. its scenarios) → paste into target chapter.
2. Element Index: update "defined in" rows for elements defined in that slice.
3. Both chapters: story-step ranges, statuses, `updated`.
4. Story unchanged (facts didn't change — only their home file).

## Split chapter

Trigger: file >~400 lines, or chapter covers 2+ workflows (smell: summary needs "and").

1. Decide split line along slice groups (sub-chapter boundaries usually = natural cut).
2. New chapter file at gap number; move slice blocks (= Move slice, batched).
3. Update Element Index "defined in" for all moved definitions.
4. `_model.md` Chapters table: split row into two; story-step ranges adjusted.
5. Neighbor links in all affected files.
6. Typed IDs unaffected — zero reference edits needed (this is why IDs ≠ file paths).

## Merge chapters

Reverse of split: move all slices into surviving file, delete empty file, update Chapters table + index + neighbor links.

## Renumber chapters

Last resort (gaps exhausted):

1. Compute new numbering (re-space by 10).
2. `git mv` each file (or rename; keep history when repo).
3. Update: Chapters table, neighbor links in every chapter file, any flow `flow-of` files.
4. Element refs untouched (IDs, not paths). Only filename mentions need fixing — grep `NN-` patterns to find them.

## Migrate single-file → multi-file

1. Create `docs/event-model/<context>/` dir.
2. Extract spine sections (frontmatter, Swimlanes, Story, Open Questions, Decisions) → `_model.md`.
3. Per chapter heading in old file → chapter file w/ its slices, numbered by story order.
4. Build Element Index: grep all definitions (`grep -n "^\*\*\(Business fact\|Command\|Read model\|External fact\|Processor\|Screen\)\*\*"` per file) → rows.
5. Chapters table + neighbor links.
6. Delete old single file. Full verification pass before considering migration done.

## Session-end discipline

Mirrors event-modeling P9-lite, file-level:
- Statuses current in all touched files; `updated` stamped.
- New unknowns → `_model.md` Open Questions (NEVER scattered TODO comments in chapter files).
- Quick integrity pass.
- Stopped mid-operation (split/rename half-done) → FINISH the operation or revert; never leave model between states overnight.
