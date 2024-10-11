<template>
  <Dialog
    v-model:visible="visible"
    :header="title"
    :modal="true"
    :dismissable-mask="true"
    :position="smallScreen ? 'bottom' : 'center'"
    :pt="{
      root: {
        class: smallScreen ? '!-m-5 flex-grow w-full' : ''
      },
      footer: {
        class: smallScreen ? 'rounded-b-none' : ''
      }
    }"
    :pt-options="{
      mergeProps: true
    }"
  >
    <form class="m-0">
      <p class="py-4">
        <slot />
      </p>
    </form>

    <template #footer>
      <div class="flex gap-2">
        <slot name="actions" />
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
  import { computed, ref, watch } from 'vue';
  import { useWindowSize } from '@vueuse/core';

  import Dialog from 'primevue/dialog';

  const props = defineProps({
    open: {
      type: Boolean,
      required: true
    },
    title: {
      type: String,
      required: true
    }
  });

  const emit = defineEmits<{
    (event: 'close'): void;
  }>();

  const visible = ref(false);

  watch(
    () => props.open,
    () => {
      visible.value = props.open;
    }
  );

  watch(visible, () => {
    if (!visible.value) emit('close');
  });

  const { width } = useWindowSize();

  const smallScreen = computed(() => {
    return width.value < 640;
  });
</script>
