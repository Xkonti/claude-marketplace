<script setup lang="ts">
/* Label — form field label. `for` ties it to an input id; `required` shows a marker. */
defineProps<{
  /** Id of the input this labels (sets the native `for` attribute). */
  for?: string
  /** Show a required marker (`*`). */
  required?: boolean
}>()
</script>

<template>
  <label :for="$props.for" class="text-sm font-medium text-text-strong">
    <slot />
    <span v-if="required" class="text-danger" aria-hidden="true"> *</span>
  </label>
</template>
