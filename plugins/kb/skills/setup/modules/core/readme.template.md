# {{kb_title}}

<!-- ADAPT[readme-purpose]: 1-2 lines, human-facing prose OK here. Subject + "maintained autonomously by AI". Exemplar below = worked example, replace. -->
Markdown knowledge base for projects, ongoing life areas, and research. Maintained autonomously by AI (Claude Code): brain-dump → AI files it, ask → AI answers from docs, prunes stale content over time.
<!-- END ADAPT -->

## How It Works

<!-- ADAPT[readme-how]: first bullet lists chosen containers w/ 2-3 word gloss each. Module bullets kept/dropped by IF tags. -->
- `projects/` — tracked work. `resources/` — research/reference.
<!-- END ADAPT -->
- Docs hold current state only; git history is the archive. No changelogs.
<!-- IF module:markers -->
- Inline `@todo` / `@question` / `@blocked` / `@due(...)` markers — grep instead of task lists.
<!-- END IF -->
<!-- IF module:references -->
- External things linked via aliases (`[[repo:x]]`) — no hardcoded paths/URLs.
<!-- END IF -->

All conventions live in `.claude/rules/`.<!-- IF module:local-paths --> Machine-specific paths in gitignored `.claude/rules/paths.local.md` — recreate on fresh clone (procedure: references rule).<!-- END IF -->
