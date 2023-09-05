<template>
  <ModalComponent
    class="ds-modal-top"
    :open="open"
  >
    <form
      method="dialog"
      class="ds-modal-box mx-auto max-w-5xl"
    >
      <div class="ds-join w-full">
        <input
          type="text"
          class="ds-input-bordered ds-input-primary ds-input ds-join-item w-full text-neutral-content"
          v-model="creationString"
        >
        <button
          class="ds-btn-primary ds-join-item ds-btn"
          :disabled="!isValidInput"
          @click="handleCreateButtonClicked"
        >
          <Plus />
        </button>
      </div>
    </form>
  </ModalComponent>
</template>

<script setup lang="ts">

  import { computed, ref } from 'vue';

  import { useTodoStore } from '../stores/todoStore';

  import { Plus } from 'lucide-vue-next';

  import ModalComponent from './dialogs/ModalComponent.vue';

  const todoStore = await useTodoStore();

  defineProps({
    open: {
      type: Boolean,
      required: true
    }
  });

  const creationString = ref('');

  const isValidInput = computed(() => {
    return creationString.value.length;
  });

  async function handleCreateButtonClicked(): Promise<void> {
    await todoStore.create({
      title: creationString.value,
      description: '',
      done: false,
      doneAt: null
    });

    creationString.value = '';
  }

</script>
