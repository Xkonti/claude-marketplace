# Interview — question flow

Principle: derive-then-confirm, never open-design. ONE open question (Q1). Everything else = AskUserQuestion w/ recommended option first. Default path ≤6 rounds. User answers mid-flow may answer later questions — skip answered ones.

## Step 0 — Mode + target

1. Target = cwd. Cwd looks like unrelated code repo (src/, package.json, go.mod…) → ask for target dir first.
2. `.claude/kb-manifest.json` exists → STOP: "KB already generated here (kb plugin v<X>). Upgrade mode not yet supported — edit KB directly; conventions self-documented in its `.claude/rules/`."
3. Loose `.md` content present, no manifest → offer adopt ([adopt.md](adopt.md)) vs wrong-directory abort.
4. Empty/fresh → fresh path, continue.

## Q1 — Subject (free text, the only open question)

> "What's this knowledge base about? 1-2 sentences: subject, who dumps into it, what questions it should answer. Example: 'Recipes I cook. I dump attempts and tweaks; it should answer what to cook and what went wrong last time.'"

Derive silently: purpose lines, owner (git config user.name fallback conversation), candidate containers, primary entity + lifecycle guess, plausible modules (references? linear?), doc-style guess (human-consumed content → prose candidate).

## Q2 — Containers (AskUserQuestion, single-select)

Derive ONE recommended set first: ≤4 containers, EACH w/ statable one-line triage test. No statable test → merge container. Options:

1. **Recommended** — derived set, label lists names, description lists triage tests
2. **Classic triad** — `projects/` (goal + end state) `areas/` (ongoing, no end) `resources/` (reference)
3. **Single container** — one flat dir, name derived from subject
4. Custom via Other

## Q3 — Primary entity anatomy (confirm, don't design)

Primary entity = the lifecycle-bearing container's doc type ({{entity_name}}: project, recipe, character…). Draft skeleton: status enum ONLY if lifecycle real; ≤1 extra frontmatter field (linear); goal/now section analogues named per subject (now-analogue = REPLACE-never-append). Show rendered skeleton. AskUserQuestion:

1. **Looks right (Recommended)**
2. **No lifecycle — plain docs** → drops: index.md status table, garden stale-status + tombstone scans, most of scaffold value (default scaffold OFF)
3. **Tweak sections** → one free-text round, re-confirm once

Frontmatter minimalism NOT offered as choice — enforced ("field want adding → probably rots → no").

## Q4 — Modules (AskUserQuestion, multiSelect, defaults preselected)

- **Inline markers** — default ON
- **External references** (alias registry, no hardcoded paths/URLs) — ON when Q1 mentions repos/tools/sites/papers, else OFF
- **Machine-local paths** — only offered when references ON; default ON when aliases point at local clones
- **Garden skill** (maintenance sweep) — default ON
- **Scaffold skill** (`/new-<entity>`) — ON when lifecycle confirmed, else OFF
- **Linear** — offered only when Q1 mentions tickets/PM or Linear MCP detected; default OFF. Chosen → auto-includes references.

## Q5 — Conditional one-liners (skip when defaults fine)

- markers: propose ≤1 subject-specific custom marker (e.g. `@try` for recipes) — only w/ clear lifecycle; user vetoes.
- references: seed aliases — KB's own repo auto (git remote), ask for 0-3 more.
- linear: workspace slug + team name/key.

## Fixed — never asked

Split threshold 200 lines, tombstone cap 10, stale windows 30/60 days, caveman for rules + skills, gitignore contents, settings allowlist, delegation policy (dual-job curation, Haiku search / background Sonnet filing).

Doc-body style: caveman default. Subject = human-consumed content (recipes read while cooking, worldbuilding prose) → wizard proposes prose deviation, flagged in Q6 plan for veto.

## Q6 — Generation plan + go

Print: full file list w/ one-liners, container dirs, style choice, git actions (`git init` + first commit when not repo), settings.json allowlist note. AskUserQuestion: **Generate (Recommended)** / **Adjust** (name what → loop back) / **Abort**.

User declines git → warn: garden blame/log scans + tombstone safety degrade; record `"git": false` in manifest.

→ proceed per [instantiate.md](instantiate.md).
