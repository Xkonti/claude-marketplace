---
paths:
  - 'src/components/ui/**'
  - 'config/text-bearing-components.cjs'
---

<!-- Template: adjust `paths:` and file paths to the repo layout. -->

## Base Component = Design-System Layer

`src/components/ui/` — ONLY tier allowed raw HTML/SVG, Tailwind classes, CSS. All visual decisions live here, expressed via design tokens (`design-tokens.md`). Lockdown gates OFF here, ON everywhere else.

## Creating Base Component

- Wrap headless primitive (Reka etc.) when one exists (behavior + a11y free), skin with token utilities. App imports OUR component, never the headless lib directly.
- Typed prop API: variation ONLY via typed props (`variant`, `size`, `tone`, `gap`, `p` — union types from `tokens.ts` maps). Bad value = compile error + autocomplete.
- **NO escape hatches**: no `class`/`style`/`sx` passthrough props, no attr fallthrough that lets caller inject classes. Missing variation → add prop/variant HERE.
- Colors: token utilities only (`bg-surface-card`, `text-danger`). Default palette deleted → off-token color won't build. Structural micro-classes (`size-5`, `px-1`, `flex`) OK inside ui — skin detail, not design decision.
- Naming: single-word PascalCase OK (`Box`, `Card`) — multi-word rule off for ui/.
- Document props/emits/slots in-file (JSDoc on `defineProps`/`defineEmits`) — AI reads source before use.

## Text-Bearing Registry

Component renders slot content inside styled TEXT element it owns (`<Button>Save</Button>`, `Dialog` `#title`) → register in `config/text-bearing-components.cjs` → composers may put plain text in that slot. Slot lands in plain `<div>` → do NOT register; composers must wrap in `<Text>`.

Entry: `Name: true` (all slots) or `Name: ['title', 'default']` (specific slots). Verify template before adding — false entry = silent lockdown hole. Trap: comps whose title/description are PROPS + plain content slot (toasts, alert dialogs) = NOT text-bearing.

## Layout Primitives

`Box`/`Stack`/`Grid`/`Inline` = the raw-`<div>` replacement for composers. Token-enum props only. New layout need → extend primitives' typed props, don't push composers toward raw elements.

## Catalog Completeness

Composer hits missing primitive → ADD base component (or prop/variant/token). Never tell composer "use raw element just here". Lockdown only works when catalog complete.
