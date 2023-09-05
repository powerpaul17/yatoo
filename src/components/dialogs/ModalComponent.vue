<template>
  <Teleport to="body">
    <dialog
      v-bind="$attrs"
      class="ds-modal"
      :class="{
        'ds-modal-open': isOpen
      }"
    >
      <slot />
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
      required: true
    }
  });

  const emit = defineEmits<{
    (event: 'close'): void;
  }>();

  const isOpen = ref(false);

  watch(() => props.open, () => isOpen.value = props.open);

</script>
