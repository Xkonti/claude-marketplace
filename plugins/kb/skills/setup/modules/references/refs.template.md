## Alias Registry

Docs link via alias only. Link scheme + resolution: references.md rule.<!-- IF module:local-paths --> Machine paths: `paths.local.md` (gitignored, this dir).<!-- END IF -->

## Repos

<!-- ADAPT[seed-aliases]: seed w/ KB's own repo (from git remote when present) + Q5 aliases. Subject w/o repos → rename section per alias type (## Links w/ alias|url columns). Multiple type groups → one ## section each. -->
| alias | remote |
|-------|--------|
| {{kb_alias}} | {{kb_remote}} |
<!-- END ADAPT -->
<!-- IF module:linear -->

## Linear

- workspace: `{{linear_workspace}}`
- issue URL: `https://linear.app/{{linear_workspace}}/issue/<ID>`
- MCP tools accept `ABC-123` identifiers directly — no UUID lookup needed
- structure: team `{{linear_team}}` (key `{{linear_team_key}}`)<!-- ADAPT[linear-structure]: one Linear Project per KB entity? per-workspace conventions from Q5. Adjust or drop line. -->
<!-- END IF -->
