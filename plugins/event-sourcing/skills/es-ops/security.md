# Security — authorization in event-sourced systems

Scope: modeling + enforcement architecture. Not a crypto/OAuth tutorial — provider products handle protocol; this file = where security meets facts, commands, models.

## Business roles vs technical roles

- **Business role** = actor in the domain: Clerk, Admin, Customer. Lives in the event model as actor lanes/flows — business experts discuss these.
- **Technical role** = permission grain enforcing access: ROLE_ADMIN, "adult". Implementation detail; many-to-many w/ business roles.

Modeling rule `[opinion — surprises developers, holds up well]`: actor lanes YES, technical roles NO. Why: required role for an action changes w/o the business flow changing — model polluted w/ permission details rots on every policy tweak; flows stay stable. Permission↔slice mapping lives in design docs / code, not the model (es-design bindings).

## Modeling login — usually not a fact

"Do we need a User Logged In fact?" Test: does any business process DEPEND on login having happened — read model tracking login counts, flow triggered by it? Yes → it's a fact, model it. No (vast majority) → login = technical precondition, not state change.

Representation w/o fact: login screen + special read model "Logged-in User" — connected to NO stream, signals "from here, current user is available". Honest information-flow modeling: data exists, source is infrastructure not facts. Auth provider's own flow (redirects, tokens) worth sketching → separate technical model, outside the business event model.

Completeness check integration: command needing actor data (clerk id) sources it from the logged-in-user read model — red arrow resolved w/o inventing login facts. Example data shows username → clerkId mapping.

## Enforcement architecture

**Where**: command + query handling = the chokepoints. Every state change passes a command handler, every read a query handler (CQRS dividend: complete enforcement = decorating two surfaces). API-edge checks additionally = defense in depth, architectural choice.

**How** — metadata-carried auth context:
1. Authentication (external provider typical) yields identity + roles at the edge.
2. Roles/identity attached to command/query as METADATA (metadata.md providers) — domain types stay auth-free.
3. Handler declares requirement (annotation/registration: "blocking customers needs admin").
4. Interceptor/decorator at dispatch compares declared requirement vs metadata authorities → mismatch = rejection before handler runs.

Why metadata-carried beats alternatives:
- vs auth-in-payload: contracts stay clean; auth concerns don't version w/ business schema.
- vs handler-internal checks: declarative requirement = greppable permission inventory + uniform enforcement; hand-written ifs drift.
- Domain logic stays testable w/o auth mocking — THE practical payoff (below).

**Facts record the actor**: authorization decides BEFORE the fact; the fact then carries who acted (metadata user id). Audit falls out free. Don't store role-at-time in payload unless business rules read it.

## Testing

Auth context = just metadata → write-side GWT tests extend naturally: same given-facts/when-command/then-facts fixture, command carrying authorities metadata. Positive (role present → facts) + negative (role absent → access-denied rejection) per secured slice. No identity-provider mocking, no infrastructure — metadata map on the test message.

Negative tests non-optional `[opinion]`: permission regressions = silent until exploited; one denied-case test per secured handler = cheap insurance.

## Ops notes

- Role changes (policy tweaks) = code/config redeploys, not model changes — by design (modeling rule above).
- Permission inventory = grep declared requirements across handlers → feed compliance audits.
- Identity provider swap (Keycloak → other) touches edge integration only — metadata contract ("authorities" entries) insulates everything downstream. Same ACL logic as es-design integrations: the provider is an external system; treat its data accordingly.
