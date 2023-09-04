<template>
  <div
    class="
      rounded-md
      bg-neutral text-neutral-content hover:bg-neutral-focus
      focus:bg-neutral-focus
    "
    :class="
      {
        'opacity-40': todo.done
      }
    "
  >
    <div class="flex items-center p-1">
      <div>
      </div>
      <div class="flex-auto">
        {{ todo.title }}
      </div>
      <div>
        <button
          class="btn-ghost btn-square btn"
          @click="handleToggleDoneClicked()"
        >
          <Check v-if="!todo.done" />
          <Undo v-else />
        </button>
        <button
          class="btn-ghost btn-square btn"
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

  import { type PropType, computed, ref } from 'vue';
  import { useRoute } from 'vue-router';

  import { Check, PanelRightOpen, Undo, X } from 'lucide-vue-next';

  import { useTodoStore, type Todo } from '../stores/todoStore';

  const todoStore = await useTodoStore();

  const props = defineProps({
    todo: {
      type: Object as PropType<Todo>,
      required: true
    }
  });

  const route = useRoute();

  const todo = ref(props.todo);

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
