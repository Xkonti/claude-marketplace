<script setup lang="ts">
/* Link — the base anchor. `to` navigates internally via RouterLink; `href` is a plain <a> for
 * external / in-page targets, with `external` opening a new tab safely.
 * (Drop the RouterLink branch if the project doesn't use vue-router.) */
import type { RouteLocationRaw } from 'vue-router'
import { cx } from './tokens'

withDefaults(
  defineProps<{
    /** Internal target — renders a `RouterLink`. Provide either `to` or `href`. */
    to?: RouteLocationRaw
    /** External / in-page target — renders a plain `<a>`. */
    href?: string
    /** For `href`: open in a new tab with safe `rel`. */
    external?: boolean
    /** Underline the link text (default true). */
    underline?: boolean
  }>(),
  { underline: true },
)

const linkClass = (underline: boolean) =>
  cx('text-accent hover:text-accent-hover', underline && 'underline underline-offset-2')
</script>

<template>
  <RouterLink v-if="to !== undefined" :to="to" :class="linkClass(underline)">
    <slot />
  </RouterLink>
  <a
    v-else
    :href="href"
    :target="external ? '_blank' : undefined"
    :rel="external ? 'noopener noreferrer' : undefined"
    :class="linkClass(underline)"
  >
    <slot />
  </a>
</template>
