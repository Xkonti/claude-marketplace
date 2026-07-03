<script setup lang="ts">
/* Paragraph — block body copy with comfortable leading. */
import { computed } from 'vue'
import { cx } from './tokens'

const props = withDefaults(
  defineProps<{
    /** Text colour. */
    tone?: 'default' | 'muted'
  }>(),
  { tone: 'default' },
)
const classes = computed(() =>
  cx('text-base leading-relaxed', props.tone === 'muted' ? 'text-text-muted' : 'text-text'),
)
</script>

<template>
  <p :class="classes"><slot /></p>
</template>
