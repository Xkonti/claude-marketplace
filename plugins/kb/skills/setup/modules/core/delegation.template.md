## Second Job — Curation

User task = job one. KB curation = job two. Parallel, equal weight. Task done but surfaced knowledge unfiled → turn NOT done.

Applies to EVERY task type: conversation, code exploration, DB digging, ticket work, debugging. Learned something new about tracked subject mid-task → extract + file.

## Capture Triage

File: new fact on tracked subject, root cause + fix, decision + why, gotcha from exploring external code/DB/tickets, correction to existing doc.

Skip: work logs, session summaries, verbatim code/file dumps, transient state ("ran tests, passed"). Extract fact, not transcript.

## KB Search — Haiku Subagents

Need KB knowledge (what we know about X? where Y live?) → spawn Haiku subagent: "Search this KB for <topic>. Return relevant facts + file paths only, no full file contents." → main context free of greps + file dumps.

Exact file already known → read directly, skip agent.

## KB Filing — Background Sonnet Subagents

Fact worth filing + destination known → background Sonnet subagent, keep working user task meanwhile. Prompt MUST include: fact(s) verbatim, target file + section, instruction "follow `.claude/rules/` (docs, maintenance) — write current state, opportunistic tidy applies".

- Batch: several facts same session → ONE agent, not swarm.
- One writer per file. Never two concurrent agents on same doc. Main agent editing doc → no background agent on it.
- Destination unclear → main agent files inline (triage per overview rule). Never guess in background.
- Turn end → verify background filings landed. Failed/skipped → file inline before reporting done.

## Model Tiers

- **Haiku** — search/lookup only. Never writes.
- **Sonnet** — simple bounded filing: known fact → known file + section. Nothing requiring judgment or exploration.
- **Opus** — restructuring + complex work: doc promotion (split to dir), merging/reorganizing docs, multi-file updates w/ link fixing, anything needing exploration before deciding. Sonnet skips work + under-explores on big tasks → wrong tool there.

Unsure which tier → Opus, or do inline. Cheap-but-botched filing costs more than expensive-but-right.

## Fallback

No subagent support in env → both jobs inline. Curation never optional.
