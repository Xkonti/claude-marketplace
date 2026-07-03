<script setup lang="ts">
/* Text — inline/block text with token tone/size/weight. The base replacement for a styled
 * <span>/<p> of body copy. */
import { computed } from 'vue'
import { cx } from './tokens'

type Tone =
  | 'default'
  | 'muted'
  | 'subtle'
  | 'strong'
  | 'inverse'
  | 'accent'
  | 'success'
  | 'warning'
  | 'danger'
type Size = 'xs' | 'sm' | 'base' | 'lg'
type Weight = 'normal' | 'medium' | 'semibold' | 'bold'

const props = withDefaults(
  defineProps<{
    /** Element to render. */
    as?: 'span' | 'p' | 'div'
    /** Text colour token. */
    tone?: Tone
    /** Font size token. */
    size?: Size
    /** Font weight token. */
    weight?: Weight
  }>(),
  { as: 'span', tone: 'default', size: 'base', weight: 'normal' },
)

const toneClass: Record<Tone, string> = {
  default: 'text-text',
  muted: 'text-text-muted',
  subtle: 'text-text-subtle',
  strong: 'text-text-strong',
  inverse: 'text-text-inverse',
  accent: 'text-accent',
  success: 'text-success',
  warning: 'text-warning',
  danger: 'text-danger',
}
const sizeClass: Record<Size, string> = {
  xs: 'text-xs',
  sm: 'text-sm',
  base: 'text-base',
  lg: 'text-lg',
}
const weightClass: Record<Weight, string> = {
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
}

const classes = computed(() =>
  cx(toneClass[props.tone], sizeClass[props.size], weightClass[props.weight]),
)
</script>

<template>
  <component :is="as" :class="classes"><slot /></component>
</template>
