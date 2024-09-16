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
      class="fixed right-0 top-0 h-full w-full overflow-y-scroll bg-surface-300 p-2 shadow-md transition-all duration-300 dark:bg-surface-700 sm:w-80 md:static"
      :class="{ 'mr-[-100%] sm:-mr-80': !todoId }"
    >
      <div v-if="todo">
        <div class="flex">
          <IconButton @click="handleClose()">
            <template #icon>
              <X />
            </template>
          </IconButton>

          <div class="grow text-center">
            <IconButton @click="handleToggleDone()">
              <template #icon>
                <Square v-if="!todo.done" />
                <CheckSquare v-else />
              </template>
            </IconButton>
          </div>

          <IconButton
            severity="warn"
            @click="handleDelete()"
          >
            <template #icon>
              <Trash />
            </template>
          </IconButton>
        </div>

        <TodoSidebarSection :title="$t('entities.todo.title')">
          <InputText
            class="w-full"
            v-model="todo.title"
            @change="handleTodoChanged()"
          />
        </TodoSidebarSection>

        <TodoSidebarSection
          :title="$t('components.todos.TodoSidebar.labels')"
          @button-click="handleSelectLabels"
        >
          <template #buttonIcon>
            <Plus v-if="!labels.length" />
            <Pen v-else />
          </template>

          <LabelList :labels="labels" />
        </TodoSidebarSection>

        <TodoSidebarSection :title="$t('entities.todo.description')">
          <TextArea
            class="w-full"
            v-model="todo.description"
            @change="handleTodoChanged()"
          />
        </TodoSidebarSection>
      </div>
    </div>
  </div>

  <DeleteDialog
    :open="deleteDialogOpen"
    :title="$t('components.todos.TodoSidebar.deleteTodo')"
    @close="deleteDialogOpen = false"
    @delete="handleDeleteTodo()"
  />

  <LabelSelectDialog
    v-if="todo"
    :open="labelSelectDialogOpen"
    :todo-id="todo.id"
    @close="labelSelectDialogOpen = false"
  />
</template>

<script setup lang="ts">
  import { computed, onMounted, ref, watch } from 'vue';
  import { useRouter } from 'vue-router';

  import InputText from 'primevue/inputtext';
  import TextArea from 'primevue/textarea';

  import { CheckSquare, Pen, Plus, Square, Trash, X } from 'lucide-vue-next';

  import TodoSidebarSection from './TodoSidebarSection.vue';
  import DeleteDialog from '../dialogs/DeleteDialog.vue';
  import LabelSelectDialog from '../dialogs/LabelSelectDialog.vue';
  import IconButton from '../IconButton.vue';
  import LabelList from '../labels/LabelList.vue';

  import { useTodoStore, type Todo } from '../../stores/todoStore';

  import { useLabelService } from '../../services/labelService';

  const todoStore = useTodoStore();

  const labelService = useLabelService();

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

  const todoId = computed(() => props.todoId);
  const labels = labelService.getLabelRefForTodoId(todoId);

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
    await todoStore.removeById(todo.value.id);
    await handleClose();
  }

  async function handleTodoChanged(): Promise<void> {
    if (!todo.value) return;
    await todoStore.update(todo.value);
  }

  async function handleToggleDone(): Promise<void> {
    if (!todo.value) return;
    await todoStore.setDone(todo.value, !todo.value.done);
  }

  const labelSelectDialogOpen = ref(false);

  function handleSelectLabels(): void {
    labelSelectDialogOpen.value = true;
  }

</script>
