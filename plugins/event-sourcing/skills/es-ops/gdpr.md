# GDPR + Sensitive Data

Tension: facts immutable ("never alter the past") vs right-to-be-forgotten ("alter the past on request"). Resolvable — but note first: NOT an ES-specific problem. CRUD systems hold immutable PII too (logs, backups, exports, spreadsheets); GDPR covers all of it. ES just makes the question explicit instead of latent. Not legal advice; technical approaches only — legal scope w/ counsel.

PII surprises devs: names/emails/addresses obviously; ALSO ip addresses, birth dates, device fingerprints, session-linkable ids. Metadata commonly carries these → metadata.md fields = in scope too. Stream ids built from natural keys (email-as-stream-id, es-patterns reservation) = PII in an UNDELETABLE position — flag at design time.

## Defense 1 — Data Minimalism (before any cryptography)

Easiest PII to handle = PII never stored. "Store everything, someone might need it" = not GDPR-compliant + operationally toxic: every copy is a liability w/ a deletion obligation attached.

Design moves:
1. **Don't collect what the process doesn't need.** Digital product order needing no address → don't capture one. Collection point = first audit point.
2. **Fine-grained facts beat consolidated fat facts.** PII captured where it enters ("Checkout Completed" holds address), downstream facts REFERENCE ("Order Submitted" holds order id + reference, not a copy). One PII location = one deletion point; copies scattered through a process = deletion archaeology.
3. **Model = PII map.** Completeness check forces every attribute's source + usage into the open → grep model + element index (model-specs) for PII attributes = which facts, read models, external contracts touch them. THE map for access requests ("what do you hold on me?") + deletion scope. Keep current or fly blind.
4. **External facts double-checked**: published PII = PII in OTHER systems' stores — your deletion obligation just crossed a team boundary. Generous-payload rule (es-design) gets a counterweight here: generous w/ business data, stingy w/ PII `[opinion — the two rules genuinely tension; resolve per attribute]`.

Minimalism shrinks the problem; rarely erases it (insurers, banks, medical = PII-core businesses). Two technical approaches for the rest:

## Defense 2 — Crypto Shredding

**Shape.** Per data subject (customer), one encryption key. PII fields encrypted at serialization w/ subject's key, decrypted transparently at load. Deletion request → destroy the key → ciphertext permanently unreadable = effective erasure. Facts untouched: history intact, sequence intact, non-PII attributes readable forever.

**Mechanics.** Mark PII fields (annotation/registration) + mark key-selector attribute (customer id) → serializer encrypts/decrypts those fields w/ the subject's key, auto-creating keys for new subjects. After shredding, decryption yields placeholder ("deleted") — consumers need a defined behavior for that value, design it in.

**When.** PII must live inside facts (process genuinely needs it there); fact structure/sequence must survive deletion; key infrastructure feasible.

**Trade-offs.**
- Key management = the real cost: thousands of subject keys, secured (keys = the crown jewels now), backed up (lost key = accidental shredding of a LIVING customer), audited, automated. Managed KMS/vault preferred over hand-rolled `[opinion]`.
- Crypto on serialization path = per-load cost + serializer complexity.
- Backups of the KEY store = deletion loophole (restored key un-shreds) → key-store backup policy must align w/ deletion guarantees. Subtle, commonly missed.

## Defense 3 — Forgettable Payload

**Shape.** PII never enters facts: separate store (table) holds it, facts carry a reference id. Load-time enrichment joins it back when needed. Deletion = delete the row, replace w/ system-meaningful defaults; facts never knew the data.

**When.** Crypto infrastructure unfeasible; PII access patterns fit lookup-on-demand; team prefers plain-DB operations over key ceremonies.

**Trade-offs.**
- Second store: consistency between fact append + PII write (same-transaction when one DB — or the dual-write discussion returns, es-design integration.md), backup/restore alignment, one more thing replays must NOT rebuild (it's source data, not projection).
- Fact no longer self-contained: replay/debugging shows references, not values; enrichment dependency on reads.
- The PII table itself = classic CRUD data → all traditional protections apply (encryption at rest, access control).

Selection vs crypto shredding `[opinion]`: shredding keeps facts self-contained + reads clean, pays in key ops; forgettable payload keeps ops boring, pays in indirection. Both field-proven; pick per team capability, record as td decision (es-design).

## Projections + downstream cleanup

Shredding the key / deleting payload ≠ done: projections built BEFORE deletion still hold plaintext copies.

1. **Purge replay**: identify projections touching the attributes (model = map, again) → replay those groups (evolution.md procedure) → rebuild reads post-deletion state → PII gone from views.
2. **Purge fact**: append "Personal Data Purged" (carrying NO PII, reference only) → triggers replays via automation, notifies downstream contexts, audit-trails the erasure itself. Erasure = business process → model it like one.
3. **Out-of-band copies**: logs (metadata.md logging bridge — keep PII out of log context from day one), DB backups (fact-store backups holding pre-shred ciphertext = fine — key's gone; forgettable-payload backups = retention policy must cover), exports/DLQ contents/outbox rows = sweep list per deletion runbook.

Deletion runbook = the deliverable: request intake → identity verification → scope lookup (model map) → key/payload destruction → projection replays → downstream notification → confirmation. Rehearse before the first real request, not during `[opinion]`.
