<script setup lang="ts">
/* Heading — the only way to render h1–h6 above the base layer. `level` sets the semantic tag;
 * `size` defaults from the level but can be overridden for visual hierarchy. */
import { computed } from 'vue'
import { cx } from './tokens'

type Level = 1 | 2 | 3 | 4 | 5 | 6
type Size = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'

const props = withDefaults(
  defineProps<{
    /** Semantic heading level (`h1`–`h6`). */
    level?: Level
    /** Visual size — defaults from `level`; override for visual hierarchy. */
    size?: Size
    /** Text colour. */
    tone?: 'default' | 'muted'
  }>(),
  { level: 2, size: undefined, tone: 'default' },
)

const sizeClass: Record<Size, string> = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
  '2xl': 'text-2xl',
  '3xl': 'text-3xl',
}
const defaultSize: Record<Level, Size> = { 1: '3xl', 2: '2xl', 3: 'xl', 4: 'lg', 5: 'md', 6: 'sm' }
const toneClass = { default: 'text-text-strong', muted: 'text-text-muted' } as const

const tag = computed(() => `h${props.level}`)
const classes = computed(() =>
  cx('font-semibold tracking-tight', sizeClass[props.size ?? defaultSize[props.level]], toneClass[props.tone]),
)
</script>

<template>
  <component :is="tag" :class="classes"><slot /></component>
</template>
