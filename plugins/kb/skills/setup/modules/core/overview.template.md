## Repo Purpose

<!-- ADAPT[purpose]: 1-3 lines from Q1 answer. State subject, who dumps, what KB answers. Keep "AI maintains" framing. Exemplar below = worked example, replace. -->
Knowledge base for {{owner_name}}'s projects + life. AI maintains. {{owner_name}} brain-dumps, asks, rubber-ducks → AI files knowledge, reorganizes, prunes.
<!-- END ADAPT -->

## AI Job

- {{owner_name}} dumps info → file IMMEDIATELY: correct container, correct file, correct section. No asking permission, no inbox, no misc dump file.
- {{owner_name}} asks → answer FROM docs, cite files. New facts surface in conversation → fold into docs before turn ends.
- Every doc touch → opportunistic tidy (maintenance rule).
- Cross-cutting fact → file where it matters most, link from others.

## Layout

<!-- ADAPT[layout]: one bullet per chosen container: "`<container>/<slug>.md` — <what lives there>". Lifecycle container also gets index bullet + "Big → dir" note. Exemplar below = worked example, replace. -->
- `projects/<slug>.md` — tracked work w/ goal + end state. Big → `projects/<slug>/` dir.
- `projects/index.md` — status table + tombstones.
- `resources/<slug>.md` — research, reference material.
<!-- END ADAPT -->
<!-- IF module:references -->
- `.claude/rules/refs.md` — alias registry. Auto-loaded. See references rule.
<!-- END IF -->
<!-- IF module:local-paths -->
- `.claude/rules/paths.local.md` — this-machine paths. Gitignored, auto-loaded. Never commit.
<!-- END IF -->
- Git history = archive. No archive dir exist. Never create one.

## Container Triage

<!-- ADAPT[triage]: one bullet per container: "<one-line test> → `<container>/`". Every container MUST have statable test — none statable → container was wrong, revisit Q2. Exemplar below = worked example, replace. -->
- Has goal + end state → `projects/`
- Reference/research → `resources/`
<!-- END ADAPT -->
- Unsure → ask {{owner_name}} once, file it.

## Where Knowledge Go

New info → correct container, correct file, correct section, immediately. No inbox. No misc dump file. Cross-cutting fact → file it affects most, link from others.

## Style

<!-- ADAPT[style]: default = line below. Prose-deviation chosen in interview → replace w/: "Rules + skills caveman. Container docs = readable prose (<reason>). Code blocks, quoted errors, proper nouns unchanged." -->
All docs caveman. Same spec as responses.md. Code blocks, quoted errors, proper nouns unchanged.
<!-- END ADAPT -->
