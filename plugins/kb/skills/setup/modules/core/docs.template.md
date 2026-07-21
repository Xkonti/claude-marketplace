---
paths:
{{container_paths_yaml}}
---

## Doc Anatomy — {{primary_container}}/

<!-- ADAPT[anatomy]: skeleton confirmed in Q3. Frontmatter block ONLY when lifecycle confirmed; status enum from Q3; linear field only w/ linear module. Section names per subject ({{goal_section}}/{{now_section}} analogues). Exemplar below = worked example, adjust names + gloss lines. -->
```markdown
---
status: {{status_enum}}
linear: name         # optional, Linear PROJECT name. Omit if none. [linear]
---
# {{Entity}} Name

## {{goal_section}}
1-3 lines. Why {{entity_name}} exist.

## {{now_section}}
Current focus. What next. REPLACE content, never append.

## <Topic>
Topic sections as needed. Facts, decisions-as-current-truth.
```
<!-- END ADAPT -->

## Doc Anatomy — other containers

<!-- ADAPT[other-anatomy]: one line per non-primary container. Default: "No frontmatter. H1 + topic sections." Add container-specific required section only if interview produced one. -->
No frontmatter. H1 + topic sections.
<!-- END ADAPT -->

## Frontmatter

<!-- ADAPT[frontmatter]: lifecycle → keep, substitute fields/statuses. No lifecycle → replace whole section w/ "No frontmatter anywhere. Field want adding → probably rots → no." -->
Only `status`<!-- IF module:linear --> + optional `linear`<!-- END IF -->, {{primary_container}} only. NOTHING else. No dates (git know), no tags, no kind (dir = kind), no owner. Field want adding → probably rots → no.

`done` not a status: done {{entity_name}} → delete file, tombstone in {{primary_container}}/index.md.
<!-- END ADAPT -->

## Sections

- H1 = doc name. One per file.
<!-- IF lifecycle -->
- `## {{goal_section}}` first, `## {{now_section}}` second. Both required in {{primary_container}} `<slug>.md` and dir index.md.
<!-- END IF -->
- Topic files in promoted dirs: H1 only, no frontmatter<!-- IF lifecycle -->, no {{goal_section}}/{{now_section}} (lives once in dir index.md)<!-- END IF -->.
- Decision recorded as fact: "Use SQLite. Postgres overkill for single user." Not "2026-07-07: we decided...". No decision log ever.

## Writing

<!-- ADAPT[writing]: match style choice from overview ADAPT[style]. -->
Caveman. Current state only. Reader = future AI + {{owner_name}}. Optimize scan: short sections, bold key terms, tables for structured facts.
<!-- END ADAPT -->
