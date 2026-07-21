---
name: setup
description: >
  Set up autonomously-AI-managed knowledge base on any subject (recipes, home-lab, research,
  PM, worldbuilding) — wizard interviews, then generates self-sufficient repo: filing rules,
  doc anatomy, current-state maintenance, inline markers, alias registry, in-repo garden +
  scaffold skills. Adopts existing loose-markdown repos too. Use when user wants new KB,
  "AI-managed notes", or to convert notes repo into managed KB.
argument-hint: "[target-dir]"
disable-model-invocation: true
---

Wizard: interview → plan → instantiate templates → verify → commit. Generated KB = self-sufficient (own rules + skills), this plugin not needed afterward.

## Reference Files — read in order

1. [interview.md](interview.md) — mode detect + Q1-Q6 flow. START HERE.
2. [instantiate.md](instantiate.md) — template markers, slot glossary, assembly table, verification. Read BEFORE generating anything.
3. [adopt.md](adopt.md) — only when Step 0 detects existing loose-markdown content.
4. `modules/` — templates. Read each only at instantiation time, per assembly table.

## Hard Rules

1. Templates = law. Copy verbatim, touch only marked slots, delete markers. NEVER write generated files from memory ([instantiate.md](instantiate.md) hard rule).
2. Derive-then-confirm. One open question total (Q1). Everything else recommended-option-first.
3. Verification battery ([instantiate.md](instantiate.md)) ALL green before reporting done. Leftover `{{` or ADAPT/IF marker in target = failure.
4. Manifest always written — future adopt/upgrade anchor.
5. `$ARGUMENTS` names target dir → use, skip cwd detection.

## Flow

1. Mode detect (interview.md Step 0): manifest → upgrade-unsupported notice; loose content → adopt.md; else fresh.
2. Interview Q1-Q6.
3. Instantiate per assembly table: core + style always, chosen modules, manifest last.
4. Verify (6 checks) → fix reds.
5. Git init + `KB scaffold (kb plugin v<version>)` commit (unless declined).
6. Report: file list, chosen modules, how to use (dump → AI files; `/garden` monthly; `/new-<entity>`), paths.local.md recreation note for other machines.
