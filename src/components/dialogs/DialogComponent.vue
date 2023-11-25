<template>
  <Dialog
    v-model:visible="visible"
    :header="title"
    :modal="true"
  >
    <form class="m-0">
      <p class="py-4">
        <slot />
      </p>
    </form>

    <template #footer>
      <div>
        <slot name="actions" />
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue';

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
</script>
