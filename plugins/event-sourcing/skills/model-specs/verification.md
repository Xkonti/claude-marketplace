# Verification — proving 100% complete

Two tiers: Quick (after every edit session) + Full (before declaring model complete / handing to es-design). Mechanical first — grep before judgment. Run from context dir: `cd docs/event-model/<context>/`.

## Quick pass (cheap, every session)

1. **Dangling references** — every used ID is defined:
   ```bash
   # all IDs used anywhere
   grep -rhoE '\[(fact|xfact|cmd|rm|screen|proc|slice|flow):[a-z0-9-]+\]' . | sort -u > /tmp/used
   # all IDs in Element Index
   grep -oE '\[(fact|xfact|cmd|rm|screen|proc):[a-z0-9-]+\]' _model.md | sort -u > /tmp/indexed
   comm -23 /tmp/used /tmp/indexed   # → used but not indexed (slice:/flow: hits = check headings exist)
   comm -13 /tmp/used /tmp/indexed   # → indexed but never used (zombie index rows)
   ```
2. **Duplicate definitions** — element defined twice:
   ```bash
   grep -rnE '^\*\*(Business fact|Command|Read model|External fact|Processor|Screen)\*\* \[' . \
     | grep -oE '\[[a-z]+:[a-z0-9-]+\]' | sort | uniq -d
   ```
3. **Index accuracy** — spot-check moved/new definitions: row's file actually contains the definition.
4. **Status + stamp** — touched files: statuses recomputed, `updated` current.
5. **Stray TODOs** — `grep -rni "TODO\|FIXME\|???" .` → migrate into Open Questions ledger, delete inline.
6. **Anchors touched?** — flipped a slice to `implemented`/`modeled-only`, or edited a code anchor → run the drift gate (tier E below). Skip if pure modeling session (no code yet).

## Full verification (model completion gate)

### A. Structural integrity

1. Quick pass, all green.
2. Every chapter file registered in Chapters table; no orphan files (`ls *.md` vs table).
3. Frontmatter `context` matches dir on every file.
4. Neighbor links (Preceding/Following) form unbroken chain in story order.
5. Story steps: union of chapters' "covers story steps" = every story step exactly once.
6. Flow sections/files: every `Branches from:` target slice exists.

### B. Notation compliance (per chapter file)

1. Every slice heading: `#### Slice: <name> [<pattern>]` + Status line. Pattern ∈ {State Change, State View, Automation, Translation}.
2. Every element block matches notation.md format; attribute tables carry `source` column, no empty cells.
3. Every GWT block: GIVEN/WHEN/THEN shape per slice type (patterns.md table), concrete example data present.

### C. Cross-file consistency

1. **Read model source lists** — per read model definition, grep its ID across chapters: every fact whose slice claims to affect it appears in its source list, and vice versa. Asymmetry = ripple procedure skipped.
2. **Swimlane discipline** — every fact's declared lane exists in `_model.md` Swimlanes; external facts only in external lanes:
   ```bash
   grep -rhoE 'lane: `[a-z-]+`' . | sort -u   # compare against Swimlanes section
   ```
3. **Ledger references** — every `q-N` / `d-N` mentioned in chapters exists in `_model.md`.

### D. Completeness (event-modeling/quality.md, cross-file edition)

1. Information completeness sweep per chapter — attribute trails (rm → fact → cmd → screen/external/generated). Trail crossing files → follow via index, verify at definition.
2. Ambiguity audit per quality.md — incl. cross-file flavor: same concept under two IDs in different chapters (near-duplicate names in index = smell: `[rm:cart-items]` vs `[rm:items-in-cart]`).
3. Story readback against full model, chapter sequence order.
4. Open Questions: zero unanswered BLOCKING; provisional decisions reviewed.

### E. Code consistency (model↔code drift gate)

Runs `scripts/check-model-drift.sh` (ships in this skill). Gates the model↔code anchor contract (event-modeling/notation.md § Model↔code anchors).

N/A when zero slices are `implemented` AND zero elements are `modeled-only` — pure-modeling models can't drift against code; tier passes vacuously, report notes `N/A`.

Otherwise MANDATORY. Run from repo root:

```bash
scripts/check-model-drift.sh --model-dir docs/event-model/<context> --code-root <src-dir>
```

Checks:
1. **Missing code** — every anchor of an implementable type (`fact` `cmd` `rm` `proc` `slice`) owned by an `implemented` slice resolves to ≥1 code anchor. Miss → `MISSING-CODE`. (The `implemented` status is a claim; this proves it.)
2. **Unknown anchor** — every `[type:id]` found in code resolves to a defined model element (or valid slice/flow id). No match → `UNKNOWN-ANCHOR` (typo, or model element renamed/deleted w/o updating code — see operations.md § Rename).
3. **Modeled-only leak** — every `modeled-only` element/slice is ABSENT from code. Present → `MODELED-ONLY-IN-CODE` (either it's really implemented — drop the marker — or the anchor is stray).

Any finding → tier E RED. Exit 0 = green, 1 = drift, 2 = usage error. Limitations documented in the script header (comment-blind grep, presence-only, exact-match ids).

### Verdict

All A–E green → `_model.md` status: `verified`. Tier E N/A counts as green. Anything red → fix or ledger entry; model stays `modeling`. NEVER mark verified w/ known reds — downstream es-design treats `verified` as load-bearing, and a false `implemented` status is a known red.

## Verification report

Full pass → append dated report section to `_model.md` (or replace previous):

```markdown
## Verification — <date>
- A structural: PASS
- B notation: PASS
- C cross-file: PASS (1 source-list asymmetry fixed: [rm:cart-items])
- D completeness: PASS — 0 blocking questions open
- E code: PASS (or: N/A — no implemented slices | FAIL — 2 drift: 1 MISSING-CODE, 1 UNKNOWN-ANCHOR)
- Verdict: verified
```

Report = proof of process + diff anchor for next verification (changed files since last report = re-verify scope).

## Drift guards (why these checks exist)

- Definition-once + index → single edit point per element; checks 2/A3 catch violations early, when cheap.
- Typed-ID refs → file moves can't break links; check 1 catches the remaining failure mode (typos, deleted elements).
- Source-list symmetry (C1) = THE multi-file-specific rot: later chapters extend earlier read models, definition update forgotten. Highest-yield check in the battery.
- Mechanical greps before judgment passes → agent burns judgment budget on D (the genuinely hard part), not bookkeeping.
- Anchor gate (E) = model↔code rot guard. `implemented` status is a claim; anchors make it provable. Catches: renamed model element w/ stale code anchor, `implemented` slice never actually coded, `modeled-only` element that quietly got built. Cheap grep, blocking for `verified` — a lying status is worse than an incomplete one.
