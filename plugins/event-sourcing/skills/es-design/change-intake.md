# Change Intake — routing implementation-language changes

Greenfield flow = model → design → code. Live systems get change requests in IMPLEMENTATION language: "add `vendorName` to GET /orders", "new admin screen", "endpoint slow", "provider changed webhook format". This file: route such requests to right layer — model, design, or code — w/o leaking implementation shapes into model, w/o silently bypassing collapse mapping (Projection Map, [design-docs.md](design-docs.md)).

Why a procedure: model's value in maintenance = same as greenfield — catching missing data paths, forcing business questions. Skipping it ("just add the column") → model rots into fiction; next design run trusts a lie.

## Step 1 — Locate

Map request to existing artifacts:

1. Endpoint/query mentioned → Projection Map row in `_design.md` → serving slices.
2. Screen/UI mentioned → model screens (`[screen:*]`) → owning slices.
3. Fact/stream/processor mentioned → element index (model-specs) → defining slice.
4. External provider/contract mentioned → translation/publishing slice ([integration.md](integration.md)).
5. Nothing matches → likely new behavior → Step 3, new-behavior path.

## Step 2 — Classify: the information test

Does change alter WHAT information exists, WHERE it comes from, or a BUSINESS rule?

- YES → **model-first path**. No exceptions — even when edit "obviously" lands in one projection.
- NO — only HOW data stored/served/shaped in transport (index, pagination, endpoint split — never MERGE, merging queries into one endpoint = composition, forbidden es-ops ui.md — caching, projection type swap, retry tuning) → **design-only path**.

Ambiguous → treat as model-first; the walk is cheap, either confirms or produces design-only verdict w/ evidence.

## Step 3 — Route

### Model-first path (data / rule changes)

1. Identify OWNING USE CASE: which view/flow needs this? "Frontend wants it on the resource" ≠ use case — find who displays/uses it + why. No identifiable use case → challenge request (open question to SME), do NOT model it.
2. Apply change to owning slice via model-specs ripple procedure (rm → fact → cmd → screen/source, whole chain, one session). Missing fact discovered → new use case → event-modeling Loop B for it. Gap-catcher working in maintenance mode — the point of routing through model.
3. Re-verify affected chapters (model-specs verification, quick pass minimum).
4. Design ripple: affected slice design blocks updated; Projection Map row gains/loses columns; replay needed → note in replay plan.
5. Code follows design.

### Design-only path (technical changes)

1. Edit design block(s) + `td-N` / `dq-N` as needed.
2. Projection Map kept consistent: endpoint renamed/split → map row updated SAME edit (merge = composition, forbidden).
3. Model untouched — except statuses where implementation state changed (per design-docs.md sync rules).

### New-behavior path

Request = new capability (new flow, automation, integration) → normal event-modeling Loop B on model, then D4 for new slices. Change intake just recognized it; no shortcut exists.

## Contamination guards

Rules keeping implementation shapes OUT of model:

1. Model read models stay use-case-shaped FOREVER. Three different things: a list/filter view serving a real information need = a use case, modeled (resource-STYLE fine); physical table sharing = Projection Map only; an entity-mirror read model w/ no stated question ("Order" because impl has an `orders` table) = forbidden, the contamination this guard exists for.
2. No model elements named after endpoints/tables/resources. Business language test applies: SME understands "vendor orders view", not "orders resource".
3. New screen recombining EXISTING data → lightweight model addition: screen + State View slice referencing existing facts, no new facts. Cheap, keeps model = ops map (es-ops cross-cutting principle: model currency).
4. Business-behavior question surfacing mid-intake → `q-N` in model ledger, never `dq-N`.

## Exit checklist

- [ ] Change classified w/ information test; classification noted in design doc
- [ ] Model-first: ripple complete (no half-chains), affected chapters re-verified
- [ ] Projection Map symmetric: every touched slice ↔ map row consistent
- [ ] Statuses + `updated` stamps current in touched files
- [ ] Code anchors updated if a slice/element was renamed/moved (drift gate stays green)
- [ ] Anything deferred → ledger entry, not memory
