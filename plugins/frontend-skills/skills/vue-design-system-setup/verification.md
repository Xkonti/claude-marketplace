# Verification — prove every gate fires

Run after each phase, and in full at the end. Never trust a green run on already-clean code.

## 1. Lint gates (the probe)

Copy `assets/verify-probe.vue` to `src/components/__RuleProbe.vue` (adjust import paths),
then:

```sh
npx eslint src/components/__RuleProbe.vue
```

Compare against the expected-error table in the probe's header comment: **9 errors** across
5 rules, and — just as important — NO errors on the good lines (`<Button>good text</Button>`,
registered slot content). A missing error = gate not wired; an unexpected error on a good line =
registry/scope misconfigured. Delete the probe afterwards.

Also verify scoping: the same content inside `src/components/ui/` must lint clean —
temporarily copy the probe there and confirm zero lockdown errors (naming rule stays off too).

## 2. Type gate

In any composer file, set a token prop to garbage:

```vue
<Stack gap="huge">
```

`vue-tsc --noEmit` must fail with the union-type error and list the valid values. If it
passes, the prop is typed `string` somewhere — find the widened type.

## 3. Palette kill (build output)

```sh
npm run build   # or: vite build
CSS=$(find dist/assets -name '*.css' | xargs ls -S | head -1)   # largest bundle

# Token wiring present — semantic token resolves to a primitive:
grep -oE -- '--color-surface-card:[^;]+' "$CSS"    # expect: var(--raw-white)
grep -c -- '--raw-' "$CSS"                          # expect: ≥ 1 (primitives emitted)

# Default palette gone:
grep -cE '\.bg-(red|blue|zinc|gray|green|amber)-[0-9]+' "$CSS"   # expect: 0

# Keyword colors survived:
grep -oE '\.(bg-transparent|border-current)\b' "$CSS" | sort -u  # expect: both (if used)
```

Note: builds can emit several CSS chunks — check the main bundle, not the first file found.

## 4. Token utility smoke test

Add `surface="card" p="md" radius="lg"` to a `Box` on a rendered page and confirm the styles
apply in the browser (background, padding, radius). This catches the literal-class-map gap:
a map entry missing for a token → utility never generated → prop silently no-ops.

## 5. CI contract

Confirm the pipeline runs — and FAILS the build on — all of: `eslint .`, `vue-tsc --noEmit`,
unit tests, `vite build`. A gate that doesn't fail CI is advisory, and advisory rules decay.

## Done-when checklist

- [ ] Probe: 9/9 expected errors, 0 false positives, clean inside `components/ui`
- [ ] `gap="huge"` fails `vue-tsc`
- [ ] Bundle: token vars wired, default palette absent, keywords intact
- [ ] Token props visibly style a rendered page
- [ ] All four gates CI-fatal
- [ ] Rules docs installed (`.claude/rules/design/`) and referenced by lint messages
