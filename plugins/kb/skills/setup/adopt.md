# Adopt — existing loose-markdown repo → managed KB

Trigger: Step 0 found `.md` content, no manifest, user chose adopt. Interview runs same (Q1-Q6) — existing content INFORMS derivation (containers proposed from what's actually there). Extra steps below.

## Inventory (after Q2)

1. `find . -name '*.md' -not -path './.claude/*' -not -path './.git/*'` + `wc -l` each.
2. Propose mapping table: `current path → <container>/<slug>.md | delete | leave`. Base on filename + skim of H1/first lines. Existing README → merge into generated one, don't clobber blind.
3. Existing frontmatter in docs → flag vs minimalism rule ("field want adding → probably rots"): propose per-field keep/drop.

## Migration mode (AskUserQuestion)

1. **Machinery only (Recommended >20 files)** — generate rules/skills/containers, leave existing files in place. Opportunistic-tidy rule absorbs migration: every future touch of a legacy doc → move to container + reformat then. Note in `overview.md` via ADAPT: "Legacy docs outside containers → migrate on touch."
2. **Migrate all now** — execute mapping table: move + rename + reformat (caveman + anatomy per docs rule) each file. Heavier session; content preserved, structure normalized.
3. **Pick per file** — walk mapping table w/ AskUserQuestion batches.

## Rules

- NEVER delete content w/o listing it in the mapping table + explicit approval. Unclear file → `leave`.
- Git: existing repo → NO init; scaffold commit separate from any migration commit (reviewable independently).
- Manifest `files` = generated files only, NOT migrated content.
- Migration reformat = structure + style only. Facts survive verbatim — losing knowledge during adoption = cardinal failure.
