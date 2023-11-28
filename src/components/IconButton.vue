<template>
  <Button
    text
    plain
    rounded
    :severity="severity"
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

  defineProps({
    severity: {
      type: String,
      default: null
    }
  });

  const emit = defineEmits<{
    (event: 'click'): void;
  }>();
</script>
