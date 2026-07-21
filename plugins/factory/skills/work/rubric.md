# AI Tier Rubric

Estimate at ticket triage. One `ai:` label per issue — mutually exclusive group.

## Tiers

- **ai:haiku** — mechanical change. Tight scope, crystal-clear spec, 1-few files, established pattern to copy. Rename, config tweak, add field to existing form.
- **ai:sonnet** — standard feature/bugfix. Multi-file OK, known patterns, low ambiguity. Bulk of normal tickets.
- **ai:opus** — cross-cutting refactor, gnarly debugging, design judgment needed. Touches architecture w/o redefining it.
- **ai:fable** — architecture work, high ambiguity, security-sensitive, multi-repo. Needs real reasoning + oversight.

## Tie-Breakers

- Unsure between two tiers → pick HIGHER. Failed cheap attempt cost more than tier bump.
- Spec vague → not a tier problem, a ticket problem. Fix ticket first (comment questions). No `ai-ready` until spec complete.
- Security-sensitive → `ai:opus` minimum, default `ai:fable`.
- Touches >1 repo → `ai:fable`.

## Other Labels

- `ai-ready` — spec complete + unblocked + AI may pick up. Separate decision from tier.
- `ai-no` — human-only. NEVER work these, never relabel.
- No ai labels at all = untriaged → estimate tier w/ this rubric, apply label, proceed.
