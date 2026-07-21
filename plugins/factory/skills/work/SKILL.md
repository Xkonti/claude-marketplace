---
name: work
description: >
  Pick up + implement Linear issue(s) end-to-end: fetch spec + comments, optional plan,
  implement + test, commit on gitBranchName branch, draft PR w/ review guide, sync Linear
  status + PR link. Single issue or batch — batch orchestrates parallel subagents in git
  worktrees, model matched to ai: tier label. Use only when user invokes `/factory:work` —
  creates branches + PRs, never auto-invoke.
argument-hint: "[ABC-123 [ABC-124 …] | N | all | empty → pick from ai-ready]"
disable-model-invocation: true
allowed-tools: Read, mcp__linear-server__get_issue, mcp__linear-server__list_issues, mcp__linear-server__list_comments, mcp__linear-server__list_issue_labels, mcp__linear-server__list_issue_statuses, mcp__linear-server__save_issue, mcp__linear-server__save_comment
---

# Work — Pick Up + Ship Linear Issues

Single = this agent may implement. Batch = this agent ONLY orchestrates ([batch.md](batch.md)) — never implements.

## Step 0 — Link Info

`## Linear` section auto-loads via `CLAUDE.local.md` → grab fields from context first. Not in context → Read `CLAUDE.local.md`. Missing entirely → tell user: run `/factory:link`. Stop. Format doubts → read [../link/linear-section.md](../link/linear-section.md).

## Step 1 — Mode

From `$ARGUMENTS`:

- One issue ID → single mode
- ≥2 IDs, number N, or "all" → batch mode. Candidates = `list_issues` project + `ai-ready`, minus any `ai-no`. Always minus `ai-no`.
- Empty → fetch ai-ready list → AskUserQuestion pick one → single mode

## Step 2 — Options

One AskUserQuestion, skip anything args already gave. Defaults:

| option | default |
|--------|---------|
| plan phase | haiku/sonnet tier → no; opus/fable → yes |
| model | `ai:` tier label (haiku→haiku, sonnet→sonnet, opus→opus, fable→fable). User override wins |
| PR | yes, always `--draft` |
| execution | single → main agent; batch → subagents always (not asked) |

## Step 3 — Preflight Per Issue

`get_issue` + `list_comments`. Gates:

- `ai-no` → NEVER touch. Skip, tell user why. No exceptions.
- No `ai:` tier label = untriaged → estimate per [rubric.md](rubric.md), `save_issue` apply label, proceed.
- Spec vague/incomplete → rubric tie-breaker: post clarifying-questions comment, do NOT start, report to user.
- Already In Progress or has linked PR → confirm w/ user before touching.

## Step 4 — Single-Issue Flow

1. `save_issue` status → In Progress
2. Sync default branch (fetch + pull) → `git checkout -b <gitBranchName>` — field from issue JSON, NEVER invent branch names
3. Plan enabled → short plan, post as Linear comment (record survives session)
4. Implement + run project tests/lint. Failing tests ≠ done.
5. Commit(s) on branch → `git push -u`
6. `gh pr create --draft` — title `ABC-123: <issue title>`, body EXACTLY per [pr-template.md](pr-template.md)
7. `save_comment` on issue: PR URL + one-line summary
8. Status → In Review. GitHub integration may auto-transition — set explicitly anyway, idempotent.
9. Report: branch, PR URL, test evidence.

## Step 5 — Batch

Read [batch.md](batch.md), follow exactly. Hard rules:

- Orchestrator NEVER implements.
- `ai:fable` issues pulled OUT of batch → main agent handles sequentially after batch dispatch. Never fire-and-forget.
- Subagents never touch Linear — orchestrator single writer.

## Step 6 — Failure Protocol

Any issue fails (self or subagent):

1. `save_comment` w/ findings: what tried, what blocked, partial-work branch if pushed
2. Status back → Todo
3. Report in final summary

NEVER leave issue stuck In Progress silently.

## Notes

- Issue ID in branch + PR title = auto-link via GitHub integration; `Fixes ABC-123` in body = auto-close on merge.
- Draft PRs for human review — never merge.
- Tier meanings + tie-breakers: [rubric.md](rubric.md).
