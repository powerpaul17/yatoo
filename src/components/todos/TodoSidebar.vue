<template>
  <div>
    <!-- Backdrop -->
    <div
      class="fixed right-0 top-0 h-full w-full cursor-pointer bg-black/40 transition-colors duration-200 md:hidden"
      :class="{ 'pointer-events-none bg-transparent': !todoId }"
      @click="handleClose()"
    />

    <!-- Sidebar -->
    <div
      class="fixed right-0 top-0 h-full w-full bg-base-200 p-2 shadow-md transition-all duration-300 sm:w-80 md:static"
      :class="{ 'mr-[-100%] sm:-mr-80': !todoId }"
    >
      <div v-if="todo">
        <div class="flex">
          <button
            class="ds-btn ds-btn-circle ds-btn-ghost"
            @click="handleClose()"
          >
            <X />
          </button>

          <div class="grow" />

          <button
            class="ds-btn ds-btn-circle ds-btn-warning ds-btn-ghost"
            @click="handleDelete()"
          >
            <Trash />
          </button>
        </div>

        <div class="ds-form-control">
          <label class="ds-label">
            <span class="ds-label-text">{{ $t('entities.Todo.title') }}</span>
          </label>
          <input
            class="ds-input ds-input-bordered"
            v-model="todo.title"
            @change="handleTodoChanged()"
          />
        </div>

        <div class="ds-form-control">
          <label class="ds-label">
            <span class="ds-label-text">{{
              $t('entities.Todo.description')
            }}</span>
          </label>
          <textarea
            class="ds-textarea ds-textarea-bordered"
            v-model="todo.description"
            @change="handleTodoChanged()"
          />
        </div>
      </div>
    </div>
  </div>

  <DeleteDialog
    :open="deleteDialogOpen"
    :title="$t('components.Todos.TodoSidebar.deleteTodo')"
    @close="deleteDialogOpen = false"
    @delete="handleDeleteTodo()"
  />
</template>

<script setup lang="ts">
  import { onMounted, ref, watch } from 'vue';
  import { useRouter } from 'vue-router';

  import { Trash, X } from 'lucide-vue-next';

  import DeleteDialog from '../dialogs/DeleteDialog.vue';

  import { useTodoStore, type Todo } from '../../stores/todoStore';

  const todoStore = await useTodoStore();

  const props = defineProps({
    todoId: {
      type: String,
      default: null
    }
  });

  const todo = ref<Todo | null>(null);

  watch(
    () => props.todoId,
    async () => {
      await updateTodo();
    }
  );

  onMounted(async () => {
    await updateTodo();
  });

  async function updateTodo(): Promise<void> {
    if (props.todoId) {
      todo.value = await todoStore.getById(props.todoId);
    } else {
      todo.value = null;
    }
  }

  const router = useRouter();

  async function handleClose(): Promise<void> {
    await router.push({
      query: {
        todoId: undefined
      }
    });
  }

  const deleteDialogOpen = ref(false);

  function handleDelete(): void {
    deleteDialogOpen.value = true;
  }

  async function handleDeleteTodo(): Promise<void> {
    if (!todo.value) throw new Error('cannot delete todo');
    await todoStore.remove(todo.value.id);
    await handleClose();
  }

  async function handleTodoChanged(): Promise<void> {
    if (!todo.value) return;
    await todoStore.upsert(todo.value);
  }
</script>
