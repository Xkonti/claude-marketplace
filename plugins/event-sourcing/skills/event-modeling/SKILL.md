---
name: event-modeling
description: >
  Run Event Modeling end-to-end as AI agent — solo-autonomous or guiding one human SME.
  Business facts on timeline, 4 patterns (State Change, State View, Automation, Translation),
  GWT specs, information completeness check, vertical slices. Use when planning new
  system/feature, documenting existing system, modeling use cases, refining requirements,
  untangling complex process discussions.
---

Event Modeling = visual planning method by Adam Dymitruk. Describes system as story of **business facts** on single timeline, left → right. Output: complete behavioral spec — implementable slice by slice, zero interpretation needed. Works for ANY system — event-driven architecture NOT required.

This skill = agent-adapted version. No whiteboard, no sticky notes, no workshop crowd. Model lives in markdown artifact ([notation.md](notation.md)). Two operating modes. Always exactly one AI (you) + at most one human.

## Terminology

Core unit = **business fact**. Never bare "event" in prose or model artifacts.
- business → process + rules, not tech
- fact → set in stone, purely informative, never transient

Composites: business fact stream, external fact. Proper nouns (Event Modeling) + cited API names stay exact.

## Reference Files — read on demand

| File | When to read |
|---|---|
| [notation.md](notation.md) | BEFORE writing any model artifact — format spec + worked example |
| [phases.md](phases.md) | Running the process — per-phase procedure, mode behavior, exit gates |
| [patterns.md](patterns.md) | Building slices — element + pattern reference, GWT rules |
| [quality.md](quality.md) | Verifying — completeness check, signals, anti-patterns, done-criteria |

Minimum: read notation.md + phases.md before starting any modeling work.

Model bigger than tiny (>~3 chapters / ~12 slices) → also pull **model-specs skill**: chapter-per-file layout, element index, update procedures, mechanical verification.

## Mode Selection

Ask user once at start (skip if obvious from request):
- **Autonomous** — human absent. You mine requirements/docs/code, model end-to-end, output model + decision log + open questions.
- **Oversight** — human = SME (domain expert, NOT modeler). You = facilitator + modeler: lead, ask, challenge, propose, decide modeling form yourself.

### Autonomous mode rules

1. Source priority: explicit requirements > existing code/API specs > project docs > general knowledge. General knowledge OK for trivia (id types, formats). Domain rules + business policies NEVER inferred — no source → open question.
2. Don't halt at first unknown. Model everything modelable, mark gaps, batch ALL blocking questions, present once at stop point.
3. Blocking question = correct modeling impossible without answer (business rule, data ownership, process order). Non-blocking = provisional decision OK → record in decision log w/ rationale + revisit marker.
4. Every provisional decision visible in artifact. Silent assumption = failure mode this skill exists to kill.

### Oversight mode rules

1. You lead. Human answers domain questions — never ask them "how should I model this". You decide modeling form, explain in one line why.
2. One topic per turn. ≤3 questions per message. Concrete > abstract: use example data in questions ("customer adds item priced 5€ — what should total show?").
3. After each slice: show model increment + read story back. Confirm before next.
4. Actively challenge: point out oversights, missing data paths, contradictions, vague terms. Suggest better alternative w/ one-line rationale when SME's framing leaks tech or skips gaps.
5. Park what stalls: unresolved after 2 attempts → open questions ledger, move on.
6. Human fatigue real: long process → offer checkpoint summaries, propose session breaks at chapter boundaries. Model artifact = resumable state.

## Process Map

Three loops, detail in [phases.md](phases.md):

- **Loop A — Bootstrap** (once per model context): P0 setup/scope → P1 fact harvest → P2 plot (timeline + story readback gate)
- **Loop B — Detail** (per use case, repeat): P3 storyboard → P4 inputs (commands) → P5 outputs (read models) → P6 integrations → P7 GWT scenarios → P8 slice + organize
- **Loop C — Verify** (session end + final): P9 completeness check + ambiguity audit + handoff

## Hard Rules — always on

1. Business facts in past tense, business language. "Item Added", never "AddItem" / "insert row".
2. Information completeness check: every attribute on every element traces to source. Untraceable attribute → red flag, never silently invent. Procedure in [quality.md](quality.md).
3. Model information flow, not implementation. DB/REST/Kafka/framework talk → redirect to data. Implementation lives in sibling skills.
4. One timeline per flow. No branches, no loops, no conditions in model. Alternative path → separate flow.
5. Use-case-specific read models. Model shaped by use case, never general-purpose "entity" model.
6. Rules enforced on write, not read. Validation lives at command. Stored facts trusted downstream — re-checking on read = redundant.
7. Concrete examples everywhere. Example data in wireframes, scenarios, read models. More examples → fewer assumptions.
8. Work backwards: screen → what data? → which read model? → which facts? → which command? → which screen/system provides it? Focuses on solution, surfaces gaps.

## Scope

This skill: modeling process only, 1 human max. NOT here: group workshop facilitation, org rollout, implementation (→ es-design, es-patterns), persistence mechanics (→ es-fundamentals).
