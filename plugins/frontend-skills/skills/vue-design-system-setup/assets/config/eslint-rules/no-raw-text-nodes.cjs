/**
 * no-raw-text-nodes — "everything textual is a base component".
 *
 * Outside `components/ui`, a template may not render raw text (static text or a `{{ … }}`
 * mustache) into scaffolding/native elements or arbitrary components — text must flow through a
 * text base component (`<Text>`, `<Heading>`, `<Label>`, …) so typography stays a single
 * decision in the design system.
 *
 * FAIL-SAFE ALLOWLIST (same posture as no-raw-html-elements): a text node is permitted ONLY
 * when it is slot content of a component registered in `config/text-bearing-components.cjs` —
 * a component known to render that slot inside a styled text element it owns (e.g.
 * `<Button>Save</Button>`, `<template #title>Edit</template>` under `<Dialog>`). Any other
 * placement — text in a raw `<template>`/`<form>` wrapper, text directly inside a layout
 * primitive (`<Stack>plain</Stack>`) or an unregistered component — is reported.
 *
 * Scope it OFF inside `components/ui` via the flat config (base components render raw text by
 * design); ON everywhere else, including layouts/.
 *
 * @type {import('eslint').Rule.RuleModule}
 */

const { TEXT_BEARING } = require('../text-bearing-components.cjs')

/** True when the entry permits plain text in the given slot ('default' = default slot). */
function slotAllows(entry, slotName) {
  if (entry === true) return true
  if (Array.isArray(entry) && slotName !== null) return entry.includes(slotName)
  return false
}

/** Component name as written (`Dialog`, `Dialog.Root` → `Dialog`); null for non-components. */
function componentName(element) {
  const rawName = element.rawName || ''
  if (!/[A-Z]/.test(rawName)) return null // lowercase → native/scaffolding, not a component
  return rawName.split('.')[0]
}

/** For a `<template #slotName>` element: its slot name, or null (dynamic / not a slot template). */
function slotTemplateName(element) {
  if (element.rawName !== 'template') return undefined // not a slot template at all
  const slotDir = element.startTag.attributes.find(
    (attr) => attr.directive && attr.key.name.name === 'slot',
  )
  if (!slotDir) return undefined
  const arg = slotDir.key.argument
  if (!arg) return 'default' // bare v-slot
  if (arg.type === 'VIdentifier') return arg.name
  return null // dynamic slot name — unresolvable statically
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow raw text nodes outside components/ui except as slot content of registered text-bearing components.',
    },
    schema: [],
    messages: {
      rawText:
        'Raw text is not allowed here — visible text must go through a text base component ' +
        '(<Text>, <Heading>, <Label>, <Caption>, …). If the surrounding component is DESIGNED to ' +
        'receive plain text in this slot (it styles the slot content itself), register it in ' +
        'config/text-bearing-components.cjs instead. (.claude/rules/design/composing.md)',
    },
  },

  create(context) {
    const sourceCode = context.sourceCode || context.getSourceCode()
    const parserServices = sourceCode.parserServices || context.parserServices
    if (!parserServices || typeof parserServices.defineTemplateBodyVisitor !== 'function') {
      return {}
    }

    function checkTextNode(node) {
      const parent = node.parent
      if (!parent || parent.type !== 'VElement') return // attribute values etc.

      // Case 1: direct child of a component → default slot of that component.
      const name = componentName(parent)
      if (name !== null) {
        if (slotAllows(TEXT_BEARING[name], 'default')) return
        context.report({ node, messageId: 'rawText' })
        return
      }

      // Case 2: child of `<template #slot>` under a component → that component's named slot.
      const slotName = slotTemplateName(parent)
      if (slotName !== undefined) {
        const host = parent.parent && parent.parent.type === 'VElement' ? parent.parent : null
        const hostName = host ? componentName(host) : null
        if (hostName !== null && slotAllows(TEXT_BEARING[hostName], slotName)) return
        context.report({ node, messageId: 'rawText' })
        return
      }

      // Case 3: child of a native/scaffolding element (`template` root, `form`, …) → never OK.
      context.report({ node, messageId: 'rawText' })
    }

    return parserServices.defineTemplateBodyVisitor({
      VText(node) {
        if (!node.value.trim()) return // whitespace/indentation only
        checkTextNode(node)
      },
      VExpressionContainer(node) {
        // Only mustaches rendered as element children ({{ … }}), not directive/attr expressions.
        if (!node.parent || node.parent.type !== 'VElement') return
        checkTextNode(node)
      },
    })
  },
}
