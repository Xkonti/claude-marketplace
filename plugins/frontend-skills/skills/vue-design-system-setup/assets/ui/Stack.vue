<script setup lang="ts">
/*
 * Stack — vertical flex layout. Token-enum gap/align/justify, plus the common container props
 * (padding/surface/border/radius) so a padded card-stack needs no nested Box. Polymorphic via
 * `as` (landmarks supported). No class/style passthrough.
 */
import { computed } from 'vue'
import type { Align, Border, BoxElement, Justify, Radius, Space, Surface } from './tokens'
import {
  alignClass,
  borderClass,
  cx,
  gapClass,
  justifyClass,
  pClass,
  radiusClass,
  surfaceClass,
} from './tokens'

const props = withDefaults(
  defineProps<{
    /** Semantic element to render. */
    as?: BoxElement
    /** Space between children (token). */
    gap?: Space
    /** Cross-axis (horizontal) alignment. */
    align?: Align
    /** Main-axis (vertical) distribution. */
    justify?: Justify
    /** Padding on all sides (token). */
    p?: Space
    /** Background surface (token). */
    surface?: Surface
    /** Border style (token). */
    border?: Border
    /** Corner radius (token). */
    radius?: Radius
    /** Apply `flex-grow: 1`. */
    grow?: boolean
  }>(),
  {
    as: 'div',
    gap: 'md',
    align: 'stretch',
    justify: 'start',
    p: undefined,
    surface: 'none',
    border: 'none',
    radius: 'none',
    grow: false,
  },
)

const classes = computed(() =>
  cx(
    'flex flex-col',
    gapClass[props.gap],
    alignClass[props.align],
    justifyClass[props.justify],
    props.p && pClass[props.p],
    surfaceClass[props.surface],
    borderClass[props.border],
    radiusClass[props.radius],
    props.grow && 'grow',
  ),
)
</script>

<template>
  <component :is="as" :class="classes"><slot /></component>
</template>
