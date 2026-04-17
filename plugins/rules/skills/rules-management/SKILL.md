---
name: rules-management
description: >
  Manage `.claude/rules/` files. Create, edit, organize rule files with proper structure
  and caveman speak. One file per concern, `##` headers, fragments not sentences.
  Example: `## When Adding New Rules` → `One file per concern. Name descriptive. Caveman from first line.`
---

Manage `.claude/rules/` directory. All rule files MUST use caveman speak — no exceptions.

## Reference Files

Two files define standards. Read before any rules work:

- `_meta.md` — structure, naming, formatting standards for rule files
- `responses.md` — full caveman speak style spec, persistence rules, auto-clarity exceptions

## How Rules Work

`.claude/rules/` = modular instruction files. Claude load at session start or on-demand.

- All `.md` files discovered recursively. Subdirs OK: `frontend/`, `backend/`
- No `paths:` frontmatter → load unconditionally at launch, same priority as `.claude/CLAUDE.md`
- With `paths:` frontmatter → load only when Claude read matching files
- Rules = context, not enforcement. Specific + concise = better adherence
- Conflicts between rules → Claude pick arbitrarily. Avoid contradictions

### Path-Scoped Rules

YAML frontmatter `paths:` field scope rule to specific files. Glob patterns supported.

```markdown
---
paths:
  - "src/api/**/*.ts"
---
```

Pattern examples:

| Pattern                | Match                                 |
| ---------------------- | ------------------------------------- |
| `**/*.ts`              | All TypeScript files, any dir         |
| `src/**/*`             | All files under `src/`                |
| `*.md`                 | Markdown files in project root only   |
| `src/components/*.tsx` | React components in specific dir      |

Multiple patterns + brace expansion OK:

```markdown
---
paths:
  - "src/**/*.{ts,tsx}"
  - "lib/**/*.ts"
  - "tests/**/*.test.ts"
---
```

### Scope Levels

Rules exist at two levels:

- **Project rules**: `.claude/rules/` — shared via source control, team-wide
- **User rules**: `~/.claude/rules/` — personal, all projects, lower priority than project rules

### Rules vs Skills vs CLAUDE.md

- Rules: load every session or on file match. Good for always-on standards
- Skills: load on-demand when invoked or relevant. Good for task-specific workflows
- CLAUDE.md: main project instructions. Target under 200 lines. Split overflow → rules

## Caveman Speak in Rules

ALL rule file content = caveman speak. Drop articles, filler, pleasantries, hedging. Fragments OK. Technical terms exact. Code blocks unchanged.

Pattern: `[thing] [action] [reason].`

Bad: "When you are adding a new rule, you should make sure to create one file per concern and give it a descriptive name."
Good: "One file per concern. Name descriptive: `commands.md`, `overview.md`, not `rules2.md`."

Bad: "You should always read the responses.md file first so that you can internalize the style before editing."
Good: "Read `responses.md` first → internalize style."

## Rule File Structure

- One file per concern. Split when file covers 2+ unrelated topics
- `##` headers for sections
- Fragments, not sentences
- Code blocks: unchanged, normal English
- Technical terms: exact, never abbreviate wrong
- Frontmatter `paths:` when file only applies to specific files
- Prefix `_` for meta/structural files

Example frontmatter (from `_meta.md`):

```markdown
---
paths:
  - '.claude/rules/**'
---
```

## Writing Good Rules

Rules = context Claude read. Quality matter.

- **Size**: keep each rule file focused + concise. Long files → reduced adherence
- **Structure**: `##` headers, bullets. Organized sections > dense paragraphs
- **Specificity**: concrete > vague. "Use 2-space indent" not "format code properly"
- **No conflicts**: contradicting rules → arbitrary behavior. Review periodically
- **HTML comments**: `<!-- notes -->` stripped before injection. Use for human-only notes. Comments in code blocks preserved

## When Creating New Rule Files

1. Read `responses.md` → internalize caveman style
2. Read `_meta.md` → internalize structure standards
3. One file per concern. Name descriptive: `commands.md`, `overview.md`, not `rules2.md`
4. Add `paths:` frontmatter if scoped to specific files
5. Prefix `_` for meta/structural files
6. Caveman from first line. No "Introduction" or "About this file" preamble
7. Strip: articles, filler, pleasantries, hedging
8. Keep: all technical substance, code examples, exact terms
9. Can organize into subdirs: `frontend/`, `backend/`, etc.

## When Editing Existing Rule Files

1. Read `responses.md` first
2. Read target file
3. Preserve existing structure and scope
4. Apply caveman speak to all changes
5. Shorter = better. One word when one word enough
6. Check no conflicts with other rule files
