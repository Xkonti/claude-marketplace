---
name: garden
description: >
  <!-- ADAPT[garden-desc]: trim scan list to kept scans. Keep trigger words + monthly nudge. -->
  Maintenance sweep of knowledge base. Scans stale markers, past due dates, dead refs,
  broken links, oversized docs, stale statuses. Proposes deletions/fixes, applies approved.
  Use when user asks to garden, tidy, clean up, or sweep the KB, or roughly monthly.
  <!-- END ADAPT -->
---

# Garden — KB Maintenance Sweep

Scan all containers ({{container_globs}}). Build proposal list. Apply approved. Deletions = deletions, no archiving.

## Scans

<!-- Keep scan only when its [tag] module/flag chosen ([markers], [references], [lifecycle], [core] always). Renumber sequentially. Delete tags + this comment. -->
1. [markers] **Past due**: `grep -rn '@due(' {{container_globs}}` → extract dates, compare today → past-due list.
2. [markers] **Blocked**: `grep -rn '@blocked(' {{container_globs}}` → every hit → "still blocked?" question for {{owner_name}}.
3. [markers] **Stale markers**: `@todo`/`@question` hits → age via `git blame -L<line>,<line> <file>` → older 30 days → surface.
4. [references] **Dead refs**: extract all `[[...]]` links → alias present in `.claude/rules/refs.md`?<!-- IF module:local-paths --> file path exist via `.claude/rules/paths.local.md`?<!-- END IF --> → dead-ref list.
5. [core] **Broken intra-KB links**: relative md links → target file exist? → broken list.
6. [core] **Oversized docs**: `wc -l` per doc → >200 lines → propose promotion per maintenance rule.
7. [lifecycle] **Stale status**: {{entity_name}}s w/ `status: {{active_status}}` but no commits touching file in 60 days (`git log --since='60 days ago' -- <file>`) → propose `{{paused_status}}` or delete.
8. [lifecycle] **Tombstone cap**: `## Gone` in {{primary_container}}/index.md >10 lines → trim oldest.
9. [references] **Orphan aliases**: refs.md aliases referenced by zero docs → propose row removal.

## Output

Single proposal list grouped by action: **delete** / **fix** / **ask-{{owner_name}}**. Present via AskUserQuestion where choices needed. Apply approved items only. Approved promotions/restructures → delegable per delegation rule model tiers (Opus, not Sonnet).

## Cadence

On-demand. End by suggesting {{owner_name}} run roughly monthly. No cron, no automation.
