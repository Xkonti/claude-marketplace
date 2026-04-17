---
paths:
  - 'plugins/**'
  - '.claude-plugin/**'
  - 'README.md'
---

## Marketplace Structure

Repo = Claude Code plugin marketplace. Each plugin = folder under `plugins/`. Top-level manifest lists them all.

Full docs: https://code.claude.com/docs/en/plugins.md

## File Map

```
claude-marketplace/
├── .claude-plugin/
│   └── marketplace.json          ← lists ALL plugins (name + source + description)
├── README.md                     ← human-readable plugin list (mirrors marketplace.json)
└── plugins/
    └── <plugin-name>/
        ├── .claude-plugin/
        │   └── plugin.json       ← plugin metadata. ONLY file allowed here
        ├── skills/               ← optional. Skills (model-invocable or user-invocable)
        │   └── <skill-name>/
        │       └── SKILL.md
        ├── agents/               ← optional. Subagents dispatched via Task tool
        │   └── <agent-name>.md
        ├── commands/             ← optional. Legacy flat-file skills. Prefer skills/ for new
        │   └── <cmd>.md
        ├── hooks/                ← optional. Event handlers
        │   └── hooks.json
        ├── monitors/             ← optional. Background watchers
        │   └── monitors.json
        ├── bin/                  ← optional. Executables added to Bash PATH when enabled
        ├── .mcp.json             ← optional. MCP server configs
        ├── .lsp.json             ← optional. LSP server configs (code intelligence)
        └── settings.json         ← optional. Default settings (only `agent` + `subagentStatusLine`)
```

## Critical Rule

**ONLY `plugin.json` lives in `.claude-plugin/`.** All other dirs (`skills/`, `agents/`, `commands/`, `hooks/`, `monitors/`, `bin/`) + config files (`.mcp.json`, `.lsp.json`, `settings.json`) live at **plugin root**, NOT inside `.claude-plugin/`. Common mistake → plugin silently broken.

## Sync Requirements

Adding new plugin → update ALL of:

1. `plugins/<name>/.claude-plugin/plugin.json` — create w/ name/description/version
2. `.claude-plugin/marketplace.json` — add entry to `plugins` array
3. `README.md` — add bullet under `## Plugins`

Forgetting any one → plugin invisible / broken routing.

## plugin.json Shape

```json
{
  "name": "plugin-name",
  "description": "One-sentence caveman description",
  "version": "1.0.0",
  "author": { "name": "Optional Author" }
}
```

`name` = skill namespace. Skills auto-prefixed: `/<plugin-name>:<skill-name>`.

## marketplace.json Entry Shape

```json
{
  "name": "plugin-name",
  "source": "./plugins/plugin-name",
  "description": "One-sentence description — may differ from plugin.json"
}
```

## Component Cheat Sheet

| Component | Location | File(s) | Purpose |
| --- | --- | --- | --- |
| **Skills** | `skills/<name>/` | `SKILL.md` | User/model-invocable commands. Frontmatter: `name`, `description`, `argument-hint`, `allowed-tools`, `disable-model-invocation` |
| **Agents** | `agents/` | `<name>.md` | Subagents dispatched via Task tool. Frontmatter: `name`, `description`, `model`, `color` |
| **Commands** | `commands/` | `<cmd>.md` | Legacy flat-file skills. Prefer `skills/` for new work |
| **Hooks** | `hooks/` | `hooks.json` | Event handlers (`PreToolUse`, `PostToolUse`, etc.). Same format as `.claude/settings.json` hooks |
| **MCP servers** | plugin root | `.mcp.json` | External tool integrations |
| **LSP servers** | plugin root | `.lsp.json` | Language servers for code intelligence |
| **Monitors** | `monitors/` | `monitors.json` | Background watchers — stdout lines → Claude notifications |
| **Binaries** | `bin/` | executables | Added to Bash `PATH` while plugin enabled |
| **Settings** | plugin root | `settings.json` | Defaults when plugin enabled. Only `agent` + `subagentStatusLine` supported |

## Naming

- Plugin name = kebab-case, matches folder name
- Skill dir name = kebab-case, matches `name:` frontmatter
- Agent file name = kebab-case w/ `.md`, matches `name:` frontmatter
- Plugin / skill / agent names must be unique across marketplace
- Skills auto-namespaced → `/plugin-name:skill-name` (prevents collisions)

## Testing + Reload

- Dev: `claude --plugin-dir ./plugins/<name>` — loads plugin w/o install
- After edits: `/reload-plugins` — picks up changes w/o restart
- Multiple at once: repeat `--plugin-dir` flag
