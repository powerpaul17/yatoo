<template>
  <ModalComponent
    :open="open"
    class="ds-modal-bottom sm:ds-modal-middle"
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
  </ModalComponent>
</template>

<script setup lang="ts">

  import ModalComponent from './ModalComponent.vue';

  defineProps({
    open: {
      type: Boolean,
      required: true
    },
    title: {
      type: String,
      required: true
    }
  });

</script>
