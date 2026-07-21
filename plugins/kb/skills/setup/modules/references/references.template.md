## Link Forms

<!-- ADAPT[link-forms]: keep forms matching alias types from Q5. `repo`/`file` for code-adjacent subjects; `url` for websites/papers/products; linear form only w/ linear module. Adjust example extensions to subject. -->
- `[[repo:alias]]` — whole repo
- `[[file:alias/path/in/repo.go]]` — file in repo. First segment = alias.
- `[[url:alias]]` — external website/resource
<!-- IF module:linear -->
- `[[linear:ABC-123]]` — Linear issue
<!-- END IF -->
<!-- END ADAPT -->
- Intra-KB links: plain markdown relative links, not wiki. `[example]({{intra_link_example}})`

## Hard Rule

NEVER hardcode absolute paths or URLs in docs. Alias only. Path/URL belong in refs.md<!-- IF module:local-paths --> or paths.local.md<!-- END IF -->, nowhere else.

## Registries

<!-- IF module:local-paths -->
Both in `.claude/rules/` → auto-loaded, no read step:

- `refs.md` (committed): alias → remote/URL<!-- IF module:linear --> + Linear workspace<!-- END IF -->.
- `paths.local.md` (gitignored via `*.local.*`): alias → absolute path THIS machine.
<!-- END IF -->
<!-- ADAPT[registries-no-local]: local-paths module EXCLUDED → replace section body w/: "`refs.md` (committed, this dir): alias → remote/URL. Auto-loaded, no read step." Local-paths INCLUDED → delete this comment only. -->

## Resolution Procedure

<!-- ADAPT[resolution]: keep steps for chosen alias types. Local-paths excluded → drop paths.local.md steps, resolve straight to remote/URL. -->
1. `[[repo:X]]` → paths.local.md row X → absolute path. Missing row → refs.md remote URL. Missing both → dead ref, fix or ask {{owner_name}}.
2. `[[file:X/rel/path]]` → split first `/`. paths.local.md[X] + `/rel/path` → readable path. No local row → refs.md remote → blob URL.
3. `[[url:X]]` → refs.md url row.
<!-- IF module:linear -->
4. `[[linear:ID]]` → Linear MCP tools accept `ABC-123` identifier directly — query, no UUID lookup. URL fallback: refs.md workspace slug → `https://linear.app/<slug>/issue/<ID>`.
<!-- END IF -->
<!-- END ADAPT -->

## New Alias

Unknown alias needed → add refs.md row (ask {{owner_name}} for remote/URL if unknown)<!-- IF module:local-paths --> + paths.local.md row for this machine. Both, same session<!-- END IF -->.
<!-- IF module:local-paths -->

## Missing paths.local.md

Fresh clone lacks it. Resolution hits absent file → STOP current lookup, recreate:

1. Per refs.md repo row → ask {{owner_name}}: local clone path on this machine? (skip = remote-only alias)
2. Write `.claude/rules/paths.local.md`:

```markdown
## Machine Paths — THIS machine only

Gitignored. Never commit. Missing on fresh clone → recreate per references rule.

| alias | path |
|-------|------|
| <alias> | /absolute/path |
```

3. Continue original lookup.
<!-- END IF -->
