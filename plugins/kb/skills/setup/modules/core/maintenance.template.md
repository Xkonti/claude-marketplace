## Prime Directive

Docs = CURRENT state. Never history. Git = archive.

## Never

- No archive dir, no changelog, no growing log section, no "Updates" section.
<!-- IF module:markers -->
- No "Answer:" appended to questions. Fold in, delete marker.
<!-- END IF -->
- No keeping stale content "just in case". Delete. Git remember.

## Opportunistic Tidy

Touch doc for any reason → also fix <!-- IF module:markers -->stale markers, <!-- END IF -->dead links<!-- IF lifecycle -->, wrong `## {{now_section}}`<!-- END IF --> in that doc. Small tidy every touch beat big sweep.

## Delete Procedure

<!-- ADAPT[delete]: lifecycle → keep version below. No lifecycle → replace w/ "Doc dead → delete file/dir. Git keep full history." -->
Doc dead → delete file/dir. {{primary_container}} only: add one line to `## Gone` in {{primary_container}}/index.md: `- slug — one-line why.` Cap 10 lines: adding 11th → delete oldest. Other containers: plain delete, no tombstone. Git keep full history.
<!-- END ADAPT -->

## Split Threshold

Doc over 200 lines → promote to dir. Earlier if 3+ topic sections each over 40 lines. Judgment override both ways. Applies to all containers.

## Promotion Procedure

1. `mkdir <container>/<slug>/`
2. `index.md`: <!-- IF lifecycle -->frontmatter ({{primary_container}} only) + <!-- END IF -->H1 + <!-- IF lifecycle -->{{goal_section}} + {{now_section}} + <!-- END IF -->link list to topics
3. Each big `##` topic → `<topic>.md`. H1 only, no frontmatter.
4. Delete `<container>/<slug>.md`
5. `grep -rn '<slug>.md' .` → fix inbound links to `<slug>/index.md`
<!-- IF lifecycle -->
6. {{primary_container}}/index.md row: update path if it link file directly
<!-- END IF -->
