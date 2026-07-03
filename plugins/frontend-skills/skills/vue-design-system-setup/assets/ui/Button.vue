<script setup lang="ts">
/* Button — the base button, and the reference pattern for variant × tone × size typed APIs.
 * Variation only via typed enums, never a class override. (Headless libs like Reka ship no
 * Button primitive — a native <button> is the right base.)
 *
 * Slots: default — the button label/content.
 * Emits: none of its own — native events (click, focus, …) fall through to the <button> element. */
import { computed } from 'vue'
import { cx } from './tokens'

type Variant = 'solid' | 'soft' | 'outline' | 'ghost'
type Tone = 'accent' | 'neutral' | 'danger'
type Size = 'sm' | 'md' | 'lg'

const props = withDefaults(
  defineProps<{
    /** Native button `type`. Use `submit` inside a `<form>`. */
    type?: 'button' | 'submit' | 'reset'
    /** Visual style: filled `solid`, tinted `soft`, `outline`, or text-only `ghost`. */
    variant?: Variant
    /** Semantic colour: `accent` (primary action), `neutral`, or `danger`. */
    tone?: Tone
    /** Control size. */
    size?: Size
    /** Disable interaction and dim the button. */
    disabled?: boolean
    /** Stretch to the full width of the container. */
    block?: boolean
  }>(),
  { type: 'button', variant: 'solid', tone: 'accent', size: 'md', disabled: false, block: false },
)

const variantTone: Record<Variant, Record<Tone, string>> = {
  solid: {
    accent: 'bg-accent text-text-on-accent hover:bg-accent-hover',
    neutral: 'bg-surface-sunken text-text-strong border border-border hover:bg-surface-raised',
    danger: 'bg-danger text-text-on-accent hover:opacity-90',
  },
  soft: {
    accent: 'bg-accent-muted text-accent hover:opacity-90',
    neutral: 'bg-surface-sunken text-text-strong hover:opacity-90',
    danger: 'bg-danger-surface text-danger hover:opacity-90',
  },
  outline: {
    accent: 'border border-accent text-accent hover:bg-accent-muted',
    neutral: 'border border-border text-text-strong hover:bg-surface-sunken',
    danger: 'border border-danger text-danger hover:bg-danger-surface',
  },
  ghost: {
    accent: 'text-accent hover:bg-accent-muted',
    neutral: 'text-text-strong hover:bg-surface-sunken',
    danger: 'text-danger hover:bg-danger-surface',
  },
}
const sizeClass: Record<Size, string> = {
  sm: 'text-sm px-sm py-xs gap-xs',
  md: 'text-sm px-md py-sm gap-sm',
  lg: 'text-base px-lg py-sm gap-sm',
}

const classes = computed(() =>
  cx(
    'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50',
    variantTone[props.variant][props.tone],
    sizeClass[props.size],
    props.block && 'w-full',
  ),
)
</script>

<template>
  <button :type="type" :disabled="disabled" :class="classes"><slot /></button>
</template>
