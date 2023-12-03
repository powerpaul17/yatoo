<template>
  <div
    class="text-neutral-content rounded-md hover:bg-neutral focus:bg-neutral"
    :class="{
      'opacity-40': todo.done,
      'bg-neutral': isOpen
    }"
  >
    <div class="flex items-center gap-2 p-1">
      <div class="shrink-0">
        <Button
          text
          plain
          @click="handleToggleDoneClicked()"
        >
          <template #icon="{ class: cls }">
            <Square
              v-if="!todo.done"
              :class="cls"
            />
            <CheckSquare
              v-else
              :class="cls"
            />
          </template>
        </Button>
      </div>

      <div class="flex-auto truncate">
        <span
          :class="{
            'line-through': todo.done
          }"
        >
          {{ todo.title }}
        </span>

        <div
          v-if="!!labels.length"
          class="mt-1"
        >
          <LabelList :labels="labels" />
        </div>
      </div>
      <div class="shrink-0">
        <Button
          text
          plain
          @click="handleToggleOpenClicked()"
        >
          <template #icon="{ class: cls }">
            <X
              v-if="isOpen"
              :class="cls"
            />
            <PanelRightOpen
              v-else
              :class="cls"
            />
          </template>
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { type PropType, computed, ref, watch } from 'vue';
  import { useRoute } from 'vue-router';

  import Button from 'primevue/button';

  import {
    Check,
    CheckSquare,
    PanelRightOpen,
    Square,
    Undo,
    X
  } from 'lucide-vue-next';

  import LabelList from './labels/LabelList.vue';

  import { useTodoStore, type Todo } from '../stores/todoStore';

  import { useLabelService } from '../services/labelService';

  const todoStore = useTodoStore();

  const labelService = useLabelService();

  const props = defineProps({
    todo: {
      type: Object as PropType<Todo>,
      required: true
    }
  });

  const route = useRoute();

  const todo = ref(props.todo);

  watch(
    () => props.todo,
    () => {
      todo.value = props.todo;
    }
  );

  const emit = defineEmits<{
    (event: 'open', id?: string): void;
  }>();

  const isOpen = computed(() => {
    return route.query.todoId === props.todo.id;
  });

  const labels = labelService.getLabelRefForTodoId(
    computed(() => todo.value.id)
  );

  function handleToggleOpenClicked(): void {
    if (route.query.todoId === props.todo.id) {
      emit('open');
    } else {
      emit('open', props.todo.id);
    }
  }

  async function handleToggleDoneClicked(): Promise<void> {
    await todoStore.setDone(todo.value, !todo.value.done);
  }
</script>
