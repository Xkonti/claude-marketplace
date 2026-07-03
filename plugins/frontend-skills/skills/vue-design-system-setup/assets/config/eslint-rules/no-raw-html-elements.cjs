/**
 * no-raw-html-elements — the base-component-only lockdown.
 *
 * FAIL-SAFE ALLOWLIST: bans EVERY raw HTML/SVG element in a template EXCEPT an explicit
 * scaffolding allowlist. Any new/unknown native tag fails by default — no per-component audit
 * when the base catalog grows (contrast a denylist, which silently permits unlisted tags).
 * Scope it OFF inside `components/ui` via the flat config (the only place raw elements + the
 * Tailwind/CSS skin live); ON everywhere else, including layouts/.
 *
 * Detection is self-contained (no eslint-plugin-vue internals — v10+ ships bundled, no
 * `lib/utils`). An element is treated as a permitted CUSTOM COMPONENT and skipped when its raw
 * tag name is PascalCase (`Box`, `Heading`, `RouterView`) or compound/namespaced
 * (`Dialog.Root`). Everything else lowercase — native HTML/SVG (`div`, `h2`, `button`, `svg`)
 * and lowercase-kebab custom elements — must be on the allowlist or it is reported. (Convention
 * is PascalCase SFC components, so the kebab case effectively only catches raw web components.)
 *
 * The template AST is reached via `parserServices.defineTemplateBodyVisitor`, present whenever
 * the file was parsed by vue-eslint-parser (set up by eslint-plugin-vue's flat configs).
 *
 * @type {import('eslint').Rule.RuleModule}
 */

// Scaffolding only — structure, not skin. `div`/`span` are INTENTIONALLY absent: composer code
// lays out with the typed `Box`/`Stack`/`Grid` primitive; raw layout elements live only in
// `components/ui`. Vue/router built-ins are listed defensively (most aren't native HTML anyway).
const ALLOWED = new Set([
  'template',
  'slot',
  'component',
  'transition',
  'transition-group',
  'keep-alive',
  'teleport',
  'suspense',
  'router-view',
  'router-link',
  'form', // structural wrapper; its fields are base components
])

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow raw HTML/SVG elements outside components/ui — compose base components (fail-safe allowlist).',
    },
    schema: [],
    messages: {
      rawElement:
        "Raw <{{tag}}> is not allowed outside components/ui — compose a base component instead " +
        '(Box/Stack/Grid for layout; Heading/Text/Label/Link/… for content). ' +
        'If none fits, add a base component to components/ui — never a raw element. ' +
        '(.claude/rules/design/composing.md)',
    },
  },

  create(context) {
    const sourceCode = context.sourceCode || context.getSourceCode()
    const parserServices = sourceCode.parserServices || context.parserServices
    if (!parserServices || typeof parserServices.defineTemplateBodyVisitor !== 'function') {
      // Not a .vue file parsed with the template parser — nothing to police.
      return {}
    }

    return parserServices.defineTemplateBodyVisitor({
      VElement(node) {
        const rawName = node.rawName
        if (!rawName) return
        if (/[A-Z]/.test(rawName)) return // PascalCase → custom component
        if (rawName.includes('.')) return // compound/namespaced component (Dialog.Root)
        if (ALLOWED.has(rawName.toLowerCase())) return

        context.report({
          node: node.startTag || node,
          messageId: 'rawElement',
          data: { tag: rawName },
        })
      },
    })
  },
}
