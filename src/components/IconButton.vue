<template>
  <Button
    text
    icon
    plain
    rounded
    @click="emit('click')"
  >
    <template #icon="{ class: cls }">
      <slot
        name="icon"
        :class="cls"
      ></slot>
    </template>
  </Button>
</template>

<script setup lang="ts">
  import Button from 'primevue/button';

  const emit = defineEmits<{
    (event: 'click'): void;
  }>();
</script>
