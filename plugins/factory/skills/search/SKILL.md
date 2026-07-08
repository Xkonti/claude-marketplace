---
name: search
description: >
  Query the linked Linear project from inside repo. Natural language → scoped MCP queries:
  issues by state/label/text, documents, comments. No args → actionable overview (ai-ready
  by tier, untriaged count, in-progress, recent). Reads link from `CLAUDE.local.md`
  `## Linear`. Use when user asks "what Linear issues…", "show ai-ready tickets", "search
  tickets/docs for…", "project status", or invokes `/factory:search`.
argument-hint: "[natural language query | empty → overview]"
allowed-tools: Read, mcp__linear-server__list_issues, mcp__linear-server__get_issue, mcp__linear-server__list_comments, mcp__linear-server__list_documents, mcp__linear-server__get_document, mcp__linear-server__list_issue_labels, mcp__linear-server__list_issue_statuses, mcp__linear-server__list_projects
---

# Search Linked Linear Project

Query scoped to THIS repo's project. Never whole workspace. READ-ONLY — never mutate Linear from here.

## Step 0 — Link Info

`## Linear` section auto-loads via `CLAUDE.local.md` → grab fields from context first. Not in context → Read `CLAUDE.local.md`. Missing entirely → tell user: run `/factory:link`. Stop. Format doubts → read [../link/linear-section.md](../link/linear-section.md).

## Step 1 — Parse Query Intent

From `$ARGUMENTS`. Empty → Step 2 overview. Otherwise map:

| Query mentions | MCP call |
|----------------|----------|
| state words (todo, in progress, done, backlog) | `list_issues` project + state |
| tier/label words (ai-ready, haiku, sonnet, opus, fable, untriaged, bug) | `list_issues` project + label |
| free text terms | `list_issues` project + query |
| doc / document / spec | `list_documents` project → `get_document` on match |
| `ABC-123` style ID | `get_issue` + `list_comments` |

Multiple facets → combine filters. Ambiguous → one short clarifying question, not a guess.

## Step 2 — Overview (no args)

Fetch open issues scoped to project ONCE. Derive:

- ai-ready count split by `ai:` tier
- untriaged = open issues w/ no `ai-ready`/`ai:*` label — compute by subtraction, no such filter exists
- in-progress list
- 5 most recently updated

## Step 3 — Output

Compact markdown tables: `ID | Title | State | Tier | Updated`. Titles trunc ~60 chars. Cap 20 rows → note "N more, narrow query". Docs: `Title | Updated`. End w/ actionable hint when ai-ready rows present: "`/factory:work ABC-123` to pick up".

## Notes

- Zero results → say so + suggest looser terms.
- MCP unavailable → same preflight message as link skill.
- Cross-project asks → this skill scoped to linked project; other repos link their own.
