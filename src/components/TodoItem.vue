<template>
  <div
    class="
      rounded-md
      text-neutral-content
      hover:bg-neutral
      focus:bg-neutral
    "
    :class="
      {
        'opacity-40': todo.done,
        'bg-neutral': isOpen
      }
    "
  >
    <div class="flex items-center gap-2 p-1">
      <button
        class="ds-btn ds-btn-square ds-btn-ghost"
        @click="handleToggleDoneClicked()"
      >
        <Square v-if="!todo.done" />
        <CheckSquare v-else />
      </button>
      <div class="flex-auto truncate">
        <span
          :class="
            {
              'line-through': todo.done
            }
          "
        >{{ todo.title }}</span>
      </div>
      <div class="shrink-0">
        <button
          class="ds-btn ds-btn-square ds-btn-ghost"
          @click="handleToggleOpenClicked()"
        >
          <X v-if="isOpen" />
          <PanelRightOpen v-else />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

  import { type PropType, computed, ref, watch } from 'vue';
  import { useRoute } from 'vue-router';

  import {
    Check,
    CheckSquare,
    PanelRightOpen,
    Square,
    Undo,
    X
  } from 'lucide-vue-next';

  import { useTodoStore, type Todo } from '../stores/todoStore';

  const todoStore = useTodoStore();

  const props = defineProps({
    todo: {
      type: Object as PropType<Todo>,
      required: true
    }
  });

  const route = useRoute();

  const todo = ref(props.todo);

  watch(() => props.todo, () => {
    todo.value = props.todo;
  });

  const emit = defineEmits<{
    (event: 'open', id?: string): void
  }>();

  const isOpen = computed(() => {
    return route.query.todoId === props.todo.id;
  });

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
