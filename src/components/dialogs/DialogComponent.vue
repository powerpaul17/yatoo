<template>
  <Teleport to="body">
    <dialog
      class="ds-modal ds-modal-bottom sm:ds-modal-middle"
      :class="{
        'ds-modal-open': isOpen
      }"
    >
      <form
        method="dialog"
        class="ds-modal-box m-0"
      >
        <h3 class="text-lg font-bold">
          {{ title }}
        </h3>
        <p class="py-4">
          <slot />
        </p>
        <div class="ds-modal-action">
          <slot name="actions" />
        </div>
      </form>
      <form
        method="dialog"
        class="ds-modal-backdrop"
      >
        <button @click="emit('close')" />
      </form>
    </dialog>
  </Teleport>
</template>

<script setup lang="ts">

  import { ref, watch } from 'vue';

  const props = defineProps({
    open: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      required: true
    }
  });

  watch(() => props.open, () => isOpen.value = props.open);

  const emit = defineEmits<{
    (event: 'close'): void;
  }>();

  const isOpen = ref(props.open);

</script>
