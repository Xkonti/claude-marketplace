# Instantiation — templates → target files

## Hard Rule

Read template → copy VERBATIM → touch ONLY marked slots → delete all marker comments/tags. NEVER regenerate mechanisms from memory — templates carry hard-won subtleties (REPLACE-never-append, fold-and-delete marker lifecycle, tombstone cap, promotion link-fixing). Freelancing = the failure mode this file exists to kill.

## Marker syntax (in templates)

| Marker | Meaning | Action |
|---|---|---|
| `{{slot}}` | value slot | substitute value, exact |
| `<!-- ADAPT[id]: instruction -->…<!-- END ADAPT -->` | rewrite region | REWRITE content per instruction; enclosed exemplar text = worked example showing shape + depth |
| `<!-- IF module:x -->…<!-- END IF -->` | conditional | module chosen → keep content, delete comments. Not chosen → delete whole block |
| `<!-- IF lifecycle -->` / `[lifecycle]` | lifecycle-gated | gated by Q3 lifecycle answer, not a module |
| `[markers]` `[references]` `[linear]` `[core]` line tags | numbered-list conditionals | keep line only when tag's module chosen ([core] = always); renumber sequentially; delete tags |

Markers appear INSIDE fenced code blocks too (doc skeletons) — process identically.

## Slot glossary

| Slot | Source |
|---|---|
| `{{owner_name}}` | git config user.name / conversation |
| `{{kb_title}}` `{{kb_purpose}}` | Q1 |
| `{{container_globs}}` | space-separated container dirs w/ trailing `/`: `projects/ resources/` |
| `{{container_paths_yaml}}` | yaml list lines: `  - 'projects/**'` per container |
| `{{primary_container}}` `{{entity_name}}` `{{Entity}}` `{{Container_title}}` | Q2/Q3 |
| `{{status_enum}}` `{{active_status}}` `{{paused_status}}` | Q3 (e.g. `idea\|active\|paused`, `active`, `paused`) |
| `{{goal_section}}` `{{now_section}}` | Q3 section names (e.g. Goal/Now, Base recipe/Last attempt) |
| `{{marker_grep_pattern}}` | marker set → `@todo\|@question\|@blocked\|@due(` + custom |
| `{{kb_alias}}` `{{kb_remote}}` `{{kb_abs_path}}` `{{intra_link_example}}` | git remote / target path / real container example |
| `{{linear_workspace}}` `{{linear_team}}` `{{linear_team_key}}` | Q5 linear |

Fixed values baked into templates (never parameterized): split threshold 200, tombstone cap 10, stale-marker 30d, stale-status 60d.

## Assembly table — module → target files

| Module | Template | Target |
|---|---|---|
| core | overview.template.md | `.claude/rules/overview.md` |
| core | docs.template.md | `.claude/rules/docs.md` |
| core | maintenance.template.md | `.claude/rules/maintenance.md` |
| core | delegation.template.md | `.claude/rules/delegation.md` (verbatim, no slots) |
| core | index.template.md | `<primary>/index.md` (lifecycle only; non-lifecycle containers → `.gitkeep` each) |
| core | readme.template.md | `README.md` |
| core | claude.template.md | `CLAUDE.md` |
| core | settings.template.json | `.claude/settings.json` (verbatim, no slots) |
| core | gitignore.template | `.gitignore` (append if exists) |
| style | responses.md + _meta.md | `.claude/rules/` (VERBATIM copies, strip TWIN comment) |
| markers | markers.template.md | `.claude/rules/markers.md` |
| references | references.template.md + refs.template.md | `.claude/rules/references.md` + `.claude/rules/refs.md` |
| local-paths | paths-local.template.md | `.claude/rules/paths.local.md` |
| garden | garden-skill.template.md | `.claude/skills/garden/SKILL.md` |
| scaffold | scaffold-skill.template.md | `.claude/skills/new-{{entity_name}}/SKILL.md` |
| linear | (no files — IF blocks in other templates; see modules/linear/linear.md) | — |

Module dependencies: local-paths ⇒ references. linear ⇒ references (auto-include). scaffold skeleton MUST byte-match docs.md anatomy skeleton.

## Manifest

Write `.claude/kb-manifest.json` last:

```json
{
  "kbPluginVersion": "<plugin.json version>",
  "generated": "<date>",
  "git": true,
  "modules": ["markers", "references", "..."],
  "params": {
    "subject": "...", "owner": "...",
    "containers": [{"name": "...", "triage": "...", "lifecycle": true}],
    "entity": "...", "statusEnum": "...", "sections": {"goal": "...", "now": "..."},
    "markers": ["todo", "question", "blocked", "due"],
    "docStyle": "caveman|prose"
  },
  "files": ["<every generated path>"]
}
```

Never loaded into context (JSON ≠ rule). Read only by future adopt/upgrade runs.

## Post-generation verification — ALL must pass

1. Leftover markers: `grep -rn '{{\|ADAPT\|END ADAPT\|IF module\|END IF\|\[markers\]\|\[references\]\|\[lifecycle\]\|\[linear\]\|\[core\]' <target> --exclude-dir=.git` → zero hits. Whole target, not just `.claude/` — container index.md carries slots too.
2. Garden greps: dry-run every bash command in generated garden skill → executes w/o error (empty results fine).
3. Cross-references: every file mentioned in any generated rule/skill exists on disk (refs.md, paths.local.md, index.md, responses.md…).
4. `paths:` frontmatter globs in docs.md/markers.md match actual container dirs created.
5. Manifest `files` list == disk reality (diff).
6. Scaffold skeleton == docs.md skeleton (visual diff of fenced blocks).

Any red → fix before reporting done. Then git: not a repo → `git init`; commit all as `KB scaffold (kb plugin v<version>)` (skipped if user declined git in Q6 — manifest records `"git": false` + user warned garden blame/log scans degrade).
