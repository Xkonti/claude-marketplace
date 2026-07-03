<script setup lang="ts">
/*
 * Grid — CSS grid layout. Token-enum cols + gap. Polymorphic via `as`. No class/style
 * passthrough. (Responsive col counts can be added as token props later if a page needs
 * them; kept single-axis for the lean foundation.)
 */
import { computed } from 'vue'
import type { BoxElement, Cols, Space } from './tokens'
import { colsClass, cx, gapClass } from './tokens'

const props = withDefaults(
  defineProps<{
    /** Semantic element to render. */
    as?: BoxElement
    /** Number of equal columns (token enum). */
    cols?: Cols
    /** Space between cells (token). */
    gap?: Space
  }>(),
  {
    as: 'div',
    cols: 2,
    gap: 'md',
  },
)

const classes = computed(() => cx('grid', colsClass[props.cols], gapClass[props.gap]))
</script>

<template>
  <component :is="as" :class="classes"><slot /></component>
</template>
