---
name: link
description: >
  Connect current code repo to its Linear project. Interactive: pick team + project via
  Linear MCP (offer create if missing), write `## Linear` section to `CLAUDE.local.md` at
  repo root → auto-loads every session/subagent, zero lookups later. Verifies
  `CLAUDE.local.md` gitignored. Use when user says "link repo to Linear", "connect Linear
  project", "set up factory", or invokes `/factory:link`.
argument-hint: "[project name | empty → interactive]"
disable-model-invocation: true
allowed-tools: Read, Write, Edit, Bash(grep:*), Bash(test:*), Bash(ls:*), Bash(git rev-parse:*), mcp__linear-server__list_teams, mcp__linear-server__get_team, mcp__linear-server__list_projects, mcp__linear-server__get_project, mcp__linear-server__save_project
---

# Link Repo → Linear Project

One-time setup. Result = `## Linear` section in `CLAUDE.local.md` (format: [linear-section.md](linear-section.md)) → every later session + subagent gets link info free.

## Step 1 — MCP Preflight

Call `mcp__linear-server__list_teams`. Tool absent or errors → tell user:

> Linear MCP not connected. Set up: https://linear.app/docs/mcp — then `claude mcp add` or `/mcp` to authenticate. Re-run `/factory:link` after.

Stop.

## Step 2 — Existing Link Check

`CLAUDE.local.md` has `## Linear` section? → show current values, ask: update (re-run flow, overwrite section) or abort. NEVER silently overwrite.

## Step 3 — Pick Team

- One team → use it, say so.
- Multiple → AskUserQuestion w/ names + keys.
- Zero → tell user: create team in Linear first. Stop.

## Step 4 — Pick Project

`list_projects` scoped to team.

- `$ARGUMENTS` has name → exact match, then fuzzy. No match → present list.
- No args → present list + "create new" option.
- Create → confirm name first (default = repo dir name) → `save_project` w/ team.

## Step 5 — Collect Fields

- workspace slug — parse from any `linear.app/<slug>/...` URL in team/project responses
- team name + key
- project name + project UUID

All five present before writing. MCP dies mid-flow → report, write NOTHING partial.

## Step 6 — Write Section

Format per [linear-section.md](linear-section.md). Cases:

- No `CLAUDE.local.md` → create w/ section only
- File exists, no section → append at end
- Section exists (update path from Step 2) → replace section body only

Preserve all other content (`## Goals` etc.). NEVER write to `CLAUDE.md` — shared file.

## Step 7 — Gitignore Check

```bash
grep -E '^(CLAUDE\.local\.md|\*\.local\.md|\*\.local\.\*|CLAUDE\.local\.\*)$' .gitignore
```

Match → silent, done. No match or no `.gitignore` → warn: link info = private, risks commit. Offer append `*.local.*` (create file if missing). Decline → skip.

## Step 8 — Confirm

Echo written section + gitignore status. Next steps: `/factory:search` for project overview, `/factory:work` to pick up a ticket.

## Notes

- Not a git repo (`git rev-parse --show-toplevel` fails) → confirm cwd is intended project root before writing.
- Duplicate project names across teams → disambiguate by team, UUID stored anyway.
- Re-linking to different project = normal update path, Step 2.
