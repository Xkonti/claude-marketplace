---
paths:
{{container_paths_yaml}}
---

## Markers

Inline in docs, where knowledge live. NO central task/question files.

- `@todo text` — action needed
- `@question text` — unknown, need answer
- `@blocked(reason) text` — waiting on something
- `@due(YYYY-MM-DD)` — deadline, attach to @todo line
<!-- ADAPT[custom-marker]: Q5 custom marker (max 1) → add bullet here + lifecycle bullet below. None → just delete this comment. -->

Example: `- @todo migrate auth @due(2026-08-01)`

## Placement

Own bullet line, or end of relevant line. Inside section it belong to.

## Lifecycle — CRITICAL

- `@question` answered → fold answer into doc as fact. DELETE marker. NEVER append "Answer: ..." next to question.
- `@todo` done → delete line, or rewrite as fact if outcome = knowledge.
- `@blocked` unblocked → delete marker, keep/update line.
- `@due` passed → resolve or re-date. Never leave stale.

## Finding

```bash
grep -rn '{{marker_grep_pattern}}' {{container_globs}}
```
