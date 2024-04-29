<template>
  <div class="relative inline">
    <slot></slot>

    <div
      v-if="show"
      class="absolute left-3/4 top-1/4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-500 p-1 text-xs font-bold text-white"
    >
      {{ value }}
    </div>
  </div>
</template>

<script setup lang="ts">
  defineProps({
    show: {
      type: Boolean,
      default: false
    },
    value: {
      type: String,
      default: ''
    }
  });
</script>
