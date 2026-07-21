# Batch Orchestration

Main agent = orchestrator ONLY. Never implements. Every issue → own subagent, own worktree, own branch, own PR.

## Conflict Scan

Before spawning: per issue, infer touched areas from title/description/labels. Overlap suspected → serialize those issues (second starts after first's PR is up) or ask user. Unsure → parallel, note risk in final summary.

## Isolation

- Preferred: Agent tool `isolation: 'worktree'` when available.
- Fallback explicit: `git fetch` then `git worktree add ../<repo-dir>-abc-123 -b <gitBranchName> origin/<default-branch>`.
- Branch name = issue's `gitBranchName` field. Never invent.

## Concurrency

Max 3 parallel subagents (rate limits + review overload). More issues → waves.

## Lifecycle (orchestrator owns ALL Linear mutations)

1. `save_issue` status → In Progress
2. Spawn subagent w/ `model:` from tier label (ai:haiku → haiku, ai:sonnet → sonnet, ai:opus → opus)
3. Success → `save_comment` PR URL on issue, status → In Review
4. Failure → failure protocol (SKILL.md Step 6)

Subagent NEVER touches Linear — may lack MCP access; orchestrator = single writer.

`ai:fable` issues: pulled OUT of batch. Main agent implements sequentially after batch dispatch — never fire-and-forget.

## Subagent Prompt Template

Fill CAPS placeholders. Paste FULL issue content — subagent has no MCP, no plugin files. Inline the PR body template from [pr-template.md](pr-template.md) into the prompt.

```
Implement Linear issue ISSUE_ID in worktree WORKTREE_PATH on branch BRANCH_NAME.

## Issue
Title: ISSUE_TITLE
Description:
ISSUE_DESCRIPTION
Relevant comments:
ISSUE_COMMENTS

## Steps
1. Work ONLY in WORKTREE_PATH. Implement per spec above.
2. Test: run TEST_COMMAND (discover via package.json/Makefile/etc. if unknown). Failing tests = not done.
3. Commit on BRANCH_NAME. Clear message referencing ISSUE_ID.
4. Push: git push -u origin BRANCH_NAME
5. Create DRAFT PR: gh pr create --draft --title "ISSUE_ID: ISSUE_TITLE" --body per template below. Body MUST contain "Fixes ISSUE_ID" + full Review Guide.

PR_BODY_TEMPLATE

## Rules
- Do NOT touch Linear. Do NOT merge PR. Do NOT push broken code.
- Blocked/failed → do not push, describe blockers precisely in final message.
- Last line of final message = PR URL (success) or FAILED: <one-line reason>.
```

## Cleanup

- Success: `git worktree remove <path>` (branch safe on remote) → `git worktree prune`.
- Failure w/ partial work pushed: keep worktree, report path.

## Final Summary

Table: `Issue | Tier | Branch | PR | Result`. Include skipped issues + why (ai-no, conflict-serialized, vague spec).
