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
          {{ text }}
        </p>
        <div class="ds-modal-action">
          <button
            class="ds-btn-warning ds-btn"
            @click="() => {
              emit('delete');
              emit('close')
            }"
          >
            <Trash />
            {{ $t('components.Dialogs.DeleteDialog.delete') }}
          </button>
          <button
            class="ds-btn"
            @click="emit('close')"
          >
            <Ban />
            {{ $t('components.Dialogs.DeleteDialog.cancel') }}
          </button>
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

  import { Ban, Trash } from 'lucide-vue-next';

  const props = defineProps({
    open: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      required: true
    },
    text: {
      type: String,
      default: null
    }
  });

  watch(() => props.open, () => isOpen.value = props.open);

  const emit = defineEmits<{
    (event: 'close'): void;
    (event: 'delete'): void;
  }>();

  const isOpen = ref(props.open);

</script>
