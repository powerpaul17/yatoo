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
      <Button
        severity="warning"
        :label="$t('delete')"
        @click="
          () => {
            emit('delete');
            emit('close');
          }
        "
      >
        <template #icon="{ class: cls }">
          <Trash :class="cls" />
        </template>
      </Button>

      <Button
        :label="$t('cancel')"
        @click="emit('close')"
      >
        <template #icon="{ class: cls }">
          <Ban :class="cls" />
        </template>
      </Button>
    </template>
  </DialogComponent>
</template>

<script setup lang="ts">

  import { Ban, Trash } from 'lucide-vue-next';

  import Button from 'primevue/button';

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
