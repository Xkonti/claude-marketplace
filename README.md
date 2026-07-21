# claude-marketplace

Various Claude Code goodies Ben likes to use.

## Plugins

- **caveman** — `/caveman` skill to keep things concise, fast and readable
- **rules** — `/setup-rules` to initialize `.claude/rules/` with caveman-speak standards; `/rules-management` skill for ongoing rules authoring
- **quality-agents** — agents to ensure high quality code
- **research-agents** — agents to help with research
- **local-goals** — `/set-goal` skill to manage a `## Goals` section in `CLAUDE.local.md` for persistent session focus across agents/subagents
- **event-sourcing** — Event Modeling + Event Sourcing skills: plan systems with event models, design streams/aggregates/projections, apply ES patterns
- **frontend-skills** — LLM-safe design-system skills: `vue-design-system-setup` scaffolds a rigid token + base-component lockdown in a Vue 3 + Tailwind v4 project (copy-paste ESLint rules, tokens, primitives, verification); `llm-safe-design-system` is the judgment layer for maintaining, reviewing, evolving, and porting such a system to any framework
- **kb** — `/kb:setup` wizard for creating autonomously-AI-managed knowledge bases on any subject (recipes, home-lab, research, PM): interviews you, then generates a self-sufficient repo with rules (filing discipline, doc anatomy, current-state-only maintenance), inline markers, external-reference alias registry, and in-repo `garden` (maintenance sweep) + `new-<entity>` (scaffold) skills; the generated agent works dual-job — your task plus KB curation in parallel, delegating lookups to Haiku and filing to background Sonnet subagents; adopts existing loose-markdown repos too
- **factory** — Linear-driven dev workflow: `/factory:link` connects a repo to its Linear project via `CLAUDE.local.md`, `/factory:search` queries the linked project's issues/docs, `/factory:ticket` files a well-formed ticket (type template, tier label, code pointers, image upload) into the linked project, `/factory:work` picks up ai-ready tickets and ships them end-to-end (branch → tests → draft PR with review guide → Linear sync), single or batched across parallel git worktrees with tier-matched subagent models
