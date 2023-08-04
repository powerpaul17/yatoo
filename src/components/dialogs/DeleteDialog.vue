<template>
  <Teleport to="body">
    <dialog
      class="modal modal-bottom sm:modal-middle"
      :class="{
        'modal-open': isOpen
      }"
    >
      <form
        method="dialog"
        class="modal-box m-0"
      >
        <h3 class="text-lg font-bold">
          {{ title }}
        </h3>
        <p class="py-4">
          {{ text }}
        </p>
        <div class="modal-action">
          <button
            class="btn-warning btn"
            @click="() => {
              emit('delete');
              emit('close')
            }"
          >
            <Trash />
            {{ $t('delete') }}
          </button>
          <button
            class="btn"
            @click="emit('close')"
          >
            <Ban />
            {{ $t('cancel') }}
          </button>
        </div>
      </form>
      <form
        method="dialog"
        class="modal-backdrop"
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
