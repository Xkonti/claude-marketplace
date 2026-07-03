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
