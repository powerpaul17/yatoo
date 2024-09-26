<template>
  <Sidebar
    pt:root="h-auto max-w-5xl rounded-b-md"
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

        <div class="mt-2 flex items-baseline gap-2">
          <span
            v-if="!parseResult"
            class="text-sm text-gray-400"
          >
            Example: "A new little task #some-tag"
          </span>

          <LabelItem
            v-for="(label, index) of labels"
            :key="index"
            :label-id="label.id"
          />
          <span
            v-for="(label, index) of parseResult?.newLabels"
            class="inline-flex h-5 items-center justify-center rounded-full border border-black bg-transparent pl-0.5 pr-2"
            :key="index"
          >
            {{ label }}
          </span>
        </div>
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
  import { useLabelStore, type Label } from '../stores/labelStore';
  import { useLabelToTodoStore } from '../stores/labelToTodoStore';

  import {
    useCreationStringParser,
    type TodoCreationData
  } from '../classes/CreationStringParser';

  import { Plus } from 'lucide-vue-next';

  import LabelItem from './labels/LabelItem.vue';

  const route = useRoute();

  const todoStore = useTodoStore();
  const labelStore = useLabelStore();
  const labelToTodoStore = useLabelToTodoStore();

  const creationStringParser = useCreationStringParser();

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

  const parseResult = ref<TodoCreationData | null>(null);

  watch(creationString, async () => {
    const result = await creationStringParser.parseCreationString(
      creationString.value
    );
    parseResult.value = result;
  });

  const labels = ref<Array<Label>>([]);

  watch(parseResult, async () => {
    if (!parseResult.value) {
      labels.value = [];
    } else {
      const newLabels = [];
      for (const labelId of parseResult.value.labelIds) {
        const label = await labelStore.getById(labelId);
        if (!label) throw new Error('label does not exist');

        newLabels.push(label);
      }
      labels.value = newLabels;
    }
  });

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
    if (!parseResult.value) return;

    const labelIds = parseResult.value.labelIds.slice();
    for (const newLabel of parseResult.value.newLabels) {
      const id = await labelStore.create({
        name: newLabel,
        color: '',
        icon: ''
      });
      labelIds.push(id);
    }

    const todoId = await todoStore.create({
      title: parseResult.value.title,
      description: '',
      done: false,
      doneAt: null
    });

    for (const labelId of labelIds) {
      await labelToTodoStore.create({
        labelId,
        todoId
      });
    }

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
