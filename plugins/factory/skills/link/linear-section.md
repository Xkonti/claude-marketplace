# `## Linear` Section — Canonical Format

Lives in `CLAUDE.local.md` at repo root. Written by `/factory:link`, consumed by `/factory:search` + `/factory:work`. This file = ONLY definition of format.

## Format

```markdown
## Linear

- Workspace: acme-co
- Team: Engineering (ABC)
- Project: My App
- Project ID: 00000000-0000-0000-0000-000000000000
```

## Field Rules

- Workspace = workspace slug (from Linear URLs)
- Team = display name + key in parens. Key = issue prefix → ABC in ABC-123
- Project = exact Linear project name (MCP accepts names directly)
- Project ID = project UUID — disambiguation when names collide or project renamed
- One `- Key: value` bullet per line. No extra prose inside section.

## Reading (search/work Step 0)

- Section auto-loads via CLAUDE.local.md → check context FIRST. File Read = fallback only.
- No section anywhere → repo not linked → tell user: run `/factory:link`. Stop.
- MCP filters: prefer Project ID; project name = fallback.
