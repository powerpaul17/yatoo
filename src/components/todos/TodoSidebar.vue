<template>
  <div>
    <!-- Backdrop -->
    <div
      class="
        fixed right-0 top-0
        h-full w-full
        cursor-pointer
        bg-black/40
        transition-colors
        duration-200
        md:hidden
      "
      :class="{ 'pointer-events-none bg-transparent': !todoId }"
      @click="handleClose()"
    />

    <!-- Sidebar -->
    <div
      class="
        fixed right-0 top-0
        h-full w-full
        bg-base-200
        p-2
        shadow-md
        transition-all
        duration-300
        sm:w-80
        md:static
      "
      :class="{ 'mr-[-100%] sm:-mr-80': !todoId }"
    >
      <div class="flex">
        <button
          class="ds-btn-ghost ds-btn-circle ds-btn"
          @click="handleClose()"
        >
          <X />
        </button>

        <div class="grow" />

        <button
          class="ds-btn-ghost ds-btn-warning ds-btn-circle ds-btn"
          @click="handleDelete()"
        >
          <Trash />
        </button>
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

  import { ref, watch } from 'vue';
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

  const todo = ref<Todo|null>(null);

  watch(() => props.todoId, async () => {
    if (props.todoId) {
      todo.value =  await todoStore.getById(props.todoId);
    } else {
      todo.value = null;
    }
  });

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

</script>
