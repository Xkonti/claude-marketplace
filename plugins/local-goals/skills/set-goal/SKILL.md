---
name: set-goal
description: >
  Create, update, or replace `## Goals` section in `CLAUDE.local.md` at repo root. Goals persist
  across sessions + auto-load for all agents/subagents → stop repeating focus. Verifies
  `.gitignore` excludes `CLAUDE.local.md` / `*.local.*` → goals stay local + private.
  Use when user says "my goal for this session is…", "let's focus on…", "set goal", "add goal",
  "replace goals", "update goals", or invokes `/set-goal`.
argument-hint: "[goal text | 'replace' | 'update' | 'add' | empty]"
allowed-tools: Read, Write, Edit, Bash(test:*), Bash(grep:*), Bash(ls:*)
---

Manage `CLAUDE.local.md` `## Goals` section. Auto-loaded by Claude Code for session + all subagents → durable focus w/o user repeating.

## Step 1 — Parse Intent

From `$ARGUMENTS` + recent user msg, infer mode:

- **Add** — appending new goal to existing list. Triggers: "add goal", "also focus on", "another goal", goal text given w/o verb
- **Update** — modifying existing goal text. Triggers: "update goal", "change goal to", "refine"
- **Replace** — wiping all goals, setting fresh. Triggers: "replace goals", "new goals", "reset goals", "instead focus on"
- **Empty args / unclear** — no text OR ambiguous. Ask:

  > Mode?
  > 1. **Add** — append to existing goals
  > 2. **Update** — modify existing goal
  > 3. **Replace** — wipe + set fresh goals
  >
  > And what's the goal text?

File doesn't exist → treat as **Replace** (fresh create).

## Step 2 — Read Existing File

Check `CLAUDE.local.md` at repo root.

- Not exist → skip to Step 4
- Exists → read full content. Locate `## Goals` section (between `## Goals` header + next `##` header or EOF)

## Step 3 — Ambiguity Check

Before writing:

- **Add** mode but no `## Goals` section exists → treat as Replace (creating first goals)
- **Replace** mode but existing goals present + user didn't clearly say "replace" → confirm:

  > Existing goals:
  > [list them]
  >
  > Replace all w/ new? Or append instead?

- Goal text unclear / empty → ask for explicit goal text

## Step 4 — Write Goals

Format goals as bullet list under `## Goals` header:

```markdown
## Goals

- Primary goal text
- Secondary goal text
```

**Cases:**

- File doesn't exist → create `CLAUDE.local.md` w/ `## Goals` section only
- File exists, no `## Goals` section → append `## Goals` at end
- File exists, `## Goals` present + **Add** → append bullet(s) to list
- File exists, `## Goals` present + **Update** → modify matching bullet(s)
- File exists, `## Goals` present + **Replace** → replace section body

Preserve other content untouched.

## Step 5 — Gitignore Check

Check `.gitignore` at repo root for any of these patterns:

- `CLAUDE.local.md`
- `*.local.md`
- `*.local.*`
- `CLAUDE.local.*`

Use `grep -E` for combined check. Example:

```bash
grep -E '^(CLAUDE\.local\.md|\*\.local\.md|\*\.local\.\*|CLAUDE\.local\.\*)$' .gitignore
```

**If matched** → note silently, skip to Step 6.

**If none matched**:

- `.gitignore` exists, no matching pattern → tell user:

  > `CLAUDE.local.md` not in `.gitignore`. Goals leak to repo if committed. Add `*.local.*` to `.gitignore`?

- `.gitignore` missing → tell user:

  > No `.gitignore` at repo root. `CLAUDE.local.md` risks accidental commit. Create `.gitignore` w/ `*.local.*`?

User confirm → append `*.local.*` to `.gitignore` (create file if missing). User declines → skip.

## Step 6 — Confirm

Brief report to user:

- Mode used (add/update/replace)
- Current goals list
- Gitignore status (ignored / just added / still exposed)

## Notes

- File at **repo root**, never nested
- Goals = free-form text. Don't over-structure. Bullet list enough
- User pastes goal paragraph → keep as single bullet unless clearly multi-goal
- Don't touch other sections of `CLAUDE.local.md` (user may have other local notes)
- Don't write goals to `CLAUDE.md` — shared w/ team. Local goals = local file
