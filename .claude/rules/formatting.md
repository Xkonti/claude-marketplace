## Formatting Rule

All skills, agents, plugin descriptions → caveman speak. Bodies AND frontmatter descriptions. No exceptions.

## Why

Every skill + agent description loads into orchestrating agent's context. Bloat → token waste, muddy routing signals. Tight caveman → cheap, clear, accurate triage.

## Description Field Rules

Description field = routing signal. Drives when orchestrating agent picks this skill/agent. Rules:

- **1-4 sentences max.** Long descriptions rot context budgets
- **Lead w/ what it does.** Not "Use this agent when…" — start w/ the capability
- **Trigger words matter.** Include keywords users naturally say. Scope contrast > exhaustive criteria
- **No `<example>` blocks stuffed in.** Auto-generated bloat from `/agents` wizard → strip it
- **No duplicated scope lists across siblings.** Contrast via keywords instead (one says "bounded, single-pass", sibling says "iterative, multi-round")
- **Encourage use when valuable.** Objective-review / quality agents → nudge w/ "highly recommended", "cheap insurance"

Bad: `"Use this agent when you need a thorough analysis of edge cases and error handling in code. Trigger this agent after implementing new features, refactoring existing code... <example>Context: ...</example><example>...</example>"`

Good: `"Independent edge-case + error-handling auditor. Fresh-eyes review → unhandled inputs, races, leaks, boundary bugs, silent failures. Deploy after any non-trivial impl or refactor for objective second opinion. Highly recommended — cheap insurance against subtle prod bugs."`

## Body Rules

- **Fragments OK.** Sentences not required
- **Drop articles (a/an/the), filler, pleasantries, hedging.** Shorter = better
- **Abbreviate common terms.** DB / auth / config / req / res / fn / impl / w/ / w/o
- **Arrows for causality.** `X → Y` beats "X leads to Y" or "X causes Y"
- **One word when one word enough.** "fix" not "implement a solution for". "big" not "extensive"
- **`##` headers, bullets, code blocks.** Scannable > dense prose
- **Technical terms exact.** Don't abbreviate wrong. Code blocks unchanged. Errors quoted exact

## Structure

- One concern per skill / agent / rule file. Split when file covers 2+ unrelated topics
- Step protocols = numbered `##` headers (`## Step 1 — Init`, `## Step 2 — Scope`)
- Frontmatter first, body caveman from first line. No "Introduction" / "About this file" preamble
- Code examples + path names unchanged — they're technical, not prose

## Cost Awareness

Heavy agents (multi-round, long-running, expensive) → state so explicitly in description. "Lengthy", "iterative", "exhaustive" signal cost. Light agents → state "bounded", "single-pass", "focused". Orchestrating agent picks correctly → no over-deployment.

## When In Doubt

Pull `caveman` skill for full style spec. Or read `responses.md` in same dir.
