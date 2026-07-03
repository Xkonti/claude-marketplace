<script setup lang="ts">
/*
 * verify-probe — TEMPORARY gate-verification component. Copy to e.g.
 * `src/components/__RuleProbe.vue`, run `eslint` on it, compare against the expected results
 * below, then DELETE it. Never trust a green lint run on already-clean code — prove the gates
 * fire before relying on them.
 *
 * Expected errors (9):
 *   design-system/no-raw-text-nodes        × 5  (text in Stack, mustache in Stack, text in the
 *                                                <div>, text in the class'd Stack, text in form)
 *   design-system/no-raw-html-elements     × 1  (the <div>)
 *   vue/no-restricted-static-attribute     × 1  (class="p-4")
 *   vue/no-restricted-v-bind               × 1  (:style)
 *   vue/no-v-html                          × 1
 *
 * Expected NON-errors: Button text, Dialog #title / #description content (if Dialog is
 * registered with those slots in config/text-bearing-components.cjs).
 *
 * Adjust import paths / registered components to match the project before running.
 */
import Button from '@/components/ui/Button.vue'
import Stack from '@/components/ui/Stack.vue'
const n = 1
const html = '<b>x</b>'
</script>

<template>
  <Stack>
    bad raw text
    {{ n }}
    <Button>good text</Button>
    <div>bad element</div>
    <Stack class="p-4">bad class</Stack>
    <Stack :style="{ color: 'red' }" />
    <Stack v-html="html" />
    <form>bad text in form</form>
  </Stack>
</template>
