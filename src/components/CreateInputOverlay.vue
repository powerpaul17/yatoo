<template>
  <Sidebar
    :pt="{
      root: {
        class: 'h-auto max-w-5xl rounded-b-md'
      }
    }"
    :pt-options="{
      mergeProps: true
    }"
    position="top"
    v-model:visible="visible"
    @update="emit('close')"
  >
    <template #container>
      <div class="m-3">
        <InputGroup class="w-full">
          <InputText
            type="text"
            class="w-full"
            v-model="creationString"
            @keypress.enter="handleEnterPressed"
            autofocus
          />
          <Button
            :disabled="!isValidInput"
            @click="handleCreateButtonClicked"
          >
            <template #icon="{ class: cls }">
              <Plus :class="cls" />
            </template>
          </Button>
        </InputGroup>
      </div>
    </template>
  </Sidebar>
</template>

<script setup lang="ts">
  import { computed, ref, watch } from 'vue';
  import { useRoute } from 'vue-router';

  import Sidebar from 'primevue/sidebar';
  import InputGroup from 'primevue/inputgroup';
  import InputText from 'primevue/inputtext';
  import Button from 'primevue/button';

  import { useTodoStore } from '../stores/todoStore';
  import { useLabelToTodoStore } from '../stores/labelToTodoStore';

  import { Plus } from 'lucide-vue-next';

  const route = useRoute();

  const todoStore = useTodoStore();
  const labelToTodoStore = useLabelToTodoStore();

  const props = defineProps({
    open: {
      type: Boolean,
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

  const creationString = ref('');

  const isValidInput = computed(() => {
    return creationString.value.length;
  });

  async function handleCreateButtonClicked(): Promise<void> {
    await createTodo();
  }

  async function handleEnterPressed(): Promise<void> {
    await createTodo();
  }

  async function createTodo(): Promise<void> {
    const todoId = await todoStore.create({
      title: creationString.value,
      description: '',
      done: false,
      doneAt: null
    });

    const labelId = route.params['labelId'];
    if (typeof labelId === 'string') {
      await labelToTodoStore.create({
        labelId,
        todoId
      });
    }

    creationString.value = '';
  }
</script>
