<script setup lang="ts">
/*
 * Inline — horizontal flex layout. Token-enum gap/align/justify + optional wrap. Polymorphic
 * via `as`. No class/style passthrough.
 */
import { computed } from 'vue'
import type { Align, BoxElement, Justify, Space } from './tokens'
import { alignClass, cx, gapClass, justifyClass } from './tokens'

const props = withDefaults(
  defineProps<{
    /** Semantic element to render. */
    as?: BoxElement
    /** Space between children (token). */
    gap?: Space
    /** Cross-axis (vertical) alignment. */
    align?: Align
    /** Main-axis (horizontal) distribution. */
    justify?: Justify
    /** Allow children to wrap onto multiple lines. */
    wrap?: boolean
    /** Apply `flex-grow: 1`. */
    grow?: boolean
  }>(),
  {
    as: 'div',
    gap: 'md',
    align: 'center',
    justify: 'start',
    wrap: false,
    grow: false,
  },
)

const classes = computed(() =>
  cx(
    'flex flex-row',
    props.wrap && 'flex-wrap',
    gapClass[props.gap],
    alignClass[props.align],
    justifyClass[props.justify],
    props.grow && 'grow',
  ),
)
</script>

<template>
  <component :is="as" :class="classes"><slot /></component>
</template>
