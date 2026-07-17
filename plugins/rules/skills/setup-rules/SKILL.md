---
name: setup-rules
description: >
  Initialize `.claude/rules/` with caveman-speak rule standards. Creates `_meta.md` and
  `responses.md` foundation files. Use when starting rules from scratch in a project or user scope.
argument-hint: "[project|user]"
disable-model-invocation: true
allowed-tools: Bash(mkdir *) Write Read
---

Before responding, pull the `rules-management` skill to load full rules authoring standards.

## Task

Set up `.claude/rules/` directory with two foundation files: `_meta.md` (structure standards) and `responses.md` (caveman speak spec).

## Step 1: Determine Scope

If `$ARGUMENTS` is `project` or `user`, use that. Otherwise ask:

> Where should rules live?
> 1. **Project** (`.claude/rules/`) — shared with team via source control
> 2. **User** (`~/.claude/rules/`) — personal, applies to all your projects

- Project → `.claude/rules/`
- User → `~/.claude/rules/`

## Step 2: Create Directory

Create the target directory if it doesn't exist.

## Step 3: Copy Foundation Files

Canonical templates live in the `rules-management` skill directory (sibling of this skill: `../rules-management/`). Do NOT write content from memory — copy files verbatim:

1. Read `../rules-management/_meta.md` (relative to THIS skill's directory) → Write identical copy to `<target>/_meta.md`.
2. Read `../rules-management/responses.md` → Write identical copy to `<target>/responses.md`.

Single source of truth: templates change in `rules-management` skill only; this skill always ships current version. Never edit copies here to differ from source.

File roles:
- `_meta.md` — structure standards. Self-scoped via `paths: ['.claude/rules/**']` → injects only when rule files explicitly read/edited.
- `responses.md` — caveman speak spec. No `paths:` → loads unconditionally every session.

## Step 4: Confirm

Tell user what was created and where. Remind them:

- `_meta.md` → auto-loads when editing any file in `.claude/rules/`
- `responses.md` → loads unconditionally every session (no `paths:` frontmatter)
- Pull `rules-management` skill anytime for full rules authoring reference
- All new rule files must follow caveman speak
