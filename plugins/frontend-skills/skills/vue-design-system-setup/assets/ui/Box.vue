<script setup lang="ts">
/*
 * Box — the polymorphic layout primitive. Replaces the raw styled `<div>`: composers lay out
 * with token-ENUM props, never class strings. The `as` prop picks the semantic element (incl.
 * landmarks) so layout chrome emits <nav>/<header> through Box. NO class/style/sx passthrough —
 * variation only via the typed props below.
 */
import { computed } from 'vue'
import type { Border, BoxElement, Radius, Shadow, Space, Surface } from './tokens'
import {
  borderClass,
  cx,
  pClass,
  pxClass,
  pyClass,
  radiusClass,
  shadowClass,
  surfaceClass,
} from './tokens'

const props = withDefaults(
  defineProps<{
    /** Semantic element to render (incl. landmarks like `section` / `nav` / `header`). */
    as?: BoxElement
    /** Padding on all sides (spacing token). */
    p?: Space
    /** Horizontal padding (spacing token). */
    px?: Space
    /** Vertical padding (spacing token). */
    py?: Space
    /** Background surface (token). */
    surface?: Surface
    /** Border style (token). */
    border?: Border
    /** Corner radius (token). */
    radius?: Radius
    /** Drop shadow (token). */
    shadow?: Shadow
    /** Apply `flex-grow: 1`. */
    grow?: boolean
  }>(),
  {
    as: 'div',
    p: undefined,
    px: undefined,
    py: undefined,
    surface: 'none',
    border: 'none',
    radius: 'none',
    shadow: 'none',
    grow: false,
  },
)

const classes = computed(() =>
  cx(
    props.p && pClass[props.p],
    props.px && pxClass[props.px],
    props.py && pyClass[props.py],
    surfaceClass[props.surface],
    borderClass[props.border],
    radiusClass[props.radius],
    shadowClass[props.shadow],
    props.grow && 'grow',
  ),
)
</script>

<template>
  <component :is="as" :class="classes"><slot /></component>
</template>
