# ESLint flat-config block — the lockdown gates

Merge into `eslint.config.js` (requires `eslint-plugin-vue` flat configs already applied, e.g.
`pluginVue.configs['flat/essential']`, so vue-eslint-parser handles `.vue` files).

```js
import componentPaths from './config/component-paths.cjs'
import noRawHtmlElements from './config/eslint-rules/no-raw-html-elements.cjs'
import noRawTextNodes from './config/eslint-rules/no-raw-text-nodes.cjs'

const { BASE_COMPONENTS_GLOB } = componentPaths

export default defineConfigWithVueTs(
  // … your existing base configs …

  // The base-component lockdown. Four gates, all OFF inside `components/ui` (the only place
  // raw elements + the Tailwind/CSS skin live), ON everywhere else incl. layouts/:
  {
    name: 'design-system/base-component-lockdown',
    files: ['src/**/*.vue'],
    ignores: [BASE_COMPONENTS_GLOB], // components/ui exempt; layouts/ stays policed
    plugins: {
      'design-system': {
        rules: {
          'no-raw-html-elements': noRawHtmlElements,
          'no-raw-text-nodes': noRawTextNodes,
        },
      },
    },
    rules: {
      'design-system/no-raw-html-elements': 'error',
      'design-system/no-raw-text-nodes': 'error',
      'vue/no-restricted-static-attribute': [
        'error',
        {
          key: 'class',
          message:
            'No raw styling outside components/ui — use a token-prop base component (Box/Stack variant/size/tone/gap/p…). Missing a knob? Add a typed prop/variant to the base component, never a class. (.claude/rules/design/composing.md)',
        },
        {
          key: 'style',
          message:
            'No raw styling outside components/ui — use a token-prop base component; add a typed prop/variant if none fits. (.claude/rules/design/composing.md)',
        },
      ],
      'vue/no-restricted-v-bind': [
        'error',
        {
          argument: 'class',
          message:
            'No bound `:class` outside components/ui — express variation through typed base-component props (variant/size/tone/…), adding one if missing. (.claude/rules/design/composing.md)',
        },
        {
          argument: 'style',
          message:
            'No bound `:style` outside components/ui — use token-prop base components; add a typed prop/variant if none fits. (.claude/rules/design/composing.md)',
        },
      ],
      'vue/no-v-html': 'error',
    },
  },

  // Base components are deliberately single-word (Box, Card, Button, Heading) — that's the
  // design-system naming convention. The multi-word rule is for feature components.
  {
    name: 'design-system/base-component-naming',
    files: ['src/components/ui/**/*.vue'],
    rules: { 'vue/multi-word-component-names': 'off' },
  },

  // File-based routes take their name from the filename — `index`/`[id]`/`login` are
  // single-word by construction. Layout shells are structural. The lockdown stays ON for
  // both — only naming is relaxed.
  {
    name: 'design-system/route-and-layout-naming',
    files: ['src/pages/**/*.vue', 'src/layouts/**/*.vue'],
    rules: { 'vue/multi-word-component-names': 'off' },
  },
)
```

Notes:

- The `ignores` on the lockdown block is the ONLY thing that exempts `components/ui` — keep the
  glob bound to `component-paths.cjs`, never inline it a second time.
- Message text is the documentation an agent actually reads at the moment of violation — keep
  each message naming the correct fix and pointing at your design rules docs.
- If ESLint is still on legacy `.eslintrc`, migrate to flat config first; the custom-rule
  wiring above (`plugins: { 'design-system': { rules } }`) is flat-config syntax.
