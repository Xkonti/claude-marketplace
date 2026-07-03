---
paths:
  - 'src/pages/**'
  - 'src/layouts/**'
  - 'src/components/**'
---

<!-- Template: adjust `paths:` and file paths to the repo layout. -->

## Composing UI (pages, layouts, reusable + domain components)

Everything above `components/ui` builds from base components ONLY. (Inside `components/ui` itself → `base-components.md` instead.)

Hard bans (ESLint, CI-fatal):

- **No raw HTML/SVG elements.** No `div`, `h2`, `p`, `button`, `img`, `a`, `svg`… Layout → `<Box>`/`<Stack>`/`<Grid>`/`<Inline>`. Text → `<Heading>`/`<Text>`/`<Paragraph>`/`<Label>`/`<Caption>`/`<Link>`. Allowed scaffolding only: `template`, `slot`, `component`, `Transition`, `Teleport`, `RouterView`/`RouterLink`, `KeepAlive`, `Suspense`, `form` (structural wrapper).
- **No raw text nodes.** Plain text / `{{ mustache }}` only as slot content of text-bearing components (registry: `config/text-bearing-components.cjs` — `Button`, `Heading`, `Text`, …). Anywhere else → wrap in `<Text>` etc. `<Stack>{{ x }}</Stack>` = error; `<Stack><Text>{{ x }}</Text></Stack>` = correct.
- **No styling.** No `class`, `:class`, `style`, `:style`, no Tailwind, no `<style>` blocks with visual rules, no `v-html`. Variation via typed props: `<Button variant="ghost" tone="danger">`, `<Stack gap="md" p="lg">`.

## When Blocked

Lint/type error = missing capability at lower tier. Fix there:

- missing element/widget → new base component (`base-components.md`)
- missing look/variation → new typed prop/variant on existing base component
- missing color/size role → new semantic token (`design-tokens.md`)
- component legitimately styles its slotted text → register in text-bearing registry

NEVER: `eslint-disable`, raw element "just here", class smuggled through prop.

## Component Homes (reuse scope)

Page-only → `pages/<domain>/<page>/_components/`. One domain → `components/<domain>/`. Cross-domain → `components/`. Generic, domain-free → base component `components/ui/`. Promote on second use, not before.
