<template>
  <div class="mt-7 flex flex-col">
    <div class="mb-3 flex items-center">
      <span class="grow truncate font-semibold tracking-wide">{{ title }}</span>
      <IconButton
        v-if="$slots.buttonIcon"
        class="h-8 w-8 shrink-0"
        @click="emit('button-click')"
      >
        <template #icon>
          <slot name="buttonIcon" />
        </template>
      </IconButton>
    </div>

    <div>
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
  import IconButton from '../IconButton.vue';

  defineProps({
    title: {
      type: String,
      required: true
    }
  });

  const emit = defineEmits<{
    (event: 'button-click'): void;
  }>();
</script>
