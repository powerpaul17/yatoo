<template>
  <DialogComponent
    :open="open"
    :title="title"
    @close="emit('close')"
  >
    <template>
      {{ text }}
    </template>

    <template #actions>
      <button
        class="ds-btn-warning ds-btn"
        @click="() => {
          emit('delete');
          emit('close')
        }"
      >
        <Trash />
        {{ $t('delete') }}
      </button>
      <button
        class="ds-btn"
        @click="emit('close')"
      >
        <Ban />
        {{ $t('cancel') }}
      </button>
    </template>
  </DialogComponent>
</template>

<script setup lang="ts">

  import { Ban, Trash } from 'lucide-vue-next';

  import DialogComponent from './DialogComponent.vue';

  defineProps({
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

  const emit = defineEmits<{
    (event: 'close'): void;
    (event: 'delete'): void;
  }>();

</script>
