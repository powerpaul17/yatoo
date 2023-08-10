<template>
  <ModalComponent
    class="modal-top"
    :open="open"
  >
    <form
      method="dialog"
      class="modal-box mx-auto max-w-5xl"
    >
      <div class="join w-full">
        <input
          type="text"
          class="input-bordered input-primary input join-item w-full text-neutral-content"
          v-model="creationString"
        >
        <button
          class="btn-primary join-item btn"
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

  const todoStore = useTodoStore();

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
