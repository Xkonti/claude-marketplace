# Linear Module

No standalone template files — Linear lives as `<!-- IF module:linear -->` blocks inside other templates. This file = activation map + params.

## Activates

| Template | Block |
|---|---|
| core/docs.template.md | `linear:` frontmatter field line (`[linear]` tag in anatomy skeleton) |
| references/references.template.md | `[[linear:ABC-123]]` link form + resolution step 4 |
| references/refs.template.md | `## Linear` section (workspace, URL scheme, team) |
| scaffold/scaffold-skill.template.md | Linear project gather step |

## Params (Q5 when module chosen)

- `{{linear_workspace}}` — workspace slug (from URL: `linear.app/<slug>/...`)
- `{{linear_team}}` + `{{linear_team_key}}` — team name + key (e.g. `XKO`)

## Requires

- references module (linear blocks live in its files) — wizard enforces: linear w/o references → auto-include references.
- Linear MCP server configured in target env — absent → warn, generate anyway (links still resolve via URL fallback).

## Out of Scope v1

Tickets desk (create/triage/sync skill) = subject-specific, heavy — NOT generated. User wanting it → point at factory plugin / exemplar tickets skill as starting material.
