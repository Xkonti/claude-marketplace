---
name: new-{{entity_name}}
description: >
  <!-- ADAPT[scaffold-desc]: substitute entity + gathered fields. Keep "Use when user starts tracking new <entity>" trigger. -->
  Scaffold new {{entity_name}} doc in {{primary_container}}/. Gathers slug + {{goal_section}},
  creates doc per docs rule, updates index. Use when user starts tracking new {{entity_name}}.
  <!-- END ADAPT -->
---

# New {{Entity}} — Scaffold

## Gather

Ask {{owner_name}} (skip what convo already gave):
- slug (kebab-case, short)
- {{goal_section}} (1-3 lines)
<!-- IF module:references -->
- external repo/resource involved? → alias + remote/URL
<!-- END IF -->
<!-- IF module:linear -->
- Linear project? → create via MCP or link existing; frontmatter `linear:` = project name
<!-- END IF -->

## Create

1. `{{primary_container}}/<slug>.md` per docs rule:

<!-- ADAPT[scaffold-skeleton]: paste EXACT skeleton from generated docs.md rule (single source of shape = docs rule; this copy must match it verbatim). -->
```markdown
---
status: {{status_enum}}
---
# {{Entity}} Name

## {{goal_section}}
<{{goal_section}}>

## {{now_section}}
<first focus, or "Not started.">
```
<!-- END ADAPT -->

<!-- Keep numbered steps matching chosen modules ([references], [lifecycle]). Renumber. Delete tags. -->
2. [references] Alias involved → add `.claude/rules/refs.md` row<!-- IF module:local-paths --> + `.claude/rules/paths.local.md` row (this machine). Both, same session<!-- END IF -->.
3. [lifecycle] Add row to `{{primary_container}}/index.md` table: `| <slug>.md link | status | one-line what |`

## Not This Skill

<!-- ADAPT[not-this]: list non-primary containers. -->
Other containers need no scaffold — no frontmatter, create file directly during conversation per docs rule.
<!-- END ADAPT -->
