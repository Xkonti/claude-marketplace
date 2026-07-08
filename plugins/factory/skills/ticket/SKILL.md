---
name: ticket
description: >
  Create well-formed ticket in the linked Linear project from inside a code repo. Gathers
  requirements from conversation, does light codebase investigation for code pointers
  (skip w/ "quick"), applies type template + ai: tier label per rubric, uploads pasted
  images as attachments. Use only when user invokes `/factory:ticket` — creates Linear
  issues, never auto-invoke.
argument-hint: "[quick] [ticket idea | empty → ask]"
disable-model-invocation: true
allowed-tools: Read, Grep, Glob, Bash(stat:*), Bash(file:*), Bash(curl:*), mcp__linear-server__list_issues, mcp__linear-server__get_issue, mcp__linear-server__list_issue_labels, mcp__linear-server__save_issue, mcp__linear-server__prepare_attachment_upload, mcp__linear-server__create_attachment_from_upload
---

# Ticket — File Well-Formed Issue From Repo

Creates ONE ticket in the LINKED project, w/ code context. Cross-project ops (routing, merge, bulk triage) = job for a knowledge-base-side ticket desk skill, if you have one — this skill = linked project only.

## Step 0 — Link Info

`## Linear` section auto-loads via `CLAUDE.local.md` → grab fields from context first. Not in context → Read `CLAUDE.local.md`. Missing entirely → tell user: run `/factory:link`. Stop. Format doubts → read [../link/linear-section.md](../link/linear-section.md).

## Step 1 — Gather

Requirements from `$ARGUMENTS` + conversation. Missing essentials (what / why / done-when) → one AskUserQuestion. `quick` in args → skip Step 3.

## Step 2 — Dedupe Check

`list_issues` project + query on 2-3 key terms. Similar open issue found → show it, ask: extend existing vs create new anyway.

## Step 3 — Investigate (default; skipped by `quick`)

LIGHT pass. Grep/Glob relevant files, entry points, repro path. Budget: ≤5 files read. NEVER fix, NEVER design the solution. Output = code pointers for Notes section: `path/file.ts — one-liner why relevant`. Suspected cause OK marked "suspicion:" — never asserted as fact.

## Step 4 — Type + Template

Pick ONE `type` label + matching template per [templates.md](templates.md). Larger effort → parent issue + sub-issues per templates.md parent section — each child = full-quality ticket, `save_issue` w/ `parentId`.

## Step 5 — Tier + Readiness

`ai:` tier per [../work/rubric.md](../work/rubric.md) — writer has full context, estimate free here, expensive later. `ai-ready` ONLY if spec complete + unblocked. `idea` type → NEVER ai-ready. Unsure tier → higher.

## Step 6 — Create

`save_issue`: team, project (ID preferred), title (imperative, ≤70 chars, no type prefix), description = filled template, labels `[<type>, ai:<tier>, ai-ready?]`. Doubt labels exist → `list_issue_labels` first; type group missing → tell user to set up labels, apply what exists.

## Step 7 — Images (only if user provided)

Follow [images.md](images.md). One file fully done before next.

## Step 8 — Report

`ABC-123` + URL, labels applied, investigation summary (files pointed at), hint: "`/factory:work ABC-123` when ready to implement".

## Notes

- Description first, images appended after upload — attachment needs existing issue.
- MCP unavailable → same preflight message as link skill.
- Never set status — new tickets stay in default state; readiness = `ai-ready` label.
